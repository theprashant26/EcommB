/* ==========================================================================
   Formatting + tiny DOM helpers shared by every module.
   ========================================================================== */

import { CONFIG } from "../data/config.js";

let priceFormatter; // created on first use: building an Intl formatter is not free at load

/** ₹649 */
export function formatPrice(n) {
  priceFormatter ||= new Intl.NumberFormat(CONFIG.locale, {
    style: "currency", currency: CONFIG.currency, maximumFractionDigits: 0,
  });
  return priceFormatter.format(n);
}

let dateFormatter;
/** "2026-09-12" → "12 Sept 2026" (en-IN). Non-ISO strings pass through unchanged. */
export function formatDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return iso || "";
  dateFormatter ||= new Intl.DateTimeFormat(CONFIG.locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

/** Respects CONFIG.showPrices — use this anywhere a visitor reads a price. */
export const priceLabel = (product) =>
  CONFIG.showPrices ? formatPrice(product.price) : "Price at launch";

/** Price markup (Update 02 §2): price, then the struck MRP and "{n}% off" when an MRP above the price is set. */
export function priceHTML(product, { cls = "" } = {}) {
  if (!CONFIG.showPrices) return `<span class="price ${cls}">Price at launch</span>`;
  const { price, mrp } = product;
  const off = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
  return `<span class="price ${cls}">${formatPrice(price)}</span>` + (off
    ? `<s class="price-mrp"><span class="visually-hidden">MRP </span>${formatPrice(mrp)}</s><span class="price-off">${off}% off</span>`
    : "");
}

/** Rating for cards: "★ 4.6 (86)". Empty unless sample ratings are on or a product has real ones. */
export function ratingHTML(product) {
  const r = product.rating;
  if (!r || !CONFIG.demoReviews) return "";
  return `<p class="rating-mini"><svg class="icon icon--filled" aria-hidden="true"><use href="assets/icons/icons.svg#i-star"></use></svg>` +
    `<span class="visually-hidden">Rated </span>${r.average.toFixed(1)}<span class="visually-hidden"> out of 5,</span> <span class="rating-count">(${r.count}<span class="visually-hidden"> ratings</span>)</span></p>`;
}

/** Sprite icon markup: icon("heart") → <svg class="icon">…#i-heart. */
export const icon = (name, cls = "") =>
  `<svg class="icon${cls ? ` ${cls}` : ""}" aria-hidden="true" focusable="false"><use href="assets/icons/icons.svg#i-${name}"></use></svg>`;

/** 34.1526, 77.5771 → "34.15° N, 77.58° E" */
export function formatCoords(lat, lon, digits = 2) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(digits)}° ${ns}, ${Math.abs(lon).toFixed(digits)}° ${ew}`;
}

/** Escape text before it goes into an HTML template string. */
export function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Lower-case, strip accents and curly quotes so “larrive” finds “L’Arrivé”. */
export function normalize(str = "") {
  return String(str)
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[’'`´]/g, "").replace(/º/g, "o")
    .toLowerCase().trim();
}

/**
 * Intrinsic size of a provided render, for explicit width/height (no layout shift).
 * Keyed by file name pattern; unknown files fall back to a 3:4 box.
 */
const IMAGE_SIZES = [
  [/-front\.webp$/, [620, 1100]],
  [/-front-hd\.webp$/, [1479, 2622]],
  [/-angle-hd\.webp$/, [1479, 2651]],
  [/-back-hd\.webp$/, [1479, 2622]],
  [/-label\.webp$/, [706, 1100]],
  [/-label-hd\.webp$/, [1284, 2000]],
  [/ritual-01-cleanser\.webp$/, [1536, 582]],
  [/ritual-02-larrive\.webp$/, [1536, 570]],
  [/ritual-03-moisturiser\.webp$/, [1536, 494]],
  [/ritual-04-no2\.webp$/, [1536, 526]],
  [/spin-hd\/[a-z]+\/\d{3}\.webp$/, [1200, 1800]],
  [/-hero\.webp$/, [1150, 2047]],
  [/-angle\.webp$/, [1150, 2062]],
  [/-back\.webp$/, [857, 2006]],
  [/(cleanser|lotion)-cutout\.webp$/, [836, 2014]],
  [/larrive-cutout(-light)?\.webp$/, [557, 1143]],
  [/perfume-02-placeholder\.webp$/, [557, 1143]],
  [/larrive-02-placeholder\.(webp|png)$/, [537, 1123]],
  [/combo-skin-duo\.webp$/, [652, 1010]],
  [/combo-origin-arrival\.webp$/, [684, 980]],
  [/combo-complete-ritual\.webp$/, [895, 980]],
  [/hero-origin\.webp$/, [436, 582]],
  [/category-combos\.webp$/, [1200, 760]],
  [/category-fragrance\.webp$/, [912, 570]],
  [/category-new\.webp$/, [842, 526]],
  [/category-skin\.webp$/, [931, 582]],
  [/larrive-campaign\.webp$/, [1024, 1536]],
  [/spin\/[a-z]+\/\d{3}\.webp$/, [720, 1080]],
];
export function imageSize(src = "") {
  const hit = IMAGE_SIZES.find(([re]) => re.test(src));
  return hit ? hit[1] : [900, 1200];
}

/**
 * Where the product sits inside a cutout (fractions of the file), for the product card:
 * cx = horizontal centre of the solid product (the tube renders carry a baked shadow on
 * their right, so their body centres at 39% of the width); top/base = its top and base.
 */
const IMAGE_FOCUS = [
  [/(cleanser|lotion)-(front|angle|hero)\.webp$/, { cx: 0.392, top: 0.036, base: 0.947 }],
  [/(larrive-cutout(-light)?|perfume-02-placeholder)\.webp$/, { cx: 0.5, top: 0.037, base: 0.963 }],
  [/larrive-02-placeholder\.webp$/, { cx: 0.5, top: 0.028, base: 0.972 }],
  [/combo-[a-z-]+\.webp$/, { cx: 0.5, top: 0.024, base: 0.968 }],
];
export function imageFocus(src = "") {
  const hit = IMAGE_FOCUS.find(([re]) => re.test(src));
  return hit ? hit[1] : { cx: 0.5, top: 0.04, base: 0.96 };
}

/**
 * Resolves once css/site.min.css is applied (Update 04: it loads without blocking the first paint,
 * which the inline critical CSS covers). Pages await it before rendering or measuring anything,
 * so nothing is laid out unstyled. Gives up after 8 s (a failed stylesheet must not stop the page).
 */
export function cssReady() {
  const applied = () => [...document.styleSheets].some((s) => (s.href || "").includes("css/site.min.css"));
  if (applied() || !document.querySelector('link[href*="css/site.min.css"]')) return Promise.resolve();
  return new Promise((resolve) => {
    const t0 = performance.now();
    const check = () => (applied() || performance.now() - t0 > 8000 ? resolve() : setTimeout(check, 16));
    check();
  });
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** GSAP is loaded from a CDN; every module degrades gracefully without it. */
export const hasGSAP = () => typeof window.gsap !== "undefined";
