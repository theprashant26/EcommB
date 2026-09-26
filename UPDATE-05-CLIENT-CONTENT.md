# Update 05 — the client's real content

This file adds to all earlier briefs; where they disagree, this file wins. **Apply it after Update 04 (speed) is finished**, because it replaces images that Update 04's size script processes (§7).

The client has sent their real product packaging, two named L'Arrivé fragrances, the official logo files, their legal name and customer-care number, and two corrections. Layout, motion and the design system don't change.

---

## 0. Applying the files

Copy everything from this update's `assets/` into the project, replacing files when asked. Most visuals update automatically because many files keep their existing names. The table says which are replacements and which are new.

| Path | Status | What it is |
|---|---|---|
| `assets/brand/jiai-wordmark.svg`, `jiai-logo.svg`, `jiai-wordmark-white.svg`, `jiai-logo-white.svg` | replaced | Vector traces of the client's **official** logo files (slightly different letter shapes from the earlier version). The red dot is still `<circle class="dot">` |
| `assets/brand/jiai-logo-official.png` / `.webp` | new | The exact official artwork with a transparent background |
| `assets/brand/favicon.svg`, `favicon-32.png`, `favicon-180.png`, `favicon-512.png`, `og-maison.jpg` | replaced | Favicons in the official proportions; share image with the official logo and L'Arrivé Noir |
| `assets/products/lotion/lotion-pack.webp` (+`.png`), `lotion-tube.webp`, `lotion-box.webp` | new | The client's official Body Lotion packaging: box + tube, tube only, box only |
| `assets/products/cleanser/cleanser-pack.webp` (+`.png`), `cleanser-tube.webp`, `cleanser-box.webp` | new | The same for the Face Cleanser |
| `assets/products/{lotion,cleanser}/{key}-hero`, `-cutout`, `-angle`, `-back`, `-front`, `-front-hd`, `-angle-hd`, `-back-hd`, `-label`, `-label-hd` | replaced | 3D renders re-made with the **new label** |
| `assets/spin/{lotion,cleanser}/000–035.webp`, `assets/spin-hd/{lotion,cleanser}/000–035.webp` | replaced | 360° frames with the new label |
| `assets/products/larrive/larrive-noir-cutout.webp`, `larrive-noir-cutout-light.webp`, `larrive-noir-campaign.webp` (+`.jpg`) | new | L'Arrivé **Noir**: cutout, light-glass cutout for white pages, campaign image |
| `assets/products/larrive/larrive-auren-cutout.webp`, `larrive-auren-campaign.webp` (+`.jpg`) | new | L'Arrivé **Auren** |
| `assets/rituals/ritual-03-lotion.webp` | new | Rituals row 3 with the real Body Lotion (replaces the moisturiser) |
| `assets/categories/category-skin.webp`, `category-fragrance.webp`, `category-combos.webp` | replaced | Tiles with the real packaging, and Noir + Auren |
| `assets/combos/combo-skin-duo.webp`, `combo-origin-arrival.webp`, `combo-complete-ritual.webp` | replaced | Combos with the new tubes and Noir |
| `assets/hero/hero-origin.webp` | replaced | Hero small card: the new cleanser pack |

**Delete:**
- `assets/rituals/ritual-03-moisturiser.webp`
- `assets/products/larrive/larrive-02-placeholder.*`
- The size variants of both files

---

## 1. Official logo

- The header's logo is an inline SVG, so replacing the file does **not** update it. **Re-inline** the new `jiai-wordmark.svg` in the header partial on every page, keep the `.dot` animation, and check the logo's height (44px desktop / 34px mobile) still looks balanced.
- The footer uses `jiai-logo.svg` (the lockup with the tagline).
- Use `jiai-logo-official.png` only where a raster is needed (emails, JSON-LD `logo`).

## 2. One Origin — real packaging

**Images:**
- **Product page gallery:** the client's pack image comes first: `{key}-pack.webp`, then front, angle, back, label close-up and the 360° tile. The HD file for the pack image is the `.png`.
- **Cards and "The four":** use `{key}-pack.webp` as the card image; box and tube together read well in the 4:5 stage (`cardScale` about .92). The hover cross-fade shows `{key}-hero.webp`.
- **Tube only:** the House room plinth, the mega menu thumbnails and cart lines use `{key}-tube.webp`.

**Data** (`products.js`, from the packaging):

