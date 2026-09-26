/* ==========================================================================
   Delivery Options (Update 02 §9.4) — a 6-digit PIN check on the product page.
   The PIN is remembered in localStorage "jiai-pin-v1".
   DEMO LOGIC — TODO: replace estimateFor() with the courier's serviceability
   API at launch. Rules for now (days from today, Sundays skipped):
     11xxxx → 2 days · 1–4xxxxx → 3–4 days · 5–8xxxxx → 4–6 days · 9xxxxx → not serviceable yet.
   ========================================================================== */

import { CONFIG } from "../data/config.js";
import { bagSubtotal } from "./bag.js";
import { esc, formatPrice, icon, $ } from "./format.js";

const KEY = "jiai-pin-v1";
const VALID = /^[1-9][0-9]{5}$/;

let dayFormat;
const fmtDay = (d) => (dayFormat ||= new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" })).format(d);

/** today + n working days, skipping Sundays */
function addDays(n) {
  const d = new Date();
  let left = n;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) left -= 1;
  }
  return d;
}

export function estimateFor(pin) {
  if (pin.startsWith("11")) return { days: [2, 2] };
  const first = Number(pin[0]);
  if (first <= 4) return { days: [3, 4] };
  if (first <= 8) return { days: [4, 6] };
  return null; // 9: not serviceable yet
}

const readPin = () => { try { return localStorage.getItem(KEY) || ""; } catch { return ""; } };
const savePin = (pin) => { try { localStorage.setItem(KEY, pin); } catch { /* private mode */ } };

export function deliveryHTML() {
  return `
    <section class="pdp-delivery" aria-labelledby="delivery-title">
      <div class="wrap dl-inner">
        <div class="dl-head">
          <h2 id="delivery-title" class="dl-title">Delivery Options</h2>
          <p class="dl-current" data-dl-current hidden></p>
        </div>
        <form class="dl-form" data-dl-form novalidate>
          <label class="visually-hidden" for="dlPin">Delivery PIN code</label>
          <div class="dl-field">
            ${icon("map-pin")}
            <input class="dl-input" id="dlPin" name="pin" inputmode="numeric" autocomplete="postal-code" maxlength="6" pattern="[1-9][0-9]{5}" placeholder="Enter a 6-digit PIN" aria-describedby="dlMsg">
            <button type="submit" class="dl-check">Check</button>
          </div>
          <p class="dl-msg" id="dlMsg" data-dl-msg aria-live="polite"></p>
        </form>
        <div class="dl-result" data-dl-result aria-live="polite"></div>
      </div>
    </section>`;
}

/** orderValue(): what the order would come to (cart + this piece) — decides "Free delivery". */
export function initDelivery(root, { orderValue }) {
  const form = $("[data-dl-form]", root);
  const input = $("#dlPin", root);
  const msg = $("[data-dl-msg]", root);
  const result = $("[data-dl-result]", root);
  const current = $("[data-dl-current]", root);
  let pin = readPin();

  function render() {
    if (!VALID.test(pin)) { result.innerHTML = ""; current.hidden = true; form.hidden = false; return; }
    current.hidden = false;
    current.innerHTML = `Currently delivering to <strong>${esc(pin)}</strong> · <button type="button" class="dl-change link-draw" data-dl-change>Change</button>`;
    form.hidden = true;
    const est = estimateFor(pin);
    if (!est) {
      result.innerHTML = `<p class="dl-line dl-line--no">${icon("info")}<span><strong>Not serviceable yet.</strong> We don’t deliver to ${esc(pin)} yet. Leave your email in the footer and we’ll write when we do.</span></p>`;
      return;
    }
    const d = CONFIG.delivery;
    const free = orderValue() >= d.freeOver;
    result.innerHTML = `
      <p class="dl-line">${icon("truck")}<span><strong>Standard delivery — by ${esc(fmtDay(addDays(est.days[1])))}</strong></span></p>
      <p class="dl-line">${icon("package-check")}<span>${free ? `<span class="dl-ok">Free delivery</span>` : `${formatPrice(d.fee)} delivery · free over ${formatPrice(d.freeOver)}`}</span></p>
      ${d.cod ? `<p class="dl-line">${icon("check")}<span>Cash on delivery available</span></p>` : ""}`;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!VALID.test(v)) {
      msg.textContent = "Please enter a valid 6-digit PIN code.";
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }
    input.removeAttribute("aria-invalid");
    msg.textContent = "";
    pin = v;
    savePin(pin);
    render();
    $("[data-dl-change]", root)?.focus();
  });
  input.addEventListener("input", () => { input.value = input.value.replace(/\D/g, "").slice(0, 6); });
  root.addEventListener("click", (e) => {
    if (!e.target.closest("[data-dl-change]")) return;
    form.hidden = false;
    current.hidden = true;
    result.innerHTML = "";
    input.value = pin;
    input.focus();
    input.select();
  });
  render();
  return { refresh: render };
}
