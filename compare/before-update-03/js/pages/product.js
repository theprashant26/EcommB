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
import { cardHTML } from "../core/cards.js";
import { openLightbox } from "../core/lightbox.js";
import { reviewsSectionHTML, initReviews, ratingFor } from "../core/reviews.js";
import { deliveryHTML, initDelivery } from "../core/delivery.js";
import { shareButtonHTML, initShare } from "../core/share.js";
import { initTabs } from "../core/tabs.js";
import { nameForTransition } from "../core/transitions.js";
import { CONFIG } from "../data/config.js";
import { PRODUCTS, getProduct } from "../data/products.js";
import { getBrand, brandURL } from "../data/brands.js";
import { ORIGINS, BATCHES, ARRIVAL_ORIGIN_ID } from "../data/origins.js";
import { esc, formatPrice, formatCoords, imageSize, icon, priceHTML, reducedMotion, $, $$ } from "../core/format.js";

initHeader();
initBag();
initSearch();
initWishlist();
initReveals();

const root = $("[data-pdp]");
const id = new URLSearchParams(location.search).get("id");
const product = id && getProduct(id);
const brand = product && getBrand(product.brand);

const buyable = (p) => !p.comingSoon && CONFIG.showPrices;
const batchFor = (p) => Object.entries(BATCHES).find(([, b]) => b.productId === p.id)?.[0];
/** Routes on the mini map: the product's origin → New Delhi. */
const ROUTE_OF = { "leh-ladakh": { routes: ["leh"], pins: ["leh", "delhi"] }, paris: { routes: ["paris"], pins: ["paris", "delhi"] } };
/** Values still waiting for the client read "To be confirmed" on the page (the TODO stays in the data). */
const clean = (v = "") => {
  if (!/TODO\(client\)/.test(v)) return v;
  const rest = v.replace(/\s*(—|:)?\s*TODO\(client\).*$/, "").trim();
  return rest ? `${rest} (details to be confirmed)` : "To be confirmed";
};

/* ==========================================================================
   Gallery
   ========================================================================== */

const galleryOf = (p) => (p.gallery?.length ? p.gallery : [{ src: p.images.hero, alt: p.fullName }]);
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

