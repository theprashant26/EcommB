/* ==========================================================================
   Lightbox (Update 02 §9.2) — a full-screen image viewer on white, shared by
   "Read the label" on the home page and the product gallery.

   openLightbox({ items:[{ src, hd?, alt, caption? }], index, from?, onClose? })
   - Opens from the clicked image (FLIP: from its place into the viewer),
     then swaps to the HD file once that has loaded. Neighbours preload.
   - Main image fitted to 88vh; prev/next, counter ("2 / 5"), close; a
     thumbnail strip along the bottom.
   - Zoom: click (or the zoom button) toggles 2.5× and the image pans with the
     pointer; on touch: pinch, double-tap, and swipe to change image.
   - Keyboard: ←/→, Esc; focus is trapped; the page is scroll-locked.
   ========================================================================== */

import { esc, icon, $, $$, reducedMotion, hasGSAP, thumbOf } from "./format.js";
import { pauseScroll } from "./motion.js";

const ZOOM = 2.5;
let root, img, stage, countEl, capEl, thumbs, zoomBtn;
let items = [], index = 0, lastFocus = null, onCloseCb = null, open = false;
const view = { s: 1, x: 0, y: 0 };

function build() {
  if (root) return;
  root = document.createElement("div");
  root.className = "lb";
  root.id = "lightbox";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "Image viewer");
  root.hidden = true;
  root.innerHTML = `
    <div class="lb-top">
      <p class="lb-count coords" aria-live="polite" data-lb-count></p>
      <div class="lb-tools">
        <button type="button" class="lb-btn" data-lb-zoom aria-pressed="false" aria-label="Zoom in">${icon("zoom-in")}</button>
        <button type="button" class="lb-btn" data-lb-close aria-label="Close the image viewer">${icon("x")}</button>
      </div>
    </div>
    <div class="lb-stage" data-lb-stage>
      <button type="button" class="lb-btn lb-nav lb-prev" data-lb-prev aria-label="Previous image">${icon("chevron-left")}</button>
      <figure class="lb-figure"><img class="lb-img" alt="" data-lb-img draggable="false"></figure>
      <button type="button" class="lb-btn lb-nav lb-next" data-lb-next aria-label="Next image">${icon("chevron-right")}</button>
    </div>
    <p class="lb-caption" data-lb-caption></p>
    <ol class="lb-thumbs" data-lb-thumbs></ol>`;
  document.body.appendChild(root);
  img = $("[data-lb-img]", root);
  stage = $("[data-lb-stage]", root);
  countEl = $("[data-lb-count]", root);
  capEl = $("[data-lb-caption]", root);
  thumbs = $("[data-lb-thumbs]", root);
  zoomBtn = $("[data-lb-zoom]", root);

  $("[data-lb-close]", root).addEventListener("click", close);
  $("[data-lb-prev]", root).addEventListener("click", () => go(index - 1));
  $("[data-lb-next]", root).addEventListener("click", () => go(index + 1));
  zoomBtn.addEventListener("click", () => toggleZoom());
  thumbs.addEventListener("click", (e) => {
    const t = e.target.closest("[data-lb-thumb]");
    if (t) go(Number(t.dataset.lbThumb));
  });
  document.addEventListener("keydown", (e) => { if (open) onKey(e); });
  // Clicking the image must not drop focus out of the dialog (the keyboard keeps working).
  img.addEventListener("pointerdown", () => { if (!root.contains(document.activeElement)) $("[data-lb-close]", root).focus({ preventScroll: true }); });
  wirePointer();
}

/* ---------- open / close ---------- */

export function openLightbox({ items: list, index: start = 0, from = null, onClose = null }) {
  build();
  items = list.filter((it) => it && it.src);
  if (!items.length) return;
  index = Math.max(0, Math.min(items.length - 1, start));
  onCloseCb = onClose;
  lastFocus = document.activeElement;
  open = true;
  thumbs.innerHTML = items.map((it, i) => `
    <li><button type="button" class="lb-thumb" data-lb-thumb="${i}" aria-label="Show image ${i + 1}: ${esc(it.alt || "")}">
      <img src="${esc(thumbOf(it.src))}" alt="" loading="lazy" decoding="async"></button></li>`).join("");
  thumbs.hidden = items.length < 2;
  $$(".lb-nav", root).forEach((b) => { b.hidden = items.length < 2; });
  root.hidden = false;
  document.documentElement.classList.add("lb-open");
  pauseScroll("lightbox", true);
  show(index, { from });
  requestAnimationFrame(() => $("[data-lb-close]", root).focus());
}

