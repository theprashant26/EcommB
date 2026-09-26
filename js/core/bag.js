/* ==========================================================================
   Cart (§7; renamed from "bag" in Update 02 §4) — right-side offcanvas.
   State: localStorage "jiai-bag-v1" = [{ id, size, qty }] (the key is kept so
   carts saved before the rename survive). A line is a product in one size
   (Update 03 §8); lines saved before sizes existed migrate to "full".
   Survives page loads and stays in sync across tabs. Any element with
   data-add-to-bag="<product id>" adds that product (data-size="<key>" picks
   the size); data-qty-source="<selector>" reads a quantity input.
   Add to Cart feedback (§5): spinner → "Added ✓" for 1.2s, the thumbnail arcs
   into the cart icon, the count pops, then the drawer opens (desktop) or a
   toast shows (phones).
   ========================================================================== */

import { CONFIG } from "../data/config.js";
import { getProduct, productURL, sizesOf, sizeOf } from "../data/products.js";
import { getBrand } from "../data/brands.js";
import { esc, formatPrice, icon, $, $$, hasGSAP, reducedMotion } from "./format.js";
import { toast } from "./toast.js";
import { revealHeader } from "./header.js";
import { replay } from "./wishlist.js";

const KEY = CONFIG.bagKey;
const MAX_QTY = 10;

/* ---------- state ---------- */

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    // Drop anything no longer in the catalogue, not buyable, or in a size it is no longer sold in;
    // carts from before sizes existed become "full". Two lines for the same piece and size merge.
    const out = [];
    raw.forEach((l) => {
      const p = getProduct(l.id);
      const size = l.size || "full";
      if (!p || p.comingSoon || !(l.qty > 0) || !sizesOf(p).some((s) => s.key === size)) return;
      const same = out.find((o) => o.id === l.id && o.size === size);
      if (same) same.qty = Math.min(MAX_QTY, same.qty + Math.floor(l.qty));
      else out.push({ id: l.id, size, qty: Math.min(MAX_QTY, Math.floor(l.qty)) });
    });
    return out;
  } catch { return []; }
}

let lines = read();

function write() {
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* private mode: session only */ }
  render();
  document.dispatchEvent(new CustomEvent("bag:change", { detail: { lines: [...lines] } }));
}

const lineKey = (id, size) => `${id}|${size}`;
const unitPrice = (l) => sizeOf(getProduct(l.id), l.size).price;

export const bagCount = () => lines.reduce((n, l) => n + l.qty, 0);
export const bagSubtotal = () => lines.reduce((sum, l) => sum + unitPrice(l) * l.qty, 0);
export const bagHas = (id, size = "full") => lines.some((l) => l.id === id && l.size === size);

/** Adds to the cart. opts.size: a size key ("full" by default); opts.feedback: "drawer" (desktop default) | "toast" | "none". */
export function addToBag(id, qty = 1, { from, feedback, size = "full" } = {}) {
  const p = getProduct(id);
  if (!p) return false;
  if (p.comingSoon) { toast(`${p.name} arrives soon.`); return false; }
  size = sizeOf(p, size).key;                              // an unknown size falls back to the default
  const line = lines.find((l) => l.id === id && l.size === size);
  if (line) line.qty = Math.min(MAX_QTY, line.qty + qty);
  else lines.push({ id, size, qty: Math.min(MAX_QTY, qty) });
  const mode = feedback || (matchMedia("(min-width: 992px)").matches ? "drawer" : "toast");
  const flight = flyToBag(from);
  const arrive = () => {
    write();
    popCount();
    if (mode === "drawer") openBag();
    else if (mode === "toast") toast("Added to cart");
  };
  // The count changes when the thumbnail lands, so the pop reads as its arrival.
  if (flight) setTimeout(arrive, flight); else arrive();
  return true;
}

export function setQty(id, qty, size = "full") {
  const line = lines.find((l) => l.id === id && l.size === size);
  if (!line) return;
  line.qty = Math.max(1, Math.min(MAX_QTY, qty));
  write();
}

export function removeFromBag(id, size = "full") {
  lines = lines.filter((l) => !(l.id === id && l.size === size));
  write();
}

export function openBag() {
  const el = $("#bag");
  if (el && window.bootstrap) bootstrap.Offcanvas.getOrCreateInstance(el).show();
}

