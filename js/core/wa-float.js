/* ==========================================================================
   The WhatsApp button (its markup is the "whatsapp" partial, its link comes from CONFIG.social).
   It is fixed bottom right, clear of the buy bar and the footer's last row by layout. Controls that
   scroll or stay pinned under it (the House arrows, the turn controls, the sample-ratings notes, the
   map's Replay, a toast) make it step aside: as one comes near, it hides at once, and it fades back in
   once they have moved on. Checked once at start (a restored scroll or #link), then on scroll, resize and toasts.
   ========================================================================== */

const PROTECT = [
  "[data-house-prev]", "[data-house-next]", ".house-dots", ".turn-foot button", ".turn-toggle button",
  ".sample-ratings-note", ".map-replay:not([hidden])", ".toast-msg",
].join(", ");   // (the buy bar is cleared by the button's position)
const GAP = 40;         // px of look-ahead: a control moving fast (ScrollSmoother) is caught before it arrives
const SETTLE = 1400;    // ms of checks after the last scroll (ScrollSmoother eases the page after the wheel)

export function initWaFloat() {
  const wa = document.querySelector(".wa-float");
  if (!wa) return;
  let raf = 0, until = 0;

  const under = () => {
    const a = wa.getBoundingClientRect();
    for (const el of document.querySelectorAll(PROTECT)) {
      const b = el.getBoundingClientRect();
      if (b.width && b.height && b.right > a.left - GAP && b.left < a.right + GAP && b.bottom > a.top - GAP && b.top < a.bottom + GAP) return true;
    }
    return false;
  };
  const frame = () => {
    raf = 0;
    wa.classList.toggle("is-yielding", under());
    if (performance.now() < until) raf = requestAnimationFrame(frame);
  };
  const check = () => {
    until = performance.now() + SETTLE;
    if (!raf) raf = requestAnimationFrame(frame);
  };

  addEventListener("scroll", check, { passive: true });
  addEventListener("resize", check);
  const toasts = document.getElementById("toast-region");
  if (toasts) new MutationObserver(check).observe(toasts, { childList: true, subtree: true, attributes: true });
  check();
}