export function close() {
  if (!open) return;
  open = false;
  resetZoom(false);
  const done = () => {
    root.hidden = true;
    document.documentElement.classList.remove("lb-open");
    pauseScroll("lightbox", false);
    lastFocus?.focus?.({ preventScroll: true });
    onCloseCb?.();
  };
  if (hasGSAP() && !reducedMotion()) gsap.to(root, { opacity: 0, duration: 0.3, ease: "power2.out", onComplete: () => { gsap.set(root, { opacity: 1 }); done(); } });
  else done();
}

/* ---------- showing an image ---------- */

function show(i, { from = null } = {}) {
  index = (i + items.length) % items.length;
  const it = items[index];
  resetZoom(false);
  img.alt = it.alt || "";
  img.src = it.src;
  countEl.textContent = `${index + 1} / ${items.length}`;
  capEl.textContent = it.caption || "";
  capEl.hidden = !it.caption;
  $$(".lb-thumb", thumbs).forEach((t, k) => t.setAttribute("aria-current", String(k === index)));
  const t = $(`[data-lb-thumb="${index}"]`, thumbs);
  if (t) thumbs.scrollLeft = t.offsetLeft - thumbs.offsetLeft - (thumbs.clientWidth - t.offsetWidth) / 2;   // the strip only, never the page

  const animate = hasGSAP() && !reducedMotion();
  if (from && animate) {
    // FLIP: from the clicked image's place into the viewer.
    const a = from.getBoundingClientRect();
    const whenSized = img.complete && img.naturalWidth ? Promise.resolve() : img.decode().catch(() => {});
    gsap.set(root, { backgroundColor: "rgba(255,255,255,0)" });
    gsap.set(img, { opacity: 0 });
    whenSized.then(() => {
      const b = img.getBoundingClientRect();
      if (!b.width || !a.width) { gsap.set(img, { opacity: 1 }); gsap.set(root, { clearProps: "backgroundColor" }); return; }
      gsap.fromTo(img, {
        opacity: 1, x: a.left + a.width / 2 - (b.left + b.width / 2), y: a.top + a.height / 2 - (b.top + b.height / 2),
        scale: Math.min(a.width / b.width, a.height / b.height),
      }, { x: 0, y: 0, scale: 1, duration: 0.6, ease: "power3.out", clearProps: "transform" });
      gsap.to(root, { backgroundColor: "rgba(255,255,255,1)", duration: 0.4, ease: "none", clearProps: "backgroundColor" });
      gsap.fromTo($$(".lb-top, .lb-nav, .lb-thumbs, .lb-caption", root), { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.25, ease: "none" });
    });
  } else if (animate) {
    gsap.fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
  }

  // Swap to the HD file once it has decoded; then warm up the neighbours.
  if (it.hd && it.hd !== it.src) {
    const hd = new Image();
    hd.decoding = "async";
    hd.src = it.hd;
    hd.decode().then(() => { if (items[index] === it) img.src = it.hd; }).catch(() => {});
  }
  [index + 1, index - 1].forEach((k) => {
    const n = items[(k + items.length) % items.length];
    if (n) { const pre = new Image(); pre.src = n.hd || n.src; }
  });
}

function go(i) { if (items.length > 1) show(i); }

/* ---------- zoom + pan ---------- */

function apply() {
  img.style.transform = view.s === 1 ? "" : `translate(${view.x}px, ${view.y}px) scale(${view.s})`;
  root.classList.toggle("is-zoomed", view.s > 1);
  zoomBtn.setAttribute("aria-pressed", String(view.s > 1));
  zoomBtn.setAttribute("aria-label", view.s > 1 ? "Zoom out" : "Zoom in");
  zoomBtn.innerHTML = icon(view.s > 1 ? "zoom-out" : "zoom-in");
}

