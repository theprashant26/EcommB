/* ==========================================================================
   Origin page (origin.html?batch=…) — §9.4, the QR landing page.
   Opened by scanning a tube, usually on a phone: designed mobile-first.
   1. Boarding pass for the batch (flips in; the from/to codes type in)
   2. The route: the tilted 3D map, Leh → New Delhi only
   3. The journey: a numbered timeline with a line that draws down
   4. Photo slots for the client's real photography
   5. Batch facts
   Unknown code → a notice and a field to type the code from the tube.
   ========================================================================== */

import { initHeader } from "../core/header.js";
import { initBag } from "../core/bag.js";
import { initWishlist } from "../core/wishlist.js";
import { initReveals } from "../core/reveal.js";
import { initSearch } from "../core/search.js";
import { initMotion, splitLines, whenScriptsReady, yieldToMain, afterPaint } from "../core/motion.js";
import { createMap3d } from "../core/map3d.js";
import { ORIGINS, BATCHES, DEFAULT_BATCH } from "../data/origins.js";
import { getProduct, productURL } from "../data/products.js";
import { getBrand } from "../data/brands.js";
import { esc, formatCoords, formatDate, $, $$, cssReady } from "../core/format.js";

await cssReady();   // Update 04: the full stylesheet arrives without blocking; render once it applies

initHeader();
initBag();
initSearch();
initWishlist();
initReveals();

const root = $("[data-origin-page]");
const params = new URLSearchParams(location.search);
const code = (params.get("batch") || DEFAULT_BATCH).trim().toUpperCase();
const batch = BATCHES[code];

/** Straight-line distance in km (haversine), from the data's coordinates. */
function distanceKm(a, b) {
  const R = 6371, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round((2 * R * Math.asin(Math.sqrt(h))) / 10) * 10;
}
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const monthYear = (iso) => formatDate(iso).replace(/^\d+\s/, "");
const words = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const inWords = (n) => words[n] || String(n);

/* ---------- a known batch ---------- */

