/* A1 — what a sensor is: widgets for docs/A1-what-a-sensor-is-transduction-and-the-measurement-chain.md */
(function () {
  "use strict";
  const { register, C, ROLE, scene3d, chart, fmt, mix, reduceMotion } = VIZ;

  // ═════════════════ a1-chain-3d: the kitchen scale as a measurement chain ═════════════════
  register("a1-chain-3d", {
    title: "3D · the measurement chain of a kitchen scale: mass → strain → ΔR/R → mV → V → counts",
    target: "After this you can follow a stimulus through every stage of a sensor and get the total sensitivity by multiplying the stage gains.",
    caption: "the flour (blue, the stimulus) bends the load-cell bar; the foil gauges near its root stretch; the bridge, amplifier and ADC pass the signal along (teal pulses) until the display shows a number (yellow). Above each arrow is the signal travelling on it; under each stage is that stage's gain. Step through the math to multiply the gains one at a time. The same chain, with a photodiode instead of the bar, is a smartwatch pulse sensor.",
    links: [
      { id: "A2", why: "the strain gauges and the full bridge of stages 1–2" },
      { id: "A7", why: "the amplifier and ADC of stages 3–4" },
      { id: "A8", why: "why one count (0.12 g) is not the real resolution" },
      { id: "B3", why: "how much the bar bends: beam mechanics" },
    ],
    build(fig, ui) {
      const K_EPS = 200e-6, GF = 2, VEX = 5, G = 128, DV = 2.048 / 65536, Y0 = 1200;
      let m = 0.25, step = -1;
      const X = { scale: -4.6, bridge: -1.5, amp: 0.6, adc: 2.95, disp: 5.15 }, ZC = 0.9;
      const vals = () => {
        const eps = K_EPS * m, dRR = GF * eps, vb = VEX * dRR, va = G * vb, n = Math.min(65535, va / DV);
        return { eps, dRR, vb, va, n, y: Y0 + n, mg: (n / (K_EPS * GF * VEX * G / DV)) * 1000 };
      };
      const hl = (k) => step < 0 || step === k || step === 6;
      const lab = (k) => (step === k ? C.yellow : C.dim);

      function beam(g, d) {
        // cantilever from x0 (root) to x1 (tip); tip deflection d; top surface tinted by strain (largest at the root)
        const x0 = -5.9, x1 = -3.55, n = 10, hw = 0.32, th = 0.2, zb = 0.75;
        const w = (u) => -d * u * u * (3 - u) / 2;
        const strainTint = (u) => mix(C.silicon, C.blue, Math.min(1, (m / 5) * (1 - u) * 1.6 + 0.05));
        for (let i = 0; i < n; i++) {
          const u0 = i / n, u1 = (i + 1) / n, xa = x0 + (x1 - x0) * u0, xb = x0 + (x1 - x0) * u1, za = zb + w(u0), zbb = zb + w(u1);
          g.poly([[xa, -hw, za + th], [xb, -hw, zbb + th], [xb, hw, zbb + th], [xa, hw, za + th]], hl(1) ? strainTint((u0 + u1) / 2) : C.silicon, { bias: 0.02 });
          g.poly([[xa, -hw, za], [xb, -hw, zbb], [xb, -hw, zbb + th], [xa, -hw, za + th]], C.silicon);
          g.poly([[xa, hw, za], [xb, hw, zbb], [xb, hw, zbb + th], [xa, hw, za + th]], C.silicon);
          g.poly([[xa, -hw, za], [xb, -hw, zbb], [xb, hw, zbb], [xa, hw, za]], C.silicon);
        }
        // foil gauge serpentine near the root, on the top surface
        const gcol = hl(2) || hl(1) ? C.teal : mix(C.teal, C.bg, 0.5);
        const ga = 0.07, gb = 0.32, loops = 5, pts = [];
        for (let k = 0; k <= loops * 2; k++) {
          const yy = -0.22 + (0.44 * k) / (loops * 2);
          const ua = ga, ub = gb;
          const p1 = [x0 + (x1 - x0) * ua, yy, zb + th + w(ua) + 0.012], p2 = [x0 + (x1 - x0) * ub, yy, zb + th + w(ub) + 0.012];
          if (k % 2 === 0) pts.push(p1, p2); else pts.push(p2, p1);
        }
        g.polyline(pts, gcol, 2);
        return { tip: [x1, 0, zb + th + w(1)] };
      }

      const sc = scene3d(ui.body, {
        w: 640, h: 236, scale: 46, yaw: -0.03, pitch: 0.42, center: [-0.15, 0, 0.42], animate: !reduceMotion,
        draw(g, t) {
          const v = vals();
          const d = 0.32 * Math.min(m, 5) / 5;
          // ── stage 0/1: base, post, bar, pan, flour ──
          g.box([-6.3, -0.9, -0.05], [-2.85, 0.9, 0.12], mix(C.silicon, C.bg, 0.45));
          g.box([-6.25, -0.32, 0.12], [-5.9, 0.32, 0.95], C.silicon);
          const b = beam(g, d);
          const zp = b.tip[2];
          g.box([-3.75, -0.12, zp], [-3.5, 0.12, zp + 0.22], C.silicon);
          g.box([-4.45, -0.85, zp + 0.22], [-2.85, 0.85, zp + 0.3], mix(C.silicon, C.white, 0.15));
          if (m > 0.001) {
            const hgt = 0.12 + 0.16 * m;
            g.box([-4.05, -0.45, zp + 0.3], [-3.25, 0.45, zp + 0.3 + hgt], hl(0) ? C.blue : mix(C.blue, C.bg, 0.5));
            g.text([-3.65, 0, zp + 0.55 + hgt], "m = " + fmt(m, 2) + " kg", C.blue, 13);
          }
          // ── stage 2: full bridge (diamond of four resistors) ──
          const bx = X.bridge, r = 0.55, bcol = hl(3) ? C.teal : mix(C.teal, C.bg, 0.55);
          const top = [bx, 0, ZC + r], bot = [bx, 0, ZC - r], lef = [bx - r, 0, ZC], rig = [bx + r, 0, ZC];
          [[top, lef], [top, rig], [lef, bot], [rig, bot]].forEach(([p, q], i) => {
            const zz = [];
            for (let k = 0; k <= 8; k++) {
              const f = k / 8, base = [p[0] + (q[0] - p[0]) * f, 0, p[2] + (q[2] - p[2]) * f];
              const off = k > 1 && k < 7 ? ((k % 2 ? 1 : -1) * 0.09) : 0;
              zz.push([base[0] + off * 0.7, 0, base[2] + off * 0.7]);
            }
            g.polyline(zz, (i === 0 || i === 3) ? bcol : mix(bcol, C.white, 0.15), 2.2);
          });
          [top, bot, lef, rig].forEach((p) => g.sphere(p, 0.07, bcol));
          g.text([bx, 0, ZC + r + 0.22], "+5 V", C.dim, 11);
          // ── stage 3: amplifier (triangle prism) ──
          const ax = X.amp, acol = hl(4) ? C.teal : mix(C.teal, C.bg, 0.55);
          const A = (y) => [[ax - 0.55, y, ZC + 0.6], [ax - 0.55, y, ZC - 0.6], [ax + 0.6, y, ZC]];
          const A1 = A(-0.28), A2 = A(0.28);
          g.poly(A1, acol, { alpha: 0.55, stroke: acol, strokeAlpha: 1 });
          g.poly(A2, acol, { alpha: 0.35 });
          for (let i = 0; i < 3; i++) { const j = (i + 1) % 3; g.poly([A1[i], A1[j], A2[j], A2[i]], acol, { alpha: 0.35 }); }
          g.text([ax - 0.2, -0.3, ZC], "×" + G, C.text, 12);
          // ── stage 4: ADC with a staircase on its face ──
          const dx = X.adc, dcol = hl(5) ? C.yellow : mix(C.yellow, C.bg, 0.55);
          g.box([dx - 0.55, -0.3, ZC - 0.55], [dx + 0.55, 0.3, ZC + 0.55], "#1d2530");
          const stair = [];
          for (let k = 0; k < 6; k++) { const xa = dx - 0.42 + k * 0.14, za = ZC - 0.4 + k * 0.14; stair.push([xa, -0.32, za], [xa + 0.14, -0.32, za]); }
          g.polyline(stair, dcol, 2.2);
          // ── stage 5: display ──
          const sx = X.disp;
          g.box([sx - 0.75, -0.3, ZC - 0.45], [sx + 0.75, 0.3, ZC + 0.45], "#141a22");
          g.poly([[sx - 0.65, -0.31, ZC - 0.33], [sx + 0.65, -0.31, ZC - 0.33], [sx + 0.65, -0.31, ZC + 0.33], [sx - 0.65, -0.31, ZC + 0.33]], "#203018", { shade: false });
          g.text([sx, -0.35, ZC], fmt(v.mg, 1) + " g", step === 6 || step < 0 ? C.yellow : mix(C.yellow, C.bg, 0.3), 16);
          // ── arrows between stages, with the signal on them ──
          const arr = [[-2.75, X.bridge - r - 0.08], [X.bridge + r + 0.08, X.amp - 0.62], [X.amp + 0.68, X.adc - 0.62], [X.adc + 0.62, X.disp - 0.82]];
          arr.forEach(([a, b2], i) => {
            const k = i + 2, col = hl(k + 1) || hl(k) ? (i === 3 ? C.yellow : C.teal) : mix(C.teal, C.bg, 0.6);
            g.arrow([a, 0, ZC], [b2, 0, ZC], col, 2.4);
            if (!reduceMotion && m > 0.001) {
              const f = (t * 0.7 + i * 0.27) % 1;
              g.sphere([a + (b2 - a) * f, 0, ZC], 0.075, i === 3 ? C.yellow : C.teal);
            }
          });
          // ── three rows under each stage: name, gain, what comes out ──
          const rows = [
            [X.scale, "load cell", "200 µε/kg · GF 2", "ΔR/R = " + fmt(v.dRR * 1e6, 0) + " ppm", 1, C.blue],
            [X.bridge, "full bridge", "× V_ex = 5 V", fmt(v.vb * 1e3, 2) + " mV", 3, C.teal],
            [X.amp, "amplifier", "× G = 128", fmt(v.va * 1e3, 0) + " mV", 4, C.teal],
            [X.adc, "16-bit ADC", "÷ 31.25 µV", fmt(v.n, 0) + " counts", 5, C.yellow],
            [X.disp, "display", "(y − y0)/S", fmt(v.mg, 1) + " g", 6, C.yellow],
          ];
          rows.forEach(([x, n1, n2, n3, k, col]) => {
            const on = step === k || (k === 1 && step === 2);
            g.text([x, 0, -0.4], n1, on ? C.yellow : C.text, 13);
            g.text([x, 0, -0.72], n2, on ? C.yellow : C.dim, 11.5);
            g.text([x, 0, -1.04], "→ " + n3, hl(k) || (k === 1 && hl(2)) ? col : mix(col, C.bg, 0.5), 12.5);
          });
          if (hl(1)) g.text([-5.45, -0.4, 1.35], "ε = " + fmt(v.eps * 1e6, 0) + " µε", C.blue, 12);
        },
      });

      ui.slider("mass m", 0, 5, 0.05, m, (val) => { m = val; upd(); return fmt(m, 2) + " kg"; });
      function upd() {
        const v = vals();
        ui.read.innerHTML =
          `<span style="color:${C.blue}">m = ${fmt(m * 1000, 0)} g</span> → ε = ${fmt(v.eps * 1e6, 0)} µε → ΔR/R = ${fmt(v.dRR * 1e6, 0)} ppm → ` +
          `<span style="color:${C.teal}">V_out = ${fmt(v.vb * 1e3, 3)} mV → ${fmt(v.va * 1e3, 1)} mV</span> → ` +
          `<span style="color:${C.yellow}">${fmt(v.n, 0)} counts (+ offset 1200 = ${fmt(v.y, 0)})</span><br>` +
          `S = 200e-6 × 2 × 5 × 128 × 32000 = <b>8192 counts/kg</b> · one count = 0.122 g`;
        sc.render();
      }
      ui.steps([
        "The stimulus is the mass on the pan: \\( s=m \\). The flour is blue because it is what the world does.",
        "Stage 1, mechanics: the bar is designed so that \\( \\varepsilon = 200\\,\\mu\\varepsilon/\\text{kg}\\times m \\). The blue tint on the bar is the surface strain, largest at the root.",
        "Stage 1b, the foil gauge: \\( \\Delta R/R=\\mathrm{GF}\\,\\varepsilon \\) with \\( \\mathrm{GF}=2 \\), so 400 ppm per kg (A2).",
        "Stage 2, the full bridge: \\( V_{\\text{out}}=V_{\\text{ex}}\\,\\Delta R/R \\) with \\( V_{\\text{ex}}=5 \\) V, so 2 mV per kg.",
        "Stage 3, the amplifier: \\( \\times G=128 \\), so 0.256 V per kg (A7).",
        "Stage 4, the ADC: one step is \\( \\Delta V=V_{\\text{ref}}/2^N=2.048/65536=31.25\\,\\mu \\)V, i.e. 32 000 counts per volt.",
        "Multiply along the chain: \\( S=\\prod_i S_i=2\\times10^{-4}\\cdot2\\cdot5\\cdot128\\cdot32000=8192 \\) counts/kg. The display inverts the line: \\( m=(y-y_0)/S \\).",
      ], (i) => { step = i; sc.render(); });
      upd();
    },
  });

  // ═════════════════ a1-transfer-curve: saturation, tangent, linearisation, hysteresis ═════════════════
  register("a1-transfer-curve", {
    title: "Transfer curve · linearise around an operating point: Δy ≈ S Δs",
    target: "After this you can read offset, sensitivity, range, saturation and hysteresis off a transfer curve, and say when Δy ≈ S Δs is good enough.",
    caption: "a pressure sensor whose output bends over toward saturation. Yellow is the true curve y = f(s), green is the tangent at the operating point (its slope is the local sensitivity S), and red is the error of the straight-line guess. Move the operating point toward 100 kPa: the tangent flattens and the same Δs barely moves y. Turn on hysteresis to see the up and down branches.",
    links: [
      { id: "A2", why: "the bridge output is linear only for small ΔR/R" },
      { id: "A3", why: "C = ε0εrA/g is a curved transfer function in the gap" },
      { id: "A8", why: "calibration fits this curve" },
      { id: "B4", why: "an accelerometer is linearised the same way" },
    ],
    build(fig, ui) {
      const Y0 = 0.5, VS = 4, S0 = 0.08;              // V, V, V/kPa
      const f = (s) => Y0 + VS * Math.tanh((S0 * s) / VS);
      const fp = (s) => S0 * (1 - Math.tanh((S0 * s) / VS) ** 2);
      let sop = 25, ds = 15, hyst = false, stage = 5;
      const ch = chart(ui.body, { xr: [0, 100], yr: [0, 5], xlabel: "stimulus s (kPa)", ylabel: "output y (V)", h: 320 });
      const hArea = ch.area(C.red, 0.18), hUp = ch.line(C.red, 1.4, "4 3"), hDn = ch.line(C.red, 1.4, "4 3");
      const ideal = ch.line(C.green, 1.2, "2 5");
      const curve = ch.line(C.yellow, 3);
      const tan = ch.line(C.green, 2.4);
      const gx = ch.line(C.dim, 1, "3 4"), gy = ch.line(C.dim, 1, "3 4");
      const triS = ch.line(C.blue, 2.6), triY = ch.line(C.green, 2.6), err = ch.line(C.red, 3.5);
      const dOp = ch.dot(C.yellow, 5.5), dTrue = ch.dot(C.yellow, 4.5), dLin = ch.dot(C.green, 4.5);
      const lS = ch.label(C.green, 13), lD = ch.label(C.blue, 12.5, "middle"), lE = ch.label(C.red, 12.5), lOff = ch.label(C.dim, 12), lSat = ch.label(C.dim, 12, "end");
      function draw() {
        const pts = [], up = [], dn = [];
        for (let s = 0; s <= 100.01; s += 1) {
          pts.push([s, f(s)]);
          const h = 0.12 * Math.sin((Math.PI * s) / 100);
          up.push([s, f(s) - h]); dn.push([s, f(s) + h]);
        }
        curve.set(pts);
        ideal.set([[0, Y0], [56, Y0 + S0 * 56]]);
        if (hyst) { hArea.set(up, dn); hUp.set(up); hDn.set(dn); } else { hArea.set([], []); hUp.set([]); hDn.set([]); }
        lOff.set(1.5, Y0 + 0.18, "offset y0 = 0.5 V");
        lSat.set(99, Y0 + VS + 0.18 > 4.9 ? 4.75 : Y0 + VS + 0.18, "saturates at 4.5 V");
        const yop = f(sop), S = fp(sop), s1 = Math.min(100, sop + ds), dy = f(s1) - yop, dyl = S * (s1 - sop);
        const show = (k, on) => (stage >= k ? on() : null);
        [dOp, dTrue, dLin].forEach((d) => d.set(NaN, NaN));
        [gx, gy, tan, triS, triY, err].forEach((l) => l.set([]));
        [lS, lD, lE].forEach((l) => l.set(-10, -10, ""));
        show(1, () => { dOp.set(sop, yop); gx.set([[sop, 0], [sop, yop]]); gy.set([[0, yop], [sop, yop]]); });
        show(2, () => { tan.set([[sop - 30, yop - 30 * S], [sop + 40, yop + 40 * S]]); lS.set(Math.max(2, sop - 22), yop + 0.55, "S = " + fmt(S * 1000, 1) + " mV/kPa"); });
        show(3, () => { triS.set([[sop, yop], [s1, yop]]); triY.set([[s1, yop], [s1, yop + dyl]]); dLin.set(s1, yop + dyl); lD.set((sop + s1) / 2, yop - 0.22, "Δs = " + fmt(s1 - sop, 0)); });
        show(4, () => { dTrue.set(s1, f(s1)); err.set([[s1, f(s1)], [s1, yop + dyl]]); lE.set(Math.min(s1 + 1.5, 80), (f(s1) + yop + dyl) / 2 - 0.25, "error " + fmt((dy - dyl) * 1000, 0) + " mV"); });
        const lin = 100 * (1 - Math.tanh((S0 * sop) / VS) / ((S0 * sop) / VS || 1e-9));
        ui.read.innerHTML =
          `operating point <span style="color:${C.blue}">s = ${fmt(sop, 0)} kPa</span>, <span style="color:${C.yellow}">y = ${fmt(yop, 3)} V</span> · ` +
          `<span style="color:${C.green}">S = ${fmt(S * 1000, 1)} mV/kPa</span> (${fmt((100 * S) / S0, 0)}% of the slope at zero)<br>` +
          `step Δs = ${fmt(s1 - sop, 0)} kPa: true Δy = ${fmt(dy * 1000, 0)} mV, linear S·Δs = ${fmt(dyl * 1000, 0)} mV, ` +
          `<span style="color:${C.red}">error ${fmt((100 * (dy - dyl)) / (dy || 1e-9), 1)}%</span> · curve sits ${fmt(Math.max(0, lin), 1)}% below the ideal line here` +
          (hyst ? `<br><span style="color:${C.red}">hysteresis: up and down branches differ by up to 0.24 V (≈ ${fmt(0.24 / S0, 0)} kPa near zero)</span>` : "");
      }
      ui.slider("operating point", 0, 95, 1, sop, (v) => { sop = v; draw(); return fmt(v, 0) + " kPa"; });
      const dsl = ui.slider("step Δs", 2, 40, 1, ds, (v) => { ds = v; draw(); return fmt(v, 0) + " kPa"; });
      const opSl = ui.ctl.querySelector("input");
      const hb = ui.button("hysteresis: off", () => { hyst = !hyst; hb.textContent = "hysteresis: " + (hyst ? "on" : "off"); draw(); });
      ui.steps([
        "The transfer function \\( y=f(s) \\): offset \\( y_0 \\) at \\( s=0 \\), nearly straight at first, then saturating.",
        "Choose an operating point \\( s_{\\text{op}} \\); the sensor sits at \\( y_{\\text{op}}=f(s_{\\text{op}}) \\).",
        "Its slope is the local sensitivity \\( S=f'(s_{\\text{op}}) \\): the green tangent.",
        "A small step: \\( \\Delta y\\approx S\\,\\Delta s \\) (blue run, green rise).",
        "The true curve misses the tangent by \\( \\approx\\tfrac12 f''(s_{\\text{op}})\\,\\Delta s^2 \\) (red). Halve \\( \\Delta s \\) and the error drops fourfold.",
        "Near saturation \\( S\\to0 \\): the operating point has jumped to 80 kPa and the same step barely moves \\( y \\). Range ends where \\( S \\) collapses.",
      ], (i) => {
        stage = i;
        if (i === 5 && sop < 80) { sop = 80; opSl.value = 80; opSl.dispatchEvent(new Event("input")); }
        draw();
      });
      dsl.refresh();
    },
  });

  // ═════════════════ a1-step-response: the first-order lag of a thermometer ═════════════════
  register("a1-step-response", {
    title: "Step response · a thermometer is a first-order lag: τ ẏ + y = K s",
    target: "After this you can predict what a lagging sensor reads at any moment after a step, and how long to wait for a given accuracy.",
    caption: "at t = 0 the probe goes from 22 °C air into a 37 °C mouth (blue step). The reading (yellow) creeps up; the green tangent at t = 0 reaches the final value exactly at t = τ. Drag the read-out time: the red bar is the error you would report if you read the thermometer then.",
    links: [
      { id: "A2", why: "a thermistor bead has its own thermal τ and self-heating" },
      { id: "A7", why: "the RC low-pass filter obeys the same equation" },
      { id: "A6", why: "electrodes also settle exponentially" },
      { id: "C3", why: "diffusion to a sensor surface sets τ in biosensors" },
    ],
    build(fig, ui) {
      let tau = 10, tr = 10;
      const T0 = 22, TF = 37;
      const ch = chart(ui.body, { xr: [-5, 60], yr: [20, 40], xlabel: "time t (s)", ylabel: "temperature (°C)", h: 300 });
      const stim = ch.line(C.blue, 2.5), resp = ch.line(C.yellow, 3), tan = ch.line(C.green, 1.8, "6 4");
      const marks = [1, 3, 5].map(() => ch.vline(C.dim, "2 4")), mlabs = [1, 3, 5].map(() => ch.label(C.dim, 11.5, "middle"));
      const rv = ch.vline(C.text, "4 3"), e = ch.line(C.red, 4), d = ch.dot(C.yellow, 5.5), le = ch.label(C.red, 13);
      const y = (t) => (t < 0 ? T0 : TF + (T0 - TF) * Math.exp(-t / tau));
      function draw() {
        stim.set([[-5, T0], [0, T0], [0, TF], [60, TF]]);
        const pts = []; for (let t = -5; t <= 60; t += 0.25) pts.push([t, y(t)]); resp.set(pts);
        tan.set([[0, T0], [tau, TF]]);
        [1, 3, 5].forEach((k, i) => { marks[i].set(k * tau); mlabs[i].set(k * tau, 21, (k === 1 ? "" : k) + "τ"); });
        rv.set(tr); d.set(tr, y(tr)); e.set([[tr, y(tr)], [tr, TF]]);
        le.set(Math.min(tr + 1, 48), TF - 1.3, "e = " + fmt(y(tr) - TF, 2) + " °C");
        const t01 = tau * Math.log((TF - T0) / 0.1);
        ui.read.innerHTML =
          `τ = ${fmt(tau, 1)} s · read at t = ${fmt(tr, 1)} s → <span style="color:${C.yellow}">${fmt(y(tr), 2)} °C</span>, ` +
          `<span style="color:${C.red}">e = ${fmt(y(tr) - TF, 2)} °C</span> (${fmt(100 * (1 - Math.exp(-tr / tau)), 1)}% of the jump)<br>` +
          `initial slope ${fmt((TF - T0) / tau, 2)} °C/s · within 0.1 °C after τ·ln(150) = ${fmt(t01, 1)} s`;
      }
      ui.slider("time constant τ", 2, 20, 0.5, tau, (v) => { tau = v; draw(); return fmt(v, 1) + " s"; });
      ui.slider("read at t", 0, 60, 0.5, tr, (v) => { tr = v; draw(); return fmt(v, 1) + " s"; });
    },
  });
})();
