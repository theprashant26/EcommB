/* ==========================================================================
   Home (index.html) — §8.1–8.8
   Everything listing brands or products renders from js/data. Motion is set
   up per matchMedia context (desktop / mobile / reduced) in initMotion().
   ========================================================================== */

import { initHeader } from "../core/header.js";
import { initBag } from "../core/bag.js";
import { initSearch } from "../core/search.js";
import { initMotion, splitLines, appear, getSmoother } from "../core/motion.js";
import { createDepth } from "../core/depth.js";
import { createSpin, frameURL } from "../core/spin.js";
import { createMap3d } from "../core/map3d.js";
import { cardHTML, initCards } from "../core/cards.js";
import { PRODUCTS, productsByBrand, productURL } from "../data/products.js";
import { visibleBrands, brandURL } from "../data/brands.js";
import { ORIGINS } from "../data/origins.js";
import { esc, formatCoords, finePointer, hasGSAP, $, $$ } from "../core/format.js";

const html = document.documentElement;
/** The layered (desktop) hero composition; below this it stacks. Mirrors the CSS + <picture> media. */
const LAYERED = "(min-width: 768px) and (min-aspect-ratio: 601/500)";

initHeader();
initBag();
initSearch();

/* ==========================================================================
   Render from data
   ========================================================================== */

/** Small, first-screen thumbnail: a tube's front spin frame (~19 KB) or the bottle render. */
const thumbOf = (p) => (p.spin ? frameURL(p.spin.path, 0) : p.images.hero);

function renderHeroTabs() {
  const list = $("[data-hero-tabs]");
  if (!list) return;
  list.innerHTML = PRODUCTS.map((p) => `
    <li class="hero-tab">
      <a href="${productURL(p.id)}">
        <img src="${esc(thumbOf(p))}" alt="" width="48" height="48" loading="lazy" decoding="async">
        <span>${esc(p.name)}</span>
      </a>
    </li>`).join("");
}

function renderFour() {
  const grid = $("[data-four]");
  if (grid) grid.innerHTML = PRODUCTS.map((p) => cardHTML(p)).join("");
  const coords = $("[data-four-coords]");
  if (coords) {
    const lat = (o) => `${Math.abs(o.lat).toFixed(2)}° ${o.lat >= 0 ? "N" : "S"}`;
    coords.textContent = ["leh-ladakh", "paris", "new-delhi"]
      .map((id) => ORIGINS[id]).filter(Boolean)
      .map((o) => `${o.name.split(",")[0]} ${lat(o)}`).join(" / ");
  }
}

/* ---------- 8.3 data: the tubes that can turn ---------- */

const TURN_PRODUCTS = PRODUCTS.filter((p) => p.spin && !p.comingSoon);
const TURN_LABELS = { "one-origin-face-cleanser": "Face", "one-origin-body-lotion": "Body" }; // toggle labels
const turnState = { index: 0 };
const sentence = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/** Four callouts at 0°, 90°, 180°, 270°. target = point on the tube (fraction of the 2:3 frame). */
function calloutsFor(p) {
  const [c1 = "", c2 = ""] = p.claims || [];
  return [
    { frame: 0,  text: `${sentence(p.name)}. ${p.benefit}.`, target: [0.5, 0.3], side: "right" },
    { frame: 9,  text: `${c1}, ${c2.charAt(0).toLowerCase()}${c2.slice(1)}.`, target: [0.5, 0.52], side: "left" },
    { frame: 18, text: "Scan to trace your origin.", target: [0.43, 0.45], side: "right" },   // the QR on the back label
    { frame: 27, text: `${p.size}. Stands on its flip cap.`, target: [0.5, 0.86], side: "left" },
  ];
}

function renderTurn() {
  const toggle = $("[data-turn-toggle]");
  if (toggle) {
    toggle.innerHTML = TURN_PRODUCTS.map((p, i) => `
      <button type="button" aria-pressed="${i === turnState.index}" data-turn-index="${i}">${esc(TURN_LABELS[p.id] || p.name)}</button>`).join("");
  }
  renderCallouts();
}

