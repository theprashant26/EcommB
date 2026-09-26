# Update 04 — speed (reach Lighthouse mobile ≥ 90)

This file adds to the earlier briefs; where they disagree, this file wins. **Nothing should look or behave differently to a visitor.** Every design, animation and feature stays. This update only changes *how* things load.

The client said load speed is very important. The live site measured with Lighthouse 12 (mobile, default throttling) on commit `2e7ed7f`:

| Page | Score | LCP | TBT | CLS | FCP |
|---|---|---|---|---|---|
| Home | 67 | 4.3 s | 380 ms | 0 | 2.8 s |
| Product (Body Lotion) | 78 | 3.9 s | 170 ms | 0 | 2.8 s |
| Combo product page | 75 | 4.1 s | 240 ms | 0 | 2.8 s |

**Target:** Performance ≥ 90 on Home, Shop, a product page, Combos and a combo product page, with LCP < 2.5 s, TBT < 200 ms and CLS 0.

**Measure it yourself.** Run Lighthouse via Node (Claude Code already needs Node):

```
npx lighthouse@12 <URL> --only-categories=performance --form-factor=mobile --quiet --output=json --output-path=lh.json
```

Measure the live URLs after each push. Work through the fixes below in order, re-measure after each, and report the table again at the end.

---

## 1. Never hide the LCP element behind an animation (the biggest win)

Lighthouse shows the LCP image downloads fast but is painted about **3.3 s later** ("render delay"). On Home, the LCP is the hero's large card (`larrive-campaign.webp`). It stays invisible until the GSAP reveal runs, and that waits for GSAP, ScrollTrigger and the page modules to load and execute.

- The hero card and its image must be **visible in the first paint, from HTML and CSS alone**. No initial `opacity:0`, `clip-path: inset(100% …)` or `visibility:hidden` on the LCP element or its ancestors, in CSS or in inline styles set before the animation.
- Keep an entrance effect that doesn't gate visibility: animate `transform` only (e.g. the image from scale 1.06 → 1, and Card B from x 40px → 0). Start it as soon as GSAP is ready. The card's clip-path unveil may apply to **Card B only**, which is not the LCP.
- The same rule applies to the H1: it is visible from the start. The line-rise reveal is fine only if the text isn't hidden before JS runs. If it is, move the split reveal to after first paint and show the text statically until then.
- Keep `<link rel="preload" as="image" href="assets/products/larrive/larrive-campaign-768.webp" imagesrcset="…" imagesizes="…" fetchpriority="high">` in the `<head>`, matching the responsive sources in §4.

**Product and combo pages:** the main image is inserted by `product.js` after the modules load, so it is late too.
- Put the main gallery `<img>` in the HTML, with `fetchpriority="high"` and no `src`.
- Add a tiny **inline** script right after it: it reads `?id=`, looks the id up in a small inline map `{ id: "main image path" }` (generated from `products.js` — keep it in one place, e.g. `js/data/lcp-map.js` inlined at build or written by hand for the current products), then sets `src`/`srcset` immediately.
- `product.js` then takes over as now.

## 2. Remove render-blocking third-party CSS

Currently blocking: `bootstrap.min.css` from jsDelivr (~1.3 s), the Google Fonts stylesheet (~0.75 s) and `css/main.css` (~0.45 s).

1. **Bootstrap CSS:**
   - Self-host a trimmed copy containing only what the site uses (grid, offcanvas, modal, utilities in use). Use PurgeCSS over all HTML and JS templates, safelisting classes added at runtime (`show`, `showing`, `hiding`, `offcanvas-backdrop`, `modal-backdrop`, `fade`, `collapsing`, `was-validated`).
   - Merge it into one minified same-origin file, `css/site.min.css`.
   - Remove the jsDelivr Bootstrap CSS link.
2. **Fonts:**
   - Self-host the fonts in `assets/fonts/` as WOFF2 (latin + latin-ext only): Cormorant Garamond 500, 600, and italic 400, 500; Manrope as the variable font covering 300–700.
   - Declare them in `site.min.css` with `font-display: swap`, plus metric overrides (`size-adjust`, `ascent-override`) on a local fallback, so the swap causes no layout shift.
   - Preload only the two faces used above the fold: Cormorant Garamond 500 and Manrope.
   - Remove the Google Fonts `<link>`s and the preconnects to Google.
