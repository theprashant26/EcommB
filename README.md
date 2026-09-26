# Jiai Life — Design B "Maison: from origin to arrival"

Static multi-page site: HTML, CSS, vanilla ES modules, Bootstrap 5.3.8, GSAP 3.15.0 (ScrollSmoother, ScrollTrigger,
SplitText, DrawSVG, Flip) from the CDN. No build step. Full brief: `PROMPT-B-MAISON.md`; `UPDATE-01-LOGO.md` and
`UPDATE-02-CLIENT-CHANGES.md` take precedence where they differ (Update 02 wins over both).

Pages: `index.html` (home), `shop.html`, `product.html?id=…`, `brand.html?b=…`, `origin.html?batch=…` (the QR landing
page), `about.html`, `rituals.html`, `wishlist.html`.

## Preview locally

ES modules do not load from `file://`, so serve the folder:

```
python -m http.server 5510
```

Then open http://localhost:5510/ (any free port works; VS Code Live Server works too). Python's simple server can
occasionally refuse a connection when a page asks for many files at once; if a page loads half-styled, reload.

## Deploy

### GitHub Pages (project site)

The site is served from a sub-folder (`https://<user>.github.io/<repo>/`), so:

- Every path in the HTML, CSS and JS is relative (no leading `/`). Keep it that way: a root path like
  `/css/main.css` would point outside the project folder.
- File names must match their references exactly, including upper/lower case (Pages runs on a case-sensitive
  server; Windows is not, so a mismatch only shows up once published). All asset names are lowercase.
- The empty `.nojekyll` file in the root tells Pages to publish the files as they are, without Jekyll.
- `.htaccess` is ignored on Pages (Pages compresses files itself). Once the Pages URL is known, make `og:image` /
  `og:url` absolute with it (see the TODO table).

### Bluehost

Upload everything except `tools/`, `reference/` and the `PROMPT-*.md` / `UPDATE-*.md` files to `public_html`.
`reference/` (the client's screenshots) is in `.gitignore`, so it is never published to GitHub Pages. The `.htaccess`
turns on gzip and long cache headers; the speed figures below assume it is active.

## Editing content

Everything that lists brands or products renders from `js/data/`:

| File | Holds |
|---|---|
| `js/data/config.js` | Currency, `showPrices`, `pricePlacement` ("top" / "after-story"), `showComingBrands`, free-delivery threshold, `delivery` (fee, COD), `demoReviews` (**set to `false` at launch**), announcement line |
| `js/data/brands.js` | Brands: name, tagline, category, coordinates, story, status (`live` / `coming` / `teaser`), room colours |
| `js/data/products.js` | Products: copy, claims, how-to, notes, `sizes` (full and compact, each with its price / `mrp` and comparison photo), `category`, `ritual`, `tags`, `cardScale`, `rating`, `details`, `features`, `gallery`, images, spin frames |
| `js/data/hero.js` | The two home hero cards: image, alt text, caption chip, link, focal point |
| `js/data/categories.js` | "Categories You Might Like" tiles (home): title, line, image, link |
| `js/data/rituals.js` | "Rituals, written down" rows (home and `rituals.html`): image, number, title, copy, three features, link. More rows continue the alternating pattern |
| `js/data/origins.js` | Origins (coordinates, altitude, airport codes) and `BATCHES` (one per code printed on the tubes) |

**Adding a brand or a product** is one object in `brands.js` / `products.js`. The mega menu, mobile menu, footer,
search, home cards and rooms, shop filters and brand blocks, and the brand and product pages all update from it; a
brand without a custom room gets the generic one. This was verified by injecting a fifth product and a third brand.

**A new batch** (a new QR code) is one entry in `BATCHES`. `origin.html?batch=CODE` then shows its boarding pass,
route, journey and facts. An unknown code shows a notice and a field to type the code.

## Shared markup and the generated parts

The header, footer, bag and search markup is identical on every page, between `<!-- PARTIAL:… START/END -->`.
Edit it in `index.html`, then run:

```
python tools/sync-partials.py          # copy partials, fill logo slots, regenerate module preloads
python tools/sync-partials.py --check  # report drift without writing
```

The same script fills the logo slots and regenerates each page's `<link rel="modulepreload">` list (between the
MODULEPRELOAD markers) from its real import graph. Run it after adding or removing a JS import.

