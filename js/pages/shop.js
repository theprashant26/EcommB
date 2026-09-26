/* ==========================================================================
   Shop (shop.html) — §9.2, Update 02 §8
   - Filters read from and written to the URL, so every menu link lands on a
     real result: ?brand=, ?category=skin|fragrance, ?ritual=morning|day|
     evening|night, ?category=combo, ?tag=bestseller|new, ?sort=featured|new|price-asc|price-desc.
     One choice per group; groups combine. "All" clears the filters.
   - Chips re-lay the grid out with GSAP Flip; a sort select orders it.
   - Product cards (js/core/cards.js) and, in the featured order, a brand tile
     after every full row of pieces (the plinth stage from the home rooms).
   ========================================================================== */

import { initHeader } from "../core/header.js";
import { initBag } from "../core/bag.js";
import { initWishlist } from "../core/wishlist.js";
import { initReveals } from "../core/reveal.js";
import { initSearch } from "../core/search.js";
import { initMotion, splitLines, whenScriptsReady, afterPaint, loadPlugin, whenIdle } from "../core/motion.js";
import { cardHTML } from "../core/cards.js";
import { plinthSetHTML } from "../core/plinth.js";
import { PRODUCTS, CATEGORY_LABELS, RITUAL_LABELS, isCombo } from "../data/products.js";
import { visibleBrands, brandURL } from "../data/brands.js";
import { ORIGINS } from "../data/origins.js";
import { esc, formatCoords, reducedMotion, hasGSAP, $, $$, cssReady } from "../core/format.js";

await cssReady();   // Update 04: the full stylesheet arrives without blocking; render once it applies

initHeader();
// Flip re-lays the grid out when a filter changes: fetch it while the visitor reads (Update 04).
whenScriptsReady().then(() => whenIdle(() => loadPlugin("Flip").catch(() => {})));
initBag();
initSearch();
initWishlist();
initReveals();

const grid = $("[data-shop-grid]");
const chipsHost = $("[data-shop-filters]");
const status = $("[data-shop-status]");
const sortEl = $("[data-shop-sort]");
const empty = $("[data-shop-empty]");

/* ---------- the catalogue this page can show ---------- */

const brands = visibleBrands();
const brandIds = new Set(brands.map((b) => b.id));
// Combos (the house's own sets) are part of "Shop all" and have their own Category chip.
const products = PRODUCTS.filter((p) => brandIds.has(p.brand) || isCombo(p));
const present = (key) => new Set(products.map((p) => p[key]));

const GROUPS = [
  { key: "brand", label: "Brand",
    options: brands.filter((b) => products.some((p) => p.brand === b.id)).map((b) => ({ value: b.id, label: b.name })),
    test: (p, v) => p.brand === v },
  { key: "category", label: "Category",
    options: Object.keys(CATEGORY_LABELS).filter((c) => present("category").has(c)).map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
    test: (p, v) => p.category === v },
  { key: "ritual", label: "Ritual",
    options: Object.keys(RITUAL_LABELS).filter((r) => present("ritual").has(r)).map((r) => ({ value: r, label: RITUAL_LABELS[r] })),
    test: (p, v) => p.ritual === v },
  { key: "tag", label: "Collection",
    options: [{ value: "bestseller", label: "Bestsellers" }, { value: "new", label: "New" }]
      .filter((t) => products.some((p) => (p.tags || []).includes(t.value))),
    test: (p, v) => (p.tags || []).includes(v) },
];

const SORTS = {
  featured: { label: "Featured", fn: null },
  new: { label: "New", fn: (a, b) => Number((b.tags || []).includes("new")) - Number((a.tags || []).includes("new")) },
  "price-asc": { label: "Price: low to high", fn: (a, b) => (Number(!!a.comingSoon) - Number(!!b.comingSoon)) || a.price - b.price },
  "price-desc": { label: "Price: high to low", fn: (a, b) => (Number(!!a.comingSoon) - Number(!!b.comingSoon)) || b.price - a.price },
};

/* ---------- state from the URL ---------- */

