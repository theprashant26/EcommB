/* ==========================================================================
   Products — the single source for cards, PDP, cart, wishlist, search and menus.
   Adding a product = adding one object here.
   Update 02 (§12) fields: category, subcategory, ritual, tags, mrp, cardScale,
   rating (demo values while CONFIG.demoReviews is on), details, description,
   features, gallery. images.card / images.cardHover feed the product card.
   gallery entries: fit:"cover" + focus for scene images (the rest are cutouts,
   shown whole on the ivory stage); hd is the lightbox file.
   ========================================================================== */

export const PRODUCTS = [
  { id:"one-origin-face-cleanser", brand:"one-origin",
    name:"Face Cleanser", fullName:"One Origin Face Cleanser", shortName:"Face cleanser",
    category:"skin", subcategory:"cleanser", ritual:"morning", tags:["bestseller"],
    benefit:"Skin brightening and anti-pigmentation", forWho:"For all skin types", size:"100 ml",
    price:649, mrp:null, priceNote:"placeholder",             // TODO(client): real price and MRP
    cardScale:1,
    rating:{ average:4.6, count:86, breakdown:{ 5:64, 4:15, 3:4, 2:2, 1:1 } },   // demo (CONFIG.demoReviews)
    keyIngredient:"Organic sea-buckthorn",
    keyIngredients:["Organic sea-buckthorn", "Aloe vera", "Green tea"],   // TODO(client): confirm aloe vera and green tea (mentioned in your Rituals reference)
    claims:["100% natural ingredients","With organic sea-buckthorn","For all skin types"],
    whatItDoes:"A gentle daily cleanser that lifts away the day without stripping skin. Organic sea-buckthorn, prized for its vitamin C and omega-7, helps skin look brighter and more even over time.",
    description:"A gentle daily cleanser that lifts away the day without stripping skin. Organic sea-buckthorn, prized for its vitamin C and omega-7, helps skin look brighter and more even over time. Every tube traces back to a single source in Ladakh, picked by hand.",
    inside:"Organic sea-buckthorn from a single source, in a formula made with 100% natural ingredients.", // TODO(client): full INCI list
    howTo:["Wet your face with lukewarm water.","Massage a small amount in slow circles for 30 seconds.","Rinse well. Use morning and night."],
    details:[ ["Brand","One Origin"], ["Product","Face Cleanser"], ["Net volume","100 ml"], ["Skin type","All skin types"],
              ["Key ingredients","Organic sea-buckthorn"], ["Shelf life","TODO(client)"], ["Country of origin","India"],
              ["Marketed by","Jiai Life — TODO(client): legal name and address"], ["Customer care","TODO(client): email and phone"] ],
    features:[ { icon:"leaf", title:"Single-source sea-buckthorn", text:"Traceable to one field in Ladakh." },
               { icon:"droplet", title:"Gentle, daily", text:"Cleans without stripping skin." },
               { icon:"sparkles", title:"Brighter, more even", text:"Vitamin C and omega-7 at work." },
               { icon:"map-pin", title:"Trace your tube", text:"Scan the code on the back." } ],
    images:{ hero:"assets/products/cleanser/cleanser-hero.webp", cutout:"assets/products/cleanser/cleanser-cutout.webp",
             angle:"assets/products/cleanser/cleanser-angle.webp", back:"assets/products/cleanser/cleanser-back.webp",
             card:"assets/products/cleanser/cleanser-front.webp", cardHover:"assets/products/cleanser/cleanser-angle.webp" },
    gallery:[ { src:"assets/products/cleanser/cleanser-front.webp", hd:"assets/products/cleanser/cleanser-front-hd.webp", alt:"One Origin Face Cleanser, front" },
              { src:"assets/products/cleanser/cleanser-angle.webp", hd:"assets/products/cleanser/cleanser-angle-hd.webp", alt:"One Origin Face Cleanser, angle" },
              { src:"assets/products/cleanser/cleanser-back.webp", hd:"assets/products/cleanser/cleanser-back-hd.webp", alt:"One Origin Face Cleanser, back label with origin code" },
              { src:"assets/products/cleanser/cleanser-label.webp", hd:"assets/products/cleanser/cleanser-label-hd.webp", alt:"One Origin Face Cleanser, label close-up", caption:"Label close-up" },
              { type:"360", frames:"assets/spin-hd/cleanser/", count:36 } ],
    spin:{ path:"assets/spin/cleanser/", frames:36 }, spinHD:{ path:"assets/spin-hd/cleanser/", frames:36 }, originId:"leh-ladakh" },

  { id:"one-origin-body-lotion", brand:"one-origin",
    name:"Organic Moisturizing Body Lotion", fullName:"One Origin Organic Moisturizing Body Lotion", shortName:"Body lotion",
    category:"skin", subcategory:"lotion", ritual:"evening", tags:[],
    benefit:"Skin brightening and anti-pigmentation", forWho:"For smoother body", size:"100 ml",
    price:749, mrp:null, priceNote:"placeholder",             // TODO(client): real price and MRP
    cardScale:1,
    rating:{ average:4.5, count:64, breakdown:{ 5:44, 4:14, 3:4, 2:1, 1:1 } },   // demo (CONFIG.demoReviews)
    keyIngredient:"Organic sea-buckthorn",
    keyIngredients:["Organic sea-buckthorn"],
    claims:["100% natural ingredients","With organic sea-buckthorn","For smoother skin"],
    whatItDoes:"A light, fast-absorbing lotion that softens and smooths skin from shoulders to heels while helping it look brighter and more even.",
    description:"A light, fast-absorbing lotion that softens and smooths skin from shoulders to heels while helping it look brighter and more even. Made with organic sea-buckthorn from a single source in Ladakh.",
    inside:"Organic sea-buckthorn from a single source, in a formula made with 100% natural ingredients.", // TODO(client)
    howTo:["Apply to clean skin after bathing.","Massage in long strokes until absorbed.","Use daily."],
    details:[ ["Brand","One Origin"], ["Product","Organic Moisturizing Body Lotion"], ["Net volume","100 ml"], ["Skin type","All skin types"],
              ["Key ingredients","Organic sea-buckthorn"], ["Shelf life","TODO(client)"], ["Country of origin","India"],
              ["Marketed by","Jiai Life — TODO(client): legal name and address"], ["Customer care","TODO(client): email and phone"] ],
    features:[ { icon:"leaf", title:"Single-source sea-buckthorn", text:"Traceable to one field in Ladakh." },
               { icon:"droplets", title:"Fast-absorbing", text:"Soft skin, no greasy feel." },
               { icon:"sparkles", title:"Smoother, brighter", text:"Shoulders to heels." } ],
    images:{ hero:"assets/products/lotion/lotion-hero.webp", cutout:"assets/products/lotion/lotion-cutout.webp",
             angle:"assets/products/lotion/lotion-angle.webp", back:"assets/products/lotion/lotion-back.webp",
             card:"assets/products/lotion/lotion-front.webp", cardHover:"assets/products/lotion/lotion-angle.webp" },
    gallery:[ { src:"assets/products/lotion/lotion-front.webp", hd:"assets/products/lotion/lotion-front-hd.webp", alt:"One Origin Body Lotion, front" },
              { src:"assets/products/lotion/lotion-angle.webp", hd:"assets/products/lotion/lotion-angle-hd.webp", alt:"One Origin Body Lotion, angle" },
              { src:"assets/products/lotion/lotion-back.webp", hd:"assets/products/lotion/lotion-back-hd.webp", alt:"One Origin Body Lotion, back label with origin code" },
              { src:"assets/products/lotion/lotion-label.webp", hd:"assets/products/lotion/lotion-label-hd.webp", alt:"One Origin Body Lotion, label close-up", caption:"Label close-up" },
              { type:"360", frames:"assets/spin-hd/lotion/", count:36 } ],
    spin:{ path:"assets/spin/lotion/", frames:36 }, spinHD:{ path:"assets/spin-hd/lotion/", frames:36 }, originId:"leh-ladakh" },

  { id:"larrive-body-spray", brand:"larrive",
    name:"L’Arrivé", fullName:"L’Arrivé Premium Body Spray for Men",
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
              ["Marketed by","Jiai Life — TODO(client): legal name and address"], ["Customer care","TODO(client): email and phone"] ],
    features:[ { icon:"clock", title:"Up to 10 hours", text:"Spray at eight, still there at six." },
               { icon:"sparkles", title:"Une touche de Paris", text:"A clean, confident signature." },
               { icon:"gem", title:"Premium body spray", text:"Made for everyday confidence." } ],
    images:{ hero:"assets/products/larrive/larrive-cutout-light.webp", dark:"assets/products/larrive/larrive-cutout.webp",
             campaign:"assets/products/larrive/larrive-campaign.webp", card:"assets/products/larrive/larrive-cutout-light.webp" },
    gallery:[ { src:"assets/products/larrive/larrive-cutout-light.webp", alt:"L’Arrivé Premium Body Spray for Men" },
              { src:"assets/products/larrive/larrive-cutout.webp", alt:"L’Arrivé, the dark glass" },
              { src:"assets/products/larrive/larrive-campaign.webp", alt:"L’Arrivé campaign image", fit:"cover" },
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
];

/* ---------- lookups ---------- */

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

export const productsByBrand = (brandId) => PRODUCTS.filter((p) => p.brand === brandId);

/** Newest shoppable piece = the last product in the list that is not "coming soon". */
export const newestProduct = () => [...PRODUCTS].reverse().find((p) => !p.comingSoon) || PRODUCTS[0];

export const productURL = (id) => `product.html?id=${encodeURIComponent(id)}`;

/** Category labels for menus and filters. */
export const CATEGORY_LABELS = { skin: "Skin care", fragrance: "Fragrance" };
export const RITUAL_LABELS = { morning: "Morning", day: "Day", evening: "Evening", night: "Night" };
