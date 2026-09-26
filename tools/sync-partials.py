"""
1. Fill the logo slots (index.html partials and page-specific ones) from the client's files in assets/brand/
   (Update 01: the logo is always the client's file, never retyped).
2. Copy the shared PARTIAL blocks (header, footer, bag, search) from index.html
   into every other page, so the chrome stays byte-identical across the site.
4. product.html: a tiny head script that preloads the product's first image
   (from js/data/products.js), so the LCP image is fetched before the page JS runs.
3. Write each page's <link rel="modulepreload"> list from its real import graph
   (between the MODULEPRELOAD markers in <head>), so the browser fetches every
   module at once instead of one import level per round trip.

    python tools/sync-partials.py          # fill logos + sync
    python tools/sync-partials.py --check  # exit 1 if any page has drifted

Logo slots look like:
    <!-- LOGO:inline jiai-wordmark.svg -->...<!-- /LOGO -->        inline SVG (header: the dot animates)
    <!-- LOGO:img jiai-logo.svg alt="..." width=150 -->...<!-- /LOGO -->   <img>
While a file is missing, the slot keeps its interim content and the script says so.

Dev tool only: not needed on the server.
"""
import json
import posixpath
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "assets" / "brand"
SOURCE = ROOT / "index.html"
PAGES = ["shop.html", "product.html", "brand.html", "origin.html", "about.html", "rituals.html", "wishlist.html", "combos.html"]
NAMES = ["header", "footer", "bag", "search"]

LOGO = re.compile(r"(<!-- LOGO:(inline|img) ([\w.-]+)([^>]*?)-->)(.*?)(<!-- /LOGO -->)", re.S)


def block(name):
    return re.compile(
        rf"<!-- PARTIAL:{name} START -->.*?<!-- PARTIAL:{name} END -->", re.S)


def inline_svg(path):
    svg = path.read_text(encoding="utf-8")
    svg = re.sub(r"<\?xml.*?\?>|<!DOCTYPE.*?>|<!--.*?-->", "", svg, flags=re.S).strip()
    # decorative inside a labelled link: the <a> carries the accessible name
    svg = re.sub(r"\s(role|aria-label|aria-labelledby)=\"[^\"]*\"", "", svg)
    svg = svg.replace("<svg", '<svg class="brand-logo" aria-hidden="true" focusable="false"', 1)
    return svg


def fill_logos(html):
    missing = []

    def repl(m):
        opener, mode, fname, attrs, _body, closer = m.groups()
        path = BRAND / fname
        if not path.exists():
            missing.append(fname)
            return m.group(0)
        if mode == "inline":
            inner = inline_svg(path)
        else:
            alt = re.search(r'alt="([^"]*)"', attrs)
            width = re.search(r"width=(\d+)", attrs)
            cls = re.search(r'class="([^"]*)"', attrs)
            inner = (f'<img src="assets/brand/{fname}" alt="{alt.group(1) if alt else ""}"'
                     f'{f" width={chr(34)}{width.group(1)}{chr(34)}" if width else ""}'
                     f'{f" class={chr(34)}{cls.group(1)}{chr(34)}" if cls else ""}'
                     ' decoding="async">')
        return f"{opener}{inner}{closer}"

    return LOGO.sub(repl, html), missing


ENTRY = {"index.html": "js/pages/home.js", "shop.html": "js/pages/shop.js", "product.html": "js/pages/product.js",
         "brand.html": "js/pages/brand.js", "origin.html": "js/pages/origin.js", "about.html": "js/pages/about.js",
         "rituals.html": "js/pages/rituals.js", "wishlist.html": "js/pages/wishlist.js",
         "combos.html": "js/pages/combos.js"}
PRELOAD = re.compile(r"<!-- MODULEPRELOAD START.*?<!-- MODULEPRELOAD END -->", re.S)


def module_deps(entry):
    """Every module a page entry imports, directly or not (static imports only)."""
    seen, stack = [], [entry]
    while stack:
        f = stack.pop()
        if f in seen:
            continue
        seen.append(f)
        src = (ROOT / f).read_text(encoding="utf-8")
        for m in re.finditer(r'^import[^;]*?from\s+"(\.[^"]+)"', src, re.M):
            stack.append(posixpath.normpath(posixpath.join(posixpath.dirname(f), m.group(1))))
    return sorted(seen)


