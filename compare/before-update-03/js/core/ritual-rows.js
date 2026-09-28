/* ==========================================================================
   Rituals, written down (Update 02 §6.3) — alternating rows from
   js/data/rituals.js, shared by the home page and rituals.html.
   Odd rows: image left, text right. Even rows: text left, image right.
   The row image fills a band (cover, anchored to the product side) whose
   height follows the image's own proportions (max 760px), so the text over
   the image's soft empty side never reaches the product. Below 1360px the
   image band comes first and the text follows on white.
   Motion: the image drifts (±3%), the text reveals line by line, the feature
   icons draw in (DrawSVG, stagger 0.1).
   ========================================================================== */

import { RITUALS } from "../data/rituals.js";
import { getProduct, productURL } from "../data/products.js";
import { esc, icon, imageSize, $, $$ } from "./format.js";
import { splitLines } from "./motion.js";

/** Rows markup. headingLevel: 3 under a section H2 (home), 2 on rituals.html. */
export function ritualRowsHTML({ headingLevel = 3 } = {}) {
  const h = `h${headingLevel}`;
  return RITUALS.map((r, i) => {
    const side = i % 2 === 0 ? "left" : "right";           // where the image's product sits
    const p = r.productId ? getProduct(r.productId) : null;
    const [w, hgt] = imageSize(r.image);
    const cta = r.cta
      ? (r.cta.href === "#newsletter"
        ? `<button type="button" class="row-link btn-plain" data-notify="${esc(r.productId || "ritual-" + r.n)}">${esc(r.cta.label)} ${icon("arrow-right")}</button>`
        : `<a class="row-link" href="${esc(r.cta.href)}">${esc(r.cta.label)} ${icon("arrow-right")}</a>`)
      : p ? `<a class="row-link" href="${productURL(p.id)}" aria-label="Explore now: ${esc(p.fullName)}">Explore now ${icon("arrow-right")}</a>` : "";
    return `
      <article class="rrow rrow--${side}" data-rrow style="--ar:${w} / ${hgt}">
        <div class="rrow-media">
          <img class="rrow-img" src="${esc(r.image)}" alt="" width="${w}" height="${hgt}" loading="lazy" decoding="async" data-rrow-img>
        </div>
        <div class="wrap rrow-inner">
          <div class="rrow-text">
            <p class="rrow-n t-label"><span>${esc(r.n)}</span></p>
            <${h} class="t-h2 rrow-title" data-rrow-lines>${esc(r.title)}</${h}>
            <p class="rrow-copy" data-rrow-lines>${esc(r.text)}</p>
            <ul class="rrow-features">
              ${r.features.map((f) => `
                <li><span class="rrow-ico">${icon(f.icon, "icon--draw")}</span><span class="rrow-flabel">${esc(f.label)}</span></li>`).join("")}
            </ul>
            ${cta}
          </div>
        </div>
      </article>`;
  }).join("");
}

/* ---------- inline the feature icons so their strokes can draw ---------- */

let sprite;
function loadSprite() {
  sprite ||= fetch("assets/icons/icons.svg").then((r) => r.text())
    .then((txt) => new DOMParser().parseFromString(txt, "image/svg+xml"))
    .catch(() => null);
  return sprite;
}

async function inlineIcons(root) {
  const doc = await loadSprite();
  if (!doc) return [];
  return $$("svg.icon--draw", root).map((svg) => {
    const id = svg.querySelector("use")?.getAttribute("href")?.split("#")[1];
    const sym = id && doc.getElementById(id);
    if (!sym) return svg;
    svg.setAttribute("viewBox", sym.getAttribute("viewBox") || "0 0 24 24");
    svg.innerHTML = sym.innerHTML;
    return svg;
  });
}

/** Scroll motion for the rows (inside a motion context). */
export function ritualRowsMotion(root, { ctx, reduce }) {
  const rows = $$("[data-rrow]", root);
  if (!rows.length || reduce || !window.ScrollTrigger) return;
  rows.forEach((row) => {
    const img = $("[data-rrow-img]", row);
    gsap.fromTo(img, { yPercent: -3 }, {
      yPercent: 3, ease: "none",
      scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true },
    });
    $$("[data-rrow-lines]", row).forEach((el) => splitLines(el, { ctx, duration: 0.9, start: "top 85%" }));
    gsap.from($$(".rrow-n, .rrow-features li, .row-link", row), {
      opacity: 0, y: 12, duration: 0.8, stagger: 0.08, ease: "power3.out",
      scrollTrigger: { trigger: $(".rrow-text", row), start: "top 80%", once: true },
    });
  });
  // Icons draw in once their strokes are inline.
  inlineIcons(root).then((svgs) => {
    if (!window.DrawSVGPlugin || !svgs.length) return;
    const add = (fn) => (ctx ? ctx.add(fn) : fn());
    add(() => rows.forEach((row) => {
      const shapes = $$(".rrow-features svg", row).map((svg) => $$("path, circle, line, rect, polyline, ellipse", svg));
      if (!shapes.length) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: $(".rrow-features", row), start: "top 88%", once: true } });
      shapes.forEach((set, i) => tl.from(set, { drawSVG: "0%", duration: 1, ease: "power2.inOut" }, i * 0.1));
    }));
  });
}
