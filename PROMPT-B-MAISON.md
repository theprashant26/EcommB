# Jiai Life — Design B “Maison: from origin to arrival” — Build brief for the coding agent

Read this whole file before writing any code. Build exactly what it describes. Where information is missing, use the placeholder values given here and mark them `TODO(client)` in code comments. Do not stop to ask questions.

---

## 0. How to work

- Build a **static, multi-page website** with HTML5, CSS3, vanilla JavaScript (ES modules), **Bootstrap 5.3.8** and **GSAP 3.15.0** (with ScrollSmoother, ScrollTrigger, SplitText, DrawSVG, Flip). There is no WebGL requirement in this design: its 3D is spatial (CSS 3D transforms, layered depth and pre-rendered 360° image sequences). No React, no build step. It must run from static hosting (the client is on Bluehost shared hosting).
- The folder `assets/` already exists in the project root with every image and graphic you need. **Do not rename, re-export or replace these files**, and do not download stock images. Where real photography is required (farm, harvest, Paris), build the styled photo slot described in §9 — the client will supply real photos.
- Serve the site with a local server while developing (VS Code Live Server, or `python -m http.server 5500`).
- Work in the phases in §14. Finish and self-check each phase before starting the next.
- Keep the header and footer markup identical on every page and wrap them in `<!-- PARTIAL:header START -->` … `<!-- PARTIAL:header END -->` (same for footer, bag, search). This makes a later move to server templates a copy-paste job.

---

## 1. Client and brief (from the client meeting)

- **Jiai Life** is a neutral umbrella, a *house of brands* (like Innovist with Bare Anatomy, Sunscoop, Chemist at Play). Today it has 2 brands and 4 products. The client plans 7–10 brands with 6–7 variants each, so **every listing, menu and filter must be data-driven and scale** without redesign.
- Brands now: **One Origin** (skincare, “single source purity”, organic sea-buckthorn) and **L’Arrivé** (fragrance, “Une touche de Paris”, French for “arrived”). A second perfume is coming; its name is not known yet.
- Products now: One Origin Face Cleanser, One Origin Organic Moisturizing Body Lotion, L’Arrivé Premium Body Spray for Men, Perfume Nº 2 (placeholder).
- Audience: office-goers and college students who want a **luxury feel at a premium-but-not-ultra price**.
- The site is **lifestyle first, shop second**: a visitor must understand a product (what it does, what is inside, where it is from, how to use it) *before* the price and buy button. But the **products themselves must appear fast** — visible in the hero and in the very next section.
- **Traceability is the client’s big idea.** Every One Origin tube carries a QR/geotag. Scanning it opens a page showing the mountains (Ladakh), the field, the woman who harvested it and the product details — “real stuff, not a mix-and-match story”. L’Arrivé’s “touch of Paris” must feel equally real.
- L’Arrivé: “not for somebody who is trying hard”. It lasts **up to 10 hours** (office at 8, still there in the evening). His ad idea: rush-hour metro, everyone running, one calm man who has simply *arrived*.
- The client likes **simple, sober, to-the-point** websites and said **load time is very important**. He studied Innovist.com, Ajio Luxe and Dior. He wants a **white background and a light theme**.

---

## 2. The concept: from origin to arrival

The two brands already tell a story when read together: **One Origin** (where it begins) and **L’Arrivé** (where it arrives). Design B turns that into the whole site. Jiai Life is a Parisian-editorial *maison* in white and black, and every piece in it has **coordinates**: the sea-buckthorn’s field in Ladakh, the touch of Paris, the customer’s own city. The visual language is cartographic and couture at the same time — coordinates, route lines, geotag pins and altitude marks, set against oversized Didone type and gallery-white plinths.

Design principles:

1. **Gallery white, editorial black.** A pure white page, true black display type, and one accent: sea-buckthorn orange. It is used only for routes, pins and active states, because orange is literally the colour of the origin.
2. **Depth you can feel.** Every hero is built from separate layers (backdrop, type, products) that move at different depths. Big type sits *behind* the products, so the page reads as physical space.
3. **Things arrive and settle.** Motion is precise and confident: elements glide in and lock into place with a crisp settle (`power4.out`). Lines draw, pins drop, counters tick. There is no floaty or wobbly motion.
4. **Every product can be turned in your hand.** The tubes turn 360° from real pre-rendered frames, scrubbed by scroll or drag.
5. **Sober and scalable.** The layout is Innovist-clear under the Dior-and-Ajio-Luxe polish: brand rooms, clean grids, and filters that scale to 10 brands.
6. **Products first, price after story.**

Avoid the generic template look: no uppercase tracked-out eyebrow labels above every heading, no italicising or colouring a single word inside a headline (italic is used only for full lines), no identical rounded card grids with the same soft grey shadow, no “→” appended to every button, no fade-up on every block, no monospace fonts.

---

## 3. Stack and exact includes

