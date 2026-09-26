# Update 03 — client changes, round 2 (Design B, Maison)

This file adds to `PROMPT-B-MAISON.md`, `UPDATE-01-LOGO.md` and `UPDATE-02-CLIENT-CHANGES.md`. Where they disagree, this file wins. Everything not mentioned here stays exactly as it is now.

The client reviewed the live site and asked for the changes below. The design bar from Update 02 §0 still applies: clean, premium, elegant motion, nothing flashy, nothing overlapping.

**A theme runs through this round: the client prefers things that move on their own over things driven by scrolling.** Wherever this update says "auto movement":
- Remove the ScrollTrigger pin and scrub for that section.
- Play the motion automatically while the section is in view.
- Pause it on hover or focus, and when the section is off-screen or the tab is hidden.
- With `prefers-reduced-motion`, don't autoplay; show the final or first state with manual controls.

**Phases.** Stop after each one and report what changed:
- **A:** Logo fix and data changes.
- **B:** Hero collage and the Categories section.
- **C:** Auto movement for Turn it, the map and The House.
- **D:** Compact size and the second L'Arrivé product.
- **E:** Product page.
- **F:** QA.

---

## 0. First: the logo is still missing

The live site still shows the text "Jiai Life" (`logo-interim`) because `assets/brand/jiai-wordmark.svg` was never added. **The logo files are included in this update's `assets/brand/` folder.**

- Replace the interim text in the header with the inline contents of `jiai-wordmark.svg`, and put `jiai-logo.svg` in the footer, exactly as `UPDATE-01-LOGO.md` describes (including the red-dot drop on load).
- The favicons and `og-maison.jpg` in the same folder replace the old ones; keep the existing tags.
- After pushing, confirm that `assets/brand/jiai-wordmark.svg` loads on the live site.

---

## 1. New files in this update

| Path | What it is | Use |
|---|---|---|
| `assets/brand/*` | Client logo (wordmark, lockup, white versions, PNGs), favicons, `og-maison.jpg` | §0 |
| `assets/hero/hero-origin.webp` | Portrait crop of the One Origin still-life (cleanser on stone) | Small card in the hero collage |
| `assets/categories/category-skin.webp`, `category-fragrance.webp`, `category-new.webp`, `category-compact.webp` | Landscape category images (~1.6:1) | Categories section (§3) |
| `assets/products/larrive/larrive-02-placeholder.webp` (+`.png`) | A wine-glass version of the L'Arrivé bottle. **Placeholder** until the client sends the real product | Second L'Arrivé product (§8) |
| `assets/products/{cleanser,lotion,larrive}/{key}-compact-compare.webp` | The full size and the compact size side by side | Compact page and the compact option on product pages |

Existing images used in this update: `assets/products/larrive/larrive-campaign.webp` (large hero card) and the product renders.

---

## 2. Hero — two overlapping image cards (replaces the current layered hero)

The client wants the hero to look like their reference: **two rounded photo cards overlapping**. A large product photograph sits at the top left, and a smaller photograph overlaps its bottom-right corner and extends past its right edge. Remove the current plinth hero (`maison-backdrop` / `maison-products` layers) and the giant type behind the products.

- **Layout (desktop):**
  - Left, columns 1–6:
    - The H1 "From origin to arrival." (Cormorant Garamond 500, `clamp(56px, 6.6vw, 112px)`, line-height .95).
    - The paragraph "A house of considered brands. Skincare from a single source, fragrance with a touch of Paris, and every piece traceable to where it began."
    - Two buttons: "Shop the four" (primary) and "Trace an origin" (link).
    - A line of coordinates under them in the small coordinates style.
  - Right, columns 7–12: the collage. The whole hero is `min-height: 100svh` with the content vertically centred.
