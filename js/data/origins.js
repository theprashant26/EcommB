/* ==========================================================================
   Origins and batches — powers the map, the footer coordinates and the
   QR landing page (origin.html?batch=…).
   ========================================================================== */

export const ORIGINS = {
  "leh-ladakh": { name:"Leh, Ladakh", country:"India", lat:34.1526, lon:77.5771, altitude:"≈3,500 m", code:"IXL", // TODO(client): exact farm
    ingredient:"Sea-buckthorn (Hippophae rhamnoides)", season:"Late August to October",
    text:"High-altitude sea-buckthorn, picked by hand from a single source." },
  "paris": { name:"Paris", country:"France", lat:48.8566, lon:2.3522, code:"CDG",
    text:"A touch of Paris in every bottle." },   // TODO(client): exact perfumery / what is sourced from France
  "new-delhi": { name:"New Delhi", country:"India", lat:28.6139, lon:77.2090, code:"DEL" },
};

export const BATCHES = {
  "OO-LDK-2609-01": { productId:"one-origin-face-cleanser", originId:"leh-ladakh", destinationId:"new-delhi",
    field:"Field 3, Leh valley", harvestedBy:"Harvest team (names from client)",
    grownSeason:"Spring to autumn 2026",                                     // TODO(client)
    harvestDate:"2026-09-12", pressedDate:"2026-09-15",
    formulatedDate:"2026-09-18",                                             // TODO(client)
    filledDate:"2026-09-20", labReport:"#" },   // TODO(client): all real values
};

export const DEFAULT_BATCH = "OO-LDK-2609-01";

/** The destination every route arrives at (the customer's city; New Delhi for now). */
export const ARRIVAL_ORIGIN_ID = "new-delhi";
