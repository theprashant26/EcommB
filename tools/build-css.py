"""
Update 04 (speed): the site's CSS, built.

1. css/site.min.css = css/fonts.css + Bootstrap 5.3.8 (trimmed by PurgeCSS to the classes the
   site uses) + css/main.css, minified by esbuild. css/main.css and css/fonts.css stay the sources.
2. Every page's <head> gets one generated block (between the STYLES markers): the jsDelivr
   preconnect (GSAP), the two first-screen font preloads, the page's critical CSS inline, and
   css/site.min.css loaded without blocking the first paint (preload + onload, <noscript> fallback).
3. Critical CSS: each page is opened in Chrome at 390 and 1440 px; every rule of site.min.css whose
   selector matches something on the first screen (or inside it, hidden) is kept, with the @media
   and @keyframes it needs, then minified and inlined.

    python tools/build-css.py              # everything
    python tools/build-css.py --no-critical

Dev tool only (not needed on the server). Needs Node (npx, or NODE_MODULES=<dir with purgecss and
esbuild installed> and NODE=<node binary>) and Python Playwright with Chrome. Run it after any
change to css/main.css, css/fonts.css or a page's first screen, then commit the output.
"""
import http.server
import os
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import urllib.request
from functools import partial
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS = ROOT / "css"
BOOTSTRAP_URL = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
BOOTSTRAP = CSS / "vendor" / "bootstrap-5.3.8.min.css"
PAGES = ["index.html", "shop.html", "product.html", "brand.html", "origin.html", "about.html",
         "rituals.html", "wishlist.html", "combos.html"]
# URLs whose first screens make up each page's critical CSS (their union).
SAMPLES = {
    "index.html": ["index.html"],
    "shop.html": ["shop.html"],
    "product.html": ["product.html?id=one-origin-body-lotion", "product.html?id=combo-one-origin-duo",
                     "product.html?id=larrive-body-spray", "product.html?id=perfume-no2"],
    "brand.html": ["brand.html?b=larrive", "brand.html?b=one-origin", "brand.html?b=jiai-no2"],
    "origin.html": ["origin.html"],
    "about.html": ["about.html"],
    "rituals.html": ["rituals.html"],
    "wishlist.html": ["wishlist.html", "wishlist.html#with-items"],
    "combos.html": ["combos.html"],
}
FONT_PRELOADS = ["assets/fonts/cormorant-garamond-latin.woff2", "assets/fonts/manrope-latin.woff2"]
STYLES = re.compile(r"<!-- STYLES START.*?<!-- STYLES END -->", re.S)
# The hand-written head from before Update 04 (replaced once by the generated block).
LEGACY = re.compile(r'<link rel="preconnect" href="https://fonts\.googleapis\.com">.*?<link rel="stylesheet" href="css/main\.css">', re.S)
SAFELIST = {
    "standard": ["show", "showing", "hiding", "fade", "collapse", "collapsing", "was-validated",
                 "offcanvas-backdrop", "modal-backdrop", "modal-open", "modal-static"],
    "greedy": [r"^offcanvas", r"^modal", r"^btn-close"],
}


def node_tool(pkg, bin_rel, args):
    mods = os.environ.get("NODE_MODULES")
    if mods:
        cmd = [os.environ.get("NODE", "node"), str(Path(mods) / pkg / bin_rel), *args]
    else:
        npx = shutil.which("npx") or shutil.which("npx.cmd")
        if not npx:
            sys.exit("Node is needed (npx), or set NODE_MODULES and NODE")
        cmd = [npx, "--yes", {"purgecss": "purgecss@6", "esbuild": "esbuild@0.25"}[pkg], *args]
    subprocess.run(cmd, check=True, cwd=ROOT)


def minify(src_text, suffix=".css"):
    with tempfile.TemporaryDirectory() as d:
        src, out = Path(d) / f"in{suffix}", Path(d) / f"out{suffix}"
        src.write_text(src_text, encoding="utf-8")
        node_tool("esbuild", "bin/esbuild", [str(src), "--minify", "--log-level=warning", f"--outfile={out}"])
        return out.read_text(encoding="utf-8").strip()


