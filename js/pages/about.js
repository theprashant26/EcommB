/* ==========================================================================
   About (about.html) — §9.5 editorial long-read.
   The client's text is in the HTML, verbatim. The giant H1 and each
   paragraph reveal by line from masks as they enter (SplitText, 0.8s).
   ========================================================================== */

import { initHeader } from "../core/header.js";
import { initBag } from "../core/bag.js";
import { initWishlist } from "../core/wishlist.js";
import { initReveals } from "../core/reveal.js";
import { initSearch } from "../core/search.js";
import { initMotion, splitLines } from "../core/motion.js";
import { $, $$ } from "../core/format.js";

initHeader();
initBag();
initSearch();
initWishlist();
initReveals();

initMotion((c, ctx) => {
  if (c.reduce) return; // final states: the text is simply there
  // The title is held hidden (CSS, html.motion-ok) until it is split, so it never flashes.
  const title = $(".about-title");
  if (window.SplitText) {
    document.fonts.ready.then(() => ctx.add(() => SplitText.create(title, {
      type: "lines", mask: "lines", autoSplit: true,
      onSplit(self) {
        gsap.set(title, { visibility: "visible" });
        return gsap.from(self.lines, { yPercent: 110, duration: 1, stagger: 0.08, ease: "power4.out", delay: 0.1 });
      },
    })));
  } else {
    gsap.set(title, { visibility: "visible" });
  }
  $$("[data-lines]").forEach((el) => splitLines(el, { ctx, duration: 0.8, start: "top 88%" }));
});
