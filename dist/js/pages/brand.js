import{initHeader as L}from"../core/header.js";import{initBag as T}from"../core/bag.js";import{initWishlist as I}from"../core/wishlist.js";import{initReveals as S}from"../core/reveal.js";import{initSearch as k}from"../core/search.js";import{initMotion as M,splitLines as R,appear as B,whenScriptsReady as H,afterPaint as A}from"../core/motion.js";import{createMap3d as C}from"../core/map3d.js";import{cardHTML as h}from"../core/cards.js";import{plinthSetHTML as O}from"../core/plinth.js";import{productsByBrand as u,combosForBrand as E}from"../data/products.js";import{getBrand as j,visibleBrands as U,brandURL as P}from"../data/brands.js";import{ORIGINS as d,BATCHES as F,ARRIVAL_ORIGIN_ID as f}from"../data/origins.js";import{esc as a,formatCoords as g,icon as J,$ as r,$$ as b,cssReady as _}from"../core/format.js";await _(),L(),T(),k(),I(),S();const l=r("[data-brand-page]"),c=j(new URLSearchParams(location.search).get("b")),y={"leh-ladakh":{routes:["leh"],pins:["leh","delhi"]},paris:{routes:["paris"],pins:["paris","delhi"]}},$=e=>{const t=e.originId&&d[e.originId];return e.coords||(t?g(t.lat,t.lon):"")},q=(e="")=>e.split(/(?<=\.)\s/)[0],p=(e,t)=>{document.title=`${e} | Jiai Life`,r('meta[property="og:title"]')?.setAttribute("content",document.title),t&&(r('meta[name="description"]')?.setAttribute("content",t),r('meta[property="og:description"]')?.setAttribute("content",t))};function v(e,{products:t,label:i,story:s,action:o}){const n=$(e);return`
    <section class="bhero" aria-labelledby="bhero-title">
      <div class="bhero-copy">
        ${i?`<p class="t-label bhero-label">${a(i)}</p>`:""}
        <h1 id="bhero-title" class="t-h1 bhero-name">${a(e.name)}</h1>
        ${e.line?`<p class="t-tagline bhero-line">${a(e.line)}.</p>`:""}
        ${n?`<p class="coords bhero-coords">${a(n)}</p>`:""}
        <p class="bhero-story">${a(s)}</p>
        ${o}
      </div>
      <div class="bhero-stage room-stage warm-light">
        ${O(t,{eager:!0,fallback:e.name})}
      </div>
    </section>`}function x(e){const t=u(e.id),i=e.originId&&d[e.originId],s=Object.entries(F).find(([,o])=>o.originId===e.originId)?.[0];l.innerHTML=v(e,{products:t,label:[e.category,i?.name].filter(Boolean).join(" \xB7 "),story:e.roomStory||q(e.story),action:`<a class="btn-maison" href="#pieces"><span>Shop now ${J("chevron-down")}</span></a>`})+`

    <section class="section bpieces" id="pieces" aria-labelledby="bpieces-title">
      <div class="wrap">
        <div class="sec-head">
          <h2 id="bpieces-title" data-split>The pieces.</h2>
          <p class="coords">${t.length} ${t.length===1?"piece":"pieces"}</p>
        </div>
        <div class="card-grid bpieces-grid">
          ${t.map(o=>h(o,{headingLevel:3})).join("")}
        </div>
      </div>
    </section>
    ${D(e)}

    ${i&&y[e.originId]?`
    <section class="bmap" id="origin" aria-labelledby="bmap-title">
      <div class="wrap bmap-head">
        <h2 id="bmap-title" data-split>Where it begins.</h2>
        <div class="bmap-copy">
          <p>${a(i.text||"")} <span class="coords">${a(i.name)}, ${g(i.lat,i.lon)} to ${a(d[f].name)}</span></p>
          ${s?`<a class="link-cta" href="origin.html?batch=${encodeURIComponent(s)}">Trace a tube</a>`:""}
        </div>
      </div>
      <div class="bmap-stage map-stage" data-bmap role="img" aria-label="Map of the route from ${a(i.name)} to ${a(d[f].name)}"></div>
    </section>`:""}`,p(e.name,e.story)}function D(e){const t=E(e.id);return t.length?`
    <section class="section bsets" aria-labelledby="bsets-title">
      <div class="wrap">
        <div class="sec-head">
          <h2 id="bsets-title" data-split>Complete the set.</h2>
          <p>${a(e.name)}, paired with the rest of the house and priced as a set. <a class="link-cta" href="combos.html">All combos</a></p>
        </div>
        <div class="card-grid bsets-grid">${t.map(i=>h(i,{headingLevel:3})).join("")}</div>
      </div>
    </section>`:""}function G(e){l.innerHTML=v(e,{products:u(e.id),label:e.status==="coming"?`${e.category||"Coming to the house"} \xB7 Arriving soon`:"Coming to the house",story:"Its name, and its notes, arrive soon. Leave your email and the first letter about it comes to you.",action:`
      <form class="inline-form bhero-form" data-newsletter novalidate>
        <label class="visually-hidden" for="coming-email">Email address</label>
        <input class="field" id="coming-email" type="email" name="email" autocomplete="email" placeholder="Email address" required>
        <button type="submit" class="btn-maison"><span>Be the first to know</span></button>
      </form>`}),l.querySelector(".bhero")?.classList.add("bhero--coming"),p(e.name,`${e.name}: arriving soon at Jiai Life.`)}function N(){l.innerHTML=`
    <section class="section wrap bunknown" aria-labelledby="bunknown-title">
      <h1 id="bunknown-title" class="t-h2">That house isn\u2019t here. These are.</h1>
      <ul class="bunknown-list">
        ${U().map(e=>`
          <li><a href="${P(e.id)}"><span class="bunknown-name">${a(e.name)}</span>
            <span class="coords">${a($(e)||e.line||e.category||"")}</span></a></li>`).join("")}
      </ul>
    </section>`,p("Our brands","The houses of Jiai Life.")}c?c.status==="live"?x(c):G(c):N();let w;H().then(A).then(()=>M((e,t)=>{const i=r(".bhero",l);if(i&&!e.reduce){const o=r(".bhero-name",i);if(window.SplitText){const n=SplitText.create(o,{type:"lines",mask:"lines"});gsap.from(n.lines,{yPercent:110,duration:1,stagger:.08,ease:"power4.out",delay:.1})}gsap.from(b(".bhero-copy > :not(.bhero-name)",i),{y:16,opacity:0,duration:.8,stagger:.08,ease:"power3.out",delay:.35})}e.reduce||(b("[data-split]",l).forEach(o=>R(o,{ctx:t})),B(".bmap-copy p"));const s=r("[data-bmap]");if(s&&c){const o=y[c.originId];w||=C(s,o),w.then(n=>t.add(()=>{if(e.reduce){n.finalState({tilt:0});return}const m=n.timeline({tilt:e.isDesktop?55:40,rotZ:-5,scaleFrom:1.06});m.pause(),ScrollTrigger.create({trigger:s,start:"top 75%",once:!0,onEnter:()=>m.duration(2.4).play()})}))}}));
