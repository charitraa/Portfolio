/* Final call to action, then the enquiry form. */
import { photographer } from "../data/photographer.js";
import { esc } from "../lib/dom.js";
import { bookingFormHTML, initBookingForm } from "./bookingForm.js";

export function mount(root) {
  const { contact, email, phone, location } = photographer;

  root.innerHTML = `
    <div class="shell">
      <div class="contact-lead">
        <p class="eyebrow reveal">${contact.eyebrow}</p>
        <h2 class="display contact-lead__title reveal" id="contact-title" style="--delay:60ms">
          ${contact.title.join("<br>")}
        </h2>
        <p class="lede reveal" style="--delay:140ms">${contact.lede}</p>

        <div class="contact-meta reveal" style="--delay:200ms">
          <div class="contact-meta__item">
            <span class="contact-meta__label">Email</span>
            <a class="contact-meta__value link-underline" href="mailto:${esc(email)}">${esc(email)}</a>
          </div>
          <div class="contact-meta__item">
            <span class="contact-meta__label">Phone</span>
            <a class="contact-meta__value link-underline" href="tel:${esc(phone.replace(/\s+/g, ""))}">${esc(phone)}</a>
          </div>
          <div class="contact-meta__item">
            <span class="contact-meta__label">Based in</span>
            <span class="contact-meta__value">${esc(location)}</span>
          </div>
        </div>
      </div>

      <div class="reveal" style="--delay:120ms">
        ${bookingFormHTML()}
      </div>
    </div>`;

  initBookingForm(root);
}
