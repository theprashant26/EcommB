"""
Lists the files in assets/ that nothing references: no page, script, stylesheet, data file or build step.
Reports only; deleting is a separate, deliberate step.

    python tools/asset-audit.py

Read: the pages, js/ and dist/js/, css/, tools/, and any JSON/XML/manifest/.htaccess (docs such as README
and UPDATE-*.md don't count). A folder reference (the 360° frames: "assets/spin/lotion/" + 000–035.webp)
covers the numbered files in it.

CLIENT_FILES are the client's own deliverables (official logo files, favicons): kept even when no page
uses them yet, so they are never reported as unused.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CLIENT_FILES = {
    # Update 05 §0: the official logo set and favicons, delivered by the client
    "assets/brand/favicon-512.png",
    "assets/brand/jiai-logo-white.svg",
    "assets/brand/jiai-wordmark-white.svg",
    "assets/brand/jiai-logo-official.webp",
}

TEXT = {".html", ".js", ".css", ".py", ".json", ".webmanifest", ".xml", ".txt", ".svg"}
SKIP = {"node_modules", ".git", "reference", "assets"}


def corpus():
    files = [p for p in ROOT.rglob("*") if p.is_file() and p.suffix in TEXT
             and not SKIP.intersection(p.relative_to(ROOT).parts) and p.name != "package-lock.json"]
    files += [p for p in [ROOT / ".htaccess"] if p.exists()]
    files += list((ROOT / "assets").rglob("*.svg"))        # an SVG may use another asset
    return "\n".join(p.read_text(encoding="utf-8", errors="ignore") for p in files)


def unused():
    text = corpus()
    folders = set(re.findall(r"assets/[\w/-]+/(?=[\"'`])", text))
    out = []
    for p in sorted((ROOT / "assets").rglob("*")):
        if not p.is_file():
            continue
        rel = p.relative_to(ROOT).as_posix()
        if rel in CLIENT_FILES or rel in text:
            continue
        if any(rel.startswith(d) and re.fullmatch(r"\d{3}\.webp", rel[len(d):]) for d in folders):
            continue
        out.append((rel, p.stat().st_size))
    return out


def main():
    missing = sorted(f for f in CLIENT_FILES if not (ROOT / f).exists())
    for f in missing:
        print(f"client file missing: {f}")
    files = unused()
    for rel, size in files:
        print(f"{size / 1024:8.1f} KB  {rel}")
    print(f"{len(files)} unused files, {sum(s for _, s in files) / 1024 / 1024:.2f} MB")
    sys.exit(1 if missing else 0)


if __name__ == "__main__":
    main()
