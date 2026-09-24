/* ==========================================================================
   Spatial product cards (§8.2, reused by shop, brand and PDP in Phase 3).
   - Porcelain panel, render lifted translateZ(50px) above it.
   - vanilla-tilt on fine pointers only.
   - Tubes: pointer x across the card scrubs the 36 spin frames. Frames
     preload on first hover only, with a 1px progress line.
   ========================================================================== */

import { getBrand } from "../data/brands.js";
import { productURL } from "../data/products.js";
import { esc, priceLabel, finePointer, reducedMotion, imageSize } from "./format.js";
import { createSpin, preloadFrames } from "./spin.js";

export const TILT_OPTIONS = { max: 7, speed: 900, perspective: 1100, glare: true, "max-glare": 0.16, scale: 1.015, gyroscope: false };

/** Card markup. opts.price shows the price line (shop), hidden on home; opts.quickView adds the shop's quick view;
 *  opts.eager for cards in the first screen (the page's LCP). */
export function cardHTML(p, { price = false, headingLevel = 3, quickView = false, eager = false } = {}) {
  const brand = getBrand(p.brand);
  const h = `h${headingLevel}`;
  const img = p.images.hero;
  const [w, hgt] = imageSize(img);
  return `
    <article class="pcard" data-product-card data-id="${esc(p.id)}">
      <div class="pcard-panel" data-tilt-card>
        <a class="pcard-media" href="${productURL(p.id)}" tabindex="-1" aria-hidden="true"${p.spin ? ` data-spin-path="${esc(p.spin.path)}" data-spin-frames="${p.spin.frames}"` : ""}>
          <img src="${esc(img)}" alt="" width="${w}" height="${hgt}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
          ${p.spin ? `<canvas class="pcard-spin" aria-hidden="true"></canvas><span class="pcard-load" aria-hidden="true"></span>` : ""}
        </a>
        <div class="pcard-body">
          <p class="pcard-brand">${esc(brand?.name || "")}</p>
          <${h} class="pcard-name"><a href="${productURL(p.id)}">${esc(p.comingSoon ? p.fullName : p.name)}</a></${h}>
          <p class="pcard-benefit">${esc(p.benefit)}</p>
          ${price ? `<p class="pcard-price">${p.comingSoon ? "Arrives soon" : esc(priceLabel(p))}</p>` : ""}
          <div class="pcard-actions">
            <a class="link-cta pcard-cta" href="${productURL(p.id)}" aria-label="Discover ${esc(p.fullName)}">Discover</a>
            ${quickView ? `<button type="button" class="link-cta pcard-quick" data-quick-view="${esc(p.id)}" aria-label="Quick view: ${esc(p.fullName)}">Quick view</button>` : ""}
          </div>
        </div>
      </div>
    </article>`;
}

/**
 * Wire tilt + hover spin on rendered cards. Returns a destroy() so filtering
 * (shop, Flip) can tear instances down and re-init after the re-layout.
 */
export function initCards(root = document) {
  const cards = [...root.querySelectorAll("[data-product-card]")];
  const destroyers = [];
  const canHover = finePointer() && !reducedMotion();

  if (canHover && window.VanillaTilt) {
    // Skip panels that already tilt (never two instances on one element)
    const panels = cards.map((c) => c.querySelector("[data-tilt-card]")).filter((el) => el && !el.vanillaTilt);
    VanillaTilt.init(panels, TILT_OPTIONS);
    destroyers.push(() => panels.forEach((el) => {
      const tilt = el.vanillaTilt;
      if (!tilt) return;
      // vanilla-tilt queues reset() for the next frame on mouseleave (bound at construction,
      // so it can't be cancelled). Stop listening now; destroy two frames later, once any
      // queued reset has run against a live element.
      tilt.removeEventListeners();
      requestAnimationFrame(() => requestAnimationFrame(() => tilt.destroy()));
    }));
  }

  // Hover-to-turn is motion triggered by interaction: off with reduced motion (WCAG 2.3.3).
  // The PDP's 360° viewer stays, because the visitor asks for it explicitly.
  if (canHover) {
    cards.forEach((card) => {
      const media = card.querySelector("[data-spin-path]");
      if (!media) return;
      const canvas = media.querySelector(".pcard-spin");
      const bar = media.querySelector(".pcard-load");
      const path = media.dataset.spinPath;
      const frames = Number(media.dataset.spinFrames) || 36;
      let spin = null;
      let loaded = false;

      const enter = () => {
        if (!spin) {
          spin = createSpin(canvas, { path, frames, mode: "hover", target: card });
          media.classList.add("is-loading");
          preloadFrames(path, frames, { onProgress: (p) => bar.style.setProperty("--p", p.toFixed(3)) })
            .then(() => { loaded = true; media.classList.remove("is-loading"); if (card.matches(":hover")) media.classList.add("is-spinning"); spin.redraw(); });
        }
        if (loaded) media.classList.add("is-spinning");
      };
      const leave = () => {
        media.classList.remove("is-spinning");
        spin?.setFrame(0);
      };
      card.addEventListener("pointerenter", enter);
      card.addEventListener("pointerleave", leave);
      destroyers.push(() => {
        card.removeEventListener("pointerenter", enter);
        card.removeEventListener("pointerleave", leave);
        spin?.destroy();
      });
    });
  }

  return { destroy: () => destroyers.forEach((fn) => fn()) };
}
