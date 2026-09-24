/* ==========================================================================
   Brands — every menu, room, filter and footer column renders from this list.
   Adding a brand = adding one object here.
   status: "live" (shoppable) | "coming" (announced) | "teaser" (only if CONFIG.showComingBrands)
   ========================================================================== */

import { CONFIG } from "./config.js";

export const BRANDS = [
  { id:"one-origin", name:"One Origin", line:"Single source purity", category:"Skin",
    coords:"34.15° N, 77.58° E", originId:"leh-ladakh", status:"live",
    story:"Skincare built on a single, traceable ingredient source. Our sea-buckthorn comes from one place, picked by hand, and every tube carries a code that shows you where.",
    room:{ bg:"var(--oo-blush)", accent:"var(--oo-orange)" } },
  { id:"larrive", name:"L’Arrivé", line:"Une touche de Paris", category:"Fragrance",
    coords:"48.86° N, 2.35° E", originId:"paris", status:"live",
    story:"French for “arrived”. Fragrance for the one who no longer needs to try, made to last from the morning commute to the evening.",
    room:{ bg:"var(--la-mist)", accent:"var(--la-black)" } },
  { id:"jiai-no2", name:"Nº 2", line:"Name to be revealed", category:"Fragrance", status:"coming" }, // TODO(client)
  { id:"black-truth", name:"Black Truth", category:"Coming to the house", status:"teaser" },   // only if CONFIG.showComingBrands
  { id:"white-lie",  name:"White Lie",  category:"Coming to the house", status:"teaser" },
];

/* ---------- lookups (shared by header, search, shop, rooms) ---------- */

export const getBrand = (id) => BRANDS.find((b) => b.id === id);

/** Brands a visitor may see: live + coming, plus teasers when the client enables them. */
export const visibleBrands = () =>
  BRANDS.filter((b) => b.status === "live" || b.status === "coming" ||
    (b.status === "teaser" && CONFIG.showComingBrands));

export const liveBrands = () => BRANDS.filter((b) => b.status === "live");

export const brandURL = (id) => `brand.html?b=${encodeURIComponent(id)}`;
