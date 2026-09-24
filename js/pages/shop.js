/* ==========================================================================
   Shop (shop.html) — §9.2 editorial grid
   - Filter chips from data: All, each brand with pieces, each category.
   - Product cards (with price) and, after every 3 products, a wide brand
     block (the Ajio Luxe rhythm). Scales as brands are added.
   - Filtering re-lays out with GSAP Flip; tilt is destroyed before and
     re-initialised after. The chosen filter is kept in ?filter= .
   - Quick view: a modal with the image, short copy and "Add to bag".
   ========================================================================== */

import { initHeader } from "../core/header.js";
import { initBag } from "../core/bag.js";
import { initSearch } from "../core/search.js";
import { initMotion, splitLines, whenScriptsReady, afterPaint } from "../core/motion.js";
import { cardHTML, initCards } from "../core/cards.js";
import { CONFIG } from "../data/config.js";
import { PRODUCTS, getProduct, productURL } from "../data/products.js";
import { visibleBrands, getBrand, brandURL } from "../data/brands.js";
import { ORIGINS } from "../data/origins.js";
import { esc, formatPrice, formatCoords, imageSize, reducedMotion, hasGSAP, $, $$ } from "../core/format.js";

initHeader();
initBag();
initSearch();

const grid = $("[data-shop-grid]");
const chipsHost = $("[data-shop-filters]");
const status = $("[data-shop-status]");

/* ---------- the catalogue this page can show ---------- */

const brands = visibleBrands();
const brandIds = new Set(brands.map((b) => b.id));
const products = PRODUCTS.filter((p) => brandIds.has(p.brand));
const categoryOf = (p) => getBrand(p.brand)?.category;

const FILTERS = [
  { key: "all", label: "All", test: () => true },
  ...brands.filter((b) => products.some((p) => p.brand === b.id))
    .map((b) => ({ key: `brand:${b.id}`, label: b.name, brand: b.id, test: (p) => p.brand === b.id })),
  ...[...new Set(products.map(categoryOf).filter(Boolean))]
    .map((cat) => ({ key: `cat:${cat.toLowerCase()}`, label: cat, test: (p) => categoryOf(p) === cat })),
];

/* ---------- elements (built once, re-ordered per filter so Flip can track them) ---------- */

function brandBlockHTML(b) {
  const origin = b.originId && ORIGINS[b.originId];
  const coords = b.coords || (origin ? formatCoords(origin.lat, origin.lon) : "");
  const oneLine = (b.story || b.line || "").split(/(?<=\.)\s/)[0];
  const lead = products.find((p) => p.brand === b.id);
  const [w, h] = lead ? imageSize(lead.images.hero) : [0, 0];
  return `
    <article class="bblock" data-flip-id="brand-${esc(b.id)}" data-brand-block="${esc(b.id)}" style="--bblock-bg:${b.room?.bg || "var(--porcelain)"}">
      <div class="bblock-copy">
        ${coords ? `<p class="coords">${esc(coords)}</p>` : ""}
        <h2 class="bblock-name">${esc(b.name)}</h2>
        ${oneLine ? `<p class="bblock-line">${esc(oneLine)}</p>` : ""}
        <a class="link-cta" href="${brandURL(b.id)}" aria-label="Enter the ${esc(b.name)} room">Enter the room</a>
      </div>
      ${lead ? `<img class="bblock-img" src="${esc(lead.images.hero)}" alt="" width="${w}" height="${h}" loading="lazy" decoding="async">` : ""}
    </article>`;
}

grid.innerHTML =
  products.map((p, i) => cardHTML(p, { price: true, quickView: true, headingLevel: 2, eager: i < 3 })
    .replace('class="pcard"', `class="pcard" data-flip-id="p-${esc(p.id)}"`)).join("") +
  brands.map(brandBlockHTML).join("");

const cardEl = new Map($$(".pcard", grid).map((el) => [el.dataset.id, el]));
const blockEl = new Map($$("[data-brand-block]", grid).map((el) => [el.dataset.brandBlock, el]));

/** Ordered list for a filter: products, with a brand block after every 3 (cycling through the brands shown). */
function layoutFor(filter) {
  const shown = products.filter(filter.test);
  const shownBrands = [...new Set(shown.map((p) => p.brand))];
  const order = [];
  let next = 0;
  shown.forEach((p, i) => {
    order.push(cardEl.get(p.id));
    if ((i + 1) % 3 === 0 && next < shownBrands.length) order.push(blockEl.get(shownBrands[next++]));
  });
  // A single brand always gets its room, even with fewer than three pieces.
  if (filter.brand && next === 0) order.push(blockEl.get(filter.brand));
  return order.filter(Boolean);
}

