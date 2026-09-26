/* ==========================================================================
   Ratings & Reviews + Rate This Product (Update 02 §9.4).
   - Sample reviews (js/data/reviews.js) and the sample rating summary in
     products.js appear only while CONFIG.demoReviews is true, under the note
     "Sample reviews shown for preview". With it off: "No ratings yet" and
     "Be the first to review this product".
   - Reviews written here are saved in localStorage "jiai-reviews-v1"
     ({ productId: [review] }) and appear at the top at once ("Just now").
     TODO: send to a review backend with moderation before they are public.
   ========================================================================== */

import { CONFIG } from "../data/config.js";
import { SAMPLE_REVIEWS } from "../data/reviews.js";
import { esc, formatDate, icon, $, $$, reducedMotion, hasGSAP } from "./format.js";
import { toast } from "./toast.js";

const KEY = "jiai-reviews-v1";
const PAGE = 3;

function readStore() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch { return {}; }
}
function saveReview(productId, review) {
  const store = readStore();
  store[productId] = [review, ...(store[productId] || [])];
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* private mode: this visit only */ }
}

/** Every review to show for a product: the visitor's own first, then samples (preview only). */
export function reviewsFor(p) {
  const own = (readStore()[p.id] || []).map((r) => ({ ...r, own: true }));
  const samples = CONFIG.demoReviews ? (SAMPLE_REVIEWS[p.id] || []) : [];
  return [...own, ...samples];
}

/** Rating summary: the sample summary (preview only) plus the visitor's own ratings. */
export function ratingFor(p) {
  const base = CONFIG.demoReviews && p.rating ? { ...p.rating.breakdown } : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  (readStore()[p.id] || []).forEach((r) => { base[r.rating] = (base[r.rating] || 0) + 1; });
  const own = readStore()[p.id] || [];
  const count = Object.values(base).reduce((a, b) => a + b, 0);
  if (!count) return null;
  const sum = Object.entries(base).reduce((a, [k, n]) => a + Number(k) * n, 0);
  // The stated average (products.js) until the visitor adds a rating of their own.
  const average = !own.length && CONFIG.demoReviews && p.rating ? p.rating.average : Math.round((sum / count) * 10) / 10;
  return { average, count, breakdown: base };
}

const stars = (n, cls = "") => `<span class="stars ${cls}" aria-hidden="true">${[1, 2, 3, 4, 5].map((i) =>
  icon("star", i <= Math.round(n) ? "icon--filled" : "")).join("")}</span>`;

/* ---------- markup ---------- */

export function reviewsSectionHTML(p) {
  const canRate = !p.comingSoon;
  // The note only where samples show (never on combos or pieces without sample ratings).
  const samples = CONFIG.demoReviews && ((SAMPLE_REVIEWS[p.id] || []).length > 0 || !!p.rating);
  return `
    <section class="section pdp-reviews" id="reviews" aria-labelledby="reviews-title">
      <div class="wrap">
        <h2 id="reviews-title" class="t-h2">Ratings &amp; Reviews</h2>
        ${samples ? `<p class="sample-note">${icon("info")} Sample reviews shown for preview</p>` : ""}
        <div class="rv-grid">
          <div class="rv-side">
            <div class="rv-summary" data-rv-summary></div>
            ${canRate ? rateFormHTML(p) : `<p class="rv-closed">Ratings open when ${esc(p.name)} arrives.</p>`}
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
                ${icon("chevron-down")}
              </label>
            </div>
            <ol class="rv-list" data-rv-list></ol>
            <button type="button" class="btn-line rv-more" data-rv-more hidden><span>Show more</span></button>
          </div>
        </div>
      </div>
    </section>`;
}