`<head>` on every page:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..600;1,6..96,400..500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="css/main.css">
<link rel="icon" href="assets/brand/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="assets/brand/favicon-180.png">
```

Before `</body>` (all `defer`):

```html
<script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollSmoother.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/SplitText.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/DrawSVGPlugin.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/Flip.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/vanilla-tilt@1.8.1/dist/vanilla-tilt.min.js"></script>
<script type="module" src="js/pages/home.js"></script> <!-- one entry per page -->
```

All GSAP plugins are free since GSAP 3.13. Register them once: `gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, DrawSVGPlugin, Flip)`.

**ScrollSmoother structure.** Wrap the page content in `<div id="smooth-wrapper"><div id="smooth-content">…</div></div>`. The fixed header, the Bootstrap offcanvases/modals, the search overlay and the toasts must live **outside** the wrapper (fixed elements inside a transformed parent break). Create it with:

```js
ScrollSmoother.create({ smooth:1.1, effects:true, smoothTouch:false })
```

Use its `data-speed` / `data-lag` attributes for layer depth. Pause it while an offcanvas or modal is open (`smoother.paused(true)`).

### Folder structure

```
/index.html  /shop.html  /product.html  /brand.html  /origin.html  /about.html
/assets/                      (provided — do not modify)
/css/main.css                 (tokens → base → layout → components → pages, with clear section comments)
/js/data/config.js  brands.js  products.js  origins.js
/js/core/motion.js            (ScrollSmoother + GSAP setup, reduced-motion handling, shared helpers)
/js/core/header.js  bag.js  search.js  depth.js  spin.js  map3d.js  toast.js  format.js
/js/pages/home.js  shop.js  product.js  brand.js  origin.js  about.js
/.htaccess                    (§12)
```

Use Bootstrap for the grid, offcanvas, modal, accordion, collapse and utilities, restyled through CSS variables so nothing looks like default Bootstrap.

---

## 4. Design tokens

```css
:root{
  /* colour */
  --white:#FFFFFF;        /* page */
  --porcelain:#F5F6F7;    /* cool secondary surface */
  --line:#E4E7EA;         /* hairlines, graticule */
  --black:#000000;        /* display type, primary buttons */
  --graphite:#33383D;     /* body text */
  --zinc:#7C8590;         /* secondary text, coordinates */
  --origin:#E8762B;       /* sea-buckthorn orange: the only accent (routes, pins, active, bag count, focus) */
  /* brand-context colours, only inside that brand's areas */
  --oo-brown:#993C1D; --oo-orange:#D85A30; --oo-green:#3B6D11; --oo-blush:#FBF1ED;
  --la-black:#0E1116; --la-silver:#9AA7B4; --la-mist:#EEF1F4;

  /* type */
  --font-display:"Bodoni Moda", "Didot", "Bodoni 72", Georgia, serif;
  --font-body:"Jost", "Futura", "Avenir Next", system-ui, sans-serif;

  /* layout */
  --container:1440px;
  --gutter:clamp(20px, 4vw, 64px);
  --section:clamp(88px, 13vh, 168px);
  --radius:2px;          /* crisp, near-square corners everywhere except pins (round) */

  /* motion */
  --ease-settle:cubic-bezier(.16,1,.3,1);
}
```

**Typography scale (fluid).** Use Bodoni Moda’s optical-size axis: large sizes use `font-variation-settings:"opsz" 96`, text sizes use `"opsz" 11`.

| Role | Font | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|---|
| Giant layer type (hero) | Bodoni Moda | `clamp(72px, 13vw, 232px)` | 400 | 0.92 | -0.03em |
| H1 | Bodoni Moda | `clamp(44px, 6vw, 96px)` | 400 | 1.02 | -0.02em |
| H2 | Bodoni Moda | `clamp(34px, 4.4vw, 68px)` | 400 | 1.06 | -0.015em |
| H3 | Bodoni Moda | `clamp(22px, 2vw, 30px)` | 500 | 1.2 | 0 |
| Body | Jost | 17px (16px mobile) | 400 | 1.65 | 0.005em |
| UI / meta | Jost | 14px | 500 | 1.4 | 0.02em |
| Coordinates | Jost | 14px, `tabular-nums` | 400 | 1.4 | 0.03em, `--zinc` |

Text is left-aligned; only the hero giant type is centred. Body line length stays under 70 characters. Sentence case everywhere, including buttons and navigation. Italic Bodoni is used for whole lines only (taglines such as “Une touche de Paris”).

**Coordinates motif.** Wherever a product, brand or origin appears, it may carry its coordinates in the coordinates style, e.g. “34.15° N, 77.58° E” for One Origin and “48.86° N, 2.35° E” for L’Arrivé. Use it consistently but sparingly (at most once per section).

**Buttons.** Primary: solid `--black`, white text, `--radius` corners, 17px/30px padding. On hover a thin `--origin` line draws along the bottom edge (scaleX 0→1, 0.45s) and the label nudges up 1px. Secondary: text link whose underline draws on hover. Focus: 2px `--origin` outline, 3px offset.

**Graticule.** Hairline map grid lines (`--line`) are allowed as a background device in the map section and the origin page only.

---

## 5. Asset map (everything in `/assets`)

| File(s) | What it is | Use it for |
|---|---|---|
| `scenes/maison-backdrop.jpg` | Gallery room: white wall, floor and three white plinths, 2400×1400 | Hero layer 1 (back) |
| `scenes/maison-products.webp` (+`.png`) | The four products standing on those plinths with their shadows, transparent, same 2400×1400 canvas | Hero layer 3 (front) |
| `scenes/maison-composite.jpg` (+`.webp`) | Both layers flattened | Poster, OG, reduced motion |
| `scenes/maison-mobile.jpg` | 1080×1080 crop | Hero on phones |
| `spin/cleanser/000–035.webp`, `spin/lotion/000–035.webp` | 36 frames of a real 3D render turning 360° (10° steps), 720×1080, transparent, soft shadow baked in | The “Turn it” section, card hover and the PDP 360° viewer |
| `products/cleanser/cleanser-hero.png` (+`.webp`) | Cleanser tube 3/4 view with soft shadow, transparent | Cards, PDP |
| `products/cleanser/cleanser-cutout.png`, `-angle.png`, `-back.png` | No-shadow view, 40° view, back label with the “Scan to trace your origin” QR | PDP gallery, origin explainer |
| `products/lotion/lotion-*.png` | Same four views for the body lotion | Same |
| `products/larrive/larrive-cutout-light.png` (+`.webp`) | L’Arrivé cut out, glass lifted to read on white | Default L’Arrivé image |
| `products/larrive/larrive-cutout.png` | Cutout with the original dark glass | L’Arrivé room |
| `products/larrive/larrive-campaign.jpg` (+`.webp`) | The dark campaign image, 1024×1536 | Framed as an artwork in a thick white mat (§8.5) — never full-bleed |
| `products/perfume-02/perfume-02-placeholder.png` | Placeholder bottle marked “Nº 2” | Until the client sends the real one |
| `map/map-dots.png` | Dot-matrix map of Europe to India, 2400 px wide, transparent | The 3D map plane |
| `map/routes.svg` | Same size/aspect: `#route-paris`, `#route-leh` (paths) and pins `#pin-leh`, `#pin-paris`, `#pin-delhi`. Colours use `var(--route)` | Overlay on the map; inline it |
| `map/pins.json` | Each pin’s `x_pct`/`y_pct` on the map image | Positioning HTML labels |
| `illustrations/ladakh-range.svg` (+`.png`) | Layered ridges `.ridge-0`…`.ridge-4`, `.snow`, `.sun`, with fills driven by `--ridge-0`…`--ridge-4`, `--snow`, `--sun` | One Origin room, origin page |
| `illustrations/sea-buckthorn.svg` | `#branch` (stroked), `#leaves` (`.leaf`), `#berries` (`.berry`) | One Origin room, PDP ingredients |
| `brand/hanko-jiai-black.png`, `jiai-seal.svg` | The 自愛 seal, a nod to the Japanese name | Footer and about page only (small) |
| `brand/og-maison.jpg` | 1200×630 social image | `og:image` on every page |
| `overlays/grain.png` | Noise tile | Optional 2.5% grain on the hero only |

