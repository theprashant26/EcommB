import{RITUALS as $}from"../data/rituals.js";import{getProduct as b,productURL as y}from"../data/products.js";import{esc as a,icon as w,imageSize as S,$ as g,$$ as l,srcsetAttr as x,SIZES as T}from"./format.js";import{splitLines as v,loadPlugin as E}from"./motion.js";function B({headingLevel:r=3}={}){const e=`h${r}`;return $.map((t,n)=>{const s=n%2===0?"left":"right",c=t.productId?b(t.productId):null,[o,u]=S(t.image),i=t.cta?t.cta.href==="#newsletter"?`<button type="button" class="row-link btn-plain" data-notify="${a(t.productId||"ritual-"+t.n)}">${a(t.cta.label)} ${w("arrow-right")}</button>`:`<a class="row-link" href="${a(t.cta.href)}">${a(t.cta.label)} ${w("arrow-right")}</a>`:c?`<a class="row-link" href="${y(c.id)}" aria-label="Explore now: ${a(c.fullName)}">Explore now ${w("arrow-right")}</a>`:"";return`
      <article class="rrow rrow--${s}" data-rrow style="--ar:${o} / ${u}">
        <div class="rrow-media">
          <img class="rrow-img" src="${a(t.image)}"${x(t.image,T.wide)} alt="" width="${o}" height="${u}" loading="lazy" decoding="async" data-rrow-img>
        </div>
        <div class="wrap rrow-inner">
          <div class="rrow-text">
            <p class="rrow-n t-label"><span>${a(t.n)}</span></p>
            <${e} class="t-h2 rrow-title" data-rrow-lines>${a(t.title)}</${e}>
            <p class="rrow-copy" data-rrow-lines>${a(t.text)}</p>
            <ul class="rrow-features">
              ${t.features.map(p=>`
                <li><span class="rrow-ico">${w(p.icon,"icon--draw")}</span><span class="rrow-flabel">${a(p.label)}</span></li>`).join("")}
            </ul>
            ${i}
          </div>
        </div>
      </article>`}).join("")}let m;function P(){return m||=fetch("assets/icons/icons.svg").then(r=>r.text()).then(r=>new DOMParser().parseFromString(r,"image/svg+xml")).catch(()=>null),m}async function I(r){const e=await P();return e?l("svg.icon--draw",r).map(t=>{const n=t.querySelector("use")?.getAttribute("href")?.split("#")[1],s=n&&e.getElementById(n);return s&&(t.setAttribute("viewBox",s.getAttribute("viewBox")||"0 0 24 24"),t.innerHTML=s.innerHTML),t}):[]}function D(r,e){L(r,e).forEach(t=>t())}function L(r,{ctx:e,reduce:t}){const n=l("[data-rrow]",r);if(!n.length||t||!window.ScrollTrigger)return[];const s=o=>()=>{const u=g("[data-rrow-img]",o);gsap.fromTo(u,{yPercent:-3},{yPercent:3,ease:"none",scrollTrigger:{trigger:o,start:"top bottom",end:"bottom top",scrub:!0}}),l("[data-rrow-lines]",o).forEach(i=>v(i,{ctx:e,duration:.9,start:"top 85%"})),gsap.from(l(".rrow-n, .rrow-features li, .row-link",o),{opacity:0,y:12,duration:.8,stagger:.08,ease:"power3.out",scrollTrigger:{trigger:g(".rrow-text",o),start:"top 80%",once:!0}})},c=()=>Promise.all([I(r),E("DrawSVGPlugin").catch(()=>null)]).then(([o])=>{if(!window.DrawSVGPlugin||!o.length)return;(i=>e?e.add(i):i())(()=>n.forEach(i=>{const p=l(".rrow-features svg",i).map(d=>l("path, circle, line, rect, polyline, ellipse",d));if(!p.length)return;const f=gsap.timeline({scrollTrigger:{trigger:g(".rrow-features",i),start:"top 88%",once:!0}});p.forEach((d,h)=>f.from(d,{drawSVG:"0%",duration:1,ease:"power2.inOut"},h*.1))}))});return[...n.map(s),c]}export{B as ritualRowsHTML,D as ritualRowsMotion,L as ritualRowsSteps};
