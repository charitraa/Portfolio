/* Shared editorial section header: eyebrow → title → supporting line. */
export function sectionHeading({ id, eyebrow, title, lede = "", aside = "", stack = false }) {
  const hasAside = Boolean(lede || aside);
  return `
    <header class="s-head${stack ? " s-head--stack" : ""}">
      <div class="s-head__lead reveal">
        <p class="eyebrow">${eyebrow}</p>
        <h2 class="display s-head__title" id="${id}">${title}</h2>
      </div>
      ${hasAside ? `
      <div class="s-head__aside reveal" style="--delay:120ms">
        ${lede ? `<p class="lede">${lede}</p>` : ""}
        ${aside}
      </div>` : ""}
    </header>`;
}

export const arrow = `<span class="btn__arrow" aria-hidden="true">&rarr;</span>`;
