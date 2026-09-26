import{initHeader as c}from"../core/header.js";import{initBag as d}from"../core/bag.js";import{initWishlist as m}from"../core/wishlist.js";import{initReveals as f}from"../core/reveal.js";import{initSearch as $}from"../core/search.js";import{initMotion as q}from"../core/motion.js";import{FAQ as r}from"../data/faq.js";import{esc as i,icon as b,$ as g,cssReady as h}from"../core/format.js";await h(),c(),d(),$(),m(),f();const s=g("[data-faq]");if(s){let l=0;s.innerHTML=r.map(({group:a,items:o})=>`
    <section class="faq-group" aria-label="${i(a)}">
      <h2 class="t-label faq-group-title">${i(a)}</h2>
      <div class="faq-list">
        ${o.map(({q:n,a:p})=>{const t=`faq-${++l}`;return`
        <div class="faq-item">
          <h3 class="faq-q">
            <button class="faq-btn collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${t}" aria-expanded="false" aria-controls="${t}" id="${t}-q">
              <span>${i(n)}</span>${b("plus")}
            </button>
          </h3>
          <div id="${t}" class="collapse" role="region" aria-labelledby="${t}-q">
            <div class="faq-a"><p>${i(p)}</p></div>
          </div>
        </div>`}).join("")}
      </div>
    </section>`).join(""),s.removeAttribute("data-pending");const e=document.createElement("script");e.type="application/ld+json",e.textContent=JSON.stringify({"@context":"https://schema.org","@type":"FAQPage",mainEntity:r.flatMap(({items:a})=>a.map(({q:o,a:n})=>({"@type":"Question",name:o,acceptedAnswer:{"@type":"Answer",text:n}})))}),document.head.appendChild(e)}q(()=>{});
