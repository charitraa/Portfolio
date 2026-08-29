/* ============================================================
   MAIN — mounts each section into its placeholder in index.html.
   Sections are independent modules; adding one means adding a
   <section data-component="…"> and a line in this registry.
   ============================================================ */
import { qsa, prefersReducedMotion } from "./lib/dom.js";
import { bindImageLoading } from "./lib/image.js";
import { observeReveals } from "./lib/reveal.js";

import * as navbar from "./components/navbar.js";
import * as hero from "./components/hero.js";
import * as intro from "./components/intro.js";
import * as portfolio from "./components/portfolioGallery.js";
import * as about from "./components/about.js";
import * as services from "./components/services.js";
import * as packages from "./components/packages.js";
import * as process from "./components/process.js";
import * as testimonials from "./components/testimonials.js";
import * as social from "./components/socialGallery.js";
import * as faq from "./components/faq.js";
import * as contact from "./components/contact.js";
import * as footer from "./components/footer.js";

const registry = {
  navbar, hero, intro, portfolio, about, services,
  packages, process, testimonials, social, faq, contact, footer
};

function boot() {
  qsa("[data-component]").forEach((el) => {
    const component = registry[el.dataset.component];
    if (!component?.mount) {
      console.warn(`No component registered for "${el.dataset.component}"`);
      return;
    }
    component.mount(el);
  });

  bindImageLoading(document);
  observeReveals(document);

  // Reveal anything already in view on load without waiting for a scroll.
  if (prefersReducedMotion()) {
    qsa(".reveal").forEach((el) => el.classList.add("is-in"));
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