function renderCallouts() {
  const p = TURN_PRODUCTS[turnState.index];
  const list = $("[data-turn-callouts]");
  const svg = $("[data-turn-leaders]");
  if (!p || !list) return;
  const callouts = calloutsFor(p);
  list.innerHTML = callouts.map((c) => `
    <li class="turn-callout" data-frame="${c.frame}" data-side="${c.side}">
      <span class="coords">${c.frame * 10}°</span>
      <p>${esc(c.text)}</p>
    </li>`).join("");
  svg.innerHTML = callouts.map(() => `<g><path/><circle r="3.5"/></g>`).join("");
  const canvas = $("[data-turn-canvas]");
  canvas?.setAttribute("aria-label", `${p.fullName} turning 360 degrees`);
}

/* ---------- 8.5 data: rooms ---------- */

const plinthHTML = (products) => `
  <div class="plinth">${products.map((p) =>
    `<img src="${esc(p.images.hero)}" alt="${esc(p.fullName)}" width="${p.spin ? 1150 : 557}" height="${p.spin ? 2047 : 1143}" loading="lazy" decoding="async">`).join("")}
  </div>`;

function roomCopy(b, { title = b.name, line = b.line, body = b.story, cta = `Shop ${b.name}`, href = brandURL(b.id) } = {}) {
  const origin = b.originId && ORIGINS[b.originId];
  const coords = b.coords || (origin ? formatCoords(origin.lat, origin.lon) : "");
  return `
    <div class="room-copy">
      ${coords ? `<p class="coords">${esc(coords)}</p>` : ""}
      <h3 class="room-name">${esc(title)}</h3>
      ${line ? `<p class="t-tagline room-line">${esc(line)}</p>` : ""}
      ${body ? `<p>${esc(body)}</p>` : ""}
      <a class="btn-maison" href="${href}"><span>${esc(cta)}</span></a>
    </div>`;
}

const ROOMS = {
  "one-origin": (b) => `
    <article class="room room--one-origin" style="--room-bg:${b.room.bg}" aria-label="${esc(b.name)}">
      <div class="room-art">
        <div class="room-ridges" data-ridges aria-hidden="true"></div>
        <div class="room-branch" data-branch aria-hidden="true"></div>
        ${plinthHTML(productsByBrand(b.id).filter((p) => !p.comingSoon))}
      </div>
      ${roomCopy(b)}
    </article>`,

  larrive: (b) => {
    const p = productsByBrand(b.id)[0];
    return `
    <article class="room room--larrive" style="--room-bg:${b.room.bg}" aria-label="${esc(b.name)}">
      <div class="room-art">
        <figure class="artwork">
          <span class="artwork-frame"><img src="${esc(p.images.campaign)}" alt="L’Arrivé campaign: the bottle in dark blue light" width="1024" height="1536" loading="lazy" decoding="async"></span>
          <figcaption>${esc(b.name)}, campaign, 2026</figcaption>
        </figure>
        ${plinthHTML([p])}
      </div>
      ${roomCopy({ ...b, line: `${b.line}.` })}
    </article>`;
  },

  coming: (b) => `
    <article class="room room--coming" aria-label="${esc(b.name)}">
      <div class="room-art">${plinthHTML(productsByBrand(b.id))}</div>
      ${roomCopy(b, { title: `${b.name}.`, line: "", body: "Its name arrives soon.", cta: "Be the first to know", href: "#letters" })}
    </article>`,

  teaser: (b) => `
    <article class="room room--teaser" aria-label="${esc(b.name)}">
      <div class="room-art"><p class="room-outline" aria-hidden="true">${esc(b.name)}</p></div>
      ${roomCopy(b, { line: "", body: "Coming to the house.", cta: "Be the first to know", href: "#letters" })}
    </article>`,

  generic: (b) => `
    <article class="room room--generic" style="--room-bg:${b.room?.bg || "var(--porcelain)"}" aria-label="${esc(b.name)}">
      <div class="room-art">${plinthHTML(productsByBrand(b.id))}</div>
      ${roomCopy(b)}
    </article>`,
};

function renderRooms() {
  const track = $("[data-rooms]");
  if (!track) return;
  const brands = visibleBrands();
  track.innerHTML = brands.map((b) =>
    (ROOMS[b.id] || ROOMS[b.status === "coming" ? "coming" : b.status === "teaser" ? "teaser" : "generic"])(b)).join("");
  $("[data-room-total]").textContent = brands.length;
  // "Be the first to know" → the letters form
  $$('.room a[href="#letters"]', track).forEach((a) => a.addEventListener("click", () => {
    setTimeout(() => $("#letters-email")?.focus({ preventScroll: true }), 1200);
  }));
}

