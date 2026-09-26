import{esc as a,imageSize as n,srcsetAttr as c,SIZES as h}from"./format.js";function m(i,{eager:r=!1,fallback:t=""}={}){return`
    <div class="room-set">
      <div class="room-products" data-room-products>${i.map(s=>{const o=s.images.tube||s.images.cutout||s.images.hero,[e,d]=n(o);return`<span class="room-prod" style="--k:${s.cardScale||1}"><img src="${a(o)}"${c(o,h.plinth)} alt="${a(s.fullName)}" width="${e}" height="${d}" ${r?'fetchpriority="high"':'loading="lazy"'} decoding="async"><span class="room-shadow" aria-hidden="true"></span></span>`}).join("")||(t?`<p class="room-outline" aria-hidden="true">${a(t)}</p>`:"")}</div>
      <div class="room-plinth" aria-hidden="true"><span class="room-plinth-shadow" data-plinth-shadow></span></div>
    </div>`}export{m as plinthSetHTML};
