/* ==========================================================================
   Bag (§7) — right-side offcanvas styled as a gallery receipt.
   State: localStorage "jiai-bag-v1" = [{ id, qty }]. Survives page loads and
   stays in sync across tabs. Any element with data-add-to-bag="<product id>"
   adds that product; data-qty-source="<selector>" reads a quantity input.
   ========================================================================== */

import { CONFIG } from "../data/config.js";
import { getProduct, productURL } from "../data/products.js";
import { getBrand } from "../data/brands.js";
import { esc, formatPrice, $, $$, hasGSAP, reducedMotion } from "./format.js";
import { toast } from "./toast.js";
import { revealHeader } from "./header.js";

const KEY = CONFIG.bagKey;
const MAX_QTY = 10;

/* ---------- state ---------- */

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    // Drop anything that is no longer in the catalogue or cannot be bought.
    return Array.isArray(raw)
      ? raw.filter((l) => { const p = getProduct(l.id); return p && !p.comingSoon && l.qty > 0; })
           .map((l) => ({ id: l.id, qty: Math.min(MAX_QTY, Math.floor(l.qty)) }))
      : [];
  } catch { return []; }
}

let lines = read();

function write() {
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* private mode: session only */ }
  render();
  document.dispatchEvent(new CustomEvent("bag:change", { detail: { lines: [...lines] } }));
}

export const bagCount = () => lines.reduce((n, l) => n + l.qty, 0);
export const bagSubtotal = () => lines.reduce((sum, l) => sum + getProduct(l.id).price * l.qty, 0);

export function addToBag(id, qty = 1, { from } = {}) {
  const p = getProduct(id);
  if (!p) return;
  if (p.comingSoon) { toast(`${p.name} arrives soon.`); return; }
  const line = lines.find((l) => l.id === id);
  if (line) line.qty = Math.min(MAX_QTY, line.qty + qty);
  else lines.push({ id, qty: Math.min(MAX_QTY, qty) });
  write();
  flyToBag(from);
  flipCount();
  toast(`${p.fullName} added to your bag.`);
}

export function setQty(id, qty) {
  const line = lines.find((l) => l.id === id);
  if (!line) return;
  line.qty = Math.max(1, Math.min(MAX_QTY, qty));
  write();
}

export function removeFromBag(id) {
  lines = lines.filter((l) => l.id !== id);
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
    el.setAttribute("aria-label", `Bag, ${count} ${count === 1 ? "item" : "items"}`));

  const list = $("[data-bag-lines]");
  if (!list) return;
  const empty = $("[data-bag-empty]");
  const foot = $("[data-bag-foot]");
  $("[data-bag-count-text]").textContent = count ? `${count} ${count === 1 ? "piece" : "pieces"}` : "";

  empty.hidden = count > 0;
  foot.hidden = count === 0;

  list.innerHTML = lines.map((l) => {
    const p = getProduct(l.id);
    const brand = getBrand(p.brand);
    return `
      <li class="bag-line" data-id="${esc(p.id)}">
        <a class="bag-thumb" href="${productURL(p.id)}" tabindex="-1" aria-hidden="true">
          <img src="${esc(p.images.hero)}" alt="" width="72" height="96" loading="lazy" decoding="async">
        </a>
        <div class="bag-info">
          <p class="bag-brand">${esc(brand?.name || "")}</p>
          <a class="bag-name link-draw" href="${productURL(p.id)}">${esc(p.name)}</a>
          <p class="bag-size">${esc(p.size || "")}</p>
          <div class="bag-row">
            <div class="stepper" role="group" aria-label="Quantity for ${esc(p.fullName)}">
              <button type="button" class="stepper-btn" data-step="-1" aria-label="Decrease quantity" ${l.qty <= 1 ? "disabled" : ""}>
                <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8"/></svg></button>
              <output class="stepper-val" aria-live="polite">${l.qty}</output>
              <button type="button" class="stepper-btn" data-step="1" aria-label="Increase quantity" ${l.qty >= MAX_QTY ? "disabled" : ""}>
                <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8M6 2v8"/></svg></button>
            </div>
            <button type="button" class="bag-remove link-draw" data-remove>Remove<span class="visually-hidden"> ${esc(p.fullName)}</span></button>
          </div>
        </div>
        <p class="bag-price">${CONFIG.showPrices ? formatPrice(p.price * l.qty) : "Price at launch"}</p>
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

/* ---------- motion: count flip + arc into the bag ---------- */

function flipCount() {
  if (!hasGSAP() || reducedMotion()) return;
  $$("[data-bag-count]").forEach((el) =>
    gsap.fromTo(el, { rotateX: 90 }, { rotateX: 0, duration: 0.4, ease: "power4.out", transformPerspective: 200 }));
}

function flyToBag(from) {
  if (!from || !hasGSAP() || reducedMotion()) return;
  const img = from.tagName === "IMG" ? from : $("img", from);
  const target = $$("[data-bag-target]").find((el) => el.offsetParent !== null);
  if (!img || !target) return;
  revealHeader();

  const a = img.getBoundingClientRect();
  if (!a.width) return;
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
}

/* ---------- wiring ---------- */

export function initBag() {
  render();

  // Add-to-bag anywhere on the page (cards, PDP, quick view, sticky bar)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-to-bag]");
    if (!btn) return;
    e.preventDefault();
    const qtyEl = btn.dataset.qtySource && $(btn.dataset.qtySource);
    const qty = qtyEl ? parseInt(qtyEl.value, 10) || 1 : 1;
    const from = btn.dataset.addFrom ? $(btn.dataset.addFrom)
      : btn.closest("[data-product-card]")?.querySelector("img");
    addToBag(btn.dataset.addToBag, qty, { from });
  });

  // Line controls
  const list = $("[data-bag-lines]");
  list?.addEventListener("click", (e) => {
    const line = e.target.closest(".bag-line");
    if (!line) return;
    const id = line.dataset.id;
    const step = e.target.closest("[data-step]");
    if (step) {
      const cur = lines.find((l) => l.id === id)?.qty || 1;
      setQty(id, cur + Number(step.dataset.step));
      // Keep keyboard focus on the same control after re-render (or its sibling if it hit a limit).
      const row = $(`.bag-line[data-id="${CSS.escape(id)}"]`);
      const same = $(`[data-step="${step.dataset.step}"]`, row);
      (same && !same.disabled ? same : $("[data-step]:not([disabled])", row))?.focus();
    }
    if (e.target.closest("[data-remove]")) {
      removeFromBag(id);
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
