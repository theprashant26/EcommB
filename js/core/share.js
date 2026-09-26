/* ==========================================================================
   Share (Update 02 §9.3). navigator.share where it exists; otherwise a small
   popover: Copy link ("Link copied"), WhatsApp, Email. Keyboard: Esc closes,
   arrows move between the three, focus returns to the button.
   ========================================================================== */

import { icon, $, $$ } from "./format.js";
import { toast } from "./toast.js";

export function shareButtonHTML() {
  return `
    <div class="share">
      <button type="button" class="share-btn" data-share aria-haspopup="true" aria-expanded="false" aria-controls="sharePop" aria-label="Share">${icon("share-2")}</button>
      <div class="share-pop" id="sharePop" role="menu" aria-label="Share this product" hidden data-share-pop></div>
    </div>`;
}

export function initShare(root, { title, text, url = location.href }) {
  const btn = $("[data-share]", root);
  const pop = $("[data-share-pop]", root);
  if (!btn || !pop) return;
  const msg = `${title} — ${url}`;
  pop.innerHTML = `
    <button type="button" role="menuitem" class="share-item" data-share-copy>${icon("link")}<span>Copy link</span></button>
    <a role="menuitem" class="share-item" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${icon("whatsapp", "icon--solid")}<span>WhatsApp</span></a>
    <a role="menuitem" class="share-item" href="mailto:?subject=${encodeURIComponent(title)}&amp;body=${encodeURIComponent(`${text}\n\n${url}`)}">${icon("mail")}<span>Email</span></a>`;
  const items = () => $$("[role=menuitem]", pop);

  const open = () => {
    pop.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    items()[0].focus();
  };
  const close = (focus = true) => {
    if (pop.hidden) return;
    pop.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    if (focus) btn.focus();
  };

  btn.addEventListener("click", async () => {
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); } catch { /* dismissed */ }
      return;
    }
    if (pop.hidden) open(); else close();
  });
  $("[data-share-copy]", pop).addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      ta.remove();
    }
    toast("Link copied");
    close();
  });
  pop.addEventListener("click", (e) => { if (e.target.closest("a")) close(false); });
  pop.addEventListener("keydown", (e) => {
    const list = items();
    const i = list.indexOf(document.activeElement);
    if (e.key === "Escape") { e.preventDefault(); close(); }
    if (e.key === "ArrowDown") { e.preventDefault(); list[(i + 1) % list.length].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
    if (e.key === "Tab") close(false);
  });
  document.addEventListener("pointerdown", (e) => { if (!pop.hidden && !e.target.closest(".share")) close(false); });
}

