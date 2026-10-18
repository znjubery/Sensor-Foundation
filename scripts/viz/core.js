/* viz — 3Blue1Brown-style interactive visuals (2D SVG + a tiny 3D engine) for the Sensor Foundations reader.
 *
 * A note asks for a visual with a fenced block:   ```viz
 *                                                  a2-bridge
 *                                                  ```
 * The reader calls VIZ.mount(sheet, ctx) after rendering a page; every `code.language-viz` block becomes a live
 * widget. Register widgets with
 *   VIZ.register(id, { title, target, caption, links, build(fig, ui, ctx) })
 *     target  — the teaching target: "After this you can …" (one sentence)
 *     links   — ["B3", { id: "C2", why: "same law, for water" }] → the "Connected to" strip
 *     ui      — { body, ctl, read, button(), slider(), steps(list, onStep) }  (steps = the math-detail stepper)
 * 3D:  const sc = VIZ.scene3d(ui.body, { draw(g, t) { g.line(...); g.poly(...); … } });  drag = orbit, wheel = zoom.
 * One colour per physical object across ALL notes (notation.md → "Colours in the visuals"): see ROLE below.
 * One file per note in scripts/viz/ (core.js first); scripts/build.py concatenates them into index.html.
 * No libraries. Respects prefers-reduced-motion.
 */
