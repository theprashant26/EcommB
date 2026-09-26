/* ==========================================================================
   The plinth stage (Update 02 §6.1, §7) — one component for the home rooms,
   the brand hero and the shop's brand tiles: a soft CSS plinth (sand to
   #F9F6F2, 6px top radius, gentle shadow) with the brand's cutouts standing
   on it, each with a contact shadow. Sizes live in CSS (.room-products --ph).
   ========================================================================== */

import { esc, imageSize, srcsetAttr, SIZES } from "./format.js";

/** Markup for the set (products + plinth). opts.eager for a first-screen stage (the page's LCP). */
export function plinthSetHTML(products, { eager = false, fallback = "" } = {}) {
  const prods = products.map((p) => {
    const src = p.images.cutout || p.images.hero;
    const [w, h] = imageSize(src);
    return `<span class="room-prod" style="--k:${p.cardScale || 1}"><img src="${esc(src)}"${srcsetAttr(src, SIZES.plinth)} alt="${esc(p.fullName)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"><span class="room-shadow" aria-hidden="true"></span></span>`;
  }).join("");
  return `
    <div class="room-set">
      <div class="room-products" data-room-products>${prods || (fallback ? `<p class="room-outline" aria-hidden="true">${esc(fallback)}</p>` : "")}</div>
      <div class="room-plinth" aria-hidden="true"><span class="room-plinth-shadow" data-plinth-shadow></span></div>
    </div>`;
}
