import{esc as a,imageSize as n,srcsetAttr as c,SIZES as h}from"./format.js";function m(t,{eager:i=!1,fallback:r=""}={}){return`
    <div class="room-set">
      <div class="room-products" data-room-products>${t.map(s=>{const o=s.images.cutout||s.images.hero,[d,e]=n(o);return`<span class="room-prod" style="--k:${s.cardScale||1}"><img src="${a(o)}"${c(o,h.plinth)} alt="${a(s.fullName)}" width="${d}" height="${e}" ${i?'fetchpriority="high"':'loading="lazy"'} decoding="async"><span class="room-shadow" aria-hidden="true"></span></span>`}).join("")||(r?`<p class="room-outline" aria-hidden="true">${a(r)}</p>`:"")}</div>
      <div class="room-plinth" aria-hidden="true"><span class="room-plinth-shadow" data-plinth-shadow></span></div>
    </div>`}export{m as plinthSetHTML};