### The logo (Update 01)

The logo is always the client's file, never retyped. Its slots are marked `<!-- LOGO:… -->…<!-- /LOGO -->`:
the header inlines `jiai-wordmark.svg` (its red `.dot` drops in once, at the end of the home load sequence),
the mobile menu and search show it as an `<img>`, the footer and About show `jiai-logo.svg`.

**Pending:** the logo files have not arrived in `assets/brand/`. Until then the slots show an interim "Jiai Life" in
the display type, and the favicon and `og-maison.jpg` are still the old images. When the files arrive: put them in
`assets/brand/` (keeping the names in `UPDATE-01-LOGO.md`) and run `python tools/sync-partials.py`. The favicon
`<link>`s and `og:image` already point at the right file names.

## Where the code lives

| What | File |
|---|---|
| Tokens, base, layout, components, pages | `css/main.css` (sections numbered in that order) |
| Header, Shop / Brands / Origins dropdowns, mobile menu, footer, newsletter forms, "Notify me" | `js/core/header.js` |
| Cart (localStorage `jiai-bag-v1`, key kept from before the rename), Add to Cart feedback | `js/core/bag.js` |
| Wishlist (localStorage `jiai-wishlist-v1`) | `js/core/wishlist.js` |
| Image system: unveil on entry, parallax helper | `js/core/reveal.js` |
| Lightbox (FLIP open, HD swap, zoom/pan, pinch, swipe, keyboard) | `js/core/lightbox.js` |
| Product page parts: reviews + rating, delivery PIN check, share, tabs | `js/core/reviews.js`, `delivery.js`, `share.js`, `tabs.js` |
| Plinth stage (home rooms, brand hero, shop brand tiles) | `js/core/plinth.js` |
| Rituals rows (markup + motion, shared by home and `rituals.html`) | `js/core/ritual-rows.js` |
| Icons: one sprite, `<svg class="icon"><use href="assets/icons/icons.svg#i-…">` | `assets/icons/icons.svg` |
| Search overlay | `js/core/search.js` |
| ScrollSmoother, motion contexts, boot helpers, keyboard focus | `js/core/motion.js` |
| Pointer depth (hero layers) | `js/core/depth.js` |
| 360° spin frames (one shared cache) | `js/core/spin.js` |
| 3D map (routes, pins, billboard labels, focus/zoom) | `js/core/map3d.js` |
| The product card (one component everywhere products are listed) | `js/core/cards.js` |
| Formatting, image sizes, small helpers | `js/core/format.js` |
| Pages | `js/pages/home.js`, `shop.js`, `product.js`, `brand.js`, `origin.js`, `about.js`, `rituals.js`, `wishlist.js`, `compact.js` |

## Build status

- [x] Phase 1: foundation (tokens, chrome, bag, search, footer, data, motion core, .htaccess)
- [x] Phase 2: home page (§8.1–8.8)
- [x] Phase 3: product, shop, brand (§9.1–9.3)
- [x] Phase 4: origin (QR landing page), about (§9.4–9.5)
- [x] Phase 5: polish (widths, reduced motion, keyboard, iOS/WebKit, slow 4G)

### Update 02 (client changes)

- [x] **A · Global:** Cormorant Garamond + Manrope everywhere (prices too; no Bodoni/Jost left), warm neutrals
  (`--ivory`, `--sand`, `--line`, `--success`), one icon sprite, header with Shop / Brands / Origins / Rituals /
  Our story and Search / Account / Wishlist / Cart, three data-driven dropdowns (hover intent, click, keyboard, touch)
  and mobile accordions, "Bag" renamed "Cart" everywhere, Add to Cart feedback (spinner → "Added ✓", arc, count pop,
  drawer / toast), wishlist (hearts, count, `wishlist.html`), one product card with normalised product sizes, the
  image unveil and hover light, warm-light overlay utility, `rituals.html` (hero + "A day with Jiai"; rows in B),
  `.gitignore` for `reference/`. vanilla-tilt and the shop quick view are gone (the card replaces them).
