/* ==========================================================================
   The product card (Update 02 §5) — one component wherever products are listed:
   home "The four", shop, brand pages, combos, "Complete the ritual", wishlist, search.
   - A fixed 4:5 ivory stage; the product stands at 76% of its height, its base
     9% above the bottom, centred on the product itself (not the file), with a
     soft contact shadow. cardScale in products.js evens out tubes and bottles.
   - Wishlist heart top right; brand, name, rating, price below.
   - "Shop Now" + "Add to Cart" (slides up over the stage on hover-capable
     screens, always visible on touch); "Notify me" for coming-soon pieces.
   - Hover: lift 8px + scale 1.03, one light sheen, tubes cross-fade to their
     angle view. All CSS; the unveil on entry is js/core/reveal.js.
   ========================================================================== */

import { getBrand } from "../data/brands.js";
import { CONFIG } from "../data/config.js";
import { productURL, isCombo, comboWorth, comboSaving, comboPieces, brandNameOf } from "../data/products.js";
import { esc, priceHTML, ratingHTML, imageSize, imageFocus, formatPrice, srcsetAttr, SIZES } from "./format.js";
import { wishButtonHTML } from "./wishlist.js";

/** A combo's price (Update 03b): the set price, its struck worth (the pieces bought one by one) and
 *  "Save ₹149" in the accent; opts.long adds the percentage, "Save ₹149 (11% off)", for the product page. */
export function comboPriceHTML(p, { long = false } = {}) {
  if (!CONFIG.showPrices) return priceHTML(p);
  const worth = comboWorth(p);
  const save = comboSaving(p);
  const off = worth ? Math.round((save / worth) * 100) : 0;
  return `<span class="price">${formatPrice(p.price)}</span>` + (save
    ? `<s class="price-mrp"><span class="visually-hidden">Worth </span>${formatPrice(worth)}</s><span class="price-save">Save ${formatPrice(save)}${long ? ` (${off}% off)` : ""}</span>`
    : "");
}

/** Card markup. opts.headingLevel for the name; opts.eager for cards in the first screen ("high" for the page's LCP image, true for the rest of that screen);
 *  opts.remove adds a "Remove" control (wishlist page). Combos carry a "Combo · 2 pieces" badge. */
export function cardHTML(p, { headingLevel = 3, eager = false, remove = false } = {}) {
  const h = `h${headingLevel}`;
  const combo = isCombo(p);
  const src = p.images.card || p.images.hero;
  const alt = p.images.cardHover;
  const [w, hgt] = imageSize(src);
  const f = imageFocus(src);
  const style = `--card-scale:${p.cardScale || 1};--cx:${f.cx};--ptop:${f.top};--pbase:${f.base};--ratio:${(w / hgt).toFixed(4)}`;
  const url = productURL(p.id);
  const name = p.comingSoon ? p.fullName : p.name;
  const action = p.comingSoon
    ? `<button type="button" class="btn-maison btn-cart cp-add" data-notify="${esc(p.id)}"><span>Notify me</span></button>`
    : `<button type="button" class="btn-maison btn-cart cp-add" data-add-to-bag="${esc(p.id)}" aria-label="Add ${esc(p.fullName)} to cart"><span>Add to Cart</span></button>`;
  const badge = combo ? `Combo · ${comboPieces(p)} pieces` : "";

  return `
    <article class="cp${combo ? " cp--combo" : ""}" data-product-card data-id="${esc(p.id)}" style="${style}">
      <div class="cp-stage" data-reveal>
        <a class="cp-media" href="${url}" tabindex="-1" aria-hidden="true" data-reveal-inner>
          <span class="cp-shadow"></span>
          <span class="cp-prod">
            <img class="cp-img" src="${esc(src)}"${srcsetAttr(src, SIZES.card)} alt="" width="${w}" height="${hgt}" ${eager ? (eager === "high" ? 'fetchpriority="high"' : "") : 'loading="lazy"'} decoding="async">
            ${alt ? `<img class="cp-img cp-img--alt" src="${esc(alt)}"${srcsetAttr(alt, SIZES.card)} alt="" width="${imageSize(alt)[0]}" height="${imageSize(alt)[1]}" loading="lazy" decoding="async">` : ""}
          </span>
          <span class="cp-sheen"></span>
        </a>
        ${wishButtonHTML(p, "cp-heart")}
        ${badge ? `<span class="cp-badge">${esc(badge)}</span>` : ""}
      </div>
      <div class="cp-body">
        <p class="t-label cp-brand">${esc(brandNameOf(p, getBrand))}</p>
        <${h} class="cp-name"><a href="${url}">${esc(name)}</a></${h}>
        ${p.comingSoon ? `<p class="cp-soon">Coming soon</p>` : ratingHTML(p)}
        ${p.comingSoon ? "" : `<p class="cp-price">${combo ? comboPriceHTML(p) : priceHTML(p)}</p>`}
        <div class="cp-actions">
          <a class="cp-shop link-cta" href="${url}" aria-label="Shop Now: ${esc(p.fullName)}">Shop Now</a>
          ${remove ? `<button type="button" class="btn-plain cp-remove link-draw" data-wish-remove="${esc(p.id)}">Remove<span class="visually-hidden"> ${esc(p.fullName)}</span></button>` : ""}
          <div class="cp-add-wrap">${action}</div>
        </div>
      </div>
    </article>`;
}

/** Kept for callers from before Update 02: cards are CSS-only now, nothing to wire or tear down. */
export function initCards() {
  return { destroy() {} };
}
