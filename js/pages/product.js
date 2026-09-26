/* ==========================================================================
   Product page (product.html?id=…) — rebuilt in Update 02 §9, following the
   client's reference screenshots in this site's language.
   Top: gallery (vertical thumbnail rail + a 4:5 ivory main stage that is also
   the phone carousel and the 360° viewer; click → lightbox) and the buy box
   (brand + share, name, rating, price, size + quantity, Add to Cart + heart,
   assurances). Then: Delivery Options (PIN check), the Product Details /
   Description / Special Features tabs, Where it's from, Ratings & Reviews with
   Rate This Product, and Complete the ritual. A sticky bar keeps "Add to Cart"
   close once the buy box has scrolled away (always on phones).
   Everything renders from js/data; an unknown id shows the whole range.
   ========================================================================== */

import { initHeader } from "../core/header.js";
import { initBag, bagSubtotal, bagHas } from "../core/bag.js";
import { initWishlist, wishButtonHTML } from "../core/wishlist.js";
import { initReveals } from "../core/reveal.js";
import { initSearch } from "../core/search.js";
import { initMotion, splitLines, whenScriptsReady, afterPaint } from "../core/motion.js";
import { createSpin, frameURL } from "../core/spin.js";
import { createMap3d } from "../core/map3d.js";
import { cardHTML, comboPriceHTML } from "../core/cards.js";
import { openLightbox } from "../core/lightbox.js";
import { reviewsSectionHTML, initReviews, ratingFor } from "../core/reviews.js";
import { deliveryHTML, initDelivery } from "../core/delivery.js";
import { shareButtonHTML, initShare } from "../core/share.js";
import { initTabs } from "../core/tabs.js";
import { nameForTransition } from "../core/transitions.js";
import { CONFIG } from "../data/config.js";
import { PRODUCTS, COMBOS, getProduct, productURL, sizesOf, isCombo, comboItems, comboWorth, combosWith, brandNameOf } from "../data/products.js";
import { getBrand, brandURL } from "../data/brands.js";
import { ORIGINS, BATCHES, ARRIVAL_ORIGIN_ID } from "../data/origins.js";
import { esc, formatPrice, formatCoords, imageSize, icon, priceHTML, reducedMotion, $, $$, cssReady } from "../core/format.js";

await cssReady();   // Update 04: the full stylesheet arrives without blocking; render once it applies

initHeader();
initBag();
initSearch();
initWishlist();
initReveals();

const root = $("[data-pdp]");
const id = new URLSearchParams(location.search).get("id");
const product = id && getProduct(id);
const brand = product && getBrand(product.brand);
/** Each product is sold in one size (cart lines keep a size key all the same). */
const size = "full";
const sizeNow = () => sizesOf(product)[0];
const combo = isCombo(product);
/** A combo's pieces (products), in order. */
const piecesOf = (p) => comboItems(p).map((it) => it.product);
const unique = (list) => [...new Set(list.filter(Boolean))];

const buyable = (p) => !p.comingSoon && CONFIG.showPrices;
const batchFor = (p) => Object.entries(BATCHES).find(([, b]) => b.productId === p.id)?.[0];
/** Routes on the mini map: the product's origin → New Delhi. */
const ROUTE_OF = { "leh-ladakh": { routes: ["leh"], pins: ["leh", "delhi"] }, paris: { routes: ["paris"], pins: ["paris", "delhi"] } };
/** The origins behind a product: its own, or (a combo) every piece's that has one. */
const originsOf = (p) => unique(combo ? piecesOf(p).map((x) => x.originId) : [p.originId]).filter((o) => ORIGINS[o]);
/** Mini-map routes for those origins, merged. */
const routeFor = (p) => {
  const r = originsOf(p).map((o) => ROUTE_OF[o]).filter(Boolean);
  return { routes: unique(r.flatMap((x) => x.routes)), pins: unique(r.flatMap((x) => x.pins)) };
};
/** Values still waiting for the client read "To be confirmed" on the page (the TODO stays in the data). */
const clean = (v = "") => {
  if (!/TODO\(client\)/.test(v)) return v;
  const rest = v.replace(/\s*(—|:)?\s*TODO\(client\).*$/, "").trim();
  return rest ? `${rest} (details to be confirmed)` : "To be confirmed";
};

/* ==========================================================================
   Gallery
   ========================================================================== */