function rateFormHTML(p) {
  return `
    <form class="rate" id="rate" data-rate novalidate aria-labelledby="rate-title">
      <h3 id="rate-title" class="rate-title">Rate This Product</h3>
      <p class="rate-sub">Tell us about your experience.</p>
      <div class="rate-stars" role="radiogroup" aria-label="Your rating" data-rate-stars>
        ${[1, 2, 3, 4, 5].map((n) => `
          <button type="button" role="radio" class="rate-star" data-value="${n}" aria-checked="false" tabindex="${n === 1 ? 0 : -1}"
            aria-label="${n} star${n > 1 ? "s" : ""}">${icon("star")}</button>`).join("")}
        <span class="rate-word coords" data-rate-word aria-hidden="true"></span>
      </div>
      <p class="rate-error" data-rate-error role="alert" hidden>Please choose a rating from 1 to 5 stars.</p>
      <label class="rate-field"><span>Title <em>(optional)</em></span><input class="field" name="title" maxlength="80" autocomplete="off"></label>
      <label class="rate-field"><span>Your review <em>(optional)</em></span><textarea class="field" name="text" rows="3" maxlength="1200"></textarea></label>
      <label class="rate-field"><span>Name <em>(optional)</em></span><input class="field" name="name" maxlength="40" autocomplete="given-name"></label>
      <button type="submit" class="btn-maison"><span>Submit review</span></button>
    </form>`;
}

/* ---------- behaviour ---------- */

const WORDS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very good", 5: "Excellent" };

