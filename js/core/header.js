/* ==========================================================================
   Site chrome (§7): announcement bar, header (hide on scroll down / show on
   scroll up), Shop mega menu, mobile menu, footer and newsletter forms.
   The markup lives in the PARTIAL blocks of every page; everything that
   lists brands or products is rendered here from the data files.
   ========================================================================== */

import { CONFIG } from "../data/config.js";
import { visibleBrands, liveBrands, brandURL } from "../data/brands.js";
import { productsByBrand, newestProduct, productURL } from "../data/products.js";
import { ORIGINS, ARRIVAL_ORIGIN_ID } from "../data/origins.js";
import { esc, formatCoords, $, $$, hasGSAP, reducedMotion } from "./format.js";
import { toast } from "./toast.js";

const ANNOUNCE_KEY = "jiai-announce-v1";

export function initHeader() {
  initAnnouncement();
  initScrollState();
  initMega();          // columns render on first open
  initMobileMenu();    // brand list renders on first show
  markCurrentNav();
  whenNear(".site-footer", renderFooter);
  initNewsletterForms();

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

/* ---------- brand helpers for menus ---------- */

/** Coordinates line for a brand: its own coords, else its origin's, else its tagline. */
function brandMeta(brand) {
  if (brand.coords) return { text: brand.coords, coords: true };
  const o = brand.originId && ORIGINS[brand.originId];
  if (o) return { text: formatCoords(o.lat, o.lon), coords: true };
  return { text: brand.line || brand.category || "", coords: false };
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

/** Other modules (e.g. the bag's arc animation) can bring the header back. */
export function revealHeader() {
  $("#site-top")?.classList.remove("is-hidden");
}

/* ---------- Shop mega menu ---------- */

function renderMega() {
  const cols = $("[data-mega-columns]");
  const feature = $("[data-mega-feature]");
  if (!cols) return;

  const brands = visibleBrands();
  cols.style.setProperty("--cols", brands.length);
  cols.innerHTML = brands.map((b) => {
    const meta = brandMeta(b);
    const items = productsByBrand(b.id);
    const list = items.length
      ? `<ul class="mega-list">${items.map((p) =>
          `<li><a class="link-draw" href="${productURL(p.id)}">${esc(p.comingSoon ? p.fullName : p.name)}</a></li>`).join("")}</ul>`
      : `<p class="mega-soon">${esc(b.category || "Coming to the house")}</p>`;
    return `
      <div class="mega-col">
        <a class="mega-brand" href="${brandURL(b.id)}">${esc(b.name)}</a>
        <p class="${meta.coords ? "coords" : "mega-line"}">${esc(meta.text)}</p>
        ${list}
      </div>`;
  }).join("");

  if (feature) {
    const p = newestProduct();
    feature.innerHTML = `
      <a class="mega-feature-link" href="${productURL(p.id)}">
        <span class="mega-feature-img">
          <img src="${esc(p.images.hero)}" alt="${esc(p.fullName)}" width="557" height="1143" loading="lazy" decoding="async">
        </span>
        <span class="mega-feature-cap">Newest in the house</span>
        <span class="mega-feature-name">${esc(p.fullName)}</span>
      </a>`;
  }
}

function initMega() {
  const top = $("#site-top");
  const trigger = $("[data-mega-trigger]");
  const clip = $("[data-mega-clip]");
  const sheet = $("#mega-shop");
  const scrim = $("[data-mega-scrim]");
  if (!trigger || !clip || !sheet) return;

  let open = false;
  let closeTimer, openTimer;
  // Decided per open/close: on async pages GSAP may arrive after this runs.
  const animate = () => hasGSAP() && !reducedMotion();

  let rendered = false;
  const show = ({ focus = false } = {}) => {
    clearTimeout(closeTimer);
    if (open) return;
    if (!rendered) { renderMega(); rendered = true; }
    open = true;
    clip.hidden = false;
    if (scrim) scrim.hidden = false;
    top.classList.add("is-mega-open");
    trigger.setAttribute("aria-expanded", "true");
    if (animate()) {
      gsap.killTweensOf([sheet, scrim]);
      gsap.fromTo(sheet, { yPercent: -100 }, { yPercent: 0, duration: 0.55, ease: "power4.out" });
      gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "none" });
    }
    if (focus) $("a", sheet)?.focus();
  };

  const hide = ({ returnFocus = false } = {}) => {
    clearTimeout(openTimer);
    if (!open) return;
    open = false;
    trigger.setAttribute("aria-expanded", "false");
    top.classList.remove("is-mega-open");
    const done = () => { if (!open) { clip.hidden = true; if (scrim) scrim.hidden = true; } };
    if (animate()) {
      gsap.killTweensOf([sheet, scrim]);
      gsap.to(sheet, { yPercent: -100, duration: 0.4, ease: "power3.in", onComplete: done });
      gsap.to(scrim, { opacity: 0, duration: 0.3, ease: "none" });
    } else done();
    if (returnFocus) trigger.focus();
  };

  // Click / keyboard
  trigger.addEventListener("click", () => (open ? hide() : show({ focus: trigger.matches(":focus-visible") })));
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); show({ focus: true }); }
  });

  // Hover intent (mouse only)
  const header = $(".site-header", top);
  trigger.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(closeTimer);
    openTimer = setTimeout(() => show(), 90);
  });
  trigger.addEventListener("pointerleave", () => clearTimeout(openTimer));
  [header, clip].forEach((el) => {
    el.addEventListener("pointerenter", () => clearTimeout(closeTimer));
    el.addEventListener("pointerleave", (e) => {
      if (e.pointerType !== "mouse") return;
      closeTimer = setTimeout(() => hide(), 200);
    });
  });

  // Close on Esc, scrim click, or when focus leaves the header
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) hide({ returnFocus: sheet.contains(document.activeElement) });
  });
  scrim?.addEventListener("click", () => hide());
  top.addEventListener("focusout", (e) => {
    if (open && e.relatedTarget && !top.contains(e.relatedTarget)) hide();
  });
  // Wide → narrow: the desktop menu has no place on phones
  matchMedia("(max-width: 991.98px)").addEventListener("change", (e) => e.matches && hide());
}

/* ---------- mobile menu (full-screen offcanvas) ---------- */

function renderMobileMenu() {
  const list = $("[data-mobile-brands]");
  if (!list) return;
  list.innerHTML = visibleBrands().map((b) => {
    const meta = brandMeta(b);
    return `
      <li class="mm-item">
        <a class="mm-brand" href="${brandURL(b.id)}">${esc(b.name)}</a>
        <span class="${meta.coords ? "coords" : "mm-line"}">${esc(meta.text)}</span>
      </li>`;
  }).join("");
}

function initMobileMenu() {
  const menu = $("#mobileMenu");
  if (!menu) return;
  let rendered = false;
  menu.addEventListener("show.bs.offcanvas", () => {
    if (!rendered) { renderMobileMenu(); rendered = true; }
    if (!hasGSAP() || reducedMotion()) return;
    gsap.fromTo($$(".mm-item", menu), { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, delay: 0.1, ease: "power4.out" });
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
    const ids = [...new Set([...liveBrands().map((b) => b.originId).filter(Boolean), ARRIVAL_ORIGIN_ID])];
    coords.innerHTML = ids.map((id) => ORIGINS[id]).filter(Boolean).map((o) =>
      `<li><span class="footer-city">${esc(o.name)}</span> <span class="coords">${formatCoords(o.lat, o.lon)}</span></li>`).join("");
  }
}

/* ---------- newsletter forms (footer + home §8.8) ---------- */

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