/** Room illustrations are inlined lazily, when the house is within ~1.5 screens. */
let roomArt;
function loadRoomArt() {
  roomArt ||= new Promise((resolve) => {
    const house = $("[data-house]");
    if (!house) return resolve();
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const inline = (sel, url) => {
        const host = $(sel);
        if (!host) return Promise.resolve();
        return fetch(url).then((r) => r.text()).then((svg) => {
          host.innerHTML = svg;
          const el = $("svg", host);
          el.removeAttribute("role"); el.removeAttribute("aria-label");
          el.setAttribute("aria-hidden", "true"); el.setAttribute("focusable", "false");
        }).catch(() => {});
      };
      Promise.all([
        inline("[data-ridges]", "assets/illustrations/ladakh-range.svg"),
        inline("[data-branch]", "assets/illustrations/sea-buckthorn.svg"),
      ]).then(resolve);
    }, { rootMargin: "150% 0px" });
    io.observe(house);
  });
  return roomArt;
}

/* ---------- 8.6 data: the rush ---------- */

const RUSH_WORDS = ["Rushing", "Late", "Pushing", "Running", "Crowded", "Hurry"];
function renderRush() {
  $$("[data-rush] .rush-track").forEach((track, i) => {
    const words = RUSH_WORDS.map((_, k) => RUSH_WORDS[(k + i * 2) % RUSH_WORDS.length]);
    const set = [...words, ...words].map((w) => `<span>${w}</span>`).join("");
    track.innerHTML = set + set; // two identical halves → seamless wrap
  });
}


/* ==========================================================================
   8.1 Hero load sequence — the page's one orchestrated moment (≤ 1.5s).
   SplitText splits the H1 into characters; the motion itself is CSS
   (compositor), so it costs the main thread nothing while the page loads.
   Runs once, outside the matchMedia contexts, so a resize never replays or
   reverts it. CSS holds the opening states under html.motion-ok until
   .hero.is-in is set.
   ========================================================================== */

function playHeroIntro() {
  const hero = $("[data-hero]");
  if (!hero) return;
  if (!hasGSAP() || !html.classList.contains("motion-ok")) { hero.classList.add("is-in"); return; }
  html.classList.add("motion-live"); // scripts arrived: stop the <head> watchdog
  const title = $(".hero-title", hero);

  if (window.SplitText) {
    // The H1 already carries its two lines as spans, and those spans are the
    // masks (overflow clip in CSS). Splitting words + chars needs no line
    // measurement, so it is cheap and never has to re-split when fonts arrive.
    const split = SplitText.create(title, { type: "words,chars", charsClass: "char" });
    split.chars.forEach((c, i) => c.style.setProperty("--i", i)); // stagger index for the CSS delay
  }
  hero.classList.add("is-playing");
  $("#site-top")?.classList.add("is-dot-drop"); // the logo's red dot lands last (Update 01 §3)

  // Hand over to the resting state once the last piece (the tabs) has settled.
  const done = () => { hero.classList.add("is-in"); hero.classList.remove("is-playing"); };
  $(".hero-tabs", hero).addEventListener("animationend", done, { once: true });
  setTimeout(done, 2500); // safety net if animation events never fire
}

/* ==========================================================================
   Boot, in stages (§12: TBT under 200 ms on a mid-range phone)
   1. now:             header, bag, search, hero tabs, the hero load sequence
   2. on first intent: render the sections below the fold, then ScrollSmoother,
                       pins and scroll motion, one section per task.
                       Intent = the first scroll, touch, key or pointer move,
                       a deep link / restored scroll position, or 8s idle.
                       Nothing below the fold is visible before that, so none
                       of this work competes with the hero.
   ========================================================================== */

const yieldToMain = () => (globalThis.scheduler?.yield
  ? scheduler.yield()
  : new Promise((resolve) => setTimeout(resolve, 0)));

renderHeroTabs();
playHeroIntro();
boot();

async function boot() {
  await firstIntent();
  for (const render of [renderFour, renderTurn, renderRooms, renderRush]) {
    render();
    await yieldToMain();
  }
  loadRoomArt();
  initMotion(setupMotion);
}

