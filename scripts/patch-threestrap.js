#!/usr/bin/env node

/**
 * Robust postinstall patch script for threestrap renderer compatibility.
 *
 * Goals:
 * - Locate the installed `threestrap` package robustly (works with nested
 *   node_modules, pnpm flat/nested stores, and typical npm/yarn installs).
 * - Patch `src/core/renderer.js` to avoid importing `WebGL1Renderer` which
 *   may not be a named export in some `three` builds.
 * - Be idempotent and safe: create a backup once, do not clobber existing files,
 *   and exit gracefully if nothing to do.
 *
 * Strategy for locating `threestrap`:
 * 1. Try Node's resolution (`require.resolve('threestrap/package.json')`) to let
 *    Node find the package as it sees it in the current environment.
 * 2. Try a few likely candidate locations by walking upward from the script
 *    directory and from the current working directory, checking for
 *    `<dir>/node_modules/threestrap/src/core/renderer.js`.
 * 3. If none found, attempt to scan parent directories for `node_modules` and
 *    nested `node_modules/.pnpm` layouts (best-effort; will avoid scanning entire FS).
 *
 * The script intentionally never throws for a missing target; it prints an
 * informative message and returns so installs that do not include `threestrap`
 * are unaffected.
 */

const fs = require("fs");
const path = require("path");

function tryRequireResolve(pkgPath) {
  try {
    return require.resolve(pkgPath);
  } catch (err) {
    return null;
  }
}

/**
 * Walk upward from startDir (inclusive) to the filesystem root and at each
 * level check for node_modules/threestrap/src/core/renderer.js.
 */
function findByWalking(startDir) {
  let cur = path.resolve(startDir);
  const root = path.parse(cur).root;
  while (true) {
    const candidate = path.join(
      cur,
      "node_modules",
      "threestrap",
      "src",
      "core",
      "renderer.js"
    );
    if (fs.existsSync(candidate)) return candidate;
    if (cur === root) break;
    cur = path.dirname(cur);
  }
  return null;
}

/**
 * Try to find threestrap package.json via require.resolve with additional
 * lookup paths. If found, return the renderer.js path under that package.
 */
function findByRequireResolveVariants() {
  // 1) Default require.resolve for package.json
  const pkgResolved = tryRequireResolve("threestrap/package.json");
  if (pkgResolved) {
    const pkgDir = path.dirname(pkgResolved);
    const candidate = path.join(pkgDir, "src", "core", "renderer.js");
    if (fs.existsSync(candidate)) return candidate;
  }

  // 2) Try resolving the package entry (main/module) and derive path
  const entryResolved = tryRequireResolve("threestrap");
  if (entryResolved) {
    // entryResolved might be something like .../node_modules/threestrap/build/...
    const pkgDir = (function findPkgDir(start) {
      let cur = path.resolve(start);
      const root = path.parse(cur).root;
      while (true) {
        const p = path.join(cur, "package.json");
        if (fs.existsSync(p)) return cur;
        if (cur === root) break;
        cur = path.dirname(cur);
      }
      return null;
    })(entryResolved);
    if (pkgDir) {
      const candidate = path.join(pkgDir, "src", "core", "renderer.js");
      if (fs.existsSync(candidate)) return candidate;
    }
  }

  return null;
}

/**
 * Attempt to discover `threestrap` by checking a set of likely base directories.
 */
