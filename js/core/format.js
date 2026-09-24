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
  [/-hero\.webp$/, [1150, 2047]],
  [/-angle\.webp$/, [1150, 2062]],
  [/-back\.webp$/, [857, 2006]],
  [/(cleanser|lotion)-cutout\.webp$/, [836, 2014]],
  [/larrive-cutout(-light)?\.webp$/, [557, 1143]],
  [/perfume-02-placeholder\.webp$/, [557, 1143]],
  [/larrive-campaign\.webp$/, [1024, 1536]],
  [/spin\/[a-z]+\/\d{3}\.webp$/, [720, 1080]],
];
export function imageSize(src = "") {
  const hit = IMAGE_SIZES.find(([re]) => re.test(src));
  return hit ? hit[1] : [900, 1200];
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** GSAP is loaded from a CDN; every module degrades gracefully without it. */
export const hasGSAP = () => typeof window.gsap !== "undefined";