3. **Critical CSS:**
   - Inline the CSS needed for the first screen (header, hero, announcement bar; about 10–14 KB) in a `<style>` in the `<head>`.
   - Load the full `site.min.css` without blocking: `<link rel="preload" as="style" href="css/site.min.css" onload="this.rel='stylesheet'">`, with a `<noscript>` fallback.
   - Do this on every page: each page's critical CSS covers its own first screen.

## 3. Cut startup JavaScript

Main-thread time at load on Home: ScrollTrigger ≈ 1.9 s, gsap ≈ 0.9 s, plus page modules.

- **Only load what the page uses:**
  - SplitText, DrawSVG and Flip only on pages and sections that need them. Load them with dynamic `import()` or a `defer` tag added by the section's initialiser.
  - vanilla-tilt only on fine-pointer devices, loaded when the first card nears the viewport.
  - ScrollSmoother only on desktop, never on touch devices.
- **Initialise sections lazily:**
  - Create each section's ScrollTriggers, timelines and SplitText when the section comes within about one viewport (`IntersectionObserver`), not all at load.
  - The map, the House carousel, "Turn it", the Rituals rows and the kinetic "Arrived." words don't need to exist before the user scrolls near them.
  - Start autoplay loops only while they're visible, as now.
- **Defer non-critical setup:** search index, wishlist/cart hydration beyond the counts, the mega menu's DOM build (build it on first hover or focus), and the cursor/tilt effects go in `requestIdleCallback` (with a `setTimeout` fallback).
- **Avoid layout thrash at start:** batch DOM reads before writes, and don't measure in loops.
- **Result:** no single task over 50 ms during load on the mobile profile where it can be split; yield with `await scheduler.yield?.()` or `setTimeout(0)` between init steps.

## 4. Right-sized images

Add a small script `tools/make-image-sizes.py` (Pillow) and commit its output. It writes WebP variants next to each source (quality 78–82):

- `assets/products/larrive/larrive-campaign.webp` → `-480`, `-768`, `-1024` wide. The hero card uses `srcset` with `sizes="(max-width: 767px) 82vw, 36vw"`.
- `assets/hero/hero-origin.webp` → `-320`, `-480`, `-640` wide.
- **Thumbnails:** every product, combo and ritual image used as a thumbnail gets `-thumb.webp`, 180px tall.
  - Use it in the PDP thumbnail rail, the lightbox thumbnail strip, "What's in the combo", the dropdown product thumbnails, cart lines, search results and the hero's old tab strip (if any remains).
  - The combo product page should drop from ~0.8–1 MB to under 450 KB.
- **Card images and PDP main images:** add `-600` and `-900` tall variants with `srcset` + `sizes` matching the rendered size.
- **Category tiles and Rituals rows:** `-768` and `-1200` wide variants with `srcset`.
- Everything below the first screen keeps `loading="lazy"` and `decoding="async"`. Only the LCP image gets `fetchpriority="high"`.

## 5. Small wins

- Minify the site's own JS modules and CSS; keep the unminified sources in the repo.
- `preconnect` only to origins still used at first paint (jsDelivr for GSAP). Remove unused preconnects.
- Make sure no font, image or script is requested twice (thumbnails vs. full images, duplicate font weights).
- The `.htaccess` stays for Bluehost. GitHub Pages already compresses files.

---

## Acceptance

- Lighthouse mobile **≥ 90** on Home, Shop, `product.html?id=one-origin-body-lotion`, `combos.html` and `product.html?id=combo-one-origin-duo` (live URLs), with LCP < 2.5 s, TBT < 200 ms and CLS 0. Report the before/after table.
- Pixel-level visual check: screenshots of each page's first screen before and after at 390 and 1440 px look identical once animations settle.
- All existing test suites still pass (page-size sweep, keyboard, reduced motion, iPhone Safari).
- README changelog updated.
