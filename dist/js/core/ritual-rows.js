import{RITUALS as f}from"../data/rituals.js";import{getProduct as h,productURL as $}from"../data/products.js";import{esc as o,icon as p,imageSize as b,$ as d,$$ as c,srcsetAttr as y,SIZES as S}from"./format.js";import{splitLines as x,loadPlugin as T}from"./motion.js";function M({headingLevel:e=3}={}){const i=`h${e}`;return f.map((t,n)=>{const r=n%2===0?"left":"right",s=t.productId?h(t.productId):null,[a,u]=b(t.image),w=t.cta?t.cta.href==="#newsletter"?`<button type="button" class="row-link btn-plain" data-notify="${o(t.productId||"ritual-"+t.n)}">${o(t.cta.label)} ${p("arrow-right")}</button>`:`<a class="row-link" href="${o(t.cta.href)}">${o(t.cta.label)} ${p("arrow-right")}</a>`:s?`<a class="row-link" href="${$(s.id)}" aria-label="Explore now: ${o(s.fullName)}">Explore now ${p("arrow-right")}</a>`:"";return`
      <article class="rrow rrow--${r}" data-rrow style="--ar:${a} / ${u}">
        <div class="rrow-media">
          <img class="rrow-img" src="${o(t.image)}"${y(t.image,S.wide)} alt="" width="${a}" height="${u}" loading="lazy" decoding="async" data-rrow-img>
        </div>
        <div class="wrap rrow-inner">
          <div class="rrow-text">
            <p class="rrow-n t-label"><span>${o(t.n)}</span></p>
            <${i} class="t-h2 rrow-title" data-rrow-lines>${o(t.title)}</${i}>
            <p class="rrow-copy" data-rrow-lines>${o(t.text)}</p>
            <ul class="rrow-features">
              ${t.features.map(l=>`
                <li><span class="rrow-ico">${p(l.icon,"icon--draw")}</span><span class="rrow-flabel">${o(l.label)}</span></li>`).join("")}
            </ul>
            ${w}
          </div>
        </div>
      </article>`}).join("")}let g;function v(){return g||=fetch("assets/icons/icons.svg").then(e=>e.text()).then(e=>new DOMParser().parseFromString(e,"image/svg+xml")).catch(()=>null),g}async function E(e){const i=await v();return i?c("svg.icon--draw",e).map(t=>{const n=t.querySelector("use")?.getAttribute("href")?.split("#")[1],r=n&&i.getElementById(n);return r&&(t.setAttribute("viewBox",r.getAttribute("viewBox")||"0 0 24 24"),t.innerHTML=r.innerHTML),t}):[]}function k(e,{ctx:i,reduce:t}){const n=c("[data-rrow]",e);!n.length||t||!window.ScrollTrigger||(n.forEach(r=>{const s=d("[data-rrow-img]",r);gsap.fromTo(s,{yPercent:-3},{yPercent:3,ease:"none",scrollTrigger:{trigger:r,start:"top bottom",end:"bottom top",scrub:!0}}),c("[data-rrow-lines]",r).forEach(a=>x(a,{ctx:i,duration:.9,start:"top 85%"})),gsap.from(c(".rrow-n, .rrow-features li, .row-link",r),{opacity:0,y:12,duration:.8,stagger:.08,ease:"power3.out",scrollTrigger:{trigger:d(".rrow-text",r),start:"top 80%",once:!0}})}),Promise.all([E(e),T("DrawSVGPlugin").catch(()=>null)]).then(([r])=>{if(!window.DrawSVGPlugin||!r.length)return;(a=>i?i.add(a):a())(()=>n.forEach(a=>{const u=c(".rrow-features svg",a).map(l=>c("path, circle, line, rect, polyline, ellipse",l));if(!u.length)return;const w=gsap.timeline({scrollTrigger:{trigger:d(".rrow-features",a),start:"top 88%",once:!0}});u.forEach((l,m)=>w.from(l,{drawSVG:"0%",duration:1,ease:"power2.inOut"},m*.1))}))}))}export{M as ritualRowsHTML,k as ritualRowsMotion};
