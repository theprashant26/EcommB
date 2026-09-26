/* ==========================================================================
   Spin sequences (§10) — pre-rendered 360° frames drawn on a <canvas>.
   - One shared cache (url → Promise<ImageBitmap>) so the card hover, the
     pinned "Turn it" section and the PDP viewer never download a frame twice.
   - Frame i = i × 10°, frame 0 faces front.
   - Draws only when the frame index (or canvas size) changes.
   ========================================================================== */

const cache = new Map();

export const frameURL = (path, i) => `${path}${String(i).padStart(3, "0")}.webp`;

/** Decode one frame. createImageBitmap when available, <img>.decode() otherwise. */
export function loadFrame(url) {
  if (!cache.has(url)) {
    const p = (typeof createImageBitmap === "function"
      ? fetch(url).then((r) => {
          if (!r.ok) throw new Error(`${r.status} ${url}`);
          return r.blob();
        }).then((b) => createImageBitmap(b))
      : new Promise((res, rej) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = url;
        }));
    p.catch(() => cache.delete(url)); // allow a retry later
    cache.set(url, p);
  }
  return cache.get(url);
}

/** Resolved bitmap if already decoded, else undefined (sync peek used while drawing). */
const ready = new Map();
function peek(url) { return ready.get(url); }
function track(url) {
  return loadFrame(url).then((bmp) => { ready.set(url, bmp); return bmp; });
}

/** Load every frame of a sequence, `concurrency` at a time. Frame 0 first. */
export async function preloadFrames(path, frames = 36, { concurrency = 6, onProgress } = {}) {
  const queue = [...Array(frames).keys()];
  let done = 0;
  const worker = async () => {
    while (queue.length) {
      const i = queue.shift();
      try { await track(frameURL(path, i)); } catch { /* keep going; drawing falls back to nearest frame */ }
      done += 1;
      onProgress?.(done / frames);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
}

/**
 * createSpin(canvas, { path, frames:36, mode:"scroll"|"drag"|"hover", target, onFrame })
 *   scroll: caller drives it with .progress(p) (0 → 1).
 *   drag:   horizontal drag on the canvas, 1 frame per 12px; arrow keys turn `step` frames
 *           (default 1 = 10°); onDragEnd fires when the pointer lets go.
 *   hover:  pointer x across `target` (default the canvas) maps to frames 0–35.
 */
export function createSpin(canvas, opts = {}) {
  const frames = opts.frames || 36;
  const mode = opts.mode || "scroll";
  const ctx2d = canvas.getContext("2d");
  let path = opts.path;
  let current = 0;       // requested frame
  let drawn = { url: null, w: 0, h: 0 };
  let destroyed = false;
  const waiting = new Set(); // frames requested but not decoded yet

  /* ---- sizing: CSS box × devicePixelRatio (capped at 2) ---- */
  const resize = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (w && h && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w; canvas.height = h;
      drawn.url = null; // force redraw
      draw();
    }
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  /* ---- drawing ---- */
  function nearestLoaded(i) {
    for (let d = 0; d < frames; d += 1) {
      for (const j of [i - d, i + d]) {
        const k = ((j % frames) + frames) % frames;
        const url = frameURL(path, k);
        if (peek(url)) return url;
      }
    }
    return null;
  }

  function draw() {
    if (destroyed || !canvas.width) return;
    const want = frameURL(path, current);
    const url = peek(want) ? want : nearestLoaded(current);
    if (!peek(want) && !waiting.has(want)) {
      waiting.add(want);
      track(want).then(() => { waiting.delete(want); if (frameURL(path, current) === want) draw(); })
        .catch(() => waiting.delete(want));
    }
    if (!url) return;
    if (url === drawn.url && drawn.w === canvas.width && drawn.h === canvas.height) return; // unchanged
    const bmp = peek(url);
    const cw = canvas.width, ch = canvas.height;
    const scale = Math.min(cw / bmp.width, ch / bmp.height); // contain
    const w = bmp.width * scale, h = bmp.height * scale;
    ctx2d.clearRect(0, 0, cw, ch);
    ctx2d.drawImage(bmp, (cw - w) / 2, (ch - h) / 2, w, h);
    drawn = { url, w: cw, h: ch };
  }

  const api = {
    get frame() { return current; },
    get frames() { return frames; },
    setFrame(i) {
      const next = ((Math.round(i) % frames) + frames) % frames;
      if (next !== current) { current = next; opts.onFrame?.(current); }
      draw();
    },
    progress(p) { api.setFrame(Math.min(frames - 1, Math.max(0, p * (frames - 1)))); },
    setPath(nextPath) {
      path = nextPath;
      drawn.url = null;
      draw();
      return track(frameURL(path, current)).then(draw, () => {});
    },
    /** Load the whole sequence (6 at a time). */
    load(onProgress) { return preloadFrames(path, frames, { onProgress }).then(draw); },
    showFirst() { return track(frameURL(path, 0)).then(draw, () => {}); },
    redraw() { drawn.url = null; resize(); draw(); },
    destroy() {
      destroyed = true;
      ro.disconnect();
      cleanup.forEach((fn) => fn());
    },
  };

  /* ---- interaction modes ---- */
  const cleanup = [];
  const on = (el, type, fn, o) => { el.addEventListener(type, fn, o); cleanup.push(() => el.removeEventListener(type, fn, o)); };

  if (mode === "drag") {
    let startX = 0, startFrame = 0, dragging = false;
    canvas.style.touchAction = "pan-y"; // vertical page scroll still works
    on(canvas, "pointerdown", (e) => {
      dragging = true; startX = e.clientX; startFrame = current;
      canvas.setPointerCapture(e.pointerId);
      opts.onDragStart?.();
    });
    on(canvas, "pointermove", (e) => {
      if (!dragging) return;
      api.setFrame(startFrame - (e.clientX - startX) / 12);
    });
    const end = () => { if (dragging) { dragging = false; opts.onDragEnd?.(current); } };
    on(canvas, "pointerup", end);
    on(canvas, "pointercancel", end);
    on(canvas, "keydown", (e) => {
      const step = opts.step || 1;
      if (e.key === "ArrowLeft") { e.preventDefault(); opts.onStep ? opts.onStep(step) : api.setFrame(current + step); }
      if (e.key === "ArrowRight") { e.preventDefault(); opts.onStep ? opts.onStep(-step) : api.setFrame(current - step); }
    });
  }

  if (mode === "hover") {
    const target = opts.target || canvas;
    on(target, "pointermove", (e) => {
      const r = target.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      api.setFrame(x * (frames - 1));
    });
  }

  resize();
  return api;
}
