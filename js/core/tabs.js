/* ==========================================================================
   Tabs (Update 02 §9.4) — WAI-ARIA tabs: ←/→ (and Home/End) move between tabs,
   Enter/Space or click selects. The active underline glides to the new tab
   (GSAP Flip); the panels fade.
   Markup: [data-tabs] > [role=tablist] > [role=tab][aria-controls] … and the panels.
   ========================================================================== */

import { $, $$, hasGSAP, reducedMotion } from "./format.js";
import { loadPlugin, whenIdle } from "./motion.js";

export function initTabs(root) {
  const tabs = $$("[role=tab]", root);
  const bar = $("[data-tab-bar]", root);
  if (!tabs.length) return;
  if (bar && !reducedMotion()) whenIdle(() => hasGSAP() && loadPlugin("Flip").catch(() => {}));   // the underline's glide (Update 04)

  function select(tab, { focus = false } = {}) {
    const prev = tabs.find((t) => t.getAttribute("aria-selected") === "true");
    if (prev === tab) { if (focus) tab.focus(); return; }
    const flip = bar && hasGSAP() && window.Flip && !reducedMotion() ? Flip.getState(bar) : null;
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
    if (bar) tab.appendChild(bar);                 // the underline lives in the active tab
    if (flip) Flip.from(flip, { duration: 0.45, ease: "power3.inOut" });
    const panel = document.getElementById(tab.getAttribute("aria-controls"));
    if (panel && hasGSAP() && !reducedMotion()) gsap.fromTo(panel, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" });
    if (focus) tab.focus();
  }

  tabs.forEach((t) => t.addEventListener("click", () => select(t)));
  $("[role=tablist]", root).addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    select(tabs[(to + tabs.length) % tabs.length], { focus: true });
  });
}
