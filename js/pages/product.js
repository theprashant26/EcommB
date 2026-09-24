/* ==========================================================================
   Product page (product.html?id=…) — §9.1
   Sticky gallery · story column · price after story · sticky buy bar ·
   360° viewer · "Complete the ritual" · JSON-LD Product.
   Everything renders from js/data; an unknown id shows the whole range.
   ========================================================================== */

import { initHeader } from "../core/header.js";
import { initBag } from "../core/bag.js";
import { initSearch } from "../core/search.js";
import { initMotion, splitLines, getSmoother, whenScriptsReady, afterPaint } from "../core/motion.js";
import { createDepth } from "../core/depth.js";
import { createSpin } from "../core/spin.js";
import { createMap3d } from "../core/map3d.js";
import { cardHTML, initCards } from "../core/cards.js";
import { CONFIG } from "../data/config.js";
import { PRODUCTS, getProduct } from "../data/products.js";
import { getBrand, brandURL } from "../data/brands.js";
import { ORIGINS, BATCHES, ARRIVAL_ORIGIN_ID } from "../data/origins.js";
import { esc, formatPrice, formatCoords, imageSize, reducedMotion, $, $$ } from "../core/format.js";
import { toast } from "../core/toast.js";

initHeader();
initBag();
initSearch();

const root = $("[data-pdp]");
const id = new URLSearchParams(location.search).get("id");
const product = id && getProduct(id);
const brand = product && getBrand(product.brand);

/* ==========================================================================
   Render
   ========================================================================== */

const img = (src, alt, { eager = false, cls = "" } = {}) => {
  const [w, h] = imageSize(src);
  return `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" width="${w}" height="${h}" decoding="async"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}>`;
};

const priceText = (p) => (p.comingSoon ? "Arrives soon" : CONFIG.showPrices ? formatPrice(p.price) : "Price at launch");
const buyable = (p) => !p.comingSoon && CONFIG.showPrices;
const batchFor = (p) => Object.entries(BATCHES).find(([, b]) => b.productId === p.id)?.[0];
/** Routes on the mini map: the product's origin → New Delhi. */
const ROUTE_OF = { "leh-ladakh": { routes: ["leh"], pins: ["leh", "delhi"] }, paris: { routes: ["paris"], pins: ["paris", "delhi"] } };

function gallery(p) {
  const shots = [
    { src: p.images.hero, alt: `${p.fullName}` },
    p.images.angle && { src: p.images.angle, alt: `${p.fullName}, seen at an angle` },
    p.images.back && { src: p.images.back, alt: `${p.fullName}, the back label with the code that traces its origin` },
    p.images.campaign && { src: p.images.campaign, alt: `${p.fullName}, campaign image`, campaign: true },
  ].filter(Boolean);
  return shots.map((s, i) => `
    <figure class="pdp-shot${s.campaign ? " pdp-shot--campaign" : ""}${i === 0 ? " pdp-shot--first" : ""}">
      <span class="pdp-shot-inner"${i === 0 ? " data-pdp-hero-wrap" : ""}>
        ${img(s.src, s.alt, { eager: i === 0, cls: i === 0 ? "pdp-hero-img" : "" })}
      </span>
      ${i === 0 && p.spin ? `<button type="button" class="pdp-360" data-bs-toggle="modal" data-bs-target="#viewer360" aria-label="Turn ${esc(p.fullName)} through 360 degrees">360°</button>` : ""}
    </figure>`).join("");
}

