/* ==========================================================================
   3D map (§8.4, §10) — pure CSS 3D + GSAP, reused by the origin and brand
   pages. Builds, inside any [data-map] stage:
     .map-plane (preserve-3d)
       ├ map-dots.png
       ├ routes.svg, inlined (dotted routes, revealed through a solid mask
       │   path that DrawSVG draws, so the dots stay dots)
       └ HTML pins at pins.json percentages, each with an upright billboard
         label (counter-rotated by the plane's current tilt)
   On scroll only transforms and two CSS variables change — no layout reads.
   ========================================================================== */

import { formatCoords, esc } from "./format.js";

const MAP_W = 2400, MAP_H = 1517;
let uid = 0;
let assetsPromise;

/** routes.svg + pins.json, fetched once per page (tiny: ~1.7 KB). */
function loadAssets() {
  assetsPromise ||= Promise.all([
    fetch("assets/map/routes.svg").then((r) => r.text()),
    fetch("assets/map/pins.json").then((r) => r.json()),
  ]);
  return assetsPromise;
}

/**
 * @param {HTMLElement} stage  element with perspective (CSS class .map-stage)
 * @param {{routes?:string[], pins?:string[]}} opts  e.g. routes:["paris","leh"], pins:["paris","delhi","leh"]
 */
