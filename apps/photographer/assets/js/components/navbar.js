/* Sticky minimal navigation + full-screen mobile menu. */
import { photographer } from "../data/photographer.js";
import { qs, qsa, on, pad } from "../lib/dom.js";
import { initHeaderState, initScrollSpy } from "../lib/scroll.js";

export function mount(root) {
  const links = photographer.nav;

  root.innerHTML = `
    <nav class="nav" aria-label="Primary">
      <a class="brand" href="#hero">
        <span class="brand__name">${photographer.name}</span>
        <span class="brand__tag">${photographer.studio}</span>
      </a>

      <ul class="nav__list">
        ${links.map((l) => `
          <li><a class="nav__link" href="${l.href}" data-section="${l.href.slice(1)}">${l.label}</a></li>
        `).join("")}
      </ul>

      <a class="btn btn--solid nav__cta" href="#contact">Book a session</a>

      <button class="nav__toggle" type="button"
              aria-expanded="false" aria-controls="mobile-menu"
              aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
    </nav>`;

  const menu = document.createElement("div");
  menu.className = "menu";
  menu.id = "mobile-menu";
  menu.hidden = true;
  menu.innerHTML = `
    <ul class="menu__list">
      ${links.map((l, i) => `
        <li><a class="menu__link" href="${l.href}" style="--i:${i}">
          <span>${pad(i + 1)}</span>${l.label}
        </a></li>`).join("")}
    </ul>
    <div class="menu__foot">
      <a class="btn btn--solid" href="#contact">Book a session</a>
      <ul class="menu__social">
        ${photographer.social.length
          ? photographer.social.map((s) => `
              <li><a class="mono link-underline" href="${s.href}" target="_blank" rel="noopener">${s.label}</a></li>
            `).join("")
          : `<li><a class="mono link-underline" href="mailto:${photographer.email}">Email</a></li>
             <li><a class="mono link-underline" href="tel:${photographer.phone.replace(/\s+/g, "")}">Call</a></li>`}
      </ul>
    </div>`;
  document.body.append(menu);

  const toggle = qs(".nav__toggle", root);
  let open = false;

  function setMenu(next) {
    open = next;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("is-locked", open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add("is-open"));
      qs(".menu__link", menu)?.focus({ preventScroll: true });
    } else {
      menu.classList.remove("is-open");
      setTimeout(() => { if (!open) menu.hidden = true; }, 450);
    }
  }

  toggle.addEventListener("click", () => setMenu(!open));
  on(menu, "click", "a", () => setMenu(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 1000px)").addEventListener("change", (e) => {
    if (e.matches && open) setMenu(false);
  });

  // Keep the menu's tab order out of reach while it is closed.
  const io = new MutationObserver(() => {
    qsa("a", menu).forEach((a) => { a.tabIndex = open ? 0 : -1; });
  });
  io.observe(menu, { attributes: true, attributeFilter: ["class", "hidden"] });
  qsa("a", menu).forEach((a) => { a.tabIndex = -1; });

  initHeaderState();
  initScrollSpy();
}