/* ---------- rendering ---------- */

function render() {
  const count = bagCount();

  // Header counts
  $$("[data-bag-count]").forEach((el) => {
    el.textContent = count;
    el.hidden = count === 0;
  });
  $$("[data-bag-label]").forEach((el) =>
    el.setAttribute("aria-label", `Cart, ${count} ${count === 1 ? "item" : "items"}`));

  const list = $("[data-bag-lines]");
  if (!list) return;
  const empty = $("[data-bag-empty]");
  const foot = $("[data-bag-foot]");
  $("[data-bag-count-text]").textContent = count ? `${count} ${count === 1 ? "item" : "items"}` : "";

  empty.hidden = count > 0;
  foot.hidden = count === 0;

  list.innerHTML = lines.map((l) => {
    const p = getProduct(l.id);
    const brand = getBrand(p.brand);
    const sz = sizeOf(p, l.size);
    const url = `${productURL(p.id)}${l.size !== "full" ? `&size=${encodeURIComponent(l.size)}` : ""}`;
    return `
      <li class="bag-line" data-id="${esc(p.id)}" data-size="${esc(l.size)}" data-key="${esc(lineKey(p.id, l.size))}">
        <a class="bag-thumb${l.size === "compact" ? " is-compact" : ""}" href="${url}" tabindex="-1" aria-hidden="true">
          <img src="${esc(p.images.card || p.images.hero)}" alt="" width="72" height="96" loading="lazy" decoding="async">
        </a>
        <div class="bag-info">
          <p class="bag-brand">${esc(brand?.name || "")}</p>
          <a class="bag-name link-draw" href="${url}">${esc(p.name)}</a>
          <p class="bag-size">${esc(sz.label)}</p>
          <div class="bag-row">
            <div class="stepper" role="group" aria-label="Quantity for ${esc(p.fullName)}, ${esc(sz.label)}">
              <button type="button" class="stepper-btn" data-step="-1" aria-label="Decrease quantity" ${l.qty <= 1 ? "disabled" : ""}>
                ${icon("minus")}</button>
              <output class="stepper-val" aria-live="polite">${l.qty}</output>
              <button type="button" class="stepper-btn" data-step="1" aria-label="Increase quantity" ${l.qty >= MAX_QTY ? "disabled" : ""}>
                ${icon("plus")}</button>
            </div>
            <button type="button" class="bag-remove link-draw" data-remove>Remove<span class="visually-hidden"> ${esc(p.fullName)}, ${esc(sz.label)}</span></button>
          </div>
        </div>
        <p class="bag-price">${CONFIG.showPrices ? formatPrice(sz.price * l.qty) : "Price at launch"}</p>
      </li>`;
  }).join("");

  // Subtotal + free-delivery progress (nothing to show for an empty bag)
  if (!count) return;
  const subtotal = bagSubtotal();
  const showMoney = CONFIG.showPrices;
  $$("[data-bag-money]").forEach((el) => (el.hidden = !showMoney));
  $("[data-bag-subtotal]").textContent = formatPrice(subtotal);
  const threshold = CONFIG.freeShippingOver;
  const pct = Math.min(100, (subtotal / threshold) * 100);
  const remaining = Math.max(0, threshold - subtotal);
  $("[data-bag-ship-text]").textContent = remaining > 0
    ? `${formatPrice(remaining)} away from free delivery across India.`
    : "Free delivery across India is yours.";
  const bar = $("[data-bag-ship-bar]");
  bar.style.setProperty("--p", (pct / 100).toFixed(4));
  bar.setAttribute("aria-valuenow", Math.round(pct));
}

/* ---------- motion: count pop + arc into the cart ---------- */

function popCount() {
  $$("[data-bag-count]").forEach((el) => replay(el, "is-pop"));
}

