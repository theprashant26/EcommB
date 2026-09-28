"""
A frozen copy of an earlier version of the site, for side-by-side comparison, published with the site at
compare/<name>/ (e.g. theprashant26.github.io/EcommB/compare/before-update-03/).

    python tools/make-compare.py <commit> <name> "<label>"
    python tools/make-compare.py fdcc9ae before-update-03 "Before Update 03"

What it does to the copy (nothing else changes):
- only the site's own files (pages, css/, js/, assets/, dist/ when the commit had one);
- a small pill at the bottom of every page: "<label>: an earlier version, for comparison" + a link back to the
  current site (× hides it);
- <meta name="robots" content="noindex"> (search engines keep to the current site);
- its saved data (cart, wishlist, PIN, reviews, announcement) under its own keys (jiai-… → jiai-compare-…),
  so the two versions never share a cart or a wishlist in the same browser.
The copy is not touched by `npm run build` (the build works on the site's own pages only), and
tools/asset-audit.py leaves compare/ out.
"""
import io
import re
import subprocess
import sys
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KEEP = re.compile(r"^([\w-]+\.html|css/.*|js/.*|dist/.*|assets/.*|\.nojekyll)$")


def main():
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    commit, name, label = sys.argv[1:]
    out = ROOT / "compare" / name
    if out.exists():
        sys.exit(f"{out.relative_to(ROOT)} exists: delete it first to rebuild it")
    tar = subprocess.run(["git", "archive", "--format=tar", commit], cwd=ROOT, capture_output=True, check=True).stdout
    n = size = 0
    with tarfile.open(fileobj=io.BytesIO(tar)) as t:
        for m in t.getmembers():
            if not m.isfile() or not KEEP.match(m.name):
                continue
            data = t.extractfile(m).read()
            if m.name.endswith((".js", ".html")):
                text = data.decode("utf-8").replace('"jiai-', '"jiai-compare-').replace("'jiai-", "'jiai-compare-")
                if m.name.endswith(".html"):
                    text = text.replace("<head>", '<head>\n<meta name="robots" content="noindex">', 1)
                    pill = ('<div role="note" style="position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483647;'
                            'max-width:calc(100% - 32px);background:#2B2B2B;color:#fff;font:500 13px/1.35 system-ui,-apple-system,Segoe UI,Arial,sans-serif;'
                            'padding:10px 16px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.22);text-align:center">'
                            f'{label}: an earlier version, for comparison · '
                            '<a href="../../index.html" style="color:#fff;text-decoration:underline">Open the current site</a>'
                            '<button type="button" aria-label="Hide this note" onclick="this.parentNode.remove()" '
                            'style="margin-left:10px;background:none;border:0;color:#fff;font:inherit;font-size:16px;line-height:1;cursor:pointer;padding:0 2px">×</button></div>')
                    text = re.sub(r"(<body[^>]*>)", lambda mm: mm.group(1) + "\n" + pill, text, count=1)
                data = text.encode("utf-8")
            path = out / m.name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
            n += 1
            size += len(data)
    print(f"compare/{name}: {n} files, {size / 1048576:.1f} MB from {commit}")


if __name__ == "__main__":
    main()