const photosOf = (p) => (p.gallery?.length ? p.gallery.filter((g) => g.src) : [{ src: p.images.hero, alt: p.fullName }]);
const galleryOf = (p) => {
  if (!isCombo(p)) return p.gallery?.length ? p.gallery : [{ src: p.images.hero, alt: p.fullName }];
  // A combo (Update 03b): the set first, then each piece's first image, then the pieces' other images.
  const pieces = piecesOf(p).map(photosOf);
  return [{ src: p.images.hero, alt: `${p.fullName}, together` }, ...pieces.map((g) => g[0]), ...pieces.flatMap((g) => g.slice(1))];
};
/** The images (not the 360° tile) — what the lightbox shows. */
const photos = (p) => galleryOf(p).filter((g) => g.src);

function galleryHTML(p) {
  const items = galleryOf(p);
  const thumb = (g, i) => g.type === "360"
    ? `<button type="button" class="pdp-thumb pdp-thumb--360" data-go="${i}" aria-label="Turn it through 360 degrees">${icon("rotate-3d")}<span>360°</span></button>`
    : `<button type="button" class="pdp-thumb" data-go="${i}" aria-label="Show image ${i + 1}: ${esc(g.alt)}"><img src="${esc(g.src)}" alt="" width="${imageSize(g.src)[0]}" height="${imageSize(g.src)[1]}" loading="lazy" fetchpriority="low" decoding="async"${g.fit === "cover" ? ` style="object-fit:cover;object-position:${esc(g.focus || "50% 50%")}"` : ""}></button>`;
  let photo = -1;
  const slide = (g, i) => {
    if (g.type === "360") {
      return `
        <div class="pdp-slide pdp-slide--360" data-slide="${i}" role="group" aria-roledescription="slide" aria-label="360° view">
          <img class="pdp-360-poster" src="${esc(frameURL(p.spin.path, 0))}" alt="" width="720" height="1080" loading="lazy" decoding="async" data-360-poster>
          <canvas class="pdp-360" tabindex="0" role="img" aria-label="${esc(p.fullName)} turning 360 degrees. Drag, or use the arrow keys." data-360></canvas>
          <p class="pdp-360-hint">${icon("rotate-3d")} Drag to turn</p>
        </div>`;
    }
    photo += 1;
    const [w, h] = imageSize(g.src);
    const cover = g.fit === "cover";
    return `
      <div class="pdp-slide" data-slide="${i}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${items.length}">
        <button type="button" class="pdp-open${cover ? " is-cover" : ""}" data-open="${photo}" aria-label="Open full screen: ${esc(g.alt)}">
          <img src="${esc(g.src)}" alt="${esc(g.alt)}" width="${w}" height="${h}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${cover ? ` style="object-position:${esc(g.focus || "50% 50%")}"` : ""}${i === 0 ? ' data-hero-img' : ""}>
        </button>
      </div>`;
  };
  return `
    <div class="pdp-gallery" data-gallery>
      <div class="pdp-rail${items.length > 5 ? " has-arrows" : ""}">
        <button type="button" class="pdp-rail-arrow" data-rail="-1" aria-label="Earlier images" ${items.length > 5 ? "" : "hidden"}>${icon("chevron-up")}</button>
        <ol class="pdp-thumbs" data-thumbs>${items.map((g, i) => `<li>${thumb(g, i)}</li>`).join("")}</ol>
        <button type="button" class="pdp-rail-arrow" data-rail="1" aria-label="Later images" ${items.length > 5 ? "" : "hidden"}>${icon("chevron-down")}</button>
      </div>
      <div class="pdp-main">
        <div class="pdp-stage" aria-roledescription="carousel" aria-label="${esc(p.fullName)} images">
          <div class="pdp-track" data-track>${items.map(slide).join("")}</div>
        </div>
        <div class="pdp-dots" data-dots>${items.map((g, i) => `<button type="button" class="pdp-dot" data-go="${i}" aria-label="Show ${g.type === "360" ? "the 360° view" : `image ${i + 1}`}"></button>`).join("")}</div>
      </div>
    </div>`;
}

/* ==========================================================================
   Buy box
   ========================================================================== */

