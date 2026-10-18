"""Smoke-test index.html in headless Chrome/Edge: every page renders, every ```viz block mounts, no JS errors.

    python scripts/smoke.py              # all pages
    python scripts/smoke.py A2 B3        # some pages
    python scripts/smoke.py --shot B3    # also save screenshots to ./shots/<id>.png (git-ignored)
    python scripts/smoke.py --html shots/me.html A2   # test a private build (see build.py --out)

Needs Chrome or Edge installed (no Python packages). Exit code 1 if anything failed.
"""
import json
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "google-chrome", "chromium", "chromium-browser", "msedge",
]


def browser():
    for c in CANDIDATES:
        if pathlib.Path(c).exists() or shutil.which(c):
            return c
    sys.exit("No Chrome/Edge found")


HTML = ROOT / (sys.argv[sys.argv.index("--html") + 1] if "--html" in sys.argv else "index.html")


def page_ids():
    html = HTML.read_text(encoding="utf8")
    m = re.search(r"const DATA = (\{.*?\});\nconst pages", html, re.S)
    return [p["id"] for p in json.loads(m.group(1))["pages"]]


def run(exe, pid, shot):
    url = HTML.resolve().as_uri() + "#" + pid
    with tempfile.TemporaryDirectory() as prof:
        base = [exe, "--headless=new", "--disable-gpu", "--no-first-run", f"--user-data-dir={prof}",
                "--virtual-time-budget=8000", "--enable-logging=stderr", "--v=0", "--window-size=1280,2400"]
        r = subprocess.run(base + ["--dump-dom", url], capture_output=True, text=True, encoding="utf8", errors="replace", timeout=120)
        if shot:
            (ROOT / "shots").mkdir(exist_ok=True)
            subprocess.run(base + [f"--screenshot={ROOT / 'shots' / (HTML.stem + '-' + pid + '.png')}", url], capture_output=True, timeout=120)
    dom, log = r.stdout, r.stderr
    figs = len(re.findall(r'<figure class="viz"', dom))
    problems = re.findall(r'class="viz-missing">([^<]*)', dom)
    problems += [l.strip() for l in log.splitlines() if "CONSOLE" in l and ("Error" in l or "error" in l or "Uncaught" in l)]
    if 'id="sheet"' not in dom or "Loading the notes" in dom:
        problems.append("page did not render")
    return figs, problems


def main():
    argv = sys.argv[1:]
    if "--html" in argv:
        i = argv.index("--html"); del argv[i:i + 2]
    args = [a for a in argv if not a.startswith("--")]
    shot = "--shot" in sys.argv
    exe = browser()
    ids = args or page_ids()
    bad = 0
    for pid in ids:
        figs, problems = run(exe, pid, shot)
        status = "ok " if not problems else "FAIL"
        print(f"{status} {pid:9s} {figs} figure(s)")
        for p in problems:
            print("     ", p[:300])
        bad += bool(problems)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