/** Resolves on the first scroll/touch/key/pointer move, a deep link, or after 8s idle (crawlers, readers). */
function firstIntent() {
  return new Promise((resolve) => {
    if (location.hash || window.scrollY > 0) return resolve();
    setTimeout(() => go(), 8000);
    const events = ["scroll", "wheel", "touchstart", "pointerdown", "pointermove", "keydown"];
    function go(e) {
      // Capture also sees inner scrollers (e.g. the hero tab row settling): only the page counts.
      if (e?.type === "scroll" && e.target !== document && e.target !== window) return;
      events.forEach((type) => window.removeEventListener(type, go, true));
      resolve();
    }
    events.forEach((type) => window.addEventListener(type, go, { capture: true, passive: true }));
  });
}

/* ==========================================================================
   Motion, per context. Each section is set up in its own task; pinned
   sections are created in page order so every pin measures the one above.
   ========================================================================== */

function setupMotion(c, ctx) {
  const cleanups = [];
  let alive = true;
  const later = (promise, fn) => promise.then((v) => { if (alive && ctx) ctx.add(() => fn(v)); });
  const steps = [
    () => heroMotion(c, cleanups),
    () => fourMotion(c, cleanups),
    () => turnMotion(c, cleanups),
    () => mapMotion(c, cleanups, later),
    () => houseMotion(c, cleanups, later),
    () => arrivedMotion(c, cleanups),
    () => {
      if (c.reduce) return;
      $$("[data-split]").forEach((el) => splitLines(el, { ctx }));
      appear(".sec-head .coords, .mapsec-head p, .house-head p, .arrived-lede, .letters p");
    },
  ];

  (async () => {
    for (const step of steps) {
      if (!alive) return;
      if (ctx) ctx.add(step); else step();
      await yieldToMain();
    }
  })();

  return () => { alive = false; cleanups.forEach((fn) => fn()); };
}

/* ---------- 8.1 hero: depth + layers separating on scroll ---------- */

function heroMotion(c, cleanups) {
  const stage = $("[data-hero-stage]");
  if (!stage || c.reduce) return;
  const layered = matchMedia(LAYERED).matches;

  if (layered) {
    // Scroll out: each layer keeps its data-hero-speed (products 1, type .92, backdrop .85).
    const hero = $("[data-hero]");
    $$("[data-hero-speed]", stage).forEach((layer) => {
      const speed = parseFloat(layer.dataset.heroSpeed);
      if (speed === 1) return;
      gsap.to(layer, {
        y: () => (1 - speed) * stage.offsetHeight, ease: "none",
        // start at scroll 0 (the hero sits just below the header)
        scrollTrigger: { trigger: hero, start: 0, end: "bottom top", scrub: true, invalidateOnRefresh: true },
      });
    });
    if (c.isDesktop) {
      const depth = createDepth(stage, [
        { el: $(".hero-layer--back .hero-depth", stage), depth: 6 },
        { el: $(".hero-layer--type .hero-depth", stage), depth: 14 },
        { el: $(".hero-layer--front .hero-depth", stage), depth: 26 },
      ], { rotate: 2.5, rotateEl: $("[data-hero-scene]", stage) });
      cleanups.push(depth.destroy);
    }
  } else {
    // Stacked (phones): a gentle scroll parallax on the image instead of pointer depth.
    gsap.fromTo($(".hero-layer--back .hero-depth", stage), { y: 0 }, {
      y: -36, ease: "none",
      scrollTrigger: { trigger: $(".hero-layer--back", stage), start: "top 70%", end: "bottom top", scrub: true },
    });
  }
}

/* ---------- 8.2 the four ---------- */

function fourMotion(c, cleanups) {
  const grid = $("[data-four]");
  if (!grid) return;
  const cards = initCards(grid);
  cleanups.push(cards.destroy);
  if (c.reduce) return;
  gsap.from($$(".pcard", grid), {
    z: -120, rotationX: 8, opacity: 0, transformPerspective: 900,
    duration: 1.1, stagger: 0.12, ease: "power4.out",
    scrollTrigger: { trigger: grid, start: "top 82%", once: true },
  });
}

/* ---------- 8.3 turn it in your hand ---------- */

