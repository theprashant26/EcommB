import{initHeader as A}from"../core/header.js";import{initBag as I}from"../core/bag.js";import{initWishlist as P}from"../core/wishlist.js";import{initReveals as j}from"../core/reveal.js";import{initSearch as B}from"../core/search.js";import{initMotion as T,splitLines as R,whenScriptsReady as L,yieldToMain as F,afterPaint as H}from"../core/motion.js";import{createMap3d as E}from"../core/map3d.js";import{ORIGINS as D,BATCHES as C,DEFAULT_BATCH as O}from"../data/origins.js";import{getProduct as x,productURL as N}from"../data/products.js";import{getBrand as U}from"../data/brands.js";import{esc as e,formatCoords as g,formatDate as c,$ as p,$$ as v,cssReady as q}from"../core/format.js";await q(),A(),I(),B(),P(),j();const h=p("[data-origin-page]"),z=new URLSearchParams(location.search),u=(z.get("batch")||O).trim().toUpperCase(),o=C[u];function W(t,s){const n=l=>l*Math.PI/180,i=n(s.lat-t.lat),r=n(s.lon-t.lon),d=Math.sin(i/2)**2+Math.cos(n(t.lat))*Math.cos(n(s.lat))*Math.sin(r/2)**2;return Math.round(2*6371*Math.asin(Math.sqrt(d))/10)*10}const Y=(t,s)=>Math.round((Date.parse(s)-Date.parse(t))/864e5),S=t=>c(t).replace(/^\d+\s/,""),G=["no","one","two","three","four","five","six","seven","eight","nine","ten"],J=t=>G[t]||String(t);function K(){const t=D[o.originId],s=D[o.destinationId],a=x(o.productId),n=a&&U(a.brand),i=W(t,s),r=Y(o.harvestDate,o.pressedDate),d=new Date().toISOString().slice(0,10),l=[["Grown",o.grownSeason,`On the high slopes around ${t.name.split(",")[0]}, at ${t.altitude||"altitude"}.`],["Harvested",c(o.harvestDate),`Picked by hand. ${o.field}.`],["Pressed",c(o.pressedDate),`Pressed ${J(r)} ${r===1?"day":"days"} after the harvest.`],["Formulated",c(o.formulatedDate),a?.inside||"Made into the formula."],["Filled",c(o.filledDate),`Filled into this tube: batch ${u}.`],["Arrived with you",c(d),`${i.toLocaleString("en-IN")} km from its field, as the crow flies.`]],m=`
    <section class="opass-sec" aria-labelledby="pass-title">
      <div class="wrap">
        <article class="pass" data-pass>
          <div class="pass-main">
            <h1 class="pass-route" id="pass-title">
              <span class="pass-end">
                <span class="pass-label">From</span>
                <span class="pass-code" data-type-code>${e(t.code)}</span>
                <span class="pass-city">${e(t.name)}</span>
              </span>
              <span class="pass-line" aria-hidden="true"><span class="pass-dot"></span><span class="pass-track"></span><span class="pass-ring"></span></span>
              <span class="pass-end pass-end--to">
                <span class="pass-label">to</span>
                <span class="pass-code" data-type-code>${e(s.code)}</span>
                <span class="pass-city">${e(s.name)}</span>
              </span>
            </h1>
            <dl class="pass-facts">
              <div><dt>Piece</dt><dd>${e(a?.fullName||"")}</dd></div>
              <div><dt>Harvested</dt><dd>${e(c(o.harvestDate))}</dd></div>
              <div><dt>Altitude</dt><dd>${e(t.altitude||"")}</dd></div>
              <div><dt>Origin</dt><dd class="coords">${g(t.lat,t.lon)}</dd></div>
            </dl>
          </div>
          <div class="pass-stub">
            <p class="pass-label">Batch</p>
            <p class="pass-batch">${e(u)}</p>
            <p class="pass-brand">${e(n?.name||"")}</p>
          </div>
        </article>
      </div>
    </section>
    <!--REST-->
    <section class="section oroute" aria-labelledby="route-title">
      <div class="wrap oroute-head">
        <h2 id="route-title" data-split>The route.</h2>
        <p>From ${e(t.name)} to ${e(s.name)}. <span class="coords">${i.toLocaleString("en-IN")} km, ${g(t.lat,t.lon)} to ${g(s.lat,s.lon)}</span></p>
      </div>
      <div class="oroute-stage map-stage" data-omap role="img" aria-label="Map of the route from ${e(t.name)} to ${e(s.name)}"></div>
    </section>

    <section class="section ojourney" aria-labelledby="journey-title">
      <div class="wrap">
        <h2 id="journey-title" data-split>The journey.</h2>
        <div class="journey" data-journey>
          <span class="journey-line" aria-hidden="true"><span data-journey-fill></span></span>
          <ol class="journey-stops">
          ${l.map(([f,y,w],M)=>`
            <li class="stop${M===l.length-1?" stop--arrived":""}">
              <span class="stop-n coords">${String(M+1).padStart(2,"0")}</span>
              <span class="stop-dot" aria-hidden="true"></span>
              <div class="stop-body">
                <h3 class="stop-name">${e(f)}</h3>
                <p class="stop-date coords">${e(y||"")}</p>
                <p class="stop-text">${e(w)}</p>
              </div>
            </li>`).join("")}
          </ol>
        </div>
      </div>
    </section>

    <section class="section ophotos" aria-labelledby="photos-title">
      <div class="wrap">
        <h2 id="photos-title" data-split>From the field.</h2>
        <!-- TODO(client): real photos from the farm \u2014 do not use stock photography.
             Put each photo's path in data-photo; origin.js swaps it in. -->
        <div class="photos">
          ${[["field","The field",`${o.field}, ${S(o.harvestDate)}.`],["harvest","The harvest",`${t.name.split(",")[0]} valley, ${S(o.harvestDate)}.`],["hands","The hands",`${o.harvestedBy}.`]].map(([f,y,w])=>`
            <figure class="photo" data-photo="">
              <div class="photo-frame" data-photo-frame="${f}">
                <div class="photo-ridges" aria-hidden="true" data-photo-ridges></div>
                <p class="photo-wait coords">Photograph to come</p>
              </div>
              <figcaption><span class="photo-title">${e(y)}.</span> ${e(w)}</figcaption>
            </figure>`).join("")}
        </div>
      </div>
    </section>

    <section class="section ofacts" aria-labelledby="facts-title">
      <div class="wrap ofacts-inner">
        <h2 id="facts-title" data-split>Batch facts.</h2>
        <div>
          <table class="facts-table">
            <tbody>
              <tr><th scope="row">Batch</th><td>${e(u)}</td></tr>
              <tr><th scope="row">Piece</th><td>${e(a?.fullName||"")}${a?.size?`, ${e(a.size)}`:""}</td></tr>
              <tr><th scope="row">Ingredient</th><td>${e(t.ingredient||a?.keyIngredient||"")}</td></tr>
              <tr><th scope="row">Field</th><td>${e(o.field)}</td></tr>
              <tr><th scope="row">Coordinates</th><td>${g(t.lat,t.lon)}</td></tr>
              <tr><th scope="row">Altitude</th><td>${e(t.altitude||"")}</td></tr>
              <tr><th scope="row">Harvest season</th><td>${e(t.season||"")}</td></tr>
              <tr><th scope="row">Harvested</th><td>${e(c(o.harvestDate))}</td></tr>
              <tr><th scope="row">Pressed</th><td>${e(c(o.pressedDate))}</td></tr>
              <tr><th scope="row">Filled</th><td>${e(c(o.filledDate))}</td></tr>
            </tbody>
          </table>
          <p class="ofacts-links">
            ${a?`<a class="btn-maison" href="${N(a.id)}"><span>Back to the ${e(a.name.toLowerCase())}</span></a>`:""}
            <a class="link-cta" href="${e(o.labReport||"#")}">Lab report</a>
          </p>
        </div>
      </div>
    </section>`,[b,$]=m.split("<!--REST-->");return h.innerHTML=b,document.title=`Batch ${u} | Jiai Life`,p('meta[property="og:title"]')?.setAttribute("content",document.title),()=>Q($)}function Q(t){h.insertAdjacentHTML("beforeend",t),v("[data-photo]").forEach(a=>{const n=a.dataset.photo;if(!n)return;const i=p(".photo-frame",a);i.innerHTML=`<img src="${e(n)}" alt="${e(p(".photo-title",a).textContent)}" loading="lazy" decoding="async">`,i.classList.add("has-photo")});const s=v("[data-photo-ridges]");if(s.length){const a=new IntersectionObserver(([n])=>{n.isIntersecting&&(a.disconnect(),fetch("assets/illustrations/ladakh-range.svg").then(i=>i.text()).then(i=>{s.forEach(r=>{r.innerHTML=i;const d=p("svg",r);d.removeAttribute("role"),d.removeAttribute("aria-label"),d.setAttribute("aria-hidden","true"),d.setAttribute("focusable","false")})}).catch(()=>{}))},{rootMargin:"100% 0px"});a.observe(s[0])}}function Z(){h.innerHTML=`
    <section class="section wrap onotfound" aria-labelledby="nf-title">
      <h1 id="nf-title" class="t-h2">We can\u2019t find batch ${e(u)} yet.</h1>
      <p>Check the code printed under the QR on the back of your tube, and type it here.</p>
      <form class="inline-form onotfound-form" action="origin.html" method="get">
        <label class="visually-hidden" for="batch-code">Batch code</label>
        <input class="field" id="batch-code" name="batch" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="OO-LDK-0000-00" required>
        <button type="submit" class="btn-maison"><span>Trace it</span></button>
      </form>
    </section>`,document.title="Trace your origin | Jiai Life"}if(o){const t=K();V(),(async()=>(await H(),t(),h.removeAttribute("data-pending"),await L(),await F(),T(X)))()}else Z(),h.removeAttribute("data-pending"),L().then(()=>T(()=>{}));function V(){if(!document.documentElement.classList.contains("motion-ok"))return;document.documentElement.classList.add("motion-live");const t=p("[data-pass]");t.classList.add("is-flipping"),v("[data-type-code]",t).forEach((s,a)=>_(s,.5+a*.35))}let k;function X(t,s){if(!s)return;t.reduce||(v("[data-split]",h).forEach(r=>R(r,{ctx:s})),gsap.fromTo("[data-journey-fill]",{scaleY:0},{scaleY:1,ease:"none",scrollTrigger:{trigger:"[data-journey]",start:"top 70%",end:"bottom 60%",scrub:!0}}),v(".stop").forEach(r=>{gsap.from(r.querySelector(".stop-dot"),{scale:0,duration:.5,ease:"power4.out",scrollTrigger:{trigger:r,start:"top 72%",once:!0}})}));const a=p("[data-omap]");let n=!0;const i=new IntersectionObserver(([r])=>{r.isIntersecting&&(i.disconnect(),k||=E(a,{routes:["leh"],pins:["leh","delhi"],focus:{x:80,y:53,zoom:t.isDesktop?1.9:2.3}}),k.then(d=>n&&s.add(()=>{if(t.reduce){d.finalState({tilt:0});return}const l=d.timeline({tilt:t.isDesktop?52:40,rotZ:-4,scaleFrom:1.08});ScrollTrigger.create({trigger:a,start:"top 80%",end:"center 45%",scrub:1,animation:l}),d.pulse(["leh"])})))},{rootMargin:"100% 0px"});return i.observe(a),()=>{n=!1,i.disconnect()}}function _(t,s){const a=t.textContent,n="ABCDEFGHIJKLMNOPQRSTUVWXYZ",i=700;let r=0;const d=l=>{r||=l;const m=Math.min(1,(l-r)/i),b=Math.floor(m*a.length);t.textContent=m<1?a.split("").map(($,f)=>f<b?$:n[Math.floor(Math.random()*n.length)]).join(""):a,m<1&&requestAnimationFrame(d)};setTimeout(()=>requestAnimationFrame(d),s*1e3)}
