module.exports = function (config) {
  config.set({
    // Use a custom headless launcher configured to favor software GL (SwiftShader)
    // so tests that require a WebGL context have a better chance of succeeding in
    // headless CI environments. The test script already sets CHROME_BIN to Puppeteer's
    // executable; this launcher passes flags to Chrome to enable the software GL path.
    browsers: ["ChromeHeadlessCustom"],
    customLaunchers: {
      ChromeHeadlessCustom: {
        base: "ChromeHeadless",
        flags: [
          // run in headless mode
          "--headless",
          // avoid sandbox restrictions which commonly cause failures in CI
          "--no-sandbox",
          "--disable-setuid-sandbox",
          // reduce shared memory usage in CI containers
          "--disable-dev-shm-usage",
          // prefer software GL path in environments without a GPU
          "--use-gl=swiftshader",
          // disable GPU process to avoid driver issues
          "--disable-gpu",
          // run Chrome in a single process to avoid some sandbox/threading issues
          "--single-process",
          // disable extensions for a cleaner environment
          "--disable-extensions",
          // enable webgl flags explicitly
          "--enable-webgl",
          "--enable-unsafe-webgl",
          // remote debug port for diagnostics if needed
          "--remote-debugging-port=9222",
        ],
      },
    },

    files: [
      "./build_testing/spec_bundle.js",
      "node_modules/shadergraph/build/*.css",
      "./src/splash.css",
    ],
    frameworks: ["jasmine"],

    // In CI we prefer a single run and no file watching
    autoWatch: false,
    singleRun: true,
    reporters: ["progress"],
    port: 9876,
    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,
    // Increase activity timeout for slower headless environments
    browserNoActivityTimeout: 120000,
  });
};