function readState() {
  const q = new URLSearchParams(location.search);
  const state = { sort: SORTS[q.get("sort")] ? q.get("sort") : "featured" };
  GROUPS.forEach((g) => {
    const v = q.get(g.key);
    state[g.key] = g.options.some((o) => o.value === v) ? v : null;
  });
  // Links from before Update 02: ?filter=brand:one-origin | cat:skin
  const legacy = q.get("filter");
  if (legacy?.startsWith("brand:") && brandIds.has(legacy.slice(6))) state.brand = legacy.slice(6);
  if (legacy?.startsWith("cat:")) state.category = { skin: "skin", fragrance: "fragrance" }[legacy.slice(4)] || null;
  return state;
}

function writeState(s) {
  const url = new URL(location.href);
  url.searchParams.delete("filter");
  GROUPS.forEach((g) => (s[g.key] ? url.searchParams.set(g.key, s[g.key]) : url.searchParams.delete(g.key)));
  if (s.sort !== "featured") url.searchParams.set("sort", s.sort); else url.searchParams.delete("sort");
  history.replaceState(null, "", url);
}

const state = readState();

/* ---------- elements (built once, re-ordered so Flip can track them) ---------- */

function brandTileHTML(b) {
  const origin = b.originId && ORIGINS[b.originId];
  const coords = b.coords || (origin ? formatCoords(origin.lat, origin.lon) : "");
  const pieces = products.filter((p) => p.brand === b.id && (b.status !== "live" || !p.comingSoon));
  return `
    <article class="bblock" data-flip-id="brand-${esc(b.id)}" data-brand-block="${esc(b.id)}">
      <div class="bblock-copy">
        ${coords ? `<p class="coords">${esc(coords)}</p>` : ""}
        <h2 class="t-h2 bblock-name">${esc(b.name)}</h2>
        ${b.line ? `<p class="t-tagline bblock-line">${esc(b.line)}.</p>` : ""}
        <a class="link-cta" href="${brandURL(b.id)}" aria-label="Enter the ${esc(b.name)} house">Enter the house</a>
      </div>
      <div class="bblock-stage room-stage">${plinthSetHTML(pieces)}</div>
    </article>`;
}

grid.innerHTML =
  products.map((p, i) => cardHTML(p, { headingLevel: 2, eager: i === 0 ? "high" : i < 4 })
    .replace('class="cp"', `class="cp" data-flip-id="p-${esc(p.id)}"`)).join("") +
  brands.map(brandTileHTML).join("");
grid.removeAttribute("data-pending");

const cardEl = new Map($$(".cp", grid).map((el) => [el.dataset.id, el]));
const blockEl = new Map($$("[data-brand-block]", grid).map((el) => [el.dataset.brandBlock, el]));

/** Cards per row right now (the grid is 4 / 3 / 2 columns by width). */
const columns = () => getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length || 3;

/** Ordered elements for a state. */
function layoutFor(s) {
  let shown = products.filter((p) => GROUPS.every((g) => !s[g.key] || g.test(p, s[g.key])));
  const sort = SORTS[s.sort].fn;
  if (sort) shown = [...shown].sort(sort);
  if (s.sort !== "featured" || !shown.length) return { order: shown.map((p) => cardEl.get(p.id)), count: shown.length };
  // Featured: a brand tile after every full row of pieces, cycling through the brands shown.
  const perRow = columns();
  const shownBrands = [...new Set(shown.map((p) => p.brand))].filter((id) => blockEl.has(id));
  const order = [];
  let next = 0;
  shown.forEach((p, i) => {
    order.push(cardEl.get(p.id));
    if ((i + 1) % perRow === 0 && next < shownBrands.length) order.push(blockEl.get(shownBrands[next++]));
  });
  // A single brand always gets its tile, even with fewer than three pieces.
  if (s.brand && next === 0) order.push(blockEl.get(s.brand));
  return { order: order.filter(Boolean), count: shown.length };
}

/* ---------- chips + sort ---------- */

const filtered = () => GROUPS.some((g) => state[g.key]);

chipsHost.innerHTML = `
  <li><button type="button" class="chip" data-chip-all aria-pressed="false">All</button></li>` +
  GROUPS.filter((g) => g.options.length).map((g) => `
  <li class="chip-group" role="group" aria-label="${esc(g.label)}">
    <ul class="chips-sub">${g.options.map((o) => `
      <li><button type="button" class="chip" data-chip-group="${g.key}" data-chip-value="${esc(o.value)}" aria-pressed="false">${esc(o.label)}</button></li>`).join("")}
    </ul>
  </li>`).join("");