/** Update 03 §9: "4.5 ★ | 64 ratings" pill beside the share button (scrolls to Ratings & Reviews); plain zinc text when there are none. */
function ratingBadgeHTML(p) {
  const r = ratingFor(p);
  if (!r) return `<span class="pdp-norating">No ratings yet</span>`;
  return `<a class="pdp-rating" href="#reviews" aria-label="Rated ${r.average.toFixed(1)} out of 5 from ${r.count} ratings. Go to Ratings and Reviews">`
    + `<span>${r.average.toFixed(1)}</span>${icon("star", "icon--filled")}<span class="pdp-rating-sep" aria-hidden="true">|</span><span>${r.count} ${r.count === 1 ? "rating" : "ratings"}</span></a>`;
}

function buyHTML(p) {
  const sz = sizeNow();
  const price = p.comingSoon
    ? `<p class="pdp-price"><span class="price">Arrives soon</span></p>`
    : `<p class="pdp-price" data-pdp-price>${isCombo(p) ? comboPriceHTML(p, { long: true }) : priceHTML({ price: sz.price, mrp: sz.mrp })}</p>${CONFIG.showPrices ? `<p class="pdp-tax">Inclusive of all taxes</p>` : ""}`;
  const sizes = isCombo(p) ? [] : sizesOf(p).filter((x) => x.label);
  const d = CONFIG.delivery;
  const choices = buyable(p) ? `
    <div class="pdp-choices">
      ${sizes.length ? `
      <div class="pdp-choice">
        <p class="t-label" id="sizeLabel">Size</p>
        <div class="pdp-sizes" role="radiogroup" aria-labelledby="sizeLabel">
          ${sizes.map((x) => `<button type="button" role="radio" class="size-chip" aria-checked="${x.key === sz.key}">${esc(x.label)}</button>`).join("")}
        </div>
      </div>` : ""}
      <div class="pdp-choice">
        <p class="t-label" id="qtyLabel">Quantity</p>
        <div class="stepper pdp-stepper" role="group" aria-labelledby="qtyLabel">
          <button type="button" class="stepper-btn" data-qty="-1" aria-label="Decrease quantity">${icon("minus")}</button>
          <input class="stepper-val stepper-input" id="pdpQty" type="number" inputmode="numeric" min="1" max="10" value="1" aria-label="Quantity">
          <button type="button" class="stepper-btn" data-qty="1" aria-label="Increase quantity">${icon("plus")}</button>
        </div>
      </div>
    </div>` : "";
  const action = buyable(p)
    ? `<button type="button" class="btn-maison btn-cart pdp-add" data-add-to-bag="${esc(p.id)}" data-size="${esc(sz.key)}" data-qty-source="#pdpQty" data-add-from="[data-hero-img]"><span>Add to Cart</span></button>`
    : `<button type="button" class="btn-maison pdp-add" data-notify="${esc(p.id)}"><span>Notify me</span></button>`;
  return `
    <div class="pdp-buy" data-buy>
      <div class="pdp-brandrow">
        ${isCombo(p) ? `<a class="t-label pdp-brand" href="combos.html">${esc(brandNameOf(p, getBrand))} · Combo</a>`
          : brand ? `<a class="t-label pdp-brand" href="${brandURL(brand.id)}">${esc(brand.name)}</a>` : "<span></span>"}
        <div class="pdp-brandrow-end">
          ${p.comingSoon ? "" : `<span data-rating-slot>${ratingBadgeHTML(p)}</span>`}
          ${shareButtonHTML()}
        </div>
      </div>
      <h1 class="t-h3 pdp-name">${esc(p.fullName)}</h1>
      <div class="pdp-priceblock">${price}</div>
      <p class="pdp-benefit">${esc(p.benefit)}${p.forWho ? `. ${esc(p.forWho)}` : ""}.</p>
      ${choices}
      <div class="pdp-actions">
        ${action}
        ${wishButtonHTML(p, "pdp-wish")}
      </div>
      <!-- TODO(client): confirm all three assurances -->
      <ul class="pdp-assure">
        ${p.comingSoon ? "" : `<li>${icon("truck")}<span>Free delivery over ${formatPrice(d.freeOver)}</span></li>`}
        ${d.cod && !p.comingSoon ? `<li>${icon("package-check")}<span>Cash on delivery available</span></li>` : ""}
        <li>${icon("shield-check")}<span>Authentic, traceable product</span></li>
      </ul>
    </div>`;
}

/* ==========================================================================
   Sections below the top area
   ========================================================================== */

