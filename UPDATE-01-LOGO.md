# Update 01 — the client's logo (Design B, Maison)

This file adds to `PROMPT-B-MAISON.md`. Where the two disagree, this file wins. Apply it to everything already built, then continue from where you stopped.

## What arrived

The client's final logo: the lowercase wordmark "jiai" in charcoal, drawn with rounded monoline strokes. The dot of the last "i" is red and slightly larger than the other dots. The full version adds a short grey rule and the tagline "the ritual of self-love". The page background stays white, as before.

New files in `assets/brand/` (older files with the same names were replaced in place):

| File | Use |
|---|---|
| `jiai-wordmark.svg` | Header logo (wordmark only) |
| `jiai-logo.svg` | Full lockup with the tagline: footer, About page |
| `jiai-wordmark-white.svg`, `jiai-logo-white.svg` | Only if the logo ever sits on a dark image |
| `jiai-logo.png`, `jiai-logo-white.png`, `jiai-wordmark.png` | Raster copies for places that can't take SVG |
| `favicon.svg`, `favicon-32.png`, `favicon-180.png`, `favicon-512.png` | Now the red-dotted "i" from the logo. Keep the existing `<link>` tags and add `<link rel="icon" href="assets/brand/favicon.svg" type="image/svg+xml">` |
| `og-maison.jpg` | Now carries the real logo. Keep the existing `og:image` tag |

## 1. Use the logo files; never retype the logo

- **Header:** replace the Bodoni "Jiai Life" wordmark with the inline contents of `jiai-wordmark.svg`, wrapped in `<a class="brand" href="index.html" aria-label="Jiai Life home">`, centred. Height 44px on desktop, 34px on mobile. Inline it (not `<img>`) so the dot can be animated (§3).
- **Footer:** `assets/brand/jiai-logo.svg` as an `<img>`, 150px wide, `alt="Jiai Life, the ritual of self-love"`. Remove the black seal from the footer and from the About page; keep the explanation of 自愛 there as plain text.
- Never recolour, stretch, outline or add effects to the logo. Keep clear space around it at least the size of the red dot.
- In running text the company name stays "Jiai Life" (About copy, titles such as "Face Cleanser | Jiai Life", alt text).

## 2. Colours: match the logo

- `--origin: #B5473A` — the logo's red replaces `#E8762B` as the single accent everywhere: routes, pins, pulse rings, the active filter underline, focus rings, bag count, the free-delivery bar, the button hover line and the 10-hour line. Also set `--route: #B5473A` so `routes.svg` follows.
- `--graphite: #2B2B2B` (the logo's charcoal) for body text, and `--zinc: #6B6B6B` for secondary text and coordinates.
- `--black: #000` stays, for the giant display type only.
- Sea-buckthorn orange appears only inside One Origin contexts (the berries and the One Origin room).

## 3. The red dot is a place

The logo's red dot and the map pins are the same idea: a place, marked. Make that visible:

- Map pins use exactly the logo red, as solid dots.
- Hero load sequence: after the giant type rises and the products settle, the header wordmark's red dot (`.dot`) drops in from 14px above with the same crisp settle as the map pins (0.6s, `power4.out`). This is the logo's only animation: no loops, nothing on scroll, and static with reduced motion.
- On the origin page's boarding pass, the "from" marker is the same red dot.

## 4. Tagline

"the ritual of self-love" lives inside the logo lockup in the footer. Don't restyle it as a heading. The hero H1 stays "From origin to arrival."

## Check

- The logo is sharp at every width, is never typed as text, and links home.
- No `#E8762B` is left anywhere in the CSS.
- The browser tab shows the red-dot "i", and a shared link shows the new OG image.
