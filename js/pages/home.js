/* ==========================================================================
   Home (index.html) — §8.1–8.8
   Everything listing brands or products renders from js/data. Motion is set
   up per matchMedia context (desktop / mobile / reduced) in initMotion().
   ========================================================================== */

import { initHeader } from "../core/header.js";
import { initBag } from "../core/bag.js";
import { initWishlist } from "../core/wishlist.js";
import { initReveals } from "../core/reveal.js";
import { initSearch } from "../core/search.js";
import { initMotion, splitLines, appear, getSmoother } from "../core/motion.js";
import { createSpin, frameURL } from "../core/spin.js";
import { createMap3d } from "../core/map3d.js";
import { cardHTML } from "../core/cards.js";
import { ritualRowsHTML, ritualRowsMotion } from "../core/ritual-rows.js";
import { openLightbox } from "../core/lightbox.js";
import { plinthSetHTML } from "../core/plinth.js";
import { PRODUCTS, productsByBrand } from "../data/products.js";
import { HERO } from "../data/hero.js";
import { CATEGORIES } from "../data/categories.js";
import { visibleBrands, brandURL } from "../data/brands.js";
import { ORIGINS } from "../data/origins.js";
import { esc, formatCoords, finePointer, hasGSAP, icon, imageSize, reducedMotion, $, $$, cssReady } from "../core/format.js";

await cssReady();   // Update 04: the full stylesheet arrives without blocking; render once it applies

const html = document.documentElement;

initHeader();
initBag();
initSearch();
initWishlist();
initReveals();

/* ==========================================================================
   Render from data
   ========================================================================== */

/* ---------- Categories You Might Like (Update 03 §3) ---------- */

function renderCategories() {
  const host = $("[data-cats]");
  if (!host) return;
  // Two columns with staggered heights: left tall then short, right short then tall (and so on).
  const tall = (i) => (i % 2 === 0) === (Math.floor(i / 2) % 2 === 0);
  const tile = (c, i) => `
    <a class="cat${tall(i) ? " is-tall" : ""}" href="${esc(c.href)}" data-reveal>
      <span class="cat-media" data-reveal-inner>
        <img class="cat-img" src="${esc(c.image)}" alt="" width="${imageSize(c.image)[0]}" height="${imageSize(c.image)[1]}" loading="lazy" decoding="async" style="object-position:${esc(c.pos || "50% 50%")}">
      </span>
      <span class="cat-scrim" aria-hidden="true"></span>
      <span class="cat-body">
        <h3 class="cat-title">${esc(c.title)}</h3>
        <span class="cat-text">${esc(c.text)}</span>
        <span class="cat-btn">Explore Collection ${icon("arrow-right")}</span>
      </span>
    </a>`;
  const cols = [[], []];
  CATEGORIES.forEach((c, i) => cols[i % 2].push(tile(c, i)));
  host.innerHTML = cols.map((col) => `<div class="cats-col">${col.join("")}</div>`).join("");
}

function renderFour() {
  const grid = $("[data-four]");
  // "Four to begin with": the first four pieces in products.js (later additions live in the shop and rooms).
  if (grid) grid.innerHTML = PRODUCTS.slice(0, 4).map((p) => cardHTML(p)).join("");
  const coords = $("[data-four-coords]");
  if (coords) {
    const lat = (o) => `${Math.abs(o.lat).toFixed(2)}° ${o.lat >= 0 ? "N" : "S"}`;
    coords.textContent = ["leh-ladakh", "paris", "new-delhi"]
      .map((id) => ORIGINS[id]).filter(Boolean)
      .map((o) => `${o.name.split(",")[0]} ${lat(o)}`).join(" / ");
  }
}

/* ---------- 8.3 data: the tubes that can turn (HD frames, four rest stops; Update 03 §4: plays by itself) ---------- */

const TURN_PRODUCTS = PRODUCTS.filter((p) => p.spin && !p.comingSoon);
const TURN_LABELS = { "one-origin-face-cleanser": "Face", "one-origin-body-lotion": "Body" }; // toggle labels
const turnState = { index: 0 };
const spinOf = (p) => p.spinHD || p.spin;   // 1200×1800 frames for this section