# Update 04: pages load the minified copies in dist/js/ (tools/build-js.py) once they exist; js/ is the source.
DIST = "dist/" if (ROOT / "dist" / "js").exists() else ""
PAGE_SCRIPT = re.compile(r'(<script type="module"(?: async)? src=")(?:dist/)?(js/pages/[\w-]+\.js")')

# Pages whose largest image (or text) is in the HTML: nothing else is fetched until it has painted. The full
# stylesheet, the module preloads, the CDN scripts (in order) and then the page module are added by one small
# generated script (PAGE BOOT), after the [data-lcp] image has loaded and a frame has gone by, or after 2.5 s
# at the latest. The first screen is complete before that from the HTML and the inline critical CSS.
# Pages whose LCP is drawn by JS (shop, brand, rituals, origin, wishlist) load everything at once, as before.
AFTER_LCP = {"index.html", "product.html", "combos.html", "about.html", "shop.html"}
CDN_TAG = re.compile(r'<script defer src="(https://cdn\.jsdelivr\.net/[^"]+)"></script>\n?')
BOOT = re.compile(r"<!-- PAGE BOOT START.*?<!-- PAGE BOOT END -->\n?", re.S)
CSS_PRELOAD = re.compile(r'<link rel="preload" as="style" href="css/site\.min\.css"[^>]*>\n?')


def boot_block(page, cdn, mods):
    q = lambda xs: "[" + ",".join(f'"{x}"' for x in xs) + "]"
    return ("<!-- PAGE BOOT START (generated by tools/sync-partials.py: after the LCP, the rest) -->\n<script>(function(d){"
            f'var css="css/site.min.css",mods={q(mods)},cdn={q(cdn)},page="{DIST}{ENTRY[page]}",done=0;'
            "function add(t,a,p){var e=d.createElement(t);for(var k in a)e[k]=a[k];(p||d.head).appendChild(e);return e}"
            "function boot(){if(done)return;done=1;add(\"link\",{rel:\"stylesheet\",href:css});"
            "mods.forEach(function(h){add(\"link\",{rel:\"modulepreload\",href:h})});"
            "var left=cdn.length;function next(){if(--left<=0)add(\"script\",{type:\"module\",src:page},d.body)}"
            "if(!left){left=1;next()}"
            "cdn.forEach(function(s){add(\"script\",{src:s,async:false,onload:next,onerror:next},d.body)})}"
            "function painted(){requestAnimationFrame(function(){setTimeout(boot)})}"
            # once a frame with content has been presented (an LCP entry) and the marked image has loaded
            # (when it is not the LCP itself, a frame after its load); without the LCP API, a frame after the image
            "var img=d.querySelector(\"[data-lcp],[data-lcp-img]\"),seen=0;"
            "function check(){if(seen&&(!img||img.complete))setTimeout(boot)}"
            "if(img&&!img.complete){var l2=function(){requestAnimationFrame(function(){requestAnimationFrame(check)})};"
            "img.addEventListener(\"load\",l2);img.addEventListener(\"error\",l2)}"
            "try{new PerformanceObserver(function(){seen=1;check()}).observe({type:\"largest-contentful-paint\",buffered:true})}"
            "catch(e){seen=1;if(!img||img.complete)painted();else{img.addEventListener(\"load\",painted);img.addEventListener(\"error\",painted)}}"
            "setTimeout(boot,2500)})(document)</script>\n<!-- PAGE BOOT END -->\n")


def with_boot(page, html):
    """AFTER_LCP pages: the CDN <script> tags and the page module become the PAGE BOOT script (idempotent)."""
    if page not in AFTER_LCP:
        return html
    m = BOOT.search(html)
    if m:
        cdn = re.findall(r'cdn=\[([^\]]*)\]', m.group(0))[0]
        cdn = re.findall(r'"([^"]+)"', cdn)
        html = BOOT.sub("", html)
        anchor = "</body>"
    else:
        cdn = CDN_TAG.findall(html)
        first = CDN_TAG.search(html)
        html = CDN_TAG.sub("", html)
        tag = re.search(r'<script type="module"(?: async)? src="(?:dist/)?js/pages/[\w-]+\.js"></script>\n?', html)
        html = html.replace(tag.group(0), "", 1)
        anchor = "</body>"
    mods = [f"{DIST}{d}" for d in module_deps(ENTRY[page])]
    html = CSS_PRELOAD.sub("", html)
    return html.replace(anchor, boot_block(page, cdn, mods) + anchor, 1)


