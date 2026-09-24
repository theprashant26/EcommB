/* ==========================================================================
   Brand page (brand.html?b=…) — §9.3
   Live brand: three-layer hero (porcelain field · giant name · lead product
   cutout) with pointer depth, then story, pieces (tilt cards) and an origin
   strip (slim tilted map with the brand's route).
   Coming / teaser brand: "Arriving soon" with the newsletter.
   Unknown id: the houses that are here.
   ========================================================================== */

import { initHeader } from "../core/header.js";
import { initBag } from "../core/bag.js";
import { initSearch } from "../core/search.js";
import { initMotion, splitLines, appear, whenScriptsReady, afterPaint } from "../core/motion.js";
import { createDepth } from "../core/depth.js";
import { createMap3d } from "../core/map3d.js";
import { cardHTML, initCards } from "../core/cards.js";
import { productsByBrand } from "../data/products.js";
import { getBrand, visibleBrands, brandURL } from "../data/brands.js";
import { ORIGINS, BATCHES, ARRIVAL_ORIGIN_ID } from "../data/origins.js";
import { esc, formatCoords, imageSize, $, $$ } from "../core/format.js";

initHeader();
initBag();
initSearch();

const root = $("[data-brand-page]");
const brand = getBrand(new URLSearchParams(location.search).get("b"));
const ROUTE_OF = { "leh-ladakh": { routes: ["leh"], pins: ["leh", "delhi"] }, paris: { routes: ["paris"], pins: ["paris", "delhi"] } };

const coordsOf = (b) => {
  const o = b.originId && ORIGINS[b.originId];
  return b.coords || (o ? formatCoords(o.lat, o.lon) : "");
};
const setMeta = (title, desc) => {
  document.title = `${title} | Jiai Life`;
  $('meta[property="og:title"]')?.setAttribute("content", document.title);
  if (desc) {
    $('meta[name="description"]')?.setAttribute("content", desc);
    $('meta[property="og:description"]')?.setAttribute("content", desc);
  }
};

/* ---------- live brand ---------- */

function renderLive(b) {
  const pieces = productsByBrand(b.id);
  const lead = pieces.find((p) => !p.comingSoon) || pieces[0];
  const leadImg = lead ? (lead.images.cutout || lead.images.hero) : "";
  const [w, h] = imageSize(leadImg);
  const origin = b.originId && ORIGINS[b.originId];
  const batch = Object.entries(BATCHES).find(([, x]) => x.originId === b.originId)?.[0];

  root.innerHTML = `
    <section class="bhero" aria-labelledby="bhero-title" style="--bhero-bg:${b.room?.bg || "var(--porcelain)"}">
      <div class="bhero-stage" data-bhero-stage>
        <div class="bhero-scene" data-bhero-scene>
          <div class="bhero-layer bhero-layer--field" aria-hidden="true"><div class="bhero-depth bhero-field"></div></div>
          <div class="bhero-layer bhero-layer--type">
            <div class="bhero-depth"><h1 id="bhero-title" class="t-giant bhero-name">${esc(b.name)}</h1></div>
          </div>
          ${lead ? `<div class="bhero-layer bhero-layer--front" aria-hidden="true">
            <div class="bhero-depth"><img class="bhero-img" src="${esc(leadImg)}" alt="" width="${w}" height="${h}" fetchpriority="high" decoding="async"></div>
          </div>` : ""}
        </div>
        <div class="wrap bhero-foot">
          ${b.line ? `<p class="t-tagline bhero-line">${esc(b.line)}.</p>` : ""}
          ${coordsOf(b) ? `<p class="coords">${esc(coordsOf(b))}</p>` : ""}
        </div>
      </div>
    </section>

    <section class="section bstory" aria-label="The story">
      <div class="wrap bstory-inner">
        <p class="coords">${esc(b.category || "")}${origin ? ` · ${esc(origin.name)}` : ""}</p>
        <p class="bstory-text">${esc(b.story || "")}</p>
      </div>
    </section>

    <section class="section bpieces" aria-labelledby="bpieces-title">
      <div class="wrap">
        <h2 id="bpieces-title" data-split>The pieces.</h2>
        <div class="ritual-grid" style="--n:${Math.min(4, Math.max(1, pieces.length))}">
          ${pieces.map((p) => cardHTML(p, { price: true })).join("")}
        </div>
      </div>
    </section>

    ${origin && ROUTE_OF[b.originId] ? `
    <section class="bmap" aria-labelledby="bmap-title">
      <div class="wrap bmap-head">
        <h2 id="bmap-title" data-split>Where it begins.</h2>
        <div class="bmap-copy">
          <p>${esc(origin.text || "")} <span class="coords">${esc(origin.name)}, ${formatCoords(origin.lat, origin.lon)} to ${esc(ORIGINS[ARRIVAL_ORIGIN_ID].name)}</span></p>
          ${batch ? `<a class="link-cta" href="origin.html?batch=${encodeURIComponent(batch)}">Trace a tube</a>` : ""}
        </div>
      </div>
      <div class="bmap-stage map-stage" data-bmap role="img" aria-label="Map of the route from ${esc(origin.name)} to ${esc(ORIGINS[ARRIVAL_ORIGIN_ID].name)}"></div>
    </section>` : ""}`;

  setMeta(b.name, b.story);
}

