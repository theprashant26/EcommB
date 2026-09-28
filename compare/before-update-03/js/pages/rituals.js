/* ==========================================================================
   Rituals (rituals.html) — Update 02 §11.
   Hero, the alternating ritual rows (js/data/rituals.js, shared with home),
   "A day with Jiai": four moments, each with its icon, a one-line ritual
   and the product card (horizontal scroll-snap on desktop, stacked on
   phones), then the newsletter.
   ========================================================================== */

import { initHeader } from "../core/header.js";
import { initBag } from "../core/bag.js";
import { initWishlist } from "../core/wishlist.js";
import { initReveals } from "../core/reveal.js";
import { initSearch } from "../core/search.js";
import { initMotion, splitLines } from "../core/motion.js";
import { cardHTML } from "../core/cards.js";
import { ritualRowsHTML, ritualRowsMotion } from "../core/ritual-rows.js";
import { PRODUCTS, RITUAL_LABELS } from "../data/products.js";
import { esc, icon, $, $$ } from "../core/format.js";

initHeader();
initBag();
initSearch();
initWishlist();
initReveals();

const MOMENTS = {
  morning: { icon: "sunrise", line: "Begin clean: thirty seconds of slow circles, before the day asks anything of you." },
  day: { icon: "sun", line: "Spray once at eight. It is still there at six." },
  evening: { icon: "sunset", line: "After the bath, long strokes from shoulders to heels." },
  night: { icon: "moon", line: "A new fragrance for the last hour of the day. Its name arrives soon." },
};

const rows = $("[data-ritual-rows]");
if (rows) rows.innerHTML = ritualRowsHTML({ headingLevel: 2 });

const day = $("[data-day]");
if (day) {
  day.innerHTML = Object.keys(RITUAL_LABELS).map((key) => {
    const p = PRODUCTS.find((x) => x.ritual === key);
    if (!p) return "";
    const m = MOMENTS[key];
    return `
      <li class="day-moment">
        <p class="day-when">${icon(m.icon)}<span class="t-label">${esc(RITUAL_LABELS[key])}</span></p>
        <p class="day-line">${esc(m.line)}</p>
        ${cardHTML(p, { headingLevel: 3 })}
      </li>`;
  }).join("");
}

initMotion((c, ctx) => {
  if (c.reduce) return;   // rows, cards and titles simply show
  $$("#rituals-title, #day-title, #letters-title").forEach((el) => splitLines(el, { ctx }));
  ritualRowsMotion(rows, { ctx, reduce: c.reduce });
});