- **The two cards:**
  - **Card A (large):** 4:5, about 74% of the collage width, top-left, radius 18px, `overflow:hidden`. Image: `larrive-campaign.webp`, `object-fit:cover`, `object-position: 50% 40%`. This dark, luxurious image plays the same role as the dark bottle in the client's reference.
  - **Card B (small):** 3:4, about 42% of the collage width. It overlaps Card A's lower-right corner, with about a third of its width extending beyond Card A's right edge, and sits about 16% above Card A's bottom edge. Image: `hero-origin.webp`. Same radius, and a soft shadow `0 30px 60px -24px rgba(20,16,12,.45)`.
  - **The idea:** the pair *is* the headline. The warm, sunlit One Origin card is the **origin**; the dark evening L'Arrivé card is the **arrival**.
- **Caption chips:** each card has a small chip inside its bottom-left corner — Card A: "L'Arrivé · Paris 48.86° N", Card B: "One Origin · Leh 34.15° N".
  - Style: white at 86% opacity with `backdrop-filter: blur(8px)`, Manrope 12px, charcoal, radius 999px.
  - On hover, the chip extends to "Shop L'Arrivé →" / "Shop One Origin →". Each card links to its brand page.
- **Motion (clean and elegant):**
  - **Load:** Card A unveils first (`clip-path` from the bottom, 1.1s, with its image scaling 1.12 → 1). Card B follows 0.25s later, sliding in 40px from the right while unveiling. The H1 rises by line. The whole sequence is under 1.8s.
  - **Idle:** Card A's image does a slow Ken Burns (scale 1 → 1.06, 14s, yoyo). Card B floats gently (y ±10px, 7s sine).
  - **Pointer (desktop):** Card A moves 8px and Card B 18px opposite the pointer, and the collage tilts up to ±3° (`gsap.quickTo`).
  - **Reduced motion:** everything static.
- **Slides (data-driven, ready for more photos):** create `js/data/hero.js` with a `HERO` array of slides, each `{ a:{src, alt, caption, href}, b:{src, alt, caption, href} }`. It starts with the one slide above. With more than one slide, cross-fade both cards every 7 seconds (pause on hover).
  - `TODO(client)`: lifestyle photographs like the client's reference (a person using the product). Four portrait shots, at least 1600px tall: a man spraying L'Arrivé in a rush-hour metro (their original ad idea), a woman using the One Origin cleanser, body lotion after a bath, and Nº 2 in an evening setting.
- **Mobile:** text first, then the collage (Card A 82% of the width, Card B 48% overlapping its bottom right), with no pointer effects.
- **Performance:** preload `larrive-campaign.webp` with `fetchpriority="high"` (it is the LCP image), and remove the preloads of the old hero layers.

---

## 3. "Categories You Might Like" (replaces the hero's four product tabs)

Remove the strip of four product tabs under the hero. Directly after the hero, add the section from the client's reference:

- **Heading and intro:**
  - The H2 "Categories You Might Like".
  - Below it, the paragraph "Discover collections curated for every ritual, moment and preference. From everyday skincare to signature fragrance, find what feels like you." (max 70ch, `--zinc`).
- **Grid:**
  - **Desktop:** 2 columns, 24px gap, with staggered heights as in the reference. The left column holds a tall tile (`clamp(380px, 34vw, 500px)`) above a short one (`clamp(320px, 28vw, 420px)`); the right column is short, then tall.
  - **Tablet:** 2 equal columns.
  - **Mobile:** 1 column, 300px tiles.
- **Tile:**
  - Radius 16px, image `object-fit:cover`.
  - A bottom scrim: `linear-gradient(to top, rgba(20,16,12,.62) 0%, rgba(20,16,12,.18) 45%, transparent 70%)`.
  - Content bottom-left, 32px padding: title (Cormorant Garamond 500, `clamp(30px, 2.8vw, 44px)`, white), one-line description (Manrope 14px, white at 88%, max 42ch), and the button "Explore Collection" (white background, charcoal Manrope 500 13px, radius 999px, 10px/18px padding, arrow icon).
  - Text must always be readable: never place text over the bright part of an image without the scrim.
