/* ==========================================================================
   Cross-document view transitions (Update 02 §13) — progressive enhancement.
   CSS turns them on (@view-transition, a 0.35s fade; off with reduced
   motion). Here: the product image glides from the card to the product page.
   A view-transition-name must be unique on a page, so it is given only at
   the moment of the click (to the clicked card's image) and, on the product
   page, to the main image.
   ========================================================================== */

import { reducedMotion, $$ } from "./format.js";

const NAME = "pimg";
const clear = () => $$("[data-vt]").forEach((el) => { el.style.viewTransitionName = ""; el.removeAttribute("data-vt"); });
export function nameForTransition(el) {
  if (!el || reducedMotion()) return;
  clear();
  el.style.viewTransitionName = NAME;
  el.setAttribute("data-vt", "");
}

export function initViewTransitions() {
  if (!CSS.supports?.("view-transition-name", "none")) return;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href*='product.html']");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const img = a.closest("[data-product-card]")?.querySelector(".cp-img:not(.cp-img--alt)");
    if (img) nameForTransition(img); else clear();
  }, true);
  // Back from the bfcache: the old name must not linger on this page.
  addEventListener("pageshow", (e) => { if (e.persisted) clear(); });
}
