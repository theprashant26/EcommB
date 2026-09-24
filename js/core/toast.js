/* ==========================================================================
   Toasts — bottom-left, black, 3s (§7). One at a time; a new toast replaces
   the current one. Announced politely to screen readers.
   ========================================================================== */

let region, timer;

function ensureRegion() {
  region = region || document.getElementById("toast-region");
  if (!region) {
    region = document.createElement("div");
    region.id = "toast-region";
    region.className = "toast-region";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    document.body.appendChild(region);
  }
  return region;
}

export function toast(message, { duration = 3000 } = {}) {
  const host = ensureRegion();
  clearTimeout(timer);
  host.innerHTML = "";
  const el = document.createElement("p");
  el.className = "toast-msg";
  el.textContent = message;
  host.appendChild(el);
  // next frame so the transition runs
  requestAnimationFrame(() => el.classList.add("is-in"));
  timer = setTimeout(() => {
    el.classList.remove("is-in");
    el.addEventListener("transitionend", () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 600); // fallback when transitions are off
  }, duration);
}