function discoverThreestrapRenderer() {
  // 1) Try Node resolution heuristics
  const byResolve = findByRequireResolveVariants();
  if (byResolve) return byResolve;

  // 2) Walk upward from this script's directory (this package's folder)
  const fromScript = findByWalking(__dirname);
  if (fromScript) return fromScript;

  // 3) Walk upward from current working directory (consumer project)
  const fromCwd = findByWalking(process.cwd());
  if (fromCwd) return fromCwd;

  // 4) Walk upward from parent of cwd (cover some monorepo layouts)
  const cwdParent = path.dirname(process.cwd());
  if (cwdParent && cwdParent !== process.cwd()) {
    const fromCwdParent = findByWalking(cwdParent);
    if (fromCwdParent) return fromCwdParent;
  }

  // 5) Attempt to find in sibling node_modules of parents up to a reasonable depth.
  //    This is a conservative scan that avoids scanning too many directories.
  const MAX_LEVELS = 6;
  let scanDir = process.cwd();
  for (let i = 0; i < MAX_LEVELS; i++) {
    const candidate = path.join(
      scanDir,
      "node_modules",
      "threestrap",
      "src",
      "core",
      "renderer.js"
    );
    if (fs.existsSync(candidate)) return candidate;
    // pnpm's store-like install can place the package in nested locations, try checking
    // for node_modules/.pnpm then stepping into the nested node_modules inside it.
    const pnpmDir = path.join(scanDir, "node_modules", ".pnpm");
    if (fs.existsSync(pnpmDir) && fs.lstatSync(pnpmDir).isDirectory()) {
      try {
        const entries = fs.readdirSync(pnpmDir);
        for (const e of entries) {
          const nested = path.join(
            pnpmDir,
            e,
            "node_modules",
            "threestrap",
            "src",
            "core",
            "renderer.js"
          );
          if (fs.existsSync(nested)) return nested;
        }
      } catch (err) {
        // ignore and continue
      }
    }
    const parent = path.dirname(scanDir);
    if (!parent || parent === scanDir) break;
    scanDir = parent;
  }

  return null;
}

/**
 * Apply the minimal patch to the threestrap renderer source. This keeps patches
 * simple and conservative: only removes named WebGL1Renderer imports and
 * replaces references to WebGL1Renderer with WebGLRenderer identifier.
 */
function patchRendererFile(target) {
  try {
    let content = fs.readFileSync(target, "utf8");
    let patched = content;

    // Normalize the import: remove any `WebGL1Renderer` named import if present.
    // Accept either ordering in the import list.
    patched = patched.replace(
      /import\s*\{\s*WebGLRenderer\s*(?:,\s*WebGL1Renderer\s*|)\s*\}\s*from\s*['"]three['"];?/g,
      'import { WebGLRenderer } from "three";'
    );

    patched = patched.replace(
      /import\s*\{\s*WebGL1Renderer\s*,\s*WebGLRenderer\s*\}\s*from\s*['"]three['"];?/g,
      'import { WebGLRenderer } from "three";'
    );

    // Replace any remaining identifier references (not string literals) to WebGL1Renderer
    // with WebGLRenderer to avoid reference errors.
    patched = patched.replace(/\bWebGL1Renderer\b/g, "WebGLRenderer");

    if (patched === content) {
      console.log(
        "[patch-threestrap] No changes necessary; file already patched."
      );
      return;
    }

    // Backup original (create once)
    try {
      const backupPath = target + ".bak";
      if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, content, "utf8");
        console.log(`[patch-threestrap] Created backup at ${backupPath}`);
      } else {
        console.log(
          `[patch-threestrap] Backup already exists at ${backupPath}`
        );
      }
    } catch (err) {
      console.warn(
        "[patch-threestrap] Warning: could not write backup:",
        err && err.message ? err.message : err
      );
    }

    // Write patched file atomically if possible
    try {
      const tmpPath = target + ".tmp";
      fs.writeFileSync(tmpPath, patched, "utf8");
      fs.renameSync(tmpPath, target);
      console.log(`[patch-threestrap] Patched ${target} successfully.`);
    } catch (err) {
      console.error(
        "[patch-threestrap] Failed to write patched file:",
        err && err.message ? err.message : err
      );
      process.exitCode = 2;
    }
  } catch (err) {
    console.error(
      "[patch-threestrap] Error patching file:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  }
}

if (require.main === module) {
  try {
    const found = discoverThreestrapRenderer();
    if (!found) {
      console.log(
        "[patch-threestrap] target file not found: could not locate 'threestrap/src/core/renderer.js' in nearby node_modules. No-op."
      );
      // Not fatal: many installs won't include threestrap (peer dep) at this stage.
      process.exitCode = 0;
    } else {
      patchRendererFile(found);
    }
  } catch (err) {
    console.error(
      "[patch-threestrap] Unexpected error:",
      err && err.stack ? err.stack : err
    );
    process.exitCode = 1;
  }
}