- **Motion:**
  - Reveal: the tiles unveil (clip-path and scale 1.08 → 1, stagger .1).
  - Hover: the image scales to 1.05 over 1.2s, the scrim deepens slightly, and the button arrow slides 4px.
- **Data:** a new `js/data/categories.js`:

```js
export const CATEGORIES = [
  { title:"Skin Care",    text:"Gentle, single-source skincare for every morning and night.",          href:"shop.html?category=skin",      image:"assets/categories/category-skin.webp",      pos:"30% 50%" },
  { title:"Fragrance",    text:"Long-lasting scents with a touch of Paris, made for every day.",        href:"shop.html?category=fragrance", image:"assets/categories/category-fragrance.webp", pos:"65% 50%" },
  { title:"Compact Size", text:"Your favourites in travel-ready sizes, for the bag, the desk, the road.", href:"compact.html",                image:"assets/categories/category-compact.webp",   pos:"50% 60%" },
  { title:"New Arrivals", text:"The newest pieces in the house, including Nº 2.",                      href:"shop.html?sort=new",           image:"assets/categories/category-new.webp",       pos:"60% 50%" },
];
```

---

## 4. "Turn it in your hand" — auto movement

- **Remove the pin and scroll scrub.** The section becomes a normal section (height `min(100svh, 920px)`), with the heading and the Face/Body toggle as now.
- **Autoplay:** when the section is ≥40% in view, the HD spin plays by itself as a calm presentation, looping:
  - hold at 0° (2.4s, callout 1)
  - turn to 90° (0.9s, `power2.inOut` through the frames), hold (callout 2)
  - turn to 180°, hold (callout 3, "Scan the code to trace your origin.")
  - turn to 270°, hold (callout 4)
  - turn back to 0°
- **Callouts:** they fade and slide in 12px while the tube holds, then fade out as it turns.
- **Controls under the canvas:**
  - A pause/play button.
  - Four small stop dots (clicking one turns to that angle and holds).
  - "Read the label" (as now).
  - A thin progress line showing the time left at the current stop.
- **Interaction:**
  - Hover pauses the autoplay (desktop). Drag to turn by hand; autoplay resumes 3s after the last drag.
  - Touch: swipe to turn; resume after 4s.
  - Switching Face/Body cross-fades and restarts from 0°.
- **Pausing and loading:**
  - Pause when off-screen or the tab is hidden.
  - Show frame 0 immediately and start autoplay only once the frames are loaded.
  - Keep the HD frames, the no-upscale rule and the ivory spotlight disc.
- **Reduced motion:** no autoplay; frame 0 with the four callouts shown as a list, and the dots working as manual controls.

---

## 5. "Every piece has coordinates." (map) — auto movement

- **Remove the pin and scroll scrub.**
- **Tidy the layout.** Put the heading and intro text **above** the map with clear spacing (48–64px). Remove the white boxes behind the heading and intro that currently cut into the dot grid; nothing should sit on top of the dots except the pins, labels and story cards.
- **Autoplay:** when the section is 35% in view, play the journey once (~5.5s):
  1. The plane tilts from flat to `rotateX(52deg) rotateZ(-6deg)` (1.6s).
  2. The Paris → New Delhi route draws (1.4s), then Leh → New Delhi (1s).
  3. The pins drop with a crisp settle (stagger .15), and the labels fade in.
  4. The two story cards slide in.
- **After the journey:**
  - The map keeps a slow idle sway (`rotateZ` ±1.5°, 12s sine loop) with softly pulsing pins.
  - A small text button "Replay the journey" (icon `i-rotate-ccw`) replays it.
- **Reduced motion:** the final state, static.

---

## 6. The House

