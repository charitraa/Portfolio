/* Header state and section highlighting. */
import { qs, qsa, prefersReducedMotion } from "./dom.js";

/** Solidify the header once the hero starts leaving. */
export function initHeaderState() {
  const header = qs("#site-header");
  const hero = qs("#hero");
  if (!header || !hero) return;

  const io = new IntersectionObserver(
    ([entry]) => header.classList.toggle("is-stuck", !entry.isIntersecting),
    { rootMargin: "-72px 0px 0px 0px", threshold: 0 }
  );
  io.observe(hero);
}

/** Mark the nav link for whichever section is currently in view. */
export function initScrollSpy() {
  const links = qsa(".nav__link[data-section]");
  if (!links.length) return;
  const byId = new Map(links.map((a) => [a.dataset.section, a]));
  const sections = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.removeAttribute("aria-current"));
      byId.get(entry.target.id)?.setAttribute("aria-current", "true");
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

  sections.forEach((section) => io.observe(section));
}

/** Scroll to a section, allowing for the fixed header. */
export function scrollToSection(hash) {
  const target = document.querySelector(hash);
  if (!target) return;
  target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", hash);
}
