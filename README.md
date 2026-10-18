# Sensor Foundations Notebook

**MEMS, microfluidics & electronic sensors: 19 connected, interactive notes** on how the world becomes trustworthy numbers,
from a tomato leaf and a glucose strip to a drone's gyroscope, a car's airbag, a phone camera and a smart home.

| Part | Topic | Notes |
|---|---|---|
| A | Electronic sensors & signals | A1 the measurement chain → A9 sensor fusion & the Kalman filter |
| B | MEMS | B1 scaling laws → B5 microphones, pressure sensors & actuators |
| C | Microfluidics & lab-on-a-chip | C1 Reynolds number → C5 lab-on-a-chip & integrated systems |

Each note has the same shape: real-world hook → plain-words idea → **interactive figures** → examples → key equations →
applications in seven worlds (🌱 plants · 🧬 health · 🌍 environment · 🤖 robots & drones · 🚗 cars · 📱 phones & cameras · 🏠 home)
→ derivation → worked check → whiteboard plan → common mistakes → self-test → one-line "remember".

## Interactive, visual and connected

Every note has 2–3 live figures, and at least one of them is a **3D model you can rotate** (drag to orbit; Ctrl + wheel to zoom):
a bending cantilever, an accelerometer's proof mass and comb fingers, a Poiseuille velocity surface, a mixing T-junction, a
whole lab-on-a-chip.

- 🎯 **Teaching target:** each figure states what you will be able to do after playing with it.
- **Math, step by step:** a stepper walks through the derivation, and the picture changes with each step.
- **Connected to:** each figure links to the figures in other notes that reuse the same idea (the bridge from A2 reappears
  in a pressure sensor in B5; the spring–mass from B3 is inside the accelerometer in B4; Ohm's law from A2 becomes the
  hydraulic Ohm's law in C2). The home page has a clickable concept map of all 19 notes.
- Colours mean the same thing in every figure: stimulus blue, output yellow, model green, noise red, electrical teal,
  heat/light gold, mechanical purple, fluid bright blue, silicon grey.

## Two ways to read it

1. **Interactive notebook:** [`index.html`](index.html) is one self-contained page. Open it in a browser, or enable GitHub Pages
   (Settings → Pages → deploy from `main`, root) to host it. Progress ticks ("I can explain this") are saved in your browser.
2. **Markdown notes:** [`docs/`](docs/index.md) holds the same notes as plain Markdown, readable on GitHub and buildable as an MkDocs site:

```bash
pip install mkdocs-material
mkdocs serve        # preview at http://127.0.0.1:8000
```

> The interactive figures (` ```viz ` blocks) run only in `index.html`. In the Markdown/MkDocs version they show as a code
> block with the widget id.

## Build, test, verify

```bash
python scripts/build.py              # docs/*.md + scripts/viz/*.js  →  index.html
python scripts/smoke.py              # headless Chrome/Edge: every page renders, every figure mounts, no JS errors
python scripts/checks/A2_check.py    # recompute every number used in a note's examples and worked check
```

## Layout

```
index.html               interactive single-page notebook (built — do not edit by hand)
mkdocs.yml               MkDocs (Material) config + nav
docs/index.md            start here: the storyline, threads and the seven worlds
docs/notation.md         one set of symbols and colours for every note
docs/A1-…C5-….md         the 19 notes
scripts/viz/core.js      the widget engine: 2D SVG, charts, a small 3D canvas engine, math stepper, links
scripts/viz/<ID>.js      the figures of each note
scripts/checks/          number-checking scripts, one per note
scripts/build.py         builds index.html      scripts/smoke.py   headless render test
AUTHORING.md             how to write a note and its figures
```

A companion to [Math-Foundation](https://github.com/znjubery/Math-Foundation).

Author: Zaki Jubery
