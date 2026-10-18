"""Build index.html — the interactive single-page notebook — from the Markdown notes and the visual widgets.

    python scripts/build.py                      # writes ./index.html
    python scripts/build.py --out shots/me.html  # a private copy (used while several people edit at once)

Inputs
  docs/index.md, docs/notation.md, docs/[A-C][0-9]-*.md   the notes (the same files MkDocs serves)
  scripts/viz/core.js + scripts/viz/*.js                   the widget engine, then one widget file per note
  scripts/template.html                                    page shell: CSS, reader app, MathJax + marked from CDN

The concept-map graph is read from each note's "> **Connects:** builds on … · used by …" header line:
every note linked in the "builds on" part becomes an edge  prerequisite → note.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
VIZ = ROOT / "scripts" / "viz"
PARTS = {
    "A": "Electronic sensors & signals",
    "B": "MEMS: micro-electro-mechanical systems",
    "C": "Microfluidics & lab-on-a-chip",
}
NOTE_RE = re.compile(r"^([A-C][0-9])-.*\.md$")


def page_id(filename):
    m = NOTE_RE.match(filename)
    if m:
        return m.group(1)
    return {"index.md": "home", "notation.md": "notation"}.get(filename)


def relink(md):
    """Markdown links between notes (`A2-….md#x`) become in-page hashes (`#A2`)."""
    def sub(m):
        target = m.group(2).split("#")[0]
        pid = page_id(pathlib.Path(target).name)
        return f"]({'#' + pid if pid else m.group(2)})"
    return re.sub(r"\]\(([^)]*?/)?([^)/]+\.md(?:#[^)]*)?)\)", lambda m: sub(m), md)


def builds_on(md):
    m = re.search(r"^> \*\*Connects:\*\*(.*)$", md, re.M)
    if not m:
        return []
    line = m.group(1)
    part = re.split(r"used by", line, flags=re.I)[0]
    return [page_id(pathlib.Path(t).name) for t in re.findall(r"\]\(([^)#]+\.md)", part)]


def main():
    notes = sorted((p for p in DOCS.glob("*.md") if NOTE_RE.match(p.name)), key=lambda p: (p.name[0], int(p.name[1])))
    pages, nodes, edges = [], [], []
    for name, short, title in (("index.md", "Start here", "The storyline"), ("notation.md", "Notation", "Notation")):
        pages.append({"id": page_id(name), "short": short, "title": title, "part": "", "md": relink((DOCS / name).read_text(encoding="utf8"))})
    for p in notes:
        md = p.read_text(encoding="utf8")
        pid = page_id(p.name)
        h1 = re.search(r"^#\s+[A-C][0-9]\.\s*(.+)$", md, re.M)
        short = h1.group(1).strip() if h1 else p.stem
        pages.append({"id": pid, "short": short, "title": short, "part": pid[0], "md": relink(md)})
        nodes.append({"id": pid, "title": short, "part": pid[0]})
        edges += [[q, pid] for q in builds_on(md) if q and q != pid]
    known = {n["id"] for n in nodes}
    edges = [e for e in edges if e[0] in known]
    data = {"pages": pages, "parts": PARTS, "graph": {"nodes": nodes, "edges": edges}}

    viz_files = [VIZ / "core.js"] + sorted(f for f in VIZ.glob("*.js") if f.name != "core.js")
    # one <script> per file: a syntax error in one note's widgets cannot break the others
    viz = "\n</script>\n<script>\n".join(
        f"/* ── {f.name} ── */\n" + f.read_text(encoding="utf8").replace("</script", "<\\/script") for f in viz_files)

    tpl = (ROOT / "scripts" / "template.html").read_text(encoding="utf8")
    blob = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    html = tpl.replace("/*@@VIZ@@*/", viz).replace("/*@@DATA@@*/", blob)
    out = ROOT / (sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else "index.html")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf8", newline="\n")
    print(f"{out.name}: {len(pages)} pages, {len(edges)} links, {len(viz_files)} viz files, {len(html) // 1024} KB")


if __name__ == "__main__":
    main()