def build_site_css():
    if not BOOTSTRAP.exists():
        BOOTSTRAP.parent.mkdir(parents=True, exist_ok=True)
        BOOTSTRAP.write_bytes(urllib.request.urlopen(BOOTSTRAP_URL).read())
    with tempfile.TemporaryDirectory() as d:
        conf = Path(d) / "purgecss.config.cjs"
        out = Path(d) / "out"
        greedy = ", ".join(f"/{g}/" for g in SAFELIST["greedy"])
        conf.write_text(
            "module.exports = { content: ['*.html', 'js/**/*.js'], css: [" + repr(BOOTSTRAP.relative_to(ROOT).as_posix()) + "],"
            f" safelist: {{ standard: {SAFELIST['standard']!r}, greedy: [{greedy}] }}, output: {repr(str(out).replace(chr(92), '/'))} }};",
            encoding="utf-8")
        (out / BOOTSTRAP.relative_to(ROOT).parent).mkdir(parents=True)   # PurgeCSS writes to out/<css path>
        node_tool("purgecss", "bin/purgecss.js", ["--config", str(conf)])
        purged = next(out.rglob("*.css")).read_text(encoding="utf-8")
    # Bootstrap's own sourceMappingURL comment points at a file that isn't here.
    purged = re.sub(r"/\*# sourceMappingURL=.*?\*/", "", purged)
    src = "\n".join([(CSS / "fonts.css").read_text(encoding="utf-8"), purged, (CSS / "main.css").read_text(encoding="utf-8")])
    css = minify(src)
    (CSS / "site.min.css").write_text(css + "\n", encoding="utf-8", newline="\n")
    print(f"css/site.min.css: {len(css) / 1024:.1f} KB (Bootstrap {len(BOOTSTRAP.read_text(encoding='utf-8')) / 1024:.0f} → {len(purged) / 1024:.0f} KB)")


def head_block(critical=""):
    fonts = "\n".join(f'<link rel="preload" as="font" type="font/woff2" href="{f}" crossorigin>' for f in FONT_PRELOADS)
    return ("<!-- STYLES START (generated by tools/build-css.py) -->\n"
            '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>\n'
            f"{fonts}\n"
            f'<style id="critical-css">{critical}</style>\n'
            '<link rel="preload" as="style" href="css/site.min.css" onload="this.onload=null;this.rel=\'stylesheet\'">\n'
            '<noscript><link rel="stylesheet" href="css/site.min.css"></noscript>\n'
            "<!-- STYLES END -->")


def write_heads(critical=None):
    for page in PAGES:
        path = ROOT / page
        html = path.read_text(encoding="utf-8")
        block = head_block((critical or {}).get(page, current_critical(html)))
        if STYLES.search(html):
            new = STYLES.sub(lambda _m: block, html)
        elif LEGACY.search(html):
            new = LEGACY.sub(lambda _m: block, html)
        else:
            sys.exit(f"{page}: no STYLES block and no legacy stylesheet links")
        if new != html:
            path.write_text(new, encoding="utf-8", newline="\n")
            print(f"head: {page}")


def current_critical(html):
    m = re.search(r'<style id="critical-css">(.*?)</style>', html, re.S)
    return m.group(1) if m else ""


# ---------- critical CSS ----------

