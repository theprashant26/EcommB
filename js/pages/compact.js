/* ==========================================================================
   Compact size (compact.html) — Update 03 §7.
   Every product with a compact entry in `sizes` (js/data/products.js):
   a card per compact variant ("Compact · 30 ml", the compact price, Shop Now
   to product.html?id=…&size=compact, Add to Cart adds the compact size), then
   "See the difference" with the side-by-side photographs.
   ========================================================================== */

import { initHeader } from "../core/header.js";
import { initBag } from "../core/bag.js";
import { initWishlist } from "../core/wishlist.js";
import { initReveals } from "../core/reveal.js";
import { initSearch } from "../core/search.js";
import { initMotion, splitLines } from "../core/motion.js";
import { cardHTML } from "../core/cards.js";
import { PRODUCTS, sizesOf, sizeOf, hasCompact } from "../data/products.js";
import { esc, imageSize, $, $$ } from "../core/format.js";

initHeader();
initBag();
initSearch();
initWishlist();
initReveals();

const pieces = PRODUCTS.filter((p) => hasCompact(p) && !p.comingSoon);

const grid = $("[data-compact-grid]");
if (grid) grid.innerHTML = pieces.map((p) => cardHTML(p, { headingLevel: 3, size: "compact" })).join("");
const count = $("[data-compact-count]");
if (count) count.textContent = `${pieces.length} ${pieces.length === 1 ? "piece" : "pieces"}`;

/** "100 ml and 30 ml": the full size and the compact size, measures only. */
const measure = (label = "") => label.split(" · ")[0];
const compare = $("[data-compare]");
if (compare) {
  compare.innerHTML = pieces.map((p) => {
    const c = sizeOf(p, "compact");
    const [w, h] = imageSize(c.compare);
    return `
      <figure class="compare-item" data-reveal>
        <span class="compare-stage" data-reveal-inner>
          <img src="${esc(c.compare)}" alt="${esc(p.fullName)}: the full size and the compact size side by side" width="${w}" height="${h}" loading="lazy" decoding="async">
        </span>
        <figcaption><span class="compare-name">${esc(p.name)}</span><span class="coords">${esc(measure(sizesOf(p)[0].label))} and ${esc(measure(c.label))}</span></figcaption>
      </figure>`;
  }).join("");
}

initMotion((c, ctx) => {
  if (c.reduce) return;
  $$("[data-split]").forEach((el) => splitLines(el, { ctx }));
});
