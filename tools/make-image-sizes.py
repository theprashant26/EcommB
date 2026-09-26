"""
Update 04 (speed): right-sized WebP variants of the site's images, written next to each source
(the sources themselves are never changed), plus js/data/image-variants.js, the manifest the
pages read to build srcset.

    python tools/make-image-sizes.py

Naming (quality 80):
  name-480.webp  … a width variant (480 px wide): hero, category tiles, Rituals rows
  name-600.webp  … a height variant (600 px tall): product cards, product-page images, combos
  name-thumb.webp  180 px tall: thumbnail rails, "What's in the combo", menus, cart, search
Variants are only made smaller than their source (never upscaled). Re-run after adding images
to js/data/*.js, and commit the output. Dev tool only (Pillow).
"""
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
Q = 80
WIDTHS = {
    r"larrive/larrive-[\w-]*campaign\.webp$": [480, 768], # hero Card A (the home LCP) and the L'Arrivé galleries; 1024 is the source
    r"hero/hero-origin\.webp$": [320, 480],                 # hero Card B (the source is 600 wide)
    r"categories/category-[\w-]+\.webp$": [768],            # 1200 / ~900 are the sources
    r"rituals/ritual-[\w-]+\.webp$": [768, 1200],           # 1536 is the source
}
HEIGHTS = [600, 900]
THUMB_H = 180


def data_images():
    """Every image the data files list (products, combos, rituals, categories, hero)."""
    found = set()
    for f in ["products.js", "rituals.js", "categories.js", "hero.js"]:
        found |= set(re.findall(r'"(assets/[\w/.-]+\.webp)"', (ROOT / "js" / "data" / f).read_text(encoding="utf-8")))
    found.add("assets/hero/hero-origin.webp")
    return sorted(s for s in found if (ROOT / s).exists() and "/spin" not in s and "-hd." not in s)


def save(im, path):
    im.save(path, "WEBP", quality=Q, method=6)


def variants_for(src):
    path = ROOT / src
    im = Image.open(path)
    im.load()
    w, h = im.size
    out = {"w": w, "h": h, "set": [], "thumb": None}
    if im.mode in ("RGBA", "LA"):
        # Where the product sits in a cut-out (the card centres and scales it by this): its opaque pixels,
        # so a soft baked-in shadow doesn't pull the centre sideways.
        bb = im.getchannel("A").point(lambda a: 255 if a > 200 else 0).getbbox()
        if bb:
            out["focus"] = {"cx": round((bb[0] + bb[2]) / 2 / w, 3), "top": round(bb[1] / h, 3), "base": round(bb[3] / h, 3)}
    widths = next((v for k, v in WIDTHS.items() if re.search(k, src)), None)
    if widths:                                                   # width variants
        for vw in widths:
            if vw < w:
                vh = round(h * vw / w)
                dst = path.with_name(f"{path.stem}-{vw}.webp")
                save(im.resize((vw, vh), Image.LANCZOS), dst)
                out["set"].append([dst.relative_to(ROOT).as_posix(), vw, vh])
    else:                                                        # height variants (cut-outs, product shots)
        for vh in HEIGHTS:
            if vh < h:
                vw = round(w * vh / h)
                dst = path.with_name(f"{path.stem}-{vh}.webp")
                save(im.resize((vw, vh), Image.LANCZOS), dst)
                out["set"].append([dst.relative_to(ROOT).as_posix(), vw, vh])
    if h > THUMB_H:                                              # thumbnail
        tw = round(w * THUMB_H / h)
        dst = path.with_name(f"{path.stem}-thumb.webp")
        save(im.resize((tw, THUMB_H), Image.LANCZOS), dst)
        out["thumb"] = dst.relative_to(ROOT).as_posix()
    return out


VARIANT = re.compile(r"^(.+)-(\d+|thumb)\.webp$")


def remove_orphans(manifest):
    """Delete copies this tool made of images the data no longer lists (their source may be gone too)."""
    known = {f for v in manifest.values() for f, *_ in v["set"]} | {v["thumb"] for v in manifest.values() if v["thumb"]}
    removed = []
    for p in (ROOT / "assets").rglob("*.webp"):
        rel = p.relative_to(ROOT).as_posix()
        m = VARIANT.match(rel)
        if not m or rel in known or "/spin" in rel or f"{m.group(1)}.webp" in manifest:
            continue
        base = ROOT / f"{m.group(1)}.webp"
        # only files that look like this tool's output: a sibling source, or none left at all
        if base.exists() or not any(base.parent.glob(base.stem + ".*")):
            p.unlink()
            removed.append(rel)
    return removed


def main():
    manifest = {}
    before = after = 0
    for src in data_images():
        v = variants_for(src)
        manifest[src] = v
        before += (ROOT / src).stat().st_size
        smallest = min([ROOT / s for s, *_ in v["set"]] or [ROOT / src], key=lambda p: p.stat().st_size)
        after += smallest.stat().st_size
        print(f"{src}: {len(v['set'])} sizes{' + thumb' if v['thumb'] else ''}")
    removed = remove_orphans(manifest)
    if removed:
        print(f"removed {len(removed)} copies of images no longer used: " + ", ".join(sorted({r.rsplit('-', 1)[0] for r in removed})))
    js = ("/* Generated by tools/make-image-sizes.py (Update 04): the right-sized copies of each image.\n"
          "   { source: { w, h, focus (cut-outs), set: [[file, width, height], …] (smaller than the source), thumb } } */\n"
          "export const IMAGE_VARIANTS = " + json.dumps(manifest, indent=1) + ";\n")
    (ROOT / "js" / "data" / "image-variants.js").write_text(js, encoding="utf-8", newline="\n")
    print(f"{len(manifest)} images; smallest variants {after / 1024:.0f} KB vs sources {before / 1024:.0f} KB")


if __name__ == "__main__":
    main()
