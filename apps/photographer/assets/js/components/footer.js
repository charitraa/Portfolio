/* Minimal footer: who, where to go, where else to find the work. */
import { photographer } from "../data/photographer.js";
import { esc } from "../lib/dom.js";

export function mount(root) {
  const year = new Date().getFullYear();

  root.innerHTML = `
    <div class="footer__grid">
      <div>
        <p class="footer__mark">${photographer.name}</p>
        <p class="footer__blurb">${photographer.footer.blurb}</p>
      </div>

      <nav class="footer__col" aria-label="Footer">
        <h3>Explore</h3>
        <ul>
          ${photographer.nav.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join("")}
        </ul>
      </nav>

      <div class="footer__col">
        <h3>Elsewhere</h3>
        <ul>
          ${photographer.social.map((s) => `
            <li><a href="${esc(s.href)}" target="_blank" rel="noopener">${s.label}</a></li>
          `).join("")}
          <li><a href="mailto:${esc(photographer.email)}">Email</a></li>
          <li><a href="tel:${esc(photographer.phone.replace(/\s+/g, ""))}">Phone</a></li>
        </ul>
      </div>
    </div>

    <div class="footer__bar">
      <span>&copy; ${year} ${photographer.name}. All rights reserved.</span>
      ${photographer.footer.credit ? `<span>${esc(photographer.footer.credit)}</span>` : ""}
      <a class="footer__top" href="#hero">Back to top <span aria-hidden="true">&uarr;</span></a>
    </div>`;
}