1. **Heading block:** keep "The house." with its paragraph exactly as originally designed. This block has not changed since the first commit; do not restyle it. **Restore the room counter** ("1 of 3", tabular numerals) that Update 02 removed. It now works as the carousel's position indicator. `TODO(client)`: the client asked to "reverse to previous design" here; confirm whether anything else is meant.
2. **Rooms become an auto-moving carousel.** No pin and no scroll-driven horizontal movement.
   - **Size:** each room card is `min(1040px, 72vw)` wide and `clamp(420px, 60vh, 560px)` tall (smaller than before), with a 28px gap. The next card peeks in from the right; inactive cards sit at 0.55 opacity and scale .96.
   - **Autoplay:** advance every 5s (0.9s slide, `power3.inOut`) and loop forever. Loop seamlessly by cloning the first and last cards; no rewind jump.
   - **Controls:** prev/next buttons (48px white circles with a soft shadow and chevron icons), dots, the "1 of 3" counter, and a thin autoplay progress bar. Swipe or drag with a snap. Keyboard ←/→ when focused.
   - **Pausing:** pause on hover or focus, and when off-screen. Reduced motion: no autoplay.
   - **Content:** keep the Update 02 room template (ivory, leaf light, text left, plinth and products right), scaled to the smaller card:
     - Brand name: `clamp(36px, 3.6vw, 56px)`.
     - Products: at most `min(42vh, 380px)` tall.
     - Motion: as a card becomes active, its products rise 16px into place.
   - **L'Arrivé room:** shows both L'Arrivé products (data-driven; see §8).

---

## 7. Header — Compact size

- **Shop dropdown:** the "Shop" column becomes Shop all, New arrivals, Bestsellers, **Compact size**. "Compact size" links to `compact.html`. Add it to the mobile menu's Shop group too.
- **Shop page:** add a "Compact size" chip to the filter row (`?size=compact`).
- **New page `compact.html`**, using the same header/footer partials:
  - A short hero: H1 "Compact size.", the line "Your favourites in travel-ready sizes, for the bag, the desk and the road.", and the image `category-compact.webp` in an ivory stage.
  - A grid of all compact variants, using the card component. Each card has the badge "Compact · 30 ml" (or its size), the compact price, "Shop Now" (to `product.html?id=…&size=compact`) and "Add to Cart" (adds the compact size).
  - A "See the difference" row with the `*-compact-compare.webp` images and captions ("100 ml and 30 ml").
  - The newsletter at the end.
- **Compact card images:** use the product's normal image with `cardScale` about .62, so compact pieces visibly read smaller than full sizes in a grid.

---

## 8. Data — sizes and the second L'Arrivé product

**Sizes.** Add a `sizes` array to each product. The first entry is the default.

```js
// Face Cleanser
sizes:[ { key:"full",    label:"100 ml",           price:649, mrp:null },
        { key:"compact", label:"30 ml · Compact",  price:249, mrp:null, compare:"assets/products/cleanser/cleanser-compact-compare.webp" } ], // TODO(client): compact size + price
// Body Lotion
sizes:[ { key:"full", label:"100 ml", price:749 }, { key:"compact", label:"30 ml · Compact", price:299, compare:"assets/products/lotion/lotion-compact-compare.webp" } ],   // TODO(client)
// L'Arrivé
sizes:[ { key:"full", label:"150 ml", price:899 }, { key:"compact", label:"20 ml · Pocket", price:299, compare:"assets/products/larrive/larrive-compact-compare.webp" } ], // TODO(client)
```

- **Product page:** the size selector lists all sizes. Choosing one updates the price, MRP, discount, sticky bar and URL (`?size=compact`). The compact size adds its comparison image as the first gallery image.
- **Cart:** a line item is identified by `id + size`. The cart shows the size label on each line. Existing saved carts without a size migrate to `"full"`.
- **Listings:** show the default size's price. The compact page uses the compact entries.

