/* ==========================================================================
   FAQs (faq.html) — Update 05 §6.
   The questions from js/data/faq.js as an accordion (Bootstrap's collapse via
   data-bs-toggle, keyboard and aria-expanded included; the site's own styles), grouped under small
   tracked labels, and the same list as FAQPage JSON-LD.
   ========================================================================== */

import { initHeader } from "../core/header.js";
import { initBag } from "../core/bag.js";
import { initWishlist } from "../core/wishlist.js";
import { initReveals } from "../core/reveal.js";
import { initSearch } from "../core/search.js";
import { initMotion } from "../core/motion.js";
import { FAQ } from "../data/faq.js";
import { esc, icon, $, cssReady } from "../core/format.js";

await cssReady();   // Update 04: the full stylesheet arrives without blocking; render once it applies

initHeader();
initBag();
initSearch();
initWishlist();
initReveals();

const root = $("[data-faq]");
if (root) {
  let n = 0;
  root.innerHTML = FAQ.map(({ group, items }) => `
    <section class="faq-group" aria-label="${esc(group)}">
      <h2 class="t-label faq-group-title">${esc(group)}</h2>
      <div class="faq-list">
        ${items.map(({ q, a }) => {
          const id = `faq-${++n}`;
          return `
        <div class="faq-item">
          <h3 class="faq-q">
            <button class="faq-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="false" aria-controls="${id}" id="${id}-q">
              <span>${esc(q)}</span>${icon("plus")}
            </button>
          </h3>
          <div id="${id}" class="collapse" role="region" aria-labelledby="${id}-q">
            <div class="faq-a"><p>${esc(a)}</p></div>
          </div>
        </div>`;
        }).join("")}
      </div>
    </section>`).join("");
  root.removeAttribute("data-pending");

  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.flatMap(({ items }) => items.map(({ q, a }) => ({
      "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a },
    }))),
  });
  document.head.appendChild(ld);
}

initMotion(() => {});