Always use `.webp` when available, with explicit `width`/`height`, `loading="lazy"` and `decoding="async"` below the first screen.

---

## 6. Data (single source of truth)

Everything renders from these files. Adding a brand or product must require **only** a data edit.

`js/data/config.js`

```js
export const CONFIG = {
  currency: "INR",
  showPrices: true,               // client may hide prices during the preview
  pricePlacement: "after-story",  // "after-story" | "top" (PDP)
  showComingBrands: false,        // teaser rooms for names mentioned in the meeting; client to approve
  freeShippingOver: 999,          // TODO(client)
};
```

`js/data/brands.js`

```js
export const BRANDS = [
  { id:"one-origin", name:"One Origin", line:"Single source purity", category:"Skin",
    coords:"34.15° N, 77.58° E", originId:"leh-ladakh", status:"live",
    story:"Skincare built on a single, traceable ingredient source. Our sea-buckthorn comes from one place, picked by hand, and every tube carries a code that shows you where.",
    room:{ bg:"var(--oo-blush)", accent:"var(--oo-orange)" } },
  { id:"larrive", name:"L’Arrivé", line:"Une touche de Paris", category:"Fragrance",
    coords:"48.86° N, 2.35° E", originId:"paris", status:"live",
    story:"French for “arrived”. Fragrance for the one who no longer needs to try, made to last from the morning commute to the evening.",
    room:{ bg:"var(--la-mist)", accent:"var(--la-black)" } },
  { id:"jiai-no2", name:"Nº 2", line:"Name to be revealed", category:"Fragrance", status:"coming" }, // TODO(client)
  { id:"black-truth", name:"Black Truth", category:"Coming to the house", status:"teaser" },   // only if CONFIG.showComingBrands
  { id:"white-lie",  name:"White Lie",  category:"Coming to the house", status:"teaser" },
];
```

`js/data/products.js`