function turnMotion(c, cleanups) {
  const section = $("[data-turn]");
  if (!section || !TURN_PRODUCTS.length) return;
  const stage = $("[data-turn-stage]", section);
  const object = $("[data-turn-object]", section);
  const canvas = $("[data-turn-canvas]", section);
  const poster = $("[data-turn-poster]", section);
  const toggle = $("[data-turn-toggle]", section);
  const product = () => TURN_PRODUCTS[turnState.index];

  /* Reduced motion: front and back, side by side */
  if (c.reduce) {
    const renderStatic = () => {
      const p = product();
      $("[data-turn-static]", section).innerHTML = [0, 18].map((f) => `
        <figure>
          <img src="${frameURL(p.spin.path, f)}" alt="${esc(p.fullName)}, ${f ? "back, with the trace-your-origin code" : "front"}" width="720" height="1080" loading="lazy" decoding="async">
          <figcaption>${f ? "The back: scan to trace your origin." : `${sentence(p.name)}. ${p.benefit}.`}</figcaption>
        </figure>`).join("");
    };
    renderStatic();
    const onToggle = (e) => {
      const btn = e.target.closest("[data-turn-index]");
      if (!btn) return;
      selectTurn(Number(btn.dataset.turnIndex));
      renderStatic();
    };
    toggle.addEventListener("click", onToggle);
    cleanups.push(() => toggle.removeEventListener("click", onToggle));
    return;
  }

  const pinned = c.isDesktop;
  let active = -1;
  const spin = createSpin(canvas, {
    path: product().spin.path, frames: product().spin.frames,
    mode: pinned ? "scroll" : "drag",
    onFrame: (f) => setActive(f),
  });
  if (!pinned) { canvas.tabIndex = 0; }
  spin.showFirst().then(() => object.classList.add("is-drawn"));

  // The rest of the frames load when the section is within one viewport.
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    spin.load();
  }, { rootMargin: "100% 0px" });
  io.observe(section);

  /* callouts + leader lines */
  const items = () => $$(".turn-callout", section);
  const leaders = () => $$("[data-turn-leaders] g", section);
  const circDist = (a, b) => { const d = Math.abs(a - b) % 36; return Math.min(d, 36 - d); };

  function layoutCallouts() {
    if (!pinned) return;
    const sr = stage.getBoundingClientRect();
    const or = object.getBoundingClientRect();
    const svg = $("[data-turn-leaders]", section);
    svg.setAttribute("viewBox", `0 0 ${sr.width} ${sr.height}`);
    const gap = Math.max(40, sr.width * 0.045);
    const callouts = calloutsFor(product());
    items().forEach((li, i) => {
      const c0 = callouts[i];
      const tx = or.left - sr.left + c0.target[0] * or.width;
      const ty = or.top - sr.top + c0.target[1] * or.height;
      const right = c0.side === "right";
      const x = right ? or.right - sr.left + gap : or.left - sr.left - gap - li.offsetWidth;
      li.style.left = `${x}px`;
      li.style.top = `${ty - 12}px`;
      const sx = right ? x - 14 : x + li.offsetWidth + 14;
      const [path, dot] = leaders()[i].children;
      path.setAttribute("d", `M${sx},${ty} L${tx},${ty}`);
      dot.setAttribute("cx", tx); dot.setAttribute("cy", ty);
    });
  }

  function setActive(frame) {
    const callouts = calloutsFor(product());
    let next = -1;
    if (pinned) next = callouts.findIndex((co) => circDist(frame, co.frame) <= 4);
    else next = callouts.reduce((best, co, i) => (circDist(frame, co.frame) < circDist(frame, callouts[best].frame) ? i : best), 0);
    if (next === active) return;
    const lis = items();
    if (!pinned) {
      lis.forEach((li, i) => li.classList.toggle("is-active", i === next));
      active = next;
      return;
    }
    const lg = leaders();
    if (active > -1) {
      gsap.to(lis[active], { opacity: 0, y: -8, duration: 0.3, ease: "power2.out", overwrite: true });
      gsap.to(lg[active].children[0], { drawSVG: "0%", duration: 0.3, ease: "power2.in", overwrite: true });
      gsap.to(lg[active].children[1], { opacity: 0, duration: 0.2, overwrite: true });
    }
    if (next > -1) {
      gsap.fromTo(lis[next], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, ease: "power4.out", overwrite: true });
      // the hairline draws from the callout to the product
      gsap.fromTo(lg[next].children[0], { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.6, ease: "power3.inOut", overwrite: true });
      // dots fade rather than scale: their position changes on resize, a scale origin would go stale
      gsap.fromTo(lg[next].children[1], { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.45, ease: "none", overwrite: true });
    }
    active = next;
  }

  const resetCallouts = () => {
    active = -1;
    gsap.set(items(), { opacity: pinned ? 0 : "", y: 0 });
    layoutCallouts();
    leaders().forEach((g) => { gsap.set(g.children[0], { drawSVG: "0%" }); gsap.set(g.children[1], { opacity: 0 }); });
    setActive(spin.frame);
  };

  if (pinned) {
    ScrollTrigger.create({
      trigger: section, start: "top top", end: "+=180%", pin: true, scrub: true,
      onUpdate: (self) => spin.progress(self.progress),
      onRefresh: () => { layoutCallouts(); },
    });
  }
  resetCallouts();

  /* Face / Body: cross-fade (0.4s) and keep the same progress */
  const onToggle = (e) => {
    const btn = e.target.closest("[data-turn-index]");
    if (!btn || Number(btn.dataset.turnIndex) === turnState.index) return;
    const i = Number(btn.dataset.turnIndex);
    gsap.to(object, {
      opacity: 0, duration: 0.2, ease: "none", overwrite: true,
      onComplete: () => {
        selectTurn(i);
        const p = product();
        poster.src = frameURL(p.spin.path, 0);
        resetCallouts();
        spin.setPath(p.spin.path).then(() => {
          gsap.to(object, { opacity: 1, duration: 0.2, ease: "none" });
          spin.load();
        });
      },
    });
  };
  toggle.addEventListener("click", onToggle);
  const onResize = () => layoutCallouts();
  window.addEventListener("resize", onResize);
  cleanups.push(() => {
    toggle.removeEventListener("click", onToggle);
    window.removeEventListener("resize", onResize);
    io.disconnect();
    spin.destroy();
    canvas.removeAttribute("tabindex");
    items().forEach((li) => { li.classList.remove("is-active"); li.style.left = li.style.top = ""; });
  });
}

