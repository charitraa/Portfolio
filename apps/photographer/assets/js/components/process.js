/* How a session runs, in the order it happens. */
import { process } from "../data/process.js";
import { pad } from "../lib/dom.js";
import { sectionHeading } from "./sectionHeading.js";

export function mount(root) {
  root.innerHTML = `
    <div class="shell">
      ${sectionHeading({
        id: "process-title",
        eyebrow: "The experience",
        title: "From first message<br>to final gallery.",
        stack: true
      })}

      <ol class="process">
        ${process.map((step, i) => `
          <li class="step reveal" style="--delay:${i * 90}ms">
            <p class="step__num">${pad(i + 1)}</p>
            <h3 class="step__name">${step.name}</h3>
            <p class="step__desc">${step.description}</p>
          </li>
        `).join("")}
      </ol>
    </div>`;
}