export function initReviews(p, root) {
  const summary = $("[data-rv-summary]", root);
  const list = $("[data-rv-list]", root);
  const more = $("[data-rv-more]", root);
  const sortEl = $("[data-rv-sort]", root);
  const countEl = $("[data-rv-count]", root);
  let shown = PAGE;

  function renderSummary() {
    const r = ratingFor(p);
    if (!r) {
      summary.innerHTML = `<p class="rv-big rv-big--none">No ratings yet</p>`;
      return;
    }
    const max = Math.max(...Object.values(r.breakdown), 1);
    summary.innerHTML = `
      <p class="rv-big"><span>${r.average.toFixed(1)}</span>${icon("star", "icon--filled")}</p>
      <p class="rv-based">Based on ${r.count} rating${r.count === 1 ? "" : "s"}</p>
      <ul class="rv-bars">
        ${[5, 4, 3, 2, 1].map((k) => `
          <li><span class="rv-k">${k} ${icon("star", "icon--filled")}</span>
            <span class="rv-bar" role="img" aria-label="${k} stars: ${r.breakdown[k] || 0} ratings"><span style="--w:${((r.breakdown[k] || 0) / max).toFixed(3)}"></span></span>
            <span class="rv-n">${r.breakdown[k] || 0}</span></li>`).join("")}
      </ul>`;
    fillBars();
  }

  // The bars fill as they come into view (once).
  function fillBars() {
    const bars = $(".rv-bars", summary);
    if (!bars) return;
    if (reducedMotion() || !("IntersectionObserver" in window)) { bars.classList.add("is-filled"); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { bars.classList.add("is-filled"); io.disconnect(); } }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(bars);
  }

  function renderList() {
    const all = reviewsFor(p);
    const sort = sortEl.value;
    const sorted = [...all].sort((a, b) =>
      sort === "high" ? b.rating - a.rating || (b.date > a.date ? 1 : -1)
      : sort === "low" ? a.rating - b.rating || (b.date > a.date ? 1 : -1)
      : (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
    countEl.textContent = all.length ? `${all.length} review${all.length === 1 ? "" : "s"}` : "";
    if (!all.length) {
      list.innerHTML = `<li class="rv-empty"><p>Be the first to review this product.</p>${p.comingSoon ? "" : `<a class="link-cta" href="#rate">Rate This Product</a>`}</li>`;
      more.hidden = true;
      return;
    }
    list.innerHTML = sorted.slice(0, shown).map((r) => `
      <li class="rv-item${r.own ? " is-own" : ""}">
        <div class="rv-meta">
          <span class="rv-name">${esc(r.name || "Anonymous")}</span>
          ${stars(r.rating)}<span class="visually-hidden">${r.rating} out of 5 stars</span>
          <span class="rv-date coords">${r.own && Date.now() - Date.parse(r.date) < 864e5 ? "Just now" : esc(formatDate(r.date.slice(0, 10)))}</span>
          ${/* No "Verified buyer" badge: only a real, verified purchase may carry one. TODO: show it when
               the review backend confirms the order (never on sample or unverified reviews). */ ""}
        </div>
        ${r.title ? `<h3 class="rv-title">${esc(r.title)}</h3>` : ""}
        ${r.text ? `<p class="rv-text">${esc(r.text)}</p>` : ""}
      </li>`).join("");
    more.hidden = sorted.length <= shown;
  }

  sortEl.addEventListener("change", () => { shown = PAGE; renderList(); });
  more.addEventListener("click", () => {
    const first = shown;
    shown += PAGE;
    renderList();
    $$(".rv-item", list)[first]?.setAttribute("tabindex", "-1");
    $$(".rv-item", list)[first]?.focus({ preventScroll: true });
  });

  renderSummary();
  renderList();

  /* ---- Rate This Product: star radiogroup with hover preview, click, arrow keys ---- */
  const form = $("[data-rate]", root);
  if (!form) return;
  const starsEl = $("[data-rate-stars]", form);
  const buttons = $$(".rate-star", starsEl);
  const word = $("[data-rate-word]", form);
  const error = $("[data-rate-error]", form);
  let value = 0;

  const paint = (n) => {
    buttons.forEach((b, i) => b.classList.toggle("is-on", i < n));
    word.textContent = n ? WORDS[n] : "";
  };
  const set = (n, focus = false) => {
    value = n;
    buttons.forEach((b, i) => {
      b.setAttribute("aria-checked", String(i + 1 === n));
      b.tabIndex = i + 1 === (n || 1) ? 0 : -1;
    });
    paint(n);
    error.hidden = true;
    if (focus) buttons[n - 1].focus();
  };
  buttons.forEach((b) => {
    b.addEventListener("click", () => set(Number(b.dataset.value)));
    b.addEventListener("pointerenter", () => paint(Number(b.dataset.value)));
  });
  starsEl.addEventListener("pointerleave", () => paint(value));
  starsEl.addEventListener("keydown", (e) => {
    const cur = value || 0;
    if (["ArrowRight", "ArrowUp"].includes(e.key)) { e.preventDefault(); set(Math.min(5, cur + 1), true); }
    if (["ArrowLeft", "ArrowDown"].includes(e.key)) { e.preventDefault(); set(Math.max(1, cur - 1), true); }
    if (e.key === "Home") { e.preventDefault(); set(1, true); }
    if (e.key === "End") { e.preventDefault(); set(5, true); }
    if (e.key === " " || e.key === "Enter") { const b = e.target.closest(".rate-star"); if (b) { e.preventDefault(); set(Number(b.dataset.value)); } }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!value) { error.hidden = false; buttons[0].focus(); return; }
    const data = new FormData(form);
    const review = {
      name: String(data.get("name") || "").trim().slice(0, 40) || "You",
      rating: value,
      date: new Date().toISOString(),
      title: String(data.get("title") || "").trim().slice(0, 80),
      text: String(data.get("text") || "").trim().slice(0, 1200),
    };
    saveReview(p.id, review);   // TODO: POST to the review backend; publish after moderation
    form.reset();
    set(0);
    buttons[0].tabIndex = 0;
    sortEl.value = "recent";
    shown = PAGE;
    renderSummary();
    renderList();
    document.dispatchEvent(new CustomEvent("reviews:change", { detail: { id: p.id } }));
    toast("Thank you. Your review has been added.");
    const first = $(".rv-item", list);
    if (first && hasGSAP() && !reducedMotion()) gsap.from(first, { opacity: 0, y: 12, duration: 0.6, ease: "power3.out" });
  });
}
