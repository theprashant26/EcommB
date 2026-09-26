/* ==========================================================================
   Wishlist (wishlist.html) — Update 02 §10.
   The saved pieces as product cards, each with "Add to Cart" and "Remove",
   plus "Move all to cart". Empty: "Your wishlist is empty."
   ========================================================================== */

import { initHeader } from "../core/header.js";
import { initBag, addToBag } from "../core/bag.js";
import { initWishlist, wishlistIds, setWished } from "../core/wishlist.js";
import { initReveals } from "../core/reveal.js";
import { initSearch } from "../core/search.js";
import { initMotion } from "../core/motion.js";
import { cardHTML } from "../core/cards.js";
import { getProduct } from "../data/products.js";
import { $ } from "../core/format.js";
import { toast } from "../core/toast.js";

initHeader();
initBag();
initSearch();
initWishlist();
initReveals();

const grid = $("[data-wl-grid]");
const empty = $("[data-wl-empty]");
const tools = $("[data-wl-tools]");
const count = $("[data-wl-count]");

function render() {
  const items = wishlistIds().map(getProduct).filter(Boolean);
  grid.innerHTML = items.map((p) => cardHTML(p, { headingLevel: 2, remove: true })).join("");
  grid.hidden = !items.length;
  empty.hidden = !!items.length;
  tools.hidden = !items.length;
  count.textContent = `${items.length} ${items.length === 1 ? "piece" : "pieces"}`;
  const buyable = items.filter((p) => !p.comingSoon);
  $("[data-wl-all]").disabled = !buyable.length;
}

grid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-wish-remove]");
  if (!btn) return;
  const card = btn.closest("[data-product-card]");
  const next = card?.nextElementSibling || card?.previousElementSibling;
  setWished(btn.dataset.wishRemove, false);
  toast("Removed");
  // Keep keyboard focus in the grid (or on the way back to the shop when it empties).
  const target = next && $(`[data-product-card][data-id="${CSS.escape(next.dataset.id)}"] .cp-name a`, grid);
  (target || $("a", empty))?.focus();
});

$("[data-wl-all]").addEventListener("click", () => {
  const items = wishlistIds().map(getProduct).filter((p) => p && !p.comingSoon);
  items.forEach((p, i) => addToBag(p.id, 1, { feedback: i === items.length - 1 ? undefined : "none" }));
  if (items.length) toast(`${items.length} ${items.length === 1 ? "piece" : "pieces"} moved to your cart`);
  items.forEach((p) => setWished(p.id, false));
});

document.addEventListener("wishlist:change", render);
render();
initMotion(() => {});
