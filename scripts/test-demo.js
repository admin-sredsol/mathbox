#!/usr/bin/env node
/**
 * test-demo.js
 *
 * Simple Node script to:
 *  - Serve the repository root as a static HTTP server
 *  - Launch a headless browser to open the demo page
 *  - Wait for MathBox to initialize, capture console/errors, take a screenshot
 *  - Exit with zero on success, non-zero on failure
 *
 * Usage:
 *   node scripts/test-demo.js
 *
 * Environment:
 *   PORT (optional)    - port for HTTP server (default: 0 = random available)
 *   DEMO_PATH (opt)    - path to demo page relative to server root (default: /examples/demo/shapes.html)
 *   TIMEOUT_MS (opt)   - max wait for demo init in ms (default: 20000)
 *
 * Note: This script depends on `puppeteer` being installed in the environment.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

const DEFAULT_TIMEOUT = Number(process.env.TIMEOUT_MS || 20000);
const DEMO_PATH = process.env.DEMO_PATH || "/examples/demo/shapes.html";
const ROOT = path.resolve(__dirname, ".."); // repo root
const PORT = Number(process.env.PORT || 0);

function mimeTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
    case ".htm":
      return "text/html; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".mjs":
      return "application/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".map":
      return "application/json; charset=utf-8";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    case ".wasm":
      return "application/wasm";
    default:
      return "application/octet-stream";
  }
}

/**
 * Minimal static file server that serves files from ROOT.
 */
function createStaticServer(root) {
  return http.createServer(async (req, res) => {
    try {
      const parsed = url.parse(req.url);
      let pathname = decodeURIComponent(parsed.pathname);

      // Prevent path traversal
      pathname = pathname.replace(/\.\.(\/|\\)/g, "");

      // If request is to '/', serve index.html if exists, otherwise 404
      if (pathname === "/") pathname = "/index.html";

      const target = path.join(root, pathname);

      // If the target is a directory, try to serve index.html inside it
      let stats;
      try {
        stats = await stat(target);
      } catch (err) {
        // file does not exist
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end("404 Not Found");
        return;
      }

      let fileToServe = target;
      if (stats.isDirectory()) {
        const indexHtml = path.join(target, "index.html");
        try {
          await stat(indexHtml);
          fileToServe = indexHtml;
        } catch (err) {
          res.statusCode = 403;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end("403 Forbidden");
          return;
        }
      }

      const content = await readFile(fileToServe);
      res.statusCode = 200;
      res.setHeader("Content-Type", mimeTypeFor(fileToServe));

      // For JS modules served from local build, ensure correct CORS/Security headers aren't required.
      res.end(content);
    } catch (err) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("500 Internal Server Error\n" + String(err && err.stack ? err.stack : err));
    }
  });
}

/**
 * Run the test:
 *  - Start static server
 *  - Launch puppeteer and navigate to DEMO_PATH
 *  - Wait for window.mathbox (and mathbox.three) to be available
 *  - Collect console messages and errors, take screenshot
 */
async function runTest() {
  const server = createStaticServer(ROOT);

  // Start listening
  await new Promise((resolve, reject) => {
    server.listen(PORT, "127.0.0.1", () => resolve());
    server.on("error", (err) => reject(err));
  });

  const address = server.address();
  const port = address.port;
  const origin = `http://127.0.0.1:${port}`;
  const demoUrl = new URL(DEMO_PATH, origin).toString();

  console.log("Serving", ROOT);
  console.log("Demo URL:", demoUrl);
  console.log("Timeout:", DEFAULT_TIMEOUT, "ms");

  // Launch Puppeteer
  let browser;
  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch (err) {
    console.error("This script requires puppeteer to be installed.");
    console.error("Install with: pnpm add -D puppeteer  (or npm/yarn equivalent)");
    server.close();
    process.exit(2);
    return;
  }

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } catch (err) {
    console.error("Failed to launch headless browser:", err);
    server.close();
    process.exit(3);
    return;
  }

  const page = await browser.newPage();

  const consoleMessages = [];
  const pageErrors = [];
  const networkFailures = [];

  page.on("console", (msg) => {
    // Capture console messages from the page
    const text = `[console:${msg.type()}] ${msg.text()}`;
    consoleMessages.push(text);
    console.log(text);
  });

  page.on("pageerror", (err) => {
    const text = `[pageerror] ${err && err.message ? err.message : String(err)}`;
    pageErrors.push(text);
    console.error(text);
  });

  page.on("requestfailed", (req) => {
    const text = `[requestfailed] ${req.url()} (${req.failure().errorText})`;
    networkFailures.push(text);
    console.error(text);
  });

  let success = false;
  const screenshotPath = path.join(ROOT, "build", "demo-test-screenshot.png");

  try {
    // Set a generous viewport
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate and wait until network is idle (no more than 2 connections for at least 500ms)
    await page.goto(demoUrl, { waitUntil: "networkidle2", timeout: DEFAULT_TIMEOUT });

    // Wait for a global mathbox object and that it has a three property
    const start = Date.now();
    await page.waitForFunction(
      () => {
        // eslint-disable-next-line no-undef
        return typeof window.mathbox !== "undefined" && !!(window.mathbox && window.mathbox.three);
      },
      { timeout: DEFAULT_TIMEOUT }
    );

    // Additional short wait so that demo settles
    await page.waitForTimeout(500);

    // Take screenshot
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Check for console or page errors (gathered above)
    if (pageErrors.length === 0 && networkFailures.length === 0) {
      console.log("Demo appears to have initialized without page errors.");
      success = true;
    } else {
      console.error("Demo had errors. pageErrors:", pageErrors.length, "networkFailures:", networkFailures.length);
      success = false;
    }
  } catch (err) {
    console.error("Demo test failed:", err && err.stack ? err.stack : err);
    success = false;
  } finally {
    // Cleanup
    try {
      await page.close();
    } catch (_) {}
    try {
      await browser.close();
    } catch (_) {}
    server.close();
  }

  if (success) {
    console.log("Demo test succeeded. Screenshot saved to:", screenshotPath);
    process.exit(0);
  } else {
    console.error("Demo test failed. See console output above for details.");
    if (fs.existsSync(screenshotPath)) {
      console.error("Screenshot (partial) saved to:", screenshotPath);
    }
    process.exit(4);
  }
}

// Run
runTest().catch((err) => {
  console.error("Unexpected error running demo test:", err && err.stack ? err.stack : err);
  process.exit(10);
});
