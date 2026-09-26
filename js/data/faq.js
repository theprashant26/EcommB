/* ==========================================================================
   FAQs (Update 05 §6) — faq.html renders the accordion and the FAQPage
   JSON-LD from this list. `todo` notes what the client still has to confirm
   (never shown on the page).
   ========================================================================== */

import { CONFIG } from "./config.js";

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const { freeOver, fee } = CONFIG.delivery;

export const CARE_PHONE = { label: "+91 11 4039 3888", href: "tel:+911140393888" };

export const FAQ = [
  { group: "Orders & delivery", items: [
    { q: "How long does delivery take?",
      a: "Most orders arrive in 2–6 working days, depending on your PIN code. Enter your PIN code on any product page to see the expected date.",
      todo: "confirm delivery times" },
    { q: "Is delivery free?",
      a: `Delivery is free on orders over ${inr(freeOver)}; below that, a ${inr(fee)} delivery fee applies.` },
    { q: "Do you offer cash on delivery?",
      a: "Yes, cash on delivery is available on most PIN codes.", todo: "confirm" },
  ] },
  { group: "Payments", items: [
    { q: "Which payment methods do you accept?",
      a: "UPI, cards, net banking and cash on delivery.", todo: "confirm at launch" },
  ] },
  { group: "Returns", items: [
    { q: "What if my order arrives damaged or wrong?",
      a: "Contact us within 48 hours of delivery with a photo of the item, and we'll replace it.", todo: "returns policy" },
  ] },
  { group: "Products", items: [
    { q: "Are One Origin products organic?",
      a: "Yes. One Origin products are certified organic by OneCert, as shown on every pack." },
    { q: "Are they suitable for sensitive skin?",
      a: "They're made with natural ingredients, but every skin is different. Try a small amount on your inner arm and wait 24 hours before first use." },
    { q: "How long does L’Arrivé last?",
      a: "L’Arrivé is made to last up to 10 hours on skin." },
    { q: "What is the shelf life?",
      a: "See the pack for the best-before date.", todo: "shelf life" },
  ] },
  { group: "Origin & your code", items: [
    { q: "What is the code on my tube?",
      a: "Every One Origin tube carries a code. Scan it to see where its key ingredient came from: the field, the harvest and the batch details." },
  ] },
  { group: "Contact", items: [
    { q: "How can I reach you?",
      a: `Call customer care on ${CARE_PHONE.label}.`, todo: "hours and email" },
  ] },
];
