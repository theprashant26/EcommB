import{CONFIG as g}from"../data/config.js";import"./bag.js";import{esc as p,formatPrice as f,icon as s,$ as d}from"./format.js";const m="jiai-pin-v1",y=/^[1-9][0-9]{5}$/;let b;const $=e=>(b||=new Intl.DateTimeFormat("en-IN",{weekday:"short",day:"numeric",month:"short"})).format(e);function D(e){const n=new Date;let a=e;for(;a>0;)n.setDate(n.getDate()+1),n.getDay()!==0&&(a-=1);return n}function L(e){if(e.startsWith("11"))return{days:[2,2]};const n=Number(e[0]);return n<=4?{days:[3,4]}:n<=8?{days:[4,6]}:null}const k=()=>{try{return localStorage.getItem(m)||""}catch{return""}},w=e=>{try{localStorage.setItem(m,e)}catch{}};function N(){return`
    <section class="pdp-delivery" aria-labelledby="delivery-title">
      <div class="wrap dl-inner">
        <div class="dl-head">
          <h2 id="delivery-title" class="dl-title">Delivery Options</h2>
          <p class="dl-current" data-dl-current hidden></p>
        </div>
        <form class="dl-form" data-dl-form novalidate>
          <label class="visually-hidden" for="dlPin">Delivery PIN code</label>
          <div class="dl-field">
            ${s("map-pin")}
            <input class="dl-input" id="dlPin" name="pin" inputmode="numeric" autocomplete="postal-code" maxlength="6" pattern="[1-9][0-9]{5}" placeholder="Enter a 6-digit PIN" aria-describedby="dlMsg">
            <button type="submit" class="dl-check">Check</button>
          </div>
          <p class="dl-msg" id="dlMsg" data-dl-msg aria-live="polite"></p>
        </form>
        <div class="dl-result" data-dl-result aria-live="polite"></div>
      </div>
    </section>`}function T(e,{orderValue:n}){const a=d("[data-dl-form]",e),t=d("#dlPin",e),v=d("[data-dl-msg]",e),c=d("[data-dl-result]",e),o=d("[data-dl-current]",e);let r=k();function u(){if(!y.test(r)){c.innerHTML="",o.hidden=!0,a.hidden=!1;return}o.hidden=!1,o.innerHTML=`Currently delivering to <strong>${p(r)}</strong> \xB7 <button type="button" class="dl-change link-draw" data-dl-change>Change</button>`,a.hidden=!0;const i=L(r);if(!i){c.innerHTML=`<p class="dl-line dl-line--no">${s("info")}<span><strong>Not serviceable yet.</strong> We don\u2019t deliver to ${p(r)} yet. Leave your email in the footer and we\u2019ll write when we do.</span></p>`;return}const l=g.delivery,h=n()>=l.freeOver;c.innerHTML=`
      <p class="dl-line">${s("truck")}<span><strong>Standard delivery \u2014 by ${p($(D(i.days[1])))}</strong></span></p>
      <p class="dl-line">${s("package-check")}<span>${h?'<span class="dl-ok">Free delivery</span>':`${f(l.fee)} delivery \xB7 free over ${f(l.freeOver)}`}</span></p>
      ${l.cod?`<p class="dl-line">${s("check")}<span>Cash on delivery available</span></p>`:""}`}return a.addEventListener("submit",i=>{i.preventDefault();const l=t.value.trim();if(!y.test(l)){v.textContent="Please enter a valid 6-digit PIN code.",t.setAttribute("aria-invalid","true"),t.focus();return}t.removeAttribute("aria-invalid"),v.textContent="",r=l,w(r),u(),d("[data-dl-change]",e)?.focus()}),t.addEventListener("input",()=>{t.value=t.value.replace(/\D/g,"").slice(0,6)}),e.addEventListener("click",i=>{i.target.closest("[data-dl-change]")&&(a.hidden=!1,o.hidden=!0,c.innerHTML="",t.value=r,t.focus(),t.select())}),u(),{refresh:u}}export{N as deliveryHTML,L as estimateFor,T as initDelivery};