/* ---------- coming / teaser brand ---------- */

function renderComing(b) {
  const piece = productsByBrand(b.id)[0];
  const [w, h] = piece ? imageSize(piece.images.hero) : [0, 0];
  root.innerHTML = `
    <section class="bcoming wrap" aria-labelledby="bcoming-title">
      <div class="bcoming-copy">
        <p class="coords">${esc(b.category || "Coming to the house")}</p>
        <h1 id="bcoming-title" class="t-giant bcoming-name">${esc(b.name)}</h1>
        <p class="t-tagline bcoming-line">Arriving soon.</p>
        <p>${esc(b.line && b.status === "coming" ? `${b.line}. ` : "")}Leave your email and the first letter about it comes to you.</p>
        <form class="inline-form" data-newsletter novalidate>
          <label class="visually-hidden" for="coming-email">Email address</label>
          <input class="field" id="coming-email" type="email" name="email" autocomplete="email" placeholder="Email address" required>
          <button type="submit" class="btn-maison"><span>Be the first to know</span></button>
        </form>
      </div>
      ${piece ? `<div class="bcoming-media"><img src="${esc(piece.images.hero)}" alt="" width="${w}" height="${h}" fetchpriority="high" decoding="async"></div>` : ""}
    </section>`;
  setMeta(b.name, `${b.name}: arriving soon at Jiai Life.`);
}

/* ---------- unknown brand ---------- */

function renderUnknown() {
  root.innerHTML = `
    <section class="section wrap bunknown" aria-labelledby="bunknown-title">
      <h1 id="bunknown-title" class="t-h2">That house isn’t here. These are.</h1>
      <ul class="bunknown-list">
        ${visibleBrands().map((b) => `
          <li><a href="${brandURL(b.id)}"><span class="bunknown-name">${esc(b.name)}</span>
            <span class="coords">${esc(coordsOf(b) || b.line || b.category || "")}</span></a></li>`).join("")}
      </ul>
    </section>`;
  setMeta("Our brands", "The houses of Jiai Life.");
}

if (!brand) renderUnknown();
else if (brand.status === "live") renderLive(brand);
else renderComing(brand);

/* ---------- motion ---------- */

let mapPromise;
// Content is already rendered (async module); motion starts once the CDN scripts are in.
whenScriptsReady().then(afterPaint).then(() => initMotion((c, ctx) => {
  const cleanups = [];
  const cards = initCards(root);
  cleanups.push(cards.destroy);

  const stage = $("[data-bhero-stage]");
  if (stage && !c.reduce) {
    // Load: the name rises from its line mask (character-by-character is the home hero's alone),
    // the product settles in front of it.
    const name = $(".bhero-name", stage);
    if (window.SplitText) {
      const split = SplitText.create(name, { type: "lines", mask: "lines" });
      gsap.from(split.lines, { yPercent: 110, duration: 1, stagger: 0.08, ease: "power4.out", delay: 0.1 });
    }
    gsap.from(".bhero-img", { y: 30, scale: 0.97, opacity: 0, duration: 0.9, ease: "power4.out", delay: 0.35 });
    gsap.from(".bhero-foot > *", { y: 16, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power4.out", delay: 0.65 });
    if (c.isDesktop) {
      const depth = createDepth(stage, [
        { el: $(".bhero-layer--field .bhero-depth", stage), depth: 6 },
        { el: $(".bhero-layer--type .bhero-depth", stage), depth: 14 },
        { el: $(".bhero-layer--front .bhero-depth", stage), depth: 26 },
      ], { rotate: 2.5, rotateEl: $("[data-bhero-scene]", stage) });
      cleanups.push(depth.destroy);
    }
  }

  if (!c.reduce) {
    $$("[data-split]", root).forEach((el) => splitLines(el, { ctx }));
    appear(".bstory-text, .bmap-copy p");
  }

  // Origin strip: a slim tilted map; the route draws once as it arrives.
  const host = $("[data-bmap]");
  if (host && brand) {
    const route = ROUTE_OF[brand.originId];
    mapPromise ||= createMap3d(host, route);
    mapPromise.then((map) => ctx.add(() => {
      if (c.reduce) { map.finalState({ tilt: 0 }); return; }
      const tl = map.timeline({ tilt: c.isDesktop ? 55 : 40, rotZ: -5, scaleFrom: 1.06 });
      tl.pause();
      ScrollTrigger.create({ trigger: host, start: "top 75%", once: true, onEnter: () => tl.duration(2.4).play() });
    }));
  }

  return () => cleanups.forEach((fn) => fn());
}));
