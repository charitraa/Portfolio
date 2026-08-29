/* ============================================================
   BOOKING / ENQUIRY FORM
   Choosing a package anywhere on the page preselects it here.

   Submission: if `photographer.formEndpoint` is set, the form
   POSTs there as JSON. Until then it composes a prefilled email
   and hands it to the visitor to send — nothing is silently
   dropped, and no backend is pretended.
   ============================================================ */
import { photographer } from "../data/photographer.js";
import { packages } from "../data/packages.js";
import { services } from "../data/services.js";
import { qs, esc } from "../lib/dom.js";

const stripTags = (s) => s.replace(/&amp;/g, "&").replace(/<[^>]*>/g, "");

export function bookingFormHTML() {
  return `
    <form class="form" id="booking-form" novalidate>
      <div class="form__selected" id="pkg-chip" hidden>
        <span class="label">Selected package</span>
        <span class="value" data-chip-value></span>
        <button type="button" data-clear-package>Clear</button>
      </div>

      <div class="form__grid">
        <p class="field">
          <label for="f-name">Name <span class="req" aria-hidden="true">*</span></label>
          <input id="f-name" name="name" type="text" autocomplete="name" required placeholder="Your name">
        </p>
        <p class="field">
          <label for="f-email">Email <span class="req" aria-hidden="true">*</span></label>
          <input id="f-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com">
        </p>
        <p class="field">
          <label for="f-phone">Phone</label>
          <input id="f-phone" name="phone" type="tel" autocomplete="tel" placeholder="Optional">
        </p>
        <p class="field">
          <label for="f-service">Photography service</label>
          <select id="f-service" name="service">
            <option value="">Choose a service</option>
            ${services.map((s) => `<option>${esc(stripTags(s.name))}</option>`).join("")}
            <option>Something else</option>
          </select>
        </p>
        <p class="field">
          <label for="f-package">Package</label>
          <select id="f-package" name="package">
            <option value="">Not sure yet</option>
            ${packages.map((p) => `<option>${esc(p.name)}</option>`).join("")}
            <option>Custom quote</option>
          </select>
        </p>
        <p class="field">
          <label for="f-date">Preferred date</label>
          <input id="f-date" name="date" type="date">
        </p>
        <p class="field">
          <label for="f-location">Location</label>
          <input id="f-location" name="location" type="text" placeholder="City, venue or region">
        </p>
        <p class="field">
          <label for="f-budget">Budget</label>
          <input id="f-budget" name="budget" type="text" placeholder="Optional, a range is fine">
        </p>
        <p class="field field--full">
          <label for="f-message">Message <span class="req" aria-hidden="true">*</span></label>
          <textarea id="f-message" name="message" required
                    placeholder="Tell me about the day, the people and what you would like to remember."></textarea>
        </p>
      </div>

      <div class="form__foot">
        <button class="btn btn--solid" type="submit">Send enquiry</button>
        <p class="form__status" id="form-status" role="status" aria-live="polite">
          ${esc(photographer.contact.responseTime)}
        </p>
      </div>
    </form>

    <div class="form__done" id="form-done" hidden>
      <h3>Thank you — your enquiry is ready to send.</h3>
      <p class="body-dim" id="form-done-note"></p>
      <p><a class="btn btn--solid" id="form-mailto" href="#">Open in your email app</a></p>
      <p><button class="mono link-underline" type="button" data-reset>Edit the enquiry</button></p>
    </div>`;
}

export function initBookingForm(root) {
  const form = qs("#booking-form", root);
  const done = qs("#form-done", root);
  const status = qs("#form-status", root);
  const chip = qs("#pkg-chip", root);
  const chipValue = qs("[data-chip-value]", chip);
  const packageField = qs("#f-package", form);

  function selectPackage(name) {
    const match = [...packageField.options].find((o) => o.value === name || o.text === name);
    if (match) packageField.value = match.value || match.text;
    chipValue.textContent = name;
    chip.hidden = false;
    qs("#f-name", form).focus({ preventScroll: true });
  }

  document.addEventListener("package:select", (e) => selectPackage(e.detail.name));

  qs("[data-clear-package]", chip).addEventListener("click", () => {
    packageField.value = "";
    chip.hidden = true;
    packageField.focus();
  });

  packageField.addEventListener("change", () => {
    if (packageField.value) { chipValue.textContent = packageField.value; chip.hidden = false; }
    else chip.hidden = true;
  });

  qs("[data-reset]", done).addEventListener("click", () => {
    done.hidden = true;
    form.hidden = false;
    qs("#f-name", form).focus();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      status.dataset.state = "error";
      status.textContent = "Please add your name, a valid email address and a short message.";
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    status.dataset.state = "";
    status.textContent = "Sending…";

    if (photographer.formEndpoint) {
      try {
        const res = await fetch(photographer.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(res.statusText);
        form.reset();
        chip.hidden = true;
        status.dataset.state = "ok";
        status.textContent = `Enquiry sent. ${photographer.contact.responseTime}.`;
        return;
      } catch (err) {
        status.dataset.state = "error";
        status.textContent = `That did not send. Please email ${photographer.email} directly.`;
        return;
      }
    }

    // No endpoint configured: hand the visitor a prefilled email.
    const lines = [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      data.phone ? `Phone: ${data.phone}` : null,
      data.service ? `Service: ${data.service}` : null,
      data.package ? `Package: ${data.package}` : null,
      data.date ? `Preferred date: ${data.date}` : null,
      data.location ? `Location: ${data.location}` : null,
      data.budget ? `Budget: ${data.budget}` : null,
      "",
      data.message
    ].filter((l) => l !== null);

    const subject = `Photography enquiry${data.package ? ` — ${data.package}` : ""}`;
    const href = `mailto:${photographer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;

    qs("#form-mailto", done).href = href;
    qs("#form-done-note", done).textContent =
      `This site has no form backend connected yet, so the enquiry opens as an email to ${photographer.email} with your details already filled in.`;
    form.hidden = true;
    done.hidden = false;
    done.querySelector("h3").setAttribute("tabindex", "-1");
    done.querySelector("h3").focus({ preventScroll: true });
  });
}
