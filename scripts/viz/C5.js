/* C5 — lab-on-a-chip, organ-on-chip and integrated sensing: widgets for docs/C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md */
(function () {
  "use strict";
  const { register, C, ROLE, scene3d, chart, fmt, loop, rng, gauss, mix, S, H } = VIZ;
  const NA = 6.02214e23, QE = 1.602177e-19, FAR = 96485, KT = 1.380649e-23 * 298.15;
  const sci = (x, d) => { if (x === 0) return "0"; const e = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, e); return fmt(m, d === undefined ? 2 : d) + "×10" + String(e).split("").map((ch) => "⁰¹²³⁴⁵⁶⁷⁸⁹"["0123456789".indexOf(ch)] || (ch === "-" ? "⁻" : ch)).join(""); };
  const link = (id) => `<a href="#${id}" style="color:${C.yellow}">${id}</a>`;

  // ───────────────────────────────── c5-chip-3d (the hero) ─────────────────────────────────
  register("c5-chip-3d", {
    title: "3D · one drop through a lab-on-a-chip: prep → meter → mix → react → detect → condition → decide",
    target: "After this you can walk a sample through all seven stages of a chip, name the key equation of each, and say which note explains it.",
    caption: "a 25 mm glass/PDMS chip (channels drawn thicker than real). The blue plug is the sample; step through the stages and the plug runs only through the highlighted one, while the readout gives that stage's numbers and the note to read. Stages 6 and 7 are electrical: teal pulses carry the current to the amplifier/ADC and the yellow result to the display.",
    links: [
      { id: "C4", why: "capillary filling, stop valves and droplets: the pumps and valves with no moving parts" },
      { id: "C3", why: "the serpentine exists because diffusion alone is too slow (Pe ≫ 1)" },
      { id: "A6", why: "the three electrodes are an electrochemical cell (Cottrell current)" },
      { id: "A7", why: "the TIA + ADC chip turns microamps into counts" },
    ],
    build(fig, ui) {
      let stage = 0;
      // channel centreline (x, y) and its arc length
      const PTS = [[-4.4, 2.2], [-0.8, 2.2], [-0.8, 0.9], [-0.4, 0.9], [-0.4, 2.4], [0, 2.4], [0, 0.9], [0.4, 0.9], [0.4, 2.4], [0.8, 2.4], [0.8, -0.6], [4.5, -0.6]];
      const cum = [0];
      for (let i = 1; i < PTS.length; i++) cum.push(cum[i - 1] + Math.hypot(PTS[i][0] - PTS[i - 1][0], PTS[i][1] - PTS[i - 1][1]));
      const Ltot = cum[cum.length - 1];
      const at = (s) => {
        s = Math.max(0, Math.min(Ltot, s));
        let i = 1; while (i < cum.length - 1 && cum[i] < s) i++;
        const t = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
        return [PTS[i - 1][0] + (PTS[i][0] - PTS[i - 1][0]) * t, PTS[i - 1][1] + (PTS[i][1] - PTS[i - 1][1]) * t];
      };
      const sOf = (p) => {   // arc length of a point that lies on the path
        for (let i = 1; i < PTS.length; i++) {
          const a = PTS[i - 1], b = PTS[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
          const t = ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / (L * L);
          const q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
          if (t >= -1e-6 && t <= 1 + 1e-6 && Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-6) return cum[i - 1] + t * L;
        }
        return 0;
      };
      const SB = [[-4.4, 2.2], [-2.75, 2.2], [-1.3, 2.2], [0.8, 0.0], [2.6, -0.6], [4.5, -0.6]].map(sOf);
      const ST = [
        { name: "the whole chain", box: null },
        { name: "① sample in + prep", sh: "1 prep", box: [[-4.85, 1.7], [-2.75, 2.7]], lab: [-3.8, 2.95] },
        { name: "② metering", sh: "2 meter", box: [[-2.75, 1.7], [-1.3, 3.2]], lab: [-2.0, 3.45] },
        { name: "③ mixing", sh: "3 mix", box: [[-1.45, 0.25], [1.0, 2.65]], lab: [-0.2, 2.9] },
        { name: "④ reaction / PCR", sh: "4 react", box: [[0.6, -1.3], [2.65, 0.1]], lab: [1.6, 0.35] },
        { name: "⑤ detection", sh: "5 detect", box: [[2.65, -2.85], [4.85, -0.15]], lab: [3.75, 0.1] },
        { name: "⑥ conditioning", sh: "6 amplify", box: [[0.85, -3.0], [2.65, -1.85]], lab: [1.75, -3.3] },
        { name: "⑦ decision", sh: "7 decide", box: [[-1.75, -3.0], [0.15, -1.85]], lab: [-0.8, -3.3] },
      ];
      const CH = 0.22, ZC = 0.09;                      // channel width and depth (display)
      const fluid = C.water, glass = mix(C.silicon, "#ffffff", 0.08);
      const chan = (g, a, b, wdt, col, alpha) => {
        const x0 = Math.min(a[0], b[0]) - (a[1] === b[1] ? 0 : wdt / 2), x1 = Math.max(a[0], b[0]) + (a[1] === b[1] ? 0 : wdt / 2);
        const y0 = Math.min(a[1], b[1]) - (a[0] === b[0] ? 0 : wdt / 2), y1 = Math.max(a[1], b[1]) + (a[0] === b[0] ? 0 : wdt / 2);
        g.box([x0, y0, 0.001], [x1, y1, ZC], col, { alpha: alpha === undefined ? 0.8 : alpha, bias: 40 });
      };
      const well = (g, p, r, col, label) => {
        g.cylinder([p[0], p[1], 0], [p[0], p[1], 0.32], r, mix(C.silicon, "#ffffff", 0.35), 16, { alpha: 0.55, open: true, bias: 45 });
        g.poly(Array.from({ length: 16 }, (_, i) => [p[0] + r * 0.95 * Math.cos((i * Math.PI) / 8), p[1] + r * 0.95 * Math.sin((i * Math.PI) / 8), 0.12]), col, { alpha: 0.9, bias: 44, shade: false });
        if (label) g.text([p[0], p[1] - r - 0.28, 0.35], label, C.dim, 11);
      };
      const dotBox = (g, p, r, col) => g.box([p[0] - r, p[1] - r, p[2] - r], [p[0] + r, p[1] + r, p[2] + r], col, { bias: 58 });
      const sc = scene3d(ui.body, {
        w: 640, h: 430, scale: 55, yaw: -0.22, pitch: 0.92, dist: 40, center: [0, -0.1, 0], animate: !VIZ.reduceMotion,
        draw(g, t) {
          // slab
          g.box([-5.2, -3.6, -0.4], [5.2, 3.6, 0], glass, { alpha: 1, bias: -100 });   // always painted first
          g.grid(0.002, [-5, 5], [-3.4, 3.4], 1, mix(C.silicon, C.bg, 0.25));
          // channels
          for (let i = 1; i < PTS.length; i++) chan(g, PTS[i - 1], PTS[i], CH, fluid);
          chan(g, [-1.2, 0.75], [-1.2, 2.2], CH, mix(fluid, "#ffffff", 0.35));       // reagent channel
          chan(g, [-2.1, 2.55], [-2.1, 2.95], 0.16, fluid, 0.6);                     // overflow
          // ① filter region with pillars
          g.box([-3.9, 1.85, 0.001], [-2.9, 2.55, ZC], fluid, { alpha: 0.55, bias: 41 });
          for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) g.cylinder([-3.75 + i * 0.25, 1.98 + j * 0.22, 0], [-3.75 + i * 0.25, 1.98 + j * 0.22, ZC + 0.04], 0.05, C.silicon, 8, { bias: 46 });
          // ② metering chamber + hydrophobic stop valve
          g.box([-2.55, 1.85, 0.001], [-1.65, 2.55, ZC], fluid, { alpha: 0.7, bias: 41 });
          g.box([-1.5, 2.2 - CH / 2 - 0.03, ZC], [-1.38, 2.2 + CH / 2 + 0.03, ZC + 0.03], C.red, { alpha: 0.9, bias: 48 });
          // ④ incubation chamber + heater
          g.box([1.25, -1.15, 0.001], [2.55, -0.05, ZC], fluid, { alpha: 0.65, bias: 41 });
          // thin-film heater (drawn on top of the chamber so it stays visible; really it sits underneath)
          const hw = stage === 4 ? 0.035 : 0.022, hc = stage === 4 ? C.gold : mix(C.gold, C.bg, 0.3);
          for (let k = 0; k <= 6; k++) {
            const x = 1.33 + k * 0.2;
            g.box([x - hw, -1.08, ZC + 0.004], [x + hw, -0.12, ZC + 0.016], hc, { bias: 49, shade: false });
            if (k < 6) { const yb = k % 2 ? -0.12 : -1.08; g.box([x, yb - hw, ZC + 0.004], [x + 0.2, yb + hw, ZC + 0.016], hc, { bias: 49, shade: false }); }
          }
          // ⑤ electrodes W, R, C, pads, traces to the AFE
          [[3.1, "W"], [3.45, "R"], [3.8, "C"]].forEach(([x, nm], k) => {
            g.box([x - 0.07, -2.45, 0.001], [x + 0.07, -0.42, ZC * 0.55], C.teal, { bias: 47 });
            g.box([x - 0.16, -2.85, 0.001], [x + 0.16, -2.45, 0.03], C.teal, { bias: 47 });
            g.text([x, -2.65, 0.25], nm, C.text, 11);
            g.polyline([[x, -2.85, 0.02], [x, -3.05 - 0.08 * k, 0.02], [2.5, -3.05 - 0.08 * k, 0.02], [2.4, -2.2 - 0.08 * k, 0.02]], mix(C.teal, C.bg, 0.25), 1.6);
          });
          g.box([0.95, -2.85, 0.001], [2.4, -1.95, 0.22], "#1b1f26", { bias: 47 });
          for (let k = 0; k < 6; k++) { g.line([1.05 + k * 0.25, -1.95, 0.05], [1.05 + k * 0.25, -1.8, 0.0], C.silicon, 1.5); g.line([1.05 + k * 0.25, -2.85, 0.05], [1.05 + k * 0.25, -3.0, 0.0], C.silicon, 1.5); }
          g.text([1.67, -2.4, 0.4], "TIA + ADC", C.teal, 11.5);
          // ⑦ display
          g.box([-1.65, -2.85, 0.001], [0.05, -1.95, 0.12], "#0b1a14", { bias: 47 });
          g.polyline([[0.95, -2.4, 0.05], [0.05, -2.4, 0.05]], mix(C.teal, C.bg, 0.25), 1.6);
          const done = stage === 7 || stage === 0;
          g.text([-0.8, -2.4, 0.3], done ? "5.0 mM  normal" : "– – –", done ? C.yellow : C.dim, 12.5);
          dotBox(g, [-1.45, -2.1, 0.2], 0.07, stage === 7 || stage === 0 ? C.green : C.silicon);
          // wells
          well(g, PTS[0], 0.32, C.blue, "sample");
          well(g, [-1.2, 0.55], 0.25, mix(fluid, "#ffffff", 0.35), "reagent");
          well(g, [-2.1, 3.1], 0.18, fluid, "");
          well(g, [4.6, -0.6], 0.25, mix(fluid, C.bg, 0.4), "waste");
          // stage labels and highlight
          ST.forEach((st, k) => {
            if (!st.box) return;
            const on = stage === k;
            if (on) {
              const [[x0, y0], [x1, y1]] = st.box, z = 0.36;
              g.polyline([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [x0, y0, z]], C.yellow, 2.2);
              g.poly([[x0, y0, 0.006], [x1, y0, 0.006], [x1, y1, 0.006], [x0, y1, 0.006]], C.yellow, { alpha: 0.1, shade: false, bias: 39 });
            }
            g.text([st.lab[0], st.lab[1], 0.4], on ? st.name : st.sh, on ? C.yellow : mix(C.dim, C.text, 0.3), on ? 14.5 : 12);
          });
          // the sample plug
          const vis = (s) => { const p = at(s); return [p[0], p[1], ZC + 0.06]; };
          if (stage <= 5) {
            const a = stage === 0 ? 0 : SB[stage - 1], b = stage === 0 ? Ltot : SB[stage];
            const sp = stage === 0 ? 1.6 : 0.8, len = b - a;
            const s = VIZ.reduceMotion ? a + 0.6 * len : a + ((t * sp) % (len + 0.4));
            for (let k = 0; k < 6; k++) { const sk = s - k * 0.07; if (sk >= a - 0.01 && sk <= b + 0.01) dotBox(g, vis(sk), 0.125, k ? C.blue : mix(C.blue, "#ffffff", 0.4)); }
            if (stage === 3) {                      // reagent joins the stream in the mixer
              const sr = s - 0.25;
              if (sr > a) dotBox(g, vis(sr), 0.09, mix(fluid, "#ffffff", 0.55));
            }
          } else {
            // electrical stages: teal pulses on the traces, then the yellow result to the display
            const ph = VIZ.reduceMotion ? 0.5 : (t * 0.6) % 1;
            if (stage === 6) [3.1, 3.45, 3.8].forEach((x, k) => {
              const path = [[x, -2.85], [x, -3.05 - 0.08 * k], [2.5, -3.05 - 0.08 * k], [2.4, -2.2 - 0.08 * k]];
              const segL = [0]; for (let i = 1; i < path.length; i++) segL.push(segL[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
              const s = ph * segL[3]; let i = 1; while (i < 3 && segL[i] < s) i++;
              const u = (s - segL[i - 1]) / (segL[i] - segL[i - 1]);
              dotBox(g, [path[i - 1][0] + (path[i][0] - path[i - 1][0]) * u, path[i - 1][1] + (path[i][1] - path[i - 1][1]) * u, 0.08], 0.07, C.teal);
            });
            if (stage === 7) dotBox(g, [0.95 - 0.9 * ph, -2.4, 0.12], 0.08, C.yellow);
          }
        },
      });
      const INFO = [
        `<b>Seven stages, one chain:</b> c → molecules at the sensor → current → volts → counts → decision. Overall sensitivity \\(S=\\prod g_i\\) = 128 counts/mM for the glucose strip (${link("A1")}; the signal-budget figure below multiplies them out).`,
        `<b>① prep</b> · fills by capillarity, no pump (${link("C4")}); pillars hold back blood cells (${link("C1")}). Sampling: P(no target) = e<sup>−cV</sup> → 10 µL at 100 CFU/mL misses 37%; 95% needs cV ≥ 3.`,
        `<b>② metering</b> · chamber volume V = w h L sets the dose; the red hydrophobic stop valve holds until Δp > 2γ|cosθ|(1/w+1/h) = <b>1.48 kPa</b> (${link("C4")}); driving the 5 cm serpentine at 1 µL/min takes Δp = R<sub>hyd</sub>Q = <b>1.17 kPa</b> (${link("C2")}).`,
        `<b>③ mixing</b> · laminar streams only diffuse (${link("C1")}): t = w²/2D = <b>125 s</b> for a protein across 100 µm, Pe = 2500; folding into 10 µm layers gives <b>1.25 s</b> (${link("C3")}).`,
        `<b>④ reaction</b> · Da = k<sub>on</sub>b<sub>m</sub>δ/D = <b>4.15</b>: transport-limited; at 1 fM a 100 µm sensor catches ≈ 1 molecule in 10 min. The gold heater cycles PCR: τ ≈ L²/α = 0.07 s here vs 28 s in a tube (${link("B1")}).`,
        `<b>⑤ detection</b> · W/R/C electrodes: Cottrell I = nFAc√(D/πt) = <b>6.30 µA</b> at 5 mM (${link("A6")}); alternatives: fluorescence (${link("A5")}), impedance/Coulter (${link("A3")}), resonator Δf/f = −Δm/2m (${link("B3")}).`,
        `<b>⑥ conditioning</b> · TIA V = IR<sub>f</sub> = 0.517 V at 82 kΩ, 12-bit ADC → <b>641 counts</b> (${link("A7")}); quantisation adds 2.84 nA of noise.`,
        `<b>⑦ decision</b> · σ<sub>tot</sub> = 20.2 nA (blank chemistry dominates) → LOD = 3σ/S = <b>0.048 mM</b> (${link("A8")}); 5.0 mM is well above the 3.9 mM hypoglycaemia threshold: "normal".`,
      ];
      ui.steps([
        "The chip is the measurement chain of A1 with plumbing in front: \\( c \\xrightarrow{\\text{fluidics}} N \\xrightarrow{\\text{transducer}} I \\xrightarrow{R_f} V \\xrightarrow{\\text{ADC}} \\text{counts} \\). Press ▶ to walk the plug through it.",
        "① Sample in: capillary filling with no pump (C4); pillars filter cells. Is the target even there? \\( P(\\text{none})=e^{-cV} \\Rightarrow cV\\ge3 \\) for 95%.",
        "② Metering: the chamber fixes \\( V=whL \\); the stop valve bursts at \\( \\Delta p=2\\gamma\\lvert\\cos\\theta\\rvert(1/w+1/h) \\) (C4) while the pump supplies \\( \\Delta p=R_{\\text{hyd}}Q \\) (C2).",
        "③ Mixing: \\( t\\approx w^2/(2D) \\) and \\( \\mathrm{Pe}=Uw/D\\gg1 \\), so the serpentine folds the streams to shrink w (C1, C3).",
        "④ Reaction: \\( \\mathrm{Da}=k_{\\text{on}}b_m\\delta/D \\); if \\( \\mathrm{Da}>1 \\) delivery limits, \\( N=2cA\\sqrt{Dt/\\pi} \\). PCR heating: \\( \\tau\\approx L^2/\\alpha_{\\text{th}} \\) (B1).",
        "⑤ Detection: \\( I=n\\mathcal FAc\\sqrt{D/(\\pi t)} \\) (A6) — the same diffusion flux as step ④, times charge.",
        "⑥ Conditioning: \\( V=IR_f \\), counts \\( =V\\,2^N/V_{\\text{ref}} \\) (A7). Size \\( R_f \\) so the top of the range does not clip.",
        "⑦ Decision: refer all noise to the input, \\( \\sigma_{\\text{tot}}^2=\\sum\\sigma_i^2 \\); \\( \\mathrm{LOD}=3\\sigma_{\\text{tot}}/S \\) (A8); compare with the threshold.",
      ], (i) => { stage = i; ui.read.innerHTML = INFO[i]; VIZ.typeset(ui.read); sc.render(); });
    },
  });

  // ───────────────────────────────── c5-signal-budget ─────────────────────────────────
  register("c5-signal-budget", {
    title: "The signal budget · S = g₁·g₂·g₃·g₄ and LOD = 3σ_tot / S for a glucose strip",
    target: "After this you can multiply the stage gains of a sensing chain, refer each noise source to the input, find the weakest link, and compute the limit of detection.",
    caption: "boxes are the stages of the strip: concentration (blue) → molecules oxidised per second (fluid) → current and voltage (teal) → ADC counts (yellow). Red arrows inject noise: the blank's chemistry, the feedback resistor's Johnson noise and the ADC's quantisation. Bottom: the calibration line (green) with its ±3σ band and the ADC ceiling. Raise R_f and watch it clip; drop to 8 bits and watch the ADC become the weakest link.",
    links: [
      { id: "A1", why: "sensitivity is the product of the stage gains" },
      { id: "A6", why: "the Cottrell current is the first gain" },
      { id: "A7", why: "TIA gain R_f and ADC step V_ref/2^N" },
      { id: "A8", why: "noise adds in variance; LOD = 3σ/S" },
    ],
    build(fig, ui) {
      let c = 5, Rf = 82e3, Nb = 12, sBlank = 20e-9, step = 4;
      const n = 2, A = 1e-6, D = 6.7e-10, t = 5, Vref = 3.3, df = 10;
      const model = () => {
        const kc = Math.sqrt(D / (Math.PI * t));
        const g1 = (1 * A * kc * NA) / 1;               // molecules/s per mM (1 mM = 1 mol/m³)
        const g2 = n * QE, g3 = Rf, g4 = Math.pow(2, Nb) / Vref;
        const SI = g1 * g2;                               // A per mM
        const sJ = Math.sqrt((4 * KT * df) / Rf), sQ = Vref / Math.pow(2, Nb) / Math.sqrt(12) / Rf;
        const sTot = Math.sqrt(sBlank * sBlank + sJ * sJ + sQ * sQ);
        const I = SI * c, V = I * Rf, cntRaw = V * g4, full = Math.pow(2, Nb) - 1;
        return { g1, g2, g3, g4, SI, S: g1 * g2 * g3 * g4, sJ, sQ, sTot, I, V, cnt: Math.min(full, cntRaw), clip: cntRaw > full, full, LOD: (3 * sTot) / SI, cmax: Vref / (SI * Rf) };
      };
      const W = 640, Hh = 236;
      const svg = S("svg", { viewBox: `0 0 ${W} ${Hh}`, role: "img", "aria-label": "signal chain with gains and noise" }, ui.body);
      const BX = [12, 140, 268, 396, 524], BW = 104, BY = 46, BHt = 74;
      const cols = [C.blue, C.water, C.teal, C.teal, C.yellow];
      const heads = ["concentration c", "molecules / s", "current I", "voltage V", "ADC counts"];
      const boxes = BX.map((x, i) => {
        const g = S("g", {}, svg);
        S("rect", { x, y: BY, width: BW, height: BHt, rx: 9, fill: "#151b23", stroke: cols[i], "stroke-width": 2 }, g);
        const h = S("text", { x: x + BW / 2, y: BY + 18, fill: C.dim, "font-size": 11.5, "text-anchor": "middle", "font-family": "var(--font-mono, monospace)" }, g); h.textContent = heads[i];
        const v = S("text", { x: x + BW / 2, y: BY + 44, fill: cols[i], "font-size": 15, "font-weight": 600, "text-anchor": "middle", "font-family": "var(--font-mono, monospace)" }, g);
        const v2 = S("text", { x: x + BW / 2, y: BY + 63, fill: C.dim, "font-size": 10.5, "text-anchor": "middle", "font-family": "var(--font-mono, monospace)" }, g);
        return { g, v, v2 };
      });
      const arrs = [0, 1, 2, 3].map((i) => {
        const x0 = BX[i] + BW + 2, x1 = BX[i + 1] - 3, y = BY + BHt / 2, g = S("g", {}, svg);
        const l = S("line", { x1: x0, y1: y, x2: x1 - 6, y2: y, stroke: C.dim, "stroke-width": 2.5 }, g);
        const hd = S("polygon", { points: `${x1},${y} ${x1 - 8},${y - 5} ${x1 - 8},${y + 5}`, fill: C.dim }, g);
        const lab = S("text", { x: (x0 + x1) / 2, y: BY - 12, fill: C.text, "font-size": 11, "text-anchor": "middle", "font-family": "var(--font-mono, monospace)" }, svg);
        const lab2 = S("text", { x: (x0 + x1) / 2, y: BY - 26, fill: C.dim, "font-size": 10.5, "text-anchor": "middle", "font-family": "var(--font-mono, monospace)" }, svg);
        return { l, hd, lab, lab2 };
      });
      const noiseAt = [2, 3, 4], noiseName = ["blank chemistry", "Johnson of R_f", "quantisation"];
      const nz = noiseAt.map((bi, k) => {
        const x = BX[bi] + BW / 2, y0 = BY + BHt + 34, y1 = BY + BHt + 4;
        S("line", { x1: x, y1: y0, x2: x, y2: y1 + 7, stroke: C.red, "stroke-width": 2.2 }, svg);
        S("polygon", { points: `${x},${y1} ${x - 5},${y1 + 8} ${x + 5},${y1 + 8}`, fill: C.red }, svg);
        const t1 = S("text", { x, y: y0 + 14, fill: C.red, "font-size": 11, "text-anchor": "middle", "font-family": "var(--font-mono, monospace)" }, svg); t1.textContent = noiseName[k];
        const t2 = S("text", { x, y: y0 + 28, fill: C.red, "font-size": 11, "text-anchor": "middle", "font-family": "var(--font-mono, monospace)" }, svg);
        return t2;
      });
      const prodTxt = S("text", { x: W / 2, y: 226, fill: C.green, "font-size": 13, "text-anchor": "middle", "font-family": "var(--font-mono, monospace)" }, svg);
      // calibration chart
      const ch = chart(ui.body, { w: 640, h: 230, xr: [0, 30], yr: [0, 4], xlabel: "glucose c (mM)", ylabel: "TIA output V (V)", mb: 38 });
      const band = ch.area(C.red, 0.4), line = ch.line(C.green, 2.5), ceil = ch.hline(C.red, "6 4"), dot = ch.dot(C.yellow, 6), lodL = ch.vline(C.yellow, "3 3");
      const thr = ch.vline(C.dim, "2 5"), thrL = ch.label(C.dim, 11, "start"), ceilL = ch.label(C.red, 11, "end"), lodLab = ch.label(C.yellow, 11, "start");
      thr.set(3.9); thrL.set(4.1, 3.8, "3.9 mM: hypoglycaemia threshold");
      function draw() {
        const m = model();
        // boxes
        boxes[0].v.textContent = fmt(c, 1) + " mM"; boxes[0].v2.textContent = "= " + fmt(c, 1) + " mol/m³";
        boxes[1].v.textContent = sci(m.g1 * c, 2) + "/s"; boxes[1].v2.textContent = "oxidised glucose";
        boxes[2].v.textContent = fmt(m.I * 1e6, 2) + " µA"; boxes[2].v2.textContent = "Cottrell, t = 5 s";
        boxes[3].v.textContent = fmt(Math.min(m.V, Vref), 3) + " V"; boxes[3].v2.textContent = m.V > Vref ? "CLIPPED at V_ref" : "V = I R_f";
        boxes[3].v.setAttribute("fill", m.V > Vref ? C.red : C.teal);
        boxes[4].v.textContent = fmt(m.cnt, 0); boxes[4].v2.textContent = Nb + "-bit, " + Vref + " V ref";
        const gl = [["× A√(D/πt)·N_A", sci(m.g1, 2) + " /s per mM"], ["× n q_e", sci(m.g2, 2) + " C"], ["× R_f", fmt(Rf / 1e3, 0) + " kΩ"], ["× 2^N / V_ref", fmt(m.g4, 1) + " /V"]];
        arrs.forEach((a, i) => {
          a.lab.textContent = gl[i][1]; a.lab2.textContent = gl[i][0];
          const hot = step === i, live = step >= i;
          a.l.setAttribute("stroke", hot ? C.yellow : live ? C.text : C.dim); a.hd.setAttribute("fill", hot ? C.yellow : live ? C.text : C.dim);
          a.lab.setAttribute("fill", hot ? C.yellow : live ? C.text : C.dim);
        });
        boxes.forEach((b, i) => b.g.setAttribute("opacity", step >= 4 || i <= step + 1 ? 1 : 0.3));
        nz[0].textContent = fmt(sBlank * 1e9, 1) + " nA"; nz[1].textContent = fmt(m.sJ * 1e12, 2) + " pA"; nz[2].textContent = fmt(m.sQ * 1e9, 2) + " nA";
        const partial = [m.g1, m.g1 * m.g2 * 1e6, m.g1 * m.g2 * m.g3, m.S];
        const units = [" molecules/s per mM", " µA/mM", " V/mM", " counts/mM"];
        prodTxt.textContent = step < 4 ? `running product after stage ${step + 1}: ${step === 0 ? sci(partial[0], 3) : fmt(partial[step], step === 3 ? 1 : 4)}${units[step]}` : `S = ${fmt(m.S, 1)} counts/mM · σ_tot = ${fmt(m.sTot * 1e9, 2)} nA → LOD = 3σ/S = ${fmt(m.LOD, 4)} mM`;
        // chart
        const xs = []; for (let k = 0; k <= 60; k++) xs.push((30 * k) / 60);
        const vv = (x) => Math.min(Vref, m.SI * Rf * x), sV = 20 * 3 * m.sTot * Rf;   // ±3σ band, drawn 20× wider so it is visible
        line.set(xs.map((x) => [x, vv(x)]));
        band.set(xs.map((x) => [x, Math.max(0, vv(x) - sV)]), xs.map((x) => [x, Math.min(Vref, vv(x) + sV)]));
        ceil.set(Vref); ceilL.set(29.5, Vref + 0.17, "ADC full scale = V_ref = 3.3 V (" + m.full + " counts)");
        dot.set(c, Math.min(m.V, Vref));
        lodL.set(Math.max(0.05, m.LOD)); lodLab.set(Math.max(0.05, m.LOD) + 0.3, 2.9, "LOD " + fmt(m.LOD, 3) + " mM (red band = ±3σ, drawn 20× wider)");
        const worst = [[sBlank, "blank chemistry"], [m.sJ, "Johnson noise"], [m.sQ, "ADC quantisation"]].sort((a, b) => b[0] - a[0])[0][1];
        ui.read.innerHTML =
          `S = ${sci(m.g1, 3)} × ${sci(m.g2, 3)} × ${fmt(Rf / 1e3, 0)}k × ${fmt(m.g4, 1)} = <b style="color:${C.yellow}">${fmt(m.S, 1)} counts/mM</b> (${fmt(m.SI * 1e6, 3)} µA/mM)<br>` +
          `noise at the current: √(${fmt(sBlank * 1e9, 1)}² + ${fmt(m.sJ * 1e9, 4)}² + ${fmt(m.sQ * 1e9, 2)}²) = <b style="color:${C.red}">${fmt(m.sTot * 1e9, 2)} nA</b> · weakest link: <b>${worst}</b><br>` +
          `LOD = 3σ/S = <b>${fmt(m.LOD, 4)} mM</b> (${fmt(m.LOD * 18.016, 2)} mg/dL) · readable up to <b style="color:${m.cmax < 30 ? C.red : C.green}">${fmt(Math.min(m.cmax, 999), 1)} mM</b> before clipping`;
      }
      ui.slider("glucose c", 0, 30, 0.5, c, (v) => { c = v; draw(); return fmt(v, 1) + " mM"; });
      ui.slider("R_f", 20, 400, 2, 82, (v) => { Rf = v * 1e3; draw(); return v + " kΩ"; });
      ui.slider("ADC bits N", 8, 16, 1, Nb, (v) => { Nb = v; draw(); return String(v); });
      ui.slider("blank noise", 2, 60, 1, 20, (v) => { sBlank = v * 1e-9; draw(); return v + " nA"; });
      ui.steps([
        "Chemistry + transport: the electrode oxidises \\( A\\sqrt{D/(\\pi t)}\\,N_A \\) molecules/s per mM, \\( 3.93\\times10^{12} \\) (A6, C3).",
        "Each glucose gives \\( n=2 \\) electrons: \\( \\times\\,nq_e \\) → \\( 1.26 \\) µA/mM.",
        "Transimpedance amplifier: \\( \\times R_f \\) → \\( 0.103 \\) V/mM at 82 kΩ (A7). Too big an \\( R_f \\) clips the top of the range.",
        "ADC: \\( \\times 2^N/V_{\\text{ref}} = 1241 \\) counts/V → \\( S=128.3 \\) counts/mM.",
        "Noise referred to the current adds in variance: \\( \\sigma_{\\text{tot}}=\\sqrt{\\sigma_{\\text{blank}}^2+\\sigma_J^2+\\sigma_Q^2}=20.2 \\) nA, so \\( \\mathrm{LOD}=3\\sigma_{\\text{tot}}/S_I=0.048 \\) mM (A8).",
      ], (i) => { step = i; draw(); });
    },
  });

  // ───────────────────────────────── c5-coulter ─────────────────────────────────
  register("c5-coulter", {
    title: "Coulter counter · each cell is a resistance pulse ΔR ≈ 4ρ_e d³ / (π D_ap⁴)",
    target: "After this you can explain how a blood counter both counts cells and sizes them from one resistance signal, and why too many cells at once (coincidence) corrupts the count.",
    caption: "cells (blue) are pulled through a small aperture between two electrodes (teal) carrying a constant current. Each one displaces conducting saline, so the voltage jumps by IΔR for as long as it is inside: one pulse per cell, height ∝ volume. The histogram converts pulse heights back to volumes: platelets (≈ 10 fL), red cells (≈ 90 fL), white cells (≈ 500 fL). White cells are shown 70× more common than in real blood so you can see them. Raise the cell rate and pulses start to overlap: two small cells look like one big one.",
    links: [
      { id: "A2", why: "a change of resistance read as a voltage, like a strain gauge" },
      { id: "A8", why: "counting N cells has a ±1/√N Poisson error; pulses ride on noise" },
      { id: "C2", why: "the aperture is a hydraulic resistor that sets the flow" },
      { id: "A5", why: "optical flow cytometers count the same way with laser light" },
    ],
    build(fig, ui) {
      let Dap = 50, rate = 2, I0 = 0.1e-3;           // µm, cells per (display) second, A
      const rhoE = 0.67, Lap = 60e-6;
      const TYPES = [{ nm: "platelet", v: 10, p: 0.22 }, { nm: "red cell", v: 90, p: 0.68 }, { nm: "white cell", v: 524, p: 0.10 }];
      const rnd = rng(11);
      const W = 640, H2 = 220, XA0 = 290, XA1 = 350, YC = 112;
      const svg = S("svg", { viewBox: `0 0 ${W} ${H2}`, role: "img", "aria-label": "cells passing an aperture" }, ui.body);
      S("rect", { x: 20, y: 22, width: 600, height: 180, rx: 10, fill: C.water, "fill-opacity": 0.09, stroke: C.silicon }, svg);
      const wallTop = S("rect", { x: XA0, y: 22, width: XA1 - XA0, height: 0, fill: C.silicon }, svg);
      const wallBot = S("rect", { x: XA0, y: 0, width: XA1 - XA0, height: 0, fill: C.silicon }, svg);
      S("rect", { x: 40, y: 50, width: 10, height: 124, fill: C.teal }, svg);
      S("rect", { x: 590, y: 50, width: 10, height: 124, fill: C.teal }, svg);
      const lab = (x, y, s, col, anc) => { const t = S("text", { x, y, fill: col, "font-size": 12, "text-anchor": anc || "middle", "font-family": "var(--font-mono, monospace)" }, svg); t.textContent = s; return t; };
      lab(45, 16, "electrode", C.teal); lab(595, 16, "electrode", C.teal);
      const apLab = lab(320, 214, "", C.dim);
      lab(160, 40, "flow →", C.dim); lab(470, 196, "constant current I = 0.1 mA", C.teal);
      const gCells = S("g", {}, svg);
      // trace and histogram
      const box = H("div", { style: "display:flex;gap:0;flex-wrap:wrap" }, ui.body);
      const hi = chart(box, { w: 240, h: 200, xr: [3, 2000], yr: [0, 1], logx: true, xlabel: "cell volume (fL)", ylabel: "", mb: 36, ml: 18, mr: 10 });
      hi.svg.style.width = "37.5%";
      let tr, trace, thrLine;
      function makeTrace(top) {   // rebuilt when the aperture changes, so the axis ticks stay true
        if (tr) tr.svg.remove();
        tr = chart(box, { w: 400, h: 200, xr: [-4, 0], yr: [0, top], xlabel: "time (s, slow motion)", ylabel: "ΔV = I·ΔR (mV)", mb: 36, ml: 46 });
        box.insertBefore(tr.svg, hi.svg); tr.svg.style.width = "62.5%";
        trace = tr.line(C.yellow, 1.8); thrLine = tr.hline(C.red, "4 4");
      }
      const NB = 28, bins = new Array(NB).fill(0), bars = [];
      for (let k = 0; k < NB; k++) bars.push(S("rect", { fill: C.yellow, "fill-opacity": 0.8 }, hi.gMain));
      [[10, "PLT"], [90, "RBC"], [524, "WBC"]].forEach(([v, s]) => { const l = hi.label(C.dim, 10.5, "middle"); l.set(v, 0.93, s); });
      let cells = [], buf = [], tNext = 0, peak = 0, inPulse = false, counted = 0, coinc = 0, tAll = 0;
      const phys = () => {
        const D = Dap * 1e-6, R = (4 * rhoE * Lap) / (Math.PI * D * D);
        const dR = (v) => { const d = Math.cbrt((6 * v * 1e-18) / Math.PI); return (4 * rhoE * d * d * d) / (Math.PI * Math.pow(D, 4)); };
        return { D, R, dR, Vap: (Math.PI / 4) * D * D * Lap };
      };
      let P = phys();
      const thr = () => Math.max(0.15, 0.5 * P.dR(10) * I0 * 1e3);   // mV: half a platelet pulse, but never below 5σ of the 0.03 mV noise
      function reset() { bins.fill(0); counted = 0; coinc = 0; }
      function geometry() {
        const half = Math.max(8, Math.min(70, Dap * 0.8));
        wallTop.setAttribute("height", YC - half - 22);
        wallBot.setAttribute("y", YC + half); wallBot.setAttribute("height", 202 - YC - half);
        apLab.textContent = `aperture D = ${Dap} µm, L = 60 µm`;
        return half;
      }
      let half = geometry();
      const topOf = () => { const v = P.dR(524) * I0 * 1e3 * 1.3; const m = Math.pow(10, Math.floor(Math.log10(v))); return Math.ceil(v / m) * m; };
      makeTrace(topOf());
      const spawn = () => {
        let r = rnd(), k = 0; while (k < 2 && r > TYPES[k].p) { r -= TYPES[k].p; k++; }
        const v = TYPES[k].v * Math.exp(0.18 * gauss(rnd));
        const y = YC + (rnd() - 0.5) * Math.min(2 * half - 12, 120) * 0.8;
        cells.push({ x: 30, y, v, k, y0: y });
      };
      function step(dt) {
        tAll += dt;
        tNext -= dt;
        while (tNext <= 0) { spawn(); tNext += -Math.log(1 - rnd() + 1e-9) / rate; }
        // speed: faster in the aperture (continuity)
        let sig = 0;
        cells.forEach((c) => {
          const inAp = c.x > XA0 - 20 && c.x < XA1 + 20;
          const v = inAp ? 520 : 110;
          c.x += v * dt;
          // funnel toward the axis near the aperture
          const target = YC + (c.y0 - YC) * Math.min(1, Math.abs(c.x - (XA0 + XA1) / 2) / 160);
          c.y += (target - c.y) * Math.min(1, dt * 8);
          if (c.x > XA0 && c.x < XA1) { const u = (c.x - XA0) / (XA1 - XA0); sig += P.dR(c.v) * I0 * 1e3 * Math.pow(Math.sin(Math.PI * u), 0.6); }
        });
        cells = cells.filter((c) => c.x < 610);
        const nIn = cells.filter((c) => c.x > XA0 && c.x < XA1).length;
        sig += 0.03 * gauss(rnd);
        // pulse detection → histogram (volume from the peak height)
        if (sig > thr()) { inPulse = true; peak = Math.max(peak, sig); }
        else if (inPulse) {
          inPulse = false;
          const dRm = peak / (I0 * 1e3), d3 = (dRm * Math.PI * Math.pow(P.D, 4)) / (4 * rhoE), vol = ((Math.PI / 6) * d3) * 1e18;
          const b = Math.floor(((Math.log10(vol) - Math.log10(3)) / (Math.log10(2000) - Math.log10(3))) * NB);
          if (b >= 0 && b < NB) bins[b]++;
          counted++; peak = 0;
        }
        if (nIn > 1 && !step.lastCo) { coinc++; step.lastCo = true; } else if (nIn <= 1) step.lastCo = false;
        buf.push([tAll, sig]);
        while (buf.length && buf[0][0] < tAll - 4) buf.shift();
      }
      function render() {
        gCells.innerHTML = "";
        cells.forEach((c) => {
          const rpx = 1.6 * Math.cbrt(c.v);
          const inAp = c.x > XA0 && c.x < XA1;
          S("circle", { cx: c.x, cy: c.y, r: rpx, fill: C.blue, "fill-opacity": inAp ? 1 : 0.75, stroke: inAp ? C.yellow : "none", "stroke-width": 2 }, gCells);
        });
        const top = tr.o.yr[1];
        trace.set(buf.map(([tt, s]) => [tt - tAll, Math.min(top, s)]));
        thrLine.set(thr());
        const mx = Math.max(1, ...bins);
        bars.forEach((b, k) => {
          const v0 = Math.pow(10, Math.log10(3) + (k / NB) * (Math.log10(2000) - Math.log10(3))), v1 = Math.pow(10, Math.log10(3) + ((k + 1) / NB) * (Math.log10(2000) - Math.log10(3)));
          const x0 = hi.X(v0), x1 = hi.X(v1), y = hi.Y((0.85 * bins[k]) / mx);
          b.setAttribute("x", x0 + 0.5); b.setAttribute("width", Math.max(0, x1 - x0 - 1)); b.setAttribute("y", y); b.setAttribute("height", Math.max(0, hi.Y(0) - y));
        });
      }
      function readout() {
        const rbc = P.dR(90), lam = (5e6 / 1e4) * P.Vap * 1e9;
        ui.read.innerHTML =
          `aperture R = 4ρ<sub>e</sub>L/(πD²) = <b>${fmt(P.R / 1e3, 2)} kΩ</b> · red cell ΔR = <b style="color:${C.yellow}">${fmt(rbc, 2)} Ω</b> (${fmt((rbc / P.R) * 100, 3)}%) → ΔV = ${fmt(rbc * I0 * 1e3, 2)} mV at 0.1 mA<br>` +
          `white cell ${fmt(P.dR(524), 1)} Ω · platelet ${fmt(P.dR(10), 2)} Ω · blood at 1:10,000 → mean cells in aperture ${fmt(lam, 3)}, P(coincidence) = ${fmt((1 - Math.exp(-lam)) * 100, 1)}%<br>` +
          `pulses counted ${counted} · coincidences seen ${coinc}`;
      }
      ui.slider("aperture D_ap", 30, 100, 5, Dap, (v) => { Dap = v; P = phys(); half = geometry(); makeTrace(topOf()); reset(); readout(); return v + " µm"; });
      ui.slider("cell rate (display)", 1, 20, 1, rate, (v) => { rate = v; reset(); readout(); return v + " /s"; });
      ui.button("clear histogram", () => { reset(); readout(); });
      // pre-roll so the histogram is not empty at first sight
      for (let k = 0; k < 3000; k++) step(1 / 60);
      render(); readout();
      if (!VIZ.reduceMotion) {
        let acc = 0;
        loop(svg, (tt, dt) => { step(dt); render(); acc += dt; if (acc > 0.5) { acc = 0; readout(); } });
      }
    },
  });
})();
