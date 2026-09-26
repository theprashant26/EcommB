/* ==========================================================================
   Combos (combos.html) — Update 03b.
   Every type:"combo" product in js/data/products.js, as the shared product card
   (badge "Combo · 2 pieces", the set price, the struck worth and "Save ₹…").
   ========================================================================== */

import { initHeader } from "../core/header.js";
import { initBag } from "../core/bag.js";
import { initWishlist } from "../core/wishlist.js";
import { initReveals } from "../core/reveal.js";
import { initSearch } from "../core/search.js";
import { initMotion, splitLines } from "../core/motion.js";
import { cardHTML } from "../core/cards.js";
import { COMBOS } from "../data/products.js";
import { $, $$ } from "../core/format.js";

initHeader();
initBag();
initSearch();
initWishlist();
initReveals();

const grid = $("[data-combos-grid]");
if (grid) grid.innerHTML = COMBOS.map((p) => cardHTML(p, { headingLevel: 3 })).join("");
const count = $("[data-combos-count]");
if (count) count.textContent = `${COMBOS.length} ${COMBOS.length === 1 ? "combo" : "combos"}`;

initMotion((c, ctx) => {
  if (c.reduce) return;
  $$("[data-split]").forEach((el) => splitLines(el, { ctx }));
});
