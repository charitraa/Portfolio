/* ============================================================
   PORTFOLIO GALLERY
   A repeating five-frame composition — wide, tall, tall, wide,
   cinema — rather than an equal grid. Filtering re-flows the
   same composition, so the layout never collapses into rows of
   identical boxes.
   ============================================================ */
import { portfolio, categories } from "../data/portfolio.js";
import { frame, bindImageLoading } from "../lib/image.js";
import { pad, esc, qs, qsa, on, prefersReducedMotion } from "../lib/dom.js";
import { observeReveals } from "../lib/reveal.js";
import { openLightbox } from "./lightbox.js";
import { sectionHeading } from "./sectionHeading.js";
import { filterHTML } from "./portfolioFilter.js";

const PATTERN = [
  { cls: "g-a", ratio: 1.5,  sizes: "(min-width:1100px) 62vw, 92vw" },
  { cls: "g-b", ratio: 0.75, sizes: "(min-width:1100px) 24vw, (min-width:681px) 46vw, 80vw" },
  { cls: "g-c", ratio: 0.75, sizes: "(min-width:1100px) 32vw, (min-width:681px) 46vw, 80vw" },
  { cls: "g-d", ratio: 1.5,  sizes: "(min-width:1100px) 55vw, 92vw" },
  { cls: "g-e", ratio: 1.78, sizes: "(min-width:1100px) 62vw, 92vw" }
];

const labelFor = (slug) => categories.find((c) => c.slug === slug)?.label ?? slug;

// Frame numbers stay tied to the full roll, so an image keeps its
// number whichever category is showing.
const roll = portfolio.map((item, i) => ({
  ...item,
  n: pad(i + 1),
  categoryLabel: labelFor(item.category)
}));

let visible = roll;

function tileHTML(item, i) {
  const p = PATTERN[i % PATTERN.length];
  return `
    <figure class="tile ${p.cls} reveal" style="--delay:${(i % 3) * 90}ms">
      <button class="tile__btn" type="button" data-open="${i}"
              aria-label="Open ${esc(item.title)} — ${esc(item.categoryLabel)} — in the image viewer">
        <span class="tile__frame">
          ${frame({ id: item.id, tone: item.tone, alt: item.alt, ratio: p.ratio, sizes: p.sizes })}
          <span class="tile__view">View</span>
        </span>
      </button>
      <figcaption class="tile__cap">
        <span class="tile__num">${item.n}</span>
        <span class="tile__title">${esc(item.title)}</span>
        ${item.meta ? `<span class="tile__meta">${esc(item.meta)}</span>` : ""}
      </figcaption>
    </figure>`;
}

function galleryHTML(list) {
  if (!list.length) {
    return `<p class="gallery__empty">No frames in this category yet.</p>`;
  }
  return list.map(tileHTML).join("");
}

export function mount(root) {
  root.innerHTML = `
    <div class="shell">
      ${sectionHeading({
        id: "portfolio-title",
        eyebrow: "Selected work",
        title: "A contact sheet<br>of recent frames.",
        lede: "Weddings, portraits, editorial and brand work. Choose a category to narrow the roll, or open any frame to see it full size."
      })}
      ${filterHTML("all", roll.length)}
      <div class="gallery" id="gallery">${galleryHTML(roll)}</div>
    </div>`;

  const gallery = qs("#gallery", root);
  const count = qs("[data-count]", root);

  function apply(slug) {
    visible = slug === "all" ? roll : roll.filter((item) => item.category === slug);
    qsa(".filter__btn", root).forEach((btn) =>
      btn.setAttribute("aria-pressed", String(btn.dataset.filter === slug)));
    count.textContent = `${visible.length} ${visible.length === 1 ? "frame" : "frames"}`;

    const swap = () => {
      gallery.innerHTML = galleryHTML(visible);
      bindImageLoading(gallery);
      observeReveals(gallery);
      gallery.classList.remove("is-swapping");
    };

    if (prefersReducedMotion()) { swap(); return; }
    gallery.classList.add("is-swapping");
    setTimeout(swap, 320);
  }

  on(root, "click", ".filter__btn", (_e, btn) => {
    if (btn.getAttribute("aria-pressed") === "true") return;
    apply(btn.dataset.filter);
  });

  on(gallery, "click", "[data-open]", (_e, btn) => {
    openLightbox(visible, Number(btn.dataset.open), btn);
  });
}
