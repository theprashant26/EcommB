/* ==========================================================================
   Site chrome: announcement bar, header (hide on scroll down / show on
   scroll up), the Shop / Brands / Origins dropdowns (Update 02 §4), the
   mobile menu, footer and newsletter forms.
   The markup lives in the PARTIAL blocks of every page; everything that
   lists brands or products is rendered here from the data files, so new
   brands and products appear in the menus by themselves.
   ========================================================================== */

import { CONFIG } from "../data/config.js";
import { visibleBrands, liveBrands, brandURL, getBrand } from "../data/brands.js";
import { PRODUCTS, productsByBrand, productURL, CATEGORY_LABELS, RITUAL_LABELS } from "../data/products.js";
import { ORIGINS, BATCHES, DEFAULT_BATCH, ARRIVAL_ORIGIN_ID } from "../data/origins.js";
import { esc, formatCoords, icon, $, $$, hasGSAP, reducedMotion, thumbOf, srcsetAttr } from "./format.js";
import { toast } from "./toast.js";
import { scrollToHash } from "./motion.js";
import { initViewTransitions } from "./transitions.js";

const ANNOUNCE_KEY = "jiai-announce-v1";

export function initHeader() {
  initAnnouncement();
  initScrollState();
  initDropdowns();     // panels render on first open
  initMobileMenu();    // groups render on first show
  markCurrentNav();
  // Footer lists: when the footer nears the screen, or once the browser is idle (so a fast
  // keyboard user never tabs past links that do not exist yet).
  let footerDone = false;
  const footer = () => { if (!footerDone) { footerDone = true; renderFooter(); } };
  whenNear(".site-footer", footer);
  (window.requestIdleCallback || ((fn) => setTimeout(fn, 2000)))(footer, { timeout: 4000 });
  initNewsletterForms();
  initNotify();
  initViewTransitions();

  $$("[data-account]").forEach((btn) =>
    btn.addEventListener("click", () => toast("Accounts open at launch.")));
}

/* ---------- lazy rendering: nothing below the fold or behind a click at load ---------- */

/** Run fn once, when the element comes within ~1.5 screens (or at once without IntersectionObserver). */
function whenNear(selector, fn) {
  const el = $(selector);
  if (!el) return;
  if (!("IntersectionObserver" in window)) { fn(); return; }
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    fn();
  }, { rootMargin: "150% 0px" });
  io.observe(el);
}

/* ---------- announcement bar ---------- */

function initAnnouncement() {
  const bar = $("[data-announce]");
  if (!bar) return;
  const html = document.documentElement;
  if (!CONFIG.announcement) html.classList.add("announce-off");
  $("[data-announce-text]", bar).textContent = CONFIG.announcement;
  $("[data-announce-close]", bar)?.addEventListener("click", () => {
    html.classList.add("announce-off");
    try { localStorage.setItem(ANNOUNCE_KEY, "dismissed"); } catch { /* private mode */ }
    window.ScrollTrigger?.refresh();
  });
}

/* ---------- header scroll state ---------- */

