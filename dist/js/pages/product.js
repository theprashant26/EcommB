import{initHeader as lt}from"../core/header.js";import{initBag as ct,bagSubtotal as dt,bagHas as pt}from"../core/bag.js";import{initWishlist as mt,wishButtonHTML as ut}from"../core/wishlist.js";import{initReveals as ht}from"../core/reveal.js";import{initSearch as bt}from"../core/search.js";import{initMotion as ft,splitLines as gt,whenScriptsReady as $t,afterPaint as Q}from"../core/motion.js";import{createSpin as vt,frameURL as yt}from"../core/spin.js";import{createMap3d as wt}from"../core/map3d.js";import{cardHTML as G,comboPriceHTML as Lt}from"../core/cards.js";import{openLightbox as Tt}from"../core/lightbox.js";import{reviewsSectionHTML as Mt,initReviews as St,ratingFor as kt}from"../core/reviews.js";import{deliveryHTML as Ht,initDelivery as zt}from"../core/delivery.js";import{shareButtonHTML as It,initShare as Ot}from"../core/share.js";import{initTabs as jt}from"../core/tabs.js";import{nameForTransition as Nt}from"../core/transitions.js";import{CONFIG as L}from"../data/config.js";import{PRODUCTS as _,COMBOS as Ct,getProduct as Rt,productURL as At,sizesOf as J,isCombo as v,comboItems as O,comboWorth as Pt,combosWith as Dt,brandNameOf as E}from"../data/products.js";import{getBrand as j,brandURL as B}from"../data/brands.js";import{ORIGINS as w,BATCHES as Et,ARRIVAL_ORIGIN_ID as W}from"../data/origins.js";import{esc as s,formatPrice as H,formatCoords as X,imageSize as z,icon as b,priceHTML as Bt,reducedMotion as x,srcsetAttr as Wt,thumbOf as Y,SIZES as K,$ as c,$$ as F,cssReady as xt}from"../core/format.js";await xt(),lt(),ct(),bt(),mt(),ht();const T=c("[data-pdp]"),V=new URLSearchParams(location.search).get("id"),y=V&&Rt(V),M=y&&j(y.brand),Ft="full",N=()=>J(y)[0],q=v(y),k=t=>O(t).map(e=>e.product),I=t=>[...new Set(t.filter(Boolean))],U=t=>!t.comingSoon&&L.showPrices,qt=t=>Object.entries(Et).find(([,e])=>e.productId===t.id)?.[0],Ut={"leh-ladakh":{routes:["leh"],pins:["leh","delhi"]},paris:{routes:["paris"],pins:["paris","delhi"]}},Z=t=>I(q?k(t).map(e=>e.originId):[t.originId]).filter(e=>w[e]),Qt=t=>{const e=Z(t).map(o=>Ut[o]).filter(Boolean);return{routes:I(e.flatMap(o=>o.routes)),pins:I(e.flatMap(o=>o.pins))}},tt=(t="")=>{if(!/TODO\(client\)/.test(t))return t;const e=t.replace(/\s*(—|:)?\s*TODO\(client\).*$/,"").trim();return e?`${e} (details to be confirmed)`:"To be confirmed"},Gt=t=>t.gallery?.length?t.gallery.filter(e=>e.src):[{src:t.images.hero,alt:t.fullName}],et=t=>{if(!v(t))return t.gallery?.length?t.gallery:[{src:t.images.hero,alt:t.fullName}];const e=k(t).map(Gt);return[{src:t.images.hero,alt:`${t.fullName}, together`},...e.map(o=>o[0]),...e.flatMap(o=>o.slice(1))]},at=t=>et(t).filter(e=>e.src);function _t(t){const[e,o]=z(t),n=Math.min(.82,1.075*(e/o));return K.pdp.split(", ").map(i=>i.replace(/(\d+)(vw|px)$/,(a,l,m)=>`${Math.round(l*n)}${m}`)).join(", ")}function Jt(t){const e=et(t),o=(a,l)=>a.type==="360"?`<button type="button" class="pdp-thumb pdp-thumb--360" data-go="${l}" aria-label="Turn it through 360 degrees">${b("rotate-3d")}<span>360\xB0</span></button>`:`<button type="button" class="pdp-thumb" data-go="${l}" aria-label="Show image ${l+1}: ${s(a.alt)}"><img src="${s(Y(a.src))}" alt="" width="${z(a.src)[0]}" height="${z(a.src)[1]}" loading="lazy" fetchpriority="low" decoding="async"${a.fit==="cover"?` style="object-fit:cover;object-position:${s(a.focus||"50% 50%")}"`:""}></button>`;let n=-1;const i=(a,l)=>{if(a.type==="360")return`
        <div class="pdp-slide pdp-slide--360" data-slide="${l}" role="group" aria-roledescription="slide" aria-label="360\xB0 view">
          <img class="pdp-360-poster" src="${s(yt(t.spin.path,0))}" alt="" width="720" height="1080" loading="lazy" decoding="async" data-360-poster>
          <canvas class="pdp-360" tabindex="0" role="img" aria-label="${s(t.fullName)} turning 360 degrees. Drag, or use the arrow keys." data-360></canvas>
          <p class="pdp-360-hint">${b("rotate-3d")} Drag to turn</p>
        </div>`;n+=1;const[m,p]=z(a.src),r=a.fit==="cover";return`
      <div class="pdp-slide" data-slide="${l}" role="group" aria-roledescription="slide" aria-label="${l+1} of ${e.length}">
        <button type="button" class="pdp-open${r?" is-cover":""}" data-open="${n}" aria-label="Open full screen: ${s(a.alt)}">
          <img src="${s(a.src)}"${Wt(a.src,r?K.pdp:_t(a.src))} alt="${s(a.alt)}" width="${m}" height="${p}" ${l===0?'fetchpriority="high"':'loading="lazy"'} decoding="async"${r?` style="object-position:${s(a.focus||"50% 50%")}"`:""}${l===0?" data-hero-img":""}>
        </button>
      </div>`};return`
    <div class="pdp-gallery" data-gallery>
      <div class="pdp-rail${e.length>5?" has-arrows":""}">
        <button type="button" class="pdp-rail-arrow" data-rail="-1" aria-label="Earlier images" ${e.length>5?"":"hidden"}>${b("chevron-up")}</button>
        <ol class="pdp-thumbs" data-thumbs>${e.map((a,l)=>`<li>${o(a,l)}</li>`).join("")}</ol>
        <button type="button" class="pdp-rail-arrow" data-rail="1" aria-label="Later images" ${e.length>5?"":"hidden"}>${b("chevron-down")}</button>
      </div>
      <div class="pdp-main">
        <div class="pdp-stage" aria-roledescription="carousel" aria-label="${s(t.fullName)} images">
          <div class="pdp-track" data-track>${e.map(i).join("")}</div>
        </div>
        <div class="pdp-dots" data-dots>${e.map((a,l)=>`<button type="button" class="pdp-dot" data-go="${l}" aria-label="Show ${a.type==="360"?"the 360\xB0 view":`image ${l+1}`}"></button>`).join("")}</div>
      </div>
    </div>`}function it(t){const e=kt(t);return e?`<a class="pdp-rating" href="#reviews" aria-label="Rated ${e.average.toFixed(1)} out of 5 from ${e.count} ratings. Go to Ratings and Reviews"><span>${e.average.toFixed(1)}</span>${b("star","icon--filled")}<span class="pdp-rating-sep" aria-hidden="true">|</span><span>${e.count} ${e.count===1?"rating":"ratings"}</span></a>`:'<span class="pdp-norating">No ratings yet</span>'}function Xt(t){const e=N(),o=t.comingSoon?'<p class="pdp-price"><span class="price">Arrives soon</span></p>':`<p class="pdp-price" data-pdp-price>${v(t)?Lt(t,{long:!0}):Bt({price:e.price,mrp:e.mrp})}</p>${L.showPrices?'<p class="pdp-tax">Inclusive of all taxes</p>':""}`,n=v(t)?[]:J(t).filter(m=>m.label),i=L.delivery,a=U(t)?`
    <div class="pdp-choices">
      ${n.length?`
      <div class="pdp-choice">
        <p class="t-label" id="sizeLabel">Size</p>
        <div class="pdp-sizes" role="radiogroup" aria-labelledby="sizeLabel">
          ${n.map(m=>`<button type="button" role="radio" class="size-chip" aria-checked="${m.key===e.key}">${s(m.label)}</button>`).join("")}
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
    </div>`:"",l=U(t)?`<button type="button" class="btn-maison btn-cart pdp-add" data-add-to-bag="${s(t.id)}" data-size="${s(e.key)}" data-qty-source="#pdpQty" data-add-from="[data-hero-img]"><span>Add to Cart</span></button>`:`<button type="button" class="btn-maison pdp-add" data-notify="${s(t.id)}"><span>Notify me</span></button>`;return`
    <div class="pdp-buy" data-buy>
      <div class="pdp-brandrow">
        ${v(t)?`<a class="t-label pdp-brand" href="combos.html">${s(E(t,j))} \xB7 Combo</a>`:M?`<a class="t-label pdp-brand" href="${B(M.id)}">${s(M.name)}</a>`:"<span></span>"}
        <div class="pdp-brandrow-end">
          ${t.comingSoon?"":`<span data-rating-slot>${it(t)}</span>`}
          ${It()}
        </div>
      </div>
      <h1 class="t-h3 pdp-name">${s(t.fullName)}</h1>
      <div class="pdp-priceblock">${o}</div>
      <p class="pdp-benefit">${s(t.benefit)}${t.forWho?`. ${s(t.forWho)}`:""}.</p>
      ${a}
      <div class="pdp-actions">
        ${l}
        ${ut(t,"pdp-wish")}
      </div>
      <!-- TODO(client): confirm all three assurances -->
      <ul class="pdp-assure">
        ${t.comingSoon?"":`<li>${b("truck")}<span>Free delivery over ${H(i.freeOver)}</span></li>`}
        ${i.cod&&!t.comingSoon?`<li>${b("package-check")}<span>Cash on delivery available</span></li>`:""}
        <li>${b("shield-check")}<span>Authentic, traceable product</span></li>
      </ul>
    </div>`}function Yt(t){return`
    <section class="section pdp-combo" aria-labelledby="combo-title">
      <div class="wrap">
        <h2 id="combo-title" class="t-h3">What\u2019s in the combo</h2>
        <ul class="combo-items">
          ${O(t).map(({product:e,qty:o})=>{const n=e.images.card||e.images.hero,[i,a]=z(n),l=Y(n);return`
          <li class="combo-item">
            <a class="combo-link" href="${At(e.id)}">
              <span class="combo-thumb"><img src="${s(l)}" alt="" width="${i}" height="${a}" loading="lazy" decoding="async"></span>
              <span class="combo-info">
                <span class="t-label combo-brand">${s(E(e,j))}</span>
                <span class="combo-name">${o>1?`${o} \xD7 `:""}${s(e.name)}</span>
                ${e.size&&e.size!=="TBC"?`<span class="coords combo-size">${s(e.size)}</span>`:""}
                ${L.showPrices?`<span class="combo-worth">Worth ${H(e.price*o)}</span>`:""}
              </span>
            </a>
          </li>`}).join("")}
        </ul>
        ${L.showPrices?`<p class="combo-total">Worth <span class="combo-total-worth">${H(Pt(t))}</span> \xB7 You pay <strong>${H(t.price)}</strong></p>`:""}
      </div>
    </section>`}const st=t=>`<ol class="howto">${t.map((e,o)=>`
  <li class="howto-step"><span class="howto-n">${String(o+1).padStart(2,"0")}</span><span class="howto-ico">${b(ot[Math.min(o,ot.length-1)])}</span><p>${s(e)}</p></li>`).join("")}</ol>`,ot=["droplet","sparkles","check"];function Kt(t){const e=k(t),o=(i,a)=>tt((i.details||[]).find(([l])=>l===a)?.[1]||""),n=I(e.map(i=>o(i,"Country of origin")).filter(i=>i!=="To be confirmed"));return[["Contents",O(t).map(({product:i,qty:a})=>`${a>1?`${a} \xD7 `:""}${i.fullName}`).join(" + ")],["Pieces",String(O(t).reduce((i,a)=>i+a.qty,0))],["Sizes",e.map(i=>i.size&&i.size!=="TBC"?i.size:"To be confirmed").join(" + ")],["Brands",I(e.map(i=>E(i,j))).join(", ")],["Country of origin",n.join(" / ")||"To be confirmed"]]}function Vt(t){const e=v(t),o=(e?Kt(t):t.details||[]).map(([r,d])=>`<tr><th scope="row">${s(r)}</th><td${/TODO\(client\)/.test(d)?' class="is-tbc"':""}>${s(tt(d))}</td></tr>`).join(""),n=t.notes?`
    <div class="notes">
      ${[["top","Top"],["heart","Heart"],["base","Base"]].map(([r,d])=>`
        <div class="note"><h4>${d} notes</h4><p>${(t.notes[r]||[]).map(s).join(", ")}</p></div>`).join("")}
    </div>`:"",i=t.longevityHours?(()=>{const r=8+t.longevityHours;return`
      <div class="dayline" data-dayline>
        <p class="dayline-label">Lasts up to ${t.longevityHours} hours: spray at eight, still there at ${r>12?r-12:r}.</p>
        <div class="dayline-bar" role="img" aria-label="A day from 8:00 to ${r}:00, filled for ${t.longevityHours} hours"><span></span></div>
        <div class="dayline-ticks coords" aria-hidden="true"><span>8:00</span><span>13:00</span><span>${r}:00</span></div>
      </div>`})():"",a=t.keyIngredients?.length?`<p class="desc-sub t-label">Key ingredients</p><p>${t.keyIngredients.map(s).join(" \xB7 ")}</p>`:"",l=e?k(t).flatMap(r=>r.features||[]).filter((r,d,$)=>$.findIndex(C=>C.title===r.title)===d).slice(0,6):t.features||[],m=l.length?`<ul class="features">${l.map(r=>`
        <li class="feature"><span class="feature-ico">${b(r.icon)}</span><h4>${s(r.title)}</h4><p>${s(r.text)}</p></li>`).join("")}</ul>`:'<p class="tab-empty">Its features are revealed with its name.</p>',p=[["details","Product Details",o?`<table class="spec"><tbody>${o}</tbody></table>`:'<p class="tab-empty">Details arrive with the product.</p>'],["how","How to Use",e?k(t).filter(r=>r.howTo?.length).map(r=>`
          <div class="howto-group"><h3 class="howto-title">${s(r.name)}</h3>${st(r.howTo)}</div>`).join(""):t.howTo?.length?st(t.howTo):'<p class="tab-empty">How to use it arrives with the product.</p>'],["desc","Product Description",`
      <div class="desc">
        <div class="desc-text">
          <p>${s(t.description||t.whatItDoes||t.benefit)}</p>
          ${e?"":`${t.inside?`<p>${s(t.inside)}</p>`:""}
          ${a}
          ${n}${i}`}
        </div>
      </div>`],["features","Special Features",m]];return`
    <section class="section pdp-tabs" data-tabs aria-label="Product information">
      <div class="wrap">
        <div class="tablist" role="tablist" aria-label="Product information">
          ${p.map(([r,d],$)=>`<button type="button" role="tab" class="tab" id="tab-${r}" aria-controls="panel-${r}" aria-selected="${$===0}" tabindex="${$===0?0:-1}">${d}${$===0?'<span class="tab-bar" data-tab-bar></span>':""}</button>`).join("")}
        </div>
        ${p.map(([r,,d],$)=>`<div class="tabpanel" role="tabpanel" id="panel-${r}" aria-labelledby="tab-${r}" tabindex="0"${$?" hidden":""}>${d}</div>`).join("")}
      </div>
    </section>`}function Zt(t){const e=Z(t);if(!e.length)return"";const o=w[W].name;return`
    <section class="section pdp-origin" aria-labelledby="origin-title">
      <div class="wrap pdp-origin-inner">
        <div class="pdp-origin-copy">
          <p class="t-label">Where it\u2019s from</p>
          <h2 id="origin-title" class="t-h2">${e.map(n=>s(w[n].name)).join(" and ")}.</h2>
          <ul class="combo-origins">
            ${e.map(n=>{const i=w[n];return`
            <li>
              <p class="combo-origin-pieces">${k(t).filter(l=>l.originId===n).map(l=>s(l.name)).join(", ")}</p>
              <p class="coords">${s(i.name)} \xB7 ${X(i.lat,i.lon)}${i.altitude?` \xB7 ${s(i.altitude)}`:""} \u2192 ${s(o)}</p>
            </li>`}).join("")}
          </ul>
        </div>
        <div class="mini-map map-stage" data-mini-map role="img" aria-label="Map of the routes from ${e.map(n=>s(w[n].name)).join(" and ")} to ${s(o)}"></div>
      </div>
    </section>`}function te(t){if(v(t))return Zt(t);const e=t.originId&&w[t.originId];if(!e)return"";const o=qt(t),n=o?`<a class="btn-line" href="origin.html?batch=${encodeURIComponent(o)}">${b("map-pin")}<span>Trace your origin</span></a>`:`<a class="btn-line" href="${B(t.brand)}#origin">${b("map-pin")}<span>See the origin</span></a>`;return`
    <section class="section pdp-origin" aria-labelledby="origin-title">
      <div class="wrap pdp-origin-inner">
        <div class="pdp-origin-copy">
          <p class="t-label">Where it\u2019s from</p>
          <h2 id="origin-title" class="t-h2">${s(e.name)}.</h2>
          <p class="coords">${X(e.lat,e.lon)}${e.altitude?` \xB7 ${s(e.altitude)}`:""} \u2192 ${s(w[W].name)}</p>
          <p>${s(e.text||"")}</p>
          ${n}
        </div>
        <div class="mini-map map-stage" data-mini-map role="img" aria-label="Map of the route from ${s(e.name)} to ${s(w[W].name)}"></div>
      </div>
    </section>`}function ee(t){const o=[...v(t)?Ct.filter(n=>n.id!==t.id):Dt(t.id),..._.filter(n=>n.id!==t.id&&!v(n))].slice(0,8);return`
    <section class="section ritual" aria-labelledby="ritual-title">
      <div class="wrap">
        <h2 id="ritual-title" class="t-h2" data-split>Complete the ritual.</h2>
        <div class="card-grid ritual-cards" style="--n:${Math.min(4,o.length)}">
          ${o.map(n=>G(n,{headingLevel:3})).join("")}
        </div>
      </div>
    </section>`}function ae(t){const e=c("[data-lcp-img]",T);T.innerHTML=`
    <article class="pdp wrap">
      <nav class="crumbs" aria-label="Breadcrumb">
        <ol>
          <li><a class="link-draw" href="shop.html">Shop</a></li>
          ${q?'<li><a class="link-draw" href="combos.html">Combos</a></li>':M?`<li><a class="link-draw" href="${B(M.id)}">${s(M.name)}</a></li>`:""}
          <li aria-current="page">${s(t.name)}</li>
        </ol>
      </nav>
      <div class="pdp-top">
        ${Jt(t)}
        ${Xt(t)}
      </div>
    </article>
    <div class="pdp-below" data-pdp-below></div>`;const o=c("[data-hero-img]",T);e&&o&&e.getAttribute("src")===o.getAttribute("src")&&([...o.attributes].forEach(a=>{e.hasAttribute(a.name)&&/^(srcset|sizes)$/.test(a.name)||e.setAttribute(a.name,a.value)}),e.removeAttribute("data-lcp-img"),o.replaceWith(e)),document.title=`${t.name} | Jiai Life`,c('meta[name="description"]')?.setAttribute("content",`${t.fullName}. ${t.benefit}. ${t.whatItDoes||""}`.trim()),c('meta[property="og:title"]')?.setAttribute("content",document.title);const n=document.createElement("script");n.type="application/ld+json",n.textContent=JSON.stringify({"@context":"https://schema.org","@type":"Product",name:t.fullName,sku:t.id,description:t.description||t.whatItDoes||t.benefit,image:at(t).slice(0,3).map(a=>new URL(a.src,location.href).href),brand:{"@type":"Brand",name:M?.name||"Jiai Life"},...t.size&&t.size!=="TBC"?{size:t.size}:{},offers:{"@type":"Offer",priceCurrency:L.currency,price:t.price,availability:t.comingSoon?"https://schema.org/PreOrder":"https://schema.org/InStock",url:location.href}}),document.head.appendChild(n);const i=c("[data-buybar]");if(i){c("[data-buybar-name]",i).textContent=t.name,c("[data-buybar-price]",i).textContent=t.comingSoon?"Arrives soon":L.showPrices?H(N().price):"Price at launch";const a=c("[data-buybar-add]",i);a.classList.add("btn-cart"),U(t)?(a.dataset.addToBag=t.id,a.dataset.size=N().key,a.dataset.qtySource="#pdpQty",a.dataset.addFrom="[data-hero-img]"):(a.dataset.notify=t.id,c("span",a).textContent="Notify me"),i.hidden=!1,document.body.classList.add("has-buybar")}}function ie(){document.title="Everything we make | Jiai Life",T.innerHTML=`
    <section class="section wrap pdp-missing" aria-labelledby="missing-title">
      <h1 id="missing-title" class="t-h2">That product isn\u2019t here. Here\u2019s everything we make.</h1>
      <div class="card-grid">${_.map(t=>G(t)).join("")}</div>
    </section>`}let nt=Promise.resolve();if(y?ae(y):ie(),y){let o=function(){const m=c("[data-gallery]"),p=c("[data-track]",m),r=F("[data-slide]",p),d=c("[data-thumbs]",m);e.active=0,e.spin=null,e.track=p;const $=()=>x()?"auto":"smooth",C=(u,{behavior:f=$()}={})=>{u=Math.max(0,Math.min(r.length-1,u)),p.scrollTo({left:u*p.clientWidth,behavior:f}),R(u)};function R(u){if(u===e.active&&p.dataset.ready)return;e.active=u,p.dataset.ready="1",r.forEach((g,h)=>{g.inert=h!==u}),F("[data-go]",m).forEach(g=>{const h=Number(g.dataset.go)===u;g.classList.toggle("is-active",h),h?g.setAttribute("aria-current","true"):g.removeAttribute("aria-current")});const f=c(`.pdp-thumb[data-go="${u}"]`,d);if(f)if(d.scrollHeight>d.clientHeight+1){const h=f.offsetTop-d.offsetTop;(h<d.scrollTop||h+f.offsetHeight>d.scrollTop+d.clientHeight)&&(d.scrollTop=h)}else{const h=f.offsetLeft-d.offsetLeft;(h<d.scrollLeft||h+f.offsetWidth>d.scrollLeft+d.clientWidth)&&(d.scrollLeft=h-8)}r[u]?.classList.contains("pdp-slide--360")&&rt()}function rt(){if(e.spin||!t.spin)return;const u=c(".pdp-slide--360",p),f=c("[data-360]",u),g=t.spinHD||t.spin,h=e.spin=vt(f,{path:g.path,frames:g.frames,mode:"drag"});h.showFirst().then(()=>u.classList.add("is-drawn")),h.load();let P=0;f.addEventListener("wheel",S=>{if(Math.abs(S.deltaX)<Math.abs(S.deltaY)&&!S.shiftKey)return;S.preventDefault(),P+=S.deltaX||S.deltaY;const D=Math.trunc(P/40);D&&(h.setFrame(h.frame+D),P-=D*40)},{passive:!1})}m.addEventListener("click",u=>{const f=u.target.closest("[data-go]");if(f){C(Number(f.dataset.go));return}const g=u.target.closest("[data-rail]");g&&d.scrollBy({top:Number(g.dataset.rail)*88,behavior:$()});const h=u.target.closest("[data-open]");h&&Tt({items:at(t),index:Number(h.dataset.open),from:c("img",h)})});let A=0;p.addEventListener("scroll",()=>{A||(A=requestAnimationFrame(()=>{A=0;const u=Math.round(p.scrollLeft/Math.max(1,p.clientWidth));u!==e.active&&R(u)}))},{passive:!0}),e.onResize=()=>p.scrollTo({left:e.active*p.clientWidth}),R(0),Nt(c("[data-hero-img]"))},l=function(){const m=c(".pdp-delivery");n=m&&zt(m,{orderValue:()=>dt()+(pt(t.id,Ft)?0:N().price*(parseInt(i?.value,10)||1))}),document.addEventListener("bag:change",()=>n?.refresh()),jt(c("[data-tabs]")),St(t,c("#reviews")),document.addEventListener("reviews:change",()=>{const r=c("[data-rating-slot]");r&&(r.innerHTML=it(t))});const p=c("[data-mini-map]");if(p&&"IntersectionObserver"in window){const r=new IntersectionObserver(([d])=>{d.isIntersecting&&(r.disconnect(),wt(p,Qt(t)).then($=>$.finalState({tilt:x()?0:42,rotZ:x()?0:-4})))},{rootMargin:"50% 0px"});r.observe(p)}};const t=y,e={active:0,spin:null,track:null,onResize:()=>{}};addEventListener("resize",()=>e.onResize()),o();let n=null;const i=c("#pdpQty"),a=()=>{i&&(i.value=Math.min(10,Math.max(1,parseInt(i.value,10)||1)))};T.addEventListener("click",m=>{const p=m.target.closest("[data-qty]");!p||!i||(i.value=Math.min(10,Math.max(1,(parseInt(i.value,10)||1)+Number(p.dataset.qty))),n?.refresh())}),i?.addEventListener("change",()=>{a(),n?.refresh()}),Ot(T,{title:t.fullName,text:`${t.fullName}: ${t.benefit}.`}),nt=Q().then(()=>{c("[data-pdp-below]").innerHTML=`
      ${q?Yt(t):""}
      ${t.comingSoon?"":Ht()}
      ${Vt(t)}
      ${te(t)}
      ${Mt(t)}
      ${ee(t)}`,l()})}$t().then(()=>nt).then(Q).then(()=>ft((t,e)=>{const o=[];if(!y)return()=>{};if(!t.reduce){F("[data-split]",T).forEach(l=>gt(l,{ctx:e}));const a=c("[data-dayline]");if(a){const l=()=>gsap.fromTo(c(".dayline-bar span",a),{scaleX:0},{scaleX:1,duration:1.4,ease:"power2.inOut"}),m=new IntersectionObserver(([p])=>{p.isIntersecting&&(m.disconnect(),l())});m.observe(a),o.push(()=>m.disconnect())}}const n=c("[data-buybar]"),i=c("[data-buy]");if(n&&i){const a=window.ScrollTrigger?ScrollTrigger.create({trigger:i,start:"bottom top",end:"max",onToggle:l=>n.classList.toggle("is-shown",!t.isDesktop||l.isActive)}):null;n.classList.toggle("is-shown",!t.isDesktop||!!a?.isActive),o.push(()=>a?.kill())}return()=>o.forEach(a=>a())}));
