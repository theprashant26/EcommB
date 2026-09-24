/* ==========================================================================
   Motion core (§11)
   - Registers GSAP plugins once.
   - gsap.matchMedia() with three contexts: desktop motion, mobile motion,
     reduced motion. Reduced motion = no ScrollSmoother, no pin, no scrub,
     no parallax, no loops: final states only.
   - Owns the ScrollSmoother instance and pauses it while any overlay
     (offcanvas, modal, search) is open.
   - Shared helpers used by page modules.
   ========================================================================== */

import { hasGSAP } from "./format.js";

export const MQ = {
  isDesktop: "(min-width: 992px) and (prefers-reduced-motion: no-preference)",
  isMobile:  "(max-width: 991.98px) and (prefers-reduced-motion: no-preference)",
  reduce:    "(prefers-reduced-motion: reduce)",
};

let smoother = null;
let mm = null;
const pauseReasons = new Set();

export const getSmoother = () => smoother;

/** True when ScrollSmoother is actually driving the page (not native touch scrolling). */
const isSmoothing = () =>
  !!smoother && getComputedStyle(smoother.wrapper()).position === "fixed";

/**
 * Boot motion for a page.
 * @param {(conditions:{isDesktop:boolean,isMobile:boolean,reduce:boolean}, ctx:object|null) => (void|Function)} setup
 *        Page animations. Runs inside the matchMedia context, so everything it
 *        creates is reverted automatically when the context changes.
 */
// Overlay tracking starts as soon as this module loads, so a bag or menu opened
// before motion starts (it starts on first intent on the home page) is known
// to the smoother when it is created.
wireOverlayPausing();

export function initMotion(setup) {
  wireHashLinks();

  if (!hasGSAP()) {
    // CDN unavailable: the site still works, just without motion.
    document.documentElement.classList.add("no-gsap");
    setup?.({ isDesktop: false, isMobile: false, reduce: true }, null);
    return;
  }

  // Scripts arrived: stop the <head> watchdog from dropping html.motion-ok.
  document.documentElement.classList.add("motion-live");

  const plugins = ["ScrollTrigger", "ScrollSmoother", "SplitText", "DrawSVGPlugin", "Flip"]
    .map((n) => window[n]).filter(Boolean);
  gsap.registerPlugin(...plugins);
  gsap.defaults({ ease: "power4.out", duration: 0.9 });

  mm = gsap.matchMedia();
  mm.add(MQ, (ctx) => {
    const c = ctx.conditions;
    if (!c.reduce && window.ScrollSmoother) {
      smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.1,
        effects: true,
        smoothTouch: false,
      });
      if (pauseReasons.size) smoother.paused(true);
      // On desktop ScrollSmoother fixes the wrapper; .is-fixed lets Bootstrap
      // compensate for the scrollbar it hides while an offcanvas is open.
      // (On touch devices, smoothTouch:false leaves the wrapper in normal flow.)
      if (isSmoothing()) smoother.wrapper().classList.add("is-fixed");
    }
    const pageCleanup = setup?.(c, ctx);
    return () => {
      if (typeof pageCleanup === "function") pageCleanup();
      document.getElementById("smooth-wrapper")?.classList.remove("is-fixed");
      smoother = null;
    };
  });

  // Layout settles after fonts and late images: re-measure every trigger.
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  const onLoad = () => { refresh(); scrollToHash(location.hash, false); };
  document.fonts?.ready.then(refresh);
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });

  // Clean up when the page is really unloaded (keep state for bfcache restores).
  window.addEventListener("pagehide", (e) => { if (!e.persisted) mm?.revert(); });
}

/* ---------- boot helpers (pages rendered from data) ---------- */

/**
 * Resolves once the deferred CDN scripts (Bootstrap, GSAP + plugins, vanilla-tilt)
 * have run. Pages whose module is loaded with `async` render their content first
 * and start motion only after this. An async module can run after parsing but
 * before the deferred scripts, so readyState is not enough: wait for the last of
 * them, or for DOMContentLoaded (fired after every deferred script, loaded or not).
 */
export function whenScriptsReady() {
  return new Promise((resolve) => {
    const nav = performance.getEntriesByType("navigation")[0];
    if (window.VanillaTilt || (nav && nav.domContentLoadedEventEnd > 0)) return resolve();
    document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
  });
}
/** Give the main thread back (lets the browser paint / handle input between chunks of work). */
export const yieldToMain = () => (globalThis.scheduler?.yield
  ? scheduler.yield()
  : new Promise((resolve) => setTimeout(resolve, 0)));
