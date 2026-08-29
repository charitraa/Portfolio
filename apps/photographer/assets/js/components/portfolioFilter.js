/* Category filter — a line of type, not a control panel. */
import { categories } from "../data/portfolio.js";

export function filterHTML(active = "all", count = 0) {
  return `
    <div class="filter" role="group" aria-label="Filter the portfolio by category">
      ${categories.map((c) => `
        <button class="filter__btn" type="button"
                data-filter="${c.slug}"
                aria-pressed="${c.slug === active}">${c.label}</button>
      `).join("")}
      <span class="filter__count" role="status" aria-live="polite" data-count>${count} frames</span>
    </div>`;
}
