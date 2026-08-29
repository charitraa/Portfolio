/* Cinematic full-screen opening frame. */
import { photographer } from "../data/photographer.js";
import { imageURL, imageSrcset } from "../lib/image.js";
import { esc } from "../lib/dom.js";

export function mount(root) {
  const { hero, name, tagline, disciplines, location } = photographer;
  const lines = hero.title?.length ? hero.title : [name];
  const img = hero.image;

  root.innerHTML = `
    <div class="hero__media">
      <img src="${esc(imageURL(img.id, 1600, 1.6))}"
           srcset="${esc(imageSrcset(img.id, 1.6))}"
           sizes="100vw"
           alt="${esc(img.alt)}"
           width="1600" height="1000"
           fetchpriority="high" decoding="sync">
    </div>

    <div class="hero__inner">
      <p class="eyebrow hero__eyebrow" style="--delay:700ms">
        ${disciplines.join(" &middot; ")} &mdash; ${location}
      </p>

      <h1 class="display hero__title">
        ${lines.map((line, i) => `
          <span class="line"><span style="--i:${i}">${esc(line)}</span></span>
        `).join("")}
      </h1>

      <p class="hero__sub" style="--delay:900ms">${tagline}</p>

      <div class="hero__actions" style="--delay:1050ms">
        <a class="btn btn--solid" href="#portfolio">View portfolio</a>
        <a class="btn btn--ghost" href="#contact">Book a session</a>
      </div>
    </div>

    <p class="hero__rebate" aria-hidden="true">
      <span>${esc(hero.rebate)}</span><span class="tick"></span><span>${esc(name)}</span>
    </p>

    <p class="hero__scroll" aria-hidden="true">Scroll<span class="scroll-line"></span></p>`;

  // Kick the entrance sequence on the next frame so transitions apply.
  requestAnimationFrame(() => document.body.classList.add("is-ready"));
}