/** Update 03b: right under the buy box on a combo — each piece, what it's worth, and what you pay. */
function comboHTML(p) {
  return `
    <section class="section pdp-combo" aria-labelledby="combo-title">
      <div class="wrap">
        <h2 id="combo-title" class="t-h3">What’s in the combo</h2>
        <ul class="combo-items">
          ${comboItems(p).map(({ product: x, qty }) => {
            const img = x.images.card || x.images.hero;
            const [w, h] = imageSize(img);
            return `
          <li class="combo-item">
            <a class="combo-link" href="${productURL(x.id)}">
              <span class="combo-thumb"><img src="${esc(img)}" alt="" width="${w}" height="${h}" loading="lazy" decoding="async"></span>
              <span class="combo-info">
                <span class="t-label combo-brand">${esc(brandNameOf(x, getBrand))}</span>
                <span class="combo-name">${qty > 1 ? `${qty} × ` : ""}${esc(x.name)}</span>
                ${x.size && x.size !== "TBC" ? `<span class="coords combo-size">${esc(x.size)}</span>` : ""}
                ${CONFIG.showPrices ? `<span class="combo-worth">Worth ${formatPrice(x.price * qty)}</span>` : ""}
              </span>
            </a>
          </li>`;
          }).join("")}
        </ul>
        ${CONFIG.showPrices ? `<p class="combo-total">Worth <span class="combo-total-worth">${formatPrice(comboWorth(p))}</span> · You pay <strong>${formatPrice(p.price)}</strong></p>` : ""}
      </div>
    </section>`;
}

/** How to Use steps: 01, 02, 03 with an icon each. */
const stepsHTML = (steps) => `<ol class="howto">${steps.map((step, i) => `
  <li class="howto-step"><span class="howto-n">${String(i + 1).padStart(2, "0")}</span><span class="howto-ico">${icon(STEP_ICONS[Math.min(i, STEP_ICONS.length - 1)])}</span><p>${esc(step)}</p></li>`).join("")}</ol>`;

/** A small icon per How to Use step: apply, work in, done. */
const STEP_ICONS = ["droplet", "sparkles", "check"];

/** A combo's spec table: Contents, Pieces, Sizes, Brands, Country of origin (from its pieces). */
function comboDetails(p) {
  const pieces = piecesOf(p);
  const detail = (x, key) => clean((x.details || []).find(([k]) => k === key)?.[1] || "");
  const made = unique(pieces.map((x) => detail(x, "Country of origin")).filter((v) => v !== "To be confirmed"));
  return [
    ["Contents", comboItems(p).map(({ product: x, qty }) => `${qty > 1 ? `${qty} × ` : ""}${x.fullName}`).join(" + ")],
    ["Pieces", String(comboItems(p).reduce((n, it) => n + it.qty, 0))],
    ["Sizes", pieces.map((x) => (x.size && x.size !== "TBC" ? x.size : "To be confirmed")).join(" + ")],
    ["Brands", unique(pieces.map((x) => brandNameOf(x, getBrand))).join(", ")],
    ["Country of origin", made.join(" / ") || "To be confirmed"],
  ];
}