function renderBatch() {
  const from = ORIGINS[batch.originId];
  const to = ORIGINS[batch.destinationId];
  const product = getProduct(batch.productId);
  const brand = product && getBrand(product.brand);
  const km = distanceKm(from, to);
  const pressedAfter = daysBetween(batch.harvestDate, batch.pressedDate);
  const today = new Date().toISOString().slice(0, 10);

  const stops = [
    ["Grown", batch.grownSeason, `On the high slopes around ${from.name.split(",")[0]}, at ${from.altitude || "altitude"}.`],
    ["Harvested", formatDate(batch.harvestDate), `Picked by hand. ${batch.field}.`],
    ["Pressed", formatDate(batch.pressedDate), `Pressed ${inWords(pressedAfter)} ${pressedAfter === 1 ? "day" : "days"} after the harvest.`],
    ["Formulated", formatDate(batch.formulatedDate), product?.inside || "Made into the formula."],
    ["Filled", formatDate(batch.filledDate), `Filled into this tube: batch ${code}.`],
    ["Arrived with you", formatDate(today), `${km.toLocaleString("en-IN")} km from its field, as the crow flies.`],
  ];

  const html = `
    <section class="opass-sec" aria-labelledby="pass-title">
      <div class="wrap">
        <article class="pass" data-pass>
          <div class="pass-main">
            <h1 class="pass-route" id="pass-title">
              <span class="pass-end">
                <span class="pass-label">From</span>
                <span class="pass-code" data-type-code>${esc(from.code)}</span>
                <span class="pass-city">${esc(from.name)}</span>
              </span>
              <span class="pass-line" aria-hidden="true"><span class="pass-dot"></span><span class="pass-track"></span><span class="pass-ring"></span></span>
              <span class="pass-end pass-end--to">
                <span class="pass-label">to</span>
                <span class="pass-code" data-type-code>${esc(to.code)}</span>
                <span class="pass-city">${esc(to.name)}</span>
              </span>
            </h1>
            <dl class="pass-facts">
              <div><dt>Piece</dt><dd>${esc(product?.fullName || "")}</dd></div>
              <div><dt>Harvested</dt><dd>${esc(formatDate(batch.harvestDate))}</dd></div>
              <div><dt>Altitude</dt><dd>${esc(from.altitude || "")}</dd></div>
              <div><dt>Origin</dt><dd class="coords">${formatCoords(from.lat, from.lon)}</dd></div>
            </dl>
          </div>
          <div class="pass-stub">
            <p class="pass-label">Batch</p>
            <p class="pass-batch">${esc(code)}</p>
            <p class="pass-brand">${esc(brand?.name || "")}</p>
          </div>
        </article>
      </div>
    </section>
    <!--REST-->
    <section class="section oroute" aria-labelledby="route-title">
      <div class="wrap oroute-head">
        <h2 id="route-title" data-split>The route.</h2>
        <p>From ${esc(from.name)} to ${esc(to.name)}. <span class="coords">${km.toLocaleString("en-IN")} km, ${formatCoords(from.lat, from.lon)} to ${formatCoords(to.lat, to.lon)}</span></p>
      </div>
      <div class="oroute-stage map-stage" data-omap role="img" aria-label="Map of the route from ${esc(from.name)} to ${esc(to.name)}"></div>
    </section>

    <section class="section ojourney" aria-labelledby="journey-title">
      <div class="wrap">
        <h2 id="journey-title" data-split>The journey.</h2>
        <div class="journey" data-journey>
          <span class="journey-line" aria-hidden="true"><span data-journey-fill></span></span>
          <ol class="journey-stops">
          ${stops.map(([name, date, text], i) => `
            <li class="stop${i === stops.length - 1 ? " stop--arrived" : ""}">
              <span class="stop-n coords">${String(i + 1).padStart(2, "0")}</span>
              <span class="stop-dot" aria-hidden="true"></span>
              <div class="stop-body">
                <h3 class="stop-name">${esc(name)}</h3>
                <p class="stop-date coords">${esc(date || "")}</p>
                <p class="stop-text">${esc(text)}</p>
              </div>
            </li>`).join("")}
          </ol>
        </div>
      </div>
    </section>

    <section class="section ophotos" aria-labelledby="photos-title">
      <div class="wrap">
        <h2 id="photos-title" data-split>From the field.</h2>
        <!-- TODO(client): real photos from the farm — do not use stock photography.
             Put each photo's path in data-photo; origin.js swaps it in. -->
        <div class="photos">
          ${[
            ["field", "The field", `${batch.field}, ${monthYear(batch.harvestDate)}.`],
            ["harvest", "The harvest", `${from.name.split(",")[0]} valley, ${monthYear(batch.harvestDate)}.`],
            ["hands", "The hands", `${batch.harvestedBy}.`],
          ].map(([key, title, caption]) => `
            <figure class="photo" data-photo="">
              <div class="photo-frame" data-photo-frame="${key}">
                <div class="photo-ridges" aria-hidden="true" data-photo-ridges></div>
                <p class="photo-wait coords">Photograph to come</p>
              </div>
              <figcaption><span class="photo-title">${esc(title)}.</span> ${esc(caption)}</figcaption>
            </figure>`).join("")}
        </div>
      </div>
    </section>

    <section class="section ofacts" aria-labelledby="facts-title">
      <div class="wrap ofacts-inner">
        <h2 id="facts-title" data-split>Batch facts.</h2>
        <div>
          <table class="facts-table">
            <tbody>
              <tr><th scope="row">Batch</th><td>${esc(code)}</td></tr>
              <tr><th scope="row">Piece</th><td>${esc(product?.fullName || "")}${product?.size ? `, ${esc(product.size)}` : ""}</td></tr>
              <tr><th scope="row">Ingredient</th><td>${esc(from.ingredient || product?.keyIngredient || "")}</td></tr>
              <tr><th scope="row">Field</th><td>${esc(batch.field)}</td></tr>
              <tr><th scope="row">Coordinates</th><td>${formatCoords(from.lat, from.lon)}</td></tr>
              <tr><th scope="row">Altitude</th><td>${esc(from.altitude || "")}</td></tr>
              <tr><th scope="row">Harvest season</th><td>${esc(from.season || "")}</td></tr>
              <tr><th scope="row">Harvested</th><td>${esc(formatDate(batch.harvestDate))}</td></tr>
              <tr><th scope="row">Pressed</th><td>${esc(formatDate(batch.pressedDate))}</td></tr>
              <tr><th scope="row">Filled</th><td>${esc(formatDate(batch.filledDate))}</td></tr>
            </tbody>
          </table>
          <p class="ofacts-links">
            ${product ? `<a class="btn-maison" href="${productURL(product.id)}"><span>Back to the ${esc(product.name.toLowerCase())}</span></a>` : ""}
            <a class="link-cta" href="${esc(batch.labReport || "#")}">Lab report</a>
          </p>
        </div>
      </div>
    </section>`;

  // The pass first (it is what the visitor scanned for); the rest after first paint.
  const [passPart, restPart] = html.split("<!--REST-->");
  root.innerHTML = passPart;
  document.title = `Batch ${code} | Jiai Life`;
  $('meta[property="og:title"]')?.setAttribute("content", document.title);
  return () => renderRest(restPart);
}

function renderRest(restPart) {
  root.insertAdjacentHTML("beforeend", restPart);

  // Real photography: a slot with data-photo="path.webp" shows that image.
  $$("[data-photo]").forEach((fig) => {
    const src = fig.dataset.photo;
    if (!src) return;
    const frame = $(".photo-frame", fig);
    frame.innerHTML = `<img src="${esc(src)}" alt="${esc($(".photo-title", fig).textContent)}" loading="lazy" decoding="async">`;
    frame.classList.add("has-photo");
  });

  // The ridges, very faint, behind each empty slot (one fetch, cloned)
  const hosts = $$("[data-photo-ridges]");
  if (hosts.length) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      fetch("assets/illustrations/ladakh-range.svg").then((r) => r.text()).then((svg) => {
        hosts.forEach((h) => {
          h.innerHTML = svg;
          const el = $("svg", h);
          el.removeAttribute("role"); el.removeAttribute("aria-label");
          el.setAttribute("aria-hidden", "true"); el.setAttribute("focusable", "false");
        });
      }).catch(() => {});
    }, { rootMargin: "100% 0px" });
    io.observe(hosts[0]);
  }
}

