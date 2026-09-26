# Update 03b — correction: Combos, not Compact size

The client's request was **combo products**, not compact sizes. This file overrides `UPDATE-03-CLIENT-CHANGES.md` wherever it mentions "Compact size" (§1, §3, §7, §8 sizes, and checklist item 7). Everything else in Update 03 stays exactly as written, including the second L'Arrivé product.

**When to apply it:** finish the phase you are in now. Apply this before Phase D. It also changes one tile you built in Phase B (Categories).

---

## 1. Remove all compact-size work

- Do not create `compact.html`. If it already exists, delete it.
- Remove "Compact size" from the Shop dropdown, the mobile menu and the shop filter chips.
- Do not add `compact` entries to `sizes`. Each product keeps its single size. If size-aware cart keys (`id + size`) already exist, they are harmless; keep them.
- Delete these files:
  - `assets/products/cleanser/cleanser-compact-compare.webp`
  - `assets/products/lotion/lotion-compact-compare.webp`
  - `assets/products/larrive/larrive-compact-compare.webp`
  - `assets/categories/category-compact.webp`

---

## 2. What the client wants: combos

A combo is a curated set of existing products sold as one product at a set price. It's the familiar Indian D2C pattern, as on Innovist.

**New files:**

| Path | What it is |
|---|---|
| `assets/combos/combo-skin-duo.webp` | Face Cleanser + Body Lotion, grouped, transparent background |
| `assets/combos/combo-origin-arrival.webp` | Face Cleanser + L'Arrivé |
| `assets/combos/combo-complete-ritual.webp` | Face Cleanser + Body Lotion + L'Arrivé |
| `assets/categories/category-combos.webp` | The trio on a warm plinth with leaf light (landscape tile) |

**Data.** Combos live in `products.js` as products with `type:"combo"`:

```js
{ id:"combo-one-origin-duo", type:"combo", brand:"jiai-life", category:"combo", tags:["bestseller"],
  name:"The One Origin Duo", fullName:"The One Origin Duo — Face Cleanser + Body Lotion",
  benefit:"Face and body, from one single source.",
  items:[ { id:"one-origin-face-cleanser", qty:1 }, { id:"one-origin-body-lotion", qty:1 } ],
  price:1249,                                   // TODO(client): combo price
  images:{ hero:"assets/combos/combo-skin-duo.webp" }, cardScale:.95 },

{ id:"combo-origin-to-arrival", type:"combo", brand:"jiai-life", category:"combo", tags:["new"],
  name:"Origin to Arrival", fullName:"Origin to Arrival — Face Cleanser + L’Arrivé",
  benefit:"Start the day clean. Arrive in style.",
  items:[ { id:"one-origin-face-cleanser", qty:1 }, { id:"larrive-body-spray", qty:1 } ],
  price:1399,                                   // TODO(client)
  images:{ hero:"assets/combos/combo-origin-arrival.webp" }, cardScale:.95 },

{ id:"combo-complete-ritual", type:"combo", brand:"jiai-life", category:"combo", tags:[],
  name:"The Complete Ritual", fullName:"The Complete Ritual — Face Cleanser + Body Lotion + L’Arrivé",
  benefit:"Morning, day and evening, in one set.",
  items:[ { id:"one-origin-face-cleanser", qty:1 }, { id:"one-origin-body-lotion", qty:1 }, { id:"larrive-body-spray", qty:1 } ],
  price:1999,                                   // TODO(client)
  images:{ hero:"assets/combos/combo-complete-ritual.webp" }, cardScale:.95 },
// TODO(client): which combos to sell, their names and prices; add Nº 2 or the second L’Arrivé once they are live.
```

**Rules:**
- **Worth price:** compute a combo's MRP from its items' current prices (`comboWorth(p)` = the sum of `item.price × qty`). Don't hard-code it, so it stays right when prices change.
- **Savings:** show "Save ₹149" (worth minus price) in `--accent`, and the struck "worth" price.
- **House-owned:** combos belong to the house (`brand:"jiai-life"`), not to one brand. Never list them under a brand in the **Brands** or **Origins** dropdowns, and exclude them from brand product grids.
- **Cross-sell:** on each brand page, add a short "Complete the set" row showing the combos that contain that brand's products.

---

## 3. Where combos appear

1. **Shop dropdown:** the "Shop" column becomes Shop all, New arrivals, Bestsellers, **Combos** (links to `combos.html`). Add it to the mobile menu's Shop group too.
2. **Shop page:** a "Combos" filter chip (`?category=combo`). Combos also appear in "Shop all".
3. **Categories section:** the fourth tile changes to:

   ```js
   { title:"Combos", text:"Better together: rituals paired and priced as sets.", href:"combos.html",
     image:"assets/categories/category-combos.webp", pos:"50% 60%" }
   ```

4. **New page `combos.html`**, using the same header/footer partials:
   - A short hero: H1 "Combos.", the line "Better together: our pieces, paired into rituals and priced as sets.", and `category-combos.webp` in an ivory stage.
   - A grid of all combos, using the card component.
   - The newsletter at the end.
5. **Product pages:** "Complete the ritual" shows first the combos that contain the current product, with their "Save ₹…" badges.
6. **Search:** results include combos.

**Combo card** (the same card component, plus):
- A badge top-left: "Combo · 2 pieces" (or 3).
- The combo image at `cardScale .95` (a group fills the stage wider).
- The price with the struck worth price and "Save ₹149".
- "Shop Now" + "Add to Cart", as on every card.

---

## 4. Combo product page (`product.html?id=combo-…`)

- **Gallery:** the combo image first, then each item's hero image, then the items' other images. The lightbox works across all of them.
- **Buy box:**
  - The label "Jiai Life · Combo" and the name.
  - The rating badge (shows "No ratings yet").
  - The price, the struck worth, "Save ₹149 (11% off)" and "Inclusive of all taxes".
  - No size selector. Quantity, "Add to Cart" and wishlist as usual.
- **New section right under the buy box, before Delivery Options:** "What's in the combo".
  - A row of item cards: thumbnail, brand, name, size, and "Worth ₹649", each linking to the item's own page.
  - Underneath: "Worth ₹1,398 · You pay ₹1,249".
- **Tabs:**
  - **Product Details:** a combo spec table — Contents, Pieces, Sizes (e.g. "100 ml + 100 ml"), Brands, Country of origin.
  - **How to Use:** each item's steps, grouped under the item's name.
  - **Product Description:** the combo's description.
  - **Special Features:** the items' features combined, at most 6.
- **Where it's from:** list the origin of each item. Only show pins for items that have an origin.
- **Ratings & Reviews:** the empty state ("Be the first to review this product"). No sample reviews for combos.

**Cart:** a combo is **one line**: the combo image and name, with a small sub-line listing its contents ("Face Cleanser 100 ml + Body Lotion 100 ml").

---

## 5. Acceptance checklist (replaces Update 03 item 7)

- "Compact size" appears nowhere: menus, filters, pages, data or assets.
- **Combos:**
  - They show in the Shop dropdown, the mobile menu, the shop filters, the Categories tile and `combos.html` (3 combos).
  - Combo cards show the badge, the worth price and "Save ₹…".
  - A combo product page shows the gallery, "What's in the combo", the savings, and tabs with grouped How to Use.
  - "Add to Cart" creates one cart line that lists the combo's contents.
  - Combos are never listed under a brand in the Brands or Origins dropdowns. Brand pages show them in "Complete the set".
