/* A strip of recent frames. When a social profile exists it becomes a
   follow strip; until then it is simply more photographs. */
import { photographer } from "../data/photographer.js";
import { frame } from "../lib/image.js";
import { esc } from "../lib/dom.js";
import { arrow } from "./sectionHeading.js";

export function mount(root) {
  const gallery = photographer.social_gallery;
  if (!gallery?.images?.length) { root.remove(); return; }

  const instagram = photographer.social.find((s) => s.label.toLowerCase() === "instagram");

  const heading = instagram
    ? `${gallery.title}
       <a class="link-underline" href="${esc(instagram.href)}" target="_blank" rel="noopener"
          style="font-style:italic">${esc(instagram.handle)}</a>`
    : gallery.title;

  root.innerHTML = `
    <div class="shell">
      <div class="s-head s-head--stack" style="margin-bottom:0">
        <div class="s-head__lead reveal">
          <p class="eyebrow">${instagram ? gallery.eyebrow : "From the archive"}</p>
          <h2 class="display" id="social-title" style="font-size:var(--t-xl)">${heading}</h2>
        </div>
      </div>

      <div class="social-strip reveal">
        ${gallery.images.map((img) => {
          const picture = frame({
            id: img.id, tone: img.tone, alt: img.alt, ratio: 1,
            sizes: "(min-width:900px) 16vw, 33vw"
          });
          return instagram
            ? `<a href="${esc(instagram.href)}" target="_blank" rel="noopener"
                  aria-label="View this photograph on Instagram">${picture}</a>`
            : `<div>${picture}</div>`;
        }).join("")}
      </div>

      ${instagram ? `
        <p class="reveal" style="margin-top:1.5rem">
          <a class="mono link-underline" href="${esc(instagram.href)}" target="_blank" rel="noopener">
            Follow on Instagram ${arrow}
          </a>
        </p>` : `
        <p class="reveal" style="margin-top:1.5rem">
          <a class="mono link-underline" href="#contact">Enquire about a session ${arrow}</a>
        </p>`}
    </div>`;
}
