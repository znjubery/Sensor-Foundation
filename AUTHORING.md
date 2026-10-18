# Authoring guide: how a note and its visuals are made

Every note is **one Markdown file** in `docs/` plus **one widget file** in `scripts/viz/` plus **one check script** in
`scripts/checks/`. `python scripts/build.py` turns them into `index.html`, and `python scripts/smoke.py` tests that page in
headless Chrome/Edge.

## 1. The Markdown note: `docs/<ID>-<slug>.md`

Use exactly these sections, in this order. The reader styles sections by their heading text, so keep the headings
word for word. Aim for 15–25 KB, written for a curious 10th grader without being dumbed down.

```markdown
# B3. Micromechanics: beams, springs and resonators

> **Connects:** builds on [B1 Scaling laws](B1-scaling-laws-why-small-is-different.md), [A3 Capacitive sensors](A3-capacitive-sensors.md) · used by [B4 MEMS inertial sensors](B4-….md), [B5 …](B5-….md)

## Hook — <a scene everyone knows>
## The idea in plain words          (bold paragraph leads; every symbol defined on first use; ≥ 1 ```viz block)
## Intuitive examples               (3–6 numbered items with real numbers)
## The key equations                (a table: equation | meaning | symbols)
## Applications                     (a table with exactly the 7 worlds as rows, see below)
## Derivation                       (numbered steps, one line each; parts (a), (b), …)
## Worked check                     (a tiny example by hand; numbers verified by scripts/checks/<ID>_check.py)
## Whiteboard plan                  (Panel 1 … Panel 5–6: what to draw, what to say)
## Common mistakes and where the intuition breaks
## Remember                         (one bold line in quotes)
## Self-test                        (3 questions; answers in <details><summary>Answer</summary>…</details>, plain text, no $)
**Next:** [<next note>](<file>.md) — one sentence of why.
```

* **Connects line:** the builds-on links create the concept map, so link only notes that really come earlier. Use the exact file
  names from `docs/index.md`.
* **Applications table:** columns `| World | <this note's idea> | What it tells you |`, with exactly these seven rows in this order:
  `🌱 Plants & agriculture`, `🧬 Biology & human health`, `🌍 Environment`, `🤖 Robotics & drones`, `🚗 Cars`,
  `📱 Phones & photography`, `🏠 Home & household`.
* **Math:** `$…$` inline and `$$…$$` display. Symbols come from `docs/notation.md` only; if you need a new one, keep it
  local and define it where you use it. Never write `\(`. Inside tables, escape `|` as `\lvert`/`\rvert`.
* **Visuals:** put ```` ```viz ```` blocks containing a widget id where the idea is explained. Each note has **2–3 widgets**,
  and **at least one is 3D** (`VIZ.scene3d`).
* **Numbers:** every number in *Intuitive examples* and *Worked check* must come out of the check script.

## 2. The widget file: `scripts/viz/<ID>.js`

```js
/* B3 — micromechanics: widgets for docs/B3-….md */
(function () {
  "use strict";
  const { register, C, ROLE, scene3d, chart, plane, ramp, fmt, loop, rng, gauss, mix, S, H } = VIZ;

  register("b3-cantilever-3d", {
    title: "3D · a cantilever bends: x = F/k with k = Ew t³ / 4L³",
    target: "Predict how much a silicon beam bends, and why doubling its thickness makes it 8× stiffer.",
    caption: "drag to orbit; the colour is the strain at the surface (blue → yellow) …",
    links: [{ id: "A2", why: "the strain here is what a piezoresistor reads" }, { id: "B4", why: "the same spring holds the proof mass" }],
    build(fig, ui) {
      let t = 2, F = 1;
      const sc = scene3d(ui.body, { scale: 50, draw(g) { /* g.box, g.surface, g.arrow, g.text … */ } });
      ui.slider("thickness t", 1, 4, 0.5, t, (v) => { t = v; sc.render(); return v + " µm"; });
      ui.steps([
        "Stress at the root: \\( \\sigma = 6FL/(wt^2) \\)",
        "…",
      ], (i) => { /* make the picture show step i */ sc.render(); });
      ui.read.innerHTML = "…live numbers…";
    },
  });
})();
```

**Rules for widgets**
1. Widget ids are lowercase, start with the note id (`b3-…`), and are unique.
2. Every widget has a `title`, a **`target`** (the teaching target, one sentence: "after this you can …"), a `caption`, and
   **`links`** to 2–4 other notes with a `why`. The links are what connect the notebook, so make them true and specific.
3. Each note has at least one **3D** widget (`scene3d`: drag to orbit). The other widgets can be 2D (`chart`, `plane`, or raw SVG).
4. Each note has at least one widget with a **`ui.steps([...], onStep)`** math stepper. The picture must *change* with the
   step (highlight, add an arrow, freeze a parameter), so the derivation and the visual teach together.
5. Colours mean the same thing everywhere (`ROLE` in core.js, table in notation.md): stimulus blue, output yellow,
   model/fit green, noise/error red, electrical teal, heat/light gold, mechanical purple, fluid `C.water`, device body `C.silicon`.
6. The readout (`ui.read.innerHTML`) shows the live numbers, with units, that the sliders change.
7. No libraries, no network, no `console.log`. Keep each widget's frame cheap: use fewer than ~1500 polygons in `scene3d`.
   Use `animate: true` only when motion teaches something (vibration, flow, diffusion), and stop animating when `VIZ.reduceMotion` is set.
8. Inside JS strings, LaTeX backslashes are doubled: `"\\( \\omega_0 = \\sqrt{k/m} \\)"`.
9. **Create and edit files with the editor's write/edit tools, not shell heredocs.** Heredocs in this environment eat backslashes.

The full API is documented at the top of `scripts/viz/core.js`: `scene3d`, `chart`, `plane`, `ramp`, `loop`, `rng`/`gauss`,
`tween`, `typeset`.

## 3. The check script: `scripts/checks/<ID>_check.py`

A plain-Python script (standard library only) that recomputes every number in the note's examples and worked check, and
prints them. Run it with `python scripts/checks/<ID>_check.py`.

## 4. Build and test

```bash
python scripts/build.py --out shots/<you>.html          # private build while others edit too
python scripts/smoke.py --html shots/<you>.html --shot B3 # renders, mounts every viz, no JS errors, screenshot in shots/
node --check scripts/viz/B3.js                            # quick syntax check
python scripts/build.py                                   # the real index.html
```