```js
export const PRODUCTS = [
  { id:"one-origin-face-cleanser", brand:"one-origin",
    name:"Face Cleanser", fullName:"One Origin Face Cleanser",
    benefit:"Skin brightening and anti-pigmentation", forWho:"For all skin types", size:"100 ml",
    price:649, priceNote:"placeholder",             // TODO(client)
    keyIngredient:"Organic sea-buckthorn",
    claims:["100% natural ingredients","With organic sea-buckthorn","For all skin types"],
    whatItDoes:"A gentle daily cleanser that lifts away the day without stripping skin. Organic sea-buckthorn, prized for its vitamin C and omega-7, helps skin look brighter and more even over time.",
    inside:"Organic sea-buckthorn from a single source, in a formula made with 100% natural ingredients.", // TODO(client): full INCI list
    howTo:["Wet your face with lukewarm water.","Massage a small amount in slow circles for 30 seconds.","Rinse well. Use morning and night."],
    images:{ hero:"assets/products/cleanser/cleanser-hero.webp", cutout:"assets/products/cleanser/cleanser-cutout.png",
             angle:"assets/products/cleanser/cleanser-angle.png", back:"assets/products/cleanser/cleanser-back.png" },
    spin:{ path:"assets/spin/cleanser/", frames:36 }, originId:"leh-ladakh" },

  { id:"one-origin-body-lotion", brand:"one-origin",
    name:"Organic Moisturizing Body Lotion", fullName:"One Origin Organic Moisturizing Body Lotion",
    benefit:"Skin brightening and anti-pigmentation", forWho:"For smoother body", size:"100 ml",
    price:749, priceNote:"placeholder",             // TODO(client)
    keyIngredient:"Organic sea-buckthorn",
    claims:["100% natural ingredients","With organic sea-buckthorn","For smoother skin"],
    whatItDoes:"A light, fast-absorbing lotion that softens and smooths skin from shoulders to heels while helping it look brighter and more even.",
    inside:"Organic sea-buckthorn from a single source, in a formula made with 100% natural ingredients.", // TODO(client)
    howTo:["Apply to clean skin after bathing.","Massage in long strokes until absorbed.","Use daily."],
    images:{ hero:"assets/products/lotion/lotion-hero.webp", cutout:"assets/products/lotion/lotion-cutout.png",
             angle:"assets/products/lotion/lotion-angle.png", back:"assets/products/lotion/lotion-back.png" },
    spin:{ path:"assets/spin/lotion/", frames:36 }, originId:"leh-ladakh" },

  { id:"larrive-body-spray", brand:"larrive",
    name:"L’Arrivé", fullName:"L’Arrivé Premium Body Spray for Men",
    benefit:"Premium body spray for men", size:"150 ml",     // TODO(client): confirm
    price:899, priceNote:"placeholder",             // TODO(client)
    longevityHours:10,
    notes:{ top:["Bergamot","Pink pepper"], heart:["Lavender","Violet leaf"], base:["Vetiver","Amberwood"] }, // TODO(client)
    whatItDoes:"A clean, confident scent made to last up to 10 hours. Spray at eight, still there at six.",
    howTo:["Spray on chest and neck from 15 cm.","Let it settle; don’t rub.","Once is enough for the day."],
    images:{ hero:"assets/products/larrive/larrive-cutout-light.webp", dark:"assets/products/larrive/larrive-cutout.webp",
             campaign:"assets/products/larrive/larrive-campaign.webp" },
    originId:"paris" },

  { id:"perfume-no2", brand:"jiai-no2",
    name:"Nº 2", fullName:"Nº 2 (name to be revealed)", benefit:"A new fragrance from Jiai Life",
    size:"TBC", price:999, priceNote:"placeholder", comingSoon:true,
    images:{ hero:"assets/products/perfume-02/perfume-02-placeholder.webp" } },
];
```

`js/data/origins.js`

```js
export const ORIGINS = {
  "leh-ladakh": { name:"Leh, Ladakh", country:"India", lat:34.1526, lon:77.5771, altitude:"≈3,500 m", code:"IXL", // TODO(client): exact farm
    ingredient:"Sea-buckthorn (Hippophae rhamnoides)", season:"Late August to October",
    text:"High-altitude sea-buckthorn, picked by hand from a single source." },
  "paris": { name:"Paris", country:"France", lat:48.8566, lon:2.3522, code:"CDG",
    text:"A touch of Paris in every bottle." },   // TODO(client): exact perfumery / what is sourced from France
  "new-delhi": { name:"New Delhi", country:"India", lat:28.6139, lon:77.2090, code:"DEL" },
};
export const BATCHES = {
  "OO-LDK-2609-01": { productId:"one-origin-face-cleanser", originId:"leh-ladakh", destinationId:"new-delhi",
    field:"Field 3, Leh valley", harvestedBy:"Harvest team (names from client)", harvestDate:"2026-09-12",
    pressedDate:"2026-09-15", filledDate:"2026-09-20", labReport:"#" },   // TODO(client): all real values
};
```

---

## 7. Global components

**Announcement bar** (optional, from config): a 36px black strip with one useful line in white Jost 13px, e.g. “Free delivery across India on orders over ₹999”. Dismissible.

**Header.** 76px desktop / 60px mobile, white, with a 1px `--line` bottom border once scrolled. It hides on scroll down and shows on scroll up.

- Left: Shop, Brands, Origins.
- Centre: the wordmark “Jiai Life” in Bodoni Moda 30px (`opsz` 96).
- Right: Search, Account, Bag (count in `--origin`).

**Shop mega menu** (desktop): a white sheet that drops from the header (`yPercent -100 → 0`, 0.55s, `power4.out`), with a hairline grid built from data:

- One column per brand, with its coordinates in the coordinates style and its product names.
- A featured tile on the right showing the newest product’s render.
- A “Shop all” link.

Links underline on hover.

**Mobile menu.** A full-screen white Bootstrap offcanvas. Brand names are set large in Bodoni (44px) with coordinates under each. Items slide in with a 0.05s stagger.

**Bag.** A right-side Bootstrap offcanvas, 460px wide, styled like a gallery receipt:

- Each line shows a 72px image, name, size, quantity stepper, price and remove, separated by hairlines.
- Below the lines: the subtotal and a free-delivery progress bar that fills in `--origin`.
- A primary “Checkout” button shows the toast “Checkout connects at launch.”

State lives in `localStorage` under `jiai-bag-v1`. When an item is added, the count flips (3D `rotateX` 90° → 0°, 0.4s) and the product thumbnail arcs into the bag icon.

**Search.** A full-screen white overlay with a huge Bodoni input (`clamp(40px, 6vw, 88px)`). It searches `PRODUCTS` and `BRANDS` as you type; results show a thumbnail, name and brand. Esc closes it.

**Toasts.** Bottom-left, black, 3s.

**Footer.** White with a top hairline. A 4-column grid: Shop (by brand, from data), Help, House and Letters (newsletter). A bottom row shows the coordinates of every live origin plus New Delhi in the coordinates style, the small black seal, and “© 2026 Jiai Life”.

