/* ==========================================================================
   Search (§7) — full-screen white overlay with a huge Bodoni input.
   Searches PRODUCTS and BRANDS as you type. Esc closes. "/" opens.
   ========================================================================== */

import { PRODUCTS, productURL, productsByBrand } from "../data/products.js";
import { visibleBrands, getBrand, brandURL } from "../data/brands.js";
import { esc, normalize, $, $$, hasGSAP, reducedMotion } from "./format.js";
import { pauseScroll } from "./motion.js";

let overlay, input, results, status, lastFocus;

/* ---------- index ---------- */

function buildIndex() {
  const brands = visibleBrands();
  const brandIds = new Set(brands.map((b) => b.id));
  const productEntries = PRODUCTS.filter((p) => brandIds.has(p.brand)).map((p) => {
    const brand = getBrand(p.brand);
    return {
      kind: "product", url: productURL(p.id), title: p.name, sub: brand?.name || "",
      img: p.images.hero,
      hay: normalize([p.name, p.fullName, brand?.name, brand?.category, p.benefit, p.keyIngredient,
        p.forWho, ...(p.claims || []), ...Object.values(p.notes || {}).flat()].filter(Boolean).join(" ")),
    };
  });
  const brandEntries = brands.map((b) => {
    const lead = productsByBrand(b.id)[0];
    return {
      kind: "brand", url: brandURL(b.id), title: b.name, sub: b.status === "live" ? b.category : (b.line || b.category),
      img: lead?.images.hero || "",
      hay: normalize([b.name, b.line, b.category, b.story, "brand"].filter(Boolean).join(" ")),
    };
  });
  return [...productEntries, ...brandEntries];
}

let INDEX = [];

function query(q) {
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return INDEX.filter((e) => e.kind === "product");
  return INDEX.filter((e) => terms.every((t) => e.hay.includes(t)))
    // brands whose name starts with the query rise to the top
    .sort((a, b) => Number(b.hay.startsWith(terms[0])) - Number(a.hay.startsWith(terms[0])));
}

/* ---------- render ---------- */

function render() {
  const q = input.value.trim();
  const found = query(q);
  status.textContent = q
    ? (found.length ? `${found.length} ${found.length === 1 ? "result" : "results"}` : `Nothing in the house matches “${q}”.`)
    : "Everything in the house";
  results.innerHTML = found.map((e) => `
    <li class="search-result">
      <a href="${e.url}">
        <span class="search-thumb">${e.img
          ? `<img src="${esc(e.img)}" alt="" width="56" height="72" loading="lazy" decoding="async">`
          : ""}</span>
        <span class="search-text">
          <span class="search-title">${esc(e.title)}</span>
          <span class="search-sub">${esc(e.sub)}</span>
        </span>
        <span class="search-kind">${e.kind === "brand" ? "Brand" : "Piece"}</span>
      </a>
    </li>`).join("");
}

/* ---------- open / close ---------- */

export function openSearch() {
  if (!overlay || !overlay.hidden) return;
  lastFocus = document.activeElement;
  if (!INDEX.length) INDEX = buildIndex(); // built on first open, not at page load
  overlay.hidden = false;
  pauseScroll("search", true);
  render();
  if (hasGSAP() && !reducedMotion()) {
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" });
  }
  // Focus after the overlay is visible so mobile keyboards open.
  requestAnimationFrame(() => input.focus());
}

export function closeSearch() {
  if (!overlay || overlay.hidden) return;
  const done = () => {
    overlay.hidden = true;
    pauseScroll("search", false);
    lastFocus?.focus?.();
  };
  if (hasGSAP() && !reducedMotion()) gsap.to(overlay, { opacity: 0, duration: 0.25, ease: "none", onComplete: done });
  else done();
}

export function initSearch() {
  overlay = $("#search");
  if (!overlay) return;
  input = $("#searchInput", overlay);
  results = $("[data-search-results]", overlay);
  status = $("[data-search-status]", overlay);

  $$("[data-search-open]").forEach((btn) => btn.addEventListener("click", openSearch));
  $$("[data-search-close]", overlay).forEach((btn) => btn.addEventListener("click", closeSearch));
  input.addEventListener("input", render);
  $("form", overlay).addEventListener("submit", (e) => {
    e.preventDefault();
    $("a", results)?.click(); // Enter opens the first result
  });

  document.addEventListener("keydown", (e) => {
    if (!overlay.hidden) {
      if (e.key === "Escape") { e.preventDefault(); closeSearch(); }
      if (e.key === "Tab") trapFocus(e);
      return;
    }
    // "/" opens search unless the visitor is typing somewhere
    if (e.key === "/" && !e.target.closest("input, textarea, select, [contenteditable]")) {
      e.preventDefault();
      openSearch();
    }
  });
}

function trapFocus(e) {
  const focusables = $$("a[href], button:not([disabled]), input", overlay).filter((el) => el.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