function clamp() {
  const w = img.offsetWidth, h = img.offsetHeight;
  const mx = (w * (view.s - 1)) / 2, my = (h * (view.s - 1)) / 2;
  view.x = Math.max(-mx, Math.min(mx, view.x));
  view.y = Math.max(-my, Math.min(my, view.y));
}

/** Pan so the point under (clientX, clientY) stays under the pointer at the current scale. */
function panTo(clientX, clientY) {
  const r = img.getBoundingClientRect();
  const w = img.offsetWidth, h = img.offsetHeight;
  // pointer as a fraction of the unscaled image box
  const cx = r.left + r.width / 2 - view.x, cy = r.top + r.height / 2 - view.y;
  const fx = (clientX - (cx - w / 2)) / w, fy = (clientY - (cy - h / 2)) / h;
  view.x = (0.5 - fx) * w * (view.s - 1);
  view.y = (0.5 - fy) * h * (view.s - 1);
  clamp();
}

function toggleZoom(point) {
  if (view.s > 1) { resetZoom(); return; }
  view.s = ZOOM;
  if (point) panTo(point.x, point.y); else { view.x = 0; view.y = 0; }
  img.classList.add("is-easing");
  apply();
}

function resetZoom(ease = true) {
  view.s = 1; view.x = 0; view.y = 0;
  img.classList.toggle("is-easing", ease);
  apply();
}

function wirePointer() {
  const pts = new Map();
  let pinch = null, swipe = null, lastTap = 0, moved = false;

  img.addEventListener("pointerdown", (e) => {
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    img.setPointerCapture(e.pointerId);
    moved = false;
    img.classList.remove("is-easing");
    if (pts.size === 2) {
      const [p1, p2] = [...pts.values()];
      pinch = { d: Math.hypot(p1.x - p2.x, p1.y - p2.y), s: view.s };
      swipe = null;
    } else if (e.pointerType !== "mouse") {
      swipe = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    }
  });

  img.addEventListener("pointermove", (e) => {
    // Desktop: when zoomed, the image follows the pointer.
    if (e.pointerType === "mouse" && !pts.size) {
      if (view.s > 1) { panTo(e.clientX, e.clientY); apply(); }
      return;
    }
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pts.size === 2) {
      const [p1, p2] = [...pts.values()];
      view.s = Math.max(1, Math.min(4, pinch.s * Math.hypot(p1.x - p2.x, p1.y - p2.y) / pinch.d));
      clamp(); apply(); moved = true;
    } else if (swipe) {
      const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved = true;
      if (view.s > 1) { view.x = swipe.vx + dx; view.y = swipe.vy + dy; clamp(); apply(); }
      else img.style.transform = `translateX(${dx}px)`;
    }
  });

  const end = (e) => {
    const wasSwipe = swipe;
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (e.pointerType === "mouse") {
      if (!moved) toggleZoom({ x: e.clientX, y: e.clientY });
      return;
    }
    if (wasSwipe && pts.size === 0) {
      swipe = null;
      const dx = e.clientX - wasSwipe.x;
      if (view.s === 1) {
        img.classList.add("is-easing");
        img.style.transform = "";
        if (Math.abs(dx) > 50) { go(index + (dx < 0 ? 1 : -1)); return; }
      }
      // Double-tap toggles zoom at the tapped point.
      if (!moved) {
        const now = Date.now();
        if (now - lastTap < 300) { toggleZoom({ x: e.clientX, y: e.clientY }); lastTap = 0; }
        else lastTap = now;
      }
    }
  };
  img.addEventListener("pointerup", end);
  img.addEventListener("pointercancel", end);
  // Click on the empty stage (not the image or the arrows) closes nothing; the white is calm.
}

/* ---------- keyboard ---------- */

function onKey(e) {
  if (e.key === "Escape") { e.preventDefault(); if (view.s > 1) resetZoom(); else close(); return; }
  if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); return; }
  if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); return; }
  if (e.key === "Tab") {
    if (!root.contains(document.activeElement)) { e.preventDefault(); $("[data-lb-close]", root).focus(); return; }
    const f = $$("button:not([hidden])", root).filter((b) => b.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}
