/* A3 — capacitive sensors: widgets for docs/A3-capacitive-sensors.md */
(function () {
  "use strict";
  const { register, C, scene3d, chart, fmt, mix, ramp } = VIZ;
  const E0 = 8.854e-12;

  // ═════════════════ a3-plates-3d: gap, area, dielectric, differential, fringe ═════════════════
  register("a3-plates-3d", {
    title: "3D · the parallel-plate capacitor: C = ε0 εr A / g, and the differential sandwich",
    target: "After this you can say how C changes when you move, slide or fill a capacitor, why gap sensing is nonlinear, and why (C1 − C2)/(C1 + C2) = x/g0 is exactly linear.",
    caption: "two 1 mm × 1 mm plates (grey); the gap is drawn hugely magnified. Teal lines are the field from + to −; the curved ones at the edges are the fringe field. Slide the top plate sideways to change the overlap area, fill the gap with a dielectric (blue), or switch to the differential sandwich and move the middle plate: one gap shrinks, the other grows, and the ratio stays a straight line.",
    links: [
      { id: "A2", why: "the differential capacitor is the Wheatstone bridge's divide-to-compare idea" },
      { id: "B4", why: "every MEMS accelerometer is this sandwich on a spring" },
      { id: "B5", why: "a microphone membrane is a moving plate" },
      { id: "A1", why: "C ≈ C0(1 + x/g0) is linearising around x = 0" },
    ],
    build(fig, ui) {
      let g0 = 2, ov = 1, er = 1, x = 0.2, diff = false, step = -1;   // g0 in µm, ov overlap fraction, x in µm
      const SIDE = 3, ZS = 0.42, PT = 0.07;                           // drawn plate side, z-units per µm, plate thickness
      const cap = (gum, area) => (E0 * er * area * 1e-6) / (gum * 1e-6) * 1e12;   // pF, area in mm²
      const sc = scene3d(ui.body, {
        w: 640, h: 330, scale: 66, yaw: -0.62, pitch: 0.38, center: [0.2, 0, 0.34],
        draw(g) {
          const h = SIDE / 2, shift = (1 - ov) * SIDE;
          const plate = (z, dx, col, lab, op) => {
            g.box([-h + dx, -h, z - PT], [h + dx, h, z], col, op);
            if (lab) g.text([h + dx + 0.3, h, z], lab, C.text, 15, "start");
          };
          const fieldBright = step === 1 ? 1 : 0.75;
          const drawGap = (zb, zt, sign, fr) => {
            // dielectric fill
            if (er > 1.01) {
              const a = Math.min(0.55, 0.12 + 0.1 * Math.log(er));
              g.box([-h + shift, -h, zb + 0.005], [h, h, zt - 0.005], C.blue, { alpha: a, shade: false });
            }
            // straight field lines in the overlap
            const n = 5;
            for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
              const xx = -h + shift + ((i + 0.5) * (SIDE - shift)) / n, yy = -h + ((j + 0.5) * SIDE) / n;
              const a = [xx, yy, sign > 0 ? zt - PT * 0 : zb], b = [xx, yy, sign > 0 ? zb : zt];
              g.line(a, b, mix(C.teal, C.bg, 1 - fieldBright), step === 1 ? 2 : 1.4);
            }
            // fringe arcs at the four edges (bulge grows with the gap)
            const bul = (zt - zb) * 0.55 + 0.06, fc = step === 6 ? C.teal : mix(C.teal, C.bg, 0.55), fw = step === 6 ? 2.2 : 1.2;
            for (let k = 0; k < 3; k++) {
              const t = -h + ((k + 0.5) * SIDE) / 3;
              const arc = (p0, out) => { const pts = []; for (let s = 0; s <= 10; s++) { const u = s / 10, z = zb + (zt - zb) * u, o = Math.sin(Math.PI * u) * bul * fr; pts.push([p0[0] + out[0] * o, p0[1] + out[1] * o, z]); } g.polyline(pts, fc, fw); };
              arc([h, t], [1, 0]); arc([-h + shift, t], [-1, 0]);
              arc([(shift + SIDE) / 2 - h + ((k - 1) * (SIDE - shift)) / 3.2, -h], [0, -1]);
              arc([(shift + SIDE) / 2 - h + ((k - 1) * (SIDE - shift)) / 3.2, h], [0, 1]);
            }
          };
          if (!diff) {
            const gd = g0 * ZS;
            plate(0, 0, C.silicon, "−q");
            plate(gd + PT, shift, mix(C.silicon, C.white, 0.15), "+q", { alpha: 0.7, bias: 50 });
            drawGap(0, gd, 1, 1);
            if (step === 1) g.text([-h - 0.4, 0, gd / 2], "𝓔 = q/(ε0 εr A)", C.teal, 13, "end");
            if (step === 6) {
              const d = g0 * 1e-3, a = Math.sqrt(ov), f = 1 + (d / (Math.PI * a)) * (1 + Math.log((2 * Math.PI * a) / d));
              g.text([-h - 0.75, 0, gd / 2], "fringe: +" + fmt((f * f - 1) * 100, 2) + " % at g = " + fmt(g0, 2) + " µm", C.teal, 13, "end");
            }
            if (step === 2 || step === 3) {
              g.arrow([-h - 0.35, -h, gd / 2], [-h - 0.35, -h, gd], C.purple, 2.2);
              g.arrow([-h - 0.35, -h, gd / 2], [-h - 0.35, -h, 0], C.purple, 2.2);
              g.text([-h - 0.6, -h, gd / 2], "g = " + fmt(g0, 2) + " µm", C.purple, 13, "end");
            }
            if (step === 3 || step === 4) g.text([0, h + 0.3, gd + 0.85], "C = " + fmt(cap(g0, ov), 3) + " pF", C.yellow, 15);
            if (step === 4) {
              const xx = Math.min(0.9 * g0, Math.abs(x)), c1 = cap(g0 - xx, ov), c0 = cap(g0, ov);
              g.text([0, h + 0.3, gd + 0.5], "move " + fmt(xx, 2) + " µm: C/C0 = " + fmt(c1 / c0, 4) + " (linear guess " + fmt(1 + xx / g0, 3) + ")", C.dim, 12);
            }
          } else {
            const gA = (g0 - x) * ZS, gB = (g0 + x) * ZS;              // top gap (C1) shrinks when x > 0
            const zMid = gB + PT, zTop = zMid + gA + PT;
            plate(0, 0, C.silicon, "");
            plate(zMid, 0, C.purple, "", { alpha: 0.75, bias: 40 });
            plate(zTop, 0, C.silicon, "", { alpha: 0.7, bias: 50 });
            const keepShift = ov; ov = 1; drawGap(zMid, zTop - PT, 1, 1); drawGap(0, zMid - PT, -1, 1); ov = keepShift;
            g.text([-h - 0.6, -h, zMid + gA / 2], "C1 = " + fmt(cap(g0 - x, 1), 3) + " pF", C.yellow, 13, "end");
            g.text([-h - 0.6, -h, gB / 2], "C2 = " + fmt(cap(g0 + x, 1), 3) + " pF", C.yellow, 13, "end");
            g.arrow([h + 0.6, 0, zMid - 0.05], [h + 0.6, 0, zMid - 0.05 + Math.sign(x || 1) * 0.45], C.purple, 2.6);
            g.text([h + 0.8, 0, zMid + 0.15], "moves x", C.purple, 13, "start");
          }
        },
      });
      function upd() {
        let html;
        if (!diff) {
          const c = cap(g0, ov);
          html = `<span style="color:${C.purple}">g = ${fmt(g0, 2)} µm</span> · overlap A = ${fmt(ov, 2)} mm² · <span style="color:${C.blue}">εr = ${fmt(er, 1)}</span> → ` +
            `<span style="color:${C.yellow}">C = ε0εrA/g = ${fmt(c, 3)} pF</span> · slope C/g = ${fmt(c / g0, 3)} pF/µm`;
        } else {
          const c1 = cap(g0 - x, 1), c2 = cap(g0 + x, 1);
          html = `differential, g0 = ${fmt(g0, 2)} µm, <span style="color:${C.purple}">x = ${fmt(x, 2)} µm</span> (${fmt(x / g0, 3)} g0) · ` +
            `<span style="color:${C.yellow}">C1 = ${fmt(c1, 3)} pF, C2 = ${fmt(c2, 3)} pF</span><br>` +
            `(C1 − C2)/(C1 + C2) = <b>${fmt((c1 - c2) / (c1 + c2), 4)}</b> = x/g0 = ${fmt(x / g0, 4)} · one-sided C1/C0 = ${fmt(c1 / cap(g0, 1), 4)} (linear guess ${fmt(1 + x / g0, 3)})`;
        }
        ui.read.innerHTML = html;
        sc.render();
      }
      ui.slider("gap g", 0.6, 4, 0.05, g0, (v) => { g0 = v; if (Math.abs(x) > 0.8 * g0) x = Math.sign(x) * 0.8 * g0; upd(); return fmt(v, 2) + " µm"; });
      const ovS = ui.slider("overlap", 0.2, 1, 0.05, ov, (v) => { ov = v; upd(); return fmt(v * 100, 0) + " %"; });
      const erS = ui.slider("εr", 1, 80, 0.5, er, (v) => { er = v; upd(); return fmt(v, 1); });
      const xS = ui.slider("middle plate x", -1.2, 1.2, 0.02, x, (v) => { x = Math.max(-0.8 * g0, Math.min(0.8 * g0, v)); upd(); return fmt(x, 2) + " µm"; });
      const db = ui.button("differential: off", () => { diff = !diff; db.textContent = "differential: " + (diff ? "on" : "off"); upd(); });
      const setDiff = (d) => { diff = d; db.textContent = "differential: " + (d ? "on" : "off"); };
      ui.steps([
        "Put \\( +q \\) on the top plate and \\( -q \\) on the bottom one. Charge per area: \\( q/A \\).",
        "Gauss's law: between large plates the field is uniform, \\( \\mathcal E=\\dfrac{q}{\\varepsilon_0\\varepsilon_rA} \\) (the straight teal lines).",
        "The voltage is field times distance: \\( V=\\mathcal E\\,g=\\dfrac{q\\,g}{\\varepsilon_0\\varepsilon_rA} \\).",
        "So \\( C=\\dfrac{q}{V}=\\dfrac{\\varepsilon_0\\varepsilon_rA}{g} \\): 4.427 pF for 1 mm² at 2 µm in air. Three knobs: gap, overlap, \\( \\varepsilon_r \\).",
        "Move a plate by \\( x \\): \\( C=\\dfrac{C_0}{1-x/g_0}=C_0(1+u+u^2+\\dots) \\), \\( u=x/g_0 \\). The \\( u^2 \\) term is the nonlinearity.",
        "The differential sandwich: \\( C_{1,2}=\\dfrac{C_0}{1\\mp u} \\), so \\( \\dfrac{C_1-C_2}{C_1+C_2}=u=\\dfrac{x}{g_0} \\) exactly. \\( C_0 \\), \\( \\varepsilon_r \\) and temperature cancel.",
        "Fringe fields (bright arcs) add capacitance at the edges: about +1% for a 2 µm gap under a 1 mm plate, but +144% when the gap is half the plate size.",
      ], (i) => {
        step = i;
        if (i <= 4 && diff) setDiff(false);
        if (i === 5) setDiff(true);
        if (i === 6 && diff) setDiff(false);
        if (i <= 3) { if (ov !== 1) ovS.set(1); if (er !== 1) erS.set(1); }
        upd();
      });
      xS.refresh();
    },
  });

  // ═════════════════ a3-touch-grid-3d: a mutual-capacitance touchscreen ═════════════════
  register("a3-touch-grid-3d", {
    title: "3D · a touchscreen: a finger steals mutual capacitance from a grid of electrodes",
    target: "After this you can explain how a phone finds a finger to sub-millimetre precision with 5 mm electrodes, and why mutual capacitance handles two fingers where self-capacitance sees ghosts.",
    caption: "rows (teal, transmitters) and columns (light teal, receivers) under the cover glass, 5 mm apart. Below them is the controller's heatmap: one bar per crossing, height = how much mutual capacitance the finger (blue) removed. The yellow ring is the centroid estimate; the dashed line drops from the true fingertip. Lift the finger to see the signal fade; switch to self-capacitance with two fingers to see the ghosts (red).",
    links: [
      { id: "A1", why: "position is the stimulus, a ΔC map is the output" },
      { id: "A8", why: "noise on each node sets how finely the centroid can be trusted" },
      { id: "A5", why: "a camera is also a grid of sensors read as an image" },
      { id: "A9", why: "tracking a moving finger between frames is a filtering problem" },
    ],
    build(fig, ui) {
      const NC = 6, NR = 8, P = 1;                       // columns along x, rows along y, pitch (1 unit = 5 mm)
      let fx = 2.3, fy = 3.6, fh = 0, two = false, self = false;
      const f2 = [4.0, 1.3];
      const blob = (px, py, qx, qy, hmm) => 0.15 * Math.exp(-((px - qx) ** 2 + (py - qy) ** 2) / (2 * 0.62 ** 2)) / (1 + (hmm / 1.5) ** 2);
      const fingers = () => (two ? [[fx, fy], f2] : [[fx, fy]]);
      const dC = (i, j) => fingers().reduce((s, f) => s + blob(i, j, f[0], f[1], fh), 0);
      const rowSig = (j) => fingers().reduce((s, f) => s + 0.6 * Math.exp(-((j - f[1]) ** 2) / (2 * 0.8 ** 2)) / (1 + (fh / 1.5) ** 2), 0);
      const colSig = (i) => fingers().reduce((s, f) => s + 0.6 * Math.exp(-((i - f[0]) ** 2) / (2 * 0.8 ** 2)) / (1 + (fh / 1.5) ** 2), 0);
      function centroid(cx, cy) {
        let best = [0, 0, -1];
        for (let i = 0; i < NC; i++) for (let j = 0; j < NR; j++) {
          if (Math.hypot(i - cx, j - cy) > 1.6) continue;
          const v = dC(i, j); if (v > best[2]) best = [i, j, v];
        }
        let sx = 0, sy = 0, sw = 0;
        for (let i = best[0] - 1; i <= best[0] + 1; i++) for (let j = best[1] - 1; j <= best[1] + 1; j++) {
          if (i < 0 || j < 0 || i >= NC || j >= NR) continue;
          const v = dC(i, j); sx += v * i; sy += v * j; sw += v;
        }
        return sw > 1e-6 ? [sx / sw, sy / sw, best[2]] : [cx, cy, 0];
      }
      const ZB = -1.9, HB = 9;                          // heatmap base and bar height per pF
      const sc = scene3d(ui.body, {
        w: 640, h: 400, scale: 40, yaw: -0.55, pitch: 0.62, center: [2.5, 3.5, -0.6],
        draw(g) {
          const x0 = -0.5, x1 = NC - 0.5, y0 = -0.5, y1 = NR - 0.5;
          // heatmap tiles and bars
          for (let i = 0; i < NC; i++) for (let j = 0; j < NR; j++) {
            const v = self ? 0 : dC(i, j), t = Math.min(1, v / 0.15);
            g.poly([[i - 0.45, j - 0.45, ZB], [i + 0.45, j - 0.45, ZB], [i + 0.45, j + 0.45, ZB], [i - 0.45, j + 0.45, ZB]], ramp(t * 0.85), { shade: false });
            if (v > 0.004) g.box([i - 0.28, j - 0.28, ZB], [i + 0.28, j + 0.28, ZB + v * HB], ramp(0.25 + t * 0.75));
          }
          // self-capacitance profiles at the edges
          if (self) {
            for (let j = 0; j < NR; j++) { const v = rowSig(j); if (v > 0.01) g.box([x0 - 1.0, j - 0.25, ZB], [x0 - 0.5, j + 0.25, ZB + v * 1.3], C.teal); }
            for (let i = 0; i < NC; i++) { const v = colSig(i); if (v > 0.01) g.box([i - 0.25, y1 + 0.5, ZB], [i + 0.25, y1 + 1.0, ZB + v * 1.3], mix(C.teal, C.white, 0.4)); }
            g.text([x0 - 0.75, y0 - 0.9, ZB], "row strips", C.teal, 12);
            g.text([x1 + 0.9, y1 + 0.75, ZB], "column strips", C.teal, 12);
          }
          g.grid(ZB - 0.001, [x0, x1], [y0, y1], 1, C.gridFaint);
          // electrodes: rows at z=0 (Tx) along x, columns at z=0.12 (Rx) along y
          for (let j = 0; j < NR; j++) g.line([x0, j, 0], [x1, j, 0], C.teal, 3);
          for (let i = 0; i < NC; i++) g.line([i, y0, 0.12], [i, y1, 0.12], mix(C.teal, C.white, 0.45), 3);
          // cover glass
          g.box([x0 - 0.2, y0 - 0.2, 0.2], [x1 + 0.2, y1 + 0.2, 0.42], "#cfe3ea", { alpha: 0.12, shade: false, stroke: "#9fb7c2", strokeAlpha: 0.35 });
          // fingers
          fingers().forEach((f, k) => {
            const zt = 0.42 + fh * 0.5 + 0.55;
            g.sphere([f[0], f[1], zt], 0.5, k === 0 ? C.blue : mix(C.blue, C.white, 0.2));
            g.cylinder([f[0], f[1], zt], [f[0] + 1.0, f[1] + 1.4, zt + 2.6], 0.5, mix(C.blue, C.bg, 0.25), 12, { alpha: 0.6 });
            g.line([f[0], f[1], zt - 0.6], [f[0], f[1], ZB], mix(C.blue, C.bg, 0.3), 1.2, [4, 4]);
          });
          // estimates
          if (!self) {
            fingers().forEach((f) => {
              const c = centroid(f[0], f[1]);
              if (c[2] > 0.003) {
                const ring = []; for (let a = 0; a <= 24; a++) ring.push([c[0] + 0.35 * Math.cos((a * Math.PI) / 12), c[1] + 0.35 * Math.sin((a * Math.PI) / 12), 0.44]);
                g.polyline(ring, C.yellow, 2.4);
              }
            });
          } else if (two) {
            // self-capacitance: every touched row × touched column is a candidate; two are ghosts
            const cand = [[fx, fy], f2, [fx, f2[1]], [f2[0], fy]];
            cand.forEach((c, k) => {
              const ring = []; for (let a = 0; a <= 24; a++) ring.push([c[0] + 0.4 * Math.cos((a * Math.PI) / 12), c[1] + 0.4 * Math.sin((a * Math.PI) / 12), 0.44]);
              g.polyline(ring, k < 2 ? C.yellow : C.red, 2.4);
              if (k >= 2) g.text([c[0], c[1], 0.9], "ghost?", C.red, 12);
            });
          }
        },
      });
      function upd() {
        const c = centroid(fx, fy), err = Math.hypot(c[0] - fx, c[1] - fy) * 5;
        const peak = dC(Math.round(Math.max(0, Math.min(NC - 1, fx))), Math.round(Math.max(0, Math.min(NR - 1, fy))));
        ui.read.innerHTML = self
          ? `<b>self-capacitance</b>: ${NR} row + ${NC} column measurements (vs ${NR * NC} crossings) · each strip only says "touched somewhere along me"` +
            (two ? `<br><span style="color:${C.red}">two fingers → 2 rows × 2 columns = 4 candidate points, 2 of them ghosts</span>` : "")
          : `finger at (${fmt(fx * 5, 1)}, ${fmt(fy * 5, 1)}) mm, ${fmt(fh, 1)} mm above the glass · nearest node ΔC = <span style="color:${C.yellow}">${fmt(peak * 1000, 0)} fF</span> of ~1 pF<br>` +
            `3×3 centroid → (${fmt(c[0] * 5, 2)}, ${fmt(c[1] * 5, 2)}) mm · <span style="color:${C.red}">error ${fmt(err, 2)} mm</span> with a 5 mm electrode pitch` + (two ? " · two separate blobs: no ghosts" : "");
        sc.render();
      }
      ui.slider("finger x", 0, NC - 1, 0.05, fx, (v) => { fx = v; upd(); return fmt(v * 5, 1) + " mm"; });
      ui.slider("finger y", 0, NR - 1, 0.05, fy, (v) => { fy = v; upd(); return fmt(v * 5, 1) + " mm"; });
      ui.slider("height", 0, 6, 0.1, fh, (v) => { fh = v; upd(); return fmt(v, 1) + " mm"; });
      const mb = ui.button("mode: mutual", () => { self = !self; mb.textContent = "mode: " + (self ? "self" : "mutual"); upd(); });
      const tb = ui.button("fingers: 1", () => { two = !two; tb.textContent = "fingers: " + (two ? 2 : 1); upd(); });
      upd();
    },
  });

  // ═════════════════ a3-rc-timing: soil moisture read by RC charging time ═════════════════
  register("a3-rc-timing", {
    title: "Readout · a soil probe read by timing: t½ = RC ln 2",
    target: "After this you can turn a soil water content into a permittivity, a capacitance and a charging time that a microcontroller can count.",
    caption: "the probe charges through 1 MΩ from 3.3 V. Wetter soil means a larger εr (Topp equation), a larger C and a slower curve (yellow); the dashed green curve is dry soil for comparison. The microcontroller only has to time when the curve crosses half the supply.",
    links: [
      { id: "A1", why: "the charging curve is the first-order lag with τ = RC" },
      { id: "A7", why: "an RC filter is the same circuit used on purpose" },
      { id: "A8", why: "each soil type needs its own calibration" },
      { id: "C4", why: "water held in soil pores by capillarity is what the probe sees" },
    ],
    build(fig, ui) {
      let th = 0.3;
      const R = 1e6, VS = 3.3, CH = 2, EB = 4.4;
      const topp = (q) => 3.03 + 9.3 * q + 146 * q * q - 76.7 * q * q * q;
      const capOf = (q) => CH * (topp(q) + EB);                      // pF
      const ch = chart(ui.body, { xr: [0, 150], yr: [0, 3.5], xlabel: "time t (µs)", ylabel: "probe voltage (V)", h: 290 });
      const half = ch.hline(C.dim), dry = ch.line(C.green, 1.8, "6 4"), cur = ch.line(C.yellow, 3), vl = ch.vline(C.yellow), vd = ch.vline(C.green, "2 4");
      const lab = ch.label(C.yellow, 12.5), labD = ch.label(C.green, 12), labH = ch.label(C.dim, 11.5);
      function draw() {
        const Cn = capOf(th), Cd = capOf(0.05), tau = R * Cn * 1e-6, tauD = R * Cd * 1e-6;   // µs
        const curve = (tt) => { const p = []; for (let t = 0; t <= 150; t += 1) p.push([t, VS * (1 - Math.exp(-t / tt))]); return p; };
        cur.set(curve(tau)); dry.set(curve(tauD)); half.set(VS / 2);
        vl.set(tau * Math.LN2); vd.set(tauD * Math.LN2);
        lab.set(Math.min(tau * Math.LN2 + 3, 105), 1.1, "t½ = " + fmt(tau * Math.LN2, 1) + " µs");
        labD.set(tauD * Math.LN2 + 2, 0.45, "dry " + fmt(tauD * Math.LN2, 1) + " µs");
        labH.set(120, VS / 2 + 0.14, "V_ex / 2");
        ui.read.innerHTML =
          `<span style="color:${C.blue}">water content θ = ${fmt(th, 2)}</span> → εr(soil) = 3.03 + 9.3θ + 146θ² − 76.7θ³ = ${fmt(topp(th), 2)} → ` +
          `<span style="color:${C.teal}">C = 2 pF × (${fmt(topp(th), 2)} + 4.4) = ${fmt(Cn, 1)} pF</span><br>` +
          `τ = RC = ${fmt(tau, 1)} µs → <span style="color:${C.yellow}">t½ = RC ln 2 = ${fmt(tau * Math.LN2, 1)} µs</span> (dry soil θ = 0.05: ${fmt(tauD * Math.LN2, 1)} µs) · at a 16 MHz timer: ${fmt(tau * Math.LN2 * 16, 0)} ticks`;
      }
      ui.slider("water content θ", 0, 0.45, 0.01, th, (v) => { th = v; draw(); return fmt(v, 2); });
    },
  });
})();