**Second L'Arrivé product** (the client is adding one more). It is a placeholder until the name and details arrive:

```js
{ id:"larrive-02", brand:"larrive", name:"L’Arrivé (name to be revealed)", fullName:"L’Arrivé — new fragrance (name to be revealed)",
  benefit:"A new fragrance from L’Arrivé", category:"fragrance", subcategory:"body-spray", ritual:"evening", tags:["new"],
  comingSoon:true, cardScale:.9, originId:"paris",
  images:{ hero:"assets/products/larrive/larrive-02-placeholder.webp" },
  gallery:[ { src:"assets/products/larrive/larrive-02-placeholder.webp", hd:"assets/products/larrive/larrive-02-placeholder.png", alt:"L’Arrivé new fragrance, placeholder bottle" } ] }
// TODO(client): real name, size, price, notes and photo; then set comingSoon:false
```

Because every menu, room and grid is data-driven, it must now appear automatically:
- the Brands dropdown under L'Arrivé (two products)
- the Origins dropdown
- the L'Arrivé room and brand page
- the shop and search

Coming-soon cards show "Notify me" instead of "Add to Cart".

---

## 9. Product page

1. **Rating next to the share button.**
   - The top row of the buy box becomes: the brand label on the left, and on the right a **rating badge** followed by the share icon.
   - The badge is a pill: 1px `--line` border, radius 999px, 6px/12px padding, Manrope 500 13px, reading "4.5 ★ | 64 ratings" with a charcoal star. Clicking it smooth-scrolls to Ratings & Reviews.
   - Render it from each product's data on **every** product page (it is missing on the Body Lotion page today). Products without ratings show "No ratings yet" in `--zinc` (no pill); coming-soon products show nothing.
   - Remove the separate rating line under the name so it appears only once.
2. **"How to Use" becomes its own tab, right after the specification.**
   - Tabs, in order: **Product Details · How to Use · Product Description · Special Features**.
   - **How to Use:** the numbered steps (01, 02, 03 …) with generous spacing, Manrope 16px, and a small icon per step where one fits (`i-droplet`, `i-sparkles`, `i-check`).
   - **Product Description:** now shows only the description; remove the "How to use" block from it.
   - **Mobile:** the tab row scrolls horizontally.

---

## 10. Acceptance checklist

0. **Logo:** the client's logo shows in the header and footer, and `assets/brand/jiai-wordmark.svg` loads on the live site.
1. **Hero:** two overlapping rounded image cards, as in the client's reference, with caption chips, a calm load reveal, idle motion and pointer depth. The old layered hero is gone.
2. **Categories:** "Categories You Might Like" replaces the four product tabs, as a staggered 2×2 grid built from `categories.js`, with readable text and "Explore Collection" buttons.
3. **Turn it in your hand** plays by itself with holds and callouts. No pinning. Pause/play, dots, drag and Face/Body all work.
4. **The map journey** plays by itself once in view, then sways softly, with a replay button. The heading sits above the map, with no white boxes over the dots.
5. **The House:** the heading is unchanged and the "1 of 3" counter is back.
6. **The House rooms** are smaller cards in an auto-advancing, looping carousel with arrows, dots, swipe and pause on hover.
7. **Compact size:** it appears in the Shop dropdown, mobile menu and shop filters, and `compact.html` lists the compact variants. Sizes work on product pages and in the cart.
8. **Second L'Arrivé product:** it appears under L'Arrivé in the Brands and Origins dropdowns, the L'Arrivé room, the brand page, the shop and search.
9. **Rating badge:** it sits beside the share button on every product page with ratings, including Body Lotion.
10. **How to Use** is its own tab, directly after Product Details.

Test at 360, 390, 768, 1024, 1280, 1440 and 1920 px, with reduced motion, keyboard only, and on iOS Safari. Lighthouse mobile Performance stays ≥ 90. Relative paths only. Push, then add a short changelog to `README.md`.