function selectTurn(i) {
  turnState.index = i;
  $$("[data-turn-index]").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.turnIndex) === i)));
  renderCallouts();
}

/* ---------- 8.4 the 3D map ---------- */

/** The map DOM is built once per page; every motion context reuses it. */
function getMap() {
  getMap.promise ||= createMap3d($("[data-map]"), { routes: ["paris", "leh"], pins: ["paris", "delhi", "leh"] });
  return getMap.promise;
}

function mapMotion(c, cleanups, later) {
  const section = $("[data-mapsec]");
  if (!section) return;
  const wrap = $("[data-map-wrap]", section);
  const cards = { paris: $('[data-route-card="paris"]', section), leh: $('[data-route-card="leh"]', section) };

  if (c.reduce) {
    later(getMap(), (map) => map.finalState({ tilt: 0 }));
    return;
  }

  // The ScrollTrigger (and its pin) exists now, in page order; the timeline fills once the map files arrive.
  const tl = gsap.timeline();
  const st = ScrollTrigger.create(c.isDesktop
    ? { trigger: section, start: "top top", end: "+=250%", pin: true, scrub: 1, animation: tl }
    : { trigger: wrap, start: "top 85%", end: "center 40%", scrub: 1, animation: tl });

  later(getMap(), (map) => {
    map.timeline({ tl, tilt: c.isDesktop ? 52 : 38, rotZ: c.isDesktop ? -6 : -3 });
    if (c.isDesktop) {
      // Story cards slide in beside the map as their route completes. Opacity only (not
      // visibility), so their links stay in the tab order; focusing one scrolls to the end of
      // the pin, where both cards are shown.
      gsap.set(Object.values(cards), { opacity: 0, x: -32 });
      tl.to(cards.paris, { opacity: 1, x: 0, duration: 0.35, ease: "power4.out" }, "paris-done");
      tl.to(cards.leh, { opacity: 1, x: 0, duration: 0.35, ease: "power4.out" }, "leh-done");
      const onFocus = () => setTimeout(() => {
        if (getSmoother()) getSmoother().scrollTo(st.end - 1, true); else window.scrollTo(0, st.end - 1);
      }, 0);
      Object.values(cards).forEach((card) => card.addEventListener("focusin", onFocus));
      cleanups.push(() => Object.values(cards).forEach((card) => card.removeEventListener("focusin", onFocus)));
    }
    map.pulse(["leh", "paris", "delhi"]);
    tl.progress(st.progress);
    if (c.isDesktop && finePointer()) cleanups.push(crosshair(map, wrap));
  });
}

