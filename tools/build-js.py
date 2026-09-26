"""
Update 04 (speed): minified copies of the site's JavaScript modules.

js/ stays the source (readable, commented). Every module is minified one to one into dist/js/
(same tree, same relative imports, no bundling), and the pages load dist/js/ (their <script>
and modulepreload tags are written by tools/sync-partials.py).

    python tools/build-js.py        # then: python tools/sync-partials.py

Run it after any change under js/ (or `npm run build`), and commit dist/ with the sources. Dev tool
only: it uses esbuild from node_modules (`npm ci` installs the pinned version).
"""
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "js"
OUT = ROOT / "dist" / "js"


def node_bin(pkg, bin_rel):
    """[node, <the package's CLI>] from this project's node_modules (npm ci installs the pinned versions)."""
    node = shutil.which("node")
    cli = ROOT / "node_modules" / pkg / bin_rel
    if not node or not cli.exists():
        sys.exit(f"{pkg} is missing: install Node (LTS) and run `npm ci` in the project folder first")
    return [node, str(cli)]


def esbuild(args):
    subprocess.run([*node_bin("esbuild", "bin/esbuild"), *args], check=True, cwd=ROOT)


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