---

## 8. Home page (`index.html`) — section by section

### 8.1 Hero — “From origin to arrival.” (layered depth)

A full viewport (`min-height:100svh`) spatial scene built from three stacked layers inside a `perspective:1400px` container:

1. **Back:** `maison-backdrop.jpg` (`object-fit:cover`, anchored bottom-centre), `data-speed="0.85"`.
2. **Middle:** the giant type, centred in the upper half, in Bodoni 400 black: line 1 “From origin”, line 2 “to arrival.” (the H1, real HTML text, so it is the LCP element), `data-speed="0.92"`.
3. **Front:** `maison-products.webp`, positioned exactly like the backdrop (same size, same `object-fit`/position rules so the products sit on the plinths), `data-speed="1"`.

The type sits behind the products, so the tall L’Arrivé bottle and the tubes overlap the letters. This layering is the signature of the design.

- **Pointer depth** (desktop): the three layers translate by 6px / 14px / 26px opposite to the pointer, and the container rotates up to ±2.5° (`rotateX/rotateY`). Implement with `gsap.quickTo` (duration 0.8, `power3.out`) in `js/core/depth.js`, reusable by other sections.
- **Load sequence** (the page’s one orchestrated moment, ≤1.5s, non-blocking):
  1. The backdrop settles from `scale:1.06` to `1`.
  2. The giant type rises from masks, character by character (SplitText `type:"chars", mask:"lines"`, stagger 0.018, 1s, `power4.out`).
  3. The products layer settles from `y:30, scale:.97` to rest (0.9s).
  4. The sub-copy and buttons follow.
- **Below the giant type**, left-aligned in the bottom-left corner: “A house of considered brands. Skincare from a single source, fragrance with a touch of Paris, and every piece traceable to where it began.” Buttons: “Shop the four” (primary) and “Trace an origin” (link).
- **Bottom bar:** four product tabs (48px thumbnail and name) spread across the bottom of the hero, each linking to its product. The products are reachable from the first screen.
- **On scroll out**, the layers separate: the products move up fastest and the type slowest (ScrollSmoother speeds). This gives a real sense of depth.
- **Mobile:** the giant type is stacked above `maison-mobile.jpg`; pointer depth is replaced by a gentle scroll parallax; the tabs become a horizontal scroll row.
- **Reduced motion:** static `maison-composite.webp` behind the type (type in front), no parallax.

### 8.2 The four — spatial product cards

- H2 “Four to begin with.”, left-aligned, with a single line of coordinates to its right: “Leh 34.15° N / Paris 48.86° N / New Delhi 28.61° N”.
- Four cards in a row on desktop (2×2 on tablet, horizontal snap on mobile). Each card is a porcelain panel (`--porcelain`, 2px radius, no shadow) containing the product render, brand, name, benefit and a “Discover” link. No price here.
- **3D:** give the panel and the product image `transform-style:preserve-3d`, with the image lifted `translateZ(50px)`. Initialise vanilla-tilt on fine pointers only:
  ```js
  { max:7, speed:900, perspective:1100, glare:true, "max-glare":.16, scale:1.015, gyroscope:false }
  ```
  The product visibly floats above its panel as it tilts.
- **Turn on hover** (tubes): moving the pointer horizontally across the card scrubs that tube’s 36 spin frames (frame = pointer x mapped to 0–35), like turning it in your hand. Preload the frames on first hover only, with a 1px progress line while loading.
- **Entrance:** the cards arrive one after another from `z:-120` (via `transformPerspective`), with `rotateX:8° → 0` and opacity, stagger 0.12, `power4.out`. They settle into the wall like pieces being hung.

### 8.3 Turn it in your hand — pinned 360° scrub (the 3D centrepiece)

- Pin a full-viewport section. In the centre is a `<canvas>` drawing the **cleanser spin frames** tied to scroll progress (0 → 35 over about 1.8 viewport heights, `scrub:true`). Draw with `drawImage` from preloaded `ImageBitmap`s, sized for `devicePixelRatio` (capped at 2) and redrawn only when the frame index changes.
- **Callouts** appear at set angles, with a hairline leader line that draws to the product (DrawSVG):
  - 0°: “Face cleanser. Skin brightening and anti-pigmentation.”
  - 90°: “100% natural ingredients, with organic sea-buckthorn.”
  - 180° (the back): “Scan to trace your origin.” The leader points at the QR on the back label.
  - 270°: “100 ml. Stands on its flip cap.”
- A two-state toggle, “Face” / “Body”, switches to the lotion frames. Cross-fade the canvas (0.4s) and keep the same progress.
- Heading at the top left: H2 “Turn it in your hand.”
- **Loading:** show frame 0 immediately (it is the same view as the card). Load the remaining frames when the section is within one viewport (`IntersectionObserver`, `rootMargin:"100% 0px"`), 6 at a time.
- **Mobile:** not pinned. Drag horizontally on the canvas to turn (pointer events, 1 frame per 12px), with a small “Drag to turn” hint.
- **Reduced motion:** show frames 0 and 18 side by side, statically.

### 8.4 Every piece has coordinates — the 3D map

This is the traceability story, the client’s geotag idea.

- **Structure** (`js/core/map3d.js`):
  - A stage with `perspective:1600px`.
  - Inside it, a `.map-plane` with `transform-style:preserve-3d` holding `map-dots.png` (width 100%) and the inline `routes.svg` stacked exactly on top (same aspect ratio).
  - HTML pin labels are positioned by `pins.json` percentages.