/** Resolves just after the next paint. */
export const afterPaint = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

/* ---------- keyboard focus ---------- */

/**
 * ScrollSmoother's own focus handling brings a focused element into the viewport
 * (and keeps native scrolling in sync, so it stays in place). Fixed bars (the header,
 * the product page's buy bar) can still cover the element: just after it, if a
 * keyboard-focused element is not clear of them, centre it.
 */
document.addEventListener("focusin", (e) => {
  const el = e.target;
  if (!smoother || !(el instanceof Element) || !el.matches(":focus-visible")) return;
  // Pinned, scrubbed or self-managed areas (the PDP gallery, the home map cards and rooms) handle focus themselves.
  if (el.closest("[data-gallery-frame], [data-focus-managed]")) return;
  setTimeout(() => {
    if (document.activeElement !== el) return;
    const r = el.getBoundingClientRect();
    const top = Math.max(0, document.getElementById("site-top")?.getBoundingClientRect().bottom || 0);
    const bar = document.querySelector(".buybar.is-shown");
    const bottom = innerHeight - (bar ? bar.offsetHeight : 0);
    if (r.top < top || r.bottom > bottom) smoother?.scrollTo(el, true, "center center");
  }, 60);
});

/* ---------- scroll locking for overlays ---------- */

/** pauseScroll("bag", true) … pauseScroll("bag", false). Reference-counted by reason. */
export function pauseScroll(reason, paused) {
  if (paused) pauseReasons.add(reason); else pauseReasons.delete(reason);
  const locked = pauseReasons.size > 0;
  if (smoother) smoother.paused(locked);
  // When native scrolling is in charge (touch, reduced motion, no GSAP) lock it natively too.
  document.documentElement.classList.toggle("is-scroll-locked", locked && !isSmoothing());
}

function wireOverlayPausing() {
  // Bootstrap offcanvas/modal events bubble to document.
  ["offcanvas", "modal"].forEach((kind) => {
    document.addEventListener(`show.bs.${kind}`, (e) => pauseScroll(e.target.id || kind, true));
    document.addEventListener(`hidden.bs.${kind}`, (e) => pauseScroll(e.target.id || kind, false));
  });
}

/* ---------- in-page anchors (native jumps don't work inside ScrollSmoother) ---------- */

export function scrollToHash(hash, smooth = true) {
  if (!hash || hash === "#") return false;
  let target;
  try { target = document.querySelector(hash); } catch { return false; }
  if (!target) return false;
  const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 76;
  if (smoother) smoother.scrollTo(target, smooth, `top ${offset}px`);
  else target.scrollIntoView({ behavior: smooth && !matchMedia(MQ.reduce).matches ? "smooth" : "auto" });
  return true;
}

function wireHashLinks() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href*='#']");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    if (scrollToHash(url.hash)) {
      e.preventDefault();
      history.pushState(null, "", url.hash);
    }
  });
}

/* ---------- shared motion helpers (vocabulary from §11) ---------- */

/** Headline lines rising from masks. Runs after fonts load so lines are measured correctly. */
export function splitLines(el, { trigger = el, start = "top 85%", ctx = null, duration = 1 } = {}) {
  if (!hasGSAP() || !window.SplitText || !el) return;
  const make = () => SplitText.create(el, {
    type: "lines", mask: "lines", autoSplit: true,
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: 110, duration, stagger: 0.08, ease: "power4.out",
        scrollTrigger: { trigger, start, once: true },
      });
    },
  });
  // Split only when the heading is about to be seen: splitting is layout work.
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    document.fonts.ready.then(() => (ctx ? ctx.add(make) : make()));
  }, { rootMargin: "0px 0px 40% 0px" });
  io.observe(el);
  ctx?.add(() => () => io.disconnect());
}

/** Body copy just appears: opacity only, 0.5s. */
export function appear(targets, { start = "top 88%" } = {}) {
  if (!hasGSAP()) return;
  gsap.utils.toArray(targets).forEach((el) => {
    gsap.from(el, { opacity: 0, duration: 0.5, ease: "none", scrollTrigger: { trigger: el, start, once: true } });
  });
}

/** Elements glide in and lock into place with a crisp settle. */
export function settle(targets, vars = {}) {
  if (!hasGSAP()) return;
  return gsap.from(targets, { y: 40, opacity: 0, duration: 1, ease: "power4.out", stagger: 0.1, ...vars });
}