/* ---------- an unknown code ---------- */

function renderUnknown() {
  root.innerHTML = `
    <section class="section wrap onotfound" aria-labelledby="nf-title">
      <h1 id="nf-title" class="t-h2">We can’t find batch ${esc(code)} yet.</h1>
      <p>Check the code printed under the QR on the back of your tube, and type it here.</p>
      <form class="inline-form onotfound-form" action="origin.html" method="get">
        <label class="visually-hidden" for="batch-code">Batch code</label>
        <input class="field" id="batch-code" name="batch" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="OO-LDK-0000-00" required>
        <button type="submit" class="btn-maison"><span>Trace it</span></button>
      </form>
    </section>`;
  document.title = "Trace your origin | Jiai Life";
}

/* ==========================================================================
   Boot, in stages: the pass (and its flip) at once; the rest of the page after
   first paint; scroll motion after that, so nothing competes with the pass.
   ========================================================================== */


if (batch) {
  const rest = renderBatch();
  playPass();
  (async () => {
    await afterPaint();
    rest();
    root.removeAttribute("data-pending");
    await whenScriptsReady();
    await yieldToMain();
    initMotion(setupMotion);
  })();
} else {
  renderUnknown();
  root.removeAttribute("data-pending");
  whenScriptsReady().then(() => initMotion(() => {}));
}

/**
 * The pass flips in from the top edge and settles; the red dot lands; the codes
 * type in. Once, at load. CSS animations (compositor) + a tiny text effect, so it
 * starts the moment the pass exists: it does not wait for GSAP from the CDN.
 */
function playPass() {
  if (!document.documentElement.classList.contains("motion-ok")) return;
  document.documentElement.classList.add("motion-live"); // scripts arrived: stop the <head> watchdog
  const pass = $("[data-pass]");
  pass.classList.add("is-flipping");
  $$("[data-type-code]", pass).forEach((el, i) => typeIn(el, 0.5 + i * 0.35));
}

/* ==========================================================================
   Motion
   ========================================================================== */

let mapPromise;
function setupMotion(c, ctx) {
  if (!ctx) return; // GSAP never arrived (CDN down): the page stays as rendered, fully readable
  if (!c.reduce) {
    $$("[data-split]", root).forEach((el) => splitLines(el, { ctx }));

    // The journey line draws down as you scroll
    gsap.fromTo("[data-journey-fill]", { scaleY: 0 }, {
      scaleY: 1, ease: "none",
      scrollTrigger: { trigger: "[data-journey]", start: "top 70%", end: "bottom 60%", scrub: true },
    });
    $$(".stop").forEach((stop) => {
      gsap.from(stop.querySelector(".stop-dot"), {
        scale: 0, duration: 0.5, ease: "power4.out",
        scrollTrigger: { trigger: stop, start: "top 72%", once: true },
      });
    });
  }

  // The route: same map as the home page, Leh → New Delhi only; the Leh pin pulses.
  // Built only when the visitor comes within a screen of it: nothing competes with the pass.
  const host = $("[data-omap]");
  let alive = true;
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    // Focused on India: the story here is the last 620 km, not Europe.
    mapPromise ||= createMap3d(host, { routes: ["leh"], pins: ["leh", "delhi"], focus: { x: 80, y: 53, zoom: c.isDesktop ? 1.9 : 2.3 } });
    mapPromise.then((map) => alive && ctx.add(() => {
      if (c.reduce) { map.finalState({ tilt: 0 }); return; }
      const tl = map.timeline({ tilt: c.isDesktop ? 52 : 40, rotZ: -4, scaleFrom: 1.08 });
      ScrollTrigger.create({ trigger: host, start: "top 80%", end: "center 45%", scrub: 1, animation: tl });
      map.pulse(["leh"]);
    }));
  }, { rootMargin: "100% 0px" });
  io.observe(host);
  return () => { alive = false; io.disconnect(); };
}

/** Type a code in: each letter shuffles briefly, then lands (0.7s, left to right). */
function typeIn(el, delay) {
  const final = el.textContent;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const duration = 700;
  let start = 0;
  const frame = (now) => {
    start ||= now;
    const p = Math.min(1, (now - start) / duration);
    const settled = Math.floor(p * final.length);
    el.textContent = p < 1
      ? final.split("").map((ch, i) => (i < settled ? ch : letters[Math.floor(Math.random() * letters.length)])).join("")
      : final;
    if (p < 1) requestAnimationFrame(frame);
  };
  setTimeout(() => requestAnimationFrame(frame), delay * 1000);
}
