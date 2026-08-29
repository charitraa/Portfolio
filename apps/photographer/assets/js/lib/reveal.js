/* Scroll-triggered reveal. One shared observer, elements unobserved
   once shown, and a no-op when reduced motion is requested. */
import { prefersReducedMotion } from "./dom.js";

let observer;

function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });
  return observer;
}

/** Observe every .reveal inside root, staggering siblings slightly. */
export function observeReveals(root = document) {
  const items = root.querySelectorAll(".reveal:not([data-revealed])");
  if (prefersReducedMotion()) {
    items.forEach((el) => { el.dataset.revealed = "true"; el.classList.add("is-in"); });
    return;
  }
  items.forEach((el, i) => {
    el.dataset.revealed = "true";
    if (!el.style.getPropertyValue("--delay")) {
      el.style.setProperty("--delay", `${Math.min(i, 4) * 70}ms`);
    }
    getObserver().observe(el);
  });
}
