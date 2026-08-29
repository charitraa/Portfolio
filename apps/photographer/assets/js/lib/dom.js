/* Small DOM helpers. No framework, no dependencies. */

export const qs  = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Escape a string for safe interpolation into markup. */
export const esc = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Build an element from an HTML string. */
export function fromHTML(markup) {
  const tpl = document.createElement("template");
  tpl.innerHTML = markup.trim();
  return tpl.content.firstElementChild;
}

/** Delegated event binding: on(root, 'click', '.btn', handler). */
export function on(root, type, selector, handler, options) {
  root.addEventListener(type, (event) => {
    const target = event.target.closest(selector);
    if (target && root.contains(target)) handler(event, target);
  }, options);
}

/** Zero-padded frame number, e.g. 7 → "07". */
export const pad = (n, size = 2) => String(n).padStart(size, "0");

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
