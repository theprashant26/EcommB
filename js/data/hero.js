/* ==========================================================================
   Home hero line-up (the client's request after Update 06: the earlier hero's row of products, but the
   products no longer stand on plinths). The pieces stand side by side on one floor line, left to right.
   tools/sync-partials.py writes the line-up into index.html from this list (image sizes, srcset, the
   preload of the image marked `lcp`), so it paints before any script runs. Re-run `npm run build` after
   a change here.
     productId  the piece (its name and link)
     src        a transparent cut-out (assets/products/…); its size and base line come from
                js/data/image-variants.js (tools/make-image-sizes.py)
     h          its height, as a share of the line-up's (bottles stand a little lower than the tubes)
     lcp        the image the browser paints largest: preloaded with high priority, PAGE BOOT waits for it
   ========================================================================== */

export const HERO_LINEUP = [
  { productId:"one-origin-face-cleanser", src:"assets/products/cleanser/cleanser-cutout.webp", h:1, lcp:true },
  { productId:"one-origin-body-lotion",   src:"assets/products/lotion/lotion-cutout.webp",     h:1 },
  { productId:"larrive-body-spray",       src:"assets/products/larrive/larrive-noir-cutout.webp",  h:.9 },
  { productId:"larrive-auren",            src:"assets/products/larrive/larrive-auren-cutout.webp", h:.9 },
];
