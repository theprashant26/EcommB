import{getBrand as N}from"../data/brands.js";import{CONFIG as f}from"../data/config.js";import{productURL as L,isCombo as M,comboWorth as H,comboSaving as T,comboPieces as A,brandNameOf as C}from"../data/products.js";import{esc as s,priceHTML as g,ratingHTML as P,imageSize as p,imageFocus as E,formatPrice as m,srcsetAttr as u,SIZES as v}from"./format.js";import{wishButtonHTML as R}from"./wishlist.js";function z(a,{long:n=!1}={}){if(!f.showPrices)return g(a);const t=H(a),o=T(a),c=t?Math.round(o/t*100):0;return`<span class="price">${m(a.price)}</span>`+(o?`<s class="price-mrp"><span class="visually-hidden">Worth </span>${m(t)}</s><span class="price-save">Save ${m(o)}${n?` (${c}% off)`:""}</span>`:"")}const F="Sample ratings shown for preview",S=a=>!!(f.demoReviews&&a.rating&&!a.comingSoon),O=a=>a.some(S)?`<p class="sample-ratings-note" data-sample-note>${F}</p>`:"";function G(a,n){if(!a)return;const t=a.nextElementSibling,o=t?.hasAttribute("data-sample-note"),c=n.some(S);c&&!o&&a.insertAdjacentHTML("afterend",O(n)),!c&&o&&t.remove()}function U(a,{headingLevel:n=3,eager:t=!1,remove:o=!1}={}){const c=`h${n}`,r=M(a),i=a.images.card||a.images.hero,e=a.images.cardHover,[$,h]=p(i),l=E(i),w=`--card-scale:${a.cardScale||1};--cx:${l.cx};--ptop:${l.top};--pbase:${l.base};--ratio:${($/h).toFixed(4)}`,d=L(a.id),y=a.comingSoon?a.fullName:a.name,x=a.comingSoon?`<button type="button" class="btn-maison btn-cart cp-add" data-notify="${s(a.id)}"><span>Notify me</span></button>`:`<button type="button" class="btn-maison btn-cart cp-add" data-add-to-bag="${s(a.id)}" aria-label="Add ${s(a.fullName)} to cart"><span>Add to Cart</span></button>`,b=r?`Combo \xB7 ${A(a)} pieces`:"";return`
    <article class="cp${r?" cp--combo":""}" data-product-card data-id="${s(a.id)}" style="${w}">
      <div class="cp-stage" data-reveal>
        <a class="cp-media" href="${d}" tabindex="-1" aria-hidden="true" data-reveal-inner>
          <span class="cp-shadow"></span>
          <span class="cp-prod">
            <img class="cp-img" src="${s(i)}"${u(i,v.card)} alt="" width="${$}" height="${h}" ${t?t==="high"?'fetchpriority="high"':"":'loading="lazy"'} decoding="async">
            ${e?`<img class="cp-img cp-img--alt" src="${s(e)}"${u(e,v.card)} alt="" width="${p(e)[0]}" height="${p(e)[1]}" loading="lazy" decoding="async">`:""}
          </span>
          <span class="cp-sheen"></span>
        </a>
        ${R(a,"cp-heart")}
        ${b?`<span class="cp-badge">${s(b)}</span>`:""}
      </div>
      <div class="cp-body">
        <p class="t-label cp-brand">${s(C(a,N))}</p>
        <${c} class="cp-name"><a href="${d}">${s(y)}</a></${c}>
        ${a.comingSoon?'<p class="cp-soon">Coming soon</p>':P(a)}
        ${a.comingSoon?"":`<p class="cp-price">${r?z(a):g(a)}</p>`}
        <div class="cp-actions">
          <a class="cp-shop link-cta" href="${d}" aria-label="Shop Now: ${s(a.fullName)}">Shop Now</a>
          ${o?`<button type="button" class="btn-plain cp-remove link-draw" data-wish-remove="${s(a.id)}">Remove<span class="visually-hidden"> ${s(a.fullName)}</span></button>`:""}
          <div class="cp-add-wrap">${x}</div>
        </div>
      </div>
    </article>`}function Z(){return{destroy(){}}}export{F as SAMPLE_NOTE,U as cardHTML,z as comboPriceHTML,Z as initCards,O as sampleNoteHTML,S as showsSampleRating,G as syncSampleNote};