*Body Lotion* — keep the id `one-origin-body-lotion`:
- name "Organic Body Lotion"; fullName "One Origin Organic Body Lotion"
- benefit "Deep hydration & skin nourishment"
- keyIngredients "Jojoba oil, aloe vera & sea-buckthorn"
- claims: "Certified organic (OneCert)", "Deep hydration & skin nourishment", "With jojoba oil, aloe vera & sea-buckthorn"
- description: "Nourishing care from nature's finest sources. With organic ingredients and a commitment to purity, One Origin brings you effective everyday skincare inspired by the integrity of their origin."
- howTo (four steps, as printed on the box):
  1. "Take an adequate amount of lotion."
  2. "Apply evenly on clean skin."
  3. "Gently massage until absorbed."
  4. "Use daily for soft & nourished skin."

*Face Cleanser:*
- benefit "Skin brightening & anti-pigmentation"
- keyIngredients "Orange peel & sea-buckthorn" (this replaces the aloe vera / green tea note)
- claims: "Certified organic (OneCert)", "Skin brightening & anti-pigmentation", "With orange peel & sea-buckthorn"
- howTo stays for now. `TODO(client)`: the four steps printed on the cleanser box aren't legible in the shared image; copy them once a sharper image arrives.

*Both products* — add these rows to `details`:
- "Certification: OneCert certified organic"
- "Marketed by: Jiai Lifestyles Private Limited"
- "Customer care: +91 11 4039 3888"

**Brand line** (`brands.js`, from the packaging): One Origin `line` becomes "Single source purity · Infinite luxury".

## 3. Rituals rows (the client's correction)

The client confirmed they **do not make a face moisturiser; they have a body lotion.** Row 03 becomes the Body Lotion:

```js
{ n:"03", productId:"one-origin-body-lotion", image:"assets/rituals/ritual-03-lotion.webp",
  title:"Nourishment You Can Feel",
  text:"A lightweight organic body lotion that deeply hydrates and nourishes. Made with jojoba oil, aloe vera and sea-buckthorn for soft, smooth skin every day.",
  features:[ {icon:"droplet",label:"Deep Hydration"}, {icon:"leaf",label:"Certified Organic"}, {icon:"sparkles",label:"Soft & Smooth Skin"} ] },
```

- Remove the moisturiser's "Notify me" link and its TODO.
- **Row 01:** change the text to "A gentle face cleanser that removes impurities while keeping your skin's natural balance intact. Enriched with orange peel and sea-buckthorn for a fresh, healthy glow." (the real ingredients).
- `TODO(client)`: the still-life photos in rows 01 and 02 show older labels. Ask for updated versions with the new packaging.

## 4. L'Arrivé — Noir and Auren

**The existing L'Arrivé becomes L'Arrivé Noir.** Keep the id `larrive-body-spray` so links and carts survive.
- name "L'Arrivé Noir"; fullName "L'Arrivé Noir — Premium Body Spray for Men"
- line "Une touche de Paris"
- images:
  - hero / card: `larrive-noir-cutout-light.webp`
  - dark: `larrive-noir-cutout.webp`
  - campaign: `larrive-noir-campaign.webp`
  - lifestyle: keep `ritual-02-larrive.webp`
- Everything else (longevity, notes, price) stays.

**The placeholder `larrive-02` becomes L'Arrivé Auren** (id `larrive-auren`):
- name "L'Arrivé Auren"; fullName "L'Arrivé Auren — Premium Body Spray for Men"
- benefit "A new fragrance from L'Arrivé. Une touche de Paris."
- images: `larrive-auren-cutout.webp` (card, product page); `larrive-auren-campaign.webp` (gallery)
- Set `comingSoon:false` with price 899 and size "150 ml", both `TODO(client)` like the other placeholder prices.
- Add `rating:null` (shows "No ratings yet") and the same `details` rows as Noir.
- `TODO(client)`: confirm it's a body spray, the size, the price and its notes.

**Where they show up:**
- **Hero, large card:** switch to `larrive-noir-campaign.webp`, with the Update 04 preload and `srcset` variants; caption "L'Arrivé Noir · Paris 48.86° N". The LCP rules from Update 04 still apply: visible at first paint, transform-only entrance.
- **"Arrived." section:** the still bottle becomes `larrive-noir-cutout-light.webp`.
- **Combos:** "Origin to Arrival — Face Cleanser + L'Arrivé Noir" and "The Complete Ritual — Face Cleanser + Body Lotion + L'Arrivé Noir". The item ids are unchanged.
- **Automatically, from data:** the Brands and Origins dropdowns, the L'Arrivé room (both bottles), the brand page, the shop and search.