PICK = r"""({ vh }) => {
  const sheet = [...document.styleSheets].find((s) => (s.href || "").includes("css/site.min.css"));
  if (!sheet) return null;
  const USER = /:(hover|focus-visible|focus-within|focus|active|visited|target|checked|disabled|enabled|placeholder-shown|autofill|-webkit-autofill|invalid|valid|user-invalid|indeterminate|popover-open|open|modal|fullscreen)(?![\w-])/g;
  const PSEUDO = /::?(before|after|placeholder|selection|marker|backdrop|first-line|first-letter|file-selector-button|-webkit-[\w-]+|-moz-[\w-]+|-ms-[\w-]+)(\([^)]*\))?/g;
  const seen = new Map();
  // Only what is seen on the first screen, plus the outermost element of anything hidden there
  // (its hiding rule must be inline too); what's inside a hidden element needs no style yet.
  const shown = (e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
  const onFirstScreen = (el) => {
    if (seen.has(el)) return seen.get(el);
    let ok;
    const parent = el.parentElement;
    if (!shown(el)) ok = !parent || (shown(parent) && onFirstScreen(parent));
    else ok = el.getBoundingClientRect().top < vh;   // includes things parked above the screen (the skip link)
    seen.set(el, ok);
    return ok;
  };
  const matches = (selectorText) => selectorText.split(/,(?![^(]*\))/).some((sel) => {
    let s = sel.replace(PSEUDO, "").replace(USER, "").trim();
    if (!s || /[>+~]$/.test(s)) s += "*";
    try { return [...document.querySelectorAll(s)].some(onFirstScreen); } catch (e) { return true; }
  });
  const keep = new Set();
  const walk = (rules) => [...rules].forEach((r) => {
    if (r.type === CSSRule.STYLE_RULE) { if (matches(r.selectorText)) keep.add(r.selectorText); }
    else if (r.cssRules && r.type !== CSSRule.KEYFRAMES_RULE) walk(r.cssRules);
  });
  walk(sheet.cssRules);
  return [...keep];
}"""


# Rules that hold space for content JS has not drawn yet: they matter before the first render,
# which the extraction (run after it) never sees, so they are always inlined.
RESERVE = re.compile(r":empty|pdp--pending|data-pending|is-skel")


def norm_selector(sel):
    """One spelling for a selector, whether the browser's (CSSOM) or esbuild's (the file's)."""
    return re.sub(r"\s+", "", sel).replace("::", ":").replace('"', "").replace("'", "").lower()


def parse_css(text):
    """Minified CSS → nested [(prelude, body or children)]: a small brace-aware reader (quotes respected)."""
    def block(i):
        out, start, q = [], i, None
        while i < len(text):
            c = text[i]
            if q:
                if c == "\\": i += 1
                elif c == q: q = None
            elif c in "\"'": q = c
            elif c == "{":
                prelude = text[start:i].strip()
                if prelude.startswith(("@media", "@supports", "@container", "@layer")):
                    children, i = block(i + 1)
                    out.append((prelude, children))
                else:
                    j, d, q2 = i + 1, 1, None
                    while d:
                        cj = text[j]
                        if q2:
                            if cj == "\\": j += 1
                            elif cj == q2: q2 = None
                        elif cj in "\"'": q2 = cj
                        elif cj == "{": d += 1
                        elif cj == "}": d -= 1
                        j += 1
                    out.append((prelude, text[i + 1:j - 1]))
                    i = j - 1
                start = i + 1
            elif c == "}":
                return out, i
            elif c == ";" and text[start:i].strip().startswith("@"):
                start = i + 1          # @charset / @import / @layer a,b;
            i += 1
        return out, i
    return block(0)[0]


def critical_css(site_css, selectors):
    """The rules of site.min.css whose selectors matched, in their @media, plus fonts and used keyframes."""
    want = {norm_selector(x) for x in selectors}
    keyframes = {}

    def pick(nodes):
        out = []
        for prelude, body in nodes:
            if isinstance(body, list):
                inner = pick(body)
                if inner:
                    out.append(f"{prelude}{{{inner}}}")
            elif prelude.startswith(("@font-face", "@view-transition")):   # fonts; the cross-page transition opt-in
                out.append(f"{prelude}{{{body}}}")
            elif re.match(r"@(-webkit-)?keyframes", prelude):
                keyframes[prelude.split()[-1]] = f"{prelude}{{{body}}}"
            elif not prelude.startswith("@") and (norm_selector(prelude) in want or RESERVE.search(prelude)):
                out.append(f"{prelude}{{{body}}}")
        return "".join(out)

    css = pick(parse_css(site_css))
    # Keyframes named in a kept rule (an animation shorthand with var() has no parsed name, so read the text).
    used = [k for k in keyframes if re.search(rf"[\s:,]{re.escape(k)}(?=[\s,;}}!])", css)]
    return css + "".join(keyframes[k] for k in used)


