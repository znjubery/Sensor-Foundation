/* B5 — MEMS microphones, pressure sensors and actuators: widgets for docs/B5-mems-microphones-pressure-sensors-and-actuators.md */
(function () {
  "use strict";
  const { register, C, ROLE, scene3d, chart, fmt, mix, css, ramp, S } = VIZ;
  const EPS0 = 8.854e-12;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function panel(ctx, x, y, w, h) {
    ctx.fillStyle = "rgba(14,17,22,0.88)"; ctx.strokeStyle = "#34404d"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke();
  }
  function txt(ctx, s, x, y, col, size, align) {
    ctx.font = `${size || 12}px JetBrains Mono, ui-monospace, monospace`; ctx.textAlign = align || "left"; ctx.textBaseline = "middle";
    ctx.fillStyle = css(col || C.text); ctx.fillText(s, x, y);
  }
  // flat top of a square die with a round hole: quads between the circle of radius r and the square of half-side h
  function dieTop(g, r, h, z, col, n, bias) {
    const sq = (a) => { const c = Math.cos(a), s = Math.sin(a), k = h / Math.max(Math.abs(c), Math.abs(s)); return [k * c, k * s, z]; };
    for (let i = 0; i < n; i++) {
      const a0 = (2 * Math.PI * i) / n, a1 = (2 * Math.PI * (i + 1)) / n;
      g.poly([[r * Math.cos(a0), r * Math.sin(a0), z], [r * Math.cos(a1), r * Math.sin(a1), z], sq(a1), sq(a0)], col, { bias: bias || 0 });
    }
  }
  function dieWalls(g, h, z0, z1, col, bias) {
    const c = [[-h, -h], [h, -h], [h, h], [-h, h]];
    for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4]; g.poly([[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]], col, { bias: bias || 0 }); }
  }

  // ══════════════════════════════ 1. the pressure-sensor diaphragm ══════════════════════════════
  register("b5-membrane-3d", {
    title: "3D · a clamped silicon diaphragm under pressure, with a piezoresistive bridge at its edge",
    target: "After this you can compute how far a diaphragm bends (x₀ = p r_d⁴/64D_p) and how much stress, ΔR/R and bridge voltage it makes, and say why the resistors sit at the edge.",
    caption: "the <span style='color:" + C.blue + "'>blue arrows</span> are the pressure difference. The membrane bows like a drum skin (depth exaggerated); after step 4 its colour is the radial surface stress: <span style='color:#c0392b'>red</span> = stretched (largest at the clamped edge), <span style='color:#2f5fb3'>blue</span> = compressed (centre), white ring = no stress. Four <span style='color:" + C.teal + "'>piezoresistors</span> sit where the stress is largest: two along the radius (+ΔR), two across it (−ΔR), wired as a full bridge whose <span style='color:" + C.yellow + "'>output</span> is shown top right.",
    links: [
      { id: "A2", why: "the four resistors form the Wheatstone bridge of A2" },
      { id: "B3", why: "D_p = Et³/12(1−ν_P²) is the plate version of the beam stiffness EI_A" },
      { id: "A4", why: "piezoresistance: stress changes the resistivity of silicon" },
      { id: "C2", why: "the same chip measures Δp across a microchannel" },
    ],
    build(fig, ui) {
      let p = 100, t = 20, rd = 500, step = 0;   // kPa, µm, µm
      const E = 160e9, nu = 0.27, pi44h = 69e-11, Vex = 3.3, Rv = 2.0;
      function phys() {
        const P = p * 1e3, T = t * 1e-6, r = rd * 1e-6;
        const D = (E * T ** 3) / (12 * (1 - nu * nu));
        const x0 = (P * r ** 4) / (64 * D);
        const se = (3 * P * r * r) / (4 * T * T), sc = (3 * (1 + nu) * P * r * r) / (8 * T * T);
        const dRR = pi44h * (1 - nu) * se, V = Vex * dRR;
        const per12 = { x: (x0 * 12) / Math.max(P, 1), V: (V * 12) / Math.max(P, 1) };
        return { D, x0, se, sc, dRR, V, per12, ratio: x0 / T };
      }
      const sTop = (u) => ((3 + nu) * u * u - (1 + nu)) / 2;    // top-surface radial stress / edge stress
      const sc3 = scene3d(ui.body, {
        w: 640, h: 420, scale: 64, yaw: -0.6, pitch: 0.62, center: [0, 0, -0.1],
        draw(g) {
          const P = phys();
          const Z = step >= 2 ? 1.25 * Math.tanh(P.ratio / 0.05) : 0;
          const zf = (u) => -Z * Math.pow(1 - u * u, 2);
          // die: top with a round opening, side walls, and the cavity floor far below
          dieWalls(g, 3.0, -1.6, 0, mix(C.silicon, "#000000", 0.25), -30);
          g.poly([[-2.0, -2.0, -1.55], [2.0, -2.0, -1.55], [2.0, 2.0, -1.55], [-2.0, 2.0, -1.55]], "#151a20", { bias: -80, shade: false });
          dieTop(g, Rv, 3.0, 0, C.silicon, 40, -2);
          // the membrane surface
          g.surface((u, v) => [Rv * u * Math.cos(v), Rv * u * Math.sin(v), zf(u)], [0, 1, 10], [0, 2 * Math.PI, 40],
            (x, y, z, u) => (step >= 3 ? ramp(0.5 + 0.5 * sTop(u), "div") : mix(C.silicon, C.white, 0.18)), { bias: -1 });
          // the model profile along a cut
          if (step >= 2) {
            const pr = [];
            for (let i = -20; i <= 20; i++) { const u = i / 20; pr.push([Rv * u, 0, zf(Math.abs(u)) + 0.03]); }
            g.polyline(pr, C.green, 3);
            g.text([0.25, 0, zf(0) - 0.3], "x₀", C.green, 14);
          }
          // thickness marker at the clamped edge
          if (step === 1) {
            g.line([Rv + 0.25, -0.0, 0.0], [Rv + 0.25, 0, -0.35], C.white, 3);
            g.text([Rv + 0.7, 0, -0.2], "t", C.white, 15);
            g.text([0, -Rv - 0.55, 0.15], "D_p ∝ t³", C.white, 14);
          }
          // piezoresistors: radial at 0 and π, tangential at ±π/2
          const lit = step >= 4;
          [[0, "r"], [Math.PI, "r"], [Math.PI / 2, "t"], [-Math.PI / 2, "t"]].forEach(([a, kind]) => {
            const col = lit ? (kind === "r" ? mix(C.teal, C.white, 0.35) : mix(C.teal, "#000000", 0.1)) : mix(C.teal, C.silicon, 0.4);
            const pts = [];
            if (kind === "r") { const w = 0.07; [[0.84, -w], [0.98, -w], [0.98, w], [0.84, w]].forEach(([u, s]) => pts.push([Rv * u * Math.cos(a) - s * Math.sin(a), Rv * u * Math.sin(a) + s * Math.cos(a), zf(u) + 0.04])); }
            else { const da = 0.09; [[0.9, -da], [0.9, da], [0.97, da], [0.97, -da]].forEach(([u, d]) => pts.push([Rv * u * Math.cos(a + d), Rv * u * Math.sin(a + d), zf(u) + 0.04])); }
            g.poly(pts, col, { bias: 5, shade: false });
            if (lit) g.text([(Rv + 0.45) * Math.cos(a), (Rv + 0.45) * Math.sin(a), 0.25], kind === "r" ? "+ΔR" : "−ΔR", kind === "r" ? C.yellow : C.teal, 13);
          });
          // pressure arrows
          const L = 0.35 + 0.9 * clamp(p / 200, 0, 1);
          if (p > 0) [[0, 0], [1.0, 0], [-1.0, 0], [0, 1.0], [0, -1.0]].forEach(([x, y]) => {
            const z1 = zf(Math.hypot(x, y) / Rv) + 0.12;
            g.arrow([x, y, z1 + L + 0.6], [x, y, z1 + 0.6 - 0.0], ROLE.s, 3);
          });
          g.text([0, 0, 0.6 + L + 0.95], `p = ${fmt(p, 0)} kPa`, ROLE.s, 14);
        },
        overlay(ctx) {
          if (step < 4) return;
          const P = phys();
          // a tiny Wheatstone bridge: diamond of four resistors, output across the middle
          const x0 = 470, y0 = 10, w = 162, h = 128;
          panel(ctx, x0, y0, w, h);
          const cx = x0 + 70, cy = y0 + 66, r = 42;
          const top = [cx, cy - r], bot = [cx, cy + r], lef = [cx - r, cy], rig = [cx + r, cy];
          const arm = (a, b, plus) => {
            ctx.strokeStyle = css(plus ? mix(C.teal, C.white, 0.35) : C.teal); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
            txt(ctx, plus ? "+" : "−", (a[0] + b[0]) / 2 + (a[0] < b[0] ? 6 : -6) * (a[1] < b[1] ? -1 : 1), (a[1] + b[1]) / 2 - 7, plus ? C.yellow : C.teal, 13, "center");
          };
          arm(top, lef, true); arm(rig, bot, true); arm(top, rig, false); arm(lef, bot, false);
          txt(ctx, "V_ex", cx, y0 + 12, C.teal, 11, "center");
          ctx.strokeStyle = css(C.yellow); ctx.setLineDash([3, 3]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(lef[0], lef[1]); ctx.lineTo(rig[0], rig[1]); ctx.stroke(); ctx.setLineDash([]);
          if (step >= 5) {
            txt(ctx, "V_out", x0 + w - 6, cy - 12, C.yellow, 12, "right");
            txt(ctx, fmt(P.V * 1e3, 1) + " mV", x0 + w - 6, cy + 8, C.yellow, 12, "right");
          }
        },
      });

      ui.slider("pressure p", 0, 200, 5, p, (v) => { p = v; sc3.render(); update(); return v + " kPa"; });
      ui.slider("thickness t", 5, 40, 1, t, (v) => { t = v; sc3.render(); update(); return v + " µm"; });
      ui.slider("radius r_d", 200, 800, 25, rd, (v) => { rd = v; sc3.render(); update(); return v + " µm"; });

      function update() {
        const P = phys();
        ui.read.innerHTML =
          `D_p = Et³/12(1−ν_P²) = ${P.D.toExponential(3)} N·m · <span style="color:${C.purple}">x₀ = p r_d⁴/64D_p = ${P.x0 >= 1e-6 ? fmt(P.x0 * 1e6, 3) + " µm" : fmt(P.x0 * 1e9, 1) + " nm"}</span> (x₀/t = ${fmt(P.ratio, 3)})<br>` +
          `edge stress σ = 3p r_d²/4t² = ${fmt(P.se / 1e6, 1)} MPa (centre ${fmt(P.sc / 1e6, 1)} MPa) · ` +
          `<span style="color:${C.teal}">ΔR/R = ${fmt(P.dRR * 100, 3)} %</span> · <span style="color:${C.yellow}">V_out = ${fmt(P.V * 1e3, 2)} mV</span> (V_ex = 3.3 V)<br>` +
          `one metre of altitude (12 Pa): Δx₀ = ${fmt(P.per12.x * 1e9, 3)} nm, ΔV_out = ${fmt(P.per12.V * 1e6, 2)} µV` +
          (P.ratio > 0.3 ? `<br><span style="color:${C.red}">x₀ is no longer ≪ t: the membrane also stretches, so the linear plate formula overestimates x₀</span>` : "") +
          (P.se > 500e6 ? `<br><span style="color:${C.red}">edge stress above ~0.5 GPa: no safety margin left against fracture</span>` : "");
      }
      update();

      ui.steps([
        "<b>Load.</b> A pressure difference \\( p \\) pushes on every square metre of the membrane: the total force is \\( p\\,\\pi r_d^2 \\). At 100 kPa on a 1 mm disc that is 78.5 mN, the weight of 8.0 grams, on a sheet 20 µm thick.",
        "<b>Bending stiffness.</b> A plate resists bending with \\( D_p=\\dfrac{Et^3}{12(1-\\nu_P^2)} \\), the plate version of a beam's \\( EI_A \\) (B3). Thickness enters cubed: double \\( t \\), eight times stiffer. Here \\( D_p=1.151\\times10^{-4} \\) N·m.",
        "<b>Deflection.</b> Solving the plate equation with clamped edges gives the profile \\( x(r)=x_0\\big(1-r^2/r_d^2\\big)^2 \\) with centre deflection \\( x_0=\\dfrac{p\\,r_d^4}{64D_p} \\) = 0.85 µm. Radius to the fourth power: a bigger drum is far softer.",
        "<b>Stress.</b> The surface is stretched where it bends most sharply, at the clamped edge: \\( \\sigma_{\\text{edge}}=\\dfrac{3p\\,r_d^2}{4t^2} \\) = 46.9 MPa, against \\( \\dfrac{3(1+\\nu_P)p\\,r_d^2}{8t^2} \\) = 29.8 MPa (opposite sign) at the centre.",
        "<b>Piezoresistors.</b> In p-type silicon \\( \\Delta R/R\\approx\\tfrac{\\pi_{44}}{2}(\\sigma_\\parallel-\\sigma_\\perp) \\). At the edge \\( \\sigma_\\perp=\\nu_P\\sigma_{\\text{edge}} \\), so a resistor along the radius gets \\( +\\tfrac{\\pi_{44}}{2}(1-\\nu_P)\\sigma_{\\text{edge}}=+2.36\\% \\) and one across it \\( -2.36\\% \\).",
        "<b>Bridge.</b> Two up, two down, in opposite arms (A2): \\( V_{\\text{out}}=V_{\\text{ex}}\\,\\Delta R/R \\) = 77.9 mV at 100 kPa with 3.3 V, i.e. 0.78 mV/kPa. Temperature changes all four equally and cancels.",
      ], (i) => { step = i; sc3.render(); update(); });
    },
  });

  // ══════════════════════════════ 2. electrostatic pull-in ══════════════════════════════
  register("b5-pull-in", {
    title: "Electrostatic pull-in: why a parallel-plate actuator can only close a third of its gap",
    target: "After this you can find the equilibria of a plate actuator graphically, tell stable from unstable, and derive x = g₀/3 and V_pi = √(8kg₀³/27ε₀A).",
    caption: "top: a plate on a <span style='color:" + C.purple + "'>spring</span> above a fixed <span style='color:" + C.teal + "'>electrode</span>. Bottom: the spring force kx (<span style='color:" + C.purple + "'>purple</span>) and the electrostatic pull (<span style='color:" + C.teal + "'>teal</span>) against the displacement x. Where they cross, the plate can rest: the <span style='color:" + C.green + "'>green</span> crossing is stable, the <span style='color:" + C.red + "'>red</span> one unstable. Raise V: the crossings move toward each other, merge at x = g₀/3, and then vanish. The plate snaps shut.",
    links: [
      { id: "A3", why: "F_e is the derivative of the capacitor energy ½CV²" },
      { id: "B3", why: "k and the spring–mass are the same as in B3" },
      { id: "B4", why: "the accelerometer's readout voltage must stay far below V_pi" },
      { id: "B1", why: "electrostatic forces win at small gaps: the scaling argument" },
    ],
    build(fig, ui) {
      const k = 1, g0 = 2e-6, A = 1e-8;
      const Vpi = Math.sqrt((8 * k * g0 ** 3) / (27 * EPS0 * A));
      let V = 3, step = 0;
      const Fe = (x, v) => (EPS0 * A * v * v) / (2 * (g0 - x) ** 2);
      function equilibria(v) {
        const h = (x) => k * x * (g0 - x) ** 2 - (EPS0 * A * v * v) / 2;   // h = 0 at equilibrium; h > 0 → spring wins
        if (h(g0 / 3) < 0) return [];
        const bis = (lo, hi, rising) => { for (let i = 0; i < 70; i++) { const m = (lo + hi) / 2; if ((h(m) < 0) === rising) lo = m; else hi = m; } return (lo + hi) / 2; };
        return [bis(0, g0 / 3, true), bis(g0 / 3, g0, false)];
      }
      // schematic
      const sv = S("svg", { viewBox: "0 0 640 150", role: "img", "aria-label": "parallel-plate actuator" }, ui.body);
      S("rect", { x: 220, y: 6, width: 200, height: 12, fill: C.silicon }, sv);
      const spring = S("polyline", { fill: "none", stroke: C.purple, "stroke-width": 3, "stroke-linejoin": "round" }, sv);
      const plate = S("rect", { x: 250, width: 140, height: 10, fill: css(mix(C.purple, C.silicon, 0.3)) }, sv);
      S("rect", { x: 250, y: 132, width: 140, height: 10, fill: C.teal }, sv);
      const gapLab = S("text", { x: 404, y: 100, fill: C.dim, "font-size": 13, "font-family": "var(--font-mono, monospace)" }, sv);
      const vLab = S("text", { x: 62, y: 92, fill: C.teal, "font-size": 15, "text-anchor": "middle", "font-family": "var(--font-mono, monospace)" }, sv);
      const snap = S("text", { x: 520, y: 80, fill: C.red, "font-size": 16, "text-anchor": "middle", "font-weight": 600, "font-family": "var(--font-mono, monospace)" }, sv);
      S("line", { x1: 108, y1: 85, x2: 132, y2: 85, stroke: C.teal, "stroke-width": 2.5 }, sv);
      S("line", { x1: 113, y1: 93, x2: 127, y2: 93, stroke: C.teal, "stroke-width": 2.5 }, sv);
      S("line", { x1: 120, y1: 93, x2: 120, y2: 137, stroke: C.teal, "stroke-width": 1.5 }, sv);
      S("line", { x1: 120, y1: 137, x2: 250, y2: 137, stroke: C.teal, "stroke-width": 1.5 }, sv);
      const wire = S("polyline", { fill: "none", stroke: C.teal, "stroke-width": 1.5 }, sv);
      // force chart
      const ch = chart(ui.body, { w: 640, h: 280, xr: [0, 2], yr: [0, 2], xlabel: "plate displacement x (µm)   [gap g₀ = 2 µm]", ylabel: "force (µN)" });
      const lSpring = ch.line(C.purple, 2.6), lFe = ch.line(C.teal, 2.6), lFpi = ch.line(C.teal, 1.4, "5 4"), lTan = ch.line(C.white, 1.4, "3 3");
      const vThird = ch.vline(C.yellow), dS = ch.dot(C.green, 6), dU = ch.dot(C.red, 6);
      const labS = ch.label(C.purple, 12.5), labE = ch.label(C.teal, 12.5), labT = ch.label(C.yellow, 12.5);
      lFpi.el.setAttribute("opacity", 0.6);

      function draw() {
        const eq = equilibria(V), pulled = eq.length === 0;
        const um = (x) => x * 1e6, uN = (f) => f * 1e6;
        lSpring.set(step >= 1 ? [[0, 0], [2, uN(k * 2e-6)]] : []);
        const pts = [], ptsPi = [];
        for (let i = 0; i <= 200; i++) { const x = (i / 200) * 0.985 * g0; pts.push([um(x), uN(Fe(x, V))]); ptsPi.push([um(x), uN(Fe(x, Vpi))]); }
        lFe.set(pts); lFpi.set(step >= 3 ? ptsPi : []);
        vThird.el.setAttribute("visibility", step >= 3 ? "visible" : "hidden"); vThird.set(um(g0 / 3));
        labT.set(um(g0 / 3) + 0.03, 1.88, step >= 3 ? "g₀/3" : "");
        labS.set(1.55, 1.68, step >= 1 ? "spring kx" : "");
        labE.set(0.05, 1.85, `F_e at V = ${fmt(V, 2)} V`);
        if (step >= 1 && !pulled) { dS.set(um(eq[0]), uN(k * eq[0])); dU.set(um(eq[1]), uN(k * eq[1])); }
        else { dS.set(NaN, NaN); dU.set(NaN, NaN); }
        if (step === 2 && !pulled) {
          const x = eq[0], f = Fe(x, V), sl = (2 * f) / (g0 - x);  // dF_e/dx
          lTan.set([[um(x - 0.5e-6), uN(f - sl * 0.5e-6)], [um(x + 0.5e-6), uN(f + sl * 0.5e-6)]]);
        } else lTan.set([]);
        // schematic: the plate sits at the stable equilibrium, or on the electrode after pull-in
        const xs = pulled ? g0 : eq[0], yTop = 50 + (72 * xs) / g0;
        plate.setAttribute("y", yTop);
        const sp = []; const n = 10; for (let i = 0; i <= n; i++) { const yy = 18 + ((yTop - 18) * i) / n; sp.push(`${320 + (i % 2 ? 14 : -14) * (i > 0 && i < n ? 1 : 0)},${yy}`); }
        spring.setAttribute("points", sp.join(" "));
        wire.setAttribute("points", `120,85 120,${yTop + 5} 250,${yTop + 5}`);
        gapLab.textContent = pulled ? "gap closed" : `gap ${fmt((g0 - xs) * 1e6, 2)} µm`;
        vLab.textContent = `V = ${fmt(V, 2)} V`;
        snap.textContent = pulled ? "PULL-IN!" : "";
        ui.read.innerHTML =
          `k = 1 N/m · g₀ = 2 µm · A = 100 µm × 100 µm · <span style="color:${C.yellow}">V_pi = √(8kg₀³/27ε₀A) = ${fmt(Vpi, 2)} V</span><br>` +
          (pulled ? `<span style="color:${C.red}">V = ${fmt(V, 2)} V > V_pi: the electrostatic pull beats the spring at every gap, so the plate snaps onto the electrode.</span>`
            : `V = ${fmt(V, 2)} V (${fmt(V / Vpi, 2)} V_pi): <span style="color:${C.green}">stable rest at x = ${fmt(eq[0] * 1e9, 0)} nm (${fmt(eq[0] / g0, 3)} g₀)</span>, ` +
              `<span style="color:${C.red}">unstable at ${fmt(eq[1] * 1e9, 0)} nm</span>; ` +
              `spring stiffness k = 1 N/m vs electrostatic dF_e/dx = ${fmt((2 * Fe(eq[0], V)) / (g0 - eq[0]), 3)} N/m at the stable point`);
      }
      const sV = ui.slider("voltage V", 0, 7, 0.05, V, (v) => { V = v; draw(); return fmt(v, 2) + " V"; });
      ui.steps([
        "<b>Electrostatic pull.</b> The capacitor energy is \\( \\tfrac12CV^2 \\) with \\( C=\\varepsilon_0A/(g_0-x) \\); its slope is the force \\( F_e=\\dfrac{\\varepsilon_0AV^2}{2(g_0-x)^2} \\). It grows without limit as the gap closes (teal curve).",
        "<b>Spring.</b> The spring pulls back with \\( kx \\), a straight line. The plate can rest where \\( kx=F_e \\): the curves cross twice (or not at all).",
        "<b>Stability.</b> Nudge the plate closer by \\( \\delta x \\). The spring adds \\( k\\,\\delta x \\), the electrostatics add \\( \\dfrac{dF_e}{dx}\\delta x=\\dfrac{2F_e}{g_0-x}\\delta x \\) (white tangent). It comes back only if \\( k>\\dfrac{2F_e}{g_0-x} \\): true at the green crossing, false at the red one.",
        "<b>The critical point.</b> At the largest voltage the two crossings merge: \\( kx=F_e \\) <i>and</i> \\( k=\\dfrac{2F_e}{g_0-x} \\). Divide: \\( x=\\dfrac{g_0-x}{2} \\Rightarrow x=\\dfrac{g_0}{3} \\), independent of \\( k \\), \\( A \\) and \\( V \\).",
        "<b>The pull-in voltage.</b> Put \\( x=g_0/3 \\) into \\( kx=F_e \\): \\( \\dfrac{kg_0}{3}=\\dfrac{\\varepsilon_0AV^2}{2\\cdot\\frac49g_0^2} \\Rightarrow V_{\\text{pi}}=\\sqrt{\\dfrac{8kg_0^3}{27\\varepsilon_0A}} \\) = 5.17 V here. At that point \\( kx=F_e= \\) 667 nN.",
        "<b>Beyond.</b> Above \\( V_{\\text{pi}} \\) there is no crossing: the plate snaps shut. Gap-closing actuators use only the first third of the gap; comb drives (force independent of \\( x \\)) avoid the problem, and DLP mirrors use the snap as a clean digital on/off.",
      ], (i) => {
        step = i;
        if (i === 3 || i === 4) { sV.set(Vpi); V = Vpi * (1 - 1e-7); } else if (i === 5) sV.set(1.1 * Vpi); else if (V > Vpi) sV.set(3);
        draw();
      });
    },
  });

  // ══════════════════════════════ 3. the MEMS microphone ══════════════════════════════
  register("b5-microphone-3d", {
    title: "3D · a MEMS microphone: a membrane under a perforated backplate",
    target: "After this you can turn a sound level in dB SPL into pascals, nanometres of membrane motion and millivolts, and read a microphone's sensitivity and SNR.",
    caption: "sound pressure arrives through the package port and moves the thin <span style='color:" + C.purple + "'>membrane</span>; the stiff <span style='color:" + C.teal + "'>backplate</span> above is full of holes so air can escape. The gap between them is a capacitor held at constant charge, so its voltage follows the gap. Membrane motion is drawn on a dB (log) scale: in reality it is picometres to tens of nanometres. The meter compares the <span style='color:" + C.yellow + "'>signal</span> with the fixed <span style='color:" + C.red + "'>noise floor</span>: their distance is the SNR for this sound.",
    links: [
      { id: "A3", why: "a constant-charge capacitor: V = q g/(ε₀A) follows the gap" },
      { id: "A7", why: "the ASIC preamplifier and the 2 dB of gain come from there" },
      { id: "A8", why: "SNR and the noise floor are defined there" },
      { id: "B3", why: "the membrane is a resonator; its f₀ sets the top of the audio band" },
    ],
    build(fig, ui) {
      let spl = 74, Vb = 10;
      const rm = 300e-6, g0 = 3e-6, x0perPa = 9.03e-9, Vn = 7.08e-6, asic = Math.pow(10, 2 / 20);
      const Am = Math.PI * rm * rm, kmean = Am / (x0perPa / 3), Vpi = Math.sqrt((8 * kmean * g0 ** 3) / (27 * EPS0 * Am));
      function phys() {
        const p = 20e-6 * Math.pow(10, spl / 20);
        const x0 = x0perPa * p, xbar = x0 / 3, dC = ((EPS0 * Am) / g0) * (xbar / g0);
        const sens = asic * Vb * (x0perPa / 3) / g0;       // V/Pa
        const v = sens * p;
        return { p, x0, xbar, dC, sens, v, snr: 20 * Math.log10(v / Vn), sensdB: 20 * Math.log10(sens) };
      }
      const sc = scene3d(ui.body, {
        w: 640, h: 400, scale: 62, yaw: -0.6, pitch: 0.55, center: [0.6, 0, 0.1], animate: !VIZ.reduceMotion,
        draw(g, tt) {
          const P = phys();
          const amp = 0.04 + 0.5 * clamp((spl - 20) / 110, 0, 1);
          const ph = VIZ.reduceMotion ? 1 : Math.sin(2 * Math.PI * 1.1 * tt);
          const zm = (u) => amp * ph * Math.pow(1 - u * u, 2);
          const R = 2.0;
          // die with back cavity
          dieWalls(g, 2.8, -1.4, 0, mix(C.silicon, "#000000", 0.25), -30);
          dieTop(g, R, 2.8, 0, C.silicon, 32, -2);
          g.poly([[-3.4, -3.4, -1.4], [5.6, -3.4, -1.4], [5.6, 3.4, -1.4], [-3.4, 3.4, -1.4]], "#1b2129", { bias: -90, shade: false });
          // membrane
          g.surface((u, v) => [R * u * Math.cos(v), R * u * Math.sin(v), zm(u)], [0, 1, 6], [0, 2 * Math.PI, 32],
            (x, y, z, u) => mix(C.purple, C.white, 0.15 + 0.25 * clamp(z / 0.5 + 0.5, 0, 1)), { bias: -1 });
          // perforated backplate (holes = skipped cells), on four posts
          const zb = 0.75;
          g.surface((u, v) => [2.15 * u * Math.cos(v), 2.15 * u * Math.sin(v), zb], [0.1, 1, 5], [0, 2 * Math.PI, 32],
            (x, y, z, u, v) => { const i = Math.floor(u * 5), j = Math.floor((v / (2 * Math.PI)) * 32); return (i + j) % 2 === 0 && u < 0.9 ? null : mix(C.teal, "#000000", 0.15); },
            { alpha: 0.9, bias: 2 });
          [0.785, 2.356, 3.927, 5.498].forEach((a) => tboxSimple(g, [2.25 * Math.cos(a) - 0.12, 2.25 * Math.sin(a) - 0.12, 0], [2.25 * Math.cos(a) + 0.12, 2.25 * Math.sin(a) + 0.12, zb], C.silicon));
          // ASIC and wire
          tboxSimple(g, [3.5, -1.0, -1.4], [5.2, 1.0, -0.6], "#3a4350");
          g.text([4.35, 0, -0.35], "ASIC", C.dim, 12);
          g.polyline([[2.0, 1.4, zb], [3.0, 1.4, 0.4], [3.6, 0.6, -0.6]], C.teal, 1.6);
          // sound pressure arriving from the package port, pumping the membrane through the backplate holes
          const L = 0.45 + 0.5 * amp;
          [[-0.9, 0.3], [0.9, -0.3], [0, 0]].forEach(([x, y]) => {
            const zt = zb + 1.9, zl = zb + 0.25;
            if (ph >= 0) g.arrow([x, y, zt], [x, y, zt - L * (0.4 + 0.6 * ph) - 0.5], ROLE.s, 3);
            else g.arrow([x, y, zl], [x, y, zl + L * (0.4 - 0.6 * ph)], ROLE.s, 3);
          });
          g.text([0, 0, zb + 2.25], "sound pressure p(t)", ROLE.s, 13);
          g.text([-1.7, -2.75, zb + 0.15], "backplate", C.teal, 12);
          g.line([1.3, -1.6, 0.02], [1.6, -2.5, 0.02], C.purple, 1.5);
          g.text([1.75, -2.85, 0.02], "membrane", C.purple, 12);
          if (P.p > 20) g.text([0, 0, zb + 1.0], "near overload", C.red, 13);
        },
        overlay(ctx) {
          const P = phys();
          const x0 = 520, y0 = 10, w = 112, h = 220;
          panel(ctx, x0, y0, w, h);
          txt(ctx, "dBV", x0 + w / 2, y0 + 12, C.dim, 11, "center");
          const top = 0, bot = -140, Y = (d) => y0 + 26 + ((top - d) / (top - bot)) * (h - 40);
          for (let d = 0; d >= -140; d -= 20) { ctx.fillStyle = css(C.gridFaint); ctx.fillRect(x0 + 8, Y(d), w - 16, 1); txt(ctx, String(d), x0 + 10, Y(d) - 6, C.dim, 9.5); }
          const vdB = 20 * Math.log10(P.v), ndB = 20 * Math.log10(Vn);
          ctx.fillStyle = css(C.yellow); ctx.fillRect(x0 + 52, Y(Math.min(0, vdB)), 22, Y(bot) - Y(Math.min(0, vdB)));
          ctx.fillStyle = css(C.red); ctx.fillRect(x0 + 44, Y(ndB) - 1.5, 52, 3);
          txt(ctx, "noise", x0 + 40, Y(ndB), C.red, 10, "right");
          txt(ctx, "signal", x0 + 63, Y(Math.min(0, vdB)) - 8, C.yellow, 10, "center");
          txt(ctx, "SNR " + fmt(P.snr, 0) + " dB", x0 + w / 2, y0 + h - 8, P.snr > 0 ? C.text : C.red, 11, "center");
        },
      });
      // plain axis-aligned box helper (no transform)
      function tboxSimple(g, a, b, col) { g.box(a, b, col); }

      ui.slider("sound level", 20, 130, 1, spl, (v) => { spl = v; update(); if (!sc.o.animate) sc.render(); return v + " dB SPL"; });
      ui.slider("bias V_b", 2, 16, 0.5, Vb, (v) => { Vb = v; update(); if (!sc.o.animate) sc.render(); return fmt(v, 1) + " V"; });
      function update() {
        const P = phys();
        const xs = P.x0 >= 1e-9 ? fmt(P.x0 * 1e9, 2) + " nm" : fmt(P.x0 * 1e12, 1) + " pm";
        ui.read.innerHTML =
          `<span style="color:${C.blue}">${spl} dB SPL = ${P.p >= 0.1 ? fmt(P.p, 3) : P.p.toExponential(2)} Pa rms</span> · ` +
          `<span style="color:${C.purple}">centre motion x₀ = ${xs}</span> · ΔC = ${fmt(P.dC * 1e18, P.dC * 1e18 < 10 ? 2 : 0)} aF (of C₀ = 0.83 pF)<br>` +
          `sensitivity = ${fmt(P.sens * 1e3, 2)} mV/Pa = ${fmt(P.sensdB, 1)} dBV/Pa · <span style="color:${C.yellow}">V_out = ${P.v >= 1e-3 ? fmt(P.v * 1e3, 3) + " mV" : fmt(P.v * 1e6, 2) + " µV"} rms</span> · ` +
          `<span style="color:${P.snr > 0 ? C.text : C.red}">SNR for this sound = ${fmt(P.snr, 1)} dB</span><br>` +
          `bias V_b = ${fmt(Vb, 1)} V vs pull-in ≈ ${fmt(Vpi, 1)} V (piston estimate)` +
          (Vb > 0.8 * Vpi ? ` <span style="color:${C.red}">too close: the membrane would collapse onto the backplate</span>` : "") +
          (spl > 120 ? ` · <span style="color:${C.red}">above ~120 dB SPL the output distorts (acoustic overload)</span>` : "");
      }
      update();
    },
  });
})();