function accordion(p) {
  const origin = p.originId && ORIGINS[p.originId];
  const items = [];

  items.push(["what", "What it does", `<p>${esc(p.whatItDoes || p.benefit)}</p>`]);

  let inside = "";
  if (p.inside) {
    inside = `<p>${esc(p.inside)}</p>`;
    if (p.keyIngredient) {
      inside += `
        <div class="pdp-ingredient">
          <div class="pdp-branch" data-branch aria-hidden="true"></div>
          <p><span class="pdp-ingredient-name">${esc(p.keyIngredient)}</span>
          ${origin?.ingredient ? `<span class="coords">${esc(origin.ingredient)}${origin.season ? `, harvested ${esc(origin.season.toLowerCase())}` : ""}</span>` : ""}</p>
        </div>`;
    }
  }
  if (p.notes) {
    inside += `
      <div class="notes">
        ${[["top", "Top"], ["heart", "Heart"], ["base", "Base"]].map(([k, label]) => `
          <div class="note"><h3>${label}</h3><ul>${(p.notes[k] || []).map((n) => `<li>${esc(n)}</li>`).join("")}</ul></div>`).join("")}
      </div>`;
  }
  if (p.longevityHours) {
    const end = 8 + p.longevityHours;
    inside += `
      <div class="dayline" data-dayline style="--hours:${p.longevityHours}">
        <p class="dayline-label">Lasts up to ${p.longevityHours} hours: spray at eight, still there at ${end > 12 ? end - 12 : end}.</p>
        <div class="dayline-bar" role="img" aria-label="A day from 8:00 to ${end}:00, filled for ${p.longevityHours} hours"><span></span></div>
        <div class="dayline-ticks coords" aria-hidden="true"><span>8:00</span><span>13:00</span><span>${end}:00</span></div>
      </div>`;
  }
  if (!inside && p.comingSoon) inside = "<p>The notes are revealed with its name.</p>";
  if (inside) items.push(["inside", "What’s inside", inside]);

  if (p.howTo?.length) {
    items.push(["how", "How to use", `<ol class="steps">${p.howTo.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`]);
  }

  if (origin) {
    const batch = batchFor(p);
    const link = batch
      ? `<a class="link-cta" href="origin.html?batch=${encodeURIComponent(batch)}">Trace your origin</a>`
      : `<a class="link-cta" href="${brandURL(p.brand)}">Discover ${esc(brand?.name || "")}</a>`;
    items.push(["origin", "Origin", `
      <div class="mini-map map-stage" data-mini-map role="img" aria-label="Map of the route from ${esc(origin.name)} to ${esc(ORIGINS[ARRIVAL_ORIGIN_ID].name)}"></div>
      <p class="coords">${esc(origin.name)}, ${formatCoords(origin.lat, origin.lon)}${origin.altitude ? `, ${esc(origin.altitude)}` : ""}</p>
      <p>${esc(origin.text || "")}</p>
      ${link}`]);
  }

  return `
    <div class="accordion pdp-acc" id="pdpAcc">
      ${items.map(([key, title, body], i) => `
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button${i ? " collapsed" : ""}" type="button" data-bs-toggle="collapse" data-bs-target="#acc-${key}" aria-expanded="${i === 0}" aria-controls="acc-${key}">${title}</button>
          </h2>
          <div id="acc-${key}" class="accordion-collapse collapse${i === 0 ? " show" : ""}" data-acc="${key}">
            <div class="accordion-body">${body}</div>
          </div>
        </div>`).join("")}
    </div>`;
}

function buyBlock(p) {
  const action = buyable(p)
    ? `<div class="pdp-qty">
         <label class="visually-hidden" for="pdpQty">Quantity</label>
         <div class="stepper" role="group" aria-label="Quantity">
           <button type="button" class="stepper-btn" data-qty="-1" aria-label="Decrease quantity"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8"/></svg></button>
           <input class="stepper-val stepper-input" id="pdpQty" type="number" inputmode="numeric" min="1" max="10" value="1">
           <button type="button" class="stepper-btn" data-qty="1" aria-label="Increase quantity"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8M6 2v8"/></svg></button>
         </div>
       </div>
       <button type="button" class="btn-maison pdp-add" data-add-to-bag="${esc(p.id)}" data-qty-source="#pdpQty" data-add-from=".pdp-hero-img"><span>Add to bag</span></button>`
    : `<button type="button" class="btn-maison pdp-add" data-notify><span>${p.comingSoon ? "Be the first to know" : "Notify me"}</span></button>`;
  return `
    <div class="pdp-buy" data-buy>
      <p class="pdp-price">${esc(priceText(p))}</p>
      <p class="pdp-size">${esc(p.size && p.size !== "TBC" ? p.size : "")}</p>
      <div class="pdp-actions">${action}</div>
      <p class="pdp-note">Free delivery across India on orders over ${formatPrice(CONFIG.freeShippingOver)}. Dispatched within two working days.</p>
    </div>`; /* TODO(client): delivery promise */
}

