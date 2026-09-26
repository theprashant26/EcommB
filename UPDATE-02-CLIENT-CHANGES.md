# Update 02 — client changes (Design B, Maison)

This file adds to `PROMPT-B-MAISON.md` and `UPDATE-01-LOGO.md`. Where they disagree, this file wins. Everything not mentioned here stays as it is: the layered hero, the 3D map, the boarding-pass origin page, the logo, the data-driven structure and the performance budget.

The client has chosen this design as the base and sent 12 change requests. Each is covered below; §16 maps them one by one. Read the whole file first. Also look at the four images in `reference/`: the client's screenshots of the product page, the lightbox, the product-page sections, and the Rituals layout they want.

---

## 0. The design bar

The client wants the site cleaner and more premium, and the owner of this project wants it to be seriously beautiful. Treat this as a luxury brand launch, not a template fill.

**Every screen needs:**
- Generous white space and one clear focal point.
- Perfect alignment to the grid, and one spacing scale everywhere (4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px).
- Images that are sharp, consistently sized and never touching or overlapping text (except the home hero's deliberate type-behind-products layer).
- Soft, believable shadows. Smooth motion at 60fps. Every hover state considered.

**These make a site look cheap — never do them:**
- Default Bootstrap styling.
- Mismatched image sizes in a row.
- Text colliding with images.
- Hard grey shadows.
- Emoji or mixed icon styles.
- Inconsistent button labels.
- Janky or bouncy animation.
- Placeholder "lorem ipsum".
- Anything flashy.

The client's own words: effects must be clean and elegant, not flashy or distracting.

**Work in five phases.** After each phase, stop and report what changed and how to check it:
- **A:** Global — typography, colours, header and dropdowns, cart and wishlist, the product card, the image system.
- **B:** Home page fixes — The House, Turn it in your hand, Rituals.
- **C:** Brand pages and shop.
- **D:** Product page rebuild.
- **E:** Rituals page, wishlist page, polish and QA.

---

## 1. New files in this update

| Path | What it is | Use |
|---|---|---|
| `assets/products/{cleanser,lotion}/{key}-front.webp` | Straight-on view of the tube, sharp | PDP main image, first gallery image |
| `assets/products/{key}/{key}-front-hd.webp`, `-angle-hd.webp`, `-back-hd.webp` | High-resolution renders (about 2× the old ones) | Lightbox only (lazy-load) |
| `assets/products/{key}/{key}-label.webp`, `-label-hd.webp` | Close-up of the front label; all text readable | Gallery image “Label close-up”, lightbox, the “Read the label” button |
| `assets/spin-hd/{cleanser,lotion}/000–035.webp` | 360° frames at 1200×1800 (old ones were 720×1080) | Turn it in your hand section and the PDP 360° viewer |
| `assets/rituals/ritual-01-cleanser.webp`, `ritual-02-larrive.webp`, `ritual-03-moisturiser.webp`, `ritual-04-no2.webp` | The client’s still-life rows with the baked-in text removed, 1536 px wide. The product sits on one side; the other side is soft empty background meant for live HTML text | Rituals rows (§6.3) |
| `assets/icons/icons.svg` | One SVG sprite of thin line icons (Lucide) plus a WhatsApp glyph | Every icon on the site |
| `reference/*.png` | The client’s reference screenshots | For you to look at only. Add `reference/` to `.gitignore` so it is never published |

**Icons.** Use the sprite everywhere:

```html
<svg class="icon" aria-hidden="true"><use href="assets/icons/icons.svg#i-heart"></use></svg>
```

```css
.icon { width:20px; height:20px; fill:none; stroke:currentColor; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
.icon--filled { fill:currentColor; }          /* filled heart/star */
.icon--solid  { fill:currentColor; stroke:none; }  /* WhatsApp */
```

Available ids: `i-heart i-shopping-bag i-search i-user i-share-2 i-star i-truck i-map-pin i-package-check i-rotate-ccw i-shield-check i-leaf i-droplet i-droplets i-flask-conical i-sparkles i-flower-2 i-gem i-clock i-sun i-moon i-sunrise i-sunset i-zoom-in i-zoom-out i-x i-chevron-left i-chevron-right i-chevron-up i-chevron-down i-plus i-minus i-check i-copy i-mail i-arrow-right i-rotate-3d i-badge-check i-menu i-maximize-2 i-link i-info i-whatsapp`.

Replace any emoji, icon fonts or ad-hoc SVGs with these.

---

## 2. Typography (client item 3)

Replace Bodoni Moda and Jost everywhere, **including prices**, with a cleaner, more premium pair:

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

```css
--font-display: "Cormorant Garamond", "Cormorant", Georgia, serif;   /* headings, the giant hero type, brand names */
--font-body: "Manrope", "Helvetica Neue", Arial, sans-serif;          /* body, UI, buttons, prices, coordinates */
```

| Role | Font | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|---|
| Giant hero type | Cormorant Garamond | `clamp(76px, 13.5vw, 240px)` | 500 | 0.9 | -0.02em |
| H1 | Cormorant Garamond | `clamp(44px, 6vw, 92px)` | 500 | 1.02 | -0.015em |
| H2 | Cormorant Garamond | `clamp(36px, 4.4vw, 64px)` | 500 | 1.05 | -0.01em |
| H3 / product name on PDP | Cormorant Garamond | `clamp(26px, 2.2vw, 34px)` | 600 | 1.15 | 0 |
| Body | Manrope | 16px (15px mobile) | 400 | 1.7 | 0 |
| UI, buttons, nav | Manrope | 14px | 500 | 1.3 | 0.01em |
| Small tracked label | Manrope | 11.5px, uppercase | 600 | 1.3 | 0.18em |
| Product name on cards | Manrope | 15px | 500 | 1.35 | 0 |
| Price on PDP | Manrope | 26px, `tabular-nums lining-nums` | 600 | 1 | 0.01em |
| Price on cards | Manrope | 15px, `tabular-nums` | 600 | 1 | 0.01em |
| MRP (struck) | Manrope | 0.8× the price size | 400 | — | line-through, `--zinc` |
| Coordinates | Manrope | 12.5px, `tabular-nums` | 500 | — | 0.06em, `--zinc` |

Use the small tracked label sparingly: section subtitles such as the client's "A closer look at what makes our formulations unique", and step numbers like "01". Italic Cormorant is for whole lines only (taglines, pull quotes).

**Prices.** Format them with `new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 })`, so they show like "₹649". When a product has an `mrp` above its `price`, show the struck MRP and "{n}% off" in `--accent`. Under the PDP price, add "Inclusive of all taxes" (12px, `--zinc`).

---

## 3. Colour refinement

Keep white `#FFFFFF` as the page, the charcoal text `#2B2B2B`, and the logo red `--origin/--accent: #B5473A`. The client's chosen imagery is warm, sunlit still-life, so the cool greys become warm neutrals that sit well with it:

```css
--ivory:#F7F3EE;     /* image stages, rooms, gallery, cards (replaces cool porcelain #F5F6F7) */
--sand:#EDE6DC;      /* plinths, hover fills */
--line:#E7E1D8;      /* hairlines (replaces #E4E7EA) */
--zinc:#6B6B6B;      /* secondary text */
--success:#3B6D11;   /* "Delivery available", "In stock" (One Origin green, used tiny) */
```

The accent red stays rare. Use it only for: the logo dot, active states, the cart/wishlist counts, the discount percentage, map pins/routes, focus rings and filled wishlist hearts. Rating stars are charcoal.

---

## 4. Header and navigation (client items 1, 2, 6, 10)

**Layout (desktop).**
- **Left:** Shop, Brands, Origins, Rituals, Our story. These are all the tabs from Design 1, mapped into this design.
- **Centre:** the inline logo.
- **Right:** icon + label pairs for Search, Account, Wishlist (count) and **Cart** (count).
- The word "Bag" is gone everywhere: header, drawer title ("Your cart"), toasts ("Added to cart"), buttons. Keep the `localStorage` key `jiai-bag-v1` so existing carts survive.
- Counts are 16px red circles with white Manrope 600 10px numbers. The count pops (scale 1.25 → 1, 0.35s) when it changes.

**Dropdowns** for Shop, Brands and Origins:
- **Opening:** on hover with a 120ms intent delay (close after 200ms of leaving), on click, and by keyboard (Enter/Space opens; Esc closes; arrow keys move between links; focus stays trapped inside while open). On touch devices, the first tap opens and a tap outside closes. Use `aria-expanded` and `aria-controls`.
- **Panel:** a full-width white panel under the header with a 1px `--line` top border and a soft shadow (`0 24px 48px -24px rgba(43,43,43,.18)`). It opens with a 0.45s clip/fade (`power3.out`), and its columns stagger in (0.04s).
- **Behind the panel:** the page gets a very light veil (`rgba(255,255,255,.6)` + `backdrop-filter: blur(4px)`).
- **Data:** everything is generated from `brands.js` / `products.js`, so new brands and products appear automatically.

1. **Shop:**
   - Column "Shop": Shop all, New arrivals, Bestsellers.
   - Column "By category": Skin care, Fragrance.
   - Column "By ritual": Morning, Day, Evening, Night.
   - A featured card on the right (4:5 image `ritual-01-cleanser.webp` cropped to the product, the caption "Rituals, written down." and "Explore").
   - Each link goes to `shop.html` with a filter: `?sort=new`, `?tag=bestseller`, `?category=skin|fragrance`, `?ritual=morning|day|evening|night`.
2. **Brands — products by category:**
   - One column per category (Skin care, Fragrance).
   - Inside each column, each brand name (linking to `brand.html?b=…`) with its products listed underneath: a 48px thumbnail on an ivory circle, the name, and a small "Coming soon" tag where relevant.
3. **Origins — products by brand:**
   - One column per brand.
   - Each column shows the origin name and coordinates (e.g. "Leh, Ladakh · 34.15° N, 77.58° E"), that brand's products, and a link "See the origin".
   - A final column holds a small tilted crop of `map-dots.png` with the red pins, and the link "Trace your tube" (`origin.html?batch=OO-LDK-2609-01`).
4. **Rituals** links to `rituals.html` (§11).
5. **Our story** links to `about.html`.

**Mobile.**
- **Header bar:** icons only (menu, logo, search, wishlist, cart).
- **Menu:** the offcanvas shows the five tabs. Shop, Brands and Origins become accordion groups holding the same content as the desktop dropdowns.

---

## 5. One product card and one image system (client items 4, 6, 9, 10)

Build **one** card component and use it everywhere products are listed:
- "The four" on home
- shop
- brand pages
- "Complete the ritual"
- wishlist page
- search results

This fixes the oversized and inconsistent listing images for good.

**Card structure:**
- **Image stage:** a fixed 4:5 frame, `--ivory` background with a soft radial light (`radial-gradient(120% 90% at 50% 35%, #FFFFFF 0%, var(--ivory) 70%)`). The product sits inside at **76% of the frame height**, bottom-aligned 9% above the frame bottom, `object-fit: contain`, with a soft elliptical contact shadow under it.
  - Tubes and bottles must look the same visual size in every row. Normalise with a per-product `cardScale` in data (default 1; L'Arrivé 0.9; Nº 2 0.88) — no product image may ever overflow its frame.
- **Wishlist heart:** top right, a 36px white circle with the heart icon.
- **Below the image:** the brand (small tracked label), the name, a compact rating ("★ 4.6 (86)"), then the price with optional struck MRP.
- **Actions:** the text link "**Shop Now**" (goes to the product page) and the button "**Add to Cart**".
  - Desktop: the button slides up from the bottom edge of the image stage on hover.
  - Touch screens: it is always visible under the price.
  - Coming-soon products show "Notify me" instead.

**Image system** (applies to every image on the site; clean and elegant, never flashy):
- **Reveal:** images unveil once as they enter: `clip-path: inset(100% 0 0 0)` → `inset(0)` with the image inside scaling from 1.08 → 1, 1.1s, `power3.out`, stagger 0.08 within a row.
- **Card hover:**
  - The product lifts 8px and scales 1.03, and its shadow softens.
  - A single diagonal light sheen sweeps across the stage (a 60% wide white gradient at 25% opacity, 0.9s, once per hover).
  - Tubes cross-fade to their angle view.
- **Large editorial images:** a subtle inner parallax (±4%).
- **Sharpness:** use `srcset`/`sizes` where larger files exist, and give every image explicit `width`/`height` (no layout shift).
- **Plinths:** products on plinths always get a contact shadow. Never use hard `box-shadow` on product images.
- **Warm light** (a touch from Design 1): large stages (rooms, brand hero, PDP main image) may carry `assets/overlays/komorebi-leaves.webp` at 8–10% opacity with `mix-blend-mode:multiply`, slowly drifting (20s sine), for the same soft window-light feeling as the client's photographs. Keep it static with reduced motion.

**Buttons (client item 6):**
- Every purchase button on the site says exactly "**Add to Cart**".
- **Feedback on click:** the label changes to a small spinner, then "Added ✓" for 1.2s. The product thumbnail arcs into the cart icon, the count pops, and the cart drawer opens on desktop (or a toast shows on mobile).

---

## 6. Home page changes

### 6.1 The House (client item 4)

Rebuild the brand rooms on **one shared template** so One Origin, L'Arrivé and Nº 2 look like the same family.

- **Background:** every room uses the same `--ivory` with the soft leaf light (§5). The dark framed L'Arrivé campaign image is removed from the room; it now lives in the L'Arrivé product gallery.
- **Grid:** 12 columns with a text column (cols 1–5) and an image stage (cols 7–12), gap ≥ 6vw. **Nothing overlaps.**
- **Text column:**
  - Room number ("01 / 03"), the brand name (H2), the italic line, and coordinates.
  - A two-line story.
  - The primary button "Shop One Origin" / "Shop L'Arrivé" / "Notify me" (Nº 2).
- **Image stage:**
  - A soft plinth built in CSS: `--sand` to `#F9F6F2` gradient, 6px top radius, a gentle drop shadow, width 64% of the stage.
  - The brand's cutouts stand on it: the two tubes for One Origin, `larrive-cutout-light` for L'Arrivé, the placeholder for Nº 2. Each has a contact shadow.
  - The products' height is capped at `min(56vh, 520px)`, so they never grow into the text.
- **Motion:** as a room scrolls into centre, the products rise 24px into place and the plinth shadow tightens. Nº 2 keeps its blur-to-sharp reveal.
- **Mobile:** stack text above image, with the products at 44vh max.

### 6.2 Turn it in your hand (client item 11)

The client could not read the packaging here. Fix it properly:

1. **Frames:** switch this section to the **HD frames** (`assets/spin-hd/`). Draw the canvas at device resolution, but **never upscale a frame beyond its native size**: cap the canvas CSS height so `cssHeight × devicePixelRatio ≤ 1800`. Preload the HD frames only when the section is within one viewport.
2. **Backdrop:** put a soft ivory spotlight disc behind the tube (a radial gradient 70% of the canvas height). It separates the white tube from the white page.
3. **Rest stops:** map scroll to rotation with holds. At 0°, 90°, 180° and 270° the product **pauses** for about 12% of the section's scroll while that callout shows, then turns on. The customer can actually read it.
4. **Callouts:**
   - White cards with a soft shadow, Manrope 15px `#2B2B2B`, a 14px icon, and a hairline leader line to the product.
   - Contrast AA, and never placed over the product.
   - Texts: 0°: "Face cleanser. Skin brightening and anti-pigmentation." · 90°: "100% natural ingredients, with organic sea-buckthorn." · 180°: "Scan the code to trace your origin." · 270°: "100 ml. Stands on its flip cap."
5. **"Read the label" button:** a secondary button under the canvas opens the lightbox (§9.2) on `{key}-label-hd.webp`, where every word of the label is sharp.
6. **Face / Body toggle** stays.
7. **Mobile:** drag to turn, with snapping to the four rest angles.

### 6.3 Rituals, written down (client item 12)

Replace the journal teasers with the client's **alternating rows**:
- Row 1: image left, text right.
- Row 2: text left, image right.
- Continue alternating for every row.

The rows come from a new data file (§12), so more products just continue the pattern.

- **Section title:** "Rituals, written down." (H2, centred), with the small tracked subtitle "A closer look at what makes our formulations unique".
- **Each row:** a full-width band ~72vh tall (min 520px, max 760px).
  - **Background:** the row image fills the band with `object-fit: cover`. It is anchored to the product side (`object-position: left center` for image-left rows, `right center` for image-right rows).
  - **Text:** the HTML text block sits over the image's empty soft side, inside the container, max 460px wide.
  - **Blend:** where image and page meet vertically, add a soft top/bottom fade to white (48px) so rows feel continuous.
  - **Row content:**
    - The number ("01") with a 40px hairline.
    - The headline (H2).
    - The paragraph.
    - Three features in a row: a 48px outlined circle holding the icon, with a two-line label under it (Manrope 12.5px).
    - The link "Explore now →" with an underline that draws on hover.
- **Motion:** the image drifts slowly (inner parallax ±3%). The text block reveals line by line. The feature icons draw in with DrawSVG, stagger 0.1.
- **Mobile:** image band first (height 56vw, cropped to the product side), then the text below on white.
- **Row 03** shows a One Origin **Face Moisturiser** (50 g) from the client's own reference. It is not in the product list yet, so its link is "Notify me" (to the newsletter) until the client confirms. Keep this `TODO(client)` in `rituals.js`.

---

## 7. Brand pages (client item 4)

- **Hero:** a clean split replaces the layered type-behind-product hero, whose text and image were colliding.
  - Left: the brand name (H1), the italic line, coordinates, the two-line story, and "Shop now ↓" (scrolls to the products).
  - Right: the same ivory stage and CSS plinth as the rooms, with the brand's products.
  - Min height 78vh; stacked on mobile. **No text over images.**
- **Listing:** below the hero comes a products grid using the card component (§5): 3 columns desktop, 2 tablet, 2 mobile. Card CTA "Shop Now" + "Add to Cart". This fixes the oversized L'Arrivé images.
- **Below:** the origin strip (the tilted mini map with the brand's route) stays.

---

## 8. Shop page

- **Filters:** read the URL filters from the Shop menu (`sort`, `tag`, `category`, `ritual`) and pre-select the matching chips. Chips still re-lay out with Flip.
- **Other controls:** add a sort select (Featured, New, Price low–high, Price high–low).
- **Data:** add `tags`, `category` and `ritual` fields to products (§12) so every menu link returns real results.

---

## 9. Product page rebuild (client items 5, 6, 7, 8)

Follow the client's reference screenshots (`reference/pdp-*.png`), styled in this site's language.

### 9.1 Top area

- **Left (7 cols) — gallery:**
  - A **vertical thumbnail rail** on the far left: 76px thumbnails on `--ivory`, 12px gap, the active one with a 1px charcoal border, up/down arrows when there are more than five.
  - The **main image** next to it, in a 4:5 ivory stage.
  - Hover on desktop shows a zoom-in cursor. Clicking opens the lightbox at that image.
  - **Thumbnails, in order:**
    - Tubes: front, angle, back, label close-up, and a "360°" tile (icon `i-rotate-3d`). The 360° tile swaps the main stage to a drag-to-turn canvas using the HD frames.
    - L'Arrivé: `larrive-cutout-light`, `larrive-cutout`, `larrive-campaign`, `ritual-02-larrive`.
    - Nº 2: the placeholder and `ritual-04-no2`.
  - **Mobile:** the main image becomes a swipeable carousel with dots, and the thumbnails become a horizontal row under it.
- **Right (5 cols) — buy box, top to bottom:**
  1. **Header row:** the brand (linking to its brand page), a **share icon** at the right end of the row, and the product name (H3 size).
  2. **Rating line:** "★ 4.6 · 86 ratings". It links and smooth-scrolls to Ratings & Reviews.
  3. **Price block:** the price, the optional struck MRP with "% off", and "Inclusive of all taxes". The price sits here now, near the name, as in the client's reference. Set `CONFIG.pricePlacement = "top"`.
  4. **Choices:** the size selector and a quantity stepper.
  5. **Buttons:** "**Add to Cart**" (full-width primary), with a square wishlist heart button next to it.
  6. **Assurances:** three small lines with icons — "Free delivery over ₹999", "Cash on delivery available" and "Authentic, traceable product". Keep all three as `TODO(client)` to confirm.
- **Sticky bar:** the bottom bar ("name · price · Add to Cart") keeps working on mobile and whenever the buy box leaves the viewport.

### 9.2 Lightbox (client item 5)

This is a full-screen image viewer on white.

- **Opening:** the clicked image animates from its place into the viewer (GSAP Flip), then swaps to its **HD** file when that loads.
- **Main image:** fitted to 88vh, with prev/next arrows (`i-chevron-left/right` in 48px white circles with a soft shadow), a counter ("2 / 5"), and a close button (`i-x`).
- **Thumbnail strip** along the bottom; clicking one shows it large.
- **Zoom:**
  - Desktop: click (or `i-zoom-in`) toggles 2.5× zoom, and the zoomed image pans with the pointer.
  - Mobile: pinch zoom, double-tap zoom, and swipe to change image.
- **Keyboard:** ←/→ change image, Esc closes, and focus is trapped while open. Body scroll is locked (pause ScrollSmoother).
- **Close:** fades back to the page.
- **Loading:** preload the neighbouring images.

### 9.3 Share (client item 7)

- The share icon calls `navigator.share({ title, text, url })` where it's supported.
- Otherwise it opens a small popover with Copy link (with a "Link copied" toast), WhatsApp (`https://wa.me/?text=` + the encoded name and URL), and Email (`mailto:`).

### 9.4 Sections below the top area (client item 8), in this order

1. **Delivery Options**
   - **Layout:** a quiet full-width row with a heading, a 6-digit PIN input with "Check", and the text "Currently delivering to 110001 · Change" once a PIN is set. Store it in `localStorage` under `jiai-pin-v1`.
   - **Validation:** `^[1-9][0-9]{5}$`.
   - **Result (demo logic, marked TODO for a courier API later):**
     - The heading "Standard delivery — by Wed, 1 Oct". The date is today plus the days below, skipping Sundays: PINs starting 11 take 2 days; PINs starting 1–4 take 3–4 days; PINs starting 5–8 take 4–6 days; PINs starting 9 get "Not serviceable yet".
     - "Free delivery" when the order is at or above `CONFIG.delivery.freeOver`, otherwise "₹49 delivery".
     - The COD line.
2. **Product information tabs:** "Product Details", "Product Description" and "Special Features". The active tab's underline glides between tabs (Flip). Content fades between tabs.
   - **Product Details:** a clean two-column spec table from `details` (label in `--zinc`, value in charcoal, hairline rows).
   - **Product Description:** the long description plus the "How to use" numbered steps.
   - **Special Features:** 3–6 feature tiles, each an outlined icon circle, a title and one line.
3. **Where it's from:** keep this site's signature. It shows the mini tilted map with the product's route, coordinates, and "Trace your origin".
4. **Ratings & Reviews:**
   - **Left:** the big average ("4.6" in Cormorant 64px with ★), "Based on 86 ratings", and five breakdown bars (5★ to 1★) with counts. The bars fill as they enter view.
   - **Right:** the review list. Each review shows the name, stars, date, an optional "Verified buyer" badge, a title and the text. Sort by Most recent / Highest / Lowest; show 3, then "Show more".
5. **Rate This Product** (next to or under the summary):
   - A 5-star selector with hover preview, click to set and keyboard arrows (`role="radiogroup"`).
   - An optional title, review text and name, then "Submit review".
   - Saves to `localStorage` under `jiai-reviews-v1` keyed by product id, and appears at the top of the list immediately with "Just now". There's no backend yet; keep a `TODO` for moderation.
6. **Complete the ritual:** other products, using the card component.

**Honest reviews rule:** sample reviews are allowed only for this preview.
- `CONFIG.demoReviews` controls them. When it is `true`, show a small note "Sample reviews shown for preview" above the list.
- When it is `false`, ratings read "No ratings yet" and the list shows "Be the first to review this product".
- Never ship sample reviews as real ones. Fake reviews are misleading to customers and not allowed.

---

## 10. Wishlist (client item 10)

- **Where:** a heart on every product card and on the product page.
- **Toggle:** a filled red heart with a subtle 0.35s pop and a thin ring burst, plus the toast "Saved to wishlist" / "Removed". Store it in `localStorage` under `jiai-wishlist-v1`.
- **Header:** the wishlist icon shows the count and links to `wishlist.html`.
- **Wishlist page:**
  - A grid of saved products using the card component, each with "Add to Cart" and "Remove", plus "Move all to cart".
  - Empty state: "Your wishlist is empty." and "Explore the house".

---

## 11. Rituals page (`rituals.html`, the Rituals tab)

- **Hero:** the H1 "Rituals, written down." with the subtitle.
- **Rows:** all `RITUALS` rows (§6.3).
- **"A day with Jiai":** a strip adapted from Design 1 in this site's style — four moments (Morning: Face Cleanser; Day: L'Arrivé; Evening: Body Lotion; Night: Nº 2).
  - Each moment has an icon (`i-sunrise`, `i-sun`, `i-sunset`, `i-moon`), a one-line ritual and the product card.
  - Desktop: horizontal scroll-snap. Mobile: stacked.
- **Newsletter** at the end.

---

## 12. Data changes

**`products.js`** — add these fields to every product:

```js
category:"skin",               // "skin" | "fragrance"
subcategory:"cleanser",        // cleanser | lotion | body-spray | perfume
ritual:"morning",              // morning | day | evening | night
tags:["bestseller"],           // bestseller | new
mrp:null,                      // optional; when > price, show struck MRP + % off
cardScale:1,                   // visual size normaliser for cards (L'Arrivé .9, Nº 2 .88)
rating:{ average:4.6, count:86, breakdown:{5:64,4:15,3:4,2:2,1:1} },   // demo values
details:[ ["Brand","One Origin"], ["Product","Face Cleanser"], ["Net volume","100 ml"], ["Skin type","All skin types"],
          ["Key ingredients","Organic sea-buckthorn"], ["Shelf life","TODO(client)"], ["Country of origin","India"],
          ["Marketed by","Jiai Life — TODO(client): legal name and address"], ["Customer care","TODO(client): email and phone"] ],
description:"…",               // long description: what it does, what's inside
features:[ { icon:"leaf", title:"Single-source sea-buckthorn", text:"Traceable to one field in Ladakh." }, … ],
gallery:[ { src:"assets/products/cleanser/cleanser-front.webp", hd:"assets/products/cleanser/cleanser-front-hd.webp", alt:"One Origin Face Cleanser, front" },
          { src:"…-angle.webp", hd:"…-angle-hd.webp", alt:"…, angle" },
          { src:"…-back.webp",  hd:"…-back-hd.webp",  alt:"…, back label with origin code" },
          { src:"…-label.webp", hd:"…-label-hd.webp", alt:"…, label close-up", caption:"Label close-up" },
          { type:"360", frames:"assets/spin-hd/cleanser/", count:36 } ],
```

Suggested demo values:

| Product | Rating | Count | Tags | Ritual |
|---|---|---|---|---|
| Cleanser | 4.6 | 86 | bestseller | morning |
| Lotion | 4.5 | 64 | — | evening |
| L'Arrivé | 4.4 | 112 | bestseller, new | day |
| Nº 2 | none | — | new, coming soon | night |

- **L'Arrivé details:** Fragrance family (TODO), For "Men", Longevity "Up to 10 hours", Net volume "150 ml (TBC)".
- **Cleanser ingredients:** add "aloe vera, green tea" to `keyIngredients` with `TODO(client): confirm — mentioned in your Rituals reference`.

**New `js/data/rituals.js`:**

```js
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
```

**New `js/data/reviews.js`:** 4–6 sample reviews per live product. Use Indian first names and last initials, dates within the last 3 months, and a realistic mix (mostly 4–5★, one 3★). Use them only when `CONFIG.demoReviews` is true.

**`config.js`:** add

```js
pricePlacement:"top", demoReviews:true, delivery:{ freeOver:999, fee:49, cod:true }
```

---

## 13. Motion and polish

- **Page transitions:** add cross-document view transitions as progressive enhancement: `@view-transition { navigation: auto; }` with a 0.35s fade. Give each product image a matching `view-transition-name` on the card and the product page, so the product image glides from card to page in browsers that support it.
- **One vocabulary everywhere:**
  - Eases: `power3.out` / `power4.out`.
  - Reveals: 0.8–1.1s. Hovers: 0.25–0.45s.
  - No bounces. No elastic. No infinite attention-seeking loops.
- **Reduced motion:** turns off parallax, the drifting light, sheens and view transitions.
- **Final pass:** check every hover, focus and active state. Check every empty state: empty cart, empty wishlist, no search results, no reviews. Check every loading state (skeleton shimmer in ivory for images).

---

## 14. Performance, accessibility and publishing

- **Performance:**
  - Lighthouse mobile Performance ≥ 90 on home, shop and a product page.
  - HD images and HD spin frames load **only** on demand (lightbox open, section near the viewport, 360° tile clicked).
  - Fonts: only the weights listed in §2.
- **Accessibility:**
  - Dropdowns, lightbox, tabs, star rating, share and wishlist are fully keyboard- and screen-reader-accessible, with visible red focus rings.
  - AA contrast for every text, including text over the Rituals images (add a subtle white wash behind the text column if a row image is busy there).
- **GitHub Pages:**
  - Relative paths only, exact file-name case, and `.nojekyll` in the root.
  - New pages (`rituals.html`, `wishlist.html`) use the same shared header/footer partial markers.
  - Add `reference/` to `.gitignore`.

---

## 15. What stays `TODO(client)`

- Real prices and MRP.
- Delivery rules and COD.
- Legal name, address and customer-care details.
- Shelf life.
- L'Arrivé fragrance family and size.
- Whether the cleanser contains aloe vera and green tea.
- Whether the Face Moisturiser is a real product.
- A Body Lotion still-life image.
- High-resolution photography of the perfumes (their current images are about 1000 px, below lightbox quality).
- Real reviews: turn `demoReviews` off at launch.

---

## 16. Acceptance checklist (the client's 12 items)

1. The header has Shop, Brands, Origins, Rituals and Our story.
2. Shop, Brands (products by category) and Origins (products by brand) dropdowns open on hover and click, work by keyboard, and are built from data.
3. Cormorant Garamond and Manrope are used everywhere, including prices. No Bodoni or Jost remains.
4. The House:
   - Rooms share one template with no overlap.
   - The brand hero is a split layout with no overlap.
   - Listing images are normalised.
   - Card CTAs read "Shop Now".
5. Clicking any product image opens the lightbox with HD images, thumbnails, zoom, arrows and swipe. The product page has a left thumbnail rail.
6. Every purchase button reads "Add to Cart", and the header says "Cart".
7. The rating appears near the product name, and the share button works (native share or fallback).
8. Delivery Options (PIN check), the Product Details / Description / Special Features tabs, Ratings & Reviews with breakdown, and Rate This Product are all present and working.
9. Images feel premium: unveil reveals, hover light, consistent stages. Nothing is flashy.
10. Wishlist works on every card and product page; the header icon shows the count; the wishlist page works.
11. Turn it in your hand uses HD frames, rest stops and readable callouts, plus "Read the label".
12. Rituals rows alternate image/text with the client's images and copy, driven by `rituals.js`.

Test at 360, 390, 768, 1024, 1280, 1440 and 1920 px widths, with keyboard only, with reduced motion, and on iOS Safari. Leave a short changelog in `README.md`.
