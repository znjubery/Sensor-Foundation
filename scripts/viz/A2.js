/* A2 — resistive sensors and the Wheatstone bridge: widgets for docs/A2-resistive-sensors-and-the-wheatstone-bridge.md */
(function () {
  "use strict";
  const { register, C, scene3d, chart, fmt, mix, ramp, S, H } = VIZ;

  // ═════════════════ a2-strain-gauge-3d: a bending beam with a foil gauge ═════════════════
  register("a2-strain-gauge-3d", {
    title: "3D · a foil strain gauge on a bending steel beam: ΔR/R = GF · ε",
    target: "After this you can compute the strain under a gauge on a loaded beam and the resulting ΔR, and explain where the gauge factor of ≈ 2 comes from.",
    caption: "a steel beam (20 mm wide, 2 mm thick, drawn 2.5× thicker; bending exaggerated) is clamped on the left and pushed down at the tip (purple). The surface colour is the strain magnitude (dark = none, yellow = most): largest at the root, zero at the tip. The teal serpentine on top is the gauge; the dim one underneath is squeezed by the same amount, which a half bridge uses. Slide the gauge toward the tip and watch ΔR fall.",
    links: [
      { id: "A1", why: "this is stage 1 of the kitchen-scale chain" },
      { id: "B3", why: "the beam formula σ = 6Fx/(wt²) is derived there" },
      { id: "A4", why: "silicon piezoresistors have GF ≈ 100 instead of 2" },
      { id: "B5", why: "pressure-sensor membranes carry the same gauges" },
    ],
    build(fig, ui) {
      const E = 200e9, W = 0.02, T = 0.002, LB = 0.12, R0 = 120, GF = 2, NU = 0.3;
      const U = 0.02;                         // 1 scene unit = 20 mm
      let F = 10, xg = 0.020, step = 3;        // load (N), gauge centre from the root (m)
      const L = LB / U, hw = W / U / 2, th = 0.25;
      const strain = (xr) => (6 * F * Math.max(0, LB - xr)) / (W * T * T * E);   // xr = distance from root (m)
      const defl = (u) => { const I = (W * T ** 3) / 12, d = (F * LB ** 3) / (3 * E * I); return -(d * 18 / U) * u * u * (3 - u) / 2; };
      const sc = scene3d(ui.body, {
        w: 640, h: 290, scale: 76, yaw: 0.5, pitch: 0.5, center: [2.55, 0, -0.15],
        draw(g) {
          const n = 22, xray = step === 5 ? 0.35 : 1;
          const zt = (xr) => defl(xr / L);                       // xr in scene units here
          const col = (xs) => ramp(Math.min(1, strain(xs * U) / 9.4e-4));
          // clamp
          g.box([-0.6, -hw - 0.3, -0.8], [0, hw + 0.3, 0.45], C.silicon);
          for (let i = 0; i < n; i++) {
            const xa = (L * i) / n, xb = (L * (i + 1)) / n, za = zt(xa), zb = zt(xb), cm = col((xa + xb) / 2);
            g.poly([[xa, -hw, za + th / 2], [xb, -hw, zb + th / 2], [xb, hw, zb + th / 2], [xa, hw, za + th / 2]], cm, { bias: -0.01, alpha: xray });
            g.poly([[xa, -hw, za - th / 2], [xb, -hw, zb - th / 2], [xb, hw, zb - th / 2], [xa, hw, za - th / 2]], cm, { alpha: xray });
            g.poly([[xa, -hw, za - th / 2], [xb, -hw, zb - th / 2], [xb, -hw, zb + th / 2], [xa, -hw, za + th / 2]], mix(C.silicon, cm, 0.35), { alpha: xray });
            g.poly([[xa, hw, za - th / 2], [xb, hw, zb - th / 2], [xb, hw, zb + th / 2], [xa, hw, za + th / 2]], mix(C.silicon, cm, 0.35), { alpha: xray });
          }
          g.poly([[L, -hw, zt(L) - th / 2], [L, hw, zt(L) - th / 2], [L, hw, zt(L) + th / 2], [L, -hw, zt(L) + th / 2]], C.silicon);
          // gauges (top and bottom): serpentine of 8 strands along x
          const gc = xg / U, gl = 0.8, gw = 0.7, strands = 10, sScale = step === 1 ? 1 + 0.12 * Math.sign(F) : 1, nScale = step === 2 ? 0.75 : 1;
          function gauge(sign, colr, wdt) {
            const pts = [];
            for (let k = 0; k < strands; k++) {
              const yy = (-gw / 2 + (gw * k) / (strands - 1)) * nScale;
              const xa = gc - (gl / 2) * sScale, xb = gc + (gl / 2) * sScale;
              const a = [xa, yy, zt(xa) + sign * (th / 2 + 0.015)], b = [xb, yy, zt(xb) + sign * (th / 2 + 0.015)];
              if (k % 2 === 0) pts.push(a, b); else pts.push(b, a);
            }
            g.polyline(pts, colr, wdt);
            // backing film
            const xa = gc - gl / 2 - 0.12, xb = gc + gl / 2 + 0.12, yo = gw / 2 + 0.12;
            g.poly([[xa, -yo, zt(xa) + sign * (th / 2 + 0.008)], [xb, -yo, zt(xb) + sign * (th / 2 + 0.008)], [xb, yo, zt(xb) + sign * (th / 2 + 0.008)], [xa, yo, zt(xa) + sign * (th / 2 + 0.008)]],
              "#3a2f1a", { alpha: 0.75, bias: 0.01 });
          }
          gauge(1, C.teal, 2.4);
          gauge(-1, step === 5 ? C.teal : mix(C.teal, C.bg, 0.55), step === 5 ? 2.4 : 1.5);
          // load
          g.arrow([L - 0.15, 0, zt(L) + 1.5], [L - 0.15, 0, zt(L) + th / 2 + 0.05], C.purple, 3.5);
          g.text([L - 0.15, 0, zt(L) + 1.72], "F = " + fmt(F, 1) + " N", C.purple, 14);
          const zg = zt(gc) + th / 2;
          if (step === 1) {
            g.arrow([gc + 0.2, 0, zg + 0.35], [gc + 0.75, 0, zg + 0.35], C.blue, 2.6);
            g.arrow([gc - 0.2, 0, zg + 0.35], [gc - 0.75, 0, zg + 0.35], C.blue, 2.6);
            g.text([gc, 0, zg + 0.62], "L → L(1+ε)", C.blue, 13);
          }
          if (step === 2) {
            g.arrow([gc, -hw - 0.6, zg + 0.05], [gc, -gw / 2 - 0.05, zg + 0.05], C.blue, 2.6);
            g.arrow([gc, hw + 0.6, zg + 0.05], [gc, gw / 2 + 0.05, zg + 0.05], C.blue, 2.6);
            g.text([gc, -hw - 0.9, zg + 0.1], "w, t → (1−ν ε)", C.blue, 13);
          }
          if (step === 3 || step === 0) g.text([gc, 0, zg + 0.75], "ΔR = " + fmt(R0 * GF * strain(xg) * 1000, 1) + " mΩ", C.yellow, 14);
          if (step === 4) {
            const zl = Math.max(zg, zt(L) + th / 2) + 1.05;
            g.line([gc, 0, zl], [L - 0.15, 0, zl], C.purple, 1.6, [5, 4]);
            g.line([gc, 0, zg], [gc, 0, zl + 0.1], C.purple, 1, [3, 3]);
            g.text([(gc + L) / 2, 0, zl + 0.25], "x = " + fmt((LB - xg) * 1000, 0) + " mm", C.purple, 13);
            g.text([gc, 0, zg + 0.5], "ε = " + fmt(strain(xg) * 1e6, 0) + " µε", C.blue, 14);
          }
          if (step === 5) g.text([gc + 1.6, 0, zt(gc) - th / 2 - 0.35], "bottom: −" + fmt(strain(xg) * 1e6, 0) + " µε", C.teal, 13);
          g.text([-0.3, 0, 0.75], "clamp", C.dim, 12);
        },
      });
      function upd() {
        const e = strain(xg), dRR = GF * e;
        ui.read.innerHTML =
          `gauge ${fmt(xg * 1000, 0)} mm from the clamp, x = ${fmt((LB - xg) * 1000, 0)} mm from the load · ` +
          `<span style="color:${C.blue}">σ = ${fmt((E * e) / 1e6, 1)} MPa, ε = ${fmt(e * 1e6, 0)} µε</span><br>` +
          `ΔR/R = GF·ε = ${fmt(dRR * 1e6, 0)} ppm · <span style="color:${C.teal}">ΔR = ${fmt(R0 * dRR * 1000, 1)} mΩ on 120 Ω</span> · ` +
          `<span style="color:${C.yellow}">5 V bridge: quarter ${fmt(1.25 * dRR * 1000, 3)} mV · half ${fmt(2.5 * dRR * 1000, 3)} mV · full ${fmt(5 * dRR * 1000, 3)} mV</span>`;
        sc.render();
      }
      ui.slider("load F", 0, 20, 0.5, F, (v) => { F = v; upd(); return fmt(v, 1) + " N"; });
      ui.slider("gauge position", 10, 100, 2, xg * 1000, (v) => { xg = v / 1000; upd(); return fmt(v, 0) + " mm"; });
      ui.steps([
        "A conductor's resistance: \\( R=\\rho L/A \\). The foil folds a 24.5 mm track into 8–12 strands so that \\( R=120\\,\\Omega \\).",
        "Stretch: every strand gets longer, \\( L\\to L(1+\\varepsilon) \\), so \\( R \\) rises by \\( \\varepsilon \\) (arrows exaggerated).",
        "…and thinner: width and thickness shrink by \\( (1-\\nu_P\\varepsilon) \\), so \\( A\\to A(1-2\\nu_P\\varepsilon) \\) and \\( R \\) rises by another \\( 2\\nu_P\\varepsilon \\).",
        "Add the resistivity change: \\( \\Delta R/R=(1+2\\nu_P)\\varepsilon+\\Delta\\rho/\\rho=\\mathrm{GF}\\,\\varepsilon \\), with \\( 1+2(0.3)=1.6 \\) from shape and \\( \\mathrm{GF}\\approx2 \\) in total.",
        "Where does \\( \\varepsilon \\) come from? Moment \\( M=Fx \\), surface stress \\( \\sigma=6Fx/(wt^2) \\), strain \\( \\varepsilon=\\sigma/E \\): 375 µε for 10 N at \\( x=100 \\) mm.",
        "The beam turns see-through: the bottom surface is squeezed by exactly \\( -\\varepsilon \\). A second gauge there gives \\( -\\Delta R \\): put both in one divider for a half bridge (next figure).",
      ], (i) => {
        step = i;
        sc.render();
      });
      upd();
    },
  });

  // ═════════════════ a2-bridge: live Wheatstone bridge, quarter / half / full ═════════════════
  register("a2-bridge", {
    title: "Live circuit · the Wheatstone bridge: two dividers, one difference",
    target: "After this you can derive V_out of a bridge from two voltage dividers, and explain why half and full bridges give more signal, perfect linearity and temperature cancellation.",
    caption: "four resistors between +V_ex (top) and ground (bottom). Each side is a voltage divider; the meter in the middle reads the difference V_out = V_A − V_B (yellow). Active gauges are blue with ↑ (stretched, +ΔR) or ↓ (squeezed, −ΔR). The small chart shows V_out against ΔR/R: yellow is exact, dashed green is the small-signal line. Push ΔR/R to ±30% (a thermistor, not a strain gauge) in quarter mode to see the curve bend; switch on temperature drift to see what cancels.",
    links: [
      { id: "A1", why: "linearising V_out ≈ (V_ex/4)·ΔR/R is a first-order Taylor step" },
      { id: "A3", why: "the differential capacitor is the same divide-to-compare idea" },
      { id: "A7", why: "an instrumentation amplifier reads the bridge's millivolts" },
      { id: "C2", why: "the same divider rules hold for pressure in fluid channels" },
    ],
    build(fig, ui) {
      let mode = 1, x = 0.00075, vex = 5, theta = 0, step = -1;      // mode: 1 quarter, 2 half, 4 full
      const wrap = H("div", { style: "display:flex;gap:6px;align-items:center" }, ui.body);
      const left = H("div", { style: "flex:1.45;min-width:0" }, wrap), right = H("div", { style: "flex:1;min-width:0" }, wrap);
      const Wd = 470, Hd = 330;
      const svg = S("svg", { viewBox: `0 0 ${Wd} ${Hd}`, role: "img", "aria-label": "Wheatstone bridge circuit" }, left);
      const P = { T: [265, 40], A: [160, 165], B: [370, 165], G: [265, 290] };
      const gWire = S("g", {}, svg), gHi = S("g", {}, svg), gRes = S("g", {}, svg), gTxt = S("g", {}, svg);
      const txt = (x0, y0, s, col, size, anc) => { const e = S("text", { x: x0, y: y0, fill: col || C.text, "font-size": size || 13, "text-anchor": anc || "middle", "dominant-baseline": "middle", "font-family": "var(--font-mono, ui-monospace, monospace)", "paint-order": "stroke", stroke: C.bg, "stroke-width": 4 }, gTxt); e.textContent = s; return e; };
      // supply wires: +V_ex from a battery on the far left
      S("path", { d: `M${P.T[0]},${P.T[1]} L${P.T[0]},18 L28,18 L28,140`, fill: "none", stroke: C.teal, "stroke-width": 2 }, gWire);
      S("path", { d: `M28,190 L28,312 L${P.G[0]},312 L${P.G[0]},${P.G[1]}`, fill: "none", stroke: C.teal, "stroke-width": 2 }, gWire);
      S("line", { x1: 14, y1: 150, x2: 42, y2: 150, stroke: C.teal, "stroke-width": 3 }, gWire);
      S("line", { x1: 20, y1: 162, x2: 36, y2: 162, stroke: C.teal, "stroke-width": 3 }, gWire);
      S("line", { x1: 14, y1: 174, x2: 42, y2: 174, stroke: C.teal, "stroke-width": 3 }, gWire);
      S("line", { x1: 20, y1: 186, x2: 36, y2: 186, stroke: C.teal, "stroke-width": 3 }, gWire);
      const tVex = txt(58, 163, "", C.teal, 12.5, "start");
      // meter between A and B
      S("path", { d: `M${P.A[0]},${P.A[1]} L233,${P.A[1]}`, stroke: C.yellow, "stroke-width": 1.6, fill: "none" }, gWire);
      S("path", { d: `M297,${P.B[1]} L${P.B[0]},${P.B[1]}`, stroke: C.yellow, "stroke-width": 1.6, fill: "none" }, gWire);
      const meter = S("circle", { cx: 265, cy: 165, r: 32, fill: "#1a1f14", stroke: C.yellow, "stroke-width": 2 }, gWire);
      txt(265, 152, "V_out", C.dim, 11);
      const tOut = txt(265, 172, "", C.yellow, 13.5);
      // resistors on the four edges
      const edges = [["R1", P.T, P.A], ["R2", P.A, P.G], ["R3", P.T, P.B], ["R4", P.B, P.G]];
      const resEls = edges.map(([name, a, b]) => {
        const path = S("path", { fill: "none", "stroke-width": 2.6, "stroke-linejoin": "round" }, gRes);
        const dx = b[0] - a[0], dy = b[1] - a[1], Lr = Math.hypot(dx, dy), ux = dx / Lr, uy = dy / Lr, nx = -uy, ny = ux;
        let d = `M${a[0]},${a[1]}`;
        for (let k = 0; k <= 12; k++) {
          const f = 0.25 + (0.5 * k) / 12, off = k === 0 || k === 12 ? 0 : (k % 2 ? 9 : -9);
          d += ` L${a[0] + dx * f + nx * off},${a[1] + dy * f + ny * off}`;
        }
        d += ` L${b[0]},${b[1]}`;
        path.setAttribute("d", d);
        const side = name === "R1" || name === "R2" ? -1 : 1;
        const lx = (a[0] + b[0]) / 2 + side * 52, ly = (a[1] + b[1]) / 2 + (name === "R1" || name === "R3" ? -10 : 10);
        return { path, lab: txt(lx, ly, "", C.text, 12.5), arr: txt(lx, ly + 16, "", C.blue, 12.5) };
      });
      const nodeA = txt(P.A[0] - 8, P.A[1] - 14, "", C.text, 12.5, "end"), nodeB = txt(P.B[0] + 8, P.B[1] - 14, "", C.text, 12.5, "start");
      [P.T, P.A, P.B, P.G].forEach((p) => S("circle", { cx: p[0], cy: p[1], r: 4.5, fill: C.teal }, gTxt));
      txt(P.T[0] + 26, P.T[1] - 4, "+V_ex", C.teal, 12);
      txt(P.G[0] + 22, P.G[1] + 10, "0 V", C.teal, 12);
      const hiL = S("path", { d: `M${P.T[0]},${P.T[1]} L${P.A[0]},${P.A[1]} L${P.G[0]},${P.G[1]}`, fill: "none", stroke: C.yellow, "stroke-width": 12, opacity: 0, "stroke-linejoin": "round" }, gHi);
      const hiR = S("path", { d: `M${P.T[0]},${P.T[1]} L${P.B[0]},${P.B[1]} L${P.G[0]},${P.G[1]}`, fill: "none", stroke: C.yellow, "stroke-width": 12, opacity: 0, "stroke-linejoin": "round" }, gHi);
      // the mini chart: V_out vs ΔR/R
      let ch, lnApprox, lnExact, dNow, chMode = 0;
      function makeChart() {
        right.innerHTML = "";
        const yl = (mode * 300) / 4 * 1.15;
        ch = chart(right, { w: 300, h: 330, xr: [-30, 30], yr: [-yl, yl], xlabel: "ΔR/R (%)", ylabel: "V_out / V_ex (mV/V)", ml: 50, mb: 38 });
        lnApprox = ch.line(C.green, 1.6, "5 4"); lnExact = ch.line(C.yellow, 2.6); dNow = ch.dot(C.yellow, 5); chMode = mode;
      }
      const resist = () => {
        const a = theta, R = [1 + a, 1 + a, 1, 1];          // R1..R4 relative, drift θ only on active arms (set below)
        R[0] = 1; R[1] = 1; R[2] = 1; R[3] = 1;
        if (mode >= 1) R[1] = 1 + x + theta;
        if (mode >= 2) R[0] = 1 - x + theta;
        if (mode >= 4) { R[2] = 1 + x + theta; R[3] = 1 - x + theta; }
        return R;
      };
      const vout = (xx, th) => {
        const R = [1, 1 + xx + th, 1, 1];
        if (mode >= 2) R[0] = 1 - xx + th;
        if (mode >= 4) { R[2] = 1 + xx + th; R[3] = 1 - xx + th; }
        return R[1] / (R[0] + R[1]) - R[3] / (R[2] + R[3]);
      };
      function draw() {
        const R = resist(), active = [mode >= 2, true, mode >= 4, mode >= 4], sign = [-1, 1, 1, -1];
        resEls.forEach((r, i) => {
          r.path.setAttribute("stroke", active[i] ? C.blue : C.teal);
          r.lab.textContent = `R${i + 1} = ${fmt(120 * R[i], 3)} Ω`;
          r.arr.textContent = active[i] ? (sign[i] > 0 ? "↑ +ΔR" : "↓ −ΔR") : "";
        });
        const VA = (vex * R[1]) / (R[0] + R[1]), VB = (vex * R[3]) / (R[2] + R[3]), vo = VA - VB;
        nodeA.textContent = "V_A " + VA.toFixed(4);
        nodeB.textContent = "V_B " + VB.toFixed(4);
        tVex.textContent = "V_ex = " + fmt(vex, 1) + " V";
        tOut.textContent = (Math.abs(vo) < 0.1 ? fmt(vo * 1000, 3) + " mV" : fmt(vo, 3) + " V");
        hiL.setAttribute("opacity", step === 0 ? 0.22 : 0);
        hiR.setAttribute("opacity", step === 1 ? 0.22 : 0);
        meter.setAttribute("stroke-width", step === 2 ? 4 : 2);
        const approx = (mode * x) / 4, ex = vout(x, theta);
        const ptsA = [], ptsE = [];
        if (chMode !== mode) makeChart();
        for (let p = -30; p <= 30.001; p += 0.5) { ptsA.push([p, (mode * p) * 2.5]); ptsE.push([p, 1000 * vout(p / 100, theta)]); }
        lnApprox.set(ptsA); lnExact.set(ptsE); dNow.set(x * 100, 1000 * ex);
        const name = { 1: "quarter", 2: "half", 4: "full" }[mode];
        ui.read.innerHTML =
          `<b>${name} bridge</b> · ΔR/R = ${fmt(x * 1e6, 0)} ppm (${fmt(x * 100, 3)}%)` + (theta ? ` · <span style="color:${C.red}">drift θ = +${fmt(theta * 1e6, 0)} ppm in every active arm</span>` : "") + `<br>` +
          `V_A − V_B = <span style="color:${C.yellow}">${fmt(ex * vex * 1000, 4)} mV exact</span> · small-signal ${mode === 1 ? "V_ex·x/4" : mode === 2 ? "V_ex·x/2" : "V_ex·x"} = ` +
          `<span style="color:${C.green}">${fmt(approx * vex * 1000, 4)} mV</span> · nonlinearity ${fmt(x ? (100 * (approx - ex)) / approx : 0, 3)}%`;
      }
      const bar = H("span", {}, ui.ctl);
      const mb = [[1, "quarter"], [2, "half"], [4, "full"]].map(([m, lab]) => {
        const b = H("button", { type: "button" }, bar, lab);
        b.style.marginRight = "4px";
        b.addEventListener("click", () => { mode = m; mark(); draw(); });
        return [m, b];
      });
      const mark = () => mb.forEach(([m, b]) => (b.style.borderColor = m === mode ? C.yellow : ""));
      const xs = ui.slider("ΔR/R", -30, 30, 0.025, x * 100, (v) => { x = v / 100; draw(); return fmt(v, 3) + " %"; });
      ui.slider("V_ex", 1, 10, 0.5, vex, (v) => { vex = v; draw(); return fmt(v, 1) + " V"; });
      const tb = ui.button("temperature drift: off", () => { theta = theta ? 0 : 100e-6; tb.textContent = "temperature drift: " + (theta ? "on" : "off"); draw(); });
      const setMode = (m) => { mode = m; mark(); };
      ui.steps([
        "Left divider: the same current flows through \\( R_1 \\) and \\( R_2 \\), so \\( V_A=V_{\\text{ex}}\\,\\dfrac{R_2}{R_1+R_2} \\).",
        "Right divider: \\( V_B=V_{\\text{ex}}\\,\\dfrac{R_4}{R_3+R_4} \\).",
        "The meter reads the difference \\( V_{\\text{out}}=V_A-V_B \\). It is zero when \\( R_1/R_2=R_3/R_4 \\), for any \\( V_{\\text{ex}} \\): a perfect null to compare against.",
        "Quarter bridge, \\( R_2=R(1+x) \\): \\( V_{\\text{out}}=V_{\\text{ex}}\\Big(\\dfrac{1+x}{2+x}-\\dfrac12\\Big)=V_{\\text{ex}}\\dfrac{x}{2(2+x)}\\approx\\dfrac{V_{\\text{ex}}}{4}x \\).",
        "Half bridge, \\( R_1=R(1-x) \\), \\( R_2=R(1+x) \\): \\( V_A=V_{\\text{ex}}(1+x)/2 \\), so \\( V_{\\text{out}}=\\dfrac{V_{\\text{ex}}}{2}x \\) exactly: twice the signal and a straight line.",
        "Full bridge, also \\( R_3=R(1+x) \\), \\( R_4=R(1-x) \\): \\( V_{\\text{out}}=V_{\\text{ex}}\\,x \\) exactly, four times the quarter bridge.",
        "Temperature: add the same \\( \\theta \\) to every active arm. Full: \\( V_{\\text{out}}=V_{\\text{ex}}\\,x/(1+\\theta) \\), no offset. Switch to quarter to see the drift appear as a fake signal.",
      ], (i) => {
        step = i;
        if (i === 3) setMode(1);
        if (i === 4) setMode(2);
        if (i === 5) setMode(4);
        if (i === 6) { setMode(4); theta = 100e-6; tb.textContent = "temperature drift: on"; }
        if (i < 6 && theta) { theta = 0; tb.textContent = "temperature drift: off"; }
        if (i >= 3 && Math.abs(x) > 0.02) { xs.set(0.075); }
        draw();
      });
      mark();
      draw();
    },
  });

  // ═════════════════ a2-rt-curves: platinum RTD vs NTC thermistor, and self-heating ═════════════════
  register("a2-rt-curves", {
    title: "R(T) · platinum RTD vs NTC thermistor, and the cost of reading them",
    target: "After this you can compare the sensitivity of an RTD and a thermistor at any temperature, and estimate the self-heating error of the measuring current.",
    caption: "resistance relative to its 25 °C value, on a log scale. The platinum Pt100 (gold, dashed) is an almost flat straight line: +0.385 Ω per K. The 10 kΩ NTC (gold, solid) falls by a factor of ~10 over 80 K; β sets how steep. The green tangent is the local coefficient (1/R)dR/dT. Raise the divider voltage: the thermistor heats itself (red) by P/δ.",
    links: [
      { id: "A1", why: "the bead's thermal lag is the first-order τ" },
      { id: "A7", why: "the divider voltage then goes to an ADC" },
      { id: "A8", why: "self-heating is a bias; calibration can only partly remove it" },
    ],
    build(fig, ui) {
      let beta = 3950, Top = 25, vex = 3.3;
      const T0 = 298.15, DELTA = 2e-3;
      const ntc = (Tc) => Math.exp(beta * (1 / (Tc + 273.15) - 1 / T0));
      const pt = (Tc) => (1 + 0.00385 * Tc) / (1 + 0.00385 * 25);
      const ch = chart(ui.body, { xr: [-20, 100], yr: [0.1, 10], logy: true, xlabel: "temperature T (°C)", ylabel: "R / R(25 °C)", h: 300 });
      const lPt = ch.line(C.gold, 2.4, "7 4"), lN = ch.line(C.gold, 3), tan = ch.line(C.green, 2), dN = ch.dot(C.gold, 5.5), dS = ch.dot(C.red, 5), vl = ch.vline(C.dim);
      const labN = ch.label(C.gold, 12.5), labP = ch.label(C.gold, 12.5);
      function draw() {
        const a = [], b = [];
        for (let T = -20; T <= 100.01; T += 1) { a.push([T, pt(T)]); b.push([T, ntc(T)]); }
        lPt.set(a); lN.set(b);
        labN.set(-17, Math.min(9, ntc(-17)) * 0.8, "NTC 10 kΩ, β = " + beta);
        labP.set(62, 1.6, "Pt100");
        const Rn = 10e3 * ntc(Top), alphaN = -beta / (Top + 273.15) ** 2;
        const t1 = Top - 15, t2 = Top + 15;
        tan.set([[t1, ntc(Top) * Math.exp(alphaN * (t1 - Top))], [t2, ntc(Top) * Math.exp(alphaN * (t2 - Top))]]);
        dN.set(Top, ntc(Top)); vl.set(Top);
        const I = vex / (Rn + 10e3), P = I * I * Rn, dT = P / DELTA;
        dS.set(Top + dT * 10, ntc(Top + dT));
        const sens = (vex * 10e3 * Rn) / (Rn + 10e3) ** 2 * Math.abs(alphaN);
        ui.read.innerHTML =
          `T = ${fmt(Top, 0)} °C · <span style="color:${C.gold}">NTC ${fmt(Rn, 0)} Ω, (1/R)dR/dT = ${fmt(alphaN * 100, 2)} %/K</span> · ` +
          `<span style="color:${C.gold}">Pt100 ${fmt(100 * (1 + 0.00385 * Top), 2)} Ω, +${fmt((100 * 0.00385) / (1 + 0.00385 * Top), 3)} %/K</span> → NTC is ${fmt(Math.abs(alphaN) / (0.00385 / (1 + 0.00385 * Top)), 1)}× steeper<br>` +
          `10 kΩ divider at ${fmt(vex, 1)} V: <span style="color:${C.yellow}">${fmt(sens * 1000, 1)} mV/K</span> · bead current ${fmt(I * 1000, 3)} mA, P = ${fmt(P * 1000, 3)} mW → ` +
          `<span style="color:${C.red}">self-heating ${fmt(dT * 1000, 0)} mK</span> (δ = 2 mW/K; red dot shows it ×10)`;
      }
      ui.slider("β", 3000, 4500, 50, beta, (v) => { beta = v; draw(); return v + " K"; });
      ui.slider("temperature", -10, 90, 1, Top, (v) => { Top = v; draw(); return v + " °C"; });
      ui.slider("divider V_ex", 0.5, 5, 0.1, vex, (v) => { vex = v; draw(); return fmt(v, 1) + " V"; });
    },
  });
})();
