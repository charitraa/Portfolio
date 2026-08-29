/* Brand statement — the first thing said after the hero. */
import { photographer } from "../data/photographer.js";
import { frame } from "../lib/image.js";
import { arrow } from "./sectionHeading.js";

export function mount(root) {
  const { intro } = photographer;

  root.innerHTML = `
    <div class="shell">
      <div class="split split--wide-left">
        <div class="split__body">
          <p class="eyebrow reveal">${intro.eyebrow}</p>
          <h2 class="display" style="font-size:var(--t-xxl)">
            <span class="reveal" style="--delay:60ms">${intro.title[0]}</span><br>
            <span class="reveal" style="--delay:140ms"><em>${intro.title[1]}</em></span>
          </h2>
          <p class="lede reveal" style="--delay:200ms">${intro.emphasis}</p>
          ${intro.body.map((p, i) => `
            <p class="body-dim reveal" style="--delay:${240 + i * 60}ms; max-width:52ch">${p}</p>
          `).join("")}
          <p class="reveal" style="--delay:380ms">
            <a class="btn btn--ghost" href="#about">Read more about me ${arrow}</a>
          </p>
        </div>

        <figure class="split__media split__media--offset reveal" style="--delay:160ms">
          ${frame({
            id: intro.image.id,
            tone: intro.image.tone,
            alt: intro.image.alt,
            ratio: 0.78,
            sizes: "(min-width: 900px) 42vw, 92vw"
          })}
          <figcaption class="figure-cap">
            <span>${intro.image.caption}</span>
          </figcaption>
        </figure>
      </div>
    </div>`;
}