/* ---------- chips ---------- */

chipsHost.innerHTML = FILTERS.map((f) => `
  <li><button type="button" class="chip" data-filter="${esc(f.key)}" aria-pressed="false">${esc(f.label)}</button></li>`).join("");

let current = FILTERS.find((f) => f.key === new URLSearchParams(location.search).get("filter")) || FILTERS[0];
let cards = { destroy() {} };

function apply(filter, { animate = true } = {}) {
  current = filter;
  $$("[data-filter]", chipsHost).forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === filter.key)));
  const order = layoutFor(filter);
  const shown = new Set(order);
  const all = [...cardEl.values(), ...blockEl.values()];
  const flip = animate && hasGSAP() && window.Flip && !reducedMotion();
  const state = flip ? Flip.getState(all) : null;

  cards.destroy();                                 // tilt off during the re-layout
  all.forEach((el) => el.classList.toggle("is-hidden", !shown.has(el)));
  order.forEach((el) => grid.appendChild(el));     // DOM order = visual order

  const pieces = order.filter((el) => el.classList.contains("pcard")).length;
  status.textContent = `${pieces} ${pieces === 1 ? "piece" : "pieces"}`;
  const url = new URL(location.href);
  if (filter.key === "all") url.searchParams.delete("filter"); else url.searchParams.set("filter", filter.key);
  history.replaceState(null, "", url);

  // Re-init after the old instances are gone (cards.destroy() finishes two frames later).
  const done = () => requestAnimationFrame(() => requestAnimationFrame(() => {
    cards = initCards(grid);
    window.ScrollTrigger?.refresh();
  }));
  if (!flip) { done(); return; }
  Flip.from(state, {
    duration: 0.8, ease: "power4.inOut", absolute: true, nested: true, prune: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power4.out" }),
    onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.96, duration: 0.35, ease: "power2.in" }),
    onComplete: done,
  });
}

chipsHost.addEventListener("click", (e) => {
  const chip = e.target.closest("[data-filter]");
  if (!chip || chip.dataset.filter === current.key) return;
  apply(FILTERS.find((f) => f.key === chip.dataset.filter));
});

/* ---------- quick view ---------- */

const modalEl = $("#quickView");
grid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-quick-view]");
  if (!btn || !modalEl || !window.bootstrap) return;
  const p = getProduct(btn.dataset.quickView);
  const b = getBrand(p.brand);
  const [w, h] = imageSize(p.images.hero);
  const canBuy = !p.comingSoon && CONFIG.showPrices;
  $("[data-qv-body]", modalEl).innerHTML = `
    <div class="qv-media"><img class="qv-img" src="${esc(p.images.hero)}" alt="${esc(p.fullName)}" width="${w}" height="${h}" decoding="async"></div>
    <div class="qv-copy">
      <p class="pcard-brand">${esc(b?.name || "")}</p>
      <h2 class="qv-name" id="quickView-title">${esc(p.comingSoon ? p.fullName : p.name)}</h2>
      <p class="qv-benefit">${esc(p.benefit)}</p>
      ${p.whatItDoes ? `<p class="qv-text">${esc(p.whatItDoes)}</p>` : ""}
      <p class="qv-price">${p.comingSoon ? "Arrives soon" : CONFIG.showPrices ? formatPrice(p.price) : "Price at launch"}${p.size && p.size !== "TBC" ? ` <span>${esc(p.size)}</span>` : ""}</p>
      <div class="qv-actions">
        ${canBuy ? `<button type="button" class="btn-maison" data-add-to-bag="${esc(p.id)}" data-add-from=".qv-img" data-qv-add><span>Add to bag</span></button>` : ""}
        <a class="link-cta" href="${productURL(p.id)}">The whole story</a>
      </div>
    </div>`;
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
});
modalEl?.addEventListener("click", (e) => {
  // Added: let the thumbnail arc to the bag, then close
  if (e.target.closest("[data-qv-add]")) setTimeout(() => bootstrap.Modal.getInstance(modalEl)?.hide(), 350);
});

/* ---------- first layout + motion ---------- */

apply(current, { animate: false });

// The grid is already rendered (async module). Tilt (vanilla-tilt) and motion wait for the CDN scripts.
whenScriptsReady().then(afterPaint).then(() => {
  cards.destroy();
  requestAnimationFrame(() => requestAnimationFrame(() => { cards = initCards(grid); }));
  initMotion(setupMotion);
});

function setupMotion(c, ctx) {
  if (c.reduce) return;
  $$("[data-split]").forEach((el) => splitLines(el, { ctx }));
}
