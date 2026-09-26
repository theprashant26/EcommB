/* ==========================================================================
   Products — the single source for cards, PDP, cart, wishlist, search and menus.
   Adding a product = adding one object here.
   Update 02 (§12) fields: category, subcategory, ritual, tags, mrp, cardScale,
   rating (demo values while CONFIG.demoReviews is on), details, description,
   features, gallery. images.card / images.cardHover feed the product card.
   Combos (Update 03b): type:"combo", brand:"jiai-life" (the house), items:[{ id, qty }], a set
   price; their worth is computed from the items' prices (comboWorth), never typed in.
   gallery entries: fit:"cover" + focus for scene images (the rest are cutouts,
   shown whole on the ivory stage); hd is the lightbox file.
   ========================================================================== */

export const PRODUCTS = [
  { id:"one-origin-face-cleanser", brand:"one-origin",
    name:"Face Cleanser", fullName:"One Origin Face Cleanser", shortName:"Face cleanser",
    category:"skin", subcategory:"cleanser", ritual:"morning", tags:["bestseller"],
    benefit:"Skin brightening & anti-pigmentation", forWho:"For all skin types", size:"100 ml",
    price:649, mrp:null, priceNote:"placeholder",             // TODO(client): real price and MRP
    cardScale:0.92,                                           // the pack (box + tube) on the card stage
    rating:{ average:4.6, count:86, breakdown:{ 5:64, 4:15, 3:4, 2:2, 1:1 } },   // demo (CONFIG.demoReviews)
    keyIngredient:"Organic sea-buckthorn",
    keyIngredients:["Orange peel & sea-buckthorn"],                        // from the packaging (Update 05)
    claims:["Certified organic (OneCert)","Skin brightening & anti-pigmentation","With orange peel & sea-buckthorn"],
    whatItDoes:"A gentle daily cleanser that lifts away the day without stripping skin. Organic sea-buckthorn, prized for its vitamin C and omega-7, helps skin look brighter and more even over time.",
    description:"A gentle daily cleanser that lifts away the day without stripping skin. Organic sea-buckthorn, prized for its vitamin C and omega-7, helps skin look brighter and more even over time. Every tube traces back to a single source in Ladakh, picked by hand.",
    inside:"Organic sea-buckthorn from a single source, in a formula made with 100% natural ingredients.", // TODO(client): full INCI list
    // TODO(client): the four steps printed on the cleanser box aren't legible in the shared image; copy them from a sharper one.
    howTo:["Wet your face with lukewarm water.","Massage a small amount in slow circles for 30 seconds.","Rinse well. Use morning and night."],
    details:[ ["Brand","One Origin"], ["Product","Face Cleanser"], ["Net volume","100 ml"], ["Skin type","All skin types"],
              ["Key ingredients","Orange peel & sea-buckthorn"], ["Shelf life","TODO(client)"], ["Country of origin","India"],
              ["Certification","OneCert certified organic"], ["Marketed by","Jiai Lifestyles Private Limited"], ["Customer care","+91 11 4039 3888"] ],
    features:[ { icon:"leaf", title:"Single-source sea-buckthorn", text:"Traceable to one field in Ladakh." },
               { icon:"droplet", title:"Gentle, daily", text:"Cleans without stripping skin." },
               { icon:"sparkles", title:"Brighter, more even", text:"Vitamin C and omega-7 at work." },
               { icon:"map-pin", title:"Trace your tube", text:"Scan the code on the back." } ],
    images:{ hero:"assets/products/cleanser/cleanser-hero.webp", cutout:"assets/products/cleanser/cleanser-cutout.webp",
             angle:"assets/products/cleanser/cleanser-angle.webp", back:"assets/products/cleanser/cleanser-back.webp",
             pack:"assets/products/cleanser/cleanser-pack.webp", tube:"assets/products/cleanser/cleanser-tube.webp",
             box:"assets/products/cleanser/cleanser-box.webp",
             card:"assets/products/cleanser/cleanser-pack.webp", cardHover:"assets/products/cleanser/cleanser-hero.webp" },
    gallery:[ { src:"assets/products/cleanser/cleanser-pack.webp", hd:"assets/products/cleanser/cleanser-pack.png", alt:"One Origin Face Cleanser, box and tube" },
              { src:"assets/products/cleanser/cleanser-front.webp", hd:"assets/products/cleanser/cleanser-front-hd.webp", alt:"One Origin Face Cleanser, front" },
              { src:"assets/products/cleanser/cleanser-angle.webp", hd:"assets/products/cleanser/cleanser-angle-hd.webp", alt:"One Origin Face Cleanser, angle" },
              { src:"assets/products/cleanser/cleanser-back.webp", hd:"assets/products/cleanser/cleanser-back-hd.webp", alt:"One Origin Face Cleanser, back label with origin code" },
              { src:"assets/products/cleanser/cleanser-label.webp", hd:"assets/products/cleanser/cleanser-label-hd.webp", alt:"One Origin Face Cleanser, label close-up", caption:"Label close-up" },
              { type:"360", frames:"assets/spin-hd/cleanser/", count:36 } ],
    spin:{ path:"assets/spin/cleanser/", frames:36 }, spinHD:{ path:"assets/spin-hd/cleanser/", frames:36 }, originId:"leh-ladakh" },

  { id:"one-origin-body-lotion", brand:"one-origin",
    name:"Organic Body Lotion", fullName:"One Origin Organic Body Lotion", shortName:"Body lotion",
    category:"skin", subcategory:"lotion", ritual:"evening", tags:[],
    benefit:"Deep hydration & skin nourishment", forWho:"For smoother body", size:"100 ml",
    price:749, mrp:null, priceNote:"placeholder",             // TODO(client): real price and MRP
    cardScale:0.92,                                           // the pack (box + tube) on the card stage
    rating:{ average:4.5, count:64, breakdown:{ 5:44, 4:14, 3:4, 2:1, 1:1 } },   // demo (CONFIG.demoReviews)
    keyIngredient:"Organic sea-buckthorn",
    keyIngredients:["Jojoba oil, aloe vera & sea-buckthorn"],               // from the packaging (Update 05)
    claims:["Certified organic (OneCert)","Deep hydration & skin nourishment","With jojoba oil, aloe vera & sea-buckthorn"],
    whatItDoes:"Nourishing care from nature's finest sources.",
    description:"Nourishing care from nature's finest sources. With organic ingredients and a commitment to purity, One Origin brings you effective everyday skincare inspired by the integrity of their origin.",
    inside:"Organic sea-buckthorn from a single source, in a formula made with 100% natural ingredients.", // TODO(client)
    howTo:["Take an adequate amount of lotion.","Apply evenly on clean skin.","Gently massage until absorbed.","Use daily for soft & nourished skin."],
    details:[ ["Brand","One Origin"], ["Product","Organic Body Lotion"], ["Net volume","100 ml"], ["Skin type","All skin types"],
              ["Key ingredients","Jojoba oil, aloe vera & sea-buckthorn"], ["Shelf life","TODO(client)"], ["Country of origin","India"],
              ["Certification","OneCert certified organic"], ["Marketed by","Jiai Lifestyles Private Limited"], ["Customer care","+91 11 4039 3888"] ],
    features:[ { icon:"leaf", title:"Single-source sea-buckthorn", text:"Traceable to one field in Ladakh." },
               { icon:"droplets", title:"Fast-absorbing", text:"Soft skin, no greasy feel." },
               { icon:"sparkles", title:"Deep hydration", text:"Jojoba oil, aloe vera & sea-buckthorn." } ],
    images:{ hero:"assets/products/lotion/lotion-hero.webp", cutout:"assets/products/lotion/lotion-cutout.webp",
             angle:"assets/products/lotion/lotion-angle.webp", back:"assets/products/lotion/lotion-back.webp",
             pack:"assets/products/lotion/lotion-pack.webp", tube:"assets/products/lotion/lotion-tube.webp",
             box:"assets/products/lotion/lotion-box.webp",
             card:"assets/products/lotion/lotion-pack.webp", cardHover:"assets/products/lotion/lotion-hero.webp" },
    gallery:[ { src:"assets/products/lotion/lotion-pack.webp", hd:"assets/products/lotion/lotion-pack.png", alt:"One Origin Organic Body Lotion, box and tube" },
              { src:"assets/products/lotion/lotion-front.webp", hd:"assets/products/lotion/lotion-front-hd.webp", alt:"One Origin Body Lotion, front" },
              { src:"assets/products/lotion/lotion-angle.webp", hd:"assets/products/lotion/lotion-angle-hd.webp", alt:"One Origin Body Lotion, angle" },
              { src:"assets/products/lotion/lotion-back.webp", hd:"assets/products/lotion/lotion-back-hd.webp", alt:"One Origin Body Lotion, back label with origin code" },
              { src:"assets/products/lotion/lotion-label.webp", hd:"assets/products/lotion/lotion-label-hd.webp", alt:"One Origin Body Lotion, label close-up", caption:"Label close-up" },
              { type:"360", frames:"assets/spin-hd/lotion/", count:36 } ],
    spin:{ path:"assets/spin/lotion/", frames:36 }, spinHD:{ path:"assets/spin-hd/lotion/", frames:36 }, originId:"leh-ladakh" },

  { id:"larrive-body-spray", brand:"larrive",
    name:"L’Arrivé Noir", fullName:"L’Arrivé Noir — Premium Body Spray for Men", line:"Une touche de Paris",
    category:"fragrance", subcategory:"body-spray", ritual:"day", tags:["bestseller", "new"],
    benefit:"Premium body spray for men", size:"150 ml",     // TODO(client): confirm
    price:899, mrp:null, priceNote:"placeholder",             // TODO(client): real price and MRP
    cardScale:0.9,
    rating:{ average:4.4, count:112, breakdown:{ 5:72, 4:26, 3:9, 2:3, 1:2 } },  // demo (CONFIG.demoReviews)
    longevityHours:10,
    notes:{ top:["Bergamot","Pink pepper"], heart:["Lavender","Violet leaf"], base:["Vetiver","Amberwood"] }, // TODO(client)
    whatItDoes:"A clean, confident scent made to last up to 10 hours. Spray at eight, still there at six.",
    description:"A clean, confident scent made to last up to 10 hours. Spray at eight, still there at six. L’Arrivé is French for ‘arrived’: made for the one who walks into the rush and doesn’t hurry.",
    howTo:["Spray on chest and neck from 15 cm.","Let it settle; don’t rub.","Once is enough for the day."],
    details:[ ["Brand","L’Arrivé"], ["Product","Premium Body Spray"], ["For","Men"], ["Fragrance family","TODO(client)"],
              ["Longevity","Up to 10 hours"], ["Net volume","150 ml (TBC)"], ["Shelf life","TODO(client)"], ["Country of origin","India"],
              ["Marketed by","Jiai Lifestyles Private Limited"], ["Customer care","+91 11 4039 3888"] ],
    features:[ { icon:"clock", title:"Up to 10 hours", text:"Spray at eight, still there at six." },
               { icon:"sparkles", title:"Une touche de Paris", text:"A clean, confident signature." },
               { icon:"gem", title:"Premium body spray", text:"Made for everyday confidence." } ],
    images:{ hero:"assets/products/larrive/larrive-noir-cutout-light.webp", dark:"assets/products/larrive/larrive-noir-cutout.webp",
             campaign:"assets/products/larrive/larrive-noir-campaign.webp", card:"assets/products/larrive/larrive-noir-cutout-light.webp" },
    gallery:[ { src:"assets/products/larrive/larrive-noir-cutout-light.webp", hd:"assets/products/larrive/larrive-noir-cutout-light.png", alt:"L’Arrivé Noir Premium Body Spray for Men" },
              { src:"assets/products/larrive/larrive-noir-cutout.webp", hd:"assets/products/larrive/larrive-noir-cutout.png", alt:"L’Arrivé Noir, the dark glass" },
              { src:"assets/products/larrive/larrive-noir-campaign.webp", hd:"assets/products/larrive/larrive-noir-campaign.jpg", alt:"L’Arrivé Noir on dark rock in blue light", fit:"cover" },
              { src:"assets/rituals/ritual-02-larrive.webp", alt:"L’Arrivé still life", fit:"cover", focus:"73% 50%" } ],   // TODO(client): high-resolution perfume photography
    originId:"paris" },

  { id:"perfume-no2", brand:"jiai-no2",
    name:"Nº 2", fullName:"Nº 2 (name to be revealed)", benefit:"A new fragrance from Jiai Life",
    category:"fragrance", subcategory:"perfume", ritual:"night", tags:["new"],
    size:"TBC", price:999, mrp:null, priceNote:"placeholder", comingSoon:true,
    cardScale:0.88,
    rating:null,
    description:"A new fragrance from Jiai Life. Its name, and its notes, arrive soon.",
    details:[ ["Brand","Nº 2"], ["Status","Coming soon"] ],
    features:[],
    images:{ hero:"assets/products/perfume-02/perfume-02-placeholder.webp", card:"assets/products/perfume-02/perfume-02-placeholder.webp" },
    gallery:[ { src:"assets/products/perfume-02/perfume-02-placeholder.webp", alt:"Nº 2, a new fragrance (placeholder bottle)" },
              { src:"assets/rituals/ritual-04-no2.webp", alt:"Nº 2 still life", fit:"cover", focus:"75% 50%" } ] },

  // Update 05: L'Arrivé Auren (the second L'Arrivé, formerly the placeholder larrive-02).
  // TODO(client): confirm it's a body spray, the size, the price and its notes.
  { id:"larrive-auren", brand:"larrive",
    name:"L’Arrivé Auren", fullName:"L’Arrivé Auren — Premium Body Spray for Men", line:"Une touche de Paris",
    category:"fragrance", subcategory:"body-spray", ritual:"evening", tags:["new"],
    benefit:"A new fragrance from L’Arrivé. Une touche de Paris", size:"150 ml",   // TODO(client): confirm
    price:899, mrp:null, priceNote:"placeholder",             // TODO(client): real price and MRP
    cardScale:0.9,
    rating:null,
    description:"A new fragrance from L’Arrivé. Une touche de Paris.",
    howTo:["Spray on chest and neck from 15 cm.","Let it settle; don’t rub.","Once is enough for the day."],
    details:[ ["Brand","L’Arrivé"], ["Product","Premium Body Spray"], ["For","Men"], ["Fragrance family","TODO(client)"],
              ["Longevity","TODO(client)"], ["Net volume","150 ml (TBC)"], ["Shelf life","TODO(client)"], ["Country of origin","India"],
              ["Marketed by","Jiai Lifestyles Private Limited"], ["Customer care","+91 11 4039 3888"] ],
    features:[ { icon:"sparkles", title:"Une touche de Paris", text:"The second fragrance from L’Arrivé." },
               { icon:"gem", title:"Premium body spray", text:"Made for everyday confidence." } ],
    images:{ hero:"assets/products/larrive/larrive-auren-cutout.webp", card:"assets/products/larrive/larrive-auren-cutout.webp",
             campaign:"assets/products/larrive/larrive-auren-campaign.webp" },
    gallery:[ { src:"assets/products/larrive/larrive-auren-cutout.webp", hd:"assets/products/larrive/larrive-auren-cutout.png", alt:"L’Arrivé Auren Premium Body Spray for Men" },
              { src:"assets/products/larrive/larrive-auren-campaign.webp", hd:"assets/products/larrive/larrive-auren-campaign.jpg", alt:"L’Arrivé Auren, the blue glass bottle on rock", fit:"cover" } ],
    originId:"paris" },

  // Update 03b: combos — curated sets of the pieces above, sold as one product at a set price.
  // TODO(client): which combos to sell, their names and prices; add Nº 2 or L’Arrivé Auren if wanted.
  { id:"combo-one-origin-duo", type:"combo", brand:"jiai-life", category:"combo", tags:["bestseller"],
    name:"The One Origin Duo", fullName:"The One Origin Duo — Face Cleanser + Body Lotion",
    benefit:"Face and body, from one single source",
    description:"The One Origin face cleanser and body lotion, together: the same organic sea-buckthorn from Leh, Ladakh, for the morning wash and the evening moisture.",
    items:[ { id:"one-origin-face-cleanser", qty:1 }, { id:"one-origin-body-lotion", qty:1 } ],
    price:1249,                                   // TODO(client): combo price
    rating:null, cardScale:0.95,
    images:{ hero:"assets/combos/combo-skin-duo.webp" } },

  { id:"combo-origin-to-arrival", type:"combo", brand:"jiai-life", category:"combo", tags:["new"],
    name:"Origin to Arrival", fullName:"Origin to Arrival — Face Cleanser + L’Arrivé Noir",
    benefit:"Start the day clean. Arrive in style",
    description:"From Leh to Paris: the One Origin face cleanser for the start of the day, and L’Arrivé Noir body spray for the way out.",
    items:[ { id:"one-origin-face-cleanser", qty:1 }, { id:"larrive-body-spray", qty:1 } ],
    price:1399,                                   // TODO(client): combo price
    rating:null, cardScale:0.95,
    images:{ hero:"assets/combos/combo-origin-arrival.webp" } },

  { id:"combo-complete-ritual", type:"combo", brand:"jiai-life", category:"combo", tags:[],
    name:"The Complete Ritual", fullName:"The Complete Ritual — Face Cleanser + Body Lotion + L’Arrivé Noir",
    benefit:"Morning, day and evening, in one set",
    description:"The whole day in one set: the face cleanser in the morning, L’Arrivé Noir through the day, and the body lotion in the evening.",
    items:[ { id:"one-origin-face-cleanser", qty:1 }, { id:"one-origin-body-lotion", qty:1 }, { id:"larrive-body-spray", qty:1 } ],
    price:1999,                                   // TODO(client): combo price
    rating:null, cardScale:0.95,
    images:{ hero:"assets/combos/combo-complete-ritual.webp" } },
];

