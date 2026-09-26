/* ==========================================================================
   Brand page (brand.html?b=…) — §9.3, rebuilt in Update 02 §7.
   Hero: a clean split, no text over images. Left: the name (H1), the italic
   line, coordinates, a two-line story and "Shop now ↓". Right: the ivory
   stage with the CSS plinth and the brand's products (as in the home rooms).
   Then the pieces as product cards (3 / 2 / 2 columns) and the origin strip
   (the slim tilted map with the brand's route).
   Coming / teaser brand: the same split hero with "Arriving soon" and the
   newsletter. Unknown id: the houses that are here.
   ========================================================================== */

import { initHeader } from "../core/header.js";
import { initBag } from "../core/bag.js";
import { initWishlist } from "../core/wishlist.js";
import { initReveals } from "../core/reveal.js";
import { initSearch } from "../core/search.js";
import { initMotion, splitLines, appear, whenScriptsReady, afterPaint } from "../core/motion.js";
import { createMap3d } from "../core/map3d.js";
import { cardHTML } from "../core/cards.js";
import { plinthSetHTML } from "../core/plinth.js";
import { productsByBrand } from "../data/products.js";
import { getBrand, visibleBrands, brandURL } from "../data/brands.js";
import { ORIGINS, BATCHES, ARRIVAL_ORIGIN_ID } from "../data/origins.js";
import { esc, formatCoords, icon, $, $$ } from "../core/format.js";

initHeader();
initBag();
initSearch();
initWishlist();
initReveals();

const root = $("[data-brand-page]");
const brand = getBrand(new URLSearchParams(location.search).get("b"));
const ROUTE_OF = { "leh-ladakh": { routes: ["leh"], pins: ["leh", "delhi"] }, paris: { routes: ["paris"], pins: ["paris", "delhi"] } };

const coordsOf = (b) => {
  const o = b.originId && ORIGINS[b.originId];
  return b.coords || (o ? formatCoords(o.lat, o.lon) : "");
};
const firstSentence = (t = "") => t.split(/(?<=\.)\s/)[0];
const setMeta = (title, desc) => {
  document.title = `${title} | Jiai Life`;
  $('meta[property="og:title"]')?.setAttribute("content", document.title);
  if (desc) {
    $('meta[name="description"]')?.setAttribute("content", desc);
    $('meta[property="og:description"]')?.setAttribute("content", desc);
  }
};

/** The split hero, shared by live and coming brands. `action` is the call to action under the story. */
function heroHTML(b, { products, label, story, action }) {
  const coords = coordsOf(b);
  return `
    <section class="bhero" aria-labelledby="bhero-title">
      <div class="bhero-copy">
        ${label ? `<p class="t-label bhero-label">${esc(label)}</p>` : ""}
        <h1 id="bhero-title" class="t-h1 bhero-name">${esc(b.name)}</h1>
        ${b.line ? `<p class="t-tagline bhero-line">${esc(b.line)}.</p>` : ""}
        ${coords ? `<p class="coords bhero-coords">${esc(coords)}</p>` : ""}
        <p class="bhero-story">${esc(story)}</p>
        ${action}
      </div>
      <div class="bhero-stage room-stage warm-light">
        ${plinthSetHTML(products, { eager: true, fallback: b.name })}
      </div>
    </section>`;
}

/* ---------- live brand ---------- */

function renderLive(b) {
  const pieces = productsByBrand(b.id);
  const origin = b.originId && ORIGINS[b.originId];
  const batch = Object.entries(BATCHES).find(([, x]) => x.originId === b.originId)?.[0];

  root.innerHTML = heroHTML(b, {
    products: pieces,
    label: [b.category, origin?.name].filter(Boolean).join(" · "),
    story: b.roomStory || firstSentence(b.story),
    action: `<a class="btn-maison" href="#pieces"><span>Shop now ${icon("chevron-down")}</span></a>`,
  }) + `

    <section class="section bpieces" id="pieces" aria-labelledby="bpieces-title">
      <div class="wrap">
        <div class="sec-head">
          <h2 id="bpieces-title" data-split>The pieces.</h2>
          <p class="coords">${pieces.length} ${pieces.length === 1 ? "piece" : "pieces"}</p>
        </div>
        <div class="card-grid bpieces-grid">
          ${pieces.map((p) => cardHTML(p, { headingLevel: 3 })).join("")}
        </div>
      </div>
    </section>

    ${origin && ROUTE_OF[b.originId] ? `
    <section class="bmap" id="origin" aria-labelledby="bmap-title">
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
  root.innerHTML = heroHTML(b, {
    products: productsByBrand(b.id),
    label: b.status === "coming" ? `${b.category || "Coming to the house"} · Arriving soon` : "Coming to the house",
    story: "Its name, and its notes, arrive soon. Leave your email and the first letter about it comes to you.",
    action: `
      <form class="inline-form bhero-form" data-newsletter novalidate>
        <label class="visually-hidden" for="coming-email">Email address</label>
        <input class="field" id="coming-email" type="email" name="email" autocomplete="email" placeholder="Email address" required>
        <button type="submit" class="btn-maison"><span>Be the first to know</span></button>
      </form>`,
  });
  root.querySelector(".bhero")?.classList.add("bhero--coming");
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
  const hero = $(".bhero", root);
  if (hero && !c.reduce) {
    // Load: the name rises from its line mask and the copy follows. The products (the page's
    // largest image) are simply there: no entrance on the LCP.
    const name = $(".bhero-name", hero);
    if (window.SplitText) {
      const split = SplitText.create(name, { type: "lines", mask: "lines" });
      gsap.from(split.lines, { yPercent: 110, duration: 1, stagger: 0.08, ease: "power4.out", delay: 0.1 });
    }
    gsap.from($$(".bhero-copy > :not(.bhero-name)", hero), { y: 16, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power3.out", delay: 0.35 });
  }

  if (!c.reduce) {
    $$("[data-split]", root).forEach((el) => splitLines(el, { ctx }));
    appear(".bmap-copy p");
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
}));
