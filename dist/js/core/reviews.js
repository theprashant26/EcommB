import{CONFIG as y}from"../data/config.js";import{SAMPLE_REVIEWS as D}from"../data/reviews.js";import{esc as w,formatDate as N,icon as f,$ as l,$$ as M,reducedMotion as T,hasGSAP as j}from"./format.js";import{toast as F}from"./toast.js";const A="jiai-reviews-v1",E=3;function S(){try{return JSON.parse(localStorage.getItem(A)||"{}")||{}}catch{return{}}}function H(t,a){const i=S();i[t]=[a,...i[t]||[]];try{localStorage.setItem(A,JSON.stringify(i))}catch{}}function P(t){const a=(S()[t.id]||[]).map(o=>({...o,own:!0})),i=y.demoReviews?D[t.id]||[]:[];return[...a,...i]}function Y(t){const a=y.demoReviews&&t.rating?{...t.rating.breakdown}:{5:0,4:0,3:0,2:0,1:0};(S()[t.id]||[]).forEach(d=>{a[d.rating]=(a[d.rating]||0)+1});const i=S()[t.id]||[],o=Object.values(a).reduce((d,c)=>d+c,0);if(!o)return null;const g=Object.entries(a).reduce((d,[c,$])=>d+Number(c)*$,0);return{average:!i.length&&y.demoReviews&&t.rating?t.rating.average:Math.round(g/o*10)/10,count:o,breakdown:a}}const C=(t,a="")=>`<span class="stars ${a}" aria-hidden="true">${[1,2,3,4,5].map(i=>f("star",i<=Math.round(t)?"icon--filled":"")).join("")}</span>`;function U(t){const a=!t.comingSoon;return`
    <section class="section pdp-reviews" id="reviews" aria-labelledby="reviews-title">
      <div class="wrap">
        <h2 id="reviews-title" class="t-h2">Ratings &amp; Reviews</h2>
        ${y.demoReviews&&((D[t.id]||[]).length>0||!!t.rating)?`<p class="sample-note">${f("info")} Sample reviews shown for preview</p>`:""}
        <div class="rv-grid">
          <div class="rv-side">
            <div class="rv-summary" data-rv-summary></div>
            ${a?G(t):`<p class="rv-closed">Ratings open when ${w(t.name)} arrives.</p>`}
          </div>
          <div class="rv-main">
            <div class="rv-head">
              <p class="coords" data-rv-count aria-live="polite"></p>
              <label class="shop-sort rv-sort">
                <span class="t-label">Sort</span>
                <select class="shop-select" data-rv-sort>
                  <option value="recent">Most recent</option>
                  <option value="high">Highest</option>
                  <option value="low">Lowest</option>
                </select>
                ${f("chevron-down")}
              </label>
            </div>
            <ol class="rv-list" data-rv-list></ol>
            <button type="button" class="btn-line rv-more" data-rv-more hidden><span>Show more</span></button>
          </div>
        </div>
      </div>
    </section>`}function G(t){return`
    <form class="rate" id="rate" data-rate novalidate aria-labelledby="rate-title">
      <h3 id="rate-title" class="rate-title">Rate This Product</h3>
      <p class="rate-sub">Tell us about your experience.</p>
      <div class="rate-stars" role="radiogroup" aria-label="Your rating" data-rate-stars>
        ${[1,2,3,4,5].map(a=>`
          <button type="button" role="radio" class="rate-star" data-value="${a}" aria-checked="false" tabindex="${a===1?0:-1}"
            aria-label="${a} star${a>1?"s":""}">${f("star")}</button>`).join("")}
        <span class="rate-word coords" data-rate-word aria-hidden="true"></span>
      </div>
      <p class="rate-error" data-rate-error role="alert" hidden>Please choose a rating from 1 to 5 stars.</p>
      <label class="rate-field"><span>Title <em>(optional)</em></span><input class="field" name="title" maxlength="80" autocomplete="off"></label>
      <label class="rate-field"><span>Your review <em>(optional)</em></span><textarea class="field" name="text" rows="3" maxlength="1200"></textarea></label>
      <label class="rate-field"><span>Name <em>(optional)</em></span><input class="field" name="name" maxlength="40" autocomplete="given-name"></label>
      <button type="submit" class="btn-maison"><span>Submit review</span></button>
    </form>`}const B={1:"Poor",2:"Fair",3:"Good",4:"Very good",5:"Excellent"};function _(t,a){const i=l("[data-rv-summary]",a),o=l("[data-rv-list]",a),g=l("[data-rv-more]",a),b=l("[data-rv-sort]",a),d=l("[data-rv-count]",a);let c=E;function $(){const e=Y(t);if(!e){i.innerHTML='<p class="rv-big rv-big--none">No ratings yet</p>';return}const n=Math.max(...Object.values(e.breakdown),1);i.innerHTML=`
      <p class="rv-big"><span>${e.average.toFixed(1)}</span>${f("star","icon--filled")}</p>
      <p class="rv-based">Based on ${e.count} rating${e.count===1?"":"s"}</p>
      <ul class="rv-bars">
        ${[5,4,3,2,1].map(r=>`
          <li><span class="rv-k">${r} ${f("star","icon--filled")}</span>
            <span class="rv-bar" role="img" aria-label="${r} stars: ${e.breakdown[r]||0} ratings"><span style="--w:${((e.breakdown[r]||0)/n).toFixed(3)}"></span></span>
            <span class="rv-n">${e.breakdown[r]||0}</span></li>`).join("")}
      </ul>`,O()}function O(){const e=l(".rv-bars",i);if(!e)return;if(T()||!("IntersectionObserver"in window)){e.classList.add("is-filled");return}const n=new IntersectionObserver(([r])=>{r.isIntersecting&&(e.classList.add("is-filled"),n.disconnect())},{rootMargin:"0px 0px -10% 0px"});n.observe(e)}function x(){const e=P(t),n=b.value,r=[...e].sort((s,m)=>n==="high"?m.rating-s.rating||(m.date>s.date?1:-1):n==="low"?s.rating-m.rating||(m.date>s.date?1:-1):m.date>s.date?1:m.date<s.date?-1:0);if(d.textContent=e.length?`${e.length} review${e.length===1?"":"s"}`:"",!e.length){o.innerHTML=`<li class="rv-empty"><p>Be the first to review this product.</p>${t.comingSoon?"":'<a class="link-cta" href="#rate">Rate This Product</a>'}</li>`,g.hidden=!0;return}o.innerHTML=r.slice(0,c).map(s=>`
      <li class="rv-item${s.own?" is-own":""}">
        <div class="rv-meta">
          <span class="rv-name">${w(s.name||"Anonymous")}</span>
          ${C(s.rating)}<span class="visually-hidden">${s.rating} out of 5 stars</span>
          <span class="rv-date coords">${s.own&&Date.now()-Date.parse(s.date)<864e5?"Just now":w(N(s.date.slice(0,10)))}</span>
          
        </div>
        ${s.title?`<h3 class="rv-title">${w(s.title)}</h3>`:""}
        ${s.text?`<p class="rv-text">${w(s.text)}</p>`:""}
      </li>`).join(""),g.hidden=r.length<=c}b.addEventListener("change",()=>{c=E,x()}),g.addEventListener("click",()=>{const e=c;c+=E,x(),M(".rv-item",o)[e]?.setAttribute("tabindex","-1"),M(".rv-item",o)[e]?.focus({preventScroll:!0})}),$(),x();const v=l("[data-rate]",a);if(!v)return;const L=l("[data-rate-stars]",v),p=M(".rate-star",L),I=l("[data-rate-word]",v),R=l("[data-rate-error]",v);let h=0;const k=e=>{p.forEach((n,r)=>n.classList.toggle("is-on",r<e)),I.textContent=e?B[e]:""},u=(e,n=!1)=>{h=e,p.forEach((r,s)=>{r.setAttribute("aria-checked",String(s+1===e)),r.tabIndex=s+1===(e||1)?0:-1}),k(e),R.hidden=!0,n&&p[e-1].focus()};p.forEach(e=>{e.addEventListener("click",()=>u(Number(e.dataset.value))),e.addEventListener("pointerenter",()=>k(Number(e.dataset.value)))}),L.addEventListener("pointerleave",()=>k(h)),L.addEventListener("keydown",e=>{const n=h||0;if(["ArrowRight","ArrowUp"].includes(e.key)&&(e.preventDefault(),u(Math.min(5,n+1),!0)),["ArrowLeft","ArrowDown"].includes(e.key)&&(e.preventDefault(),u(Math.max(1,n-1),!0)),e.key==="Home"&&(e.preventDefault(),u(1,!0)),e.key==="End"&&(e.preventDefault(),u(5,!0)),e.key===" "||e.key==="Enter"){const r=e.target.closest(".rate-star");r&&(e.preventDefault(),u(Number(r.dataset.value)))}}),v.addEventListener("submit",e=>{if(e.preventDefault(),!h){R.hidden=!1,p[0].focus();return}const n=new FormData(v),r={name:String(n.get("name")||"").trim().slice(0,40)||"You",rating:h,date:new Date().toISOString(),title:String(n.get("title")||"").trim().slice(0,80),text:String(n.get("text")||"").trim().slice(0,1200)};H(t.id,r),v.reset(),u(0),p[0].tabIndex=0,b.value="recent",c=E,$(),x(),document.dispatchEvent(new CustomEvent("reviews:change",{detail:{id:t.id}})),F("Thank you. Your review has been added.");const s=l(".rv-item",o);s&&j()&&!T()&&gsap.from(s,{opacity:0,y:12,duration:.6,ease:"power3.out"})})}export{_ as initReviews,Y as ratingFor,P as reviewsFor,U as reviewsSectionHTML};