WISH_ITEMS = '["one-origin-face-cleanser","combo-one-origin-duo","larrive-body-spray"]'


def serve():
    handler = partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    handler.log_message = lambda *a: None
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"


def extract_critical():
    from playwright.sync_api import sync_playwright
    httpd, base = serve()
    result = {}
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(channel="chrome")
            for page_name, urls in SAMPLES.items():
                keep = set()
                for w, h, mobile in [(390, 844, True), (1440, 900, False)]:
                    ctx = browser.new_context(viewport={"width": w, "height": h}, is_mobile=mobile, has_touch=mobile)
                    pg = ctx.new_page()
                    for url in urls:
                        items = url.endswith("#with-items")
                        pg.goto(base + url.replace("#with-items", ""), wait_until="domcontentloaded")
                        pg.evaluate(f"localStorage.setItem('jiai-wishlist-v1', {repr(WISH_ITEMS) if items else repr('[]')})")
                        pg.reload(wait_until="networkidle")
                        pg.wait_for_function("[...document.styleSheets].some((s) => (s.href || '').includes('css/site.min.css'))")
                        pg.wait_for_timeout(1200)
                        got = pg.evaluate(PICK, {"vh": h})
                        keep |= set(got or [])
                    ctx.close()
                css = critical_css((CSS / "site.min.css").read_text(encoding="utf-8"), keep)
                # The inline copy lives in the page at the site root: its url()s are relative to the page, not css/.
                css = css.replace('url("../', 'url("').replace("url(../", "url(")
                result[page_name] = minify(css)
                print(f"critical: {page_name} {len(result[page_name]) / 1024:.1f} KB")
            browser.close()
    finally:
        httpd.shutdown()
    return result


# ---------- shop: the first cards in the HTML ----------

SHOP_FIRST = re.compile(r"<!-- SHOP FIRST START -->.*?<!-- SHOP FIRST END -->", re.S)
FIRST_CARDS = r"""async (dist) => {
  // Exactly what js/pages/shop.js draws first (same modules, same arguments), for the first row on a phone.
  const url = (p) => new URL(`${dist}js/${p}`, location.href).href;
  const { cardHTML } = await import(url("core/cards.js"));
  const { PRODUCTS, isCombo } = await import(url("data/products.js"));
  const { visibleBrands } = await import(url("data/brands.js"));
  const ids = new Set(visibleBrands().map((b) => b.id));
  const products = PRODUCTS.filter((p) => ids.has(p.brand) || isCombo(p));
  return products.slice(0, 2).map((p, i) => cardHTML(p, { headingLevel: 2, eager: i === 0 ? "high" : i < 4 })
    .replace('class="cp"', `class="cp" data-flip-id="p-${p.id}"`)).join("");
}"""


def write_shop_first():
    """shop.html: its first two cards in the HTML (the page's LCP image paints before any script runs)."""
    from playwright.sync_api import sync_playwright
    httpd, base = serve()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(channel="chrome")
            pg = browser.new_page()
            pg.goto(base + "shop.html", wait_until="networkidle")
            dist = "dist/" if (ROOT / "dist" / "js").exists() else ""
            cards = pg.evaluate(FIRST_CARDS, dist)
            browser.close()
    finally:
        httpd.shutdown()
    cards = cards.replace('<img class="cp-img" ', '<img class="cp-img" data-lcp ', 1)   # PAGE BOOT waits for this image
    path = ROOT / "shop.html"
    html = path.read_text(encoding="utf-8")
    new = SHOP_FIRST.sub(lambda _m: f"<!-- SHOP FIRST START -->{cards}<!-- SHOP FIRST END -->", html)
    if new != html:
        path.write_text(new, encoding="utf-8", newline="\n")
        print("shop.html: first cards")


def main():
    build_site_css()
    write_heads()
    if "--no-critical" not in sys.argv:
        write_shop_first()
        write_heads(extract_critical())


if __name__ == "__main__":
    main()