def with_preloads(page, html):
    html = PAGE_SCRIPT.sub(lambda m: m.group(1) + DIST + m.group(2), html)
    deps = [] if page in AFTER_LCP else module_deps(ENTRY[page])      # AFTER_LCP: preloaded by PAGE BOOT instead
    links = "\n".join(f'<link rel="modulepreload" href="{DIST}{d}">' for d in deps)
    block = f"<!-- MODULEPRELOAD START (generated by tools/sync-partials.py) -->\n{links}\n<!-- MODULEPRELOAD END -->"
    html = with_boot(page, html)
    if PRELOAD.search(html):
        return PRELOAD.sub(lambda _m: block, html)
    anchor = "<!-- STYLES END -->" if "<!-- STYLES END -->" in html else '<link rel="stylesheet" href="css/main.css">'
    return html.replace(anchor, anchor + "\n" + block, 1)


LCP = re.compile(r"<!-- PDP LCP START.*?<!-- PDP LCP END -->\n?", re.S)
PDP_IMG = re.compile(r"<!-- PDP IMG START -->.*?<!-- PDP IMG END -->", re.S)


def lcp_map():
    """{product id: first gallery image} from js/data/products.js (the product page's largest image;
    a combo's is its own image)."""
    js = (ROOT / "js" / "data" / "products.js").read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r'\{ id:"([^"]+)"(.*?)(?=\n  \{ id:"|\n\];|\n\n  //)', js, re.S):
        g = re.search(r'gallery:\[\s*\{ src:"([^"]+)"', m.group(2)) or re.search(r'hero:"([^"]+)"', m.group(2))
        if g:
            out[m.group(1)] = g.group(1)
    return out


# ---------- right-sized images (Update 04): the same srcset / sizes the pages build in JS ----------

def image_variants():
    """js/data/image-variants.js (written by tools/make-image-sizes.py)."""
    js = (ROOT / "js" / "data" / "image-variants.js").read_text(encoding="utf-8")
    return json.loads(js[js.index("= ") + 2:js.rindex(";")])


def sizes_of(name):
    """SIZES.<name> from js/core/format.js."""
    fmt = (ROOT / "js" / "core" / "format.js").read_text(encoding="utf-8")
    return re.search(rf'^\s*{name}: "([^"]+)"', fmt, re.M).group(1)


def srcset_of(src, variants):
    v = variants.get(src)
    if not v or not v["set"]:
        return ""
    return ", ".join([f"{f} {w}w" for f, w, _h in v["set"]] + [f"{src} {v['w']}w"])


def pdp_sizes(src, variants):
    """As pdpSizes() in js/pages/product.js: a cut-out's width on the 4:5 stage is the stage's times k."""
    v = variants[src]
    k = min(0.82, 1.075 * v["w"] / v["h"])
    return ", ".join(re.sub(r"(\d+)(vw|px)$", lambda m: f"{round(int(m.group(1)) * k)}{m.group(2)}", part)
                     for part in sizes_of("pdp").split(", "))


SHOP_LCP = re.compile(r"<!-- SHOP LCP START.*?<!-- SHOP LCP END -->\n?", re.S)


def with_shop_lcp(page, html):
    """shop.html: its LCP is the first card's image, drawn by JS; preload it from the head (Update 04),
    with the card's own srcset and sizes so the browser fetches the one file the card will use."""
    if page != "shop.html":
        return html
    variants = image_variants()
    first = next(iter(lcp_map().values()))
    srcset = srcset_of(first, variants)
    extra = f' imagesrcset="{srcset}" imagesizes="{sizes_of("card")}"' if srcset else ""
    block = (f'<!-- SHOP LCP START (generated by tools/sync-partials.py: the first card) -->\n'
             f'<link rel="preload" as="image" href="{first}"{extra} fetchpriority="high">\n<!-- SHOP LCP END -->\n')
    html = SHOP_LCP.sub("", html)
    anchor = "<!-- STYLES START"
    return html.replace(anchor, block + anchor, 1)


