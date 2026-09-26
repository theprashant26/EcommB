/* ==========================================================================
   Wishlist (Update 02 §10) — localStorage "jiai-wishlist-v1" = [product ids].
   Any [data-wish="<id>"] button toggles that product (cards, product page).
   The header link carries the count; wishlist.html lists the saved pieces.
   ========================================================================== */

import { CONFIG } from "../data/config.js";
import { getProduct } from "../data/products.js";
import { esc, $$ } from "./format.js";
import { toast } from "./toast.js";

const KEY = CONFIG.wishlistKey;

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? [...new Set(raw.filter((id) => getProduct(id)))] : [];
  } catch { return []; }
}

let ids = read();

export const wishlistIds = () => [...ids];
export const isWished = (id) => ids.includes(id);
export const wishCount = () => ids.length;

function write() {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* private mode: session only */ }
  render();
  document.dispatchEvent(new CustomEvent("wishlist:change", { detail: { ids: [...ids] } }));
}

export function setWished(id, on) {
  if (!getProduct(id) || isWished(id) === on) return;
  ids = on ? [...ids, id] : ids.filter((x) => x !== id);
  write();
}

export function toggleWish(id) {
  const on = !isWished(id);
  setWished(id, on);
  toast(on ? "Saved to wishlist" : "Removed");
  popCount();
  return on;
}

/** The heart button used on cards and the product page. */
export function wishButtonHTML(p, cls = "") {
  const on = isWished(p.id);
  return `<button type="button" class="wish ${cls}${on ? " is-on" : ""}" data-wish="${esc(p.id)}" aria-pressed="${on}" aria-label="Save ${esc(p.fullName)} to wishlist">` +
    `<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons/icons.svg#i-heart"></use></svg><span class="wish-ring" aria-hidden="true"></span></button>`;
}

/* ---------- rendering ---------- */

function render() {
  const n = ids.length;
  $$("[data-wish-count]").forEach((el) => { el.textContent = n; el.hidden = n === 0; });
  $$("[data-wish-label]").forEach((el) =>
    el.setAttribute("aria-label", `Wishlist, ${n} ${n === 1 ? "item" : "items"}`));
  $$("[data-wish]").forEach((btn) => {
    const on = isWished(btn.dataset.wish);
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", String(on));
  });
}

/** Restart a one-shot CSS animation class on an element. */
export function replay(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  el.addEventListener("animationend", () => el.classList.remove(cls), { once: true });
}

function popCount() {
  $$("[data-wish-count]").forEach((el) => replay(el, "is-pop"));
}

/* ---------- wiring ---------- */

export function initWishlist() {
  render();
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-wish]");
    if (!btn) return;
    e.preventDefault();
    const on = toggleWish(btn.dataset.wish);
    if (on) replay(btn, "is-pop");
  });
  window.addEventListener("storage", (e) => { if (e.key === KEY) { ids = read(); render(); } });
  window.addEventListener("pageshow", (e) => { if (e.persisted) { ids = read(); render(); } });
}