export async function createMap3d(stage, { routes = ["paris", "leh"], pins = ["paris", "delhi", "leh"], focus = null } = {}) {
  const [svgText, pinData] = await loadAssets();
  const id = ++uid;
  const proj = pinData._projection;

  /* ---- plane ---- */
  const plane = document.createElement("div");
  plane.className = "map-plane";
  plane.innerHTML = `
    <img class="map-dots" src="assets/map/map-dots.png" alt="" width="${MAP_W}" height="${MAP_H}" loading="lazy" decoding="async">
    ${svgText}
    <div class="map-pins"></div>`;
  stage.appendChild(plane);

  const svg = plane.querySelector("svg");
  svg.classList.add("map-routes");
  svg.setAttribute("aria-hidden", "true");
  svg.removeAttribute("role");
  svg.setAttribute("preserveAspectRatio", "none");

  /* ---- routes: dotted path shown through a solid mask path ---- */
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  svg.prepend(defs);
  const routeEls = {};
  svg.querySelectorAll(".route").forEach((path) => {
    const key = path.id.replace("route-", "");
    if (!routes.includes(key)) { path.remove(); return; }
    const maskId = `map${id}-mask-${key}`;
    const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    mask.setAttribute("id", maskId);
    // userSpaceOnUse: a near-vertical route has an almost zero-width bbox
    mask.setAttribute("maskUnits", "userSpaceOnUse");
    mask.setAttribute("x", 0); mask.setAttribute("y", 0);
    mask.setAttribute("width", MAP_W); mask.setAttribute("height", MAP_H);
    const solid = document.createElementNS("http://www.w3.org/2000/svg", "path");
    solid.setAttribute("d", path.getAttribute("d"));
    solid.setAttribute("fill", "none");
    solid.setAttribute("stroke", "#fff");
    solid.setAttribute("stroke-width", "24"); // wider than the visible route
    solid.setAttribute("stroke-linecap", "round");
    mask.appendChild(solid);
    defs.appendChild(mask);
    path.setAttribute("mask", `url(#${maskId})`);
    path.removeAttribute("id"); // keep ids unique if the map appears twice
    routeEls[key] = { path, mask: solid };
  });
  // The SVG pins are replaced by HTML pins that can drop in 3D.
  svg.querySelectorAll(".pin").forEach((g) => g.remove());

  /* ---- HTML pins + billboard labels ---- */
  const pinsLayer = plane.querySelector(".map-pins");
  const pinEls = {};
  pins.forEach((key) => {
    const d = pinData[key];
    if (!d) return;
    const el = document.createElement("div");
    el.className = "map-pin";
    el.dataset.pin = key;
    el.style.left = `${d.x_pct}%`;
    el.style.top = `${d.y_pct}%`;
    el.innerHTML = `
      <span class="map-pin-dot"><span class="map-pin-pulse"></span></span>
      <span class="map-label">
        <span class="map-label-city">${esc(d.label)}</span>
        <span class="coords">${formatCoords(d.lat, d.lon)}</span>
      </span>`;
    pinsLayer.appendChild(el);
    pinEls[key] = el;
  });

  /* ---- tilt state → CSS vars read by the labels ---- */
  const sync = () => {
    plane.style.setProperty("--rx", gsap.getProperty(plane, "rotationX"));
    plane.style.setProperty("--rz", gsap.getProperty(plane, "rotation"));
  };

  /* Optional focus: zoom around a point of the map (percentages) and bring it to the
     centre, e.g. India for the Leh → New Delhi route. Pins and labels are counter-scaled
     (--lz) so they keep their size. */
  const zoom = focus?.zoom || 1;
  if (focus) {
    gsap.set(plane, {
      transformOrigin: `${focus.x}% ${focus.y}%`,
      xPercent: 50 - focus.x, yPercent: 50 - focus.y,
    });
    plane.style.setProperty("--lz", (1 / zoom).toFixed(4));
  }

  const api = {
    plane, pins: pinEls, routes: routeEls,

    /**
     * Flat, zoomed start → tilted surface → pins drop → routes draw.
     * Pass `tl` to fill a timeline that a ScrollTrigger already drives (so the
     * pin can be created in page order before the map files have loaded).
     */
    timeline({ tilt = 52, rotZ = -6, scaleFrom = 1.12, tl: target } = {}) {
      const pinList = Object.values(pinEls);
      // Fade the pin's children, never the pin: opacity on a preserve-3d
      // element would flatten it and break the billboard label.
      const faders = (el) => el.querySelectorAll(".map-pin-dot, .map-label");
      gsap.set(pinList, { z: 120 });
      pinList.forEach((el) => gsap.set(faders(el), { opacity: 0 }));
      Object.values(routeEls).forEach((r) => gsap.set(r.mask, { drawSVG: "0%" }));
      gsap.set(plane, { rotationX: 0, rotation: 0, scale: scaleFrom * zoom });

      const tl = target || gsap.timeline();
      tl.eventCallback("onUpdate", sync);
      tl.to(plane, { rotationX: tilt, rotation: rotZ, scale: zoom, duration: 1.2, ease: "power2.inOut" }, 0);

      const drop = (key) => pinEls[key] && tl
        .to(pinEls[key], { z: 0, duration: 0.3, ease: "power4.out" })
        .to(faders(pinEls[key]), { opacity: 1, duration: 0.12 }, "<");
      const destination = "delhi";
      let destinationDropped = false;
      routes.forEach((key) => {
        drop(key);
        if (routeEls[key]) tl.to(routeEls[key].mask, { drawSVG: "100%", duration: key === "leh" ? 0.6 : 1, ease: "none" });
        if (!destinationDropped) { drop(destination); destinationDropped = true; }
        tl.addLabel(`${key}-done`);
      });
      tl.to({}, { duration: 0.4 }); // a beat of rest at the end of the pin
      return tl;
    },

    /** Final state without motion (reduced motion). */
    finalState({ tilt = 0, rotZ = 0 } = {}) {
      gsap.set(plane, { rotationX: tilt, rotation: rotZ, scale: zoom });
      gsap.set(Object.values(pinEls), { z: 0 });
      gsap.set(plane.querySelectorAll(".map-pin-dot, .map-label"), { opacity: 1 });
      Object.values(routeEls).forEach((r) => gsap.set(r.mask, { drawSVG: "100%" }));
      sync();
    },

    /** Soft looping pulse rings. Returns the tween so a context can revert it. */
    pulse(keys = Object.keys(pinEls)) {
      const rings = keys.map((k) => pinEls[k]?.querySelector(".map-pin-pulse")).filter(Boolean);
      return gsap.fromTo(rings, { scale: 0.6, opacity: 0.55 },
        { scale: 2.4, opacity: 0, duration: 2.2, ease: "power1.out", repeat: -1, stagger: 0.5 });
    },

    /**
     * Inverse of the plane's 3D transform: screen point → { lat, lon } on the
     * map surface, or null when the pointer is off the plane.
     * Plane transform (GSAP order) = rotateZ(φ) · rotateX(θ) · scale(s), with the
     * stage's perspective P centred on the plane.
     */
    latLonAt(clientX, clientY) {
      const P = parseFloat(getComputedStyle(stage).perspective) || 1600;
      const θ = (gsap.getProperty(plane, "rotationX") * Math.PI) / 180;
      const φ = (gsap.getProperty(plane, "rotation") * Math.PI) / 180;
      const s = gsap.getProperty(plane, "scale");
      const sr = stage.getBoundingClientRect();
      const cx = sr.left + plane.offsetLeft + plane.offsetWidth / 2;
      const cy = sr.top + plane.offsetTop + plane.offsetHeight / 2;
      const X = clientX - cx, Y = clientY - cy;
      // undo rotateZ on the projected point
      const Xr = X * Math.cos(φ) + Y * Math.sin(φ);
      const Yr = -X * Math.sin(φ) + Y * Math.cos(φ);
      const v = (Yr * P) / (s * (P * Math.cos(θ) + Yr * Math.sin(θ)));
      const u = (Xr * (P - s * v * Math.sin(θ))) / (s * P);
      const px = (u / plane.offsetWidth + 0.5) * MAP_W;
      const py = (v / plane.offsetHeight + 0.5) * MAP_H;
      if (px < 0 || px > MAP_W || py < 0 || py > MAP_H) return null;
      const lon = px / (Math.cos((35 * Math.PI) / 180) * proj.S_px_per_deg) + proj.lon[0];
      const lat = proj.lat[1] - py / proj.S_px_per_deg;
      return { lat, lon };
    },
  };
  sync();
  return api;
}