/** Four callouts at the rest stops 0°, 90°, 180°, 270°. target = point on the tube (fraction of the 2:3 frame). */
function calloutsFor(p) {
  const [c1 = "", c2 = ""] = p.claims || [];
  return [
    { frame: 0,  icon: "sparkles", text: `${p.shortName || p.name}. ${p.benefit}.`, target: [0.5, 0.32], side: "right" },
    { frame: 9,  icon: "leaf", text: `${c1}, ${c2.charAt(0).toLowerCase()}${c2.slice(1)}.`, target: [0.5, 0.52], side: "left" },
    { frame: 18, icon: "map-pin", text: "Scan the code to trace your origin.", target: [0.45, 0.45], side: "right" },   // the QR on the back label
    { frame: 27, icon: "package-check", text: `${p.size}. Stands on its flip cap.`, target: [0.5, 0.86], side: "left" },
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
      ${icon(c.icon)}<p>${esc(c.text)}</p>
    </li>`).join("");
  svg.innerHTML = callouts.map(() => `<g><path/><circle r="3"/></g>`).join("");
  const canvas = $("[data-turn-canvas]");
  canvas?.setAttribute("aria-label", `${p.fullName} turning 360 degrees`);
}

/** "Read the label": the product's gallery in the lightbox, opened at the label close-up. */
function readLabel(from) {
  const p = TURN_PRODUCTS[turnState.index];
  const items = (p.gallery || []).filter((g) => g.src);
  const at = Math.max(0, items.findIndex((g) => /-label\.webp$/.test(g.src)));
  openLightbox({ items, index: at, from });
}

/* ---------- 8.5 data: rooms — one shared template (Update 02 §6.1) ---------- */

const pad2 = (n) => String(n).padStart(2, "0");
const firstSentence = (t = "") => t.split(/(?<=\.)\s/)[0];

function roomProducts(b) {
  return productsByBrand(b.id);   // coming-soon pieces stand in their brand's room too (Update 03 §6)
}

function roomHTML(b, i, total) {
  const origin = b.originId && ORIGINS[b.originId];
  const coords = b.coords || (origin ? formatCoords(origin.lat, origin.lon) : "");
  const products = roomProducts(b);
  const coming = b.status !== "live";
  const story = b.status === "coming" ? "A new fragrance from Jiai Life. Its name arrives soon."
    : b.status === "teaser" ? "Coming to the house." : (b.roomStory || firstSentence(b.story));
  const cta = coming
    ? `<button type="button" class="btn-maison" data-notify="${esc(products[0]?.id || b.id)}"><span>Notify me</span></button>`
    : `<a class="btn-maison" href="${brandURL(b.id)}"><span>Shop ${esc(b.name)}</span></a>`;
  return `
    <article class="room room--${esc(b.status)}${b.status === "coming" ? " room--coming" : ""} warm-light" data-room aria-label="${esc(b.name)}">
      <div class="room-copy">
        <p class="t-label room-n">${pad2(i + 1)} / ${pad2(total)}</p>
        <h3 class="t-h2 room-name">${esc(b.name)}</h3>
        ${b.line ? `<p class="t-tagline room-line">${esc(b.line)}</p>` : ""}
        ${coords ? `<p class="coords room-coords">${esc(coords)}</p>` : ""}
        <p class="room-story">${esc(story)}</p>
        ${cta}
      </div>
      <div class="room-stage">
        ${plinthSetHTML(products, { fallback: b.name })}
      </div>
    </article>`;
}

function renderRooms() {
  const track = $("[data-rooms]");
  if (!track) return;
  const brands = visibleBrands();
  track.innerHTML = brands.map((b, i) => roomHTML(b, i, brands.length)).join("");
}

/* ---------- Rituals, written down ---------- */

function renderRituals() {
  const host = $("[data-ritual-rows]");
  if (host) host.innerHTML = ritualRowsHTML({ headingLevel: 3 });
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
   Hero collage (Update 03 §2). The load reveal and the idle motion are CSS
   (compositor, under html.motion-ok), so the first screen costs the main
   thread nothing. Here: the logo's red-dot drop, pausing the idle loops when
   the hero is off-screen or the tab is hidden, slides from js/data/hero.js,
   and (with motion, desktop) the pointer depth in heroMotion().
   ========================================================================== */

function playHeroIntro() {
  const hero = $("[data-hero]");
  if (!hero || !html.classList.contains("motion-ok")) return;
  html.classList.add("motion-live");                     // scripts arrived: stop the <head> watchdog
  $("#site-top")?.classList.add("is-dot-drop");         // the logo's red dot lands last (Update 01 §3)
  const pause = (on) => hero.classList.toggle("is-paused", on);
  if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => pause(!e.isIntersecting)).observe(hero);
  document.addEventListener("visibilitychange", () => pause(document.hidden));
}

/** More than one slide in HERO: both cards cross-fade to the next pair every 7 seconds (paused on hover). */
function initHeroSlides() {
  const collage = $("[data-collage]");
  if (!collage || HERO.length < 2 || reducedMotion()) return;
  const cards = { a: $('[data-hcard="a"]', collage), b: $('[data-hcard="b"]', collage) };
  ["a", "b"].forEach((k) => {
    const frame = $(".hcard-frame", cards[k]);
    HERO.slice(1).forEach((slide) => {
      const d = slide[k];
      const [w, h] = imageSize(d.src);
      frame.insertAdjacentHTML("beforeend", `<img class="hcard-img" src="${esc(d.src)}" alt="" width="${w}" height="${h}" loading="lazy" decoding="async" style="object-position:${esc(d.pos || "50% 50%")}">`);
    });
  });
  let i = 0, hover = false;
  collage.addEventListener("pointerenter", () => { hover = true; });
  collage.addEventListener("pointerleave", () => { hover = false; });
  setInterval(() => {
    if (hover || document.hidden || $("[data-hero]").classList.contains("is-paused")) return;
    i = (i + 1) % HERO.length;
    ["a", "b"].forEach((k) => {
      const card = cards[k], d = HERO[i][k];
      $$(".hcard-img", card).forEach((img, n) => {
        if (n === 0) img.style.opacity = i === 0 ? "" : "0";
        else img.classList.toggle("is-on", n === i);
        img.alt = n === i ? d.alt : "";
      });
      card.href = d.href;
      $(".hcard-cap", card).textContent = d.caption;
      $(".hcard-cta", card).textContent = `${d.cta} →`;
    });
  }, 7000);
}

/* ==========================================================================
   Boot, in stages (§12: TBT under 200 ms on a mid-range phone)
   1. now:             header, bag, search, the hero load sequence
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

playHeroIntro();
initHeroSlides();
boot();

async function boot() {
  await firstIntent();
  for (const render of [renderCategories, renderFour, renderTurn, renderRooms, renderRush, renderRituals]) {
    render();
    await yieldToMain();
  }
  initHouse();
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
    () => turnMotion(c, cleanups),
    () => mapMotion(c, cleanups, later),
    () => arrivedMotion(c, cleanups),
    () => ritualRowsMotion($("[data-ritual-rows]"), { ctx, reduce: c.reduce }),
    () => {
      if (c.reduce) return;
      $$("[data-split]").forEach((el) => splitLines(el, { ctx }));
      appear(".sec-head .coords, .mapsec-head p, .house-head p, .arrived-lede, .letters p, .rituals-head .t-label, .cats-head p");
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

/* ---------- hero collage: pointer depth (desktop, motion) ---------- */

function heroMotion(c, cleanups) {
  const collage = $("[data-collage]");
  if (!collage || c.reduce || !c.isDesktop || !finePointer()) return;
  const hero = $("[data-hero]");
  const [a, b] = $$("[data-hcard-move]", collage);
  // Card A moves 8px and Card B 18px opposite the pointer; the collage tilts up to ±3°.
  gsap.set(collage, { transformPerspective: 1200 });
  const to = (el, prop, d = 0.8) => gsap.quickTo(el, prop, { duration: d, ease: "power3.out" });
  const q = { ax: to(a, "x"), ay: to(a, "y"), bx: to(b, "x"), by: to(b, "y"), rx: to(collage, "rotationX", 1), ry: to(collage, "rotationY", 1) };
  const move = (e) => {
    const r = hero.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width - 0.5) * 2, ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
    q.ax(-nx * 8); q.ay(-ny * 8); q.bx(-nx * 18); q.by(-ny * 18);
    q.ry(nx * 3); q.rx(-ny * 3);
  };
  const leave = () => Object.values(q).forEach((fn) => fn(0));
  hero.addEventListener("pointermove", move);
  hero.addEventListener("pointerleave", leave);
  cleanups.push(() => {
    hero.removeEventListener("pointermove", move);
    hero.removeEventListener("pointerleave", leave);
    gsap.set([a, b, collage], { clearProps: "transform" });
  });
}

/* ---------- 8.2 the four ---------- */

// The four unveil through the shared image system (js/core/reveal.js).

/* ---------- 8.3 turn it in your hand — plays by itself (Update 03 §4) ----------
   While the section is ≥40% in view it presents the tube on its own, looping:
   hold at 0° (2.4s, callout 1) → turn to 90° (0.9s) → hold (callout 2) → 180° →
   270° → back to 0°. Hover pauses it (desktop); a drag turns it by hand and it
   resumes 3s (touch: 4s) after the last drag. Pause/play, four stop dots (turn
   and hold), a progress line for the time left at the current stop. It rests
   off-screen, in a hidden tab, and until the frames have loaded (frame 0 shows
   at once). Reduced motion: no autoplay; the callouts as a list, the dots as
   manual controls. */

const HOLD_S = 2.4, TURN_S = 0.9, STOPS = [0, 9, 18, 27];

function turnMotion(c, cleanups) {
  const section = $("[data-turn]");
  if (!section || !TURN_PRODUCTS.length) return;
  const stage = $("[data-turn-stage]", section);
  const object = $("[data-turn-object]", section);
  const canvas = $("[data-turn-canvas]", section);
  const poster = $("[data-turn-poster]", section);
  const toggle = $("[data-turn-toggle]", section);
  const labelBtn = $("[data-read-label]", section);
  const playBtn = $("[data-turn-play]", section);
  const dots = $$("[data-turn-stop]", section);
  const progress = $("[data-turn-progress]", section);
  const product = () => TURN_PRODUCTS[turnState.index];
  const desktop = c.isDesktop;
  const on = (el, type, fn, o) => { el?.addEventListener(type, fn, o); cleanups.push(() => el?.removeEventListener(type, fn, o)); };

  on(labelBtn, "click", () => readLabel(object));

  // Never upscale a frame: the canvas's CSS height × devicePixelRatio stays ≤ 1800 (the frames' native height).
  const capHeight = () => object.style.setProperty("--turn-cap", `${Math.floor(1800 / Math.max(1, window.devicePixelRatio || 1))}px`);
  capHeight();

  let snap = null, resumeTimer = 0;
  const spin = createSpin(canvas, {
    path: spinOf(product()).path, frames: spinOf(product()).frames,
    mode: "drag", step: 9,
    onDragStart: () => { snap?.kill(); hold("drag"); setActive(-1); },
    onDragEnd: (f) => settleAt(nearestStop(f), { from: f, resumeIn: matchMedia("(pointer: coarse)").matches ? 4000 : 3000 }),
    onStep: (d) => settleAt(nearestStop(spin.frame + d), { from: spin.frame }),
  });
  canvas.tabIndex = 0;
  cleanups.push(() => canvas.removeAttribute("tabindex"));

  /* ---- callouts + hairline leaders (desktop: beside the tube; smaller screens: under it) ---- */
  const items = () => $$(".turn-callout", section);
  const leaders = () => $$("[data-turn-leaders] g", section);
  const circDist = (a, b) => { const d = Math.abs(a - b) % 36; return Math.min(d, 36 - d); };
  const nearestStop = (f) => STOPS.reduce((best, st, i) => (circDist(f, st) < circDist(f, STOPS[best]) ? i : best), 0);

  function layoutCallouts() {
    if (!desktop || c.reduce) return;
    const sr = stage.getBoundingClientRect();
    const or = object.getBoundingClientRect();
    const svg = $("[data-turn-leaders]", section);
    svg.setAttribute("viewBox", `0 0 ${sr.width} ${sr.height}`);
    const gap = Math.max(48, sr.width * 0.05);
    // the tube itself is the middle half of the frame: leaders stop at its edge, cards never cover it
    const tubeL = or.left - sr.left + or.width * 0.24, tubeR = or.left - sr.left + or.width * 0.76;
    const callouts = calloutsFor(product());
    items().forEach((li, i) => {
      const c0 = callouts[i];
      const ty = or.top - sr.top + c0.target[1] * or.height;
      const right = c0.side === "right";
      const x = right ? tubeR + gap : tubeL - gap - li.offsetWidth;
      li.style.left = `${x}px`;
      li.style.top = `${ty - li.offsetHeight / 2}px`;
      const sx = right ? x : x + li.offsetWidth;
      const tx = right ? tubeR - 6 : tubeL + 6;
      const [path, dot] = leaders()[i].children;
      path.setAttribute("d", `M${sx},${ty} L${tx},${ty}`);
      dot.setAttribute("cx", tx); dot.setAttribute("cy", ty);
    });
  }

  let active = -1;
  function setActive(next) {
    dots.forEach((d, i) => d.setAttribute("aria-pressed", String(i === (next < 0 ? active : next))));
    if (next === active || c.reduce) { if (next >= 0) active = next; return; }
    const lis = items();
    if (!desktop) {
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
      gsap.fromTo(lis[next], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", overwrite: true });
      gsap.fromTo(lg[next].children[0], { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.5, ease: "power3.inOut", overwrite: true });
      gsap.fromTo(lg[next].children[1], { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.35, ease: "none", overwrite: true });
    }
    active = next;
  }

  function resetCallouts() {
    active = -1;
    if (desktop && !c.reduce) {
      gsap.set(items(), { opacity: 0, y: 0 });
      leaders().forEach((g) => { gsap.set(g.children[0], { drawSVG: "0%" }); gsap.set(g.children[1], { opacity: 0 }); });
    }
    layoutCallouts();
    if (!c.reduce) setActive(0);          // every presentation starts at the front with its first callout
  }

  /* ---- reduced motion: frame 0, callouts as a list, dots turn by hand ---- */
  if (c.reduce) {
    spin.showFirst().then(() => object.classList.add("is-drawn"));
    dots.forEach((d, i) => on(d, "click", () => { spin.setFrame(STOPS[i]); setActive(i); }));
    setActive(0);
    on(toggle, "click", (e) => {
      const btn = e.target.closest("[data-turn-index]");
      if (!btn) return;
      selectTurn(Number(btn.dataset.turnIndex));
      spin.setPath(spinOf(product()).path).then(() => spin.setFrame(0));
      setActive(0);
    });
    cleanups.push(() => spin.destroy());
    return;
  }

  /* ---- the presentation: one looping timeline; its playhead is the state ---- */
  const reasons = new Set(["loading", "offscreen"]);   // why it is not playing
  let userPaused = false;
  const proxy = { f: 0 };
  const tl = gsap.timeline({ repeat: -1, paused: true });
  STOPS.forEach((st, k) => {
    tl.addLabel(`s${k}`)
      .call(() => setActive(k))
      .fromTo(progress, { scaleX: 1 }, { scaleX: 0, duration: HOLD_S, ease: "none", immediateRender: false })   // time left at this stop
      .call(() => setActive(-1))
      .fromTo(proxy, { f: st }, { f: st + 9, duration: TURN_S, ease: "power2.inOut", immediateRender: false, onUpdate: () => spin.setFrame(proxy.f) });
  });
  cleanups.push(() => tl.kill());

  function update() {
    const play = reasons.size === 0 && !userPaused;
    if (play && tl.paused()) tl.play();
    if (!play && !tl.paused()) tl.pause();
    playBtn.setAttribute("aria-pressed", String(userPaused));
    playBtn.setAttribute("aria-label", userPaused ? "Play the turn" : "Pause the turn");
  }
  function hold(reason) { clearTimeout(resumeTimer); reasons.add(reason); update(); }
  function release(reason) { reasons.delete(reason); update(); }

  /** Turn to stop k (the short way round), show its callout, and park the playhead there. */
  function settleAt(k, { from = spin.frame, resumeIn = 0 } = {}) {
    snap?.kill();
    tl.pause(`s${k}`);                   // playhead at the start of that stop's hold
    let to = STOPS[k];
    while (to - from > 18) to -= 36;
    while (from - to > 18) to += 36;
    const p2 = { f: from };
    snap = gsap.to(p2, { f: to, duration: 0.6, ease: "power3.out", onUpdate: () => spin.setFrame(p2.f) });
    setActive(k);
    gsap.set(progress, { scaleX: 1 });
    if (resumeIn) { clearTimeout(resumeTimer); resumeTimer = setTimeout(() => release("drag"), resumeIn); }
    else update();
  }
  cleanups.push(() => { clearTimeout(resumeTimer); snap?.kill(); });

  // Frame 0 at once; the presentation starts only when all frames are in.
  spin.showFirst().then(() => object.classList.add("is-drawn"));
  let loadIO = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    loadIO.disconnect();
    spin.load().then(() => { resetCallouts(); release("loading"); });
  }, { rootMargin: "100% 0px" });
  loadIO.observe(section);
  // ≥40% in view to play
  const viewIO = new IntersectionObserver(([e]) => (e.intersectionRatio >= 0.4 ? release("offscreen") : hold("offscreen")), { threshold: [0, 0.4] });
  viewIO.observe(section);
  cleanups.push(() => { loadIO.disconnect(); viewIO.disconnect(); });
  on(document, "visibilitychange", () => (document.hidden ? hold("hidden") : release("hidden")));
  if (finePointer()) {
    on(stage, "pointerenter", (e) => { if (e.pointerType === "mouse") hold("hover"); });
    on(stage, "pointerleave", (e) => { if (e.pointerType === "mouse") release("hover"); });
  }
  on(playBtn, "click", () => { userPaused = !userPaused; clearTimeout(resumeTimer); reasons.delete("drag"); update(); });
  // A stop dot turns to that angle and holds there (autoplay pauses until play is pressed).
  dots.forEach((d, i) => on(d, "click", () => { userPaused = true; settleAt(i); update(); }));

  /* Face / Body: cross-fade and restart from 0° */
  on(toggle, "click", (e) => {
    const btn = e.target.closest("[data-turn-index]");
    if (!btn || Number(btn.dataset.turnIndex) === turnState.index) return;
    const i = Number(btn.dataset.turnIndex);
    hold("switch");
    gsap.to(object, {
      opacity: 0, duration: 0.25, ease: "none", overwrite: true,
      onComplete: () => {
        selectTurn(i);
        poster.src = frameURL(product().spin.path, 0);
        resetCallouts();
        tl.pause("s0");
        spin.setPath(spinOf(product()).path).then(() => {
          spin.setFrame(0);
          gsap.to(object, { opacity: 1, duration: 0.25, ease: "none" });
          spin.load().then(() => release("switch"));
        });
      },
    });
  });

  const onResize = () => { capHeight(); layoutCallouts(); };
  on(window, "resize", onResize);
  resetCallouts();
  cleanups.push(() => {
    spin.destroy();
    gsap.set(progress, { clearProps: "transform" });
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

/* Update 03 §5: no pin, no scrub. When the section is 35% in view the journey plays once
   (~5.5s: the plane tilts, the routes draw, the pins drop, the story cards slide in); then the
   map sways gently with soft pulsing pins, and "Replay the journey" plays it again. */
function mapMotion(c, cleanups, later) {
  const section = $("[data-mapsec]");
  if (!section) return;
  const wrap = $("[data-map-wrap]", section);
  const cards = $$("[data-route-card]", section);
  const replay = $("[data-map-replay]", section);

  if (c.reduce) {
    later(getMap(), (map) => map.finalState({ tilt: 0 }));
    return;
  }
  later(getMap(), (map) => {
    const tilt = c.isDesktop ? 52 : 40, rotZ = c.isDesktop ? -6 : -4;
    const tl = map.journey({ tilt, rotZ });
    tl.fromTo(cards, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: "power3.out" }, "pins-done-=0.1");
    let sway = null, pulse = null, visible = false, played = false;
    const idle = () => { if (!sway) return; const run = visible && !document.hidden; sway.paused(!run); pulse.paused(!run); };
    tl.eventCallback("onComplete", () => {
      sway = map.sway({ rotZ });
      pulse = map.pulse();
      replay.hidden = false;
      idle();
    });
    const io = new IntersectionObserver(([e]) => {
      visible = e.intersectionRatio >= 0.35;
      if (visible && !played) { played = true; tl.play(0); }
      idle();
    }, { threshold: [0, 0.35] });
    io.observe(section);
    const onVis = () => idle();
    document.addEventListener("visibilitychange", onVis);
    const onReplay = () => {
      sway?.kill(); pulse?.kill(); sway = pulse = null;
      replay.hidden = true;
      tl.play(0);
    };
    replay.addEventListener("click", onReplay);
    // Keyboard: a story card receiving focus finishes the journey, so it is never invisible.
    const onFocus = () => { played = true; if (tl.progress() < 1) tl.progress(1); };   // and it must not restart under the focus
    cards.forEach((card) => card.addEventListener("focusin", onFocus));
    if (c.isDesktop && finePointer()) cleanups.push(crosshair(map, wrap));
    cleanups.push(() => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      replay.removeEventListener("click", onReplay);
      cards.forEach((card) => card.removeEventListener("focusin", onFocus));
      tl.kill(); sway?.kill(); pulse?.kill();
      replay.hidden = true;
      gsap.set(cards, { clearProps: "opacity,transform" });
    });
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

/* ---------- 8.5 the house — an auto-advancing, looping carousel (Update 03 §6) ----------
   Every 5s it moves to the next room (0.9s). It loops seamlessly through a clone of
   the last room before the first and of the first after the last. Prev/next, dots,
   the "1 of 3" counter, a thin progress line; swipe or drag with a snap; ←/→ when
   focused. It rests on hover or focus, off-screen and in a hidden tab. Reduced
   motion: no autoplay and no sliding (the controls still work). */

const HOUSE_EVERY = 5000;

function initHouse() {
  const root = $("[data-carousel]");
  const viewport = $("[data-carousel-viewport]", root);
  const track = $("[data-rooms]", root);
  if (!root || !track) return;
  const rooms = $$(".room", track);
  const n = rooms.length;
  const indexEl = $("[data-room-index]", root);
  $("[data-room-total]", root).textContent = n;
  const dotsHost = $("[data-house-dots]", root);
  const bar = $("[data-house-progress]", root);
  const still = () => reducedMotion();

  rooms.forEach((r, k) => {
    r.setAttribute("role", "group");
    r.setAttribute("aria-roledescription", "slide");
    r.setAttribute("aria-label", `${k + 1} of ${n}: ${r.getAttribute("aria-label")}`);
  });
  dotsHost.innerHTML = rooms.map((r, k) => `<button type="button" class="house-dot" data-house-dot="${k}" aria-label="Show ${esc(r.getAttribute("aria-label").split(": ")[1])}"></button>`).join("");
  if (n < 2) { $(".house-controls", root).hidden = true; rooms[0]?.classList.add("is-active"); return; }

  // Seamless loop: [clone of last, ...rooms, clone of first]
  const cloneOf = (r) => {
    const c = r.cloneNode(true);
    c.classList.add("is-clone");
    c.setAttribute("aria-hidden", "true");
    c.inert = true;
    c.removeAttribute("data-room");
    return c;
  };
  track.prepend(cloneOf(rooms[n - 1]));
  track.append(cloneOf(rooms[0]));
  const all = $$(".room", track);
  let i = 1;                                             // position in `all`
  const real = () => ((i - 1 + n) % n);                  // 0-based room index

  const EASE = "cubic-bezier(.645,.045,.355,1)";        // power3.inOut
  const xOf = (k) => -(all[k].offsetLeft - all[0].offsetLeft);
  const place = (k, animate) => {
    track.style.transition = animate && !still() ? `transform .9s ${EASE}` : "none";
    track.style.transform = `translate3d(${xOf(k)}px,0,0)`;
  };

  function paint() {
    all.forEach((r, k) => r.classList.toggle("is-active", k === i || (i === n + 1 && k === 1) || (i === 0 && k === n)));
    indexEl.textContent = real() + 1;
    $$(".house-dot", dotsHost).forEach((d, k) => (k === real() ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current")));
    // As a room becomes the active one, its products rise 16px into place.
    if (hasGSAP() && !still()) gsap.fromTo($$(".room-prod", all[i]), { y: 16 }, { y: 0, duration: 0.9, ease: "power3.out", overwrite: true });
  }

  let settleTimer = 0;
  function go(k, { animate = true } = {}) {
    i = Math.max(0, Math.min(n + 1, k));
    place(i, animate);
    paint();
    elapsed = 0;
    clearTimeout(settleTimer);
    // On a clone: jump (no animation) to the real room it copies, once the slide has finished.
    if (i === 0 || i === n + 1) settleTimer = setTimeout(() => { i = i === 0 ? n : 1; place(i, false); paint(); }, animate && !still() ? 920 : 0);
  }
  const next = () => go(i + 1);
  const prev = () => go(i - 1);

  /* autoplay with a pausable clock (drives the progress line) */
  const reasons = new Set(["offscreen"]);
  let elapsed = 0, last = 0, raf = 0;
  const running = () => !still() && reasons.size === 0;
  function tick(t) {
    raf = 0;
    if (!running()) { last = 0; return; }
    if (last) elapsed += t - last;
    last = t;
    bar.style.transform = `scaleX(${Math.min(1, elapsed / HOUSE_EVERY)})`;
    if (elapsed >= HOUSE_EVERY) next();
    raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (running() && !raf) { last = 0; raf = requestAnimationFrame(tick); } };
  const hold = (r) => { reasons.add(r); };
  const release = (r) => { reasons.delete(r); kick(); };

  root.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hold("hover"); });
  root.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") release("hover"); });
  root.addEventListener("focusin", () => hold("focus"));
  root.addEventListener("focusout", (e) => { if (!root.contains(e.relatedTarget)) release("focus"); });
  new IntersectionObserver(([e]) => (e.isIntersecting ? release("offscreen") : hold("offscreen")), { threshold: 0.35 }).observe(root);
  document.addEventListener("visibilitychange", () => (document.hidden ? hold("hidden") : release("hidden")));

  /* controls */
  $("[data-house-next]", root).addEventListener("click", next);
  $("[data-house-prev]", root).addEventListener("click", prev);
  dotsHost.addEventListener("click", (e) => { const d = e.target.closest("[data-house-dot]"); if (d) go(Number(d.dataset.houseDot) + 1); });
  root.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
  });
  // Tabbing into a room that is not the active one brings it forward (clipped ancestors must not scroll).
  track.addEventListener("focusin", (e) => {
    const room = e.target.closest(".room");
    viewport.scrollLeft = 0;
    const k = all.indexOf(room);
    if (k > 0 && k <= n && k !== i) go(k);
  });

  /* swipe / drag with a snap */
  let startX = 0, dx = 0, dragging = false, moved = false, pid = null;
  viewport.addEventListener("dragstart", (e) => e.preventDefault());   // images and links must not start a native drag (it cancels the pointer)
  viewport.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    startX = e.clientX; dx = 0; dragging = true; moved = false; pid = e.pointerId;
    hold("drag");
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== pid) return;
    dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 8) { moved = true; viewport.setPointerCapture(pid); viewport.classList.add("is-dragging"); }
    if (moved) { track.style.transition = "none"; track.style.transform = `translate3d(${xOf(i) + dx}px,0,0)`; }
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove("is-dragging");
    if (moved) { if (dx < -60) next(); else if (dx > 60) prev(); else go(i); }
    release("drag");
  };
  viewport.addEventListener("pointerup", end);
  viewport.addEventListener("pointercancel", end);
  // A drag must not also follow the link it started on.
  viewport.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

  addEventListener("resize", () => place(i, false));
  go(1, { animate: false });
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

