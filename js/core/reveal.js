/* ==========================================================================
   The image system's motion (Update 02 §5), shared by every page.
   - Unveil: any [data-reveal] opens once as it enters, clip-path
     inset(100% 0 0 0) → inset(0), while its [data-reveal-inner] settles from
     scale 1.08 → 1 (1.1s, power3.out; 0.08s stagger within a row). CSS
     transitions, so it costs nothing per frame. Works for elements added
     later (filters, wishlist, search) through a MutationObserver.
     Whatever is on the first screen before the visitor scrolls is shown
     as is: no unveil on the page's largest image (LCP), no flash.
   - Parallax: [data-parallax] elements drift ±4% inside their frame
     (initParallax, called by pages once ScrollSmoother exists).
   - Skeleton: while an image in a card, gallery, row or menu stage is still
     loading, its ivory frame carries a soft shimmer (static with reduced
     motion); it goes the moment the image arrives.
   Reduced motion: nothing moves, everything is simply there.
   ========================================================================== */

import { reducedMotion, hasGSAP } from "./format.js";

const SEL = "[data-reveal]:not(.is-revealed)";
let io = null;
let scrolled = false;

function reveal(el, delay = 0, animate = true) {
  if (!animate) { el.classList.add("is-revealed"); return; }
  el.style.setProperty("--rv-delay", `${delay}s`);
  el.classList.add("is-revealing");
  // next frame, so the hidden state has been painted and the transition runs
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-revealed")));
  setTimeout(() => { el.classList.remove("is-revealing"); el.style.removeProperty("--rv-delay"); }, 1300 + delay * 1000);
}

function onEnter(entries) {
  const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target);
  if (!entering.length) return;
  // Stagger within each row: group by top edge, order left to right.
  const rows = new Map();
  entering.forEach((el) => {
    io.unobserve(el);
    const r = el.getBoundingClientRect();
    const key = Math.round(r.top / 40);
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push({ el, left: r.left, top: r.top });
  });
  rows.forEach((row) => row.sort((a, b) => a.left - b.left).forEach(({ el }, i) => reveal(el, i * 0.08)));
}

function watch(el) {
  // Before the first scroll, anything already on screen is shown as is (runs before paint: no flash).
  if (!scrolled && el.getBoundingClientRect().top < innerHeight) reveal(el, 0, false);
  else io.observe(el);
}

const SKEL = ".cp-stage .cp-img:not(.cp-img--alt), .pdp-open img, .rrow-img, .dd-feature-img img, .room-prod img";
const FRAME = ".cp-stage, .pdp-slide, .rrow-media, .dd-feature-img, .room-set";
function skeleton(img) {
  if (img.complete && img.naturalWidth) return;
  const frame = img.closest(FRAME);
  if (!frame) return;
  frame.classList.add("is-skel");
  const done = () => frame.classList.remove("is-skel");
  img.addEventListener("load", done, { once: true });
  img.addEventListener("error", done, { once: true });
}

function observe(root) {
  if (root.matches?.(SEL)) watch(root);
  root.querySelectorAll?.(SEL).forEach(watch);
  if (root.matches?.(SKEL)) skeleton(root);
  root.querySelectorAll?.(SKEL).forEach(skeleton);
}

export function initReveals() {
  // Below-the-fold images parked until the page's JS runs (Update 04: nothing competes with the LCP image).
  document.querySelectorAll("img[data-defer-src]").forEach((img) => { img.src = img.dataset.deferSrc; img.removeAttribute("data-defer-src"); });
  if (io) return;
  const html = document.documentElement;
  if (reducedMotion() || !("IntersectionObserver" in window)) {
    html.classList.remove("reveal-on");
    document.querySelectorAll(SKEL).forEach(skeleton);
    new MutationObserver((records) => records.forEach((r) => r.addedNodes.forEach((n) => {
      if (n.nodeType !== 1) return;
      if (n.matches(SKEL)) skeleton(n);
      n.querySelectorAll(SKEL).forEach(skeleton);
    }))).observe(document.body, { childList: true, subtree: true });
    return;
  }
  html.classList.add("reveal-on");
  addEventListener("scroll", () => { scrolled = true; }, { once: true, passive: true });
  io = new IntersectionObserver(onEnter, { rootMargin: "0px 0px -8% 0px" });
  observe(document);
  new MutationObserver((records) => records.forEach((r) =>
    r.addedNodes.forEach((n) => n.nodeType === 1 && observe(n)))).observe(document.body, { childList: true, subtree: true });
}

/** Subtle inner parallax (±amount %) on [data-parallax] images. Needs GSAP + ScrollTrigger. */
export function initParallax(root = document, { amount = 4 } = {}) {
  if (reducedMotion() || !hasGSAP() || !window.ScrollTrigger) return [];
  return [...root.querySelectorAll("[data-parallax]")].map((el) =>
    gsap.fromTo(el, { yPercent: -amount }, {
      yPercent: amount, ease: "none",
      scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
    }));
}
