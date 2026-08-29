/* Packages. Choosing one carries the selection into the enquiry form. */
import { packages, packagesNote } from "../data/packages.js";
import { on } from "../lib/dom.js";
import { scrollToSection } from "../lib/scroll.js";
import { sectionHeading } from "./sectionHeading.js";
import { packageCardHTML } from "./packageCard.js";

export function mount(root) {
  root.innerHTML = `
    <div class="shell">
      ${sectionHeading({
        id: "packages-title",
        eyebrow: "Photography packages",
        title: "Choose the experience<br>that fits your story.",
        lede: "Three starting points. Prices are placeholders until real rates are set — every one of them can be adjusted around your day."
      })}

      <div class="packages">
        ${packages.map(packageCardHTML).join("")}
      </div>

      <p class="lede reveal" style="max-width:64ch; margin-top:clamp(2rem,4vw,3rem)">${packagesNote}</p>
    </div>`;

  on(root, "click", "[data-package]", (_e, btn) => {
    document.dispatchEvent(new CustomEvent("package:select", {
      detail: { name: btn.dataset.package }
    }));
    scrollToSection("#contact");
  });
}
