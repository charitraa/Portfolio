/* One package. Everything on it comes from data/packages.js. */
import { esc } from "../lib/dom.js";

export function packageCardHTML(pkg, i) {
  return `
    <article class="pkg ${pkg.featured ? "pkg--featured" : ""} reveal" style="--delay:${i * 90}ms">
      ${pkg.featured ? `<p class="pkg__flag">Most requested</p>` : `<p class="pkg__flag">&nbsp;</p>`}

      <div class="pkg__head">
        <h3 class="pkg__name">${esc(pkg.name)}</h3>
        <p class="pkg__for">${esc(pkg.for)}</p>
      </div>

      <p class="pkg__price"><small>${esc(pkg.priceLabel ?? "Investment")}</small>${esc(pkg.price)}</p>

      <ul class="pkg__list">
        ${pkg.features.map((f) => `<li><span>${esc(f)}</span></li>`).join("")}
      </ul>

      <div class="pkg__foot">
        <button class="btn ${pkg.featured ? "btn--solid" : "btn--ghost"}" type="button"
                data-package="${esc(pkg.name)}">${esc(pkg.cta)}</button>
        ${pkg.note ? `<p class="pkg__note">${esc(pkg.note)}</p>` : ""}
      </div>
    </article>`;
}