def with_lcp(page, html):
    """product.html: preload this product's first image from the head (the page renders it from JS),
    and give the main <img> already in the HTML the same src, srcset and sizes at once."""
    if page != "product.html":
        return html
    variants = image_variants()
    entries = []
    for pid, src in lcp_map().items():
        srcset = srcset_of(src, variants)
        entries.append(f'"{pid}":["{src}","{srcset}","{pdp_sizes(src, variants) if srcset else ""}"]')
    table = ",".join(entries)
    script = ('<script>(function(m){var e=m[new URLSearchParams(location.search).get("id")];if(!e)return;'
              'var l=document.createElement("link");l.rel="preload";l.as="image";l.href=e[0];'
              'if(e[1]){l.imageSrcset=e[1];l.imageSizes=e[2]}l.fetchPriority="high";'
              'document.head.appendChild(l)})({' + table + '})</script>')
    block = ("<!-- PDP LCP START (generated by tools/sync-partials.py from js/data/products.js) -->\n"
             + script + "\n<!-- PDP LCP END -->")
    # Before any stylesheet: an inline script placed after one waits until that stylesheet has loaded.
    html = LCP.sub("", html)
    anchor = next(a for a in ("<!-- STYLES START", '<link rel="preconnect" href="https://fonts.googleapis.com">') if a in html)
    html = html.replace(anchor, block + "\n" + anchor, 1)
    # Right after the main <img> in the HTML: give it its image at once (js/pages/product.js adopts the element).
    img = ('<!-- PDP IMG START --><script>(function(m){var i=document.querySelector("[data-lcp-img]"),'
           'e=i&&m[new URLSearchParams(location.search).get("id")];if(!e)return;'
           'if(e[1]){i.sizes=e[2];i.srcset=e[1]}i.src=e[0];'
           # the loading shimmer on its frame, as js/core/reveal.js gives every image (it starts later on this page)
           'if(!(i.complete&&i.naturalWidth)){var f=i.closest(".pdp-slide");f.classList.add("is-skel");'
           'var d=function(){f.classList.remove("is-skel")};i.addEventListener("load",d);i.addEventListener("error",d)}'
           '})({' + table + '})</script><!-- PDP IMG END -->')
    return PDP_IMG.sub(lambda _m: img, html)


HERO_PRELOAD = re.compile(r'<link rel="preload" as="image" href="assets/products/larrive/larrive-campaign[^>]*>')


def with_hero_images(page, html):
    """index.html: the two hero cards (the page's LCP is Card A) and Card A's preload get their srcset/sizes."""
    if page != "index.html":
        return html
    variants = image_variants()
    for src, name in [("assets/products/larrive/larrive-campaign.webp", "heroA"), ("assets/hero/hero-origin.webp", "heroB")]:
        srcset = srcset_of(src, variants)
        if not srcset:
            continue
        attrs = f' srcset="{srcset}" sizes="{sizes_of(name)}"'
        html = re.sub(rf'(<img class="hcard-img"(?: data-lcp)? src="{re.escape(src)}")(?: srcset="[^"]*" sizes="[^"]*")?', lambda m: m.group(1) + attrs, html)
        if name == "heroA":
            html = HERO_PRELOAD.sub(lambda _m: f'<link rel="preload" as="image" href="{src}" imagesrcset="{srcset}" imagesizes="{sizes_of(name)}" fetchpriority="high">', html)
    return html


def main():
    check = "--check" in sys.argv
    src = SOURCE.read_text(encoding="utf-8")

    filled, missing = fill_logos(src)
    if missing:
        print("logo files not in assets/brand yet (interim kept):", ", ".join(sorted(set(missing))))
    filled = with_preloads("index.html", filled)
    filled = with_hero_images("index.html", filled)
    if filled != src:
        if check:
            print("drift: index.html (logo slots or module preloads)")
        else:
            SOURCE.write_text(filled, encoding="utf-8", newline="\n")
            print("updated index.html (logo slots / module preloads)")
            src = filled

    partials = {}
    for n in NAMES:
        m = block(n).search(src)
        if not m:
            sys.exit(f"index.html is missing PARTIAL:{n}")
        partials[n] = m.group(0)

    drift = False
    for page in PAGES:
        path = ROOT / page
        html = path.read_text(encoding="utf-8")
        new = html
        for n, text in partials.items():
            if not block(n).search(new):
                sys.exit(f"{page} is missing PARTIAL:{n}")
            new = block(n).sub(lambda _m: text, new)
        new, _missing = fill_logos(new)   # page-specific slots too (e.g. the About lockup)
        new = with_preloads(page, new)
        new = with_lcp(page, new)
        new = with_shop_lcp(page, new)
        if new != html:
            drift = True
            if check:
                print(f"drift: {page}")
            else:
                path.write_text(new, encoding="utf-8", newline="\n")
                print(f"synced: {page}")
    if check:
        print("partials identical" if not drift else "partials differ")
        sys.exit(1 if drift else 0)


if __name__ == "__main__":
    main()
