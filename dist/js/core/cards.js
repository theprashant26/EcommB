import{getBrand as S}from"../data/brands.js";import{CONFIG as N}from"../data/config.js";import{productURL as x,isCombo as C,comboWorth as H,comboSaving as L,comboPieces as M,brandNameOf as T}from"../data/products.js";import{esc as s,priceHTML as g,ratingHTML as P,imageSize as p,imageFocus as z,formatPrice as m,srcsetAttr as f,SIZES as u}from"./format.js";import{wishButtonHTML as A}from"./wishlist.js";function F(a,{long:e=!1}={}){if(!N.showPrices)return g(a);const c=H(a),o=L(a),n=c?Math.round(o/c*100):0;return`<span class="price">${m(a.price)}</span>`+(o?`<s class="price-mrp"><span class="visually-hidden">Worth </span>${m(c)}</s><span class="price-save">Save ${m(o)}${e?` (${n}% off)`:""}</span>`:"")}function W(a,{headingLevel:e=3,eager:c=!1,remove:o=!1}={}){const n=`h${e}`,r=C(a),i=a.images.card||a.images.hero,t=a.images.cardHover,[$,b]=p(i),d=z(i),v=`--card-scale:${a.cardScale||1};--cx:${d.cx};--ptop:${d.top};--pbase:${d.base};--ratio:${($/b).toFixed(4)}`,l=x(a.id),y=a.comingSoon?a.fullName:a.name,w=a.comingSoon?`<button type="button" class="btn-maison btn-cart cp-add" data-notify="${s(a.id)}"><span>Notify me</span></button>`:`<button type="button" class="btn-maison btn-cart cp-add" data-add-to-bag="${s(a.id)}" aria-label="Add ${s(a.fullName)} to cart"><span>Add to Cart</span></button>`,h=r?`Combo \xB7 ${M(a)} pieces`:"";return`
    <article class="cp${r?" cp--combo":""}" data-product-card data-id="${s(a.id)}" style="${v}">
      <div class="cp-stage" data-reveal>
        <a class="cp-media" href="${l}" tabindex="-1" aria-hidden="true" data-reveal-inner>
          <span class="cp-shadow"></span>
          <span class="cp-prod">
            <img class="cp-img" src="${s(i)}"${f(i,u.card)} alt="" width="${$}" height="${b}" ${c?c==="high"?'fetchpriority="high"':"":'loading="lazy"'} decoding="async">
            ${t?`<img class="cp-img cp-img--alt" src="${s(t)}"${f(t,u.card)} alt="" width="${p(t)[0]}" height="${p(t)[1]}" loading="lazy" decoding="async">`:""}
          </span>
          <span class="cp-sheen"></span>
        </a>
        ${A(a,"cp-heart")}
        ${h?`<span class="cp-badge">${s(h)}</span>`:""}
      </div>
      <div class="cp-body">
        <p class="t-label cp-brand">${s(T(a,S))}</p>
        <${n} class="cp-name"><a href="${l}">${s(y)}</a></${n}>
        ${a.comingSoon?'<p class="cp-soon">Coming soon</p>':P(a)}
        ${a.comingSoon?"":`<p class="cp-price">${r?F(a):g(a)}</p>`}
        <div class="cp-actions">
          <a class="cp-shop link-cta" href="${l}" aria-label="Shop Now: ${s(a.fullName)}">Shop Now</a>
          ${o?`<button type="button" class="btn-plain cp-remove link-draw" data-wish-remove="${s(a.id)}">Remove<span class="visually-hidden"> ${s(a.fullName)}</span></button>`:""}
          <div class="cp-add-wrap">${w}</div>
        </div>
      </div>
    </article>`}function E(){return{destroy(){}}}export{W as cardHTML,F as comboPriceHTML,E as initCards};
