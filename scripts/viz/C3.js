/* C3 — diffusion, mixing and the Péclet number: widgets for docs/C3-diffusion-mixing-and-the-peclet-number.md */
(function () {
  "use strict";
  const { register, C, scene3d, chart, fmt, loop, rng, gauss, mix, S, H } = VIZ;

  const KT = 1.380649e-23 * 298.15, MU = 0.89e-3;          // 25 °C water
  const Dse = (r) => KT / (6 * Math.PI * MU * r);           // Stokes–Einstein, m²/s
  const sci = (x, d) => {
    if (x === 0) return "0";
    const e = Math.floor(Math.log10(Math.abs(x)));
    if (e >= -2 && e <= 4) return fmt(x, Math.max(0, (d === undefined ? 2 : d) - Math.max(0, e)));
    const m = x / Math.pow(10, e);
    return `${fmt(m, 2)}×10${String(e).replace("-", "⁻").replace(/\d/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+c])}`;
  };
  const len = (m) => (m >= 1 ? fmt(m, 2) + " m" : m >= 1e-3 ? fmt(m * 1e3, 2) + " mm" : fmt(m * 1e6, 1) + " µm");
  const dur = (s) => (s < 120 ? fmt(s, s < 1 ? 3 : 1) + " s" : s < 7200 ? fmt(s / 60, 1) + " min" : s < 172800 ? fmt(s / 3600, 1) + " h" : fmt(s / 86400, 1) + " days");

  // ════════════════════════ c3-random-walk: Brownian particles and the ⟨x²⟩ = 2Dt line ════════════════════════
  register("c3-random-walk", {
    title: "Random walk · a cloud of beads spreads as √t, and ⟨x²⟩ = 2Dt",
    target: "After this you can derive ⟨x²⟩ = 2Dt from coin-flip steps, read D off the slope of a measured ⟨x²⟩ line, and predict D for any particle from its size.",
    caption: "400 beads start at the centre and are kicked about by water molecules (simulated, 25 °C). Left: the cloud, with one bead's path in white. Right: the measured mean-square displacement along x (yellow dots) against time. The white path never goes anywhere in particular, yet the cloud's ⟨x²⟩ grows in a perfectly straight line. Its slope is 2D. Bigger beads diffuse more slowly (Stokes–Einstein); change the radius and the slope changes.",
    links: [
      { id: "A8", why: "the same sum of independent kicks: noise grows as √M, averages shrink as 1/√M" },
      { id: "B1", why: "diffusion time ∝ ℓ²: why diffusion is fast in a chip and hopeless in a cup" },
      { id: "A6", why: "glucose reaches an electrode by exactly this random walk" },
      { id: "B4", why: "Brownian kicks on a proof mass set the noise floor of a MEMS accelerometer" },
    ],
    build(fig, ui) {
      let rad = 0.5, D = 0, Lv = 10, si = 0, simT = 0;
      const M = 400, TMAX = 20, r = rng(11);
      const row = H("div", { style: "display:flex;gap:6px;align-items:stretch" }, ui.body);
      const left = H("div", { style: "flex:1;min-width:0" }, row), right = H("div", { style: "flex:1;min-width:0" }, row);
      const svg = S("svg", { viewBox: "0 0 320 300", role: "img", "aria-label": "cloud of diffusing beads" }, left);
      const X = (x) => 160 + (x / Lv) * 140, Yp = (y) => 140 - (y / Lv) * 120;
      S("rect", { x: 20, y: 20, width: 280, height: 240, fill: "#11161d", stroke: "#24303c" }, svg);
      const gBand = S("g", {}, svg), gDots = S("g", {}, svg), gTop = S("g", {}, svg);
      const band1 = S("line", { stroke: C.green, "stroke-width": 1.6, "stroke-dasharray": "5 4" }, gBand);
      const band2 = S("line", { stroke: C.green, "stroke-width": 1.6, "stroke-dasharray": "5 4" }, gBand);
      const bandT = S("text", { fill: C.green, "font-size": 11, "text-anchor": "middle", "font-family": "var(--font-mono, monospace)" }, gBand);
      const hist = S("g", {}, svg);
      const gaussP = S("path", { fill: "none", stroke: C.green, "stroke-width": 2 }, svg);
      const trail = S("polyline", { fill: "none", stroke: "#ffffff", "stroke-width": 1.4, "stroke-opacity": 0.9 }, gTop);
      const meanM = S("path", { stroke: C.yellow, "stroke-width": 2.5, fill: "none" }, gTop);
      const tLab = S("text", { x: 28, y: 36, fill: C.text, "font-size": 12, "font-family": "var(--font-mono, monospace)" }, gTop);
      const scaleBar = S("line", { x1: 30, x2: 30, y1: 280, y2: 280, stroke: C.dim, "stroke-width": 2 }, svg);
      const scaleT = S("text", { x: 30, y: 293, fill: C.dim, "font-size": 11, "font-family": "var(--font-mono, monospace)" }, svg);
      const P = [];
      for (let i = 0; i < M; i++) P.push({ x: 0, y: 0, el: S("circle", { r: 1.7, fill: C.water, "fill-opacity": 0.75 }, gDots) });
      let path = [], samples = [], ch = null, dotsCh = [], theory = null, nextSample = 0;
      function makeChart() {
        right.innerHTML = "";
        const ymax = 2 * D * 1e12 * TMAX * 1.25;
        ch = chart(right, { w: 320, h: 300, xr: [0, TMAX], yr: [0, ymax], xlabel: "time t (s)", ylabel: "⟨x²⟩ (µm²)", ml: 50, mr: 10 });
        theory = ch.line(C.green, 2.4);
        dotsCh = [];
      }
      function reset() {
        D = Dse(rad * 1e-6);
        Lv = Math.max(2, 2.2 * Math.sqrt(2 * D * 1e12 * TMAX));
        P.forEach((p) => { p.x = 0; p.y = 0; });
        path = [[0, 0]]; samples = []; simT = 0; nextSample = 0;
        const nice = [0.5, 1, 2, 5, 10, 20, 50, 100].find((v) => v > Lv * 0.25) || 100;
        scaleBar.setAttribute("x2", 30 + (nice / Lv) * 140); scaleT.textContent = `${nice} µm`;
        makeChart();
      }
      function advance(dt) {
        const s = Math.sqrt(2 * D * 1e12 * dt);
        P.forEach((p) => { p.x += s * gauss(r); p.y += s * gauss(r); });
        simT += dt;
        path.push([P[0].x, P[0].y]); if (path.length > 600) path.shift();
        if (simT >= nextSample) {
          let m2 = 0; P.forEach((p) => (m2 += p.x * p.x)); samples.push([simT, m2 / M]); nextSample += 0.5;
        }
      }
      function draw() {
        const Dm = D * 1e12;
        P.forEach((p) => { p.el.setAttribute("cx", X(p.x)); p.el.setAttribute("cy", Yp(p.y)); });
        trail.setAttribute("points", path.map(([x, y]) => `${X(x).toFixed(1)},${Yp(y).toFixed(1)}`).join(" "));
        trail.setAttribute("visibility", si === 0 || si === 1 ? "visible" : "hidden");
        let mx = 0, my = 0; P.forEach((p) => { mx += p.x; my += p.y; }); mx /= M; my /= M;
        meanM.setAttribute("d", `M${X(mx) - 7},${Yp(my) - 7} L${X(mx) + 7},${Yp(my) + 7} M${X(mx) - 7},${Yp(my) + 7} L${X(mx) + 7},${Yp(my) - 7}`);
        meanM.setAttribute("visibility", si >= 1 ? "visible" : "hidden");
        let m2 = 0; P.forEach((p) => (m2 += p.x * p.x)); const rms = Math.sqrt(m2 / M);
        band1.setAttribute("x1", X(rms)); band1.setAttribute("x2", X(rms)); band1.setAttribute("y1", 20); band1.setAttribute("y2", 260);
        band2.setAttribute("x1", X(-rms)); band2.setAttribute("x2", X(-rms)); band2.setAttribute("y1", 20); band2.setAttribute("y2", 260);
        bandT.setAttribute("x", X(rms)); bandT.setAttribute("y", 32); bandT.textContent = si >= 2 ? "+x_rms" : "";
        gBand.setAttribute("visibility", si >= 2 ? "visible" : "hidden");
        tLab.textContent = `t = ${fmt(simT, 1)} s`;
        // histogram of x along the bottom + Gaussian (step 4)
        hist.innerHTML = "";
        if (si >= 4 && simT > 0.2) {
          const nb = 28, cnt = new Array(nb).fill(0), bw = (2 * Lv) / nb;
          P.forEach((p) => { const k = Math.floor((p.x + Lv) / bw); if (k >= 0 && k < nb) cnt[k]++; });
          const hs = 1600 / M;
          cnt.forEach((c, k) => S("rect", { x: X(-Lv + k * bw) + 0.5, y: 260 - c * hs, width: (bw / Lv) * 140 - 1, height: c * hs, fill: C.yellow, "fill-opacity": 0.35 }, hist));
          let d = "";
          for (let i = 0; i <= 80; i++) {
            const x = -Lv + (2 * Lv * i) / 80, pdf = Math.exp((-x * x) / (4 * Dm * simT)) / Math.sqrt(4 * Math.PI * Dm * simT);
            d += (i ? "L" : "M") + X(x).toFixed(1) + "," + (260 - pdf * bw * M * hs).toFixed(1);
          }
          gaussP.setAttribute("d", d);
        } else gaussP.setAttribute("d", "");
        // chart
        while (dotsCh.length < samples.length) { const d0 = ch.dot(C.yellow, 2.8); const sm = samples[dotsCh.length]; d0.set(sm[0], sm[1]); dotsCh.push(d0); }
        theory.set(si >= 3 ? [[0, 0], [TMAX, 2 * Dm * TMAX]] : []);
        const last = samples.length ? samples[samples.length - 1] : [0, 0];
        ui.read.innerHTML = `bead radius ${fmt(rad, 2)} µm → Stokes–Einstein <b>D = k<sub>B</sub>T/(6πμr) = ${fmt(Dm, 3)} µm²/s</b> (${sci(D, 2)} m²/s)<br>` +
          `measured ⟨x²⟩ = ${fmt(last[1], 2)} µm² at t = ${fmt(last[0], 1)} s · theory 2Dt = ${fmt(2 * Dm * last[0], 2)} µm²` +
          (last[0] > 0 ? ` · slope/2 = <b style="color:${C.yellow}">${fmt(last[1] / (2 * last[0]), 3)} µm²/s</b>` : "");
      }
      ui.slider("bead radius r", 0.1, 2, 0.05, rad, (v) => { rad = v; reset(); draw(); return fmt(v, 2) + " µm"; });
      ui.button("restart", () => { reset(); draw(); });
      ui.steps([
        "<b>Kicks.</b> Every short time \\( \\tau_s \\) the bead is knocked a distance \\( \\pm\\delta \\), left or right with equal chance (white path). No step remembers the one before.",
        "<b>After \\( N \\) steps</b> \\( x_N=s_1+s_2+\\dots+s_N \\) with \\( s_i=\\pm\\delta \\). Average over many beads: \\( \\langle x_N\\rangle=\\sum\\langle s_i\\rangle=0 \\) (yellow ×: the cloud doesn't drift).",
        "<b>Square it.</b> \\( \\langle x_N^2\\rangle=\\sum_i\\langle s_i^2\\rangle+\\sum_{i\\ne j}\\langle s_is_j\\rangle=N\\delta^2+0 \\): independent steps make the cross terms cancel. The green lines mark \\( \\pm x_{\\text{rms}} \\).",
        "<b>Time instead of steps:</b> \\( N=t/\\tau_s \\Rightarrow \\langle x^2\\rangle=\\dfrac{\\delta^2}{\\tau_s}\\,t=2Dt \\), with \\( D=\\dfrac{\\delta^2}{2\\tau_s} \\). The green line on the right has slope \\( 2D \\).",
        "<b>The shape:</b> many independent steps give a Gaussian, \\( c(x,t)=\\dfrac{1}{\\sqrt{4\\pi Dt}}e^{-x^2/4Dt} \\), which solves Fick's law \\( \\partial c/\\partial t=D\\,\\partial^2c/\\partial x^2 \\). Its width grows as \\( \\sqrt{t} \\).",
        "<b>Where \\( D \\) comes from:</b> thermal energy against drag. Stokes drag \\( 6\\pi\\mu r \\) and \\( k_BT \\) give \\( D=\\dfrac{k_BT}{6\\pi\\mu r} \\) (Einstein 1905). Double the radius → half the slope.",
      ], (i) => { si = i; draw(); });
      reset();
      if (VIZ.reduceMotion) { for (let i = 0; i < 200; i++) advance(0.05); draw(); }
      else loop(svg, (t, dt) => { if (simT >= TMAX) { reset(); } if (dt > 0) advance(dt); draw(); });
      draw();
    },
  });

  // ════════════════════════ c3-mixing-3d: two streams in a channel, diffusing along its length ════════════════════════
  const MOLS = [
    ["glucose", 0.38e-9], ["albumin", 3.5e-9], ["antibody", 5.5e-9], ["bacterium", 1e-6],
  ];
  register("c3-mixing-3d", {
    title: "3D · a T-junction: how far downstream until two streams are mixed (Pe = Uw/D)",
    target: "After this you can estimate the mixing length of a channel, L ~ Pe·w, and explain why a herringbone mixer shortens it from centimetres to about a millimetre.",
    caption: "a sample stream (yellow, c = 1) and a buffer (blue, c = 0) meet at the T and flow side by side down a 100 µm-wide channel. The height and colour of the sheet are the concentration across the width; downstream (to the right) diffusion erodes the step into a flat plateau at c = ½. The labels along the channel are real distances: the view rescales to fit the mixing length. Speed up the flow or pick a big molecule and Pe grows, so the plateau moves far away. Switch on the herringbone grooves: the flow folds the streams into ever thinner stripes, and mixing happens in a few cycles.",
    links: [
      { id: "C1", why: "at low Re the streams flow side by side and never stir each other" },
      { id: "C2", why: "the mean speed U comes from Δp and R_hyd" },
      { id: "A6", why: "the same diffusion feeds a biosensor surface, and sets its response time" },
      { id: "C5", why: "mixers, H-filters and gradient generators are built from this" },
    ],
    build(fig, ui) {
      let lU = 0, mol = 0, mixer = false;                // U = 10^lU mm/s
      const w = 100e-6, lam = 2 * w;
      const XL = 8;                                     // scene length of the channel
      const P = () => { const D = Dse(MOLS[mol][1]); const U = Math.pow(10, lU) * 1e-3; return { D, U, Pe: (U * w) / D }; };
      const L90plain = (Pe) => (Math.log(10) / (Math.PI * Math.PI)) * Pe * w;
      const L90mix = (Pe) => { const x = lam * Math.log(1 + (Math.log(10) * Pe * w * Math.log(4)) / (Math.PI * Math.PI * lam)) / Math.log(4); return Math.min(x, L90plain(Pe)); };
      const NICE = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];   // mm
      let Lview = 0.01;
      function conc(x, y, Pe) {                         // x, y in metres; y ∈ [-w/2, w/2]
        let phi, E;
        if (mixer) { const k = Math.pow(2, x / lam); phi = (Math.PI * y * k) / w; E = (Math.PI * Math.PI / Pe) * (lam / w) * (Math.pow(4, x / lam) - 1) / Math.log(4); }
        else { phi = (Math.PI * y) / w; E = (Math.PI * Math.PI * x) / (Pe * w); }
        if (E > 30) return 0.5;
        let s = 0;
        for (let m = 1; m < 30; m += 2) { const a = Math.exp(-m * m * E); if (a < 1e-4) break; s += (Math.sin(m * phi) / m) * a; }
        return 0.5 + (2 / Math.PI) * s;
      }
      const colC = (c) => mix(C.water, C.yellow, Math.max(0, Math.min(1, c)));
      const sc = scene3d(ui.body, {
        w: 640, h: 360, scale: 54, yaw: -0.42, pitch: 0.62, center: [3.4, 0, -0.1], dist: 16,
        draw(g) {
          const { Pe } = P(), HZ = 1.0;
          g.box([-1.6, -2.5, -0.3], [XL + 0.3, 1.5, 0], C.silicon, { bias: -50 });
          // T-junction arms (top view: they come in from ±y)
          g.poly([[-0.9, 1.0, 0.02], [0, 1.0, 0.02], [0, 0, 0.02], [-0.9, 0, 0.02]], C.yellow, { alpha: 0.85, shade: false });
          g.poly([[-0.9, 0, 0.02], [0, 0, 0.02], [0, -1.0, 0.02], [-0.9, -1.0, 0.02]], C.water, { alpha: 0.85, shade: false });
          g.poly([[-0.9, 1.0, 0.03], [0, 1.0, 0.03], [0, 1.5, 0.03], [-0.9, 1.5, 0.03]], C.yellow, { alpha: 0.85, shade: false });
          g.poly([[-0.9, -1.0, 0.03], [0, -1.0, 0.03], [0, -2.4, 0.03], [-0.9, -2.4, 0.03]], C.water, { alpha: 0.85, shade: false });
          g.arrow([-0.45, 1.5, 0.3], [-0.45, 0.6, 0.3], C.yellow, 2.5);
          g.arrow([-0.45, -2.3, 0.3], [-0.45, -0.6, 0.3], C.water, 2.5);
          g.text([-0.6, 1.5, 0.75], "sample c = 1", C.yellow, 12);
          g.text([-0.6, -2.4, 0.75], "buffer c = 0", C.water, 12);
          // herringbone grooves on the floor
          if (mixer) {
            const step = (lam / Lview) * XL;
            if (step > 0.06) for (let x = 0; x < XL; x += step) {
              const half = Math.floor(x / (step * 6)) % 2 ? 0.35 : -0.35;
              g.polyline([[x, -1, 0.01], [x + step * 0.6, half, 0.01], [x, 1, 0.01]], C.purple, 1.4);
            }
          }
          // concentration sheet: 3 sub-samples across each cell so thin stripes average out
          const nx = 44, ny = 22;
          const cAvg = (a, b) => {
            const xm = (a / XL) * Lview; let c = 0;
            for (let k = -1; k <= 1; k++) c += conc(xm, (Math.max(-1, Math.min(1, b + (k * 2) / ny / 3)) / 2) * w, Pe);
            return c / 3;
          };
          g.surface((a, b) => [a, b, 0.04 + HZ * cAvg(a, b)], [0, XL, nx], [-1, 1, ny],
            (x, y, z, a, b) => colC(cAvg(a, b)), { alpha: mixer ? 0.92 : 1 });
          // the channel edges and the c = 1/2 level
          g.polyline([[0, 1, 0], [XL, 1, 0], [XL, 1, HZ + 0.05]], C.silicon, 1.5);
          g.polyline([[0, -1, 0], [XL, -1, 0], [XL, -1, HZ + 0.05]], C.silicon, 1.5);
          g.polyline([[XL, -1, 0.04 + HZ / 2], [XL + 0.25, -1, 0.04 + HZ / 2]], C.green, 2);
          g.text([XL + 0.35, -1, 0.04 + HZ / 2], "c = ½", C.green, 12, "start");
          // distance ticks
          for (let i = 0; i <= 4; i++) {
            const x = (i / 4) * XL, d = (i / 4) * Lview;
            g.line([x, -1.05, 0], [x, -1.35, 0], C.dim, 1.2);
            g.text([x, -1.75, 0.05], d >= 1 ? fmt(d, 2) + " m" : d >= 1e-3 ? fmt(d * 1e3, 2) + " mm" : fmt(d * 1e6, 0) + " µm", C.text, 12);
          }
          // the 90 % mixing point
          const L90 = mixer ? L90mix(Pe) : L90plain(Pe);
          if (L90 < Lview) {
            const x = (L90 / Lview) * XL;
            g.line([x, -1, HZ + 0.25], [x, 1, HZ + 0.25], C.green, 2, [6, 4]);
            g.text([x, 1.3, HZ + 0.35], "90 % mixed", C.green, 12);
          }
        },
      });
      function upd() {
        const { D, U, Pe } = P();
        const Lp = L90plain(Pe), Lm = L90mix(Pe), L = mixer ? Lm : Lp;
        Lview = (NICE.find((v) => v * 1e-3 >= 1.25 * L) || 20000) * 1e-3;
        sc.render();
        ui.read.innerHTML = `${MOLS[mol][0]}: D = ${sci(D, 2)} m²/s · U = ${fmt(U * 1e3, 2)} mm/s · w = 100 µm → <b style="color:${C.yellow}">Pe = Uw/D = ${sci(Pe, 3)}</b><br>` +
          `time to cross the channel w²/D = ${dur((w * w) / D)} · scaling estimate L ~ Pe·w = ${len(Pe * w)}<br>` +
          `90 % mixed: straight channel <b>${len(Lp)}</b> (${dur(Lp / U)}) · herringbone <b style="color:${C.green}">${len(Lm)}</b> (${fmt(Lm / lam, 1)} cycles, ${fmt(Lp / Lm, 0)}× shorter)`;
      }
      ui.slider("flow speed U", -1, 1, 0.1, lU, (v) => { lU = v; upd(); return fmt(Math.pow(10, v), 2) + " mm/s"; });
      MOLS.forEach(([name], i) => ui.button(name, () => { mol = i; upd(); }));
      ui.button("herringbone mixer on / off", () => { mixer = !mixer; upd(); });
      upd();
    },
  });
})();