- [x] **B · Home:** The House on one shared room template (ivory, leaf light, CSS plinth, products on it with contact
  shadows, text and stage never overlapping; the L’Arrivé campaign image and the old illustrations are gone).
  Turn it in your hand on the 1200×1800 HD frames (never upscaled, loaded only near the section), an ivory spotlight,
  rest stops at 0°/90°/180°/270° (12% of the scroll each) with white callout cards and hairline leaders, "Read the
  label" (lightbox on the HD label), drag-to-turn with snapping on phones. Rituals rows from `rituals.js` replace the
  journal teasers. Each band follows its still life's proportions (max 760px) so the text always lands on the empty
  side; below 1360px the image comes first and the text follows on white.
- [x] **C · Brand pages and shop:** brand pages open on a split hero (name, italic line, coordinates, two-line story,
  "Shop now ↓" on the left; the ivory plinth stage with the brand's products on the right; no text over images), then
  the pieces as product cards (3 / 2 / 2 columns) and the origin strip. Nº 2 uses the same hero with the newsletter.
  The shop reads and writes `?brand= &category= &ritual= &tag= &sort=` (every menu link lands on a real, pre-selected
  result), groups combine, chips re-lay out with Flip, a sort select (Featured, New, Price low–high, high–low), an
  empty state with "Clear filters", and brand tiles on the plinth stage after each full row in the featured order.
- [x] **D · Product page:** vertical thumbnail rail (front, angle, back, label close-up, 360°) beside a 4:5 ivory
  stage that is also the phone carousel (dots, swipe) and the 360° viewer (HD frames, loaded when the tile is chosen);
  click → lightbox. Buy box: brand + share (native share, or Copy link / WhatsApp / Email), name, rating link to the
  reviews, price with optional MRP and % off and "Inclusive of all taxes", size + quantity, Add to Cart + wishlist
  heart, three assurances. Then Delivery Options (PIN check, demo rules, `jiai-pin-v1`), the Product Details /
  Description / Special Features tabs, Where it's from (mini map), Ratings & Reviews (summary, bars, sort, show
  more) with Rate This Product (`jiai-reviews-v1`), and Complete the ritual. Sample reviews (`js/data/reviews.js`)
  show only while `CONFIG.demoReviews` is on, under "Sample reviews shown for preview".
- [x] **E · Polish and QA:** `rituals.html` (hero, the four rows, "A day with Jiai" with the four moments and their
  cards, newsletter) and `wishlist.html` (cards with Add to Cart and Remove, "Move all to cart", empty state);
  cross-document view transitions (a 0.35s fade, and the product image glides from its card to the product page;
  off with reduced motion); empty states for the cart, wishlist, search (with suggestions), shop filters and reviews;
  an ivory shimmer on image frames while they load; the product page's first image is preloaded from the head and its
  lower sections render after the first paint. Full QA below.

### Update 03 (client changes, round 2)

- [x] **0 · Logo:** the client's files in `assets/brand/` replace the interim text everywhere (header inline, so the red
  dot can animate; mobile menu, search, footer and About as images), with the new favicons and `og-maison.jpg`.
- [x] **A · Data:** `hero.js`, `categories.js`, product `sizes`, the second L’Arrivé product (`larrive-02`, coming
  soon). Sample reviews never carry "Verified buyer" (only real verified purchases may). Dropdowns kill running
  animations and hide every other panel when one opens.