/** Optional desktop detail: a thin crosshair with a live latitude/longitude readout. */
function crosshair(map, wrap) {
  const cross = $("[data-map-cross]", wrap);
  const [lx, ly, read] = [$(".map-cross-x", cross), $(".map-cross-y", cross), $("[data-map-read]", cross)];
  let raf = 0, last;
  const update = () => {
    raf = 0;
    const ll = map.latLonAt(last.clientX, last.clientY);
    wrap.classList.toggle("is-cross", !!ll);
    if (!ll) return;
    const r = wrap.getBoundingClientRect();
    const x = last.clientX - r.left, y = last.clientY - r.top;
    lx.style.transform = `translateX(${x}px)`;
    ly.style.transform = `translateY(${y}px)`;
    read.style.transform = `translate(${x + 12}px, ${y + 12}px)`;
    read.textContent = formatCoords(ll.lat, ll.lon);
  };
  const move = (e) => { last = e; if (!raf) raf = requestAnimationFrame(update); };
  const leave = () => { cancelAnimationFrame(raf); raf = 0; wrap.classList.remove("is-cross"); };
  wrap.addEventListener("pointermove", move);
  wrap.addEventListener("pointerleave", leave);
  return () => { wrap.removeEventListener("pointermove", move); wrap.removeEventListener("pointerleave", leave); leave(); };
}

/* ---------- 8.5 the house ---------- */

function houseMotion(c, cleanups, later) {
  const section = $("[data-house]");
  if (!section) return;
  const track = $("[data-rooms]", section);
  const viewport = $(".house-viewport", section);
  const rooms = $$(".room", track);
  const index = $("[data-room-index]", section);

  if (c.reduce) return; // stacked, final states (CSS)

  let horizontal = null;
  if (c.isDesktop) {
    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    let centres = [];
    const measure = () => { centres = rooms.map((r) => r.offsetLeft + r.offsetWidth / 2); };
    horizontal = gsap.to(track, {
      x: () => -distance(), ease: "none",
      scrollTrigger: {
        trigger: section, start: "top top", end: () => `+=${distance()}`,
        pin: true, scrub: 1, invalidateOnRefresh: true,
        onRefresh: measure,
        onUpdate(self) {
          // the room whose centre is nearest the middle of the screen
          const mid = self.progress * distance() + viewport.clientWidth / 2;
          let k = 0;
          centres.forEach((cx, i) => { if (Math.abs(cx - mid) < Math.abs(centres[k] - mid)) k = i; });
          if (index.textContent !== String(k + 1)) index.textContent = k + 1;
        },
      },
    });
    measure();

    // Keyboard: tabbing into a room scrolls the page to where the track shows that room.
    // (The browser also scrolls clipped ancestors sideways to reveal focus; undo that, the
    // pin does the moving.)
    // Every clipped ancestor up to the section (room, viewport, the section itself) may have been scrolled.
    const unscroll = (el) => { for (let n = el; n && n !== section.parentElement; n = n.parentElement) if (n.scrollLeft) n.scrollLeft = 0; };
    const onFocus = (e) => {
      const room = e.target.closest(".room");
      if (!room) return;
      unscroll(e.target);
      const st = horizontal.scrollTrigger;
      const d = distance();
      const x = Math.min(d, Math.max(0, room.offsetLeft - (viewport.clientWidth - room.offsetWidth) / 2));
      const y = st.start + (d ? x / d : 0) * (st.end - st.start);
      setTimeout(() => {
        unscroll(e.target);
        if (getSmoother()) getSmoother().scrollTo(y, true); else window.scrollTo(0, y);
      }, 0);
    };
    track.addEventListener("focusin", onFocus);
    cleanups.push(() => track.removeEventListener("focusin", onFocus));
  }

  // Triggers inside the moving track use containerAnimation; stacked rooms use plain scroll.
  const within = (room, vars) => ({ trigger: room, ...(horizontal ? { containerAnimation: horizontal } : {}), ...vars });

  // Nº 2: soft focus that sharpens as the room centres
  $$(".room--coming .plinth img", track).forEach((img) => {
    const room = img.closest(".room");
    gsap.fromTo(img, { filter: "blur(6px)" }, {
      filter: "blur(0px)", ease: "none",
      scrollTrigger: within(room, horizontal
        // the last room stops just right of centre, so finish a little early
        ? { start: "left right", end: "center 60%", scrub: true }
        : { start: "top bottom", end: "center center", scrub: true }),
    });
  });

  // One Origin: ridges parallax, sea-buckthorn grows in
  later(loadRoomArt(), () => {
    const room = $(".room--one-origin", track);
    if (!room) return;
    // Near ridges move; the far ones, the snow and the sun stay (far = slow).
    [2, 3, 4].forEach((n) => {
      const ridge = $(`.ridge-${n}`, room);
      if (!ridge) return;
      const shift = (n - 1) * 45;
      gsap.fromTo(ridge, { x: shift, scaleX: 1.12, svgOrigin: "1200 900" }, {
        x: -shift, ease: "none",
        scrollTrigger: within(room, horizontal
          ? { start: "left right", end: "right left", scrub: true }
          : { start: "top bottom", end: "bottom top", scrub: true }),
      });
    });

    const branch = $("[data-branch] svg", room);
    if (!branch) return;
    const leaves = $$(".leaf", branch);
    leaves.forEach((leaf) => {
      const m = leaf.getAttribute("d").match(/M\s*([-\d.]+)[ ,]([-\d.]+)/);
      if (m) gsap.set(leaf, { svgOrigin: `${m[1]} ${m[2]}` }); // leaves grow from where they join the twig
    });
    gsap.timeline({
      scrollTrigger: within(room, horizontal
        ? { start: "left 65%", toggleActions: "play none none reverse" }
        : { start: "top 65%", toggleActions: "play none none reverse" }),
    })
      .from($$("#branch path", branch), { drawSVG: "0%", duration: 1.3, stagger: 0.18, ease: "power2.inOut" })
      .from(leaves, { scale: 0, duration: 0.7, stagger: 0.015, ease: "power4.out" }, 0.45)
      .from($$(".berry", branch), { scale: 0, transformOrigin: "50% 50%", duration: 0.5, stagger: 0.06, ease: "power4.out" }, 1.05);
  });
}

