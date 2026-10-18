/* A6 — electrochemical sensors and biosensors: widgets for docs/A6-electrochemical-sensors-and-biosensors.md */
(function () {
  "use strict";
  const { register, C, scene3d, chart, fmt, mix, rng, gauss, H, css } = VIZ;
  const FAR = 96485.33212, RG = 8.314462618;
  const cottrell = (t, cmM, D, n, A) => n * FAR * A * cmM * Math.sqrt(D / (Math.PI * t));   // c in mol/m³ = mM

  // ═════════════════════════════════════ 1. the glucose strip ═════════════════════════════════════
  register("a6-strip-3d", {
    title: "3D · inside a glucose strip: molecules diffuse to the electrode, I ∝ c/√t",
    target: "After this you can explain how a glucose strip turns molecules into electrons, why its current decays as 1/√t (Cottrell), and why reading at a fixed time makes the current proportional to concentration.",
    caption: "a test strip seen close up: the clear box is the capillary chamber full of blood (<span style='color:" + C.water + "'>water blue</span>); <span style='color:" + C.blue + "'>blue balls</span> are glucose molecules (the measurand). On the floor are three printed electrodes: the working electrode (WE, under a green enzyme layer), the reference (RE) and the counter electrode (CE). Step through: once the meter applies its potential, every glucose that reaches the WE gives up 2 electrons (<span style='color:" + C.teal + "'>teal</span>) that run down the lead to the meter. Molecules near the electrode are used up first, so a depletion layer grows (red, thickness √(πDt)) and the hit rate falls. The inset counts hits per half second (yellow) against the Cottrell law (green).",
    links: [
      { id: "C3", why: "the depletion layer is diffusion: it grows like √t" },
      { id: "C4", why: "the blood is pulled into the chamber by capillarity, no pump" },
      { id: "A7", why: "a transimpedance amplifier turns the µA current into volts" },
      { id: "A8", why: "the limit of detection is 3σ of the blank divided by the sensitivity" },
    ],
    build(fig, ui) {
      let cmM = 8, step = 0, simT = 0, hits = [], parts = [], elec = [];
      const X0 = -2.4, X1 = 2.4, Y0 = -1.0, Y1 = 1.0, ZT = 1.7;   // chamber
      const WE = [-1.25, 1.25], RE = [-2.25, -1.6], CE = [1.6, 2.25];
      const Dsim = 0.06, TEND = 8, BIN = 0.5;
      const R = rng(5);
      function reset() {
        const N = Math.round(14 * cmM);
        parts = Array.from({ length: N }, () => [X0 + 0.05 + R() * (X1 - X0 - 0.1), Y0 + 0.05 + R() * (Y1 - Y0 - 0.1), 0.08 + R() * (ZT - 0.12)]);
        hits = new Array(Math.round(TEND / BIN)).fill(0); elec = []; simT = 0;
      }
      reset();
      const theoryRate = (t) => {                     // expected hits per second (planar Cottrell, sim units)
        const conc = parts0() / ((X1 - X0) * (Y1 - Y0) * ZT), A = (WE[1] - WE[0]) * (Y1 - Y0);
        return conc * A * Math.sqrt(Dsim / (Math.PI * Math.max(t, 0.05)));
      };
      const parts0 = () => Math.round(14 * cmM);
      let lastT = 0;
      const sc = scene3d(ui.body, {
        w: 640, h: 430, scale: 66, yaw: -0.5, pitch: 0.5, center: [0.2, 0, 0.5], animate: !VIZ.reduceMotion,
        draw(g, t) {
          const dt = Math.max(0, Math.min(0.05, t - lastT)); lastT = t;
          const on = step >= 2;
          // strip body and leads
          g.box([-3.0, -1.5, -0.12], [4.6, 1.5, 0], "#d9dde2", { bias: -60 });
          g.box([X0, Y0, 0], [X1, Y1, 0.012], "#2a3038", { bias: -30 });
          const elecBox = (r, col) => g.box([r[0], Y0 + 0.12, 0.012], [r[1], Y1 - 0.12, 0.03], col, { bias: -20 });
          elecBox(WE, "#3a434d"); elecBox(RE, "#b8bec6"); elecBox(CE, "#5f6b78");
          g.box([1.0, -0.15, 0.012], [4.4, 0.15, 0.025], on ? mix(C.teal, "#3a434d", 0.4) : "#3a434d", { bias: -20 });   // WE lead
          g.box([-2.1, 1.1, 0.012], [4.4, 1.3, 0.025], "#9aa2ab", { bias: -20 });
          g.box([2.0, -1.3, 0.012], [4.4, -1.1, 0.025], "#5f6b78", { bias: -20 });
          g.text([0, Y0 - 0.25, 0.05], "WE", C.text, 13); g.text([-1.92, Y0 - 0.25, 0.05], "RE", C.text, 13); g.text([1.92, Y0 - 0.25, 0.05], "CE", C.text, 13);
          // enzyme layer on the WE
          g.box([WE[0], Y0 + 0.12, 0.03], [WE[1], Y1 - 0.12, 0.09], mix(C.green, C.bg, step === 1 ? 0.1 : 0.45), { alpha: step === 1 ? 0.9 : 0.6, bias: -10 });
          if (step === 1) g.text([0, 0, 0.35], "glucose oxidase + mediator", C.green, 14);
          // chamber walls (transparent water)
          g.box([X0, Y0, 0.0], [X1, Y1, ZT], C.water, { alpha: 0.07, shade: false, bias: 40 });
          [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]].forEach(([x, y]) => g.line([x, y, 0], [x, y, ZT], mix(C.water, C.bg, 0.3), 1));
          g.polyline([[X0, Y0, ZT], [X1, Y0, ZT], [X1, Y1, ZT], [X0, Y1, ZT], [X0, Y0, ZT]], mix(C.water, C.bg, 0.3), 1);
          // depletion layer
          if (step >= 3) {
            const delta = Math.min(ZT, Math.sqrt(Math.PI * Dsim * Math.max(simT, VIZ.reduceMotion ? 5 : 0)));
            g.box([WE[0], Y0 + 0.02, 0.09], [WE[1], Y1 - 0.02, 0.09 + delta], C.red, { alpha: 0.13, shade: false, bias: 30 });
            g.line([WE[1] + 0.05, Y0, 0.09], [WE[1] + 0.05, Y0, 0.09 + delta], C.red, 2);
            g.text([WE[1] + 0.55, Y0, 0.09 + delta], "δ = √(πDt)", C.red, 13);
          }
          // molecules: random walk with reflecting walls; absorbed at the WE once the potential is on
          const sd = Math.sqrt(2 * Dsim * dt);
          if (!VIZ.reduceMotion && dt > 0) {
            if (on) simT += dt;
            for (let k = parts.length - 1; k >= 0; k--) {
              const p = parts[k];
              p[0] += sd * gauss(R); p[1] += sd * gauss(R); p[2] += sd * gauss(R);
              if (p[0] < X0 + 0.05) p[0] = 2 * (X0 + 0.05) - p[0]; if (p[0] > X1 - 0.05) p[0] = 2 * (X1 - 0.05) - p[0];
              if (p[1] < Y0 + 0.05) p[1] = 2 * (Y0 + 0.05) - p[1]; if (p[1] > Y1 - 0.05) p[1] = 2 * (Y1 - 0.05) - p[1];
              if (p[2] > ZT - 0.05) p[2] = 2 * (ZT - 0.05) - p[2];
              if (p[2] < 0.09) {
                if (on && p[0] > WE[0] && p[0] < WE[1]) {
                  parts.splice(k, 1);
                  const b = Math.floor(simT / BIN); if (b < hits.length) hits[b]++;
                  elec.push({ x: p[0], y: p[1], s: 0 }, { x: p[0] + 0.08, y: p[1] + 0.05, s: -0.1 });
                  continue;
                }
                p[2] = 2 * 0.09 - p[2];
              }
            }
            if (on && simT > TEND) reset();
          }
          parts.forEach((p) => g.sphere(p, 0.065, C.blue));
          // electrons run to the lead, then out along it to the meter
          elec = elec.filter((e) => e.s < 1);
          elec.forEach((e) => {
            if (!VIZ.reduceMotion) e.s += dt * 0.7;
            const u = Math.max(0, e.s), toLead = Math.min(1, u * 3);
            const x = u < 0.34 ? e.x + (WE[1] - e.x) * toLead : WE[1] + (4.4 - WE[1]) * ((u - 0.34) / 0.66);
            const y = u < 0.34 ? e.y * (1 - toLead) : 0;
            g.sphere([x, y, 0.07], 0.045, C.teal);
          });
          if (on) { g.arrow([3.0, 0, 0.35], [4.3, 0, 0.35], C.teal, 2.5); g.text([3.65, 0, 0.6], "e⁻ → meter", C.teal, 13); }
        },
        overlay(ctx) {
          if (step < 4) return;
          const x0 = 430, y0 = 10, w = 200, h = 104;
          ctx.save();
          ctx.fillStyle = "rgba(14,17,22,0.9)"; ctx.strokeStyle = C.grid; ctx.fillRect(x0, y0, w, h); ctx.strokeRect(x0, y0, w, h);
          const nb = hits.length, peak = Math.max(4, theoryRate(BIN / 2) * BIN * 1.1, ...hits);
          const bw = (w - 12) / nb, base = y0 + h - 14, sy = (h - 32) / peak;
          hits.forEach((v, i) => { if ((i + 1) * BIN <= simT + BIN) { ctx.fillStyle = C.yellow; ctx.fillRect(x0 + 6 + i * bw + 1, base - v * sy, bw - 2, v * sy); } });
          ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath();
          for (let i = 0; i <= 80; i++) { const tt = 0.15 + (TEND - 0.15) * (i / 80), X = x0 + 6 + (tt / TEND) * (w - 12), Y = base - theoryRate(tt) * BIN * sy; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
          ctx.stroke();
          ctx.font = "11px JetBrains Mono, ui-monospace, monospace"; ctx.textBaseline = "top"; ctx.fillStyle = C.yellow; ctx.fillText("hits / 0.5 s", x0 + 6, y0 + 4);
          ctx.fillStyle = C.green; ctx.fillText("∝ 1/√t", x0 + 120, y0 + 4);
          ctx.fillStyle = C.dim; ctx.fillText("t → " + TEND + " s", x0 + 130, base + 2);
          ctx.restore();
        },
      });
      ui.slider("glucose c", 2, 20, 1, cmM, (v) => { cmM = v; reset(); upd(); return v + " mM (" + fmt(v * 18.016, 0) + " mg/dL)"; });
      ui.button("restart", () => { reset(); upd(); });
      ui.steps([
        "A drop of blood touches the strip's edge and capillary action pulls about half a microlitre into the chamber. Glucose (blue) is spread evenly at concentration \\( c \\) (5 mM ≈ 90 mg/dL is a normal fasting level).",
        "The working electrode carries an enzyme, glucose oxidase (GOx), and a mediator. GOx grabs only glucose, the lock-and-key selectivity, and oxidises it; the mediator carries the 2 electrons per glucose to the electrode.",
        "The meter now holds the working electrode at a fixed potential against the reference electrode (a potentiostat). Each glucose that reaches the WE delivers \\( n = 2 \\) electrons, and the counter electrode closes the circuit. Current \\( I = n\\mathcal F \\times \\) (moles arriving per second).",
        "Molecules close to the electrode are used up first. To keep arriving, the rest must diffuse across a growing empty layer of thickness \\( \\delta \\approx \\sqrt{\\pi D t} \\), about 100 µm after 5 s for \\( D = 6.7\\times10^{-10} \\) m²/s.",
        "Flux = \\( D\\,c/\\delta \\), so the current falls as the layer grows: the Cottrell equation \\( I(t) = n\\mathcal F A\\,c\\,\\sqrt{\\dfrac{D}{\\pi t}} \\). Four times longer, half the current (inset).",
        "Everything except \\( c \\) is fixed by the strip design: read the current at a fixed time (say 5 s) and \\( I \\propto c \\). One calibration factor in µA/mM turns the current into mg/dL.",
      ], (i) => { step = i; if (i === 2) reset(); upd(); });
      function upd() {
        const D = 6.7e-10, A = 1e-6;
        ui.read.innerHTML =
          `c = <b style="color:${C.blue}">${cmM} mM</b> = ${fmt(cmM * 18.016, 0)} mg/dL · real strip: n = 2, A = 1 mm², D = 6.7×10⁻¹⁰ m²/s<br>` +
          `Cottrell: I(1 s) = ${fmt(cottrell(1, cmM, D, 2, A) * 1e6, 2)} µA, <b style="color:${C.yellow}">I(5 s) = ${fmt(cottrell(5, cmM, D, 2, A) * 1e6, 2)} µA</b>, ` +
          `δ(5 s) = ${fmt(Math.sqrt(Math.PI * D * 5) * 1e6, 0)} µm · sensitivity ${fmt(cottrell(5, 1, D, 2, A) * 1e6, 2)} µA/mM`;
        if (VIZ.reduceMotion) sc.render();
      }
      upd();
    },
  });

  // ═════════════════════════════════════ 2. the Nernst equation ═════════════════════════════════════
  register("a6-nernst", {
    title: "Live plot · the Nernst line: about 59 mV per factor of ten",
    target: "After this you can derive the 59 mV/decade slope, read a pH or nitrate concentration off a potentiometric sensor, and say why the slope depends on temperature and on the ion's charge.",
    caption: "horizontal axis: log₁₀ of the ion activity (roughly its concentration in mol/L), so each grid step is a factor of ten; vertical axis: the electrode potential against the reference. For the pH electrode, log₁₀a = −7 is pH 7, where a typical glass electrode reads 0 mV. The <span style='color:" + C.green + "'>green line</span> is the Nernst model, the <span style='color:" + C.yellow + "'>yellow dot</span> a measurement read back to a pH. Step through the derivation; then change the temperature and watch the line tilt about pH 7, which is why pH meters carry a thermometer. (Lines for other ions are drawn through the same point to compare their slopes.)",
    links: [
      { id: "A1", why: "a sensor whose output is linear in log c, not in c" },
      { id: "A8", why: "two-point calibration with pH 4 and pH 7 buffers fixes the offset and the slope" },
      { id: "A2", why: "the same temperature-drift problem as a thermistor, solved by compensation" },
    ],
    build(fig, ui) {
      let T = 25, z = 1, step = 0;
      const ZS = [-1, 1, 2];
      const ch = chart(ui.body, { w: 640, h: 310, xr: [-8, 0], yr: [-450, 450], xlabel: "log₁₀ activity a   (pH = −log₁₀ a_H+)", ylabel: "V (mV)" });
      const slope = (Tc, zz) => ((RG * (Tc + 273.15) * Math.log(10)) / (zz * FAR)) * 1e3;   // mV per decade
      const Vof = (la, Tc, zz) => slope(Tc, zz) * (la + 7);                                   // 0 mV at a = 10⁻⁷
      const line = (Tc, zz) => [[-8, Vof(-8, Tc, zz)], [0, Vof(0, Tc, zz)]];
      const lines = [ch.line(C.green, 2.8), ch.line(C.dim, 1.6, "6 4"), ch.line(css(mix(C.green, C.bg, 0.35)), 2, "3 3"), ch.line(css(mix(C.purple, C.white, 0.2)), 2, "3 3")];
      const tri = [ch.line(C.yellow, 2), ch.line(C.yellow, 2)];
      const lab = [ch.label(C.green, 12.5), ch.label(C.yellow, 12.5), ch.label(C.dim, 12), ch.label(css(mix(C.green, C.white, 0.2)), 12), ch.label(css(mix(C.purple, C.white, 0.2)), 12)];
      const vl = ch.vline(C.green), hl = ch.hline(C.yellow), dot = ch.dot(C.yellow, 5.5);
      const VM = 118.3;                                                                       // a measured pH-electrode voltage
      ui.slider("temperature", 0, 60, 1, T, (v) => { T = v; draw(); return v + " °C"; });
      ui.slider("ion charge z", 0, 2, 1, 1, (v) => { z = ZS[v]; draw(); return (z > 0 ? "+" : "") + z + (z === 1 ? " (H⁺, K⁺)" : z === 2 ? " (Ca²⁺)" : " (NO₃⁻)"); });
      ui.steps([
        "Dip an electrode in a solution of an ion. Ions trade electrons with the electrode (or cross a selective membrane) until a voltage builds up that stops any further net exchange: equilibrium, and no current flows.",
        "At equilibrium the electrical work per mole balances the chemical free energy: \\( z\\mathcal F V = z\\mathcal F V^0 + R_gT\\ln a \\), with \\( a \\) the ion activity and \\( z \\) its charge. So \\( V = V^0 + \\dfrac{R_gT}{z\\mathcal F}\\ln a \\) (green line).",
        "Switch to base 10: \\( \\ln a = \\ln 10\\cdot\\log_{10} a \\). The slope per decade is \\( \\dfrac{R_gT\\ln 10}{z\\mathcal F} = \\dfrac{8.314\\times298.15\\times2.303}{96485}\\ \\text{V} = 59.16 \\) mV at 25 °C for \\( z=1 \\) (the yellow triangle spans one decade).",
        "A pH electrode responds to H⁺, and \\( \\mathrm{pH} = -\\log_{10} a_{\\mathrm{H^+}} \\). With 0 mV at pH 7: \\( V = 59.16\\ \\text{mV}\\times(7-\\mathrm{pH}) \\). Read back: the yellow dot at 118.3 mV means \\( \\mathrm{pH} = 7 - 118.3/59.16 = 5.00 \\).",
        "The slope is proportional to the absolute temperature \\( T \\): 54.2 mV at 0 °C, 61.5 mV at 37 °C (dashed: the 25 °C line). Without temperature compensation a reading 3 pH units from pH 7 is off by about 0.12 pH at body temperature.",
        "The charge matters: \\( z=2 \\) (Ca²⁺) halves the slope to 29.6 mV/decade; a negative ion such as nitrate (\\( z=-1 \\)) gives a falling line. That is the principle of every ion-selective electrode: soil nitrate, sodium in sweat, potassium in blood.",
      ], (i) => { step = i; draw(); });
      function draw() {
        const s = slope(T, z), s25 = slope(25, z);
        lines[0].set(step >= 1 ? line(T, z) : []);
        lines[1].set(step >= 4 ? line(25, z) : []);
        lines[2].set(step >= 5 ? line(T, 2) : []);
        lines[3].set(step >= 5 ? line(T, -1) : []);
        if (step >= 2) {
          const a = -4, b = -3, va = Vof(a, T, z), vb = Vof(b, T, z);
          tri[0].set([[a, va], [b, va]]); tri[1].set([[b, va], [b, vb]]);
          lab[1].set(b + 0.12, (va + vb) / 2, fmt(Math.abs(s), 1) + " mV / decade");
        } else { tri[0].set([]); tri[1].set([]); lab[1].set(-20, 0, ""); }
        lab[0].set(step >= 1 ? -7.85 : -20, step >= 1 ? (z > 0 ? 400 : -400) : 0, step >= 1 ? `V = ${fmt(s, 1)} mV × (log₁₀a + 7)` : "");
        lab[2].set(step >= 4 ? -1.3 : -20, Vof(-1.3, 25, z) + (z > 0 ? -34 : 34), step >= 4 ? "25 °C" : "");
        lab[3].set(step >= 5 ? -1.2 : -20, Vof(-1.2, T, 2) + 26, step >= 5 ? "z = 2" : "");
        lab[4].set(step >= 5 ? -2.4 : -20, Vof(-2.0, T, -1) - 30, step >= 5 ? "z = −1 (nitrate)" : "");
        const pH = 7 - VM / slope(T, 1);
        if (step >= 3 && z === 1) { const la = -pH; dot.set(la, VM); vl.set(la); hl.set(VM); }
        else { dot.set(NaN, NaN); vl.set(-20); hl.set(-1000); }
        ui.read.innerHTML =
          `T = ${T} °C, z = ${z} → slope R_gT ln10/(z𝓕) = <b style="color:${C.green}">${fmt(s, 2)} mV/decade</b> (at 25 °C: ${fmt(s25, 2)})<br>` +
          (z === 1 ? `pH electrode (0 mV at pH 7), measured <b style="color:${C.yellow}">${VM} mV</b> → pH = 7 − V/slope = <b>${fmt(pH, 2)}</b>` +
            (Math.abs(T - 25) > 0.5 ? ` · <span style="color:${C.red}">if the meter wrongly assumes 25 °C: ${fmt(7 - VM / slope(25, 1), 2)}</span>` : "") :
            `a factor of 10 in concentration moves V by ${fmt(s, 1)} mV; a 5 mV error looks like a factor ${fmt(Math.pow(10, 5 / Math.abs(s)), 2)} in concentration`);
      }
      draw();
    },
  });

  // ═════════════════════════════════════ 3. Cottrell decay and the limit of detection ═════════════════════════════════════
  register("a6-cottrell", {
    title: "Live plot · Cottrell decay: when to read a strip, and the smallest glucose it can see",
    target: "After this you can predict an amperometric sensor's current at any time, choose a reading time, and compute a limit of detection from the blank noise.",
    caption: "<span style='color:" + C.yellow + "'>yellow</span>: the current after the potential step for your sample; faint curves: 5, 10 and 20 mM for comparison; the green dashed line marks the reading time. The red band near zero is the blank's noise ±3σ: a sample whose current at the reading time hides inside it cannot be told from zero. Switch the x-axis to 1/√t and every curve becomes a straight line through the origin, the fingerprint of diffusion control.",
    links: [
      { id: "C3", why: "the 1/√t comes from the diffusion length √(Dt)" },
      { id: "A8", why: "LOD = 3σ_blank/S, the noise floor in concentration units" },
      { id: "A7", why: "early readings are big but contain the capacitive charging spike" },
    ],
    build(fig, ui) {
      let cmM = 7, ts = 5, Dm = 6.7, sig = 0.05, inv = false;
      const n = 2, A = 1e-6;
      let ch, cur, refs, vl, area, lab, dt;
      const host = H("div", {}, ui.body);
      function make() {
        host.innerHTML = "";
        ch = inv ? chart(host, { w: 640, h: 290, xr: [0, 3.2], yr: [-2, 70], xlabel: "1/√t  (s^-1/2)", ylabel: "I (µA)" })
          : chart(host, { w: 640, h: 290, xr: [0, 10], yr: [-2, 70], xlabel: "time after the potential step t (s)", ylabel: "I (µA)" });
        area = ch.area(C.red, 0.22);
        refs = [5, 10, 20].map(() => ch.line(css(mix(C.yellow, C.bg, 0.65)), 1.5));
        cur = ch.line(C.yellow, 2.8);
        vl = ch.vline(C.green);
        dt = ch.dot(C.yellow, 5.5);
        lab = [ch.label(C.dim, 11.5), ch.label(C.yellow, 12.5)];
      }
      make();
      const xOf = (t) => (inv ? 1 / Math.sqrt(t) : t);
      ui.slider("glucose c", 0, 25, 0.5, cmM, (v) => { cmM = v; draw(); return fmt(v, 1) + " mM"; });
      ui.slider("read at t", 1, 10, 0.5, ts, (v) => { ts = v; draw(); return fmt(v, 1) + " s"; });
      ui.slider("D", 3, 10, 0.1, Dm, (v) => { Dm = v; draw(); return fmt(v, 1) + "×10⁻¹⁰ m²/s"; });
      ui.slider("blank noise σ", 0.01, 0.5, 0.01, sig, (v) => { sig = v; draw(); return fmt(v, 2) + " µA"; });
      ui.button("x-axis: t ↔ 1/√t", () => { inv = !inv; make(); draw(); });
      function curve(c) { const D = Dm * 1e-10, pts = []; for (let k = 0; k <= 200; k++) { const t = 0.1 + (9.9 * k) / 200; pts.push([xOf(t), cottrell(t, c, D, n, A) * 1e6]); } return pts; }
      function draw() {
        const D = Dm * 1e-10;
        [5, 10, 20].forEach((c, i) => refs[i].set(curve(c)));
        cur.set(curve(cmM));
        const lo = [], hi = [];
        const xs = inv ? [0, 3.2] : [0, 10];
        lo.push([xs[0], -3 * sig]); lo.push([xs[1], -3 * sig]); hi.push([xs[0], 3 * sig]); hi.push([xs[1], 3 * sig]);
        area.set(lo, hi);
        vl.set(xOf(ts));
        const Is = cottrell(ts, cmM, D, n, A) * 1e6, S = cottrell(ts, 1, D, n, A) * 1e6;
        dt.set(xOf(ts), Is);
        lab[0].set(inv ? 2.2 : 8.2, 3 * sig + 2.2, "±3σ blank");
        lab[1].set(xOf(ts) + (inv ? 0.06 : 0.2), Is + 3, fmt(Is, 2) + " µA");
        const LOD = (3 * sig) / S;
        ui.read.innerHTML =
          `I(t) = n𝓕A c √(D/(πt)) with n = 2, A = 1 mm² · at t = ${fmt(ts, 1)} s: <b style="color:${C.yellow}">I = ${fmt(Is, 2)} µA</b>, sensitivity S = ${fmt(S, 3)} µA/mM<br>` +
          `limit of detection 3σ/S = <b style="color:${C.red}">${fmt(LOD, 3)} mM</b> (${fmt(LOD * 18.016, 1)} mg/dL) · ` +
          `reading c back: I/S = ${fmt(Is / S, 2)} mM` + (Is < 3 * sig ? ` · <span style="color:${C.red}">below the LOD: cannot be told from zero</span>` : "");
      }
      draw();
    },
  });
})();
