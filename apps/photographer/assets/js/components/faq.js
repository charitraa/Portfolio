/* Accordion. One question open at a time, keyboard-operable by default. */
import { faq } from "../data/faq.js";
import { esc, on, qsa } from "../lib/dom.js";
import { sectionHeading } from "./sectionHeading.js";

export function mount(root) {
  root.innerHTML = `
    <div class="shell">
      ${sectionHeading({
        id: "faq-title",
        eyebrow: "Good to know",
        title: "Questions asked<br>before booking.",
        lede: "If your question is not here, ask it in the enquiry form below — it will end up on this list."
      })}

      <div class="faq">
        ${faq.map((item, i) => `
          <div class="faq__item">
            <h3>
              <button class="faq__q" type="button"
                      id="faq-q-${i}" aria-expanded="false" aria-controls="faq-a-${i}">
                ${esc(item.q)}
                <span class="faq__sign" aria-hidden="true"></span>
              </button>
            </h3>
            <div class="faq__a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}">
              <div><p>${esc(item.a)}</p></div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>`;

  on(root, "click", ".faq__q", (_e, btn) => {
    const item = btn.closest(".faq__item");
    const isOpen = btn.getAttribute("aria-expanded") === "true";

    qsa(".faq__item", root).forEach((el) => {
      el.classList.remove("is-open");
      el.querySelector(".faq__q").setAttribute("aria-expanded", "false");
    });

    if (!isOpen) {
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    }
  });
}