(function () {
  "use strict";

  // ── palette (3b1b-like) and the colour of each physical object ──────────────────────────────────────────
  const C = {
    bg: "#0e1116", grid: "#1f4e66", gridFaint: "#15303f", axis: "#c9d1d9", text: "#e8ecef", dim: "#8b96a0",
    blue: "#58C4DD", yellow: "#F4D35E", green: "#83C167", red: "#FC6255", teal: "#5CD0B3",
    gold: "#F0AC5F", purple: "#B98AE0", white: "#FFFFFF", water: "#5B8CFF", silicon: "#7d8796",
  };
  const ROLE = {
    s: C.blue,          // the stimulus / measurand: what the world does (strain, light, pressure, glucose…)
    y: C.yellow,        // the sensor's output signal (volts, counts, frequency)
    fit: C.green,       // the ideal / model / calibration line / filtered estimate
    noise: C.red,       // noise, error, drift: "measured minus true"
    elec: C.teal,       // electrical: voltage, charge, electric field, current
    heat: C.gold,       // thermal and light: temperature, photons
    mech: C.purple,     // mechanical: force, displacement, mass, spring
    fluid: C.water,     // fluid: flow, velocity, concentration
    solid: C.silicon,   // silicon, glass, PDMS: the device body
  };
  const NS = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── tiny DOM helpers ───────────────────────────────────────────────────────────────────────────────────
  function S(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function H(tag, attrs, parent, html) {
    const e = document.createElement(tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (html !== undefined) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }
  function fmt(x, d) {
    if (d === undefined) d = 2;
    if (Math.abs(x) < 1e-9) x = 0;
    let s = x.toFixed(d);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s === "-0" ? "0" : s;
  }
  const deg = (rad) => (rad * 180) / Math.PI;
  const dot = (p, q) => p[0] * q[0] + p[1] * q[1];
  const len = (p) => Math.hypot(p[0], p[1]);
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const lerp = (a, b, t) => a + (b - a) * t;
  function tween(ms, step, done) {
    if (reduceMotion) { step(1); if (done) done(); return; }
    const t0 = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - t0) / ms);
      step(ease(t));
      if (t < 1) requestAnimationFrame(frame); else if (done) done();
    }
    requestAnimationFrame(frame);
  }

  // ── styles (injected once) ─────────────────────────────────────────────────────────────────────────────
  const CSS = `
figure.viz { margin: 18px 0 24px; border-radius: 12px; overflow: hidden; background: ${C.bg}; color: ${C.text};
  font-family: var(--font-display, system-ui, sans-serif); box-shadow: 0 1px 0 rgba(0,0,0,.2); }
figure.viz .viz-title { padding: 10px 14px 0; font-size: 12px; letter-spacing: .09em; text-transform: uppercase; color: ${C.dim}; font-weight: 600; }
figure.viz svg:not(mjx-container svg) { display: block; width: 100%; height: auto; touch-action: none; user-select: none; -webkit-user-select: none; }
figure.viz .viz-ctl { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; padding: 8px 14px 4px; font-size: 13.5px; }
figure.viz button { font: inherit; font-size: 13px; color: ${C.text}; background: #1d2530; border: 1px solid #34404d; border-radius: 999px;
  padding: 5px 12px; cursor: pointer; }
figure.viz button:hover { border-color: ${C.blue}; }
figure.viz label { display: inline-flex; gap: 8px; align-items: center; color: ${C.dim}; }
figure.viz input[type=range] { accent-color: ${C.blue}; width: 130px; }
figure.viz .viz-read { padding: 6px 14px 10px; font-family: var(--font-mono, ui-monospace, monospace); font-size: 13.5px; line-height: 1.55; color: ${C.text}; }
figure.viz .viz-read b { font-weight: 600; }
figure.viz figcaption { padding: 8px 14px 12px; border-top: 1px solid #222b35; font-size: 13.5px; line-height: 1.5; color: ${C.dim}; }
figure.viz figcaption strong { color: ${C.text}; font-weight: 600; }
figure.viz figcaption a { color: ${C.yellow}; text-decoration: none; font-weight: 600; }
figure.viz figcaption a:hover { text-decoration: underline; }
figure.viz .viz-target { margin: 8px 14px 0; padding: 7px 10px; border-radius: 8px; background: #17241d; border: 1px solid #2c4a3a;
  font-size: 13.5px; line-height: 1.45; color: ${C.text}; }
figure.viz .viz-target span { color: ${C.green}; font-weight: 600; margin-right: 4px; }
figure.viz canvas { display: block; width: 100%; height: auto; touch-action: none; cursor: grab; }
figure.viz canvas:active { cursor: grabbing; }
figure.viz .viz-hint { padding: 2px 14px 0; font-size: 12px; color: ${C.dim}; }
figure.viz .viz-steps { margin: 4px 14px 10px; border: 1px solid #2a3440; border-radius: 10px; background: #121820; }
figure.viz .viz-steps-head { display: flex; gap: 8px; align-items: center; padding: 6px 10px; border-bottom: 1px solid #222b35; font-size: 12px; }
figure.viz .viz-steps-lab { flex: 1; text-transform: uppercase; letter-spacing: .08em; color: ${C.dim}; font-weight: 600; }
figure.viz .viz-steps-head button { padding: 2px 10px; }
figure.viz .viz-steps-count { font-family: var(--font-mono, monospace); color: ${C.dim}; min-width: 3.5em; text-align: center; }
figure.viz .viz-steps-body { padding: 8px 12px; font-size: 14px; line-height: 1.55; }
figure.viz .viz-step { padding: 3px 0 3px 10px; border-left: 3px solid transparent; color: ${C.dim}; display: none; }
figure.viz .viz-step.done { display: block; opacity: .75; }
figure.viz .viz-step.on { display: block; color: ${C.text}; border-left-color: ${C.yellow}; }
figure.viz figcaption .why { color: ${C.dim}; font-weight: 400; }
figure.viz .viz-missing { padding: 14px; color: ${C.red}; font-size: 13px; }
.viz-fits { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: baseline; margin: -6px 0 18px; font-family: var(--font-display, sans-serif); font-size: 13px; color: var(--muted, #667); }
.viz-fits a { display: inline-block; padding: 1px 8px; border-radius: 999px; border: 1px solid var(--line, #ccd); text-decoration: none; color: var(--ink, #222); }
.viz-fits a:hover { border-color: var(--accent, #2c6a52); }
.viz-fits .lbl { text-transform: uppercase; letter-spacing: .08em; font-size: 11px; font-weight: 600; }
`;
  function injectCSS() {
    if (document.getElementById("viz-css")) return;
    H("style", { id: "viz-css" }, document.head, CSS);
  }

  // ── a coordinate plane on an SVG (math y points up, equal scale on both axes) ───────────────────────────
  function plane(fig, opt) {
    const o = Object.assign({ w: 640, xr: [-1, 6], yr: [-1, 5], grid: true, axes: true }, opt || {});
    const s = o.w / (o.xr[1] - o.xr[0]);
    const h = Math.round(s * (o.yr[1] - o.yr[0]));
    const svg = S("svg", { viewBox: `0 0 ${o.w} ${h}`, role: "img", "aria-label": o.label || "interactive diagram" }, fig);
    S("defs", {}, svg);
    const X = (x) => (x - o.xr[0]) * s;
    const Y = (y) => (o.yr[1] - y) * s;
    const gGrid = S("g", {}, svg), gMain = S("g", {}, svg), gTop = S("g", {}, svg);
    if (o.grid) {
      for (let x = Math.ceil(o.xr[0]); x <= o.xr[1]; x++)
        S("line", { x1: X(x), y1: 0, x2: X(x), y2: h, stroke: x === 0 ? "none" : C.grid, "stroke-width": 1, opacity: 0.55 }, gGrid);
      for (let y = Math.ceil(o.yr[0]); y <= o.yr[1]; y++)
        S("line", { x1: 0, y1: Y(y), x2: o.w, y2: Y(y), stroke: y === 0 ? "none" : C.grid, "stroke-width": 1, opacity: 0.55 }, gGrid);
    }
    if (o.axes) {
      S("line", { x1: 0, y1: Y(0), x2: o.w, y2: Y(0), stroke: C.axis, "stroke-width": 1.4, opacity: 0.8 }, gGrid);
      S("line", { x1: X(0), y1: 0, x2: X(0), y2: h, stroke: C.axis, "stroke-width": 1.4, opacity: 0.8 }, gGrid);
    }
    const P = { svg, s, h, w: o.w, X, Y, o, gGrid, gMain, gTop };

    P.toMath = function (clientX, clientY) {
      const pt = svg.createSVGPoint();
      pt.x = clientX; pt.y = clientY;
      const q = pt.matrixTransform(svg.getScreenCTM().inverse());
      return [q.x / s + o.xr[0], o.yr[1] - q.y / s];
    };

    // arrow from (x0,y0) to (x1,y1) in math units
    P.arrow = function (color, width, parent) {
      const g = S("g", {}, parent || gMain);
      const line = S("line", { stroke: color, "stroke-width": width || 3.5, "stroke-linecap": "round" }, g);
      const head = S("polygon", { fill: color }, g);
      return {
        g,
        set(x0, y0, x1, y1) {
          const ax = X(x0), ay = Y(y0), bx = X(x1), by = Y(y1);
          const L = Math.hypot(bx - ax, by - ay);
          if (L < 1) { g.setAttribute("visibility", "hidden"); return; }
          g.setAttribute("visibility", "visible");
          const ux = (bx - ax) / L, uy = (by - ay) / L, hl = Math.min(16, L * 0.45), hw = hl * 0.55;
          const cx = bx - ux * hl, cy = by - uy * hl;
          line.setAttribute("x1", ax); line.setAttribute("y1", ay); line.setAttribute("x2", cx); line.setAttribute("y2", cy);
          head.setAttribute("points", `${bx},${by} ${cx - uy * hw},${cy + ux * hw} ${cx + uy * hw},${cy - ux * hw}`);
        },
        color(c) { line.setAttribute("stroke", c); head.setAttribute("fill", c); },
      };
    };
    P.seg = function (color, width, dash, parent) {
      const l = S("line", { stroke: color, "stroke-width": width || 2, "stroke-dasharray": dash || "", "stroke-linecap": "round" }, parent || gMain);
      return {
        el: l,
        set(x0, y0, x1, y1) { l.setAttribute("x1", X(x0)); l.setAttribute("y1", Y(y0)); l.setAttribute("x2", X(x1)); l.setAttribute("y2", Y(y1)); },
      };
    };
    P.text = function (color, size, parent, anchor) {
      const t = S("text", { fill: color, "font-size": size || 16, "font-family": "var(--font-mono, ui-monospace, monospace)",
        "text-anchor": anchor || "middle", "dominant-baseline": "middle", "paint-order": "stroke", stroke: C.bg, "stroke-width": 4 }, parent || gTop);
      return { el: t, set(x, y, str) { t.setAttribute("x", X(x)); t.setAttribute("y", Y(y)); t.textContent = str; } };
    };
    P.dotAt = function (color, r, parent) {
      const c = S("circle", { r: r || 4, fill: color }, parent || gMain);
      return { el: c, set(x, y) { c.setAttribute("cx", X(x)); c.setAttribute("cy", Y(y)); } };
    };
    // draggable handle: onDrag(x, y) gets snapped, clamped math coordinates
    P.handle = function (color, onDrag, snap) {
      const c = S("circle", { r: 11, fill: color, "fill-opacity": 0.25, stroke: color, "stroke-width": 2, style: "cursor:grab" }, gTop);
      let active = false;
      c.addEventListener("pointerdown", (e) => { e.preventDefault(); active = true; c.setPointerCapture(e.pointerId); c.style.cursor = "grabbing"; });
      c.addEventListener("pointermove", (e) => {
        if (!active) return;
        let [x, y] = P.toMath(e.clientX, e.clientY);
        const k = snap || 0.5;
        x = Math.round(x / k) * k; y = Math.round(y / k) * k;
        x = Math.max(o.xr[0] + 0.2, Math.min(o.xr[1] - 0.2, x));
        y = Math.max(o.yr[0] + 0.2, Math.min(o.yr[1] - 0.2, y));
        onDrag(x, y);
      });
      const stop = () => { active = false; c.style.cursor = "grab"; };
      c.addEventListener("pointerup", stop); c.addEventListener("pointercancel", stop);
      return { el: c, set(x, y) { c.setAttribute("cx", X(x)); c.setAttribute("cy", Y(y)); } };
    };
    // arc for the angle from direction p to direction q (math units), radius in math units
    P.angle = function (color, parent) {
      const path = S("path", { fill: "none", stroke: color, "stroke-width": 2 }, parent || gMain);
      return {
        el: path,
        set(p, q, rad) {
          const a0 = Math.atan2(p[1], p[0]), a1 = Math.atan2(q[1], q[0]);
          const sx = X(rad * Math.cos(a0)), sy = Y(rad * Math.sin(a0)), ex = X(rad * Math.cos(a1)), ey = Y(rad * Math.sin(a1));
          const cross = p[0] * q[1] - p[1] * q[0];               // > 0: q is counter-clockwise from p
          const r = rad * s;
          path.setAttribute("d", `M${sx},${sy} A${r},${r} 0 0 ${cross > 0 ? 0 : 1} ${ex},${ey}`);
        },
      };
    };
    return P;
  }

  // ── widget chrome: title, controls, readout, caption with "comes back in" links ─────────────────────────
  function chrome(fig, spec) {
    if (spec.title) H("div", { class: "viz-title" }, fig, spec.title);
    const parts = {};
    if (spec.target) H("div", { class: "viz-target" }, fig, `<span>🎯 Teaching target</span> ${spec.target}`);
    parts.body = H("div", {}, fig);
    parts.ctl = H("div", { class: "viz-ctl" }, fig);
    parts.read = H("div", { class: "viz-read", "aria-live": "polite" }, fig);
    parts.stepBox = H("div", { class: "viz-steps" }, fig);
    parts.stepBox.hidden = true;
    let cap = spec.caption ? `<strong>What to see:</strong> ${spec.caption}` : "";
    // links: "B3" or { id: "B3", why: "the same spring–mass, now inside the accelerometer" }
    if (spec.links && spec.links.length)
      cap += `${cap ? "<br>" : ""}<strong>Connected to:</strong> ` + spec.links.map((l) => {
        const id = typeof l === "string" ? l : l.id, why = typeof l === "string" ? "" : l.why;
        return `<a href="#${id}">${id}</a>${why ? ` <span class="why">${why}</span>` : ""}`;
      }).join(" · ");
    if (cap) H("figcaption", {}, fig, cap);
    // the "math detail" stepper: steps = ["html", …] or [{ html }]; onStep(i) lets the picture follow the derivation.
    // Math inside html uses \\( … \\) or \\[ … \\] (MathJax); it is re-typeset whenever the step changes.
    parts.steps = function (steps, onStep) {
      const box = parts.stepBox;
      box.hidden = false;
      const head = H("div", { class: "viz-steps-head" }, box);
      H("span", { class: "viz-steps-lab" }, head, "Math, step by step");
      const prev = H("button", { type: "button", "aria-label": "previous step" }, head, "◀");
      const count = H("span", { class: "viz-steps-count" }, head);
      const next = H("button", { type: "button", "aria-label": "next step" }, head, "▶");
      const body = H("div", { class: "viz-steps-body" }, box);
      let i = 0;
      function go(k) {
        i = Math.max(0, Math.min(steps.length - 1, k));
        count.textContent = `${i + 1} / ${steps.length}`;
        body.innerHTML = steps.map((s, j) => `<div class="viz-step${j === i ? " on" : j < i ? " done" : ""}">${s.html || s}</div>`).join("");
        typeset(body);
        if (onStep) onStep(i, steps[i]);
      }
      prev.addEventListener("click", () => go(i - 1));
      next.addEventListener("click", () => go(i + 1));
      go(0);
      return { go, get i() { return i; } };
    };
    parts.button = function (label, fn) { const b = H("button", { type: "button" }, parts.ctl, label); b.addEventListener("click", fn); return b; };
    parts.slider = function (label, min, max, step, value, fn) {
      const lab = H("label", {}, parts.ctl, `${label} `);
      const r = H("input", { type: "range", min, max, step, value }, lab);
      const out = H("span", {}, lab);
      const upd = () => { out.textContent = fn(parseFloat(r.value)) || ""; };
      r.addEventListener("input", upd);
      upd();
      return { input: r, refresh: upd, set(v) { r.value = v; upd(); } };
    };
    return parts;
  }

  const registry = {};
  function register(id, spec) { registry[id] = spec; }

  function mount(root, ctx) {
    injectCSS();
    root.querySelectorAll("code.language-viz").forEach((code) => {
      const id = code.textContent.trim();
      const pre = code.closest("pre") || code;
      const fig = document.createElement("figure");
      fig.className = "viz";
      fig.dataset.viz = id;
      pre.replaceWith(fig);
      const spec = registry[id];
      if (!spec) { H("div", { class: "viz-missing" }, fig, `No visual registered with id “${id}”.`); return; }
      try { spec.build(fig, chrome(fig, spec), ctx || {}); }
      catch (err) { console.error(err); H("div", { class: "viz-missing" }, fig, `Visual “${id}” failed: ${err.message}`); }
    });
  }

  // "Builds on / used by" strip under a note's title, from the graph headers (fed_by = builds on)
  function fits(sheet, ctx) {
    const g = ctx.graph, id = ctx.page && ctx.page.id;
    if (!g || !id || !ctx.page.part) return;
    const ins = g.edges.filter((e) => e[1] === id).map((e) => e[0]);
    const outs = g.edges.filter((e) => e[0] === id).map((e) => e[1]);
    const title = (n) => (g.nodes.find((x) => x.id === n) || {}).title || n;
    const chip = (n) => `<a href="#${n}" title="${title(n)}">${n}</a>`;
    const html = `<span class="lbl">Builds on</span> ${ins.length ? ins.map(chip).join(" ") : "<span>school math</span>"}` +
      ` <span class="lbl" style="margin-left:8px">Used by</span> ${outs.length ? outs.map(chip).join(" ") : "<span>—</span>"}`;
    const known = sheet.querySelector(".known");
    const strip = H("div", { class: "viz-fits" }, null, html);
    if (known) known.insertAdjacentElement("afterend", strip);
  }

  // ── MathJax helper for dynamic content (step text, readouts with math) ─────────────────────────────────
  function typeset(el) {
    if (window.__mjReady && window.MathJax && MathJax.typesetPromise) {
      try { MathJax.typesetClear([el]); } catch (e) { /* first time */ }
      MathJax.typesetPromise([el]).catch((err) => console.warn(err));
    }
  }

  // ── colour helpers: hex → [r,g,b], mixing, and ramps for fields (temperature, speed, concentration) ──────
  function rgb(c) {
    if (Array.isArray(c)) return c;
    const h = c.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const css = (c, a) => { const [r, g, b] = rgb(c).map((v) => Math.max(0, Math.min(255, Math.round(v)))); return a === undefined || a >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`; };
  const mix = (c1, c2, t) => { const a = rgb(c1), b = rgb(c2); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; };
  // ramp(t): 0 → deep blue, 0.5 → teal/green, 1 → yellow (viridis-like). ramp(t, "heat"): black-red-yellow. "div": blue-white-red.
  const RAMPS = {
    field: ["#2b1f5c", "#2c5f8a", "#22958b", "#5fc062", "#f4e04d"],
    heat: ["#16070a", "#6b1420", "#c43c1c", "#f08a2c", "#f9e27a"],
    div: ["#2f5fb3", "#8fb3e6", "#eef0f2", "#f0a08f", "#c0392b"],
  };
  function ramp(t, name) {
    const st = RAMPS[name || "field"];
    t = Math.max(0, Math.min(1, t)) * (st.length - 1);
    const i = Math.min(st.length - 2, Math.floor(t));
    return mix(st[i], st[i + 1], t - i);
  }

  // ── 2D chart with real axes (log or linear): frequency responses, calibration curves, time traces ────────
  // const ch = chart(ui.body, { xr:[1,1e4], yr:[-40,10], logx:true, xlabel:"f (Hz)", ylabel:"gain (dB)" });
  // const ln = ch.line(C.yellow, 2.5); ln.set([[x,y],…]);  ch.area(), ch.dot(), ch.vline(), ch.hline(), ch.label()
  function chart(parent, opt) {
    const o = Object.assign({ w: 640, h: 300, xr: [0, 1], yr: [0, 1], logx: false, logy: false, xlabel: "", ylabel: "", ml: 56, mr: 16, mt: 14, mb: 40 }, opt || {});
    const svg = S("svg", { viewBox: `0 0 ${o.w} ${o.h}`, role: "img", "aria-label": o.label || "chart" }, parent);
    const L = Math.log10, pw = o.w - o.ml - o.mr, ph = o.h - o.mt - o.mb;
    const fx = (x) => (o.logx ? (L(x) - L(o.xr[0])) / (L(o.xr[1]) - L(o.xr[0])) : (x - o.xr[0]) / (o.xr[1] - o.xr[0]));
    const fy = (y) => (o.logy ? (L(y) - L(o.yr[0])) / (L(o.yr[1]) - L(o.yr[0])) : (y - o.yr[0]) / (o.yr[1] - o.yr[0]));
    const X = (x) => o.ml + fx(x) * pw, Y = (y) => o.mt + (1 - fy(y)) * ph;
    const gAx = S("g", {}, svg), gMain = S("g", {}, svg), gTop = S("g", {}, svg);
    const t = (x, y, str, col, anc, size, parent2) => { const e = S("text", { x, y, fill: col || C.dim, "font-size": size || 12, "text-anchor": anc || "middle", "dominant-baseline": "middle", "font-family": "var(--font-mono, ui-monospace, monospace)" }, parent2 || gAx); e.textContent = str; return e; };
    function ticks(r, log) {
      if (log) { const out = []; for (let e = Math.ceil(L(r[0]) - 1e-9); e <= L(r[1]) + 1e-9; e++) out.push(Math.pow(10, e)); return out; }
      const span = r[1] - r[0], raw = span / 6, mag = Math.pow(10, Math.floor(L(raw))), step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= 7);
      const out = []; for (let v = Math.ceil(r[0] / step) * step; v <= r[1] + step * 1e-6; v += step) out.push(+v.toPrecision(10)); return out;
    }
    const tl = (v, log) => (log ? (Math.abs(L(v)) >= 3 ? `1e${Math.round(L(v))}` : String(+v.toPrecision(3))) : fmt(v, 3));
    ticks(o.xr, o.logx).forEach((v) => { S("line", { x1: X(v), y1: o.mt, x2: X(v), y2: o.mt + ph, stroke: C.gridFaint }, gAx); t(X(v), o.mt + ph + 14, tl(v, o.logx)); });
    ticks(o.yr, o.logy).forEach((v) => { S("line", { x1: o.ml, y1: Y(v), x2: o.ml + pw, y2: Y(v), stroke: C.gridFaint }, gAx); t(o.ml - 6, Y(v), tl(v, o.logy), C.dim, "end"); });
    S("rect", { x: o.ml, y: o.mt, width: pw, height: ph, fill: "none", stroke: C.grid }, gAx);
    if (o.xlabel) t(o.ml + pw / 2, o.h - 8, o.xlabel, C.text, "middle", 12.5);
    if (o.ylabel) { const e = t(14, o.mt + ph / 2, o.ylabel, C.text, "middle", 12.5); e.setAttribute("transform", `rotate(-90 14 ${o.mt + ph / 2})`); }
    const clipId = "clip" + Math.random().toString(36).slice(2);
    const cp = S("clipPath", { id: clipId }, svg); S("rect", { x: o.ml, y: o.mt, width: pw, height: ph }, cp);
    gMain.setAttribute("clip-path", `url(#${clipId})`);
    const ok = (x, y) => isFinite(x) && isFinite(y) && (!o.logx || x > 0) && (!o.logy || y > 0);
    return {
      svg, X, Y, o, gMain, gTop,
      line(color, width, dash) {
        const p = S("path", { fill: "none", stroke: color, "stroke-width": width || 2.2, "stroke-dasharray": dash || "", "stroke-linejoin": "round" }, gMain);
        return { el: p, set(pts) { let d = "", pen = false; pts.forEach(([x, y]) => { if (!ok(x, y)) { pen = false; return; } d += (pen ? "L" : "M") + X(x).toFixed(1) + "," + Y(y).toFixed(1); pen = true; }); p.setAttribute("d", d); } };
      },
      area(color, alpha) {
        const p = S("path", { fill: color, "fill-opacity": alpha || 0.2, stroke: "none" }, gMain);
        return { el: p, set(lo, hi) { const a = lo.filter(([x, y]) => ok(x, y)), b = hi.filter(([x, y]) => ok(x, y)).reverse(); if (!a.length) { p.setAttribute("d", ""); return; } p.setAttribute("d", "M" + a.concat(b).map(([x, y]) => X(x).toFixed(1) + "," + Y(y).toFixed(1)).join("L") + "Z"); } };
      },
      dot(color, r) { const c = S("circle", { r: r || 4.5, fill: color }, gTop); return { el: c, set(x, y) { if (!ok(x, y)) { c.setAttribute("visibility", "hidden"); return; } c.setAttribute("visibility", "visible"); c.setAttribute("cx", X(x)); c.setAttribute("cy", Y(y)); } }; },
      vline(color, dash) { const l = S("line", { stroke: color, "stroke-width": 1.5, "stroke-dasharray": dash || "5 4" }, gMain); return { el: l, set(x) { l.setAttribute("x1", X(x)); l.setAttribute("x2", X(x)); l.setAttribute("y1", o.mt); l.setAttribute("y2", o.mt + ph); } }; },
      hline(color, dash) { const l = S("line", { stroke: color, "stroke-width": 1.5, "stroke-dasharray": dash || "5 4" }, gMain); return { el: l, set(y) { l.setAttribute("y1", Y(y)); l.setAttribute("y2", Y(y)); l.setAttribute("x1", o.ml); l.setAttribute("x2", o.ml + pw); } }; },
      label(color, size, anchor) { const e = t(0, 0, "", color, anchor || "start", size || 13, gTop); e.setAttribute("paint-order", "stroke"); e.setAttribute("stroke", C.bg); e.setAttribute("stroke-width", 4); return { el: e, set(x, y, str) { e.setAttribute("x", X(x)); e.setAttribute("y", Y(y)); e.textContent = str; } }; },
    };
  }

  // ── a tiny 3D engine on <canvas>: orbit by dragging, painter's-algorithm depth sort, flat shading ───────────
  // World axes: x right, y into the screen, z UP. Units are whatever the widget likes; `scale` = pixels per unit.
  // const sc = scene3d(ui.body, { w:640, h:400, scale:60, yaw:-0.7, pitch:0.45, center:[0,0,0], animate:false,
  //                               draw(g, t, sc) { … } });   sc.render(); sc.setView(yaw, pitch); sc.project([x,y,z])
  // g.line(a,b,col,w,dash) · g.polyline(pts,col,w) · g.poly(pts,col,{alpha,stroke,shade,bias}) · g.box(min,max,col,opts)
  // g.cylinder(a,b,r,col,n,opts) · g.sphere(p,r,col) · g.arrow(a,b,col,w) · g.text(p,str,col,size)
  // g.surface(f(u,v)→[x,y,z], [u0,u1,nu], [v0,v1,nv], colorFn(x,y,z,u,v)→col|null, opts) · g.grid(z,[x0,x1],[y0,y1],step)
  // g.axes(len, ["x","y","z"]) · colours are "#hex" or [r,g,b]. Ctrl/Alt + wheel zooms; double-click resets.
  function scene3d(parent, opt) {
    const o = Object.assign({ w: 640, h: 400, scale: 60, yaw: -0.7, pitch: 0.45, dist: 14, center: [0, 0, 0], animate: false, light: [-0.4, -0.6, 0.75], hint: true }, opt || {});
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cv = H("canvas", { width: o.w * dpr, height: o.h * dpr, role: "img", "aria-label": o.label || "3D diagram — drag to rotate" }, parent);
    if (o.hint) H("div", { class: "viz-hint" }, parent, "↻ drag to rotate · Ctrl + wheel to zoom · double-click to reset the view");
    const ctx = cv.getContext("2d");
    let yaw = o.yaw, pitch = o.pitch, zoom = 1;
    const view0 = [o.yaw, o.pitch];
    const Ln = (() => { const l = o.light, n = Math.hypot(l[0], l[1], l[2]); return [l[0] / n, l[1] / n, l[2] / n]; })();
    // camera transform: world → [screen x, screen y, depth]; larger depth = closer to the viewer
    function cam(p) {
      const x = p[0] - o.center[0], y = p[1] - o.center[1], z = p[2] - o.center[2];
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const x1 = x * cy - y * sy, y1 = x * sy + y * cy;           // spin about z
      const yv = y1 * cp - z * sp, zv = y1 * sp + z * cp;          // tilt: yv = distance into the screen, zv = up
      const k = o.dist / Math.max(0.2, o.dist + yv);               // perspective
      return [o.w / 2 + x1 * o.scale * zoom * k, o.h / 2 - zv * o.scale * zoom * k, -yv];
    }
    let items = [];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const g = {
      line(a, b, col, w, dash) { const A = cam(a), B = cam(b); items.push({ d: (A[2] + B[2]) / 2 + 0.001, f() { ctx.strokeStyle = css(col); ctx.lineWidth = w || 2; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); ctx.setLineDash([]); } }); },
      polyline(pts, col, w, dash) { for (let i = 0; i + 1 < pts.length; i++) g.line(pts[i], pts[i + 1], col, w, dash); },
      poly(pts, col, op) {
        op = op || {};
        const P = pts.map(cam); let d = 0; P.forEach((q) => (d += q[2])); d /= P.length;
        let c = rgb(col);
        if (op.shade !== false && pts.length >= 3) {
          const n = crs(sub(pts[1], pts[0]), sub(pts[2], pts[0])), nl = Math.hypot(n[0], n[1], n[2]) || 1;
          const lam = Math.abs((n[0] * Ln[0] + n[1] * Ln[1] + n[2] * Ln[2]) / nl);
          c = c.map((v) => v * (0.5 + 0.5 * lam));
        }
        items.push({ d: d + (op.bias || 0), f() {
          ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
          ctx.fillStyle = css(c, op.alpha === undefined ? 1 : op.alpha); ctx.fill();
          if (op.stroke) { ctx.strokeStyle = css(op.stroke, op.strokeAlpha || 0.6); ctx.lineWidth = op.strokeWidth || 0.8; ctx.stroke(); }
          else if (op.alpha === undefined || op.alpha >= 1) { ctx.strokeStyle = css(c); ctx.lineWidth = 0.6; ctx.stroke(); } // hide seams
        } });
      },
      box(a, b, col, op) {
        const [x0, y0, z0] = a, [x1, y1, z1] = b;
        const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
        [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]].forEach((f) => g.poly(f.map((i) => v[i]), col, op));
      },
      cylinder(a, b, r, col, n, op) {
        n = n || 18; const ax = sub(b, a), L = Math.hypot(ax[0], ax[1], ax[2]) || 1, u = ax.map((v) => v / L);
        const t0 = Math.abs(u[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]; let e1 = crs(u, t0); const l1 = Math.hypot(e1[0], e1[1], e1[2]); e1 = e1.map((v) => v / l1); const e2 = crs(u, e1);
        const ring = (c) => Array.from({ length: n }, (_, i) => { const th = (2 * Math.PI * i) / n; return [0, 1, 2].map((k) => c[k] + r * (Math.cos(th) * e1[k] + Math.sin(th) * e2[k])); });
        const A = ring(a), B = ring(b);
        for (let i = 0; i < n; i++) { const j = (i + 1) % n; g.poly([A[i], A[j], B[j], B[i]], col, op); }
        if (!op || !op.open) { g.poly(A, col, op); g.poly(B, col, op); }
      },
      sphere(p, r, col) {
        const P = cam(p), R = r * o.scale * zoom * (o.dist / Math.max(0.2, o.dist - P[2]));
        items.push({ d: P[2] + 0.01, f() { const gr = ctx.createRadialGradient(P[0] - R * 0.35, P[1] - R * 0.35, R * 0.1, P[0], P[1], Math.max(0.6, R)); gr.addColorStop(0, css(mix(col, "#ffffff", 0.55))); gr.addColorStop(1, css(mix(col, "#000000", 0.35))); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(P[0], P[1], Math.max(0.5, R), 0, 2 * Math.PI); ctx.fill(); } });
      },
      arrow(a, b, col, w) {
        const A = cam(a), B = cam(b);
        items.push({ d: Math.max(A[2], B[2]) + 0.02, f() {
          const L2 = Math.hypot(B[0] - A[0], B[1] - A[1]); if (L2 < 1) return;
          const ux = (B[0] - A[0]) / L2, uy = (B[1] - A[1]) / L2, hl = Math.min(14, L2 * 0.45), hw = hl * 0.55, cx = B[0] - ux * hl, cy = B[1] - uy * hl;
          ctx.strokeStyle = css(col); ctx.fillStyle = css(col); ctx.lineWidth = w || 3; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(cx, cy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(B[0], B[1]); ctx.lineTo(cx - uy * hw, cy + ux * hw); ctx.lineTo(cx + uy * hw, cy - ux * hw); ctx.closePath(); ctx.fill();
        } });
      },
      text(p, str, col, size, anchor) {
        const P = cam(p);
        items.push({ d: 1e9, f() { ctx.font = `${size || 14}px JetBrains Mono, ui-monospace, monospace`; ctx.textAlign = anchor || "center"; ctx.textBaseline = "middle"; ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.strokeStyle = C.bg; ctx.strokeText(str, P[0], P[1]); ctx.fillStyle = css(col || C.text); ctx.fillText(str, P[0], P[1]); } });
      },
      surface(f, U, V, colorFn, op) {
        const [u0, u1, nu] = U, [v0, v1, nv] = V, pts = [];
        for (let i = 0; i <= nu; i++) { pts.push([]); for (let j = 0; j <= nv; j++) pts[i].push(f(u0 + ((u1 - u0) * i) / nu, v0 + ((v1 - v0) * j) / nv)); }
        for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
          const q = [pts[i][j], pts[i + 1][j], pts[i + 1][j + 1], pts[i][j + 1]];
          const um = u0 + ((u1 - u0) * (i + 0.5)) / nu, vm = v0 + ((v1 - v0) * (j + 0.5)) / nv;
          const c = q.reduce((s, p) => [s[0] + p[0] / 4, s[1] + p[1] / 4, s[2] + p[2] / 4], [0, 0, 0]);
          const col = colorFn ? colorFn(c[0], c[1], c[2], um, vm) : C.blue;
          if (col) g.poly(q, col, op);
        }
      },
      grid(z, xr, yr, step, col) {
        step = step || 1;
        for (let x = xr[0]; x <= xr[1] + 1e-9; x += step) g.line([x, yr[0], z], [x, yr[1], z], col || C.gridFaint, 1);
        for (let y = yr[0]; y <= yr[1] + 1e-9; y += step) g.line([xr[0], y, z], [xr[1], y, z], col || C.gridFaint, 1);
      },
      axes(len, names) {
        const n = names || ["x", "y", "z"];
        [[len, 0, 0], [0, len, 0], [0, 0, len]].forEach((e, i) => { g.arrow([0, 0, 0], e, C.axis, 1.6); g.text(e.map((v) => v * 1.12), n[i], C.dim, 13); });
      },
    };
    const sc = {
      canvas: cv, g, o, t: 0, paused: false,
      project: (p) => cam(p),
      setView(y, p) { yaw = y; pitch = p; sc.render(); },
      get view() { return [yaw, pitch]; },
      render() {
        items = [];
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = C.bg; ctx.fillRect(0, 0, o.w, o.h);
        o.draw(g, sc.t, sc);
        items.sort((a, b) => a.d - b.d);
        items.forEach((it) => it.f());
        if (o.overlay) o.overlay(ctx, sc);
      },
    };
    // orbit by dragging
    let drag = null;
    cv.addEventListener("pointerdown", (e) => { drag = [e.clientX, e.clientY, yaw, pitch]; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const k = o.w / (cv.getBoundingClientRect().width || o.w);
      yaw = drag[2] + ((e.clientX - drag[0]) * k) / 160;
      pitch = Math.max(-1.45, Math.min(1.45, drag[3] + ((e.clientY - drag[1]) * k) / 160));
      if (!o.animate) sc.render();
    });
    const stop = () => (drag = null);
    cv.addEventListener("pointerup", stop); cv.addEventListener("pointercancel", stop);
    cv.addEventListener("dblclick", () => { yaw = view0[0]; pitch = view0[1]; zoom = 1; sc.render(); });
    cv.addEventListener("wheel", (e) => { if (!e.ctrlKey && !e.altKey) return; e.preventDefault(); zoom = Math.max(0.4, Math.min(3, zoom * Math.exp(-e.deltaY / 500))); if (!o.animate) sc.render(); }, { passive: false });
    // animation loop: sc.t = seconds since start (frozen while sc.paused); stops when the figure leaves the page
    if (o.animate) {
      let last = performance.now();
      const frame = (now) => {
        if (!cv.isConnected) return;
        if (!sc.paused) sc.t += Math.max(0, Math.min(0.05, (now - last) / 1000));
        last = now;
        sc.render();
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }
    sc.render();
    return sc;
  }

  // a requestAnimationFrame loop for 2D widgets: loop(el, (t, dt) => …) — stops when el leaves the page
  function loop(el, fn) {
    let last = performance.now(), t = 0, alive = true;
    const frame = (now) => { if (!alive || !el.isConnected) return; const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; t += dt; fn(t, dt); requestAnimationFrame(frame); };
    requestAnimationFrame(frame);
    return { stop() { alive = false; } };
  }

  // seeded random numbers (repeatable noise): const rnd = rng(42); rnd() ∈ [0,1); gauss(rnd) ~ N(0,1)
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function gauss(r) { let u = 0; while (u === 0) u = r(); const v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  // ═══════════════════════════════════════ home page: the concept map ═══════════════════════════════════════
  register("story-map", {
    title: "The map · how the notes feed each other",
    caption: "each box is a note; an arrow means “builds on”. Hover or tap a note: <span style='color:" + C.gold + "'>gold</span> = everything it needs first, <span style='color:" + C.blue + "'>blue</span> = everything that uses it. Click a box to open the note. Drawn from the notes' graph headers.",
    build(fig, ui, ctx) {
      const g = ctx.graph;
      if (!g || !g.nodes.length) { ui.read.textContent = "No graph data."; return; }
      const ids = g.nodes.map((n) => n.id), ins = {}, outs = {};
      ids.forEach((i) => { ins[i] = []; outs[i] = []; });
      g.edges.forEach(([a, b]) => { if (ins[b] && outs[a]) { ins[b].push(a); outs[a].push(b); } });
      const level = {};
      const lv = (i, seen) => {
        if (level[i] !== undefined) return level[i];
        if (seen.has(i)) return 0;
        seen.add(i);
        level[i] = ins[i].length ? 1 + Math.max(...ins[i].map((p) => lv(p, seen))) : 0;
        return level[i];
      };
      ids.forEach((i) => lv(i, new Set()));
      const cols = {};
      ids.forEach((i) => (cols[level[i]] = cols[level[i]] || []).push(i));
      const nCol = Math.max(...Object.keys(cols).map(Number)) + 1, maxRow = Math.max(...Object.values(cols).map((c) => c.length));
      const W = 640, bw = 46, bh = 26, gapX = (W - 40 - bw) / Math.max(1, nCol - 1), gapY = 38, Hh = 30 + maxRow * gapY;
      const svg = S("svg", { viewBox: `0 0 ${W} ${Hh}`, role: "img", "aria-label": "concept map of the notes" }, ui.body);
      const partC = { A: C.blue, B: C.gold, C: C.green, D: C.purple };
      const pos = {};
      Object.entries(cols).forEach(([c, list]) => list.sort().forEach((i, r) => {
        pos[i] = [20 + Number(c) * gapX, 18 + r * gapY + (maxRow - list.length) * gapY / 2];
      }));
      const edgeEls = g.edges.filter(([a, b]) => pos[a] && pos[b]).map(([a, b]) => {
        const [x1, y1] = pos[a], [x2, y2] = pos[b], sx = x1 + bw, sy = y1 + bh / 2, ex = x2, ey = y2 + bh / 2, mx = (sx + ex) / 2;
        return { a, b, el: S("path", { d: `M${sx},${sy} C${mx},${sy} ${mx},${ey} ${ex},${ey}`, fill: "none", stroke: C.dim, "stroke-width": 1.2, opacity: 0.35 }, svg) };
      });
      const boxEls = {};
      ids.forEach((i) => {
        const n = g.nodes.find((x) => x.id === i), [x, y] = pos[i], col = partC[n.part] || C.text;
        const a = S("a", { href: "#" + i, style: "cursor:pointer" }, svg);
        const t = S("title", {}, a); t.textContent = `${i} · ${n.title}`;
        const rect = S("rect", { x, y, width: bw, height: bh, rx: 6, fill: "#151b23", stroke: col, "stroke-width": 1.6 }, a);
        const tx = S("text", { x: x + bw / 2, y: y + bh / 2 + 1, fill: col, "font-size": 13, "font-weight": 600, "text-anchor": "middle", "dominant-baseline": "middle",
          "font-family": "var(--font-mono, ui-monospace, monospace)" }, a);
        tx.textContent = i;
        boxEls[i] = rect;
        const on = () => highlight(i), off = () => highlight(null);
        a.addEventListener("mouseenter", on); a.addEventListener("focus", on); a.addEventListener("mouseleave", off); a.addEventListener("blur", off);
      });
      const closure = (start, nb) => { const out = new Set(), st = [start]; while (st.length) { const c = st.pop(); nb[c].forEach((p) => { if (!out.has(p)) { out.add(p); st.push(p); } }); } return out; };
      function highlight(i) {
        const up = i ? closure(i, ins) : new Set(), down = i ? closure(i, outs) : new Set();
        ids.forEach((k) => {
          const n = g.nodes.find((x) => x.id === k);
          boxEls[k].setAttribute("fill", k === i ? "#2a3442" : up.has(k) ? "#3a2f1a" : down.has(k) ? "#17323d" : "#151b23");
          boxEls[k].setAttribute("opacity", !i || k === i || up.has(k) || down.has(k) ? 1 : 0.35);
          if (k === i) ui.read.innerHTML = `<b>${k}</b> ${n.title} · needs ${up.size} note(s) first · used by ${down.size}`;
        });
        edgeEls.forEach((e) => {
          const hot = i && ((up.has(e.a) || e.a === i) && (up.has(e.b) || e.b === i)) ? C.gold : i && ((down.has(e.b) || e.b === i) && (down.has(e.a) || e.a === i)) ? C.blue : null;
          e.el.setAttribute("stroke", hot || C.dim); e.el.setAttribute("opacity", hot ? 0.95 : i ? 0.12 : 0.35); e.el.setAttribute("stroke-width", hot ? 2 : 1.2);
        });
        if (!i) ui.read.innerHTML = `${ids.length} notes · ${edgeEls.length} “builds on” links · columns = how many steps of prerequisites come before`;
      }
      highlight(null);
    },
  });

  window.VIZ = { mount, fits, register, C, ROLE, S, H, fmt, lerp, ease, plane, chart, scene3d, loop, tween, typeset, rgb, css, mix, ramp, rng, gauss, reduceMotion };
})();
