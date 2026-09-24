/* ==========================================================================
   Site configuration — switches the client can flip without touching markup.
   ========================================================================== */

export const CONFIG = {
  currency: "INR",
  locale: "en-IN",
  showPrices: true,               // client may hide prices during the preview
  pricePlacement: "after-story",  // "after-story" | "top" (PDP)
  showComingBrands: false,        // teaser rooms for names mentioned in the meeting; client to approve
  freeShippingOver: 999,          // TODO(client)
  // Announcement bar (§7). Set to "" to remove the bar on every page.
  announcement: "Free delivery across India on orders over ₹999", // TODO(client): confirm wording
  bagKey: "jiai-bag-v1",
};