- **Scroll sequence** (pinned, `scrub:1`):
  1. The plane starts flat and slightly zoomed (`rotateX:0`, `scale:1.12`).
  2. It tilts back to `rotateX:52deg` with `rotateZ:-6deg` and `scale:1`, and the map becomes a 3D surface.
  3. The routes draw: Paris → New Delhi, then Leh → New Delhi. Keep them dotted by drawing a solid copy of each path inside an SVG `<mask>` with DrawSVG while the visible path keeps `stroke-dasharray`.
  4. The pins drop onto the surface from `translateZ(120px)` to `translateZ(0)` with a crisp settle.
  5. The pulse rings scale softly in a loop.
- **Labels** stand upright as billboards: each label is a child of its pin with `transform: rotateX(-52deg) translateZ(30px)`, so it faces the viewer while the pin lies on the map. Each label has the city name in Bodoni 20px and coordinates underneath.
- **Two story cards** (one per route) slide in beside the map as their route completes:
  - “Sea-buckthorn from Leh, Ladakh. 34.15° N, 77.58° E, grown at about 3,500 m. Picked by hand, pressed, and traceable to its field.” Link: “Trace a tube” → `origin.html?batch=OO-LDK-2609-01`.
  - “A touch of Paris. 48.86° N, 2.35° E. The inspiration and craft behind L’Arrivé.” Link: “Discover L’Arrivé”.
- **Optional desktop detail:** inside this section only, a thin crosshair cursor with a live latitude/longitude readout, computed from the pointer position on the plane.
- **Mobile:** tilt to 38° and show the story cards below the map.
- **Reduced motion:** a flat map with routes fully drawn.

### 8.5 The house — brand rooms (pinned horizontal scroll)

- H2 “The house.” Body: “Jiai Life is a home for considered brands. Each has its own world. All share one belief: caring for yourself is the most elegant act of all.”
- Pin the section and scroll a track of **rooms** horizontally (one room per `BRANDS` entry with `status:"live"` or `"coming"`, plus teasers if `CONFIG.showComingBrands`). Each room is 85vw wide with a 4vw gap, so the next room peeks in. A room counter (“1 of 3”) sits at the bottom, as a real sequence.
  - **One Origin room** (`--oo-blush` background):
    - The inline `ladakh-range.svg` recoloured with warm greys (`--ridge-0:#F4E9E3; --ridge-1:#E9D8CE; --ridge-2:#D9C0B2; --ridge-3:#C4A28F; --ridge-4:#A9826D; --sun:#EF9F27`). The ridges parallax inside the room as it moves (`containerAnimation`).
    - The two tubes on a slim plinth line.
    - The sea-buckthorn SVG animating in (branch DrawSVG, leaves grow, berries pop, all triggered with `containerAnimation`).
    - Copy: the brand story plus “Shop One Origin”.
  - **L’Arrivé room** (`--la-mist` background):
    - `larrive-campaign.webp` framed as an artwork: inside a thick white mat (6% padding) with a hairline outer frame and a small museum label beneath (“L’Arrivé, campaign, 2026”).
    - Beside it, the light cutout on a plinth line, the italic line “Une touche de Paris.” and the brand story.
    - This is the only place the dark image appears; the page stays light around it.
  - **Nº 2 room** (white): the placeholder bottle, softly blurred (`filter: blur(6px)`), which sharpens as the room centres. Copy: “Nº 2. Its name arrives soon.” Button: “Be the first to know”.
  - **Teaser rooms** (if enabled): the brand name set huge in Bodoni outline type (`-webkit-text-stroke:1px`) and “Coming to the house”.
- **Mobile:** rooms stack vertically.

### 8.6 L’Arrivé — “Arrived.” (kinetic type)

- White section, centred composition, with the light cutout of the bottle standing perfectly still on a hairline.
- **The rush** (the client’s metro idea, as typography): three rows of words stream horizontally behind the bottle at different speeds and directions. The words are “Rushing”, “Late”, “Pushing”, “Running”, “Crowded”, “Hurry”, set in Jost 500 `clamp(40px, 7vw, 120px)`, `--line` coloured. They are motion-blurred with an SVG filter (`feGaussianBlur stdDeviation="10 0"`), and their speed is tied to scroll velocity.
- When the section centres, the rows decelerate and fade. Then one word, “Arrived.” (Bodoni 400, black, sharp, no blur), settles into the middle row next to the bottle.
- Copy below: “L’Arrivé is French for ‘arrived’. It isn’t made for trying hard. It’s for the one who walks into the rush and doesn’t hurry.”
- Facts row (value above label): “10 h” (lasts up to 10 hours); “Paris” (une touche de Paris); “For men”.
- Button: “Discover L’Arrivé”.
- **Reduced motion:** static rows at low opacity.

### 8.7 Rituals, written down — journal teasers

- H2 “Rituals, written down.”
- Three editorial entries in an asymmetric layout (one large, two small). Each has an image crop from the provided assets (scene crops or product renders on porcelain), a title and a 2-line summary, linking to `#` for now. Titles:
  - “The 8-to-6 fragrance: wearing L’Arrivé all day”
  - “Why single-origin matters in skincare”
  - “The two-minute cleanse”
- Hover: the image scales 1.04 inside its frame and the title underline draws.

### 8.8 Arrivals, by letter (newsletter) and footer

- H2 “Arrivals, by letter.” Body: “One short letter each season: new brands, new pieces, and the stories behind them.”
- Email input and a “Subscribe” button. On success, show the toast “Subscribed. Your first letter arrives next season.”