function tabsHTML(p) {
  const isSet = isCombo(p);
  const details = (isSet ? comboDetails(p) : p.details || []).map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td${/TODO\(client\)/.test(v) ? ' class="is-tbc"' : ""}>${esc(clean(v))}</td></tr>`).join("");
  const notes = p.notes ? `
    <div class="notes">
      ${[["top", "Top"], ["heart", "Heart"], ["base", "Base"]].map(([k, label]) => `
        <div class="note"><h4>${label} notes</h4><p>${(p.notes[k] || []).map(esc).join(", ")}</p></div>`).join("")}
    </div>` : "";
  const dayline = p.longevityHours ? (() => {
    const end = 8 + p.longevityHours;
    return `
      <div class="dayline" data-dayline>
        <p class="dayline-label">Lasts up to ${p.longevityHours} hours: spray at eight, still there at ${end > 12 ? end - 12 : end}.</p>
        <div class="dayline-bar" role="img" aria-label="A day from 8:00 to ${end}:00, filled for ${p.longevityHours} hours"><span></span></div>
        <div class="dayline-ticks coords" aria-hidden="true"><span>8:00</span><span>13:00</span><span>${end}:00</span></div>
      </div>`;
  })() : "";
  const ingredients = p.keyIngredients?.length ? `<p class="desc-sub t-label">Key ingredients</p><p>${p.keyIngredients.map(esc).join(" · ")}</p>` : "";
  // A combo's features: its pieces' features combined (no repeats), at most six.
  const featureList = isSet
    ? piecesOf(p).flatMap((x) => x.features || []).filter((f, i, all) => all.findIndex((g) => g.title === f.title) === i).slice(0, 6)
    : p.features || [];
  const features = featureList.length
    ? `<ul class="features">${featureList.map((f) => `
        <li class="feature"><span class="feature-ico">${icon(f.icon)}</span><h4>${esc(f.title)}</h4><p>${esc(f.text)}</p></li>`).join("")}</ul>`
    : `<p class="tab-empty">Its features are revealed with its name.</p>`;
  const tabs = [
    ["details", "Product Details", details ? `<table class="spec"><tbody>${details}</tbody></table>` : `<p class="tab-empty">Details arrive with the product.</p>`],
    ["how", "How to Use", isSet
      // A combo: each piece's steps, under the piece's name.
      ? piecesOf(p).filter((x) => x.howTo?.length).map((x) => `
          <div class="howto-group"><h3 class="howto-title">${esc(x.name)}</h3>${stepsHTML(x.howTo)}</div>`).join("")
      : p.howTo?.length ? stepsHTML(p.howTo) : `<p class="tab-empty">How to use it arrives with the product.</p>`],
    ["desc", "Product Description", `
      <div class="desc">
        <div class="desc-text">
          <p>${esc(p.description || p.whatItDoes || p.benefit)}</p>
          ${isSet ? "" : `${p.inside ? `<p>${esc(p.inside)}</p>` : ""}
          ${ingredients}
          ${notes}${dayline}`}
        </div>
      </div>`],
    ["features", "Special Features", features],
  ];
  return `
    <section class="section pdp-tabs" data-tabs aria-label="Product information">
      <div class="wrap">
        <div class="tablist" role="tablist" aria-label="Product information">
          ${tabs.map(([k, label], i) => `<button type="button" role="tab" class="tab" id="tab-${k}" aria-controls="panel-${k}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${label}${i === 0 ? '<span class="tab-bar" data-tab-bar></span>' : ""}</button>`).join("")}
        </div>
        ${tabs.map(([k, , body], i) => `<div class="tabpanel" role="tabpanel" id="panel-${k}" aria-labelledby="tab-${k}" tabindex="0"${i ? " hidden" : ""}>${body}</div>`).join("")}
      </div>
    </section>`;
}

/** A combo: every piece's origin, listed, with the routes on one map (only pieces that have an origin). */
function comboOriginHTML(p) {
  const origins = originsOf(p);
  if (!origins.length) return "";
  const arrival = ORIGINS[ARRIVAL_ORIGIN_ID].name;
  return `
    <section class="section pdp-origin" aria-labelledby="origin-title">
      <div class="wrap pdp-origin-inner">
        <div class="pdp-origin-copy">
          <p class="t-label">Where it’s from</p>
          <h2 id="origin-title" class="t-h2">${origins.map((o) => esc(ORIGINS[o].name)).join(" and ")}.</h2>
          <ul class="combo-origins">
            ${origins.map((o) => {
              const origin = ORIGINS[o];
              const from = piecesOf(p).filter((x) => x.originId === o);
              return `
            <li>
              <p class="combo-origin-pieces">${from.map((x) => esc(x.name)).join(", ")}</p>
              <p class="coords">${esc(origin.name)} · ${formatCoords(origin.lat, origin.lon)}${origin.altitude ? ` · ${esc(origin.altitude)}` : ""} → ${esc(arrival)}</p>
            </li>`;
            }).join("")}
          </ul>
        </div>
        <div class="mini-map map-stage" data-mini-map role="img" aria-label="Map of the routes from ${origins.map((o) => esc(ORIGINS[o].name)).join(" and ")} to ${esc(arrival)}"></div>
      </div>
    </section>`;
}

function originHTML(p) {
  if (isCombo(p)) return comboOriginHTML(p);
  const origin = p.originId && ORIGINS[p.originId];
  if (!origin) return "";
  const batch = batchFor(p);
  const link = batch
    ? `<a class="btn-line" href="origin.html?batch=${encodeURIComponent(batch)}">${icon("map-pin")}<span>Trace your origin</span></a>`
    : `<a class="btn-line" href="${brandURL(p.brand)}#origin">${icon("map-pin")}<span>See the origin</span></a>`;
  return `
    <section class="section pdp-origin" aria-labelledby="origin-title">
      <div class="wrap pdp-origin-inner">
        <div class="pdp-origin-copy">
          <p class="t-label">Where it’s from</p>
          <h2 id="origin-title" class="t-h2">${esc(origin.name)}.</h2>
          <p class="coords">${formatCoords(origin.lat, origin.lon)}${origin.altitude ? ` · ${esc(origin.altitude)}` : ""} → ${esc(ORIGINS[ARRIVAL_ORIGIN_ID].name)}</p>
          <p>${esc(origin.text || "")}</p>
          ${link}
        </div>
        <div class="mini-map map-stage" data-mini-map role="img" aria-label="Map of the route from ${esc(origin.name)} to ${esc(ORIGINS[ARRIVAL_ORIGIN_ID].name)}"></div>
      </div>
    </section>`;
}

function ritualHTML(p) {
  // Update 03b: the combos holding this piece come first (on a combo: the other combos), then the other pieces.
  const sets = isCombo(p) ? COMBOS.filter((c) => c.id !== p.id) : combosWith(p.id);
  const others = [...sets, ...PRODUCTS.filter((o) => o.id !== p.id && !isCombo(o))].slice(0, 8);
  return `
    <section class="section ritual" aria-labelledby="ritual-title">
      <div class="wrap">
        <h2 id="ritual-title" class="t-h2" data-split>Complete the ritual.</h2>
        <div class="card-grid ritual-cards" style="--n:${Math.min(4, others.length)}">
          ${others.map((o) => cardHTML(o, { headingLevel: 3 })).join("")}
        </div>
      </div>
    </section>`;
}

/* ==========================================================================
   Page
   ========================================================================== */

function renderProduct(p) {
  const pre = $("[data-lcp-img]", root);   // the main image already in the HTML (Update 04): keep that element
  root.innerHTML = `
    <article class="pdp wrap">
      <nav class="crumbs" aria-label="Breadcrumb">
        <ol>
          <li><a class="link-draw" href="shop.html">Shop</a></li>
          ${combo ? `<li><a class="link-draw" href="combos.html">Combos</a></li>`
            : brand ? `<li><a class="link-draw" href="${brandURL(brand.id)}">${esc(brand.name)}</a></li>` : ""}
          <li aria-current="page">${esc(p.name)}</li>
        </ol>
      </nav>
      <div class="pdp-top">
        ${galleryHTML(p)}
        ${buyHTML(p)}
      </div>
    </article>
    <div class="pdp-below" data-pdp-below></div>`;
  const hero = $("[data-hero-img]", root);
  if (pre && hero && pre.getAttribute("src") === hero.getAttribute("src")) {
    [...hero.attributes].forEach((a) => pre.setAttribute(a.name, a.value));
    pre.removeAttribute("data-lcp-img");
    hero.replaceWith(pre);                  // same element, same decoded image: no second paint
  }

  // Title, description, JSON-LD. No aggregateRating: the ratings are samples in the preview.
  document.title = `${p.name} | Jiai Life`;
  $('meta[name="description"]')?.setAttribute("content", `${p.fullName}. ${p.benefit}. ${p.whatItDoes || ""}`.trim());
  $('meta[property="og:title"]')?.setAttribute("content", document.title);
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.fullName,
    sku: p.id,
    description: p.description || p.whatItDoes || p.benefit,
    image: photos(p).slice(0, 3).map((g) => new URL(g.src, location.href).href),
    brand: { "@type": "Brand", name: brand?.name || "Jiai Life" },
    ...(p.size && p.size !== "TBC" ? { size: p.size } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: CONFIG.currency,
      price: p.price, // TODO(client): placeholder prices
      availability: p.comingSoon ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
      url: location.href,
    },
  });
  document.head.appendChild(ld);

  // Sticky buy bar
  const bar = $("[data-buybar]");
  if (bar) {
    $("[data-buybar-name]", bar).textContent = p.name;
    $("[data-buybar-price]", bar).textContent = p.comingSoon ? "Arrives soon" : CONFIG.showPrices ? formatPrice(sizeNow().price) : "Price at launch";
    const btn = $("[data-buybar-add]", bar);
    btn.classList.add("btn-cart");
    if (buyable(p)) {
      btn.dataset.addToBag = p.id;
      btn.dataset.size = sizeNow().key;
      btn.dataset.qtySource = "#pdpQty";
      btn.dataset.addFrom = "[data-hero-img]";
    } else {
      btn.dataset.notify = p.id;
      $("span", btn).textContent = "Notify me";
    }
    bar.hidden = false;
    document.body.classList.add("has-buybar");
  }
}

function renderMissing() {
  document.title = "Everything we make | Jiai Life";
  root.innerHTML = `
    <section class="section wrap pdp-missing" aria-labelledby="missing-title">
      <h1 id="missing-title" class="t-h2">That product isn’t here. Here’s everything we make.</h1>
      <div class="card-grid">${PRODUCTS.map((o) => cardHTML(o)).join("")}</div>
    </section>`;
}

let belowReady = Promise.resolve();
if (product) renderProduct(product); else renderMissing();

/* ==========================================================================
   Behaviour
   ========================================================================== */

if (product) {
  const p = product;
  /* ---- gallery: rail, stage (phone carousel), 360° tile, lightbox. Re-run when the size changes it. ---- */
  const G = { active: 0, spin: null, track: null, onResize: () => {} };
  addEventListener("resize", () => G.onResize());

  function initGallery() {
    const gallery = $("[data-gallery]");
    const track = $("[data-track]", gallery);
    const slides = $$("[data-slide]", track);
    const thumbsList = $("[data-thumbs]", gallery);
    G.active = 0; G.spin = null; G.track = track;
    const smooth = () => (reducedMotion() ? "auto" : "smooth");
    const go = (i, { behavior = smooth() } = {}) => {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior });
      setActive(i);
    };

    function setActive(i) {
      if (i === G.active && track.dataset.ready) return;
      G.active = i;
      track.dataset.ready = "1";
      // Only the slide on show is in the tab order (the others sit off-stage, under the buy box).
      slides.forEach((sl, k) => { sl.inert = k !== i; });
      $$("[data-go]", gallery).forEach((b) => {
        const on = Number(b.dataset.go) === i;
        b.classList.toggle("is-active", on);
        if (on) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
      });
      // Keep the active thumbnail in view inside the rail only (never scroll the page).
      const t = $(`.pdp-thumb[data-go="${i}"]`, thumbsList);
      if (t) {
        const vertical = thumbsList.scrollHeight > thumbsList.clientHeight + 1;
        if (vertical) {
          const top = t.offsetTop - thumbsList.offsetTop;
          if (top < thumbsList.scrollTop || top + t.offsetHeight > thumbsList.scrollTop + thumbsList.clientHeight) thumbsList.scrollTop = top;
        } else {
          const left = t.offsetLeft - thumbsList.offsetLeft;
          if (left < thumbsList.scrollLeft || left + t.offsetWidth > thumbsList.scrollLeft + thumbsList.clientWidth) thumbsList.scrollLeft = left - 8;
        }
      }
      if (slides[i]?.classList.contains("pdp-slide--360")) start360();
    }

    // 360° tile: the main stage becomes a drag-to-turn canvas on the HD frames (loaded only now).
    function start360() {
      if (G.spin || !p.spin) return;
      const slide = $(".pdp-slide--360", track);
      const canvas = $("[data-360]", slide);
      const hd = p.spinHD || p.spin;
      const spin = G.spin = createSpin(canvas, { path: hd.path, frames: hd.frames, mode: "drag" });
      spin.showFirst().then(() => slide.classList.add("is-drawn"));
      spin.load();
      let acc = 0;
      canvas.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaX) < Math.abs(e.deltaY) && !e.shiftKey) return; // vertical wheel scrolls the page
        e.preventDefault();
        acc += e.deltaX || e.deltaY;
        const steps = Math.trunc(acc / 40);
        if (steps) { spin.setFrame(spin.frame + steps); acc -= steps * 40; }
      }, { passive: false });
    }

    // Thumbnails, dots
    gallery.addEventListener("click", (e) => {
      const t = e.target.closest("[data-go]");
      if (t) { go(Number(t.dataset.go)); return; }
      const r = e.target.closest("[data-rail]");
      if (r) thumbsList.scrollBy({ top: Number(r.dataset.rail) * 88, behavior: smooth() });
      const open = e.target.closest("[data-open]");
      if (open) openLightbox({ items: photos(p), index: Number(open.dataset.open), from: $("img", open) });
    });
    // Swipes (phones) and keyboard scrolling of the track keep the thumbnails/dots in step.
    let raf = 0;
    track.addEventListener("scroll", () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
        if (i !== G.active) setActive(i);
      });
    }, { passive: true });
    G.onResize = () => track.scrollTo({ left: G.active * track.clientWidth });
    setActive(0);
    nameForTransition($("[data-hero-img]"));   // the card's image glides into this one (view transitions)
  }
  initGallery();

  // Quantity stepper
  let delivery = null;
  const qty = $("#pdpQty");
  const clampQty = () => { if (qty) qty.value = Math.min(10, Math.max(1, parseInt(qty.value, 10) || 1)); };
  root.addEventListener("click", (e) => {
    const step = e.target.closest("[data-qty]");
    if (!step || !qty) return;
    qty.value = Math.min(10, Math.max(1, (parseInt(qty.value, 10) || 1) + Number(step.dataset.qty)));
    delivery?.refresh();
  });
  qty?.addEventListener("change", () => { clampQty(); delivery?.refresh(); });

  // Share
  initShare(root, { title: p.fullName, text: `${p.fullName}: ${p.benefit}.` });

  // The sections below the top area render after the first paint, so the gallery and the
  // buy box (the page's first screen and its LCP) are never held up by them.
  belowReady = afterPaint().then(() => {
    $("[data-pdp-below]").innerHTML = `
      ${combo ? comboHTML(p) : ""}
      ${p.comingSoon ? "" : deliveryHTML()}
      ${tabsHTML(p)}
      ${originHTML(p)}
      ${reviewsSectionHTML(p)}
      ${ritualHTML(p)}`;
    initBelow();
  });

  function initBelow() {
    // Delivery Options: "free delivery" is judged on the order this piece would make.
    const dlRoot = $(".pdp-delivery");
    delivery = dlRoot && initDelivery(dlRoot, {
      orderValue: () => bagSubtotal() + (bagHas(p.id, size) ? 0 : sizeNow().price * (parseInt(qty?.value, 10) || 1)),
    });
    document.addEventListener("bag:change", () => delivery?.refresh());

    // Tabs, reviews
    initTabs($("[data-tabs]"));
    initReviews(p, $("#reviews"));
    document.addEventListener("reviews:change", () => {
      const slot = $("[data-rating-slot]");
      if (slot) slot.innerHTML = ratingBadgeHTML(p);
    });

    // Where it's from: the mini tilted map, built when it nears the screen.
    const mini = $("[data-mini-map]");
    if (mini && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        createMap3d(mini, routeFor(p)).then((map) =>
          map.finalState({ tilt: reducedMotion() ? 0 : 42, rotZ: reducedMotion() ? 0 : -4 }));
      }, { rootMargin: "50% 0px" });
      io.observe(mini);
    }
  }
}

/* ==========================================================================
   Motion
   ========================================================================== */

// Content is already rendered (the module is async); motion starts once the CDN scripts are in.
whenScriptsReady().then(() => belowReady).then(afterPaint).then(() => initMotion((c, ctx) => {
  const cleanups = [];
  if (!product) return () => {};

  if (!c.reduce) {
    $$("[data-split]", root).forEach((el) => splitLines(el, { ctx }));
    // The 10-hour line fills when its tab is shown and in view
    const dayline = $("[data-dayline]");
    if (dayline) {
      const fill = () => gsap.fromTo($(".dayline-bar span", dayline), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power2.inOut" });
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fill(); } });
      io.observe(dayline);
      cleanups.push(() => io.disconnect());
    }
  }

  // The sticky bar shows once the buy box has left the screen (desktop); always on phones.
  const bar = $("[data-buybar]");
  const buy = $("[data-buy]");
  if (bar && buy) {
    const st = window.ScrollTrigger
      ? ScrollTrigger.create({
          trigger: buy, start: "bottom top", end: "max",
          onToggle: (self) => bar.classList.toggle("is-shown", !c.isDesktop || self.isActive),
        })
      : null;
    bar.classList.toggle("is-shown", !c.isDesktop || !!st?.isActive);
    cleanups.push(() => st?.kill());
  }
  return () => cleanups.forEach((fn) => fn());
}));
