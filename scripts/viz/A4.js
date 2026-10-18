/* A4 — piezoelectric, piezoresistive and magnetic sensors: widgets for docs/A4-piezoelectric-piezoresistive-and-magnetic-sensors.md */
(function () {
  "use strict";
  const { register, C, ROLE, scene3d, fmt, mix, rng, css } = VIZ;
  const EPS0 = 8.8541878128e-12, QE = 1.602176634e-19;

  // engineering formatter: 2.3e-11 → "23 p"
  function eng(x, unit, d) {
    if (!isFinite(x)) return "—";
    const a = Math.abs(x);
    const P = [[1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"], [1e-15, "f"]];
    if (a === 0) return "0 " + unit;
    for (const [m, p] of P) if (a >= m * 0.9999) return fmt(x / m, d === undefined ? (a / m >= 100 ? 0 : a / m >= 10 ? 1 : 2) : d) + " " + p + unit;
    return x.toExponential(2) + " " + unit;
  }

  // a small time-trace panel drawn straight onto the 3D canvas (corner inset)
  function inset(ctx, box, traces, cursor, labels) {
    const [x0, y0, w, h] = box;
    ctx.save();
    ctx.fillStyle = "rgba(14,17,22,0.88)"; ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    ctx.fillRect(x0, y0, w, h); ctx.strokeRect(x0, y0, w, h);
    const mid = y0 + h / 2;
    ctx.strokeStyle = C.gridFaint; ctx.beginPath(); ctx.moveTo(x0 + 4, mid); ctx.lineTo(x0 + w - 4, mid); ctx.stroke();
    traces.forEach((tr) => {
      ctx.strokeStyle = tr.col; ctx.lineWidth = tr.w || 2; ctx.beginPath();
      tr.pts.forEach(([u, v], i) => { const X = x0 + 6 + u * (w - 12), Y = mid - v * (h / 2 - 8); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
      ctx.stroke();
    });
    if (cursor !== null && cursor !== undefined) {
      const X = x0 + 6 + cursor * (w - 12);
      ctx.strokeStyle = C.text; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X, y0 + 4); ctx.lineTo(X, y0 + h - 4); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.font = "11px JetBrains Mono, ui-monospace, monospace"; ctx.textBaseline = "top"; ctx.textAlign = "left";
    (labels || []).forEach((l, i) => { ctx.fillStyle = l.col; ctx.fillText(l.s, x0 + 6 + i * (w / 2.2), y0 + 4); });
    ctx.restore();
  }

  // ═════════════════════════════════════ 1. the direct piezoelectric effect ═════════════════════════════════════
  register("a4-piezo-3d", {
    title: "3D · squeeze a crystal and charge appears: q = d₃₃F, then it leaks away",
    target: "After this you can explain why squeezing a crystal makes charge q = d₃₃F, why the area cancels out, and why a piezo sensor only reports changes in force.",
    caption: "grey cage = <span style='color:" + C.text + "'>negative ions</span> at the cell corners, <span style='color:" + C.teal + "'>teal</span> = positive ions in the middle of each cell. Purple arrows = the force. When the cell is squeezed the positive ions sit off-centre, every cell becomes a tiny dipole, and the faces carry the charges ±q. Step through the math; at steps 6–7 the inset (yellow) shows the amplifier output decaying with time constant τ = RC while the force (purple) is held. Try a small R: only the press and the release survive.",
    links: [
      { id: "A3", why: "the electrodes are a parallel-plate capacitor, C = ε₀ε_rA/t" },
      { id: "A7", why: "the charge amplifier and its high-pass corner f_c = 1/(2πRC)" },
      { id: "B5", why: "run backwards (voltage in, motion out) this is a piezo actuator" },
      { id: "A1", why: "a transducer with a sensitivity in pC/N" },
    ],
    build(fig, ui) {
      const MATS = [
        { name: "quartz", d: 2.3e-12, er: 4.5 },
        { name: "PVDF film", d: 33e-12, er: 12 },
        { name: "PZT ceramic", d: 400e-12, er: 1700 },
      ];
      let mat = 2, F = 10, logR = 9, step = 0, stepT0 = 0;
      const Area = 1e-4, thick = 1e-3, Cf = 100e-12;           // 10 mm × 10 mm × 1 mm crystal, 100 pF feedback capacitor
      const NX = 4, NY = 3, NZ = 3, a = 0.95;                    // cells and cell size (scene units)
      const TP = 0.5, TR = 3.0, TEND = 5.0;                      // press, release, end of the inset timeline (s)
      const tau = () => Math.pow(10, logR) * Cf;
      const vNorm = (t) => {                                     // amplifier output / (q/Cf) for a press at TP and a release at TR
        const k = tau();
        let v = 0;
        if (t >= TP) v += Math.exp(-(t - TP) / k);
        if (t >= TR) v -= Math.exp(-(t - TR) / k);
        return v;
      };
      const cursorTime = () => {
        if (step <= 0) return 0.2;
        if (step < 5) return TP + 0.02;
        const el = VIZ.reduceMotion ? 99 : Math.max(0, sc ? sc.t - stepT0 : 0);
        if (step === 5) return Math.min(TR - 0.01, TP + 0.02 + el * 0.9);
        return Math.min(TEND, TR + 0.02 + el * 0.9);
      };
      const sc = scene3d(ui.body, {
        w: 640, h: 420, scale: 58, yaw: -0.62, pitch: 0.32, center: [0, 0, 0.1], animate: !VIZ.reduceMotion,
        draw(g) {
          const tc = cursorTime();
          const pressed = step >= 1 && tc >= TP && tc < TR;
          const sq = pressed ? 0.06 + 0.1 * (F / 20) : 0;        // visual squeeze (exaggerated)
          const shift = pressed ? 0.06 + 0.16 * (F / 20) : 0;     // visual off-centre shift of the + ions
          const sz = 1 - sq, hx = (NX * a) / 2, hy = (NY * a) / 2, hz = ((NZ * a) / 2) * sz;
          const showFaces = step >= 2;
          const frac = step >= 2 ? (step >= 5 ? vNorm(tc) : 1) : 0;
          // crystal body (translucent) and its edges
          g.box([-hx, -hy, -hz], [hx, hy, hz], C.silicon, { alpha: 0.13, shade: false });
          const E = [[-hx, -hy], [hx, -hy], [hx, hy], [-hx, hy]];
          for (let i = 0; i < 4; i++) {
            const [x1, y1] = E[i], [x2, y2] = E[(i + 1) % 4];
            g.line([x1, y1, hz], [x2, y2, hz], C.silicon, 1.2); g.line([x1, y1, -hz], [x2, y2, -hz], C.silicon, 1.2); g.line([x1, y1, -hz], [x1, y1, hz], C.silicon, 1.2);
          }
          // lattice: anions at the corners, cations in the cell centres
          const anion = mix(C.text, C.silicon, 0.35);
          for (let i = 0; i <= NX; i++) for (let j = 0; j <= NY; j++) for (let k = 0; k <= NZ; k++)
            g.sphere([-hx + i * a, -hy + j * a, -hz + k * a * sz], 0.1, anion);
          for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) for (let k = 0; k < NZ; k++) {
            const c = [-hx + (i + 0.5) * a, -hy + (j + 0.5) * a, -hz + (k + 0.5) * a * sz];
            const p = [c[0], c[1], c[2] + shift];
            g.sphere(p, 0.14, C.teal);
            if (pressed && step === 1) g.arrow([c[0], c[1] - 0.001, c[2] - 0.12], [c[0], c[1] - 0.001, c[2] + shift + 0.2], mix(C.teal, C.white, 0.4), 1.6);
          }
          // electrodes
          const ez = hz + 0.06;
          g.box([-hx - 0.1, -hy - 0.1, hz], [hx + 0.1, hy + 0.1, ez], step >= 4 ? mix(C.yellow, C.silicon, 0.55) : "#aeb6bf", { alpha: 0.9 });
          g.box([-hx - 0.1, -hy - 0.1, -ez], [hx + 0.1, hy + 0.1, -hz], step >= 4 ? mix(C.yellow, C.silicon, 0.55) : "#aeb6bf", { alpha: 0.9 });
          // surface charges: number of signs ∝ |q|
          if (showFaces) {
            const nS = Math.round(Math.min(1, Math.abs(frac)) * 10);
            const top = frac >= 0 ? "+" : "−", bot = frac >= 0 ? "−" : "+";
            for (let s = 0; s < nS; s++) {
              const u = -hx + 0.3 + (s % 5) * ((2 * hx - 0.6) / 4), v = s < 5 ? -hy * 0.45 : hy * 0.45;
              g.text([u, v, ez + 0.16], top, top === "+" ? C.teal : C.text, 22);
              g.text([u, v, -ez - 0.2], bot, bot === "+" ? C.teal : C.text, 22);
            }
          }
          // force arrows
          if (pressed) {
            const L = 0.5 + 1.0 * (F / 20);
            [[-1.1, 0], [1.1, 0], [0, 0]].forEach(([x, y]) => {
              g.arrow([x, y, ez + 0.35 + L], [x, y, ez + 0.32], C.purple, 4);
              g.arrow([x, y, -ez - 0.35 - L], [x, y, -ez - 0.32], C.purple, 4);
            });
            g.text([hx + 0.55, 0, ez + 0.9], "F", C.purple, 18);
          }
          // the voltmeter / amplifier link across the electrodes
          if (step >= 4) {
            const xw = hx + 0.45;
            g.line([hx + 0.1, 0, ez], [xw, 0, ez], C.teal, 2); g.line([hx + 0.1, 0, -ez], [xw, 0, -ez], C.teal, 2);
            g.arrow([xw, 0, -ez], [xw, 0, ez], C.yellow, 3);
            g.text([xw + 0.75, 0, 0], frac >= 0 ? "V > 0" : "V < 0", C.yellow, 15);
          }
          if (step === 3) {
            g.text([0, -hy - 0.55, -hz - 0.05], "A (area cancels)", C.green, 14);
          }
          if (step >= 4) g.text([-hx - 0.4, -hy, 0], "t", C.green, 16);
        },
        overlay(ctx) {
          if (step < 5) return;
          const N = 160, pF = [], pV = [];
          for (let i = 0; i <= N; i++) {
            const t = (TEND * i) / N;
            pF.push([i / N, t >= TP && t < TR ? 0.8 : 0]);
            pV.push([i / N, 0.85 * vNorm(t)]);
          }
          inset(ctx, [420, 12, 208, 104], [{ pts: pF, col: C.purple, w: 2 }, { pts: pV, col: C.yellow, w: 2.2 }], cursorTime() / TEND,
            [{ s: "F(t)", col: C.purple }, { s: "V_out(t)", col: C.yellow }]);
          ctx.save(); ctx.font = "11px JetBrains Mono, ui-monospace, monospace"; ctx.fillStyle = C.dim; ctx.textAlign = "right";
          ctx.fillText("τ = " + eng(tau(), "s"), 622, 110); ctx.restore();
        },
      });
      ui.slider("material", 0, 2, 1, mat, (v) => { mat = v; upd(); return MATS[v].name; });
      ui.slider("force F", 1, 20, 1, F, (v) => { F = v; upd(); return v + " N"; });
      ui.slider("leak resistor R", 7, 11, 0.5, logR, (v) => { logR = v; upd(); return eng(Math.pow(10, v), "Ω"); });
      ui.steps([
        "No force. In every cell the centre of the \\(+\\) charge sits exactly on the centre of the \\(-\\) charge, so the cell has no dipole and the faces carry no charge.",
        "Squeeze with a force \\(F\\). The cell gets shorter (strain \\(\\varepsilon\\)), and in a crystal without a centre of symmetry the \\(+\\) ions move a little more than the \\(-\\) cage: each cell now holds a tiny dipole (arrows).",
        "All the dipoles point the same way, so their charges cancel inside and are left over on the two faces. The surface charge per area is the polarisation, \\( P = d_{33}\\,\\sigma = d_{33}\\,F/A \\), with stress \\( \\sigma = F/A \\).",
        "Total charge on a face: \\( q = P\\,A = d_{33}\\,F \\). The area cancels: a big and a small crystal give the same charge for the same force. Quartz: 2.3 pC/N; PVDF: 33 pC/N; PZT: about 400 pC/N.",
        "The two electrodes and the crystal between them are a capacitor, \\( C = \\varepsilon_0\\varepsilon_r A/t \\), so the open-circuit voltage is \\( V = q/C = d_{33}F\\,t/(\\varepsilon_0\\varepsilon_r A) \\). A charge amplifier instead gives \\( V_{\\text{out}} = -q/C_f \\).",
        "Hold the force. Nothing is a perfect insulator: the charge leaks through the resistance \\(R\\) with time constant \\( \\tau = RC \\), so \\( V(t) = V_0\\,e^{-t/\\tau} \\). A constant force fades away (watch the inset).",
        "Release the force. The lattice springs back, the dipoles vanish, and the charge that leaked away now shows up as the opposite voltage. The sensor reports \\(dF/dt\\)-like events: it is a high-pass filter with corner \\( f_c = 1/(2\\pi RC) \\).",
      ], (i) => { step = i; stepT0 = sc.t; upd(); });
      function upd() {
        const m = MATS[mat], q = m.d * F, Cp = (EPS0 * m.er * Area) / thick;
        ui.read.innerHTML =
          `<b style="color:${C.purple}">F = ${F} N</b> on ${m.name} (d₃₃ = ${fmt(m.d * 1e12, 1)} pC/N, ε_r = ${m.er}) → ` +
          `<b style="color:${C.teal}">q = ${eng(q, "C")}</b><br>` +
          `crystal 10×10×1 mm: C = ${eng(Cp, "F")} → open-circuit V = q/C = <b style="color:${C.yellow}">${eng(q / Cp, "V")}</b> · ` +
          `charge amp C_f = 100 pF → |V_out| = <b style="color:${C.yellow}">${eng(q / Cf, "V")}</b><br>` +
          `leak: R = ${eng(Math.pow(10, logR), "Ω")}, τ = RC_f = ${eng(tau(), "s")}, f_c = 1/(2πτ) = <b style="color:${C.green}">${eng(1 / (2 * Math.PI * tau()), "Hz")}</b>`;
        sc.render();
      }
      upd();
    },
  });

  // ═════════════════════════════════════ 2. the Hall effect ═════════════════════════════════════
  register("a4-hall-3d", {
    title: "3D · the Hall plate: moving charges pushed sideways, V_H = IB/(n q_e t)",
    target: "After this you can derive V_H = IB/(n q_e t) from a force balance, and explain why Hall sensors are made of thin, lightly doped semiconductor and not copper.",
    caption: "grey slab = a thin silicon plate; <span style='color:" + C.teal + "'>teal dots</span> = electrons carrying the current I; <span style='color:" + C.blue + "'>blue arrows</span> = the magnetic field B (the stimulus). Step through: the magnetic force (purple) bends the electrons to one edge, the piled-up charge makes an electric field (teal) that pushes back, and in balance the edges sit at a steady voltage V_H (yellow). At the last step a gear tooth sweeps past and V_H pulses: that is an ABS wheel-speed signal. Slide n from silicon to copper and watch V_H collapse.",
    links: [
      { id: "A1", why: "B → V_H is a transducer with sensitivity 1/(n q_e t) per ampere" },
      { id: "A7", why: "microvolt-to-millivolt Hall voltages need a differential amplifier" },
      { id: "A9", why: "the phone compass (Hall or AMR) is fused with the gyro for heading" },
      { id: "B4", why: "IMUs pack a magnetometer next to the accelerometer and gyro" },
    ],
    build(fig, ui) {
      let I = 1e-3, B = 0.05, logn = 22, step = 0, t0 = 0;
      const tP = 10e-6, wP = 100e-6;                    // plate thickness and width (for the readout)
      const LX = 3.0, WY = 1.35, TZ = 0.14;              // half-length, half-width, half-thickness (scene units)
      const R = rng(7), NC = 34;
      const car = Array.from({ length: NC }, () => ({ x: -LX + 2 * LX * R(), y0: (R() * 2 - 1) * (WY - 0.15), ph: R() }));
      let lastT = 0;
      const Bnow = (t) => {
        if (step < 1) return 0;
        if (step < 5) return 1;
        const ph = ((t - t0) * 0.6) % 1;                  // a gear tooth passes 0.6 times per (scene) second
        return ph < 0.45 ? 1 : 0.12;
      };
      const build = (t) => {                              // how far the edge charge has built up (0…1)
        if (step < 2) return 0;
        if (step === 2) return VIZ.reduceMotion ? 1 : Math.min(1, 1 - Math.exp(-(t - t0) / 0.9));
        return 1;
      };
      const sc = scene3d(ui.body, {
        w: 640, h: 420, scale: 62, yaw: -0.5, pitch: 0.55, center: [0, 0, 0.1], animate: !VIZ.reduceMotion,
        draw(g, t) {
          const dt = Math.max(0, Math.min(0.05, t - lastT)); lastT = t;
          const bmag = Bnow(t), bu = build(t), Bvis = bmag * Math.min(1, 0.35 + B / 0.15);
          // plate, contacts
          g.box([-LX, -WY, -TZ], [LX, WY, TZ], C.silicon, { alpha: 0.75 });
          g.box([-LX - 0.3, -WY, -TZ - 0.05], [-LX, WY, TZ + 0.05], "#c3cad2");
          g.box([LX, -WY, -TZ - 0.05], [LX + 0.3, WY, TZ + 0.05], "#c3cad2");
          g.box([-0.25, -WY - 0.22, -TZ], [0.25, -WY, TZ], "#c3cad2");
          g.box([-0.25, WY, -TZ], [0.25, WY + 0.22, TZ], "#c3cad2");
          // conventional current arrow
          g.arrow([-LX - 1.4, 0, 0], [-LX - 0.35, 0, 0], C.teal, 3.5);
          g.text([-LX - 1.0, 0, 0.35], "I", C.teal, 17);
          // B field arrows
          if (bmag > 0) {
            [-2.0, 0, 2.0].forEach((x) => [-0.7, 0.7].forEach((y) => g.arrow([x, y, -1.3], [x, y, -1.3 + 2.8 * Bvis], C.blue, 2.6)));
            g.text([-2.0, -0.7, -1.3 + 2.8 * Bvis + 0.25], "B", C.blue, 17);
          }
          // carriers (electrons drift towards −x; magnetic force (−e)(v×B) points to −y)
          const vx = 1.1, side = 0.9 * bmag * (1 - bu);
          car.forEach((c, idx) => {
            if (!VIZ.reduceMotion) c.x -= vx * dt;
            if (c.x < -LX) { c.x = LX; c.y0 = (R() * 2 - 1) * (WY - 0.15); }
            const travelled = LX - c.x;                     // since entering at +LX
            let y = c.y0 - side * travelled * 0.55;
            if (y < -WY + 0.1) y = -WY + 0.1;
            c.y = y;
            g.sphere([c.x, y, TZ + 0.1], 0.085, idx === 0 ? mix(C.teal, C.white, 0.5) : C.teal);
          });
          // edge charges and Hall field
          const nq = Math.round(bu * bmag * 9);
          for (let s = 0; s < nq; s++) {
            const x = -LX + 0.5 + s * ((2 * LX - 1) / 8);
            g.text([x, -WY - 0.05, TZ + 0.3], "−", C.text, 20);
            g.text([x, WY + 0.05, TZ + 0.3], "+", C.teal, 20);
          }
          if (bu * bmag > 0.2 && step >= 2) [-1.6, 1.6].forEach((x) => g.arrow([x, WY - 0.2, TZ + 0.05], [x, WY - 0.2 - 2.2 * bu * bmag, TZ + 0.05], mix(C.teal, C.bg, 0.25), 2));
          // force on the highlighted carrier
          const c0 = car[0];
          if (step >= 1 && step <= 3 && bmag > 0) {
            const p = [c0.x, c0.y, TZ + 0.1];
            g.arrow(p, [p[0], p[1] - 0.75, p[2]], C.purple, 3);
            if (step >= 2) g.arrow(p, [p[0], p[1] + 0.75 * bu, p[2]], C.teal, 3);
          }
          if (step === 0) g.arrow([c0.x, c0.y, TZ + 0.1], [c0.x - 0.8, c0.y, TZ + 0.1], C.white, 2);
          // voltmeter across the width
          if (step >= 4) {
            g.line([0, -WY - 0.22, 0], [0, -WY - 0.75, 0], C.teal, 2); g.line([0, WY + 0.22, 0], [0, WY + 0.75, 0], C.teal, 2);
            g.arrow([0, -WY - 0.75, 0], [0, WY + 0.75, 0], C.yellow, 2.6);
            g.text([0.35, WY + 1.0, 0.25], "V_H", C.yellow, 17);
            g.line([LX + 0.6, -WY, -TZ], [LX + 0.6, -WY, TZ], C.green, 2);
            g.text([LX + 0.95, -WY, 0], "t", C.green, 16);
          }
          if (step === 5) {
            // a gear tooth (purple steel) passing under the plate
            const ph = ((t - t0) * 0.6) % 1, x = 3.5 - 7 * ph;
            g.box([x - 0.6, -0.9, -2.0], [x + 0.6, 0.9, -1.55], mix(C.purple, C.silicon, 0.5));
          }
        },
        overlay(ctx) {
          if (step < 5) return;
          const pts = [], N = 120;
          for (let i = 0; i <= N; i++) { const ph = (i / N) * 3 % 1; pts.push([i / N, ph < 0.45 ? 0.8 : 0.1]); }
          inset(ctx, [440, 12, 188, 86], [{ pts, col: C.yellow, w: 2 }], null, [{ s: "V_H(t): pulses", col: C.yellow }]);
        },
      });
      ui.slider("current I", 0.1, 5, 0.1, I * 1e3, (v) => { I = v * 1e-3; upd(); return fmt(v, 1) + " mA"; });
      ui.slider("field B", 0, 200, 5, B * 1e3, (v) => { B = v * 1e-3; upd(); return v + " mT"; });
      ui.slider("carrier density n", 21, 29, 0.5, logn, (v) => { logn = v; upd(); return "10^" + fmt(v, 1) + " m⁻³" + (v >= 28.5 ? " (copper)" : v <= 22.5 ? " (doped Si)" : ""); });
      ui.steps([
        "A current \\(I\\) flows along the plate. In an n-type plate it is carried by electrons drifting the other way at \\( v_d = I/(n\\,q_e\\,w\\,t) \\): \\(n\\) carriers per m³, each of charge \\(q_e\\), through a cross-section \\(w\\times t\\).",
        "Switch on a field \\(B\\) through the plate. A moving charge feels the magnetic force \\( F = q_e\\,v_d\\,B \\), at right angles to both its motion and \\(B\\): the electrons bend towards one edge.",
        "Electrons pile up on that edge and leave the other edge positive. The separated charge creates a sideways electric field \\( \\mathcal E_H \\) that pushes the next electrons back (teal arrow).",
        "Steady state in about a nanosecond: electric push = magnetic push, \\( q_e\\,\\mathcal E_H = q_e\\,v_d\\,B \\), so \\( \\mathcal E_H = v_d B \\). The electrons now travel straight again.",
        "Across the width: \\( V_H = \\mathcal E_H\\,w = v_d B\\,w = \\dfrac{I B}{n\\,q_e\\,t} \\). The width cancels; a thin plate (small \\(t\\)) with few carriers (small \\(n\\)) gives a big voltage.",
        "Use it: a magnet or steel gear tooth passing the plate switches \\(B\\) on and off, so \\(V_H\\) becomes a pulse train. Pulses per second ÷ teeth = wheel revolutions per second (ABS, crankshaft, bike computer).",
      ], (i) => { step = i; t0 = sc.t; upd(); });
      function upd() {
        const n = Math.pow(10, logn), VH = (I * B) / (n * QE * tP), vd = I / (n * QE * wP * tP);
        ui.read.innerHTML =
          `I = <b style="color:${C.teal}">${fmt(I * 1e3, 1)} mA</b>, B = <b style="color:${C.blue}">${fmt(B * 1e3, 0)} mT</b>, n = 10^${fmt(logn, 1)} m⁻³, plate t = 10 µm, w = 100 µm<br>` +
          `drift speed v_d = ${eng(vd, "m/s")} · Hall field ℰ_H = v_dB = ${eng(vd * B, "V/m")}<br>` +
          `<b style="color:${C.yellow}">V_H = IB/(n q_e t) = ${eng(VH, "V")}</b> · sensitivity ${eng(I / (n * QE * tP), "V/T")} · Earth's 50 µT would give ${eng((I * 50e-6) / (n * QE * tP), "V")}`;
        if (VIZ.reduceMotion) sc.render();
      }
      upd();
    },
  });

  // ═════════════════════════════════════ 3. the phone compass ═════════════════════════════════════
  register("a4-compass-3d", {
    title: "3D · a phone compass: heading ψ = atan2(−B_y, B_x) from the Earth's ~50 µT",
    target: "After this you can turn two magnetometer readings into a heading, and see why the Earth's tilted field and a magnet in the phone case both bend the answer.",
    caption: "the <span style='color:" + C.blue + "'>blue arrow</span> is the Earth's field (about 50 µT, dipping into the ground in the northern hemisphere); the thin arrow B_h on the table is its horizontal part, the only part that points north. The <span style='color:" + C.yellow + "'>yellow arrows</span> are what the phone's two in-plane sensors read along its own x (top edge) and y (right edge) axes. Turn the phone, change where on Earth you are, then add a hard-iron offset (red, e.g. a magnetic phone case) and watch the computed heading go wrong.",
    links: [
      { id: "A8", why: "the hard-iron offset is removed by calibration (the figure-eight wave)" },
      { id: "A9", why: "heading from the compass is fused with the gyroscope" },
      { id: "B4", why: "the accelerometer gives the tilt needed for tilt compensation" },
    ],
    build(fig, ui) {
      let psi = 30, incl = 66, Btot = 50, off = 0;
      const rad = Math.PI / 180, K = 3.2 / 50;            // scene units per µT
      const sc = scene3d(ui.body, {
        w: 640, h: 420, scale: 70, yaw: -0.45, pitch: 0.78, center: [0, -0.25, -0.1],
        draw(g) {
          const p = psi * rad, f = [Math.sin(p), Math.cos(p), 0], r = [Math.cos(p), -Math.sin(p), 0];
          const Bh = Btot * Math.cos(incl * rad), Bv = Btot * Math.sin(incl * rad);
          // table and compass ring
          const ring = [];
          for (let i = 0; i <= 48; i++) { const a = (2 * Math.PI * i) / 48; ring.push([2.9 * Math.sin(a), 2.9 * Math.cos(a), -0.12]); }
          g.poly(ring.slice(0, 48), "#1b2430", { shade: false, bias: -50 });
          g.polyline(ring, C.grid, 1.2);
          [["N", 0], ["E", 90], ["S", 180], ["W", 270]].forEach(([s, a]) => g.text([3.25 * Math.sin(a * rad), 3.25 * Math.cos(a * rad), -0.12], s, s === "N" ? C.red : C.dim, 16));
          // phone (rotated box)
          const hw = 0.8, hl = 1.6, th = 0.16;
          const P = (u, v, z) => [u * r[0] + v * f[0], u * r[1] + v * f[1], z];
          const corners = [[-hw, -hl], [hw, -hl], [hw, hl], [-hw, hl]];
          const bot = corners.map(([u, v]) => P(u, v, -0.1)), top = corners.map(([u, v]) => P(u, v, -0.1 + th));
          for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; g.poly([bot[i], bot[j], top[j], top[i]], "#6b7684"); }
          g.poly(top, "#4a5562");
          g.poly([[-hw + 0.08, -hl + 0.15], [hw - 0.08, -hl + 0.15], [hw - 0.08, hl - 0.15], [-hw + 0.08, hl - 0.15]].map(([u, v]) => P(u, v, -0.1 + th + 0.005)), "#1d2a38", { shade: false, stroke: C.dim });
          g.sphere(P(0, hl - 0.25, 0.08), 0.06, C.silicon);
          // phone axes
          const o = [0, 0, 0.12];
          g.line(o, P(0, 2.3, 0.12), C.dim, 1, [4, 4]); g.line(o, P(1.9, 0, 0.12), C.dim, 1, [4, 4]);
          g.text(P(0, 2.55, 0.12), "x", C.dim, 13); g.text(P(2.1, 0, 0.12), "y", C.dim, 13);
          // Earth's field
          const hB = (Bh * K) / 2, vB = (Bv * K) / 2;
          g.arrow([0, -hB, 0.12 + vB], [0, hB, 0.12 - vB], C.blue, 3.5);
          g.text([-1.25, -hB - 0.2, 0.12 + vB + 0.1], "B (Earth)", C.blue, 15);
          g.arrow([0, -hB, 0.13], [0, hB, 0.13], mix(C.blue, C.bg, 0.3), 1.8);
          g.line([0, -hB, 0.12 + vB], [0, -hB, 0.12], C.blue, 1, [2, 4]);
          g.line([0, hB, 0.12 - vB], [0, hB, 0.12], C.blue, 1, [2, 4]);
          g.text([0.25, hB + 0.25, 0.13], "B_h", mix(C.blue, C.white, 0.2), 13);
          // what the sensors read (with the hard-iron offset on y)
          const bx = Bh * Math.cos(p), by = -Bh * Math.sin(p) + off;
          g.arrow(o, P(0, bx * K, 0.12), C.yellow, 3.2);
          g.arrow(o, P(by * K, 0, 0.12), C.yellow, 3.2);
          if (off !== 0) g.arrow(P(-off * K + by * K, 0, 0.16), P(by * K, 0, 0.16), C.red, 2.4);
          g.text(P(0, bx * K + (bx >= 0 ? 0.3 : -0.3), 0.3), "B_x", C.yellow, 14);
          g.text(P(by * K + (by >= 0 ? 0.35 : -0.35), 0, 0.3), "B_y", C.yellow, 14);
          // computed heading direction (green) on the ring
          const h = Math.atan2(-by, bx);
          const est = p - h;                                            // where the phone thinks north is (world angle)
          g.arrow([0, 0, -0.08], [2.3 * Math.sin(est), 2.3 * Math.cos(est), -0.08], C.green, 2.4);
          g.text([2.55 * Math.sin(est) + 0.45, 2.55 * Math.cos(est), 0.15], "north?", C.green, 13);
        },
      });
      ui.slider("phone heading ψ", 0, 355, 5, psi, (v) => { psi = v; upd(); return v + "°"; });
      ui.slider("dip (inclination)", 0, 80, 2, incl, (v) => { incl = v; upd(); return v + "°" + (v > 60 ? " (Europe, N. America)" : v < 15 ? " (near the equator)" : ""); });
      ui.slider("hard-iron offset on y", -10, 10, 1, off, (v) => { off = v; upd(); return v + " µT"; });
      function upd() {
        const p = psi * rad, Bh = Btot * Math.cos(incl * rad), Bv = Btot * Math.sin(incl * rad);
        const bx = Bh * Math.cos(p), by = -Bh * Math.sin(p) + off;
        let h = (Math.atan2(-by, bx) / rad + 360) % 360;
        let err = h - psi; if (err > 180) err -= 360; if (err < -180) err += 360;
        ui.read.innerHTML =
          `|B| = ${Btot} µT, dip ${incl}° → horizontal <b style="color:${C.blue}">${fmt(Bh, 1)} µT</b>, vertical ${fmt(Bv, 1)} µT (wasted for heading)<br>` +
          `sensors: <b style="color:${C.yellow}">B_x = ${fmt(bx, 1)} µT, B_y = ${fmt(by, 1)} µT</b> → ψ = atan2(−B_y, B_x) = <b style="color:${C.green}">${fmt(h, 1)}°</b>` +
          ` (true ${psi}°, error <span style="color:${Math.abs(err) > 0.5 ? C.red : C.green}">${fmt(err, 1)}°</span>)`;
        sc.render();
      }
      upd();
    },
  });
})();