/* ---------- lookups ---------- */

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

export const productsByBrand = (brandId) => PRODUCTS.filter((p) => p.brand === brandId);

/** Newest shoppable piece = the last product in the list that is not "coming soon". */
export const newestProduct = () => [...PRODUCTS].reverse().find((p) => !p.comingSoon) || PRODUCTS[0];

export const productURL = (id) => `product.html?id=${encodeURIComponent(id)}`;

/** The sizes a product is sold in (the first is the default); products without `sizes` have one. */
export const sizesOf = (p) => (p.sizes?.length ? p.sizes
  : [{ key: "full", label: p.size && p.size !== "TBC" ? p.size : "", price: p.price, mrp: p.mrp ?? null }]);
export const sizeOf = (p, key) => sizesOf(p).find((s) => s.key === key) || sizesOf(p)[0];

/* ---------- combos (Update 03b) ---------- */

/** The house's own label: combos belong to Jiai Life, not to one brand. */
export const HOUSE = { id: "jiai-life", name: "Jiai Life" };
export const isCombo = (p) => p?.type === "combo";
export const COMBOS = PRODUCTS.filter(isCombo);
/** [{ product, qty }] for a combo's contents. */
export const comboItems = (p) => (p.items || []).map((it) => ({ product: getProduct(it.id), qty: it.qty || 1 })).filter((it) => it.product);
/** What the pieces cost bought one by one (the struck "worth" price); follows the items' prices. */
export const comboWorth = (p) => comboItems(p).reduce((sum, it) => sum + it.product.price * it.qty, 0);
export const comboSaving = (p) => Math.max(0, comboWorth(p) - p.price);
export const comboPieces = (p) => comboItems(p).reduce((n, it) => n + it.qty, 0);
/** A piece's name inside a set: its short name, title-cased ("Body lotion" → "Body Lotion"). */
const setName = (x) => (x.shortName ? x.shortName.replace(/(^|\s)\S/g, (c) => c.toUpperCase()) : x.name);
/** "Face Cleanser 100 ml + Body Lotion 100 ml" */
export const comboContents = (p) => comboItems(p).map(({ product: x, qty }) =>
  `${qty > 1 ? `${qty} × ` : ""}${setName(x)}${x.size && x.size !== "TBC" ? ` ${x.size}` : ""}`).join(" + ");
/** The combos a product is part of. */
export const combosWith = (id) => COMBOS.filter((c) => (c.items || []).some((it) => it.id === id));
/** The combos holding any of a brand's products (its "Complete the set" row). */
export const combosForBrand = (brandId) => COMBOS.filter((c) => comboItems(c).some((it) => it.product.brand === brandId));
/** The brand name a product is shown under ("Jiai Life" for combos). */
export const brandNameOf = (p, getBrand) => (isCombo(p) ? HOUSE.name : getBrand(p.brand)?.name || "");

/** Category labels for menus and filters. */
export const CATEGORY_LABELS = { skin: "Skin care", fragrance: "Fragrance", combo: "Combos" };
export const RITUAL_LABELS = { morning: "Morning", day: "Day", evening: "Evening", night: "Night" };