---

## 9. Other pages

### 9.1 Product page (`product.html?id=…`) — sticky gallery, story column

Classic luxury layout (Dior-like), rendered from `PRODUCTS` by `id`. Unknown id → the product grid with “That product isn’t here. Here’s everything we make.”

- **Left 7 cols (sticky):** a vertical stack of large images on porcelain (hero, angle, back; the campaign image for L’Arrivé). The first image carries a “360°” button that opens a full-screen turn viewer (drag and scroll-wheel to turn, arrow keys by 10°, spin frames) for the tubes. Perfumes get a pointer-follow tilt (max 5°) instead.
- **Right 5 cols (scrolling):**
  1. Breadcrumbs, then brand (with coordinates), H1 name and benefit.
  2. Claim chips as plain text separated by spacing.
  3. A Bootstrap accordion, **first item open**: “What it does” / “What’s inside” (for One Origin, include the sea-buckthorn SVG; for perfumes, a three-column notes layout, and for L’Arrivé a **10-hour line** — a thin 8:00–18:00 day bar that fills in `--origin` as it enters view) / “How to use” (numbered steps) / “Origin” (mini tilted map with the product’s route, and “Trace your origin”).
  4. **Only after the accordion:** price (Bodoni 36px), quantity, “Add to bag”, and a delivery note.
- **Sticky bottom bar** on mobile (and on desktop once the buy block leaves the viewport): name, price and “Add to bag”. If `CONFIG.showPrices` is false, show “Price at launch” and “Notify me” instead. If `pricePlacement === "top"`, also show the price under the H1.
- **Below:** “Complete the ritual” (other products as tilt cards) and JSON-LD `Product`.

### 9.2 Shop (`shop.html`) — editorial grid

- H1 “The house, all pieces.”
- A horizontal filter row generated from data: All, each brand, Skin, Fragrance. Active chips get an `--origin` underline. Filtering re-lays out with GSAP Flip.
- The grid mixes product cards (same tilt cards as §8.2, with price shown) with a **brand block** after every 3 products: a wide tile with the brand name in Bodoni, coordinates, the story in one line and “Enter the room”. This is the Ajio Luxe editorial rhythm, and it scales as brands grow.
- Quick view opens a modal with the image, short copy and “Add to bag”.

### 9.3 Brand page (`brand.html?b=…`)

- Hero: the brand name set giant behind its lead product (the same three-layer depth trick using a product cutout on a porcelain field), with the italic line and coordinates.
- Then the story, the products (tilt cards), and an origin strip (a slim tilted map with the brand’s route).
- Coming brands get an “Arriving soon” page with the newsletter.

### 9.4 Origin page (`origin.html?batch=…`) — the QR landing page as a boarding pass

This page is opened by scanning the tube, usually on a phone. **Design it mobile-first.** Default batch: `OO-LDK-2609-01`.

1. **Hero:** a **boarding-pass card** for the batch — a white card with a hairline border, a perforation line and two halves.
   - Main half: “From IXL Leh, Ladakh to DEL New Delhi”, the product name, batch code, harvest date and altitude, with a thin route line and a small aircraft-free dot icon.
   - Stub half: the batch code as a large number.
   - The card flips in from `rotateX:-90deg` to `0` (perspective 1000px) with a settle, and the “from” and “to” codes count/type in.
   - This ties the origin to *arrival*.
2. **The route:** the tilted 3D map (the same component as §8.4) showing only Leh → New Delhi, with the Leh pin pulsing and its coordinates.
3. **The journey:** a vertical timeline, a real numbered sequence: Grown → Harvested → Pressed → Formulated → Filled → Arrived with you. Each stop has a date from `BATCHES`. An `--origin` line draws down as you scroll.
4. **Photo slots** for real photography: “The field”, “The harvest”, “The hands”.
   - Each is a 4:5 frame on porcelain with a hairline border, the ridge illustration very faint behind, a museum-style caption (“The harvest. Leh valley, September 2026.”) and a `data-photo` attribute for the real image.
   - Add the code comment `TODO(client): real photos from the farm — do not use stock photography`.
   - They must look intentional, not broken.
5. **Batch facts:** a table in tabular numerals, then a link back to the product.

### 9.5 About (`about.html`)

An editorial long-read. The H1 “Some rituals deserve to be savored.” is set in giant type. Then the client’s text, verbatim, in a single readable column (Jost 19px, line-height 1.75):

- Pull quotes in Bodoni italic (whole lines): “Nothing is excessive. Everything is considered.” and “Caring for yourself is the most elegant act of all.”
- The small black seal with a caption explaining 自愛 (jiai): “the art of loving and honoring yourself”.
- Paragraphs reveal by line as they enter (SplitText lines + mask, 0.8s).

About text (use exactly):

> Jiai Life takes its name from the Japanese word jiai (自愛), the art of loving and honoring yourself. In Japan, true self-care is quiet and intentional. It is found in unhurried mornings, in the stillness of an evening ritual, in a fragrance that lingers like a private memory.
>
> This philosophy inspires every creation in our collection of skin care and perfume. Each formula is composed with restraint and refinement, and each scent is crafted to be worn softly and remembered long after. Nothing is excessive. Everything is considered.
>
> We honor the Japanese principles of harmony, simplicity, and meticulous craftsmanship. The result is a collection that turns the everyday into something quietly extraordinary: a touch of silk on your skin, a whisper of scent at your wrist, a moment that belongs entirely to you.
>
> Jiai Life is for those who understand that caring for yourself is the most elegant act of all.
>
> Welcome to Jiai Life. Indulge in the ritual of self-love.