- [x] **B · Home top:** the layered hero is replaced by two overlapping rounded image cards with caption chips, a calm
  load reveal, idle drift and pointer depth; "Categories You Might Like" (staggered 2×2 from `categories.js`, "Explore
  Collection") replaces the four product tabs.
- [x] **C · Motion without pinning:** Turn it in your hand plays by itself (hold at each face with its callouts,
  pause/play, dots, drag, Face/Body); the map journey plays once in view, then sways, with a replay button; the heading
  sits above the map with no boxes over the dots. The House keeps its original heading and "1 of 3" counter, and its
  rooms are smaller cards in a looping carousel (auto-advance, arrows, dots, swipe, keys). Everything that moves by
  itself pauses on hover, focus, off-screen and hidden tabs; with reduced motion nothing plays and the controls remain.
- [x] **D · Compact size:** "Compact size" in the Shop dropdown, mobile menu and shop filters (`?size=compact`);
  `compact.html` lists the compact variants (smaller cards, compact prices, Add to Cart adds the compact size) and
  "See the difference" side by side. Product pages have a size selector (price, sticky bar, URL `&size=`, Add to Cart
  and a comparison photo first follow it); the cart keeps one line per size (older carts read as the full size).
  `larrive-02` appears in the menus, the L’Arrivé room, the brand page, the shop and search.
- [x] **E · Product page:** the rating is a "4.5 ★ | 64 ratings" pill beside the share button on every product page
  (it scrolls to Ratings & Reviews; "No ratings yet" without ratings; nothing for coming soon), and How to Use is its
  own tab after Product Details (numbered steps with icons). On phones the tab row scrolls sideways.
- [x] **F · QA:** below.

## How it was tested

Automated in Chrome and WebKit (Playwright), on a local server with gzip as on Bluehost:

- Every page at 360, 390, 768, 1024, 1280, 1440 and 1920 px: no horizontal overflow, no text wider than its box,
  no console errors; first screens reviewed by eye.
- Keyboard only: every page tabbed end to end. Every stop is visible, on screen, not covered by the header or
  the buy bar, and shows the red focus ring. The pinned rooms and the map cards bring themselves into view on focus.
- Reduced motion: no ScrollSmoother, no pins, no scrub, no loops, no hover-to-turn; every page shows final states.
- iOS Safari proxy (WebKit, iPhone 13 profile): all pages, menu and its accordions, cart, wishlist, search, shop
  filters, the product carousel, lightbox and PIN check, sticky bar, origin pass. Every `svh` has a `vh` fallback for
  iOS before 15.4.
- Functional suites per phase: 176 checks for the original build, and for Update 02 152 more (A 39 · B 24 · C 28 ·
  D 44 · E 17) plus 13 in WebKit — menus by hover, click, keyboard and touch; cart and wishlist; the card; the House;
  the rest stops and callouts; the lightbox; the Rituals rows; brand pages; every Shop-menu URL; the product page
  from gallery to reviews; view transitions; empty and loading states.
- Update 03: 100 more (logo and data 13 · hero and categories 22 · auto movement 27 · compact size 20 · product page
  18), with all earlier suites re-run; `compact.html` and `product.html?…&size=compact` added to the width, keyboard,
  reduced-motion and WebKit sweeps (84 page-size combinations).

## Speed

Measured in Chrome with Lighthouse's mobile throttling (4× CPU, 150 ms RTT, 1.6 Mbps) and gzip on; medians of three
runs. The development machine was shared with other workloads, so single runs vary. Lighthouse itself (Node) was not
available here: run it (or PageSpeed Insights) on the live URL before launch.

| Page | LCP | TBT | CLS |
|---|---|---|---|
| Home | ≈ 2.8 s | ≈ 10–20 ms | 0 |
| Shop | ≈ 2.6 s | ≈ 0–90 ms | 0 |
| Product (cleanser / L’Arrivé / body lotion) | ≈ 2.2 s / 2.2 s / 2.3 s | ≈ 75–95 ms | 0 |
| Compact size | ≈ 2.15 s | ≈ 70–85 ms | 0 |
| Brand | ≈ 2.3 s | ≈ 210 ms | ≈ 0.003 |
| Origin (QR landing) | ≈ 2.2–2.4 s | ≈ 110–170 ms | ≈ 0.02 |
| About | ≈ 1.9 s | ≈ 80 ms | 0 |

Home, shop, product and compact re-measured after Update 03; the other rows are from earlier builds. Home's LCP is
the first hero card, `larrive-campaign.webp` (100 KB, kept as supplied); a lighter export of it is the main lever left.

What keeps it fast (keep these in place):

- The home hero intro and the origin boarding pass run as CSS animations, not per-frame JS.
- Home sections below the fold render, and ScrollSmoother/pins start, on the first scroll, touch, key or pointer
  move (or a `#hash` link, or after 8 s idle).
- The product page preloads its first image from a small generated script at the top of `<head>` (it must stay above
  the stylesheets), and renders everything below the buy box after the first paint.
- Shop, product, brand and origin load their page module with `async`: content renders from data without waiting for
  the deferred CDN scripts; motion starts after them (`whenScriptsReady()` in `motion.js`).
- Every page preloads its module graph (generated) and the two first-screen font files. If Google Fonts updates
  Cormorant Garamond or Manrope, update those two URLs (from the `latin` blocks of the Google Fonts CSS) or remove the preloads.
- Never use `data-speed` / `data-lag` except for ScrollSmoother parallax: ScrollSmoother reads them.

## TODO(client): values to replace

| Item | Where |
|---|---|
| Lifestyle photos for the two hero cards (the product photos stand in), and a larger `hero-origin` export | `js/data/hero.js`, `assets/hero/` |
| A lighter export of `larrive-campaign.webp` (the home hero's largest image, and its LCP) | `assets/` (same file name) |
| Compact sizes and prices (30 ml ₹249 / ₹299, L’Arrivé 20 ml ₹299 are placeholders) | `js/data/products.js` (`sizes`) |
| The second L’Arrivé product: name, fragrance, size, price, photos | `js/data/products.js` (`larrive-02`) |
| The House: the client asked to "reverse to previous design"; the heading and counter are restored — confirm nothing else is meant | `index.html`, `js/pages/home.js` (`initHouse`) |
| Prices (649 / 749 / 899 / 999 are placeholders; also used in the Product JSON-LD) | `js/data/products.js` |
| Free-delivery threshold (₹999) and the announcement wording | `js/data/config.js` |
| L’Arrivé size (150 ml) and its fragrance notes | `js/data/products.js` |
| Full INCI ingredient lists (both One Origin products) | `js/data/products.js` (`inside`) |
| Nº 2: name, real image, size and price | `js/data/brands.js`, `js/data/products.js`, `assets/products/perfume-02/` |
| Exact farm and altitude for Leh | `js/data/origins.js` (`leh-ladakh`) |
| What is sourced from Paris / the perfumery | `js/data/origins.js` (`paris`) |
| Batch data: field, harvest team names, grown season, harvest / pressed / formulated / filled dates, lab report link | `js/data/origins.js` (`BATCHES`) |
| One `BATCHES` entry per real batch code printed on the tubes | `js/data/origins.js` |
| Farm photography, no stock: "The field", "The harvest", "The hands" | `js/pages/origin.js`: each slot's `data-photo` |
| Delivery rules (days by PIN, ₹49 fee, free over ₹999, COD) — demo logic until a courier API is connected | `js/core/delivery.js`, `js/data/config.js` (`delivery`) |
| The three product-page assurances (free delivery, COD, authentic & traceable) | `js/pages/product.js` (`buyHTML`) |
| Real reviews: set `demoReviews: false` at launch and connect a review backend with moderation | `js/data/config.js`, `js/core/reviews.js` |
| MRP per product (shows struck MRP and % off when above the price) | `js/data/products.js` (`mrp`) |
| Legal name and address, customer care, shelf life (show "To be confirmed" until filled) | `js/data/products.js` (`details`) |
| Face Moisturiser (Rituals row 03, "Notify me" until confirmed) and a Body Lotion still life for its own row | `js/data/rituals.js` |
| Help pages: delivery, returns, contact, questions, privacy (footer links are `#`) | footer partial in `index.html`, then sync |
| Absolute URLs for `og:image` / `og:url` and the Organization logo, once the domain is live | `<head>` of every page |
| Whether to show the teaser brands (Black Truth, White Lie) | `js/data/config.js` (`showComingBrands`) |

## At launch (integrations stubbed in the front end)

| Feature | Now | Where to connect |
|---|---|---|
| Checkout | Toast "Checkout connects at launch." | `js/core/bag.js` (`[data-checkout]`) |
| Accounts | Toast "Accounts open at launch." | `js/core/header.js` (`[data-account]`) |
| Newsletter | Validates, shows the success toast | `js/core/header.js` (`initNewsletterForms`) |
| "Notify me" (hidden prices, Nº 2) | Sends the visitor to the newsletter field | `js/pages/product.js` |
