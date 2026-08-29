/* ============================================================
   LIGHTBOX — a native <dialog>, so Esc and the focus trap come
   from the platform. Adds arrow keys, a counter, and swipe.
   ============================================================ */
import { qs, pad } from "../lib/dom.js";
import { imageURL, imageSrcset } from "../lib/image.js";

let items = [];
let index = 0;
let dialog;
let opener = null;

function render() {
  const item = items[index];
  if (!item) return;
  const img = qs(".lightbox__img", dialog);
  const ratio = 1.5;

  img.classList.remove("is-loaded");
  img.src = imageURL(item.id, 1600, ratio);
  img.srcset = imageSrcset(item.id, ratio, [960, 1280, 1600, 2000]);
  img.sizes = "92vw";
  img.alt = item.alt;
  if (img.complete && img.naturalWidth) img.classList.add("is-loaded");

  qs(".lightbox__title", dialog).textContent = item.title;
  qs(".lightbox__data", dialog).textContent =
    [item.categoryLabel, item.meta].filter(Boolean).join("  ·  ");
  qs(".lightbox__counter", dialog).textContent =
    `${pad(index + 1)} / ${pad(items.length)}`;
}

function go(step) {
  index = (index + step + items.length) % items.length;
  render();
}

function build() {
  dialog = qs("#lightbox");
  dialog.innerHTML = `
    <div class="lightbox__bar">
      <span class="lightbox__brand">Portfolio</span>
      <button class="lightbox__close" type="button" data-close>
        Close <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div class="lightbox__stage">
      <button class="lightbox__nav lightbox__nav--prev" type="button" data-prev aria-label="Previous photograph">
        <span aria-hidden="true">&larr;</span>
      </button>
      <img class="lightbox__img" alt="" decoding="async">
      <button class="lightbox__nav lightbox__nav--next" type="button" data-next aria-label="Next photograph">
        <span aria-hidden="true">&rarr;</span>
      </button>
    </div>

    <div class="lightbox__foot">
      <div class="lightbox__caption">
        <p class="lightbox__title"></p>
        <p class="lightbox__data"></p>
      </div>
      <p class="lightbox__counter" role="status" aria-live="polite"></p>
    </div>`;

  qs(".lightbox__img", dialog).addEventListener("load", (e) => e.target.classList.add("is-loaded"));
  qs("[data-close]", dialog).addEventListener("click", () => dialog.close());
  qs("[data-prev]", dialog).addEventListener("click", () => go(-1));
  qs("[data-next]", dialog).addEventListener("click", () => go(1));

  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
  });

  // Click away from the photograph to dismiss. The <img> fills the stage
  // and letterboxes itself, so work out where the picture actually is.
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target.classList.contains("lightbox__stage")) { dialog.close(); return; }
    if (e.target.classList.contains("lightbox__img")) {
      const img = e.target;
      const box = img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      const inner = {
        w: box.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
        h: box.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      };
      const scale = Math.min(inner.w / img.naturalWidth, inner.h / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      const inside =
        Math.abs(e.clientX - (box.left + box.width / 2)) <= w / 2 &&
        Math.abs(e.clientY - (box.top + box.height / 2)) <= h / 2;
      if (!inside) dialog.close();
    }
  });

  // Swipe on touch devices.
  let startX = 0, startY = 0, tracking = false;
  const stage = qs(".lightbox__stage", dialog);
  stage.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    tracking = true; startX = e.touches[0].clientX; startY = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  }, { passive: true });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("is-locked");
    opener?.focus({ preventScroll: true });
    opener = null;
  });
}

/** Open the viewer over `list` (the currently visible frames). */
export function openLightbox(list, startIndex = 0, trigger = null) {
  if (!dialog) build();
  items = list;
  index = startIndex;
  opener = trigger;
  render();
  document.body.classList.add("is-locked");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  qs("[data-next]", dialog)?.focus({ preventScroll: true });
}