---

## 10. Spatial and 3D techniques (implementation notes)

- **Depth layers (`depth.js`):** one helper, `createDepth(container, layers:[{el, depth}])`, uses `gsap.quickTo` for pointer parallax plus a `perspective` wrapper tilt. Disable it on coarse pointers and with reduced motion. Reuse it in the hero, brand hero and PDP perfume images.
- **Spin sequence (`spin.js`):** `createSpin(canvas, {path, frames:36, mode:"scroll"|"drag"|"hover"})`.
  - Preload with `fetch` → `createImageBitmap`, cache per product, draw on change only.
  - Frame `i` = `(i * 10)` degrees, and frame 0 faces front.
  - Keep one shared cache so the card hover, the pinned section and the PDP viewer never download a frame twice.
- **3D map (`map3d.js`):** pure CSS 3D with GSAP. Pins are absolutely positioned at `x_pct/y_pct`, and labels are counter-rotated billboards. Routes draw via DrawSVG on mask paths. Recompute nothing on scroll except transforms (no layout thrashing).
- **Tilt cards:** vanilla-tilt on `(hover:hover) and (pointer:fine)` only; the glare stays subtle. Destroy instances on filter re-layout and re-init after Flip completes.
- **Card entrances in 3D:** use `transformPerspective:900` on the tween rather than a parent perspective for elements that also scroll.

---

## 11. Motion system (`js/core/motion.js`)

- Use `gsap.matchMedia()` with three contexts: desktop motion, mobile motion, reduced motion. In reduced motion there is no ScrollSmoother, no pinning, no scrub, no parallax and no auto-loops — just final states.
- Default ease `power4.out`, durations 0.8–1.1s. Precise, with no bounce or elastic.
- **SplitText.** Use `SplitText.create(el, { type:"lines", mask:"lines", autoSplit:true, onSplit(self){ return gsap.from(self.lines, { yPercent:110, duration:1, stagger:.08, ease:"power4.out" }) } })`, after `document.fonts.ready`.
- **Motion vocabulary** (use these, not generic fades):
  - Settle into place.
  - Chars rising from masks (hero only).
  - Hairlines and routes drawing.
  - Pins dropping.
  - Counters ticking (coordinates, dates).
  - Layers separating in depth.

  Body paragraphs just appear, with opacity only, 0.5s.
- Call `ScrollTrigger.refresh()` after `window.load` and after fonts load. Clean up on page hide.

---

## 12. Performance budget and Bluehost

The client stressed speed. Treat these as hard requirements:

- LCP under 2.5s on a mid-range phone on 4G; CLS under 0.05; TBT under 200ms. Lighthouse mobile **Performance ≥ 90**.
- Critical path: HTML, `main.css`, fonts, `maison-backdrop.jpg` and `maison-products.webp` (both with `fetchpriority="high"` and preloaded; add `media` preloads for `maison-mobile.jpg` on small screens). Everything else is lazy: spin frames, SVGs, map and journal images.
- Always use `.webp`, set explicit dimensions, and keep total page weight before interaction under 1.3 MB. Add no other libraries.
- `/.htaccess`:

```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>
<IfModule mod_mime.c>
  AddType image/webp .webp
</IfModule>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## 13. Accessibility and SEO

- Semantic landmarks, one H1 per page, logical headings and meaningful `alt` text. Canvases get `role="img"` and an `aria-label` (e.g. “One Origin Face Cleanser turning 360 degrees”). Decorative layers are `aria-hidden`.
- Everything works by keyboard (menus, mega menu, bag, search, the Face/Body toggle, the 360° viewer with arrow keys, the horizontal rooms via normal tab order). Visible `--origin` focus rings.
- AA contrast: `--graphite` body text on white; never put text on top of the map dots without a white backing.
- Unique titles and meta descriptions; `og:image` = `assets/brand/og-maison.jpg`; JSON-LD `Organization` on home and `Product` on product pages.

---

## 14. Build phases and acceptance checklist

1. **Foundation:** tokens, fonts, header/mega menu/mobile menu, bag, search, footer, data files, ScrollSmoother + GSAP contexts, `.htaccess`.
   - Check: offcanvases work with ScrollSmoother, the bag persists across pages, no console errors.
2. **Home:** sections 8.1–8.8. Build the hero layers first and get the product layer to align with the plinths at every viewport (the same `object-fit`/`object-position` on both layers).
   - Check: the products are visible on the first screen, the type sits behind the products, the pinned spin scrubs smoothly, the map tilts and draws, and Lighthouse mobile Performance is ≥ 90.
3. **Product, shop, brand:** everything renders from data; price after story; sticky bar; Flip filtering.
   - Check: add a fake fifth product and a third brand to the data; confirm menus, shop (with brand blocks), rooms and search update without touching HTML. Then remove them.
4. **Origin and about:** the boarding pass flips in, the journey line draws, and the photo slots look intentional; it must be perfect on a 390px phone.
5. **Polish:** test at 360, 390, 768, 1024, 1280, 1440 and 1920 widths; reduced motion; keyboard only; iOS Safari (`svh` units, no `100vh` jumps); slow-4G throttling.
   - Remove any animation that does not serve the story.

Deliver clean, commented code. Leave a short `README.md` listing every `TODO(client)` value to replace (prices, sizes, notes, farm details, photos, Nº 2 name).
