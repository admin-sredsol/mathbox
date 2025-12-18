#!/usr/bin/env node

/**
 * Patch script to make threestrap renderer import compatible with newer three.js.
 *
 * This script updates:
 *   node_modules/threestrap/src/core/renderer.js
 *
 * - Removes the named import of `WebGL1Renderer` (not exported in some three versions)
 * - Ensures any references to `WebGL1Renderer` fall back to `WebGLRenderer`
 *
 * It is idempotent and safe to run multiple times. Intended to be used as a
 * `postinstall` step so that `npm install` / `npm ci` on CI/dev machines reapplies
 * the patch after dependency installs.
 */

const fs = require("fs");
const path = require("path");

function patchRendererFile() {
  const target = path.resolve(
    __dirname,
    "..",
    "node_modules",
    "threestrap",
    "src",
    "core",
    "renderer.js"
  );

  if (!fs.existsSync(target)) {
    console.log(
      `[patch-threestrap] target file not found: ${target}\n` +
        "If threestrap is not installed, this patch is a no-op."
    );
    return;
  }

  let content = fs.readFileSync(target, "utf8");
  let patched = content;

  // 1) Normalize the import: remove any `WebGL1Renderer` named import if present.
  // Matches things like:
  //   import { WebGLRenderer, WebGL1Renderer } from "three";
  // or
  //   import { WebGL1Renderer, WebGLRenderer } from "three";
  patched = patched.replace(
    /import\s*\{\s*WebGLRenderer\s*(?:,\s*WebGL1Renderer\s*|)\s*\}\s*from\s*['"]three['"];?/,
    'import { WebGLRenderer } from "three";'
  );

  // Also handle the reverse ordering just in case
  patched = patched.replace(
    /import\s*\{\s*WebGL1Renderer\s*,\s*WebGLRenderer\s*\}\s*from\s*['"]three['"];?/,
    'import { WebGLRenderer } from "three";'
  );

  // 2) Replace any remaining references to WebGL1Renderer with WebGLRenderer.
  // This ensures string-to-class mapping and other checks continue to work.
  patched = patched.replace(/\bWebGL1Renderer\b/g, "WebGLRenderer");

  // 3) Small safety: if the file contains an explicit mapping block like
  //    if (RendererClass === "WebGL1Renderer") ...
  // we've already replaced the identifier; leave the string checks as-is so
  // they will map to the available class (WebGLRenderer).
  // If desired, additional string replacements could be applied, but keep them minimal.

  if (patched === content) {
    console.log("[patch-threestrap] No changes necessary; file already patched.");
    return;
  }

  // Write a backup copy (safe-guard)
  try {
    const backupPath = target + ".bak";
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, content, "utf8");
      console.log(`[patch-threestrap] Created backup at ${backupPath}`);
    } else {
      console.log(`[patch-threestrap] Backup already exists at ${backupPath}`);
    }
  } catch (err) {
    console.warn("[patch-threestrap] Warning: could not write backup:", err);
  }

  // Write patched file
  try {
    fs.writeFileSync(target, patched, "utf8");
    console.log(`[patch-threestrap] Patched ${target} successfully.`);
  } catch (err) {
    console.error("[patch-threestrap] Failed to write patched file:", err);
    process.exitCode = 2;
  }
}

if (require.main === module) {
  try {
    patchRendererFile();
  } catch (err) {
    console.error("[patch-threestrap] Unexpected error:", err);
    process.exitCode = 1;
  }
}