sortEl.innerHTML = Object.entries(SORTS).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join("");

function syncControls() {
  $("[data-chip-all]", chipsHost).setAttribute("aria-pressed", String(!filtered()));
  $$("[data-chip-group]", chipsHost).forEach((c) =>
    c.setAttribute("aria-pressed", String(state[c.dataset.chipGroup] === c.dataset.chipValue)));
  sortEl.value = state.sort;
}

let relayout = null;   // the Flip re-layout in progress, if any

function apply({ animate = true } = {}) {
  syncControls();
  writeState(state);
  const all = [...cardEl.values(), ...blockEl.values()];
  const motion = animate && hasGSAP() && !reducedMotion();

  // A new choice while the last re-layout is still running: finish that one first, so no
  // card is left absolutely positioned or half-faded.
  if (relayout) { relayout.progress(1).kill(); relayout = null; }
  if (hasGSAP()) { gsap.killTweensOf([...all, empty]); gsap.set(all, { clearProps: "opacity,transform" }); }
  grid.style.minHeight = "";

  const { order, count } = layoutFor(state);
  const shown = new Set(order);
  const wasEmpty = grid.hidden;
  // Flip only between two non-empty grids: from or to the empty state there are no
  // positions to travel between, so the change simply fades.
  const flip = motion && window.Flip && !wasEmpty && count > 0;
  const flipState = flip ? Flip.getState(all) : null;
  const holdHeight = grid.offsetHeight;

  all.forEach((el) => el.classList.toggle("is-hidden", !shown.has(el)));
  order.forEach((el) => grid.appendChild(el));     // DOM order = visual order

  status.textContent = `${count} ${count === 1 ? "piece" : "pieces"}`;
  empty.hidden = count > 0;
  grid.hidden = count === 0;

  const done = () => { grid.style.minHeight = ""; relayout = null; window.ScrollTrigger?.refresh(); };
  if (!motion) { done(); return; }
  if (count === 0) {
    gsap.fromTo(empty, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", clearProps: "opacity,transform" });
    done();
    return;
  }
  if (!flip) {
    gsap.fromTo(order, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: "power3.out", clearProps: "opacity,transform" });
    done();
    return;
  }
  // Leaving cards are taken out of the flow while they fade: hold the grid's height meanwhile,
  // so the page (and the scroll position) does not collapse under the animation.
  grid.style.minHeight = `${holdHeight}px`;
  relayout = Flip.from(flipState, {
    duration: 0.7, ease: "power3.inOut", absolute: true, nested: true, prune: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }),
    onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.3, ease: "power2.out" }),
    onComplete: done,
  });
}

chipsHost.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  if (chip.hasAttribute("data-chip-all")) {
    if (!filtered()) return;
    GROUPS.forEach((g) => { state[g.key] = null; });
  } else {
    const g = chip.dataset.chipGroup, v = chip.dataset.chipValue;
    state[g] = state[g] === v ? null : v;           // one choice per group; tap again to clear
  }
  apply();
});
sortEl.addEventListener("change", () => { state.sort = sortEl.value; apply(); });
$("[data-shop-clear]")?.addEventListener("click", () => {
  GROUPS.forEach((g) => { state[g.key] = null; });
  apply();
  $("[data-chip-all]", chipsHost).focus();
});

/* ---------- first layout + motion ---------- */

apply({ animate: false });

// The tiles follow whole rows: re-lay out when the number of columns changes.
let lastCols = columns();
addEventListener("resize", () => {
  const n = columns();
  if (n !== lastCols && !grid.hidden) { lastCols = n; apply({ animate: false }); }
});

// The grid is already rendered (async module). Motion waits for the CDN scripts.
whenScriptsReady().then(afterPaint).then(() => initMotion(setupMotion));

function setupMotion(c, ctx) {
  if (c.reduce) return;
  $$("[data-split]").forEach((el) => splitLines(el, { ctx }));
}
