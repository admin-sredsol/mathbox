/**
 * Rollup configuration to produce a single-file ESM bundle for MathBox.
 *
 * Goals:
 * - Produce a single ESM bundle (tree-shaken) suitable for direct browser import.
 * - Externalize 'three' so consumers provide their own three.js (keeps bundle small
 *   and avoids three version conflicts).
 * - Preserve source maps for debugging.
 *
 * Usage (example npm script):
 *   "build:rollup": "rollup -c rollup.config.js"
 *
 * Notes:
 * - This config expects the ESM entry to be available at `build/esm/index.js`.
 * *   Run the TypeScript/emit step (existing `npm run build:module`) before using rollup.
 * - The config resolves node_modules, converts CommonJS where necessary and minifies
 *   the final ESM bundle with terser.
 * - If you prefer not to minify for faster dev builds, remove the terser plugin from
 *   the `plugins` array.
 */

const path = require("path");

// Safely require plugins (support variations in plugin exports)
function requirePlugin(name) {
  const pkg = require(name);
  return pkg.nodeResolve || pkg.default || pkg;
}

const nodeResolve = requirePlugin("@rollup/plugin-node-resolve");
const commonjs = requirePlugin("@rollup/plugin-commonjs");
const json = requirePlugin("@rollup/plugin-json");
const replace = requirePlugin("@rollup/plugin-replace");
const { terser } = require("rollup-plugin-terser");

// Alias plugin to map 'threestrap' to its built ESM bundle so the resolver does not
// attempt to read the package.json "exports" keys (which can be incompatible with some resolvers).
/* Custom alias plugin no longer required via package import here.
   A custom resolveId plugin is created inline in the plugins array to map
   'threestrap' to its built ESM file (threestrapEsm). */

const inputFile = path.resolve(__dirname, "build/esm/index.js");
const outputFile = path.resolve(__dirname, "build/esm/mathbox.bundle.js");

// Path to threestrap's built ESM bundle inside node_modules. This keeps rollup from
// reading the package.json "exports" and ensures the resolver picks up the actual file.
const threestrapEsm = path.resolve(
  __dirname,
  "node_modules",
  "threestrap",
  "build",
  "threestrap.module.js"
);

module.exports = {
  input: inputFile,
  // Externalize three so consumers must provide it (peer dependency)
  external: (id) => {
    // treat top-level 'three' import as external; also externalize bare "three/*" imports
    if (id === "three" || id.startsWith("three/")) return true;
    return false;
  },
  plugins: [
    // Custom resolver plugin for 'threestrap':
    // Map bare imports of 'threestrap' (and subpaths) to the built ESM bundle path
    // we have in the repository. This avoids Rollup reading the package.json
    // "exports" field and makes resolution deterministic.
    {
      name: "threestrap-resolve",
      resolveId(source) {
        if (source === "threestrap" || source.startsWith("threestrap/")) {
          return threestrapEsm;
        }
        return null;
      },
    },

    // Resolve third-party modules from node_modules
    nodeResolve({
      browser: true,
      extensions: [".js", ".ts", ".json"],
      preferBuiltins: false,
      dedupe: ["three"],
    }),

    // Convert CommonJS modules to ES modules where necessary
    commonjs({
      include: /node_modules/,
      transformMixedEsModules: true,
    }),

    // Allow importing JSON files
    json(),

    // Replace process.env.NODE_ENV for better tree-shaking
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "production"
      ),
    }),

    // Minify final bundle for production
    terser({
      module: true,
      format: {
        comments: false,
      },
    }),
  ],

  output: {
    file: outputFile,
    format: "es",
    sourcemap: true,
    // Named exports preserved; consumers will import the exported symbols from the ESM bundle.
  },

  // Optional: silent on warnings for circulars coming from generated code, but log others.
  onwarn(warning, warn) {
    // Ignore some known non-actionable warnings, but surface others.
    if (warning.code === "CIRCULAR_DEPENDENCY") {
      // Some internal circular deps may exist in the legacy source; ignore to reduce noise.
      return;
    }
    warn(warning);
  },
};