function renderProduct(p) {
  const origin = p.originId && ORIGINS[p.originId];
  const coords = brand?.coords || (origin ? formatCoords(origin.lat, origin.lon) : "");
  root.innerHTML = `
    <article class="pdp wrap" data-product-card>
      <div class="pdp-grid">
        <div class="pdp-gallery-col" data-gallery-col>
          <div class="pdp-gallery-frame" data-gallery-frame>
            <div class="pdp-gallery" data-gallery>${gallery(p)}</div>
          </div>
        </div>
        <div class="pdp-info" data-info>
          <nav class="crumbs" aria-label="Breadcrumb">
            <ol>
              <li><a class="link-draw" href="shop.html">Shop</a></li>
              ${brand ? `<li><a class="link-draw" href="${brandURL(brand.id)}">${esc(brand.name)}</a></li>` : ""}
              <li aria-current="page">${esc(p.name)}</li>
            </ol>
          </nav>
          <p class="pdp-brand">${brand ? `<a class="link-draw" href="${brandURL(brand.id)}">${esc(brand.name)}</a>` : ""}${coords ? ` <span class="coords">${esc(coords)}</span>` : ""}</p>
          <h1 class="pdp-name" data-split>${esc(p.comingSoon ? p.fullName : p.name)}</h1>
          <p class="pdp-benefit">${esc(p.benefit)}${p.forWho ? `. ${esc(p.forWho)}` : ""}.</p>
          ${CONFIG.pricePlacement === "top" ? `<p class="pdp-price pdp-price--top">${esc(priceText(p))}</p>` : ""}
          ${p.claims?.length ? `<ul class="pdp-claims">${p.claims.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
          ${accordion(p)}
          ${buyBlock(p)}
        </div>
      </div>
    </article>
    <section class="section ritual" aria-labelledby="ritual-title">
      <div class="wrap">
        <h2 id="ritual-title" data-split>Complete the ritual.</h2>
        <div class="ritual-grid" data-ritual style="--n:${Math.min(4, PRODUCTS.length - 1)}">
          ${PRODUCTS.filter((o) => o.id !== p.id).map((o) => cardHTML(o, { price: true, headingLevel: 3 })).join("")}
        </div>
      </div>
    </section>`;

  // Title, description, JSON-LD
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
    description: p.whatItDoes || p.benefit,
    image: [p.images.hero, p.images.angle, p.images.back].filter(Boolean).map((s) => new URL(s, location.href).href),
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

  // Sticky buy bar + 360° viewer label
  const bar = $("[data-buybar]");
  if (bar) {
    $("[data-buybar-name]", bar).textContent = p.name;
    $("[data-buybar-price]", bar).textContent = priceText(p);
    const btn = $("[data-buybar-add]", bar);
    if (buyable(p)) {
      btn.dataset.addToBag = p.id;
      btn.dataset.qtySource = "#pdpQty";
      btn.dataset.addFrom = ".pdp-hero-img";
    } else {
      btn.dataset.notify = "";
      $("span", btn).textContent = p.comingSoon ? "Be the first to know" : "Notify me";
    }
    bar.hidden = false;
    document.body.classList.add("has-buybar");
  }
  if (p.spin) $("#viewer360-title").textContent = `${p.fullName}, 360°`;
}

function renderMissing() {
  document.title = "Everything we make | Jiai Life";
  root.innerHTML = `
    <section class="section wrap pdp-missing" aria-labelledby="missing-title">
      <h1 id="missing-title" class="t-h2">That product isn’t here. Here’s everything we make.</h1>
      <div class="ritual-grid" data-ritual>${PRODUCTS.map((o) => cardHTML(o, { price: true })).join("")}</div>
    </section>`;
}

if (product) renderProduct(product); else renderMissing();

/* ==========================================================================
   Behaviour (not motion)
   ========================================================================== */

// Quantity stepper
root.addEventListener("click", (e) => {
  const step = e.target.closest("[data-qty]");
  if (!step) return;
  const input = $("#pdpQty");
  input.value = Math.min(10, Math.max(1, (parseInt(input.value, 10) || 1) + Number(step.dataset.qty)));
});
root.addEventListener("change", (e) => {
  if (e.target.id !== "pdpQty") return;
  e.target.value = Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1));
});

// Notify me / be the first to know → the letters form in the footer
document.addEventListener("click", (e) => {
  if (!e.target.closest("[data-notify]")) return;
  const input = $("#footer-email");
  const smoother = getSmoother();
  if (smoother) smoother.scrollTo(".site-footer", true, "top 20%"); else $(".site-footer").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => input?.focus({ preventScroll: true }), 900);
  toast("Leave your email and we’ll write when it arrives.");
});

// Origin mini map: built the first time its accordion item opens (it has no size while collapsed)
let miniMap;
document.addEventListener("shown.bs.collapse", (e) => {
  if (e.target.dataset.acc === "origin" && !miniMap && product) {
    const route = ROUTE_OF[product.originId] || { routes: [], pins: [] };
    miniMap = createMap3d($("[data-mini-map]"), route).then((map) => {
      map.finalState({ tilt: reducedMotion() ? 0 : 40, rotZ: reducedMotion() ? 0 : -4 });
      return map;
    });
  }
  window.ScrollTrigger?.refresh();
});
document.addEventListener("hidden.bs.collapse", () => window.ScrollTrigger?.refresh());

// Sea-buckthorn illustration for One Origin "What's inside"
const branchHost = $("[data-branch]");
if (branchHost) {
  fetch("assets/illustrations/sea-buckthorn.svg").then((r) => r.text()).then((svg) => {
    branchHost.innerHTML = svg;
    const el = $("svg", branchHost);
    el.removeAttribute("role"); el.removeAttribute("aria-label");
    el.setAttribute("aria-hidden", "true"); el.setAttribute("focusable", "false");
    branchHost.dispatchEvent(new CustomEvent("branch:ready", { bubbles: true }));
  }).catch(() => {});
}

/* ---------- 360° viewer (tubes): drag, scroll wheel, arrow keys by 10° ---------- */

const viewer = $("#viewer360");
if (viewer && product?.spin) {
  const canvas = $("[data-viewer-canvas]", viewer);
  const deg = $("[data-viewer-deg]", viewer);
  const bar = $("[data-viewer-load]", viewer);
  canvas.setAttribute("aria-label", `${product.fullName} turning 360 degrees`);
  let spin;
  viewer.addEventListener("shown.bs.modal", () => {
    if (!spin) {
      spin = createSpin(canvas, {
        path: product.spin.path, frames: product.spin.frames, mode: "drag",
        onFrame: (f) => { deg.textContent = `${f * 10}°`; },
      });
      spin.showFirst();
      viewer.classList.add("is-loading");
      spin.load((p) => bar.style.setProperty("--p", p.toFixed(3))).then(() => viewer.classList.remove("is-loading"));
      let acc = 0;
      canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        acc += e.deltaY;
        const steps = Math.trunc(acc / 40);
        if (steps) { spin.setFrame(spin.frame + steps); acc -= steps * 40; }
      }, { passive: false });
    }
    spin.redraw();
    canvas.focus();
  });
}

/* ==========================================================================
   Motion
   ========================================================================== */

// Content is already rendered (the module is async); motion starts once the CDN scripts are in.
whenScriptsReady().then(afterPaint).then(() => initMotion((c, ctx) => {
  const cleanups = [];
  const cards = initCards(root);
  cleanups.push(cards.destroy);

  if (!product) return () => cleanups.forEach((fn) => fn());

  // Perfumes: pointer-follow tilt (max 5°) on the first image instead of a 360° turn
  if (!product.spin && c.isDesktop) {
    const wrap = $("[data-pdp-hero-wrap]");
    const d = createDepth(wrap.closest(".pdp-shot"), [], { rotate: 5, rotateEl: wrap });
    cleanups.push(d.destroy);
  }

  if (!c.reduce) {
    $$("[data-split]", root).forEach((el) => splitLines(el, { ctx }));

    // Sticky gallery: pinned while the story scrolls; its images move in step so the
    // last one arrives as the story ends.
    if (c.isDesktop) {
      const col = $("[data-gallery-col]");
      const frame = $("[data-gallery-frame]");
      const stack = $("[data-gallery]");
      const info = $("[data-info]");
      const distance = () => Math.max(0, info.offsetHeight - frame.offsetHeight);
      gsap.to(stack, {
        y: () => -Math.max(0, stack.scrollHeight - frame.offsetHeight),
        ease: "none",
        scrollTrigger: {
          trigger: col, start: () => `top ${topOffset()}`, end: () => `+=${distance()}`,
          pin: frame, pinSpacing: false, scrub: true, invalidateOnRefresh: true,
        },
      });
    }

    // The 10-hour line fills as it comes into view
    const dayline = $("[data-dayline]");
    if (dayline) {
      gsap.fromTo($(".dayline-bar span", dayline), { scaleX: 0 }, {
        scaleX: 1, duration: 1.6, ease: "power2.inOut",
        scrollTrigger: { trigger: dayline, start: "top 85%", once: true },
      });
    }

    // Sea-buckthorn grows in when it is seen
    const growBranch = () => {
      const svg = $("[data-branch] svg");
      if (!svg) return;
      ctx.add(() => {
        $$(".leaf", svg).forEach((leaf) => {
          const m = leaf.getAttribute("d").match(/M\s*([-\d.]+)[ ,]([-\d.]+)/);
          if (m) gsap.set(leaf, { svgOrigin: `${m[1]} ${m[2]}` });
        });
        gsap.timeline({ scrollTrigger: { trigger: svg, start: "top 90%", once: true } })
          .from($$("#branch path", svg), { drawSVG: "0%", duration: 1.2, stagger: 0.15, ease: "power2.inOut" })
          .from($$(".leaf", svg), { scale: 0, duration: 0.6, stagger: 0.015, ease: "power4.out" }, 0.4)
          .from($$(".berry", svg), { scale: 0, transformOrigin: "50% 50%", duration: 0.45, stagger: 0.05, ease: "power4.out" }, 0.95);
      });
    };
    if ($("[data-branch] svg")) growBranch();
    else document.addEventListener("branch:ready", growBranch, { once: true });
  }

  // Desktop: the buy bar appears once the buy block has scrolled past; phones: always.
  const bar = $("[data-buybar]");
  const buy = $("[data-buy]");
  if (bar && buy) {
    // Active from the moment the buy block has left the top of the screen to the end of the page.
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

function topOffset() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) + 24 || 100;
}