function initScrollState() {
  const top = $("#site-top");
  if (!top) return;
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = Math.max(0, window.scrollY);
    const delta = y - lastY;
    top.classList.toggle("is-scrolled", y > 4);
    // Past the announcement bar, tuck it away and keep only the header.
    top.classList.toggle("is-past-announce", y > 36);
    if (Math.abs(delta) > 6) {
      const menuOpen = top.classList.contains("is-mega-open");
      top.classList.toggle("is-hidden", delta > 0 && y > 160 && !menuOpen);
      lastY = y;
    }
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

/** Other modules (e.g. the cart's arc animation) can bring the header back. */
export function revealHeader() {
  $("#site-top")?.classList.remove("is-hidden");
}

/* ==========================================================================
   Menu content, generated from data. Each builder returns column objects
   that both the desktop dropdowns and the mobile accordions render.
   ========================================================================== */

const shopURL = (key, value) => `shop.html?${key}=${encodeURIComponent(value)}`;

/** Products a visitor may see (their brand is visible). */
function menuProducts() {
  const ids = new Set(visibleBrands().map((b) => b.id));
  return PRODUCTS.filter((p) => ids.has(p.brand));
}

const unique = (list) => [...new Set(list.filter(Boolean))];
const categories = () => unique(menuProducts().map((p) => p.category));
const rituals = () => {
  const present = new Set(menuProducts().map((p) => p.ritual));
  return Object.keys(RITUAL_LABELS).filter((r) => present.has(r));
};

/** "Leh, Ladakh · 34.15° N, 77.58° E" */
const originLine = (o) => `${o.name} · ${formatCoords(o.lat, o.lon)}`;

/** Where "See the origin" goes: the batch page if the brand has one, else the brand's origin strip. */
function originURL(brand) {
  const code = Object.entries(BATCHES).find(([, x]) => getBrandOfProduct(x.productId) === brand.id)?.[0];
  return code ? `origin.html?batch=${encodeURIComponent(code)}` : `${brandURL(brand.id)}#origin`;
}
const getBrandOfProduct = (id) => PRODUCTS.find((p) => p.id === id)?.brand;

function productRow(p) {
  const img = p.images.card || p.images.hero;
  return `
    <li>
      <a class="dd-prod" href="${productURL(p.id)}">
        <span class="dd-thumb"><img src="${esc(thumbOf(img))}" alt="" width="48" height="48" loading="lazy" decoding="async"></span>
        <span class="dd-prod-name">${esc(p.comingSoon ? p.fullName : p.name)}</span>
        ${p.comingSoon ? `<span class="tag-soon">Coming soon</span>` : ""}
      </a>
    </li>`;
}

const linkList = (links) =>
  `<ul class="dd-links">${links.map(([label, href]) => `<li><a class="link-draw" href="${href}">${esc(label)}</a></li>`).join("")}</ul>`;

const BUILDERS = {
  shop() {
    const cols = [
      { title: "Shop", body: linkList([["Shop all", "shop.html"], ["New arrivals", "shop.html?sort=new"], ["Bestsellers", shopURL("tag", "bestseller")], ["Combos", "combos.html"]]) },
      { title: "By category", body: linkList(categories().map((c) => [CATEGORY_LABELS[c] || c, shopURL("category", c)])) },
      { title: "By ritual", body: linkList(rituals().map((r) => [RITUAL_LABELS[r], shopURL("ritual", r)])) },
    ];
    const feature = `
      <a class="dd-feature" href="rituals.html">
        <span class="dd-feature-img"><img src="assets/rituals/ritual-01-cleanser.webp"${srcsetAttr("assets/rituals/ritual-01-cleanser.webp", "(max-width: 991px) 90vw, 26vw")} alt="" width="1536" height="582" loading="lazy" decoding="async"></span>
        <span class="dd-feature-cap">Rituals, written down.</span>
        <span class="dd-feature-cta">Explore ${icon("arrow-right")}</span>
      </a>`;
    return { cols, feature };
  },

  brands() {
    const brands = visibleBrands();
    const cols = categories().map((c) => {
      const groups = brands.map((b) => ({ b, items: productsByBrand(b.id).filter((p) => p.category === c) }))
        .filter((g) => g.items.length);
      return {
        title: CATEGORY_LABELS[c] || c,
        body: groups.map(({ b, items }) => `
          <div class="dd-brand">
            <a class="dd-brand-name" href="${brandURL(b.id)}">${esc(b.name)}</a>
            <ul class="dd-prods">${items.map(productRow).join("")}</ul>
          </div>`).join(""),
      };
    });
    return { cols };
  },

  origins() {
    const cols = visibleBrands().filter((b) => b.originId && ORIGINS[b.originId]).map((b) => {
      const o = ORIGINS[b.originId];
      return {
        title: b.name,
        body: `
          <p class="coords dd-origin">${esc(originLine(o))}</p>
          <ul class="dd-prods">${productsByBrand(b.id).map(productRow).join("")}</ul>
          <a class="link-cta dd-more" href="${originURL(b)}">See the origin</a>`,
      };
    });
    // The final column: a small tilted crop of the map with the red pins.
    const pins = unique([...liveBrands().map((b) => b.originId), ARRIVAL_ORIGIN_ID]).map((id) => ORIGINS[id]).filter(Boolean);
    const feature = `
      <a class="dd-map" href="origin.html?batch=${encodeURIComponent(DEFAULT_BATCH)}">
        <span class="dd-map-view" aria-hidden="true">
          <span class="dd-map-plane">
            <img src="assets/map/map-dots.png" alt="" width="2400" height="1517" loading="lazy" decoding="async">
            ${pins.map((o) => `<i class="dd-pin" style="--x:${mapX(o.lon).toFixed(2)}%;--y:${mapY(o.lat).toFixed(2)}%"></i>`).join("")}
          </span>
        </span>
        <span class="dd-feature-cap">Trace your tube</span>
        <span class="dd-feature-cta">Scan, or enter the code ${icon("arrow-right")}</span>
      </a>`;
    return { cols, feature };
  },
};

/* map-dots.png projection (assets/map/pins.json): lon −12…100 at cos 35°, lat 62…4, 26.159 px per degree */
const mapX = (lon) => ((lon + 12) * Math.cos((35 * Math.PI) / 180) * 26.159 / 2400) * 100;
const mapY = (lat) => ((62 - lat) * 26.159 / 1517) * 100;

/* ---------- desktop dropdowns ---------- */

function renderPanel(name, body) {
  const { cols, feature } = BUILDERS[name]();
  body.style.setProperty("--cols", cols.length);
  body.classList.toggle("has-feature", !!feature);
  body.innerHTML = cols.map((c) => `
    <div class="dd-col" data-dd-col>
      <p class="t-label dd-title">${esc(c.title)}</p>
      ${c.body}
    </div>`).join("") + (feature ? `<div class="dd-col dd-col--feature" data-dd-col>${feature}</div>` : "");
}

function initDropdowns() {
  const top = $("#site-top");
  const triggers = $$("[data-dd-trigger]");
  const veil = $("[data-dd-veil]");
  if (!top || !triggers.length) return;

  const panelOf = (t) => $(`#${t.getAttribute("aria-controls")}`);
  const rendered = new Set();
  let current = null;              // the open trigger
  let byHover = false;             // opened by hover: the next click on its trigger keeps it open
  let openTimer, closeTimer;
  const animate = () => hasGSAP() && !reducedMotion();

  const focusables = (panel) => $$("a[href], button:not([disabled])", panel);

  function open(trigger, { focus = false } = {}) {
    clearTimeout(closeTimer);
    clearTimeout(openTimer);
    const panel = panelOf(trigger);
    if (!panel) return;
    const name = trigger.dataset.ddTrigger;
    if (!rendered.has(name)) { renderPanel(name, $("[data-dd-body]", panel)); rendered.add(name); }
    if (current === trigger) { if (focus) focusables(panel)[0]?.focus(); return; }

    // The menu area is already showing (another panel open, or one still fading out): switch
    // instantly instead of replaying the full opening.
    const switching = !!current || (veil && !veil.hidden);
    settle(trigger);
    current = trigger;
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    top.classList.add("is-mega-open");
    if (veil) veil.hidden = false;

    if (animate()) {
      if (switching && veil) gsap.set(veil, { opacity: 1 });
      if (!switching) {
        gsap.fromTo(panel, { clipPath: "inset(0 0 100% 0)", opacity: 0 },
          { clipPath: "inset(0 0 0% 0)", opacity: 1, duration: 0.45, ease: "power3.out", clearProps: "clipPath" });
        gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "none" });
      } else {
        gsap.set(panel, { clipPath: "none", opacity: 1 });
      }
      gsap.fromTo($$("[data-dd-col]", panel), { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.04, ease: "power3.out", delay: switching ? 0 : 0.08 });
    }
    if (focus) focusables(panel)[0]?.focus();
  }

  /**
   * Before a panel opens: stop every running menu animation (panels, their columns, the veil)
   * and hide every other panel at once, so two panels can never overlap or stay half-visible,
   * however fast the pointer moves between tabs.
   */
  function settle(except) {
    triggers.forEach((t) => {
      const p = panelOf(t);
      if (!p) return;
      if (hasGSAP()) {
        gsap.killTweensOf([p, ...$$("[data-dd-col]", p)]);
        gsap.set([p, ...$$("[data-dd-col]", p)], { clearProps: "opacity,clipPath,transform" });
      }
      if (t !== except) { p.hidden = true; t.setAttribute("aria-expanded", "false"); }
    });
    if (hasGSAP() && veil) gsap.killTweensOf(veil);
  }

  function close({ returnFocus = false } = {}) {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    if (!current) return;
    const trigger = current;
    const panel = panelOf(trigger);
    current = null;
    trigger.setAttribute("aria-expanded", "false");
    top.classList.remove("is-mega-open");
    // If another panel opened meanwhile, settle() has already hidden this one and killed this fade.
    const done = () => {
      panel.hidden = true;
      if (hasGSAP()) gsap.set(panel, { clearProps: "opacity" });
      if (current === null && veil) { veil.hidden = true; if (hasGSAP()) gsap.set(veil, { clearProps: "opacity" }); }
    };
    if (animate()) {
      gsap.killTweensOf([panel, veil]);
      gsap.to(panel, { opacity: 0, duration: 0.2, ease: "none", onComplete: done });
      gsap.to(veil, { opacity: 0, duration: 0.2, ease: "none" });
    } else done();
    if (returnFocus) trigger.focus();
  }

  triggers.forEach((trigger) => {
    // Click / tap: toggles (on touch the first tap opens). Enter and Space fire click on a button.
    trigger.addEventListener("click", () => {
      if (current === trigger && byHover) { byHover = false; return; }   // hover opened it just before the click
      byHover = false;
      if (current === trigger) close();
      else open(trigger, { focus: trigger.matches(":focus-visible") });
    });
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" && current !== trigger) {
        e.preventDefault();
        e.stopPropagation();          // the panel's own arrow handling would move on one more
        open(trigger, { focus: true });
      }
    });
    // Hover intent, mouse only: 120ms to open, 200ms after leaving to close.
    trigger.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(closeTimer);
      clearTimeout(openTimer);
      openTimer = setTimeout(() => { if (current !== trigger) { byHover = true; open(trigger); } }, current ? 0 : 120);
    });
    trigger.addEventListener("pointerleave", (e) => {
      if (e.pointerType !== "mouse") return;
      clearTimeout(openTimer);
    });
  });

  // Leaving the header + panel area closes after 200ms; coming back cancels it.
  const header = $(".site-header", top);
  header.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") clearTimeout(closeTimer); });
  header.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "mouse" || !current) return;
    closeTimer = setTimeout(() => close(), 200);
  });
  // Pointer over another plain nav link (Rituals, Our story, tools) closes the open panel.
  $$(".header-inner a, .header-inner button:not([data-dd-trigger])", top).forEach((el) =>
    el.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse" || !current) return;
      clearTimeout(openTimer);
      closeTimer = setTimeout(() => close(), 200);
    }));

  // Keyboard inside an open panel: arrows move between links, Tab stays inside, Esc closes.
  document.addEventListener("keydown", (e) => {
    if (!current) return;
    const panel = panelOf(current);
    if (e.key === "Escape") {
      e.preventDefault();
      close({ returnFocus: panel.contains(document.activeElement) || document.activeElement === current });
      return;
    }
    const items = [current, ...focusables(panel)];
    const i = items.indexOf(document.activeElement);
    if (i === -1) return;
    if (["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(e.key)) {
      if (i === 0 && (e.key === "ArrowLeft" || e.key === "ArrowRight")) return;   // on the trigger: leave the tab row alone
      e.preventDefault();
      const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
      const list = items.slice(1);
      const j = i === 0 ? (step > 0 ? 0 : list.length - 1) : (i - 1 + step + list.length) % list.length;
      list[j]?.focus();
    } else if (e.key === "Tab") {
      // Focus is trapped while open: the trigger and the panel's links, in a loop.
      e.preventDefault();
      const j = (i + (e.shiftKey ? -1 : 1) + items.length) % items.length;
      items[j].focus();
    }
  });

  // Tap or click outside closes.
  veil?.addEventListener("click", () => close());
  document.addEventListener("pointerdown", (e) => {
    if (current && !top.contains(e.target)) close();
  });
  // Focus leaving the header (e.g. a screen reader moving on) closes.
  top.addEventListener("focusout", (e) => {
    if (current && e.relatedTarget && !top.contains(e.relatedTarget)) close();
  });
  // Wide → narrow: the dropdowns have no place on phones.
  matchMedia("(max-width: 991.98px)").addEventListener("change", (e) => e.matches && close());
}

