/* Client words. Placeholder entries are flagged, never dressed up as real. */
import { testimonials } from "../data/testimonials.js";
import { esc } from "../lib/dom.js";
import { sectionHeading } from "./sectionHeading.js";

export function mount(root) {
  // Nothing to quote yet — take the section off the page entirely.
  if (!testimonials.length) { root.remove(); return; }

  const anyPlaceholder = testimonials.some((t) => t.placeholder);

  root.innerHTML = `
    <div class="shell">
      ${sectionHeading({
        id: "testimonials-title",
        eyebrow: "In their words",
        title: "What clients say<br>afterwards.",
        aside: anyPlaceholder
          ? `<p class="note">Placeholder quotes — replace them with real, permitted client words in <code>data/testimonials.js</code>.</p>`
          : ""
      })}

      <div class="quotes">
        ${testimonials.map((t, i) => `
          <figure class="quote reveal" style="--delay:${(i % 2) * 90}ms">
            <blockquote class="quote__text">${esc(t.quote)}</blockquote>
            <figcaption class="quote__by">
              <span>&mdash; ${esc(t.name)}</span>
              ${t.context ? `<span>${esc(t.context)}</span>` : ""}
            </figcaption>
          </figure>
        `).join("")}
      </div>
    </div>`;
}
