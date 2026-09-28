/* ==========================================================================
   Depth layers (§10) — pointer parallax for layered scenes.
   createDepth(container, layers:[{ el, depth }], { rotate, rotateEl })
   - Each layer translates `depth` px opposite to the pointer.
   - `rotateEl` (default: container) tilts up to ±`rotate`° in rotateX/Y;
     its parent should carry the `perspective`.
   - Uses gsap.quickTo (0.8s, power3.out). Disabled on coarse pointers and
     with reduced motion. Only listens while the container is on screen.
   Reused by the home hero, the brand hero and the PDP perfume images.
   ========================================================================== */

import { finePointer, reducedMotion, hasGSAP } from "./format.js";

export function createDepth(container, layers = [], { rotate = 2.5, rotateEl = container } = {}) {
  if (!container || !hasGSAP() || !finePointer() || reducedMotion()) return { destroy() {} };

  const q = (el, prop) => gsap.quickTo(el, prop, { duration: 0.8, ease: "power3.out" });
  const movers = layers.filter((l) => l.el).map((l) => ({ depth: l.depth, x: q(l.el, "x"), y: q(l.el, "y") }));
  const rx = rotate ? q(rotateEl, "rotationX") : null;
  const ry = rotate ? q(rotateEl, "rotationY") : null;
  if (rotate) gsap.set(rotateEl, { transformStyle: "preserve-3d" });

  let rect = container.getBoundingClientRect();
  let dirty = false;   // re-measure lazily on the next pointer move, never on scroll
  let active = false;

  const onMove = (e) => {
    if (!active) return;
    if (dirty) { rect = container.getBoundingClientRect(); dirty = false; }
    // -1 … 1 from the container centre
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    const cx = Math.max(-1, Math.min(1, nx));
    const cy = Math.max(-1, Math.min(1, ny));
    movers.forEach((m) => { m.x(-cx * m.depth); m.y(-cy * m.depth); });
    if (rx) { rx(cy * rotate); ry(-cx * rotate); }
  };
  const reset = () => {
    movers.forEach((m) => { m.x(0); m.y(0); });
    if (rx) { rx(0); ry(0); }
  };
  const measure = () => { dirty = true; };

  const io = new IntersectionObserver(([entry]) => {
    active = entry.isIntersecting;
    if (active) measure(); else reset();
  });
  io.observe(container);

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("scroll", measure, { passive: true });
  window.addEventListener("resize", measure);
  document.documentElement.addEventListener("pointerleave", reset);

  return {
    destroy() {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      document.documentElement.removeEventListener("pointerleave", reset);
      gsap.set([rotateEl, ...layers.map((l) => l.el)], { clearProps: "x,y,rotationX,rotationY" });
    },
  };
}