/** Arcs a copy of the product image into the cart icon. Returns the flight time in ms (0 when it didn't fly). */
function flyToBag(from) {
  if (!from || !hasGSAP() || reducedMotion()) return 0;
  const img = from.tagName === "IMG" ? from : $("img", from);
  const target = $$("[data-bag-target]").find((el) => el.offsetParent !== null);
  if (!img || !target) return 0;
  revealHeader();

  const a = img.getBoundingClientRect();
  if (!a.width) return 0;
  const b = target.getBoundingClientRect();
  const size = Math.min(110, a.width);
  const h = size * (a.height / a.width);
  const clone = img.cloneNode();
  clone.removeAttribute("loading");
  clone.alt = "";
  clone.className = "bag-fly";
  Object.assign(clone.style, {
    left: `${a.left + (a.width - size) / 2}px`, top: `${a.top + (a.height - h) / 2}px`,
    width: `${size}px`, height: `${h}px`,
  });
  document.body.appendChild(clone);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  // x and y on different eases = an arc rather than a straight line.
  gsap.timeline({ onComplete: () => clone.remove() })
    .to(clone, { x: dx, duration: 0.85, ease: "power1.in" }, 0)
    .to(clone, { y: dy, duration: 0.85, ease: "power3.out" }, 0)
    .to(clone, { scale: 0.18, duration: 0.85, ease: "power2.in" }, 0)
    .to(clone, { opacity: 0, duration: 0.2, ease: "none" }, 0.65);
  return 800;
}

/* ---------- the button's own feedback: spinner → "Added ✓" → back ---------- */

const busy = new WeakSet();
function buttonFeedback(btn, run) {
  const label = btn.querySelector("span") || btn;
  const original = label.innerHTML;
  busy.add(btn);
  btn.style.minWidth = `${btn.offsetWidth}px`;   // the label changes; the button does not jump
  btn.setAttribute("aria-busy", "true");
  btn.classList.add("is-busy");
  label.innerHTML = `<span class="spinner" aria-hidden="true"></span><span class="visually-hidden">Adding</span>`;
  setTimeout(() => {
    const ok = run();
    btn.classList.remove("is-busy");
    btn.removeAttribute("aria-busy");
    if (!ok) { label.innerHTML = original; busy.delete(btn); btn.style.minWidth = ""; return; }
    btn.classList.add("is-added");
    label.innerHTML = `Added ${icon("check")}`;
    setTimeout(() => {
      btn.classList.remove("is-added");
      label.innerHTML = original;
      btn.style.minWidth = "";
      busy.delete(btn);
    }, 1200);
  }, reducedMotion() ? 150 : 450);
}

/* ---------- wiring ---------- */

export function initBag() {
  render();

  // Add to Cart anywhere on the page (cards, PDP, sticky bar, wishlist)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-to-bag]");
    if (!btn) return;
    e.preventDefault();
    if (busy.has(btn)) return;
    const qtyEl = btn.dataset.qtySource && $(btn.dataset.qtySource);
    const qty = qtyEl ? parseInt(qtyEl.value, 10) || 1 : 1;
    const from = btn.dataset.addFrom ? $(btn.dataset.addFrom)
      : btn.closest("[data-product-card]")?.querySelector("img");
    buttonFeedback(btn, () => addToBag(btn.dataset.addToBag, qty, { from, size: btn.dataset.size || "full" }));
  });

  // Line controls
  const list = $("[data-bag-lines]");
  list?.addEventListener("click", (e) => {
    const line = e.target.closest(".bag-line");
    if (!line) return;
    const id = line.dataset.id, size = line.dataset.size;
    const step = e.target.closest("[data-step]");
    if (step) {
      const cur = lines.find((l) => l.id === id && l.size === size)?.qty || 1;
      setQty(id, cur + Number(step.dataset.step), size);
      // Keep keyboard focus on the same control after re-render (or its sibling if it hit a limit).
      const row = $(`.bag-line[data-key="${CSS.escape(lineKey(id, size))}"]`);
      const same = $(`[data-step="${step.dataset.step}"]`, row);
      (same && !same.disabled ? same : $("[data-step]:not([disabled])", row))?.focus();
    }
    if (e.target.closest("[data-remove]")) {
      removeFromBag(id, size);
      ($("[data-bag-lines] [data-remove]") || $("#bag [data-bag-close]"))?.focus();
    }
  });

  $("[data-checkout]")?.addEventListener("click", () => toast("Checkout connects at launch."));

  // Another tab changed the bag
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) { lines = read(); render(); }
  });
  // Restored from the back/forward cache: state may have changed on another page
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) { lines = read(); render(); }
  });
}
