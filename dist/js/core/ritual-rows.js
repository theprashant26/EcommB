import{RITUALS as h}from"../data/rituals.js";import{getProduct as b,productURL as y}from"../data/products.js";import{esc as a,icon as w,imageSize as S,$ as g,$$ as c,srcsetAttr as x,SIZES as T}from"./format.js";import{splitLines as v,loadPlugin as E}from"./motion.js";function B({headingLevel:r=3}={}){const e=`h${r}`;return h.map((t,n)=>{const s=n%2===0?"left":"right",p=t.productId?b(t.productId):null,[o,l]=S(t.image),i=t.cta?t.cta.href==="#newsletter"?`<button type="button" class="row-link btn-plain" data-notify="${a(t.productId||"ritual-"+t.n)}">${a(t.cta.label)} ${w("arrow-right")}</button>`:`<a class="row-link" href="${a(t.cta.href)}">${a(t.cta.label)} ${w("arrow-right")}</a>`:p?`<a class="row-link" href="${y(p.id)}" aria-label="Explore now: ${a(p.fullName)}">Explore now ${w("arrow-right")}</a>`:"";return`
      <article class="rrow rrow--${s}${t.portrait?" rrow--portrait":""}" data-rrow style="${t.portrait?`--ar:1536 / 560; --iar:${o} / ${l}`:`--ar:${o} / ${l}`}">
        <div class="rrow-media">
          <img class="rrow-img" src="${a(t.image)}"${x(t.image,T.wide)} alt="" width="${o}" height="${l}" loading="lazy" decoding="async" data-rrow-img>
        </div>
        <div class="wrap rrow-inner">
          <div class="rrow-text">
            <p class="rrow-n t-label"><span>${a(t.n)}</span></p>
            <${e} class="t-h2 rrow-title" data-rrow-lines>${a(t.title)}</${e}>
            <p class="rrow-copy" data-rrow-lines>${a(t.text)}</p>
            <ul class="rrow-features">
              ${t.features.map(u=>`
                <li><span class="rrow-ico">${w(u.icon,"icon--draw")}</span><span class="rrow-flabel">${a(u.label)}</span></li>`).join("")}
            </ul>
            ${i}
          </div>
        </div>
      </article>`}).join("")}let m;function P(){return m||=fetch("assets/icons/icons.svg").then(r=>r.text()).then(r=>new DOMParser().parseFromString(r,"image/svg+xml")).catch(()=>null),m}async function I(r){const e=await P();return e?c("svg.icon--draw",r).map(t=>{const n=t.querySelector("use")?.getAttribute("href")?.split("#")[1],s=n&&e.getElementById(n);return s&&(t.setAttribute("viewBox",s.getAttribute("viewBox")||"0 0 24 24"),t.innerHTML=s.innerHTML),t}):[]}function D(r,e){L(r,e).forEach(t=>t())}function L(r,{ctx:e,reduce:t}){const n=c("[data-rrow]",r);if(!n.length||t||!window.ScrollTrigger)return[];const s=o=>()=>{const l=g("[data-rrow-img]",o);gsap.fromTo(l,{yPercent:-3},{yPercent:3,ease:"none",scrollTrigger:{trigger:o,start:"top bottom",end:"bottom top",scrub:!0}}),c("[data-rrow-lines]",o).forEach(i=>v(i,{ctx:e,duration:.9,start:"top 85%"})),gsap.from(c(".rrow-n, .rrow-features li, .row-link",o),{opacity:0,y:12,duration:.8,stagger:.08,ease:"power3.out",scrollTrigger:{trigger:g(".rrow-text",o),start:"top 80%",once:!0}})},p=()=>Promise.all([I(r),E("DrawSVGPlugin").catch(()=>null)]).then(([o])=>{if(!window.DrawSVGPlugin||!o.length)return;(i=>e?e.add(i):i())(()=>n.forEach(i=>{const u=c(".rrow-features svg",i).map(d=>c("path, circle, line, rect, polyline, ellipse",d));if(!u.length)return;const f=gsap.timeline({scrollTrigger:{trigger:g(".rrow-features",i),start:"top 88%",once:!0}});u.forEach((d,$)=>f.from(d,{drawSVG:"0%",duration:1,ease:"power2.inOut"},$*.1))}))});return[...n.map(s),p]}export{B as ritualRowsHTML,D as ritualRowsMotion,L as ritualRowsSteps};
