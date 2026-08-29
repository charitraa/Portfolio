/* ============================================================
   SERVICES — an editorial index, not a row of cards. On a
   pointer device the row's photograph follows the cursor;
   on touch and small screens it sits inline under the text.
   ============================================================ */
import { services } from "../data/services.js";
import { frame, bindImageLoading } from "../lib/image.js";
import { pad, qsa, prefersReducedMotion } from "../lib/dom.js";
import { sectionHeading, arrow } from "./sectionHeading.js";

export function mount(root) {
  root.innerHTML = `
    <div class="shell">
      ${sectionHeading({
        id: "services-title",
        eyebrow: "Services",
        title: "What I photograph.",
        lede: "Four ways of working. Every one of them starts with a conversation about the people in front of the camera."
      })}

      <div class="services">
        ${services.map((s, i) => `
          <article class="service reveal" data-service="${i}">
            <p class="service__index">${pad(i + 1)}</p>
            <h3 class="service__name">${s.name}</h3>
            <p class="service__desc">${s.description}</p>
            <a class="service__more link-underline" href="${s.link}">${s.linkLabel} ${arrow}</a>
            <div class="service__media">
              ${frame({ id: s.image.id, tone: s.image.tone, alt: s.image.alt, ratio: 1.6, sizes: "92vw" })}
            </div>
          </article>
        `).join("")}
      </div>
    </div>`;

  if (prefersReducedMotion()) return;
  if (!window.matchMedia("(min-width: 900px) and (hover: hover)").matches) return;

  // One shared preview element, moved with a rAF-throttled listener.
  const peek = document.createElement("div");
  peek.className = "service__peek";
  peek.setAttribute("aria-hidden", "true");
  peek.innerHTML = frame({
    id: services[0].image.id, tone: services[0].image.tone,
    alt: "", ratio: 0.8, sizes: "320px"
  });
  document.body.append(peek);

  let x = 0, y = 0, queued = false, shown = -1;

  const place = () => {
    peek.style.left = `${x}px`;
    peek.style.top = `${y}px`;
    queued = false;
  };

  qsa(".service", root).forEach((row, i) => {
    row.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      if (shown !== i) {
        const s = services[i];
        peek.innerHTML = frame({ id: s.image.id, tone: s.image.tone, alt: "", ratio: 0.8, sizes: "320px" });
        bindImageLoading(peek);
        shown = i;
      }
      peek.classList.add("is-visible");
    });
    row.addEventListener("pointerleave", () => peek.classList.remove("is-visible"));
    row.addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(place); }
    });
  });
}
