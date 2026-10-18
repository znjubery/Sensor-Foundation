/* C1 — fluids at the microscale: widgets for docs/C1-fluids-at-the-microscale-reynolds-number-and-laminar-flow.md */
(function () {
  "use strict";
  const { register, C, scene3d, chart, fmt, rng, gauss, mix, S, H } = VIZ;

  // error function (Abramowitz & Stegun 7.1.26, |error| < 1.5e-7)
  function erf(x) {
    const s = x < 0 ? -1 : 1; x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const sci = (x, d) => {
    if (x === 0) return "0";
    const e = Math.floor(Math.log10(Math.abs(x)));
    if (e >= -2 && e <= 4) return fmt(x, Math.max(0, (d === undefined ? 2 : d) - Math.max(0, e)));
    const m = x / Math.pow(10, e);
    return `${fmt(m, 1)}×10${String(e).replace("-", "⁻").replace(/\d/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+c])}`;
  };
  // laminar entrance length / D, valid from creeping flow to Re ~ 2000 (Chen 1973 fit)
  const entrance = (re) => 0.6 / (1 + 0.035 * re) + 0.056 * re;

  // ════════════════════════ c1-channel-3d: two co-flowing streams and a dye blob in a channel ════════════════════════
  register("c1-channel-3d", {
    title: "3D · two streams side by side in a channel: laminar at low Re, chaotic at high Re",
    target: "After this you can predict from Re alone whether two streams stay separate, and why a blob stretched by a slow flow comes back when the flow is reversed.",
    caption: "the channel is drawn as a box: the yellow (dyed) and blue (buffer) streams enter from the Y on the left. The white beads are a blob of tracer: the pump pushes for 3 s, then runs backwards for 3 s. At low Re the parabolic profile shears the blob into a streak and the reversal un-shears it exactly (time reversibility, Stokes flow). Slide Re above ~2300 and the profile flattens, the interface wrinkles and the blob never comes back. The dashed line marks the entrance length, where the profile has finished developing. The arrows show the velocity profile at three places.",
    links: [
      { id: "B1", why: "Re = inertia/viscous falls as ℓ², the scaling law that makes the microworld viscous" },
      { id: "C2", why: "the parabolic profile in this channel is derived there from a force balance" },
      { id: "C3", why: "the only thing that mixes the two streams here is diffusion, the Péclet number" },
      { id: "C5", why: "co-flowing laminar streams are how chips split, sort and treat samples" },
    ],
    build(fig, ui) {
      const X0 = -4, X1 = 4, HZ = 0.7, Dw = 2;       // channel: x along, y ∈ [-1,1] across, z ∈ [0,HZ]; width Dw = 2 units
      let logRe = -1;
      const Re = () => Math.pow(10, logRe);
      const turb = () => smooth(Math.log10(2000), Math.log10(5000), logRe);  // 0 = laminar, 1 = fully turbulent
      const r = rng(7);
      const N = 36;
      let blob = [], s = 0, phase = 0, clock = 0, lastT = null;
      function inject() {
        blob = [];
        for (let i = 0; i < N; i++) {
          const a = gauss(r) * 0.14, b = gauss(r) * 0.12, c = gauss(r) * 0.07;
          blob.push({ x: -2.6 + a, y: Math.max(-0.92, Math.min(0.92, b * 2.2)), z: Math.max(0.06, Math.min(HZ - 0.06, HZ / 2 + c * 2.2)) });
        }
        blob.forEach((p) => { p.x0 = p.x; });
        s = 0;
      }
      inject();
      // the developed profile, scene units/s: laminar parabola × parabola; turbulent: flat 1/7 power law
      const Umax = 1.25;
      function uLam(y, z) { const zz = (2 * z) / HZ - 1; return Umax * (1 - y * y) * (1 - zz * zz) * 1.0; }
      function uTurb(y, z) { const zz = (2 * z) / HZ - 1; return Umax * 0.8 * Math.pow(Math.max(0, 1 - Math.abs(y)), 1 / 7) * Math.pow(Math.max(0, 1 - Math.abs(zz)), 1 / 7); }
      function u(y, z) { const f = turb(); return (1 - f) * uLam(y, z) + f * uTurb(y, z); }
      // the profile across y at mid-height, developing from plug flow over the entrance length
      function uDev(x, y) {
        const LeU = entrance(Re()) * Dw, xi = x - X0, f = turb();
        const dev = 1 - Math.exp((-3 * xi) / Math.max(0.05, LeU));
        const plug = Umax * 0.67 * (Math.abs(y) < 0.97 ? 1 : 0.4);
        const lam = (1 - dev) * plug + dev * Umax * (1 - y * y);
        return (1 - f) * lam + f * uTurb(y, HZ / 2);
      }
      function step(dt) {
        // pump cycle: 3 s forward, 3 s backward, 1 s rest, re-inject
        clock += dt;
        const T = 3;
        let v = 0;
        if (clock < T) { v = 1; phase = 0; } else if (clock < 2 * T) { v = -1; phase = 1; } else if (clock < 2 * T + 1.2) { v = 0; phase = 2; } else { clock = 0; inject(); return; }
        const ds = v * dt, f = turb();
        s += ds;
        blob.forEach((p) => {
          p.x += u(p.y, p.z) * ds;
          if (f > 0 && v !== 0) {
            const k = f * 0.55 * Math.sqrt(dt);
            p.y += k * gauss(r); p.z += k * 0.45 * gauss(r); p.x += k * 0.8 * gauss(r);
            if (p.y > 0.95) p.y = 1.9 - p.y; if (p.y < -0.95) p.y = -1.9 - p.y;
            if (p.z > HZ - 0.04) p.z = 2 * (HZ - 0.04) - p.z; if (p.z < 0.04) p.z = 0.08 - p.z;
          }
        });
      }
      // concentration of dye on the top surface: sharp interface (laminar) or wrinkled and smeared (turbulent)
      function conc(x, y, t) {
        const f = turb(), xi = (x - X0) / (X1 - X0);
        const yi = f * 0.6 * Math.sqrt(xi) * (Math.sin(2.3 * x - 5.5 * t) + 0.5 * Math.sin(5.1 * x + 3.7 * t + 1));
        const del = 0.035 + 0.02 * xi + f * 3 * xi * xi + f * 0.6 * xi;
        return 0.5 * (1 + erf((y - yi) / del));
      }
      const DYE = C.yellow, BUF = C.water;
      const sc = scene3d(ui.body, {
        w: 640, h: 340, scale: 52, yaw: -0.5, pitch: 0.62, center: [-0.8, 0, -0.35], dist: 16, animate: !VIZ.reduceMotion,
        draw(g, t) {
          if (lastT !== null && !VIZ.reduceMotion) step(Math.min(0.05, Math.max(0, t - lastT)));
          lastT = t;
          // the chip: a grey substrate with the channel cut into it
          g.box([-6.3, -2.3, -0.32], [X1 + 0.3, 2.3, 0], C.silicon, { bias: -50 });
          g.box([X0, 1, 0], [X1, 1.35, HZ], C.silicon, { alpha: 0.28, bias: -2 });
          g.box([X0, -1.35, 0], [X1, -1, HZ], C.silicon, { alpha: 0.28, bias: -2 });
          // inlet arms of the Y junction (top faces)
          g.poly([[-6.2, 2.2, HZ], [-6.2, 1.2, HZ], [X0, 0, HZ], [X0, 1, HZ]], DYE, { alpha: 0.75, shade: false });
          g.poly([[-6.2, -1.2, HZ], [-6.2, -2.2, HZ], [X0, -1, HZ], [X0, 0, HZ]], BUF, { alpha: 0.75, shade: false });
          g.text([-6.3, 1.7, HZ + 0.4], "dyed sample", DYE, 13, "start");
          g.text([-6.3, -1.7, HZ + 0.4], "buffer", BUF, 13, "start");
          // top surface of the liquid, coloured by dye concentration
          g.surface((a, b) => [a, b, HZ], [X0, X1, 34], [-1, 1, 14],
            (x, y) => mix(BUF, DYE, conc(x, y, t)), { alpha: 0.62, shade: false, bias: 0.3 });
          // outlet face: what you would see looking down the channel
          g.surface((a, b) => [X1, a, b], [-1, 1, 14], [0, HZ, 4],
            (x, y, z) => mix(BUF, DYE, conc(X1 - 0.001 * z, y + turb() * 0.25 * Math.sin(9 * z + 3 * t), t)), { alpha: 0.9, shade: false });
          // entrance length marker
          const Le = entrance(Re()) * Dw;
          if (Le < X1 - X0 && turb() < 0.5) {
            g.line([X0 + Le, -1, HZ + 0.01], [X0 + Le, 1, HZ + 0.01], C.green, 1.8, [6, 5]);
            g.text([X0 + Le, -1.7, HZ + 0.1], "entrance length", C.green, 12);
          }
          // velocity profile arrows at three stations
          [-3.4, -0.6, 2.4].forEach((xs) => {
            const tips = [];
            for (let k = -3; k <= 3; k++) {
              const y = k * 0.3, L = uDev(xs, y) * 0.9;
              g.arrow([xs, y, HZ + 0.05], [xs + L, y, HZ + 0.05], "#d6e2ff", 1.6);
              tips.push([xs + L, y, HZ + 0.05]);
            }
            g.polyline(tips, "#ffffff", 1.2);
          });
          // tracer blob
          blob.forEach((p) => g.sphere([p.x, p.y, p.z], 0.07, C.white));
          // flow direction
          g.arrow([X1 - 0.2, 1.75, HZ], [X1 + 0.9, 1.75, HZ], C.water, 2.5);
          g.text([X1 + 0.5, 2.15, HZ], "flow", C.water, 12);
        },
        overlay(ctx) {
          ctx.font = "13px JetBrains Mono, ui-monospace, monospace";
          ctx.textAlign = "left"; ctx.textBaseline = "top";
          ctx.fillStyle = phase === 0 ? C.green : phase === 1 ? C.gold : C.dim;
          ctx.fillText(phase === 0 ? "pump: forward ▶" : phase === 1 ? "pump: reversed ◀" : "back at the start?", 12, 10);
        },
      });
      function read() {
        const re = Re(), f = turb();
        const regime = re < 1 ? "Stokes (creeping) flow: viscosity wins" : re < 2000 ? "laminar: inertia matters, but the flow stays in layers" : re < 4000 ? "transitional: puffs of turbulence come and go" : "turbulent: eddies mix everything";
        ui.read.innerHTML = `<b>Re = ${sci(re, 2)}</b> · ${regime}<br>` +
          `entrance length L<sub>e</sub> ≈ ${fmt(entrance(re), 2)} D · ` +
          `blob returns after reversal: <b style="color:${f < 0.02 ? C.green : C.red}">${f < 0.02 ? "yes, exactly" : "no, mixed for good"}</b>`;
      }
      const sl = ui.slider("log₁₀ Re", -2, 4.6, 0.1, logRe, (v) => { logRe = v; read(); if (VIZ.reduceMotion) sc.render(); return "Re = " + sci(Math.pow(10, v), 2); });
      ui.button("chip · 100 µm at 1 mm/s", () => sl.set(-1));
      ui.button("aorta", () => sl.set(Math.log10(1514)));
      ui.button("garden hose", () => sl.set(Math.log10(16000)));
      ui.button("re-inject blob", () => { clock = 0; inject(); if (VIZ.reduceMotion) sc.render(); });
      if (VIZ.reduceMotion) { for (let i = 0; i < 60; i++) step(0.025); sc.render(); }
      read();
    },
  });

  // ════════════════════════ c1-reynolds-ladder: Re from bacteria to airliners ════════════════════════
  const FLUIDS = {
    water: { rho: 1000, mu: 1e-3, name: "water" },
    air: { rho: 1.2, mu: 1.8e-5, name: "air" },
    honey: { rho: 1400, mu: 10, name: "honey" },
    blood: { rho: 1060, mu: 3.5e-3, name: "blood" },
  };
  const LADDER = [
    ["E. coli", 3e-5, "🧬"],
    ["red cell in capillary", 2.42e-3, "🧬"],
    ["human sperm", 2.5e-3, "🧬"],
    ["microchannel", 0.1, "🧪"],
    ["spoon in honey", 0.14, "🏠"],
    ["spoon in tea", 1000, "🏠"],
    ["aorta", 1514, "🧬"],
    ["small fish", 5000, "🌍"],
    ["drone propeller", 6.67e4, "🤖"],
    ["human swimmer", 2e6, "🧬"],
    ["car", 9e6, "🚗"],
    ["airliner", 2.66e8, "✈"],
  ];

  register("c1-reynolds-ladder", {
    title: "The Reynolds ladder · inertia ÷ viscosity, from a bacterium to an airliner",
    target: "After this you can compute Re = ρUL/μ for any object, explain it as a ratio of two forces, and say which side of 1 and of 2300 it falls on.",
    caption: "each dot is a real object (numbers from the check script). The yellow line is your own object: set its size, speed and fluid. The two bars underneath are the two forces per unit volume on a parcel of fluid, on a log scale; the gap between their ends is log₁₀ Re. Step through the math to build the ratio. Everything left of Re = 1 lives in Purcell's world, where swimming by coasting is impossible.",
    links: [
      { id: "B1", why: "Re ∝ ℓ²: shrink everything by 10 and Re drops 100×" },
      { id: "C3", why: "the Péclet number is built the same way: transport by flow ÷ transport by diffusion" },
      { id: "C4", why: "Ca and Bo are more ratios of forces that rule droplets" },
      { id: "B5", why: "air damping in MEMS microphones and gyros is also low-Re flow" },
    ],
    build(fig, ui) {
      let lL = -4, lU = -3, fl = "water";
      const ch = chart(ui.body, { w: 640, h: 320, xr: [1e-6, 1e9], yr: [0, 13.4], logx: true, xlabel: "Reynolds number Re = ρUL/μ (log scale)", ml: 14, mr: 14, mt: 10, mb: 38 });
      ch.svg.querySelectorAll("text[text-anchor=end]").forEach((e) => e.remove());
      // regions
      const shadeLo = S("rect", { x: ch.X(1e-6), y: 10, width: ch.X(1) - ch.X(1e-6), height: 272, fill: C.water, "fill-opacity": 0, "pointer-events": "none" }, ch.gMain);
      const shadeHi = S("rect", { x: ch.X(2300), y: 10, width: ch.X(1e9) - ch.X(2300), height: 272, fill: C.red, "fill-opacity": 0, "pointer-events": "none" }, ch.gMain);
      const v1 = ch.vline(C.dim, "4 4"); v1.set(1);
      const v2 = ch.vline(C.red, "4 4"); v2.set(2300);
      const lab1 = ch.label(C.water, 12, "middle"), lab2 = ch.label(C.red, 12, "middle");
      LADDER.forEach(([name, re, icon], i) => {
        const y = 12.6 - i * 1.0;
        const d = ch.dot(C.water, 5); d.set(re, y);
        const right = re < 3e5;
        const l = ch.label(C.text, 12, right ? "start" : "end"); l.set(re * (right ? 2.2 : 0.45), y, `${icon} ${name}  ${sci(re, 2)}`);
      });
      const you = ch.vline(C.yellow, ""); you.el.setAttribute("stroke-width", 2.5);
      const youDot = ch.dot(C.yellow, 6.5), youLab = ch.label(C.yellow, 12.5, "start");
      // force bars
      const bars = S("svg", { viewBox: "0 0 640 92", role: "img", "aria-label": "inertial and viscous force per volume" }, ui.body);
      const bx = (v) => 150 + ((Math.log10(v) + 8) / 22) * 470;   // 1e-8 … 1e14 N/m³
      const mkBar = (y, col, name) => {
        const r = S("rect", { x: 150, y, height: 16, rx: 3, fill: col, "fill-opacity": 0.85 }, bars);
        const t = S("text", { x: 8, y: y + 9, fill: col, "font-size": 12.5, "dominant-baseline": "middle", "font-family": "var(--font-mono, monospace)" }, bars);
        t.textContent = name;
        const v = S("text", { x: 0, y: y + 9, fill: C.text, "font-size": 12, "dominant-baseline": "middle", "font-family": "var(--font-mono, monospace)" }, bars);
        return { r, t, v };
      };
      const bI = mkBar(10, C.purple, "inertia ρU²/L"), bV = mkBar(36, C.water, "viscous μU/L²");
      const gap = S("line", { stroke: C.yellow, "stroke-width": 2, "stroke-dasharray": "3 3" }, bars);
      const gapT = S("text", { fill: C.yellow, "font-size": 12.5, "text-anchor": "middle", "font-family": "var(--font-mono, monospace)" }, bars);
      const axisT = S("text", { x: 150, y: 86, fill: C.dim, "font-size": 11, "font-family": "var(--font-mono, monospace)" }, bars);
      axisT.textContent = "force per volume, N/m³ (log scale: 10⁻⁸ … 10¹⁴)";
      let stepI = 0;
      function update() {
        const F = FLUIDS[fl], L = Math.pow(10, lL), U = Math.pow(10, lU);
        const re = (F.rho * U * L) / F.mu, fi = (F.rho * U * U) / L, fv = (F.mu * U) / (L * L);
        you.set(Math.max(1e-6, Math.min(1e9, re)));
        youDot.set(re, 0.55);
        const right = re < 1e5;
        youLab.el.setAttribute("text-anchor", right ? "start" : "end");
        youLab.set(re * (right ? 1.8 : 0.55), 0.55, `your object: Re = ${sci(re, 2)}`);
        const show = (b, val, on) => {
          const x1 = Math.max(150, Math.min(622, bx(val)));
          b.r.setAttribute("width", Math.max(2, x1 - 150)); b.r.setAttribute("opacity", on ? 1 : 0.12);
          b.v.setAttribute("x", Math.min(560, x1 + 6)); b.v.textContent = on ? sci(val, 2) : ""; b.t.setAttribute("opacity", on ? 1 : 0.35);
        };
        show(bI, fi, stepI >= 1); show(bV, fv, stepI >= 2);
        const xa = Math.max(150, Math.min(622, bx(fi))), xb = Math.max(150, Math.min(622, bx(fv)));
        gap.setAttribute("x1", xa); gap.setAttribute("x2", xb); gap.setAttribute("y1", 28); gap.setAttribute("y2", 30);
        gap.setAttribute("opacity", stepI >= 3 ? 1 : 0);
        gapT.setAttribute("x", (xa + xb) / 2); gapT.setAttribute("y", 66); gapT.textContent = stepI >= 3 ? `gap = log₁₀ Re = ${fmt(Math.log10(re), 1)}` : "";
        shadeLo.setAttribute("fill-opacity", stepI >= 4 ? 0.13 : 0);
        shadeHi.setAttribute("fill-opacity", stepI >= 5 ? 0.1 : 0);
        lab1.set(1e-3, 13.1, stepI >= 4 ? "viscosity wins (Re < 1)" : "");
        lab2.set(1e6, 13.1, stepI >= 5 ? "turbulence possible (Re > 2300 in pipes)" : "");
        const coast = (2 * F.rho * L * L) / (9 * F.mu * 4);
        ui.read.innerHTML = `L = ${sci(L, 2)} m · U = ${sci(U, 2)} m/s · ${F.name} (ρ = ${F.rho} kg/m³, μ = ${sci(F.mu, 2)} Pa·s)<br>` +
          `<b style="color:${C.yellow}">Re = ${sci(re, 3)}</b> · inertia ${sci(fi, 2)} N/m³ vs viscous ${sci(fv, 2)} N/m³ · ` +
          `coasting time of a sphere of this size ≈ ${sci(coast, 2)} s`;
      }
      ui.slider("size L", -6, 1, 0.1, lL, (v) => { lL = v; update(); return sci(Math.pow(10, v), 1) + " m"; });
      ui.slider("speed U", -5, 2.5, 0.1, lU, (v) => { lU = v; update(); return sci(Math.pow(10, v), 1) + " m/s"; });
      Object.keys(FLUIDS).forEach((k) => ui.button(FLUIDS[k].name, () => { fl = k; update(); }));
      ui.steps([
        "Pick a parcel of fluid next to the object: size \\( L \\), speed \\( U \\), density \\( \\rho \\), viscosity \\( \\mu \\). Two forces compete to decide what it does next.",
        "<b>Inertia.</b> The parcel's speed changes by about \\( U \\) as it travels a distance \\( L \\), so the force per volume needed is \\( \\rho\\,(\\mathbf u\\cdot\\nabla)\\mathbf u \\sim \\rho U\\cdot U/L = \\rho U^2/L \\).",
        "<b>Viscous friction.</b> Neighbouring layers rub: shear stress \\( \\mu U/L \\), and its change across a distance \\( L \\) is a force per volume \\( \\mu\\nabla^2\\mathbf u \\sim \\mu U/L^2 \\).",
        "<b>The ratio.</b> \\( \\mathrm{Re}=\\dfrac{\\rho U^2/L}{\\mu U/L^2}=\\dfrac{\\rho U L}{\\mu}=\\dfrac{UL}{\\nu} \\). On the log bars it is simply the gap between the two ends.",
        "<b>Re ≪ 1:</b> drop inertia from Navier–Stokes: \\( 0=-\\nabla p+\\mu\\nabla^2\\mathbf u \\) (Stokes flow). No time derivative is left, so the flow is instantaneous and reversible: no coasting.",
        "<b>Re ≳ 2300</b> in a pipe: inertia amplifies small wiggles faster than viscosity smooths them, and the flow becomes turbulent. Note \\( \\mathrm{Re}\\propto UL \\): a chip (small \\( L \\)) can't get there.",
      ], (i) => { stepI = i; update(); });
      update();
    },
  });
})();