/* ---------- mobile menu (full-screen offcanvas, accordion groups) ---------- */

function renderMobileGroup(group) {
  const name = group.dataset.mmGroup;
  const body = $("[data-mm-body]", group);
  const { cols, feature } = BUILDERS[name]();
  body.innerHTML = cols.map((c) => `
      <div class="mm-col">
        <p class="t-label dd-title">${esc(c.title)}</p>
        ${c.body}
      </div>`).join("") + (feature ? `<div class="mm-col mm-col--feature">${feature}</div>` : "");
}

function initMobileMenu() {
  const menu = $("#mobileMenu");
  if (!menu) return;

  $$("[data-mm-group]", menu).forEach((group) => {
    const btn = $(".mm-tab", group);
    const panel = $("[data-mm-panel]", group);
    let rendered = false;
    panel.inert = true;
    btn.addEventListener("click", () => {
      const opening = btn.getAttribute("aria-expanded") !== "true";
      if (opening && !rendered) { renderMobileGroup(group); rendered = true; }
      btn.setAttribute("aria-expanded", String(opening));
      group.classList.toggle("is-open", opening);
      panel.inert = !opening;
    });
  });

  menu.addEventListener("show.bs.offcanvas", () => {
    if (!hasGSAP() || reducedMotion()) return;
    gsap.fromTo($$(".mm-tabs > .mm-item, .mm-links .mm-item", menu), { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.04, delay: 0.1, ease: "power3.out" });
  });
  // Links that open the search from inside the menu
  $$("[data-search-open]", menu).forEach((btn) => btn.addEventListener("click", () => {
    window.bootstrap?.Offcanvas.getInstance(menu)?.hide();
  }));
  // Close when switching to desktop width
  matchMedia("(min-width: 992px)").addEventListener("change", (e) => {
    if (e.matches) window.bootstrap?.Offcanvas.getInstance(menu)?.hide();
  });
}

