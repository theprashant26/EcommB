/* ==========================================================================
   Site configuration — switches the client can flip without touching markup.
   ========================================================================== */

export const CONFIG = {
  currency: "INR",
  locale: "en-IN",
  showPrices: true,               // client may hide prices during the preview
  pricePlacement: "top",          // "top" | "after-story" (PDP; Update 02 sets "top")
  showComingBrands: false,        // teaser rooms for names mentioned in the meeting; client to approve
  freeShippingOver: 999,          // TODO(client)
  delivery: { freeOver: 999, fee: 49, cod: true },   // TODO(client): confirm fee and cash on delivery
  // Sample ratings/reviews for the preview. MUST be false at launch: never ship sample reviews as real ones.
  demoReviews: true,
  // Announcement bar (§7). Set to "" to remove the bar on every page.
  announcement: "Free delivery across India on orders over ₹999", // TODO(client): confirm wording
  // Social links and the WhatsApp button. tools/sync-partials.py writes these into every page's footer, mobile menu
  // and WhatsApp button, and the Organization JSON-LD "sameAs" (npm run build after a change).
  social: {
    instagram: "https://www.instagram.com/jiailife",
    // TODO(client): the canonical Facebook page URL. This is a share shortlink: replace it here (one line); the build
    // then also lists it in "sameAs" (share shortlinks are left out of it).
    facebook: "https://www.facebook.com/share/1EinoC5mo6/",
    whatsapp: "911140393888",   // TODO(client): confirm the WhatsApp number (placeholder: the customer-care line)
    whatsappText: "Hi Jiai Life, I have a question.",
  },
  bagKey: "jiai-bag-v1",          // the cart (key kept from before the rename so saved carts survive)
  wishlistKey: "jiai-wishlist-v1",
};
