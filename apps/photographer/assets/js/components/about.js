/* The photographer, in their own words. */
import { photographer } from "../data/photographer.js";
import { frame } from "../lib/image.js";
import { arrow } from "./sectionHeading.js";

export function mount(root) {
  const { about, location } = photographer;
  const hasStats = Array.isArray(about.stats) && about.stats.length > 0;

  root.innerHTML = `
    <div class="shell">
      <div class="split split--wide-right">
        <figure class="split__media reveal">
          ${frame({
            id: about.image.id,
            tone: about.image.tone,
            alt: about.image.alt,
            ratio: 0.82,
            sizes: "(min-width: 900px) 40vw, 92vw"
          })}
          <figcaption class="figure-cap">
            <span>${about.image.caption}</span>
            <span>${location}</span>
          </figcaption>
        </figure>

        <div class="split__body">
          <p class="eyebrow reveal">${about.eyebrow}</p>
          <h2 class="display reveal" id="about-title" style="font-size:var(--t-xl); --delay:60ms">
            ${about.greeting}
          </h2>
          ${about.body.map((p, i) => `
            <p class="body-dim reveal" style="--delay:${120 + i * 60}ms; max-width:52ch">${p}</p>
          `).join("")}
          <p class="signature reveal" style="--delay:240ms">${about.signature}</p>

          ${hasStats ? `
            <div class="stats reveal" style="--delay:300ms">
              ${about.stats.map((s) => `
                <div class="stat">
                  <p class="stat__value">${s.value}</p>
                  <p class="stat__label">${s.label}</p>
                </div>`).join("")}
            </div>
          ` : ""}

          <p class="reveal" style="--delay:340ms">
            <a class="btn btn--ghost" href="#contact">Work with me ${arrow}</a>
          </p>
        </div>
      </div>
    </div>`;
}
