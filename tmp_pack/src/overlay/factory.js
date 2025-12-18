// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export class OverlayFactory {
  constructor(classes, canvas) {
    this.classes = classes;
    this.canvas = canvas;
    const div = document.createElement("div");
    div.classList.add("mathbox-overlays");
    this.div = div;
  }

  inject() {
    // Defensive: if canvas or its parent isn't available, gracefully fall back.
    const element = this.canvas && this.canvas.parentNode;
    if (element && typeof element.insertBefore === "function") {
      return element.insertBefore(this.div, this.canvas);
    }

    // If document.body is available, append overlays there so overlay operations
    // (insertion/removal) have a reliable parentNode in headless / test envs.
    if (
      typeof document !== "undefined" &&
      document.body &&
      typeof document.body.appendChild === "function"
    ) {
      try {
        document.body.appendChild(this.div);
        return this.div;
      } catch (err) {
        // ignore append errors in constrained environments and fall through
      }
    }

    // As a last resort, create a minimal fake parentNode so subsequent unject()
    // calls don't throw (removeChild will be a no-op).
    if (!this.div.parentNode) {
      this.div.parentNode = { removeChild: () => {} };
    }
    return this.div;
  }

  unject() {
    const element = this.div && this.div.parentNode;
    if (!element) {
      // Nothing to remove; be tolerant in test/headless environments.
      return;
    }
    if (typeof element.removeChild === "function") {
      try {
        element.removeChild(this.div);
      } catch (err) {
        // Ignore removal errors in constrained environments.
      }
    }
    return;
  }

  getTypes() {
    return Object.keys(this.classes);
  }

  make(type, options) {
    return new this.classes[type](this.div, options);
  }
}
