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
  bagKey: "jiai-bag-v1",          // the cart (key kept from before the rename so saved carts survive)
  wishlistKey: "jiai-wishlist-v1",
};
