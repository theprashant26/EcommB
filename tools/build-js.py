"""
Update 04 (speed): minified copies of the site's JavaScript modules.

js/ stays the source (readable, commented). Every module is minified one to one into dist/js/
(same tree, same relative imports, no bundling), and the pages load dist/js/ (their <script>
and modulepreload tags are written by tools/sync-partials.py).

    python tools/build-js.py        # then: python tools/sync-partials.py

Run it after any change under js/, and commit dist/ with the sources. Dev tool only. Needs Node
(npx, or NODE_MODULES=<dir with esbuild installed> and NODE=<node binary>).
"""
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "js"
OUT = ROOT / "dist" / "js"


def esbuild(args):
    mods = os.environ.get("NODE_MODULES")
    if mods:
        cmd = [os.environ.get("NODE", "node"), str(Path(mods) / "esbuild" / "bin" / "esbuild"), *args]
    else:
        npx = shutil.which("npx") or shutil.which("npx.cmd")
        if not npx:
            sys.exit("Node is needed (npx), or set NODE_MODULES and NODE")
        cmd = [npx, "--yes", "esbuild@0.25", *args]
    subprocess.run(cmd, check=True, cwd=ROOT)


def main():
    files = sorted(p.relative_to(ROOT).as_posix() for p in SRC.rglob("*.js"))
    if OUT.exists():
        shutil.rmtree(OUT)
    esbuild([*files, "--minify", "--format=esm", "--target=es2022", "--log-level=warning",
             "--outbase=js", f"--outdir={OUT.relative_to(ROOT).as_posix()}"])
    before = sum((ROOT / f).stat().st_size for f in files)
    after = sum(p.stat().st_size for p in OUT.rglob("*.js"))
    print(f"dist/js: {len(files)} modules, {before / 1024:.0f} KB -> {after / 1024:.0f} KB")


if __name__ == "__main__":
    main()