/* ---------- 8.6 "Arrived." ---------- */

function arrivedMotion(c, cleanups) {
  const section = $("[data-arrived]");
  if (!section || c.reduce) return;
  const stage = $("[data-arrived-stage]", section);
  const word = $("[data-arrived-word]", section);
  const rows = $$(".rush-row", section).map((row) => {
    const track = $(".rush-track", row);
    return {
      row, track,
      dir: Number(row.dataset.dir) || -1,
      speed: Number(row.dataset.rushSpeed) || 80, // not data-speed: ScrollSmoother reads that as parallax
      x: 0, half: 0,
      setX: gsap.quickSetter(track, "x", "px"),
    };
  });
  const measure = () => rows.forEach((r) => { r.half = r.track.scrollWidth / 2; r.x = r.dir > 0 ? -r.half / 2 : 0; });
  measure();

  const state = { calm: 0, boost: 1 };
  let visible = false;
  let lastY = null;
  const scrollPos = () => (getSmoother() ? getSmoother().scrollTop() : window.scrollY);

  // The rush: speed follows scroll velocity; calm → 0 as the section centres.
  const tick = (time, dt) => {
    if (!visible) return;
    const y = scrollPos();
    const vel = lastY === null ? 0 : Math.abs(y - lastY) / Math.max(dt, 1) * 1000;
    lastY = y;
    state.boost += (1 + Math.min(4, vel / 500) - state.boost) * 0.08;
    const k = (dt / 1000) * state.boost * (1 - state.calm);
    rows.forEach((r) => {
      if (!r.half) return;
      r.x += r.dir * r.speed * k;
      if (r.x <= -r.half) r.x += r.half;
      if (r.x > 0) r.x -= r.half;
      r.setX(r.x);
    });
  };
  gsap.ticker.add(tick);

  ScrollTrigger.create({
    trigger: section, start: "top bottom", end: "bottom top",
    onToggle: (self) => { visible = self.isActive; lastY = null; },
    onRefresh: measure,
  });
  gsap.to(state, {
    calm: 1, ease: "none",
    scrollTrigger: { trigger: stage, start: "center 62%", end: "center 50%", scrub: true },
  });
  gsap.to(rows.map((r) => r.row), {
    opacity: 0, ease: "none",
    scrollTrigger: { trigger: stage, start: "center 60%", end: "center 50%", scrub: true },
  });
  gsap.fromTo(word, { opacity: 0, x: 56 }, {
    opacity: 1, x: 0, duration: 1.1, ease: "power4.out",
    scrollTrigger: { trigger: stage, start: "center 51%", toggleActions: "play none none reverse" },
  });

  cleanups.push(() => { gsap.ticker.remove(tick); rows.forEach((r) => gsap.set(r.track, { clearProps: "transform" })); });
}

