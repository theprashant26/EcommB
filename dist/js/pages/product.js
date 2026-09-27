import{initHeader as ct}from"../core/header.js";import{initBag as dt,bagSubtotal as pt,bagHas as mt}from"../core/bag.js";import{initWishlist as ut,wishButtonHTML as ht}from"../core/wishlist.js";import{initReveals as bt}from"../core/reveal.js";import{initSearch as ft}from"../core/search.js";import{initMotion as gt,splitLines as $t,whenScriptsReady as vt,afterPaint as G}from"../core/motion.js";import{createSpin as yt,frameURL as wt}from"../core/spin.js";import{createMap3d as Lt}from"../core/map3d.js";import{cardHTML as _,comboPriceHTML as Tt,sampleNoteHTML as J,showsSampleRating as Mt,SAMPLE_NOTE as St}from"../core/cards.js";import{openLightbox as kt}from"../core/lightbox.js";import{reviewsSectionHTML as Ht,initReviews as Ot,ratingFor as zt}from"../core/reviews.js";import{deliveryHTML as It,initDelivery as jt}from"../core/delivery.js";import{shareButtonHTML as Ct,initShare as Nt}from"../core/share.js";import{initTabs as Rt}from"../core/tabs.js";import{nameForTransition as At}from"../core/transitions.js";import{CONFIG as L}from"../data/config.js";import{PRODUCTS as D,COMBOS as Pt,getProduct as Et,productURL as Dt,sizesOf as X,isCombo as v,comboItems as I,comboWorth as Bt,combosWith as Wt,brandNameOf as B,setName as xt}from"../data/products.js";import{getBrand as j,brandURL as W}from"../data/brands.js";import{ORIGINS as w,BATCHES as Ft,ARRIVAL_ORIGIN_ID as x}from"../data/origins.js";import{esc as s,formatPrice as O,formatCoords as Y,imageSize as z,icon as b,priceHTML as qt,reducedMotion as F,srcsetAttr as Ut,thumbOf as K,SIZES as V,$ as c,$$ as q,cssReady as Qt}from"../core/format.js";await Qt(),ct(),dt(),ft(),ut(),bt();const T=c("[data-pdp]"),Z=new URLSearchParams(location.search).get("id"),y=Z&&Et(Z),M=y&&j(y.brand),Gt="full",C=()=>X(y)[0],U=v(y),H=t=>I(t).map(e=>e.product),S=t=>[...new Set(t.filter(Boolean))],Q=t=>!t.comingSoon&&L.showPrices,_t=t=>Object.entries(Ft).find(([,e])=>e.productId===t.id)?.[0],Jt={"leh-ladakh":{routes:["leh"],pins:["leh","delhi"]},paris:{routes:["paris"],pins:["paris","delhi"]}},tt=t=>S(U?H(t).map(e=>e.originId):[t.originId]).filter(e=>w[e]),Xt=t=>{const e=tt(t).map(i=>Jt[i]).filter(Boolean);return{routes:S(e.flatMap(i=>i.routes)),pins:S(e.flatMap(i=>i.pins))}},et=(t="")=>{if(!/TODO\(client\)/.test(t))return t;const e=t.replace(/\s*(—|:)?\s*TODO\(client\).*$/,"").trim();return e?`${e} (details to be confirmed)`:"To be confirmed"},Yt=t=>t.gallery?.length?t.gallery.filter(e=>e.src):[{src:t.images.hero,alt:t.fullName}],at=t=>{if(!v(t))return t.gallery?.length?t.gallery:[{src:t.images.hero,alt:t.fullName}];const e=H(t).map(Yt);return[{src:t.images.hero,alt:`${t.fullName}, together`},...e.map(i=>i[0]),...e.flatMap(i=>i.slice(1))]},it=t=>at(t).filter(e=>e.src);function Kt(t){const[e,i]=z(t),o=Math.min(.82,1.075*(e/i));return V.pdp.split(", ").map(l=>l.replace(/(\d+)(vw|px)$/,(a,n,p)=>`${Math.round(n*o)}${p}`)).join(", ")}function Vt(t){const e=at(t),i=(a,n)=>a.type==="360"?`<button type="button" class="pdp-thumb pdp-thumb--360" data-go="${n}" aria-label="Turn it through 360 degrees">${b("rotate-3d")}<span>360\xB0</span></button>`:`<button type="button" class="pdp-thumb" data-go="${n}" aria-label="Show image ${n+1}: ${s(a.alt)}"><img src="${s(K(a.src))}" alt="" width="${z(a.src)[0]}" height="${z(a.src)[1]}" loading="lazy" fetchpriority="low" decoding="async"${a.fit==="cover"?` style="object-fit:cover;object-position:${s(a.focus||"50% 50%")}"`:""}></button>`;let o=-1;const l=(a,n)=>{if(a.type==="360")return`
        <div class="pdp-slide pdp-slide--360" data-slide="${n}" role="group" aria-roledescription="slide" aria-label="360\xB0 view">
          <img class="pdp-360-poster" src="${s(wt(t.spin.path,0))}" alt="" width="720" height="1080" loading="lazy" decoding="async" data-360-poster>
          <canvas class="pdp-360" tabindex="0" role="img" aria-label="${s(t.fullName)} turning 360 degrees. Drag, or use the arrow keys." data-360></canvas>
          <p class="pdp-360-hint">${b("rotate-3d")} Drag to turn</p>
        </div>`;o+=1;const[p,m]=z(a.src),r=a.fit==="cover";return`
      <div class="pdp-slide" data-slide="${n}" role="group" aria-roledescription="slide" aria-label="${n+1} of ${e.length}">
        <button type="button" class="pdp-open${r?" is-cover":""}" data-open="${o}" aria-label="Open full screen: ${s(a.alt)}">
          <img src="${s(a.src)}"${Ut(a.src,r?V.pdp:Kt(a.src))} alt="${s(a.alt)}" width="${p}" height="${m}" ${n===0?'fetchpriority="high"':'loading="lazy"'} decoding="async"${r?` style="object-position:${s(a.focus||"50% 50%")}"`:""}${n===0?" data-hero-img":""}>
        </button>
      </div>`};return`
    <div class="pdp-gallery" data-gallery>
      <div class="pdp-rail${e.length>5?" has-arrows":""}">
        <button type="button" class="pdp-rail-arrow" data-rail="-1" aria-label="Earlier images" ${e.length>5?"":"hidden"}>${b("chevron-up")}</button>
        <ol class="pdp-thumbs" data-thumbs>${e.map((a,n)=>`<li>${i(a,n)}</li>`).join("")}</ol>
        <button type="button" class="pdp-rail-arrow" data-rail="1" aria-label="Later images" ${e.length>5?"":"hidden"}>${b("chevron-down")}</button>
      </div>
      <div class="pdp-main">
        <div class="pdp-stage" aria-roledescription="carousel" aria-label="${s(t.fullName)} images">
          <div class="pdp-track" data-track>${e.map(l).join("")}</div>
        </div>
        <div class="pdp-dots" data-dots>${e.map((a,n)=>`<button type="button" class="pdp-dot" data-go="${n}" aria-label="Show ${a.type==="360"?"the 360\xB0 view":`image ${n+1}`}"></button>`).join("")}</div>
      </div>
    </div>`}function st(t){const e=zt(t);return e?`<a class="pdp-rating" href="#reviews" aria-label="Rated ${e.average.toFixed(1)} out of 5 from ${e.count} ratings. Go to Ratings and Reviews"><span>${e.average.toFixed(1)}</span>${b("star","icon--filled")}<span class="pdp-rating-sep" aria-hidden="true">|</span><span>${e.count} ${e.count===1?"rating":"ratings"}</span></a>`:'<span class="pdp-norating">No ratings yet</span>'}function Zt(t){const e=C(),i=t.comingSoon?'<p class="pdp-price"><span class="price">Arrives soon</span></p>':`<p class="pdp-price" data-pdp-price>${v(t)?Tt(t,{long:!0}):qt({price:e.price,mrp:e.mrp})}</p>${L.showPrices?'<p class="pdp-tax">Inclusive of all taxes</p>':""}`,o=v(t)?[]:X(t).filter(p=>p.label),l=L.delivery,a=Q(t)?`
    <div class="pdp-choices">
      ${o.length?`
      <div class="pdp-choice">
        <p class="t-label" id="sizeLabel">Size</p>
        <div class="pdp-sizes" role="radiogroup" aria-labelledby="sizeLabel">
          ${o.map(p=>`<button type="button" role="radio" class="size-chip" aria-checked="${p.key===e.key}">${s(p.label)}</button>`).join("")}
        </div>
      </div>`:""}
      <div class="pdp-choice">
        <p class="t-label" id="qtyLabel">Quantity</p>
        <div class="stepper pdp-stepper" role="group" aria-labelledby="qtyLabel">
          <button type="button" class="stepper-btn" data-qty="-1" aria-label="Decrease quantity">${b("minus")}</button>
          <input class="stepper-val stepper-input" id="pdpQty" type="number" inputmode="numeric" min="1" max="10" value="1" aria-label="Quantity">
          <button type="button" class="stepper-btn" data-qty="1" aria-label="Increase quantity">${b("plus")}</button>
        </div>
      </div>
    </div>`:"",n=Q(t)?`<button type="button" class="btn-maison btn-cart pdp-add" data-add-to-bag="${s(t.id)}" data-size="${s(e.key)}" data-qty-source="#pdpQty" data-add-from="[data-hero-img]"><span>Add to Cart</span></button>`:`<button type="button" class="btn-maison pdp-add" data-notify="${s(t.id)}"><span>Notify me</span></button>`;return`
    <div class="pdp-buy" data-buy>
      <div class="pdp-brandrow">
        ${v(t)?`<a class="t-label pdp-brand" href="combos.html">${s(B(t,j))} \xB7 Combo</a>`:M?`<a class="t-label pdp-brand" href="${W(M.id)}">${s(M.name)}</a>`:"<span></span>"}
        <div class="pdp-brandrow-end">
          ${t.comingSoon?"":`<span data-rating-slot>${st(t)}</span>`}
          ${Ct()}
        </div>
        ${Mt(t)?`<p class="sample-ratings-note pdp-sample-note">${St}</p>`:""}
      </div>
      <h1 class="t-h3 pdp-name">${s(t.fullName)}</h1>
      <div class="pdp-priceblock">${i}</div>
      <p class="pdp-benefit">${s(t.benefit)}${t.forWho?`. ${s(t.forWho)}`:""}.</p>
      ${a}
      <div class="pdp-actions">
        ${n}
        ${ht(t,"pdp-wish")}
      </div>
      <!-- TODO(client): confirm all three assurances -->
      <ul class="pdp-assure">
        ${t.comingSoon?"":`<li>${b("truck")}<span>Free delivery over ${O(l.freeOver)}</span></li>`}
        ${l.cod&&!t.comingSoon?`<li>${b("package-check")}<span>Cash on delivery available</span></li>`:""}
        <li>${b("shield-check")}<span>Authentic, traceable product</span></li>
      </ul>
    </div>`}function te(t){return`
    <section class="section pdp-combo" aria-labelledby="combo-title">
      <div class="wrap">
        <h2 id="combo-title" class="t-h3">What\u2019s in the combo</h2>
        <ul class="combo-items">
          ${I(t).map(({product:e,qty:i})=>{const o=e.images.card||e.images.hero,[l,a]=z(o),n=K(o);return`
          <li class="combo-item">
            <a class="combo-link" href="${Dt(e.id)}">
              <span class="combo-thumb"><img src="${s(n)}" alt="" width="${l}" height="${a}" loading="lazy" decoding="async"></span>
              <span class="combo-info">
                <span class="t-label combo-brand">${s(B(e,j))}</span>
                <span class="combo-name">${i>1?`${i} \xD7 `:""}${s(e.name)}</span>
                ${e.size&&e.size!=="TBC"?`<span class="coords combo-size">${s(e.size)}</span>`:""}
                ${L.showPrices?`<span class="combo-worth">Worth ${O(e.price*i)}</span>`:""}
              </span>
            </a>
          </li>`}).join("")}
        </ul>
        ${L.showPrices?`<p class="combo-total">Worth <span class="combo-total-worth">${O(Bt(t))}</span> \xB7 You pay <strong>${O(t.price)}</strong></p>`:""}
      </div>
    </section>`}const ot=t=>`<ol class="howto">${t.map((e,i)=>`
  <li class="howto-step"><span class="howto-n">${String(i+1).padStart(2,"0")}</span><span class="howto-ico">${b(nt[Math.min(i,nt.length-1)])}</span><p>${s(e)}</p></li>`).join("")}</ol>`,nt=["droplet","sparkles","check"];function ee(t){const e=H(t),i=(a,n)=>et((a.details||[]).find(([p])=>p===n)?.[1]||""),o=S(e.map(a=>i(a,"Country of origin")).filter(a=>a!=="To be confirmed")),l=e.filter(a=>i(a,"Certification"));return[["Contents",I(t).map(({product:a,qty:n})=>`${n>1?`${n} \xD7 `:""}${a.fullName}`).join(" + ")],["Pieces",String(I(t).reduce((a,n)=>a+n.qty,0))],["Sizes",e.map(a=>a.size&&a.size!=="TBC"?a.size:"To be confirmed").join(" + ")],["Brands",S(e.map(a=>B(a,j))).join(", ")],["Country of origin",o.join(" / ")||"To be confirmed"],...l.length?[["Certification",`${i(l[0],"Certification")} (${l.map(xt).join(", ")})`]]:[],["Marketed by",S(e.map(a=>i(a,"Marketed by"))).join(" / ")],["Customer care",S(e.map(a=>i(a,"Customer care"))).join(" / ")]]}function ae(t){const e=v(t),i=(e?ee(t):t.details||[]).map(([r,d])=>`<tr><th scope="row">${s(r)}</th><td${/TODO\(client\)/.test(d)?' class="is-tbc"':""}>${s(et(d))}</td></tr>`).join(""),o=t.notes?`
    <div class="notes">
      ${[["top","Top"],["heart","Heart"],["base","Base"]].map(([r,d])=>`
        <div class="note"><h4>${d} notes</h4><p>${(t.notes[r]||[]).map(s).join(", ")}</p></div>`).join("")}
    </div>`:"",l=t.longevityHours?(()=>{const r=8+t.longevityHours;return`
      <div class="dayline" data-dayline>
        <p class="dayline-label">Lasts up to ${t.longevityHours} hours: spray at eight, still there at ${r>12?r-12:r}.</p>
        <div class="dayline-bar" role="img" aria-label="A day from 8:00 to ${r}:00, filled for ${t.longevityHours} hours"><span></span></div>
        <div class="dayline-ticks coords" aria-hidden="true"><span>8:00</span><span>13:00</span><span>${r}:00</span></div>
      </div>`})():"",a=t.keyIngredients?.length?`<p class="desc-sub t-label">Key ingredients</p><p>${t.keyIngredients.map(s).join(" \xB7 ")}</p>`:"",n=e?H(t).flatMap(r=>r.features||[]).filter((r,d,$)=>$.findIndex(N=>N.title===r.title)===d).slice(0,6):t.features||[],p=n.length?`<ul class="features">${n.map(r=>`
        <li class="feature"><span class="feature-ico">${b(r.icon)}</span><h4>${s(r.title)}</h4><p>${s(r.text)}</p></li>`).join("")}</ul>`:'<p class="tab-empty">Its features are revealed with its name.</p>',m=[["details","Product Details",i?`<table class="spec"><tbody>${i}</tbody></table>`:'<p class="tab-empty">Details arrive with the product.</p>'],["how","How to Use",e?H(t).filter(r=>r.howTo?.length).map(r=>`
          <div class="howto-group"><h3 class="howto-title">${s(r.name)}</h3>${ot(r.howTo)}</div>`).join(""):t.howTo?.length?ot(t.howTo):'<p class="tab-empty">How to use it arrives with the product.</p>'],["desc","Product Description",`
      <div class="desc">
        <div class="desc-text">
          <p>${s(t.description||t.whatItDoes||t.benefit)}</p>
          ${e?"":`${t.inside?`<p>${s(t.inside)}</p>`:""}
          ${a}
          ${o}${l}`}
        </div>
      </div>`],["features","Special Features",p]];return`
    <section class="section pdp-tabs" data-tabs aria-label="Product information">
      <div class="wrap">
        <div class="tablist" role="tablist" aria-label="Product information">
          ${m.map(([r,d],$)=>`<button type="button" role="tab" class="tab" id="tab-${r}" aria-controls="panel-${r}" aria-selected="${$===0}" tabindex="${$===0?0:-1}">${d}${$===0?'<span class="tab-bar" data-tab-bar></span>':""}</button>`).join("")}
        </div>
        ${m.map(([r,,d],$)=>`<div class="tabpanel" role="tabpanel" id="panel-${r}" aria-labelledby="tab-${r}" tabindex="0"${$?" hidden":""}>${d}</div>`).join("")}
      </div>
    </section>`}function ie(t){const e=tt(t);if(!e.length)return"";const i=w[x].name;return`
    <section class="section pdp-origin" aria-labelledby="origin-title">
      <div class="wrap pdp-origin-inner">
        <div class="pdp-origin-copy">
          <p class="t-label">Where it\u2019s from</p>
          <h2 id="origin-title" class="t-h2">${e.map(o=>s(w[o].name)).join(" and ")}.</h2>
          <ul class="combo-origins">
            ${e.map(o=>{const l=w[o];return`
            <li>
              <p class="combo-origin-pieces">${H(t).filter(n=>n.originId===o).map(n=>s(n.name)).join(", ")}</p>
              <p class="coords">${s(l.name)} \xB7 ${Y(l.lat,l.lon)}${l.altitude?` \xB7 ${s(l.altitude)}`:""} \u2192 ${s(i)}</p>
            </li>`}).join("")}
          </ul>
        </div>
        <div class="mini-map map-stage" data-mini-map role="img" aria-label="Map of the routes from ${e.map(o=>s(w[o].name)).join(" and ")} to ${s(i)}"></div>
      </div>
    </section>`}function se(t){if(v(t))return ie(t);const e=t.originId&&w[t.originId];if(!e)return"";const i=_t(t),o=i?`<a class="btn-line" href="origin.html?batch=${encodeURIComponent(i)}">${b("map-pin")}<span>Trace your origin</span></a>`:`<a class="btn-line" href="${W(t.brand)}#origin">${b("map-pin")}<span>See the origin</span></a>`;return`
    <section class="section pdp-origin" aria-labelledby="origin-title">
      <div class="wrap pdp-origin-inner">
        <div class="pdp-origin-copy">
          <p class="t-label">Where it\u2019s from</p>
          <h2 id="origin-title" class="t-h2">${s(e.name)}.</h2>
          <p class="coords">${Y(e.lat,e.lon)}${e.altitude?` \xB7 ${s(e.altitude)}`:""} \u2192 ${s(w[x].name)}</p>
          <p>${s(e.text||"")}</p>
          ${o}
        </div>
        <div class="mini-map map-stage" data-mini-map role="img" aria-label="Map of the route from ${s(e.name)} to ${s(w[x].name)}"></div>
      </div>
    </section>`}function oe(t){const i=[...v(t)?Pt.filter(o=>o.id!==t.id):Wt(t.id),...D.filter(o=>o.id!==t.id&&!v(o))].slice(0,8);return`
    <section class="section ritual" aria-labelledby="ritual-title">
      <div class="wrap">
        <h2 id="ritual-title" class="t-h2" data-split>Complete the ritual.</h2>
        <div class="card-grid ritual-cards" style="--n:${Math.min(4,i.length)}">
          ${i.map(o=>_(o,{headingLevel:3})).join("")}
        </div>
        ${J(i)}
      </div>
    </section>`}function ne(t){const e=c("[data-lcp-img]",T);T.innerHTML=`
    <article class="pdp wrap">
      <nav class="crumbs" aria-label="Breadcrumb">
        <ol>
          <li><a class="link-draw" href="shop.html">Shop</a></li>
          ${U?'<li><a class="link-draw" href="combos.html">Combos</a></li>':M?`<li><a class="link-draw" href="${W(M.id)}">${s(M.name)}</a></li>`:""}
          <li aria-current="page">${s(t.name)}</li>
        </ol>
      </nav>
      <div class="pdp-top">
        ${Vt(t)}
        ${Zt(t)}
      </div>
    </article>
    <div class="pdp-below" data-pdp-below></div>`;const i=c("[data-hero-img]",T);e&&i&&e.getAttribute("src")===i.getAttribute("src")&&([...i.attributes].forEach(a=>{e.hasAttribute(a.name)&&/^(srcset|sizes)$/.test(a.name)||e.setAttribute(a.name,a.value)}),e.removeAttribute("data-lcp-img"),i.replaceWith(e)),document.title=`${t.name} | Jiai Life`,c('meta[name="description"]')?.setAttribute("content",`${t.fullName}. ${t.benefit}. ${t.whatItDoes||""}`.trim()),c('meta[property="og:title"]')?.setAttribute("content",document.title);const o=document.createElement("script");o.type="application/ld+json",o.textContent=JSON.stringify({"@context":"https://schema.org","@type":"Product",name:t.fullName,sku:t.id,description:t.description||t.whatItDoes||t.benefit,image:it(t).slice(0,3).map(a=>new URL(a.src,location.href).href),brand:{"@type":"Brand",name:M?.name||"Jiai Life"},...t.size&&t.size!=="TBC"?{size:t.size}:{},offers:{"@type":"Offer",priceCurrency:L.currency,price:t.price,availability:t.comingSoon?"https://schema.org/PreOrder":"https://schema.org/InStock",url:location.href}}),document.head.appendChild(o);const l=c("[data-buybar]");if(l){c("[data-buybar-name]",l).textContent=t.name,c("[data-buybar-price]",l).textContent=t.comingSoon?"Arrives soon":L.showPrices?O(C().price):"Price at launch";const a=c("[data-buybar-add]",l);a.classList.add("btn-cart"),Q(t)?(a.dataset.addToBag=t.id,a.dataset.size=C().key,a.dataset.qtySource="#pdpQty",a.dataset.addFrom="[data-hero-img]"):(a.dataset.notify=t.id,c("span",a).textContent="Notify me"),l.hidden=!1,document.body.classList.add("has-buybar")}}function re(){document.title="Everything we make | Jiai Life",T.innerHTML=`
    <section class="section wrap pdp-missing" aria-labelledby="missing-title">
      <h1 id="missing-title" class="t-h2">That product isn\u2019t here. Here\u2019s everything we make.</h1>
      <div class="card-grid">${D.map(t=>_(t)).join("")}</div>
      ${J(D)}
    </section>`}let rt=Promise.resolve();if(y?ne(y):re(),y){let i=function(){const p=c("[data-gallery]"),m=c("[data-track]",p),r=q("[data-slide]",m),d=c("[data-thumbs]",p);e.active=0,e.spin=null,e.track=m;const $=()=>F()?"auto":"smooth",N=(u,{behavior:f=$()}={})=>{u=Math.max(0,Math.min(r.length-1,u)),m.scrollTo({left:u*m.clientWidth,behavior:f}),R(u)};function R(u){if(u===e.active&&m.dataset.ready)return;e.active=u,m.dataset.ready="1",r.forEach((g,h)=>{g.inert=h!==u}),q("[data-go]",p).forEach(g=>{const h=Number(g.dataset.go)===u;g.classList.toggle("is-active",h),h?g.setAttribute("aria-current","true"):g.removeAttribute("aria-current")});const f=c(`.pdp-thumb[data-go="${u}"]`,d);if(f)if(d.scrollHeight>d.clientHeight+1){const h=f.offsetTop-d.offsetTop;(h<d.scrollTop||h+f.offsetHeight>d.scrollTop+d.clientHeight)&&(d.scrollTop=h)}else{const h=f.offsetLeft-d.offsetLeft;(h<d.scrollLeft||h+f.offsetWidth>d.scrollLeft+d.clientWidth)&&(d.scrollLeft=h-8)}r[u]?.classList.contains("pdp-slide--360")&&lt()}function lt(){if(e.spin||!t.spin)return;const u=c(".pdp-slide--360",m),f=c("[data-360]",u),g=t.spinHD||t.spin,h=e.spin=yt(f,{path:g.path,frames:g.frames,mode:"drag"});h.showFirst().then(()=>u.classList.add("is-drawn")),h.load();let P=0;f.addEventListener("wheel",k=>{if(Math.abs(k.deltaX)<Math.abs(k.deltaY)&&!k.shiftKey)return;k.preventDefault(),P+=k.deltaX||k.deltaY;const E=Math.trunc(P/40);E&&(h.setFrame(h.frame+E),P-=E*40)},{passive:!1})}p.addEventListener("click",u=>{const f=u.target.closest("[data-go]");if(f){N(Number(f.dataset.go));return}const g=u.target.closest("[data-rail]");g&&d.scrollBy({top:Number(g.dataset.rail)*88,behavior:$()});const h=u.target.closest("[data-open]");h&&kt({items:it(t),index:Number(h.dataset.open),from:c("img",h)})});let A=0;m.addEventListener("scroll",()=>{A||(A=requestAnimationFrame(()=>{A=0;const u=Math.round(m.scrollLeft/Math.max(1,m.clientWidth));u!==e.active&&R(u)}))},{passive:!0}),e.onResize=()=>m.scrollTo({left:e.active*m.clientWidth}),R(0),At(c("[data-hero-img]"))},n=function(){const p=c(".pdp-delivery");o=p&&jt(p,{orderValue:()=>pt()+(mt(t.id,Gt)?0:C().price*(parseInt(l?.value,10)||1))}),document.addEventListener("bag:change",()=>o?.refresh()),Rt(c("[data-tabs]")),Ot(t,c("#reviews")),document.addEventListener("reviews:change",()=>{const r=c("[data-rating-slot]");r&&(r.innerHTML=st(t))});const m=c("[data-mini-map]");if(m&&"IntersectionObserver"in window){const r=new IntersectionObserver(([d])=>{d.isIntersecting&&(r.disconnect(),Lt(m,Xt(t)).then($=>$.finalState({tilt:F()?0:42,rotZ:F()?0:-4})))},{rootMargin:"50% 0px"});r.observe(m)}};const t=y,e={active:0,spin:null,track:null,onResize:()=>{}};addEventListener("resize",()=>e.onResize()),i();let o=null;const l=c("#pdpQty"),a=()=>{l&&(l.value=Math.min(10,Math.max(1,parseInt(l.value,10)||1)))};T.addEventListener("click",p=>{const m=p.target.closest("[data-qty]");!m||!l||(l.value=Math.min(10,Math.max(1,(parseInt(l.value,10)||1)+Number(m.dataset.qty))),o?.refresh())}),l?.addEventListener("change",()=>{a(),o?.refresh()}),Nt(T,{title:t.fullName,text:`${t.fullName}: ${t.benefit}.`}),rt=G().then(()=>{c("[data-pdp-below]").innerHTML=`
      ${U?te(t):""}
      ${t.comingSoon?"":It()}
      ${ae(t)}
      ${se(t)}
      ${Ht(t)}
      ${oe(t)}`,n()})}vt().then(()=>rt).then(G).then(()=>gt((t,e)=>{const i=[];if(!y)return()=>{};if(!t.reduce){q("[data-split]",T).forEach(n=>$t(n,{ctx:e}));const a=c("[data-dayline]");if(a){const n=()=>gsap.fromTo(c(".dayline-bar span",a),{scaleX:0},{scaleX:1,duration:1.4,ease:"power2.inOut"}),p=new IntersectionObserver(([m])=>{m.isIntersecting&&(p.disconnect(),n())});p.observe(a),i.push(()=>p.disconnect())}}const o=c("[data-buybar]"),l=c("[data-buy]");if(o&&l){const a=window.ScrollTrigger?ScrollTrigger.create({trigger:l,start:"bottom top",end:"max",onToggle:n=>o.classList.toggle("is-shown",!t.isDesktop||n.isActive)}):null;o.classList.toggle("is-shown",!t.isDesktop||!!a?.isActive),i.push(()=>a?.kill())}return()=>i.forEach(a=>a())}));