/* ---------- current page ---------- */

function markCurrentNav() {
  const page = location.pathname.split("/").pop() || "index.html";
  $$("[data-nav]").forEach((a) => {
    if (a.getAttribute("href")?.split("?")[0] === page) a.setAttribute("aria-current", "page");
  });
  // The dropdown tabs light up on the pages they lead to.
  const section = { "shop.html": "shop", "product.html": "shop", "brand.html": "brands", "origin.html": "origins" }[page];
  if (section) $(`[data-dd-trigger="${section}"]`)?.classList.add("is-current");
}

/* ---------- footer ---------- */

function renderFooter() {
  const shop = $("[data-footer-shop]");
  if (shop) {
    shop.innerHTML = visibleBrands().map((b) =>
      `<li><a class="link-draw" href="${brandURL(b.id)}">${esc(b.name)}</a></li>`).join("") +
      `<li><a class="link-draw" href="shop.html">Shop all</a></li>`;
  }

  const coords = $("[data-footer-coords]");
  if (coords) {
    // Every live origin, plus the arrival city.
    const ids = unique([...liveBrands().map((b) => b.originId), ARRIVAL_ORIGIN_ID]);
    coords.innerHTML = ids.map((id) => ORIGINS[id]).filter(Boolean).map((o) =>
      `<li><span class="footer-city">${esc(o.name)}</span> <span class="coords">${formatCoords(o.lat, o.lon)}</span></li>`).join("");
  }
}

/* ---------- newsletter forms (footer + home) ---------- */

function initNewsletterForms() {
  $$("form[data-newsletter]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("input[type=email]", form);
      if (!input.checkValidity() || !input.value.trim()) {
        input.setAttribute("aria-invalid", "true");
        input.focus();
        toast("Please enter a valid email address.");
        return;
      }
      input.removeAttribute("aria-invalid");
      // TODO(client): connect to the email platform (Mailchimp, Klaviyo…) at launch.
      form.reset();
      toast("Subscribed. Your first letter arrives next season.");
    });
  });
}

/* ---------- "Notify me" (coming-soon pieces): to the newsletter field ---------- */

function initNotify() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-notify]");
    if (!btn) return;
    e.preventDefault();
    const p = PRODUCTS.find((x) => x.id === btn.dataset.notify);
    const field = $("#footer-email");
    if (!field) return;
    scrollToHash("#newsletter");
    setTimeout(() => field.focus({ preventScroll: true }), reducedMotion() ? 0 : 900);
    toast(`Leave your email and we’ll write when ${p ? (getBrand(p.brand)?.name || p.name) : "it"} arrives.`);
  });
}