**Home wording:** there are now more than four pieces, so the hero button "Shop the four" becomes **"Shop the collection"** and the section title "Four to begin with." becomes **"The collection."** The grid stays data-driven.

## 5. Legal name and customer care

- **Footer:** the bottom row reads "© 2026 Jiai Lifestyles Private Limited. All rights reserved." The Help column adds "Call us: +91 11 4039 3888" as a `tel:+911140393888` link.
- **Product pages:** the details rows from §2 on every product, including combos and Auren.
- **JSON-LD `Organization`:** `name` "Jiai Life", `legalName` "Jiai Lifestyles Private Limited", `telephone` "+91-11-4039-3888", `contactPoint` (customer service, IN, English/Hindi), and `logo` pointing to `jiai-logo-official.png`.
- `TODO(client)`: registered address and support email.

## 6. Footer: "Questions" → "FAQs", and a new FAQ page

Rename the footer link "Questions" to **"FAQs"**. It links to a new `faq.html`:
- Same header/footer partials, H1 "FAQs", and one intro line ("Quick answers about orders, products and your origin code.").
- A Bootstrap accordion (styled like the product tabs) grouped under small tracked labels.
- The customer-care line at the end, and JSON-LD `FAQPage` for these questions.

| Group | Question | Answer |
|---|---|---|
| Orders & delivery | How long does delivery take? | Most orders arrive in 2–6 working days, depending on your PIN code. Enter your PIN code on any product page to see the expected date. `TODO(client): confirm` |
| Orders & delivery | Is delivery free? | Delivery is free on orders over ₹999; below that, a ₹49 delivery fee applies. (Read both numbers from `CONFIG.delivery`.) |
| Orders & delivery | Do you offer cash on delivery? | Yes, cash on delivery is available on most PIN codes. `TODO(client)` |
| Payments | Which payment methods do you accept? | UPI, cards, net banking and cash on delivery. `TODO(client): confirm at launch` |
| Returns | What if my order arrives damaged or wrong? | Contact us within 48 hours of delivery with a photo of the item, and we'll replace it. `TODO(client): returns policy` |
| Products | Are One Origin products organic? | Yes. One Origin products are certified organic by OneCert, as shown on every pack. |
| Products | Are they suitable for sensitive skin? | They're made with natural ingredients, but every skin is different. Try a small amount on your inner arm and wait 24 hours before first use. |
| Products | How long does L'Arrivé last? | L'Arrivé is made to last up to 10 hours on skin. |
| Products | What is the shelf life? | `TODO(client)` (until then, "See the pack for the best-before date.") |
| Origin & your code | What is the code on my tube? | Every One Origin tube carries a code. Scan it to see where its key ingredient came from: the field, the harvest and the batch details. |
| Contact | How can I reach you? | Call customer care on +91 11 4039 3888. `TODO(client): hours and email` |

## 7. After copying: image sizes and cleanup

- **Re-run `tools/make-image-sizes.py`** so every new or replaced image gets its responsive variants and `-thumb` files. Delete the variants of the removed images.
- **Check the lightbox:** HD sources point to the new `-hd`/`.png` files.
- **Check the budgets:** Update 04's speed targets still hold (≥ 90 on the five pages). The new pack images are larger than the old renders, so make sure cards and thumbnails use the right-sized variants.

---

## Acceptance

- **Logo:** the official logo shows in the header (dot animation works) and footer; the favicons and share image are updated.
- **One Origin:**
  - Both products show the **new packaging** everywhere: cards, product pages (pack first), House room, mega menu, cart, combos, category tiles, hero small card.
  - "Turn it in your hand" and the 360° viewer show the new label.
- **Product text:** the Body Lotion and Face Cleanser names, ingredients, claims, how-to-use steps and details match the packaging.
- **Rituals:** row 03 is the Body Lotion (no moisturiser anywhere), and row 01 lists orange peel and sea-buckthorn.
- **L'Arrivé:** Noir and Auren appear everywhere a brand's products are listed; the hero uses the Noir campaign image; the placeholder bottle is gone.
- **Legal and contact:** "Jiai Lifestyles Private Limited" and "+91 11 4039 3888" appear in the footer, product details and JSON-LD.
- **FAQs:** the footer says "FAQs", and `faq.html` works (accordion, keyboard, JSON-LD).
- **Quality:** the speed targets hold and all test suites pass. README changelog updated.
