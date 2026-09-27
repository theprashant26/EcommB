import{initHeader as n}from"../core/header.js";import{initBag as d}from"../core/bag.js";import{initWishlist as p}from"../core/wishlist.js";import{initReveals as c}from"../core/reveal.js";import{initSearch as m}from"../core/search.js";import{initMotion as f}from"../core/motion.js";import{FAQ as $}from"../data/faq.js";import{esc as i,icon as q,$ as b,cssReady as v}from"../core/format.js";await v(),n(),d(),m(),p(),c();const t=b("[data-faq]");if(t){let s=0;t.innerHTML=$.map(({group:o,items:e})=>`
    <section class="faq-group" aria-label="${i(o)}">
      <h2 class="t-label faq-group-title">${i(o)}</h2>
      <div class="faq-list">
        ${e.map(({q:r,a:l})=>{const a=`faq-${++s}`;return`
        <div class="faq-item">
          <h3 class="faq-q">
            <button class="faq-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${a}" aria-expanded="false" aria-controls="${a}" id="${a}-q">
              <span>${i(r)}</span>${q("plus")}
            </button>
          </h3>
          <div id="${a}" class="collapse" role="region" aria-labelledby="${a}-q">
            <div class="faq-a"><p>${i(l)}</p></div>
          </div>
        </div>`}).join("")}
      </div>
    </section>`).join(""),t.removeAttribute("data-pending")}f(()=>{});
