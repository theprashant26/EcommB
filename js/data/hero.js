/* ==========================================================================
   Home hero collage (Update 03 §2) — two overlapping photo cards.
   Card A (large): the arrival. Card B (small): the origin.
   With more than one slide, both cards cross-fade every 7 seconds (paused on
   hover). The first slide's Card A is the page's LCP image: keep its preload
   in index.html in step with it.
   TODO(client): lifestyle photographs like the reference (a person using the
   product) — four portrait shots, at least 1600px tall: a man spraying
   L'Arrivé in a rush-hour metro, a woman using the One Origin cleanser, body
   lotion after a bath, and Nº 2 in an evening setting. Each becomes a slide.
   ========================================================================== */

export const HERO = [
  {
    a: { src:"assets/products/larrive/larrive-campaign.webp", alt:"L’Arrivé, the dark glass bottle in evening blue light",
         caption:"L’Arrivé · Paris 48.86° N", cta:"Shop L’Arrivé", href:"brand.html?b=larrive", pos:"50% 40%" },
    b: { src:"assets/hero/hero-origin.webp", alt:"One Origin Face Cleanser on stone with sea-buckthorn berries, in morning sun",
         caption:"One Origin · Leh 34.15° N", cta:"Shop One Origin", href:"brand.html?b=one-origin", pos:"50% 50%" },
  },
];
