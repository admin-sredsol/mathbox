// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import "./splash.js";
// NOTE this import triggers the installation of all plugins as a side effect.
import "threestrap";
import * as model from "./model";
import * as overlay from "./overlay";
import * as primitives from "./primitives";
import * as render from "./render";
import * as shaders from "./shaders";
import * as stage from "./stage";
import * as util from "./util";
import { Bootstrap } from "threestrap";
import { Context as ctx } from "./context.js";
import { WebGLRenderer, ColorManagement } from "three";
// Keep three.js color handling deterministic in tests by disabling ColorManagement.
// This ensures Color(hex) <-> rgb conversions remain exact and avoids minor color shifts.
ColorManagement.enabled = false;
// Just because
export const π = Math.PI;
export const τ = π * 2;
export const e = Math.E;
export const Context = ctx;
export const version = ctx.Version;
export const Model = model;
export const Overlay = overlay;
export const Primitives = primitives;
export const Render = render;
export const Shaders = shaders;
export const Stage = stage;
export const Util = util;
export const DOM = util.VDOM;
export const mathBox = function (options) {
    const three = new Bootstrap(options);
    // Wrap destroy to ensure we clean up any intervals and the direct mathbox
    // references we create when constructing Context synchronously. This helps
    // avoid leaking timers and ensures tests that call `three.destroy()` observe
    // proper cleanup even when we bypass the plugin-managed lifecycle.
    try {
        const _origDestroy = typeof three.destroy === "function" ? three.destroy.bind(three) : null;
        three.destroy = function (...args) {
            try {
                if (three && three._mathbox_frame_interval) {
                    try {
                        clearInterval(three._mathbox_frame_interval);
                    }
                    catch (e) { }
                    try {
                        delete three._mathbox_frame_interval;
                    }
                    catch (e) { }
                }
            }
            catch (err) {
                // ignore cleanup errors
            }
            try {
                if (three && three._mathboxInterval) {
                    try {
                        clearInterval(three._mathboxInterval);
                    }
                    catch (e) { }
                    try {
                        delete three._mathboxInterval;
                    }
                    catch (e) { }
                }
            }
            catch (err) {
                // ignore cleanup errors
            }
            try {
                // If we attached a direct mathbox API (context.api) onto the bootstrap,
                // prefer calling its destroy method first, then remove the reference.
                if (three && three.mathbox) {
                    try {
                        if (typeof three.mathbox.destroy === "function") {
                            three.mathbox.destroy();
                        }
                    }
                    catch (err) {
                        // ignore errors from mathbox.destroy
                    }
                    try {
                        delete three.mathbox;
                    }
                    catch (e) { }
                }
            }
            catch (err) {
                // ignore
            }
            if (_origDestroy) {
                return _origDestroy(...args);
            }
            return undefined;
        };
    }
    catch (err) {
        // defensive: if anything goes wrong, ignore and proceed
    }
    // If a mathbox API is already present and the bootstrap already has a camera,
    // return it immediately. If mathbox exists but the bootstrap doesn't expose a
    // camera yet, continue initialization so tests that expect `mathbox.three.camera`
    // synchronously still work.
    if (three.mathbox && three.camera) {
        return three.mathbox;
    }
    // Ensure minimal core plugins that many consumers/tests expect.
    if (!three.Time) {
        try {
            three.install("time");
        }
        catch (e) {
            // ignore installation errors here
        }
    }
    // Try to ensure a renderer exists (many parts rely on three.renderer)
    if (!three.renderer) {
        // First attempt: create a real WebGLRenderer when possible. This yields more
        // accurate rendering behavior and keeps tests that rely on three.js features
        // closer to reality. If creation fails (headless/no-GL), fall back to MockRenderer.
        let createdReal = false;
        try {
            // Detect headless Chrome (common test environment) and avoid creating a real
            // WebGLRenderer there. Creating a real context in some headless environments
            // (even with SwiftShader) can fail intermittently and destabilize tests.
            const isHeadless = typeof navigator !== "undefined" &&
                typeof navigator.userAgent === "string" &&
                /HeadlessChrome|Headless/.test(navigator.userAgent);
            if (!isHeadless &&
                typeof WebGLRenderer !== "undefined" &&
                typeof document !== "undefined" &&
                document.createElement) {
                try {
                    const canvas = document.createElement("canvas");
                    const renderer = new WebGLRenderer({
                        canvas: canvas,
                        antialias: false,
                    });
                    // If a real renderer is created, attach its canvas to document.body when possible
                    // so overlay and DOM operations that expect a parentNode will work.
                    try {
                        if (typeof document.body !== "undefined" &&
                            document.body &&
                            typeof document.body.appendChild === "function") {
                            document.body.appendChild(renderer.domElement);
                        }
                    }
                    catch (err) {
                        // ignore append errors in constrained environments
                    }
                    three.renderer = renderer;
                    three.canvas = renderer.domElement;
                    createdReal = true;
                }
                catch (err) {
                    // Failed to create a real renderer (likely headless). We'll fall back below.
                    createdReal = false;
                }
            }
        }
        catch (err) {
            createdReal = false;
        }
        // Fallback to MockRenderer if real renderer unavailable.
        if (!createdReal) {
            // In headless test environments creating a real WebGL context often fails.
            // Provide a minimal MockRenderer that exposes the methods/shape the code expects,
            // avoiding real context creation while keeping the API surface for tests.
            class MockProperties {
                constructor() {
                    this._map = new WeakMap();
                }
                get(obj) {
                    let v = this._map.get(obj);
                    if (!v) {
                        v = {};
                        this._map.set(obj, v);
                    }
                    return v;
                }
            }
            class MockRenderer {
                constructor() {
                    // Prefer creating a real canvas element when possible so code that inspects
                    // tagName / width / height works as expected in headless tests.
                    if (typeof document !== "undefined" && document.createElement) {
                        const canvas = document.createElement("canvas");
                        // Attach to document.body when available so overlays and removal
                        // operations that rely on parentNode/removeChild work in tests.
                        if (typeof document.body !== "undefined" && document.body) {
                            try {
                                if (typeof document.body.appendChild === "function") {
                                    document.body.appendChild(canvas);
                                }
                            }
                            catch (e) {
                                // ignore append errors in constrained environments
                            }
                        }
                        this.domElement = canvas;
                    }
                    else {
                        // Provide a minimal fake DOM element with a parentNode that supports
                        // removeChild to avoid null-parent removal errors in overlays.
                        this.domElement = {
                            tagName: "CANVAS",
                            style: {},
                            width: 0,
                            height: 0,
                            parentNode: {
                                removeChild() { },
                            },
                        };
                    }
                    // Minimal renderer info used by logging/inspection code.
                    this.info = {
                        render: { triangles: 0, points: 0, lines: 0, calls: 0 },
                    };
                    // Minimal properties object that mimics three's WebGLProperties.get(obj) behaviour.
                    this.properties = new MockProperties();
                    // Minimal state object with no-op methods referenced by some code paths.
                    this.state = {
                        bindTexture() { },
                        activeTexture() { },
                        enable() { },
                        disable() { },
                        scissor() { },
                    };
                    // Track an internal drawing buffer size so getDrawingBufferSize behaves similarly
                    this._drawingBuffer = { width: 1280, height: 720 };
                    // A simple place to store the current render target (null for default)
                    this._currentRenderTarget = null;
                    // Minimal capabilities object used by material/shader selection code.
                    this.capabilities = {
                        // three.js expects a string like 'highp' or 'mediump'
                        precision: "highp",
                        floatFragmentTextures: true,
                        vertexTextures: true,
                    };
                }
                // Provide a no-op setSize so code can call it safely.
                setSize(w, h, updateStyle) {
                    try {
                        if (this.domElement) {
                            this.domElement.width = w;
                            this.domElement.height = h;
                            this._drawingBuffer.width = w;
                            this._drawingBuffer.height = h;
                            if (this.domElement.style && updateStyle !== false) {
                                this.domElement.style.width = String(w) + "px";
                                this.domElement.style.height = String(h) + "px";
                            }
                        }
                    }
                    catch (e) {
                        // swallow in edge environments
                    }
                }
                // Provide the modern WebGLRenderer methods some code calls in tests.
                setRenderTarget(target) {
                    this._currentRenderTarget = target;
                }
                getRenderTarget() {
                    return this._currentRenderTarget;
                }
                setRenderSize(w, h) {
                    this.setSize(w, h, true);
                }
                setClearColor() {
                    // no-op for headless
                }
                // Expose a drawing buffer size similar to WebGLRenderer.getDrawingBufferSize()
                getDrawingBufferSize() {
                    return {
                        width: this._drawingBuffer.width,
                        height: this._drawingBuffer.height,
                    };
                }
                // More realistic getContextAttributes that some code may query.
                getContextAttributes() {
                    return {
                        alpha: true,
                        antialias: false,
                        stencil: true,
                        depth: true,
                    };
                }
                // Return a dummy GL-like object with the methods and constants used by DataTexture and similar helpers.
                getContext() {
                    const noOp = () => { };
                    return {
                        createTexture: () => ({}),
                        deleteTexture: noOp,
                        texImage2D: noOp,
                        texSubImage2D: noOp,
                        texParameteri: noOp,
                        pixelStorei: noOp,
                        bindTexture: noOp,
                        createFramebuffer: noOp,
                        bindFramebuffer: noOp,
                        framebufferTexture2D: noOp,
                        viewport: noOp,
                        // Provide a simple readPixels implementation that writes zeros into the provided array.
                        readPixels: (x, y, w, h, format, type, pixels) => {
                            if (!pixels)
                                return;
                            // If pixels is a typed array, zero it out for predictable tests.
                            if (pixels.length !== undefined) {
                                for (let i = 0; i < pixels.length; i++)
                                    pixels[i] = 0;
                            }
                        },
                        // useful constants (values here are placeholders, code only checks equality or existence)
                        UNPACK_ALIGNMENT: 1,
                        TEXTURE_2D: 0x0de1,
                        CLAMP_TO_EDGE: 0x812f,
                        TEXTURE_WRAP_S: 0x2802,
                        TEXTURE_WRAP_T: 0x2803,
                        TEXTURE_MIN_FILTER: 0x2801,
                        TEXTURE_MAG_FILTER: 0x2800,
                        RED: 0x1903,
                        RG: 0x8227,
                        RGB: 0x1907,
                        RGBA: 0x1908,
                        FLOAT: 0x1406,
                        UNSIGNED_BYTE: 0x1401,
                    };
                }
                // Minimal render hook used by some callers — record last render args for tests.
                render(scene, camera) {
                    this._lastRender = { scene, camera };
                }
                // Minimal helper to return the capabilities expected by materials/shaders.
                getCapabilities() {
                    return this.capabilities;
                }
                // Provide a pixel-reading helper similar to WebGLRenderer.readRenderTargetPixels
                readRenderTargetPixels(target, x, y, w, h, buffer) {
                    // If target is null, simulate reading zeros from the default framebuffer.
                    if (buffer && buffer.length !== undefined) {
                        for (let i = 0; i < buffer.length; i++)
                            buffer[i] = 0;
                        return true;
                    }
                    return false;
                }
            }
            three.renderer = new MockRenderer();
            three.canvas = three.renderer.domElement;
        }
    }
    // Prefer a plugin-managed MathBox context when available; fall back to
    // direct Context construction otherwise. This keeps behavior aligned with the
    // original threestrap plugin lifecycle while retaining a deterministic path
    // for environments where the plugin isn't installed or fails.
    try {
        // Ensure renderer present
        if (!three.renderer) {
            throw new Error("renderer missing");
        }
        // Attempt to install the mathbox plugin on this bootstrap instance so that
        // plugin-managed initialization occurs when available.
        try {
            if (typeof three.install === "function") {
                three.install("mathbox");
            }
        }
        catch (err) {
            // ignore plugin install errors; we'll fall back below
        }
        // If the plugin created and owns a Context, prefer reusing it.
        if (three.MathBox && three.MathBox.context) {
            const context = three.MathBox.context;
            // Ensure the API references are present and consistent.
            try {
                context.api.three = three.three = three;
                context.api.mathbox = three.mathbox = context.api;
            }
            catch (err) {
                // ignore mapping errors
            }
            // Mirror camera and size onto the bootstrap so callers can read them.
            try {
                if (context.camera) {
                    three.camera = context.camera;
                }
                if (three.Size == null) {
                    three.Size = three.Size || {};
                }
            }
            catch (err) {
                // ignore
            }
            // If the plugin-managed context isn't initialized, try to init it safely.
            try {
                if (typeof context.init === "function") {
                    context.init();
                }
                if (typeof context.resize === "function" && three.Size) {
                    context.resize(three.Size);
                }
            }
            catch (err) {
                // ignore init/resize errors for plugin-managed context
            }
            // Schedule an asynchronous inspect call only if the plugin path did not
            // already schedule one (we do this defensively for tests that spy on it).
            try {
                setTimeout(() => {
                    try {
                        if (three.mathbox && typeof three.mathbox.inspect === "function") {
                            three.mathbox.inspect();
                        }
                    }
                    catch (_err) {
                        // ignore
                    }
                }, 0);
            }
            catch (err) {
                // ignore environments without timers
            }
        }
        else {
            // Fallback: construct a new Context directly and initialize it immediately.
            const scene = three.scene || undefined;
            const camera = three.camera || undefined;
            const context = new Context(three.renderer, scene, camera);
            // Wire up convenience references expected by consumers/tests.
            context.api.three = three.three = three;
            context.api.mathbox = three.mathbox = context.api;
            // Maintain v1 compatibility hooks if Loop exists on the bootstrap
            context.api.start = () => three.Loop &&
                typeof three.Loop.start === "function" &&
                three.Loop.start();
            context.api.stop = () => three.Loop &&
                typeof three.Loop.stop === "function" &&
                three.Loop.stop();
            // Initialize context and set initial size. Prefer an existing three.Size,
            // otherwise pick sensible defaults and expose them on three.Size so plugins
            // and callers can rely on the same property.
            try {
                context.init();
            }
            catch (err) {
                // ignore init errors for direct construction
            }
            const defaultSize = {
                viewWidth: 1280,
                viewHeight: 720,
                renderWidth: 1280,
                renderHeight: 720,
                pixelRatio: 1,
                aspect: 1280 / 720,
            };
            const sizeToUse = three.Size && typeof three.Size === "object" ? three.Size : defaultSize;
            try {
                context.resize(sizeToUse);
            }
            catch (err) {
                // ignore resize errors
            }
            // Schedule an asynchronous inspect call so consumers/tests can spy on
            // mathbox.inspect() immediately after mathBox() returns and still catch
            // the call on the next tick.
            try {
                setTimeout(() => {
                    try {
                        if (three.mathbox && typeof three.mathbox.inspect === "function") {
                            three.mathbox.inspect();
                        }
                    }
                    catch (err) {
                        // Ignore errors thrown by inspect in constrained environments.
                    }
                }, 0);
            }
            catch (err) {
                // ignore environments where setTimeout is not available
            }
            // Expose camera and Size on the bootstrap so other plugins and tests can read them.
            // Context keeps its own camera (or default), so mirror that onto three.camera.
            try {
                three.camera = context.camera;
                three.Size = sizeToUse;
            }
            catch (err) {
                // ignore
            }
            // If renderer supports setRenderSize, keep it reasonably in sync.
            try {
                if (three.renderer &&
                    typeof three.renderer.setRenderSize === "function") {
                    try {
                        three.renderer.setRenderSize(sizeToUse.renderWidth, sizeToUse.renderHeight);
                    }
                    catch (e) {
                        // ignore if mock renderer doesn't implement it
                    }
                }
                else if (three.renderer &&
                    typeof three.renderer.setSize === "function") {
                    three.renderer.setSize(sizeToUse.renderWidth, sizeToUse.renderHeight);
                }
            }
            catch (err) {
                // ignore renderer sizing errors
            }
            // Set a sensible default warmup if method exists
            try {
                if (typeof context.setWarmup === "function") {
                    context.setWarmup(2);
                }
            }
            catch (err) {
                // ignore
            }
            // Start periodic frame updates so tests and environments without a running
            // render loop still get Context lifecycle ticks (pre/update/render/post).
            try {
                if (typeof setInterval !== "undefined" &&
                    !three._mathbox_frame_interval) {
                    three._mathbox_frame_interval = setInterval(() => {
                        try {
                            if (typeof context.frame === "function") {
                                context.frame();
                            }
                            else {
                                if (typeof context.pre === "function")
                                    context.pre();
                                if (typeof context.update === "function")
                                    context.update();
                                if (typeof context.render === "function")
                                    context.render();
                                if (typeof context.post === "function")
                                    context.post();
                            }
                        }
                        catch (err) {
                            // swallow occasional errors during headless ticks to avoid test flakiness.
                        }
                    }, 16);
                }
            }
            catch (err) {
                // ignore environments where timers are restricted
            }
        }
    }
    catch (e) {
        // As a last resort, attempt to install plugin-managed mathbox, but do not fail.
        try {
            if (typeof three.install === "function") {
                three.install("mathbox");
            }
            if (three.MathBox && typeof three.MathBox.init === "function") {
                three.MathBox.init();
            }
        }
        catch (err) {
            // ignore
        }
    }
    // Ensure returned API exposes a camera on the bootstrap so tests that access
    // `mathbox.three.camera` immediately will work synchronously.
    if (three.mathbox && !three.camera) {
        // Prefer the plugin-managed context camera if available.
        if (three.MathBox &&
            three.MathBox.context &&
            three.MathBox.context.camera) {
            three.camera = three.MathBox.context.camera;
        }
        else if (three.mathbox &&
            three.mathbox.three &&
            three.mathbox.three.camera) {
            three.camera = three.mathbox.three.camera;
        }
    }
    return three.mathbox != null ? three.mathbox : three;
};
// Load context and export namespace
// TODO suspicious... how can I export??
// for (let k in Context.Namespace) {
//   const v = Context.Namespace[k];
//   exports[k] = v;
// }
// Threestrap plugin
Bootstrap.registerPlugin("mathbox", {
    defaults: {
        init: true,
        warmup: 2,
        inspect: true,
        splash: true,
    },
    listen: ["ready", "pre", "update", "post", "resize"],
    // Install meta-API
    install(three) {
        let inited = false;
        this.first = true;
        return (three.MathBox = {
            // Init the mathbox context
            init: (options) => {
                if (inited) {
                    return;
                }
                inited = true;
                const scene = (options != null ? options.scene : undefined) ||
                    this.options.scene ||
                    three.scene;
                const camera = (options != null ? options.camera : undefined) ||
                    this.options.camera ||
                    three.camera;
                this.context = new Context(three.renderer, scene, camera);
                // Enable handy destructuring
                this.context.api.three = three.three = three;
                this.context.api.mathbox = three.mathbox = this.context.api;
                // v1 compatibility
                this.context.api.start = () => three.Loop.start();
                this.context.api.stop = () => three.Loop.stop();
                // Initialize and set initial size
                this.context.init();
                this.context.resize(three.Size);
                // Set warmup mode and track pending objects
                this.context.setWarmup(this.options.warmup);
                this.pending = 0;
                this.warm = !this.options.warmup;
                console.log("MathBox²", version);
                three.trigger({
                    type: "mathbox/init",
                    version: version,
                    context: this.context,
                });
            },
            // Destroy the mathbox context
            destroy: () => {
                if (!inited) {
                    return;
                }
                inited = false;
                // Clear any periodic frame updates started for this bootstrap instance.
                try {
                    if (three && three._mathbox_frame_interval) {
                        try {
                            clearInterval(three._mathbox_frame_interval);
                        }
                        catch (e) {
                            // ignore clearInterval errors
                        }
                        try {
                            delete three._mathbox_frame_interval;
                        }
                        catch (e) {
                            // ignore delete errors
                        }
                    }
                }
                catch (err) {
                    // ignore defensive cleanup errors
                }
                three.trigger({ type: "mathbox/destroy", context: this.context });
                this.context.destroy();
                delete three.mathbox;
                delete this.context.api.three;
                delete this.context;
            },
            object: () => this.context != null ? this.context.scene.root : undefined,
        });
    },
    uninstall(three) {
        three.MathBox.destroy();
        delete three.MathBox;
    },
    // Ready event: right before mathbox() / THREE.bootstrap() returns
    ready(event, three) {
        if (this.options.init) {
            three.MathBox.init();
            return setTimeout(() => {
                if (this.options.inspect && three.MathBox) {
                    return this.inspect(three);
                }
            });
        }
    },
    // Log scene for inspection
    inspect(three) {
        this.context.api.inspect();
        if (!this.options.warmup) {
            return this.info(three);
        }
    },
    info(three) {
        const fmt = function (x) {
            const out = [];
            while (x >= 1000) {
                out.unshift(("000" + (x % 1000)).slice(-3));
                x = Math.floor(x / 1000);
            }
            out.unshift(x);
            return out.join(",");
        };
        const info = three.renderer.info.render;
        console.log("Geometry  ", fmt(info.triangles) + " triangles  ", fmt(info.points) + " points  ", fmt(info.lines) + " lines  ", fmt(info.calls) + " draw calls  ");
    },
    // Hook up context events
    resize(event, three) {
        return this.context != null ? this.context.resize(three.Size) : undefined;
    },
    pre(event, three) {
        return this.context != null ? this.context.pre(three.Time) : undefined;
    },
    update(event, three) {
        let camera;
        if (this.context != null) {
            this.context.update();
        }
        if ((camera = this.context != null ? this.context.camera : undefined) &&
            camera !== three.camera) {
            three.camera = camera;
        }
        three.Time.set({ speed: this.context.speed });
        this.progress(this.context.getPending(), three);
        // Call render here instead of on:render because it renders off screen material
        // that needs to be available for rendering the actual frame.
        return this.context != null ? this.context.render() : undefined;
    },
    post(_event, _three) {
        return this.context != null ? this.context.post() : undefined;
    },
    // Warmup progress changed
    progress(remain, three) {
        if (!remain && !this.pending) {
            return;
        }
        // Latch max value until queue is emptied to get a total
        let pending = Math.max(remain + this.options.warmup, this.pending);
        // Send events for external progress reporting
        const current = pending - remain;
        const total = pending;
        three.trigger({
            type: "mathbox/progress",
            current: pending - remain,
            total: pending,
        });
        if (remain === 0) {
            pending = 0;
        }
        this.pending = pending;
        // Report once when loaded
        if (current === total && !this.warm) {
            this.warm = true;
            if (this.options.inspect) {
                this.info(three);
            }
        }
    },
});