function buyHTML(p) {
  const r = ratingFor(p);
  const rating = r
    ? `<a class="pdp-rating" href="#reviews">${icon("star", "icon--filled")}<span>${r.average.toFixed(1)}</span><span class="pdp-rating-sep">·</span><span class="pdp-rating-n">${r.count} ratings</span></a>`
    : `<a class="pdp-rating" href="#reviews"><span class="pdp-rating-n">No ratings yet</span></a>`;
  const price = p.comingSoon
    ? `<p class="pdp-price"><span class="price">Arrives soon</span></p>`
    : `<p class="pdp-price">${priceHTML(p)}</p>${CONFIG.showPrices ? `<p class="pdp-tax">Inclusive of all taxes</p>` : ""}`;
  const d = CONFIG.delivery;
  const choices = buyable(p) ? `
    <div class="pdp-choices">
      ${p.size && p.size !== "TBC" ? `
      <div class="pdp-choice">
        <p class="t-label" id="sizeLabel">Size</p>
        <div class="pdp-sizes" role="radiogroup" aria-labelledby="sizeLabel">
          <button type="button" role="radio" class="size-chip" aria-checked="true">${esc(p.size)}</button>
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
    ? `<button type="button" class="btn-maison btn-cart pdp-add" data-add-to-bag="${esc(p.id)}" data-qty-source="#pdpQty" data-add-from="[data-hero-img]"><span>Add to Cart</span></button>`
    : `<button type="button" class="btn-maison pdp-add" data-notify="${esc(p.id)}"><span>Notify me</span></button>`;
  return `
    <div class="pdp-buy" data-buy>
      <div class="pdp-brandrow">
        ${brand ? `<a class="t-label pdp-brand" href="${brandURL(brand.id)}">${esc(brand.name)}</a>` : "<span></span>"}
        ${shareButtonHTML()}
      </div>
      <h1 class="t-h3 pdp-name">${esc(p.comingSoon ? p.fullName : p.fullName)}</h1>
      ${p.comingSoon ? "" : rating}
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

function tabsHTML(p) {
  const details = (p.details || []).map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td${/TODO\(client\)/.test(v) ? ' class="is-tbc"' : ""}>${esc(clean(v))}</td></tr>`).join("");
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
  const features = p.features?.length
    ? `<ul class="features">${p.features.map((f) => `
        <li class="feature"><span class="feature-ico">${icon(f.icon)}</span><h4>${esc(f.title)}</h4><p>${esc(f.text)}</p></li>`).join("")}</ul>`
    : `<p class="tab-empty">Its features are revealed with its name.</p>`;
  const tabs = [
    ["details", "Product Details", details ? `<table class="spec"><tbody>${details}</tbody></table>` : `<p class="tab-empty">Details arrive with the product.</p>`],
    ["desc", "Product Description", `
      <div class="desc">
        <div class="desc-text">
          <p>${esc(p.description || p.whatItDoes || p.benefit)}</p>
          ${p.inside ? `<p>${esc(p.inside)}</p>` : ""}
          ${ingredients}
          ${notes}${dayline}
        </div>
        ${p.howTo?.length ? `<div class="desc-how"><p class="desc-sub t-label">How to use</p><ol class="steps">${p.howTo.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>` : ""}
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

function originHTML(p) {
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
  const others = PRODUCTS.filter((o) => o.id !== p.id);
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
  root.innerHTML = `
    <article class="pdp wrap">
      <nav class="crumbs" aria-label="Breadcrumb">
        <ol>
          <li><a class="link-draw" href="shop.html">Shop</a></li>
          ${brand ? `<li><a class="link-draw" href="${brandURL(brand.id)}">${esc(brand.name)}</a></li>` : ""}
          <li aria-current="page">${esc(p.name)}</li>
        </ol>
      </nav>
      <div class="pdp-top">
        ${galleryHTML(p)}
        ${buyHTML(p)}
      </div>
    </article>
    <div class="pdp-below" data-pdp-below></div>`;

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
    $("[data-buybar-price]", bar).textContent = p.comingSoon ? "Arrives soon" : CONFIG.showPrices ? formatPrice(p.price) : "Price at launch";
    const btn = $("[data-buybar-add]", bar);
    btn.classList.add("btn-cart");
    if (buyable(p)) {
      btn.dataset.addToBag = p.id;
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
  const gallery = $("[data-gallery]");
  const track = $("[data-track]", gallery);
  const slides = $$("[data-slide]", track);
  const thumbsList = $("[data-thumbs]", gallery);
  let active = 0;
  let spin = null;

  const smooth = () => (reducedMotion() ? "auto" : "smooth");
  const go = (i, { behavior = smooth() } = {}) => {
    i = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({ left: i * track.clientWidth, behavior });
    setActive(i);
  };

  function setActive(i) {
    if (i === active && track.dataset.ready) return;
    active = i;
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
    if (spin || !p.spin) return;
    const slide = $(".pdp-slide--360", track);
    const canvas = $("[data-360]", slide);
    const hd = p.spinHD || p.spin;
    spin = createSpin(canvas, { path: hd.path, frames: hd.frames, mode: "drag" });
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
      if (i !== active) setActive(i);
    });
  }, { passive: true });
  addEventListener("resize", () => track.scrollTo({ left: active * track.clientWidth }));
  setActive(0);
  nameForTransition($("[data-hero-img]"));   // the card's image glides into this one (view transitions)

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
      orderValue: () => bagSubtotal() + (bagHas(p.id) ? 0 : p.price * (parseInt(qty?.value, 10) || 1)),
    });
    document.addEventListener("bag:change", () => delivery?.refresh());

    // Tabs, reviews
    initTabs($("[data-tabs]"));
    initReviews(p, $("#reviews"));
    document.addEventListener("reviews:change", () => {
      const r = ratingFor(p);
      const link = $(".pdp-rating");
      if (link && r) link.innerHTML = `${icon("star", "icon--filled")}<span>${r.average.toFixed(1)}</span><span class="pdp-rating-sep">·</span><span class="pdp-rating-n">${r.count} ratings</span>`;
    });

    // Where it's from: the mini tilted map, built when it nears the screen.
    const mini = $("[data-mini-map]");
    if (mini && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        createMap3d(mini, ROUTE_OF[p.originId] || { routes: [], pins: [] }).then((map) =>
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
