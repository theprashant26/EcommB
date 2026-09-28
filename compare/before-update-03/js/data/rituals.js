/* ==========================================================================
   Rituals, written down (Update 02 §6.3, §11) — the alternating rows on the
   home page and rituals.html. One object per row; more rows continue the
   pattern (odd rows image-left, even rows image-right).
   The default link is "Explore now" → the product page; `cta` overrides it.
   Each image is the client's still life with the product on one side and a
   soft empty side for the live text.
   ========================================================================== */

export const RITUALS = [
  { n:"01", productId:"one-origin-face-cleanser", image:"assets/rituals/ritual-01-cleanser.webp",
    title:"Pure Cleanse, Real Care",
    text:"A gentle face cleanser that removes impurities while keeping your skin's natural balance intact. Enriched with sea buckthorn, aloe vera and green tea for a fresh, healthy glow.",
    features:[ {icon:"leaf",label:"100% Natural Ingredients"}, {icon:"droplet",label:"Gentle & Hydrating"}, {icon:"flask-conical",label:"Free from Harsh Chemicals"} ] },
  { n:"02", productId:"larrive-body-spray", image:"assets/rituals/ritual-02-larrive.webp",
    title:"Fragrance That Stays With You",
    text:"A premium body spray crafted for modern living. Long-lasting fragrance with a touch of elegance, making every day feel special.",
    features:[ {icon:"sparkles",label:"Long Lasting"}, {icon:"leaf",label:"Premium Fragrance"}, {icon:"heart",label:"For Everyday Confidence"} ] },
  { n:"03", productId:null, image:"assets/rituals/ritual-03-moisturiser.webp", cta:{ label:"Notify me", href:"#newsletter" },
    // TODO(client): Face Moisturiser (50 g, jojoba oil & vitamin E) from your reference is not in the product list yet
    title:"Nourishment You Can Feel",
    text:"A lightweight moisturiser that deeply hydrates and strengthens your skin barrier. Infused with jojoba oil and vitamin E for soft, smooth and healthy skin.",
    features:[ {icon:"droplet",label:"Deep Hydration"}, {icon:"shield-check",label:"Strengthens Skin Barrier"}, {icon:"sparkles",label:"Soft & Smooth Skin"} ] },
  { n:"04", productId:"perfume-no2", image:"assets/rituals/ritual-04-no2.webp",
    title:"A Touch of Elegance, Everyday",
    text:"A signature fragrance that blends sophistication with freshness. Crafted for those who appreciate the finer things in life.",
    features:[ {icon:"flower-2",label:"Unique Fragrance"}, {icon:"gem",label:"Elevates Your Mood"}, {icon:"clock",label:"Perfect For Daily Wear"} ] },
];
// Rows alternate automatically: odd rows image-left, even rows image-right. The default link is "Explore now" → the product page.
// Add the Body Lotion row when a matching still-life image arrives (TODO(client)).
