/* C2 — pressure-driven flow and hydraulic circuits: widgets for docs/C2-pressure-driven-flow-and-hydraulic-circuits.md */
(function () {
  "use strict";
  const { register, C, scene3d, chart, ramp, fmt, loop, mix, S, H } = VIZ;

  const DRAG = mix(C.purple, "#ffffff", 0.35);   // wall drag (a mechanical force, lighter purple)
  const UL_MIN = 1e-9 / 60;                       // 1 µL/min in m³/s
  const sci = (x, d) => {
    if (x === 0) return "0";
    const e = Math.floor(Math.log10(Math.abs(x)));
    if (e >= -2 && e <= 4) return fmt(x, Math.max(0, (d === undefined ? 2 : d) - Math.max(0, e)));
    const m = x / Math.pow(10, e);
    return `${fmt(m, 2)}×10${String(e).replace("-", "⁻").replace(/\d/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+c])}`;
  };
  // hydraulic resistances (SI)
  const Rcirc = (mu, L, R) => (8 * mu * L) / (Math.PI * Math.pow(R, 4));
  const Rrect = (mu, L, w, h) => (12 * mu * L) / (w * h * h * h * (1 - (0.63 * h) / w));
  function RrectExact(mu, L, w, h) {
    let s = 0;
    for (let n = 1; n < 60; n += 2) s += Math.tanh((n * Math.PI * w) / (2 * h)) / Math.pow(n, 5);
    return (12 * mu * L) / (w * h * h * h * (1 - ((192 * h) / (Math.pow(Math.PI, 5) * w)) * s));
  }
  // exact velocity in a rectangle, z ∈ [0,h], y ∈ [-w/2, w/2] (Fourier series, Bruus ch. 4)
  function uRect(y, z, w, h, G, mu) {          // G = Δp/L
    let s = 0;
    for (let n = 1; n < 22; n += 2) {
      const a = (n * Math.PI * Math.abs(y)) / h, b = (n * Math.PI * w) / (2 * h);
      const ratio = Math.exp(a - b) * (1 + Math.exp(-2 * a)) / (1 + Math.exp(-2 * b));   // cosh(a)/cosh(b)
      s += (1 / (n * n * n)) * (1 - ratio) * Math.sin((n * Math.PI * z) / h);
    }
    return ((4 * h * h * G) / (Math.PI * Math.PI * Math.PI * mu)) * s;
  }

  // ════════════════════════ c2-poiseuille-3d: the velocity surface over a cross-section ════════════════════════
  register("c2-poiseuille-3d", {
    title: "3D · Poiseuille flow: the speed over the cross-section is a paraboloid, and Q ∝ r₀⁴",
    target: "After this you can derive u(r) = Δp(r₀²−r²)/(4μL) from a force balance, and predict that halving a tube's radius cuts the flow 16× (halving a flat channel's height, about 8×).",
    caption: "you look at the cross-section of a channel standing upright; the height of the surface above each point is the fluid speed there, so the volume under the surface is the flow rate Q. The wall is grey; the fluid touching it does not move (no-slip). The grey wire-frame is a reference channel (r₀ or h = 50 µm, Δp = 1 kPa, water): shrink the size and watch both the height (∝ r₀²) and the area (∝ r₀²) collapse. Step through the math to see the force balance on a fluid cylinder.",
    links: [
      { id: "C1", why: "at these Re ≪ 1 the flow is laminar, so the layers can be added like this" },
      { id: "B3", why: "the same 'height cubed' law as the stiffness of a beam, k ∝ wt³" },
      { id: "A2", why: "R_hyd plays the role of the resistor R in V = IR" },
      { id: "C5", why: "organ-chips set the wall shear stress τ_w with exactly this profile" },
    ],
    build(fig, ui) {
      let shape = "circle", dp = 1, size = 50, mu = 1, si = 0;
      const L = 0.01, W = 100;                         // channel length 1 cm, rectangle width 100 µm
      const KX = 0.03, KZ = 1.2 / 62.5, ZMAX = 3.4;    // units per µm; units per mm/s; clip
      function field() {
        const G = (dp * 1e3) / L, m = mu * 1e-3;
        if (shape === "circle") {
          const R = size * 1e-6;
          const umax = (dp * 1e3 * R * R) / (4 * m * L);
          const Q = (dp * 1e3) / Rcirc(m, L, R);
          return { umax, Q, Rh: Rcirc(m, L, R), Dh: 2 * R, area: Math.PI * R * R };
        }
        const w = W * 1e-6, h = size * 1e-6;
        const umax = uRect(0, h / 2, w, h, G, m);
        const RhE = RrectExact(m, L, w, h);
        return { umax, Q: (dp * 1e3) / RhE, Rh: RhE, RhA: Rrect(m, L, w, h), Dh: (2 * w * h) / (w + h), area: w * h };
      }
      const zOf = (u) => Math.min(ZMAX, u * 1e3 * KZ);
      const sc = scene3d(ui.body, {
        w: 640, h: 370, scale: 64, yaw: -0.65, pitch: 0.5, center: [0, 0, 0.55], dist: 15,
        draw(g) {
          const F = field(), m = mu * 1e-3, G = (dp * 1e3) / L;
          // floor grid and the channel wall below the section
          g.grid(-1.6, [-2.4, 2.4], [-2.4, 2.4], 0.6);
          if (shape === "circle") {
            const R = size * KX, Rm = size * 1e-6;
            g.cylinder([0, 0, -1.6], [0, 0, 0], R, C.silicon, 28, { open: true, alpha: 0.32, bias: -3 });
            // reference: 50 µm, 1 kPa, water (wire rings)
            const R0 = 50 * KX, u0 = (1e3 * 2.5e-9) / (4 * 1e-3 * L);
            for (let k = 0; k <= 4; k++) {
              const rr = (k / 4) * R0, zz = zOf(u0 * (1 - (k / 4) * (k / 4)));
              const pts = []; for (let j = 0; j <= 28; j++) { const th = (2 * Math.PI * j) / 28; pts.push([rr * Math.cos(th), rr * Math.sin(th), zz]); }
              g.polyline(pts, "#56606c", 1);
            }
            const ghost = si >= 1 && si <= 3;
            const uR = (r) => (G * (Rm * Rm - r * r)) / (4 * m);
            g.surface((a, b) => { const rr = a * R; return [rr * Math.cos(b), rr * Math.sin(b), zOf(uR(a * Rm))]; },
              [0, 1, 10], [0, 2 * Math.PI, 30],
              (x, y, z, a) => {
                const t = 1 - a * a;
                if (si === 4) return mix(C.green, "#ffffff", 0.15 * t);
                if (si === 5) return Math.floor(a * 10) % 2 ? ramp(t) : mix(ramp(t), "#000000", 0.35);
                return z >= ZMAX - 1e-6 ? C.red : ramp(t);
              }, { alpha: ghost ? 0.22 : 0.92 });
            // outline of the wall
            const ring = []; for (let j = 0; j <= 40; j++) { const th = (2 * Math.PI * j) / 40; ring.push([R * Math.cos(th), R * Math.sin(th), 0]); }
            g.polyline(ring, C.silicon, 3);
            if (si >= 1 && si <= 3) {
              const rf = 0.55, r = rf * R, ur = zOf(uR(rf * Rm));
              const disk = []; for (let j = 0; j < 24; j++) { const th = (2 * Math.PI * j) / 24; disk.push([r * Math.cos(th), r * Math.sin(th), 0.01]); }
              g.poly(disk, C.blue, { alpha: 0.45, shade: false });
              g.cylinder([0, 0, 0], [0, 0, ur], r, C.purple, 22, { open: true, alpha: 0.18 });
              [[0, 0], [0.5, 0.3], [-0.45, -0.35]].forEach(([a, b]) => g.arrow([a * r, b * r, -1.0], [a * r, b * r, -0.15], C.purple, 3));
              g.text([0, -r - 0.5, -1.2], "pressure push Δp·πr²", C.purple, 13);
              if (si >= 2) {
                for (let j = 0; j < 8; j++) {
                  const th = (2 * Math.PI * j) / 8, x = r * Math.cos(th), y = r * Math.sin(th);
                  g.arrow([x, y, ur * 0.85], [x, y, ur * 0.85 - 0.75], DRAG, 2.2);
                }
                g.text([r + 0.3, r + 0.5, ur + 0.3], "wall drag τ·2πrL", DRAG, 13, "start");
              }
              if (si >= 3) {
                const dzdr = (-G * 2 * rf * Rm) / (4 * m) * 1e3 * KZ * (Rm / R);   // dz per scene unit of r
                const x0 = r, z0 = ur;
                g.line([x0 - 0.7, 0, z0 - 0.7 * dzdr], [x0 + 0.7, 0, z0 + 0.7 * dzdr], C.green, 3);
                g.sphere([x0, 0, z0], 0.07, C.green);
                g.text([x0 + 0.9, 0, z0 + 0.5], "slope du/dr", C.green, 13, "start");
              }
            }
            if (si === 6) {
              const zm = zOf(F.umax / 2), disk = [];
              for (let j = 0; j < 28; j++) { const th = (2 * Math.PI * j) / 28; disk.push([R * Math.cos(th), R * Math.sin(th), zm]); }
              g.poly(disk, C.yellow, { alpha: 0.35, shade: false, stroke: C.yellow });
              g.text([R + 0.2, 0, zm], "mean = ½ max", C.yellow, 13, "start");
            }
            g.line([0, 0, 0], [0, 0, zOf(F.umax)], "#ffffff", 1.2, [4, 4]);
          } else {
            const hw = (W * KX) / 2, hh = (size * KX) / 2, w = W * 1e-6, h = size * 1e-6;
            g.box([-hw - 0.12, -hh - 0.12, -1.6], [hw + 0.12, -hh, 0], C.silicon, { alpha: 0.3, bias: -3 });
            g.box([-hw - 0.12, hh, -1.6], [hw + 0.12, hh + 0.12, 0], C.silicon, { alpha: 0.3, bias: -3 });
            const hh0 = 25 * KX;
            [-1, -0.5, 0, 0.5, 1].forEach((f) => {
              const pts = []; for (let j = 0; j <= 16; j++) { const yy = -hw + (2 * hw * j) / 16; pts.push([yy, f * hh0, zOf(uRect(yy / KX * 1e-6, (f + 1) * 25e-6, w, 50e-6, 1e3 / L, 1e-3))]); }
              g.polyline(pts, "#56606c", 1);
            });
            g.surface((a, b) => [a * hw, b * hh, zOf(uRect(a * w / 2, (b + 1) * h / 2, w, h, G, m))],
              [-1, 1, 22], [-1, 1, 12],
              (x, y, z, a, b) => z >= ZMAX - 1e-6 ? C.red : ramp(Math.min(1, z / Math.max(1e-9, zOf(F.umax)))), { alpha: 0.92 });
            g.polyline([[-hw, -hh, 0], [hw, -hh, 0], [hw, hh, 0], [-hw, hh, 0], [-hw, -hh, 0]], C.silicon, 3);
            g.text([0, -hh - 0.45, 0], `w = ${W} µm`, C.dim, 12);
            g.text([hw + 0.45, 0, 0], `h = ${size} µm`, C.dim, 12, "start");
          }
          g.arrow([-2.7, 2.2, -1.6], [-2.7, 2.2, 1.3], C.water, 2);
          g.text([-2.7, 2.2, 1.6], "u (flow)", C.water, 13);
        },
      });
      function read() {
        const F = field(), re = (1000 * (F.Q / F.area) * F.Dh) / (mu * 1e-3);
        let s = `<b style="color:${C.yellow}">Q = ${fmt(F.Q / UL_MIN, 2)} µL/min</b> · u<sub>max</sub> = ${fmt(F.umax * 1e3, 1)} mm/s · mean = ${fmt((F.Q / F.area) * 1e3, 1)} mm/s` +
          ` (= ${fmt(F.Q / F.area / F.umax, 3)} × max) · Re = ${sci(re, 2)}<br>R<sub>hyd</sub> = ${sci(F.Rh, 3)} Pa·s/m³ for L = 1 cm`;
        if (shape === "rect") s += ` · formula 12μL/(wh³(1−0.63h/w)) gives ${sci(F.RhA, 3)} (${fmt(100 * (F.RhA / F.Rh - 1), 2)} % off)`;
        const ref = shape === "circle" ? (1e3) / Rcirc(1e-3, L, 50e-6) : 1e3 / RrectExact(1e-3, L, 100e-6, 50e-6);
        s += `<br>flow vs the wire-frame reference: <b>×${fmt(F.Q / ref, 3)}</b>`;
        if (zOf(F.umax) >= ZMAX - 1e-6) s += ` · <span style="color:${C.red}">surface clipped (red) — too fast to draw</span>`;
        ui.read.innerHTML = s;
      }
      const upd = () => { read(); sc.render(); };
      ui.button("circular tube", () => { shape = "circle"; upd(); });
      ui.button("rectangular channel (w = 100 µm)", () => { shape = "rect"; upd(); });
      ui.slider("Δp", 0.2, 2, 0.1, dp, (v) => { dp = v; upd(); return fmt(v, 1) + " kPa"; });
      ui.slider("r₀ or h", 10, 70, 5, size, (v) => { size = v; upd(); return v + " µm"; });
      ui.slider("μ", 1, 10, 0.5, mu, (v) => { mu = v; upd(); return fmt(v, 1) + " mPa·s"; });
      ui.steps([
        "<b>The picture.</b> Height = speed \\( u \\) at each point of the cross-section. At the wall \\( u=0 \\) (no-slip); the centre is fastest. Volume under the surface = flow rate \\( Q \\).",
        "<b>Cut out a fluid cylinder</b> of radius \\( r \\) and length \\( L \\) (blue disk). The pressure difference pushes on its end: \\( F_{\\text{push}}=\\Delta p\\,\\pi r^2 \\).",
        "<b>Its side is rubbed</b> by the slower fluid outside it. Shear stress \\( \\mu\\,\\lvert du/dr\\rvert \\) over the side area \\( 2\\pi rL \\): \\( F_{\\text{drag}}=-\\mu\\dfrac{du}{dr}\\,2\\pi rL \\).",
        "<b>Steady flow: forces balance.</b> \\( \\Delta p\\,\\pi r^2=-\\mu\\dfrac{du}{dr}2\\pi rL \\Rightarrow \\dfrac{du}{dr}=-\\dfrac{\\Delta p\\,r}{2\\mu L} \\): the slope grows linearly with \\( r \\).",
        "<b>Integrate</b> from the wall, where \\( u(r_0)=0 \\): \\( u(r)=\\dfrac{\\Delta p}{4\\mu L}\\,(r_0^2-r^2) \\), a paraboloid with \\( u_{\\max}=\\Delta p\\,r_0^2/(4\\mu L) \\).",
        "<b>Add up rings</b> of area \\( 2\\pi r\\,dr \\): \\( Q=\\displaystyle\\int_0^{r_0} u\\,2\\pi r\\,dr=\\dfrac{\\pi r_0^4\\,\\Delta p}{8\\mu L} \\). One \\( r_0^2 \\) from the height, one from the area.",
        "<b>Mean speed</b> \\( \\bar u=Q/\\pi r_0^2=\\tfrac12u_{\\max} \\) (yellow lid). Ohm's law for fluids: \\( \\Delta p=R_{\\text{hyd}}Q \\) with \\( R_{\\text{hyd}}=\\dfrac{8\\mu L}{\\pi r_0^4} \\).",
      ], (i) => { si = i; if (i > 0) shape = "circle"; upd(); });
      upd();
    },
  });

  // ════════════════════════ c2-circuit: a hydraulic network and its electrical twin ════════════════════════
  register("c2-circuit", {
    title: "A chip as a circuit · Δp = Q R_hyd, side by side with V = I R",
    target: "After this you can find the pressure at every junction and the flow in every branch of a microfluidic network, using series and parallel rules exactly as for resistors.",
    caption: "top: a chip seen from above, with an inlet (left), one channel R₁, two parallel serpentines R₂ and R₃ (each twice as long), and R₄ to the outlet. Dots move at the mean speed in each channel; node colours show pressure. Bottom: the same network as an electrical circuit (1 kPa ↔ 1 V, 1 µL/min ↔ 1 µA, so R in MΩ). Close the valve, or make branch 3 shallower, and see the flow redistribute. A pressure controller is a voltage source; a syringe pump is a current source.",
    links: [
      { id: "A2", why: "the Wheatstone bridge is the same network, and the same algebra" },
      { id: "A7", why: "voltage dividers and RC filters: the electrical originals of these rules" },
      { id: "C5", why: "real lab-chips are designed as hydraulic circuits before they are made" },
      { id: "B2", why: "the channel height is set by the etch or mould depth, and R ∝ 1/h³ makes it critical" },
    ],
    build(fig, ui) {
      let mode = "p", pin = 5, qset = 10, h3 = 50, valve = true;
      const mu = 1e-3, w = 100e-6;
      const svg = S("svg", { viewBox: "0 0 640 410", role: "img", "aria-label": "hydraulic network and electrical analogue" }, ui.body);
      const T = (x, y, str, col, size, anc, parent) => { const e = S("text", { x, y, fill: col || C.text, "font-size": size || 12.5, "text-anchor": anc || "middle", "dominant-baseline": "middle", "font-family": "var(--font-mono, monospace)", "paint-order": "stroke", stroke: C.bg, "stroke-width": 3 }, parent || svg); e.textContent = str; return e; };
      S("rect", { x: 8, y: 8, width: 624, height: 200, rx: 10, fill: "#151b22", stroke: "#2a333e" }, svg);
      T(20, 22, "the chip (top view)", C.dim, 11.5, "start");
      S("rect", { x: 8, y: 218, width: 624, height: 184, rx: 10, fill: "#121a1a", stroke: "#24403b" }, svg);
      T(20, 232, "its electrical twin", C.dim, 11.5, "start");
      // channel paths (chip)
      const serp = (y0, dir) => {
        let d = `M200,105 L240,${y0}`;
        for (let k = 0; k < 7; k++) { const x = 250 + k * 25; d += ` L${x},${y0} L${x},${y0 + dir * 30} L${x + 12.5},${y0 + dir * 30} L${x + 12.5},${y0}`; }
        return d + ` L420,${y0} L440,105`;
      };
      const paths = { R1: "M58,105 L200,105", R2: serp(70, -1), R3: serp(140, 1), R4: "M440,105 L582,105" };
      const gCh = S("g", {}, svg), gDots = S("g", {}, svg), gTop = S("g", {}, svg);
      const ch = {};
      Object.keys(paths).forEach((k) => {
        ch[k] = S("path", { d: paths[k], fill: "none", stroke: C.water, "stroke-opacity": 0.45, "stroke-width": 9, "stroke-linejoin": "round", "stroke-linecap": "round" }, gCh);
      });
      const valveEl = S("rect", { x: 224, y: 114, width: 16, height: 16, rx: 3, fill: C.red, transform: "rotate(-60 232 122)" }, gTop);
      const resIn = S("circle", { cx: 42, cy: 105, r: 17, stroke: C.text, "stroke-width": 1.5 }, gTop);
      const resOut = S("circle", { cx: 598, cy: 105, r: 17, stroke: C.text, "stroke-width": 1.5 }, gTop);
      const nodeA = S("circle", { cx: 200, cy: 105, r: 8, stroke: C.text, "stroke-width": 1.5 }, gTop);
      const nodeB = S("circle", { cx: 440, cy: 105, r: 8, stroke: C.text, "stroke-width": 1.5 }, gTop);
      const tIn = T(42, 140, "", C.text, 12), tA = T(194, 130, "", C.text, 12, "end"), tB = T(446, 130, "", C.text, 12, "start");
      T(598, 140, "p = 0", C.text, 12);
      const tQ = { R1: T(129, 72, "", C.water, 12), R2: T(330, 26, "", C.water, 12), R3: T(330, 190, "", C.water, 12), R4: T(511, 72, "", C.water, 12) };
      const tR = { R1: T(129, 88, "", C.dim, 11), R4: T(511, 88, "", C.dim, 11) };
      // moving dots
      const dots = [];
      Object.keys(paths).forEach((k) => {
        const len = ch[k].getTotalLength ? ch[k].getTotalLength() : 200;
        const n = Math.max(4, Math.round(len / 28));
        for (let i = 0; i < n; i++) dots.push({ k, s: (i / n) * len, len, el: S("circle", { r: 2.6, fill: "#e8f0ff" }, gDots) });
      });
      // electrical twin
      const E = S("g", { stroke: C.teal, "stroke-width": 2, fill: "none" }, svg);
      const zig = (x0, y, x1) => { let d = `M${x0},${y} L${x0 + 10},${y}`; const n = 6, dx = (x1 - x0 - 20) / n; for (let i = 0; i < n; i++) d += ` L${x0 + 10 + dx * (i + 0.5)},${y + (i % 2 ? 7 : -7)}`; return d + ` L${x1 - 10},${y} L${x1},${y}`; };
      S("path", { d: `M70,${300} L70,270 L110,270` }, E);
      S("path", { d: zig(110, 270, 200) }, E);
      S("path", { d: "M200,270 L230,270 L230,250 L270,250" }, E);
      S("path", { d: zig(270, 250, 400) }, E);
      S("path", { d: "M400,250 L440,250 L440,270" }, E);
      const e3a = S("path", { d: "M230,270 L230,300 L270,300" }, E);
      const e3 = S("path", { d: zig(270, 300, 400) }, E);
      const e3b = S("path", { d: "M400,300 L440,300 L440,270" }, E);
      S("path", { d: "M440,270 L470,270" }, E);
      S("path", { d: zig(470, 270, 560) }, E);
      S("path", { d: "M560,270 L590,270 L590,350 M578,350 L602,350 M582,356 L598,356 M587,362 L593,362" }, E);
      S("path", { d: "M70,340 L70,370 L590,370 L590,362" }, E);
      // source symbol: battery (pressure controller) or circle with arrow (syringe pump = current source)
      const bat = S("g", {}, svg);
      S("line", { x1: 56, y1: 300, x2: 84, y2: 300, stroke: C.teal, "stroke-width": 3 }, bat);
      S("line", { x1: 62, y1: 310, x2: 78, y2: 310, stroke: C.teal, "stroke-width": 3 }, bat);
      S("line", { x1: 70, y1: 310, x2: 70, y2: 340, stroke: C.teal, "stroke-width": 2 }, bat);
      const cur = S("g", {}, svg);
      S("circle", { cx: 70, cy: 320, r: 16, fill: "none", stroke: C.teal, "stroke-width": 2 }, cur);
      S("path", { d: "M70,331 L70,309 M64,315 L70,308 L76,315", fill: "none", stroke: C.teal, "stroke-width": 2 }, cur);
      S("line", { x1: 70, y1: 300, x2: 70, y2: 304, stroke: C.teal, "stroke-width": 2 }, cur);
      S("line", { x1: 70, y1: 336, x2: 70, y2: 340, stroke: C.teal, "stroke-width": 2 }, cur);
      const eV = T(105, 320, "", C.teal, 12, "start"), eA = T(176, 290, "", C.teal, 11.5), eB = T(440, 232, "", C.teal, 11.5);
      const eR = { R1: T(155, 252, "", C.teal, 11), R2: T(335, 233, "", C.teal, 11), R3: T(335, 320, "", C.teal, 11), R4: T(515, 252, "", C.teal, 11) };
      const eI = T(330, 388, "", C.teal, 11.5);
      let sol = null;
      function solve() {
        const R1 = Rrect(mu, 0.01, w, 50e-6), R2 = Rrect(mu, 0.02, w, 50e-6), R3 = Rrect(mu, 0.02, w, h3 * 1e-6), R4 = R1;
        const Rp = valve ? 1 / (1 / R2 + 1 / R3) : R2;
        const Rt = R1 + Rp + R4;
        let Q, P;
        if (mode === "p") { P = pin * 1e3; Q = P / Rt; } else { Q = qset * UL_MIN; P = Q * Rt; }
        const pA = P - Q * R1, pB = Q * R4;
        const Q2 = (pA - pB) / R2, Q3 = valve ? (pA - pB) / R3 : 0;
        sol = { R1, R2, R3, R4, Rt, Q, P, pA, pB, Q2, Q3 };
        return sol;
      }
      const toMO = (R) => R * UL_MIN / 1e3;    // kPa per µL/min = MΩ in the analogy
      function draw() {
        const s = solve(), pmax = Math.max(s.P, 1);
        const col = (p) => { const c = ramp(0.15 + 0.85 * p / pmax); return `rgb(${c.map(Math.round).join(",")})`; };
        resIn.setAttribute("fill", col(s.P)); nodeA.setAttribute("fill", col(s.pA)); nodeB.setAttribute("fill", col(s.pB));
        resOut.setAttribute("fill", col(0));
        tIn.textContent = `p_in ${fmt(s.P / 1e3, 2)} kPa`;
        tA.textContent = `p_A = ${fmt(s.pA / 1e3, 2)} kPa`; tB.textContent = `p_B = ${fmt(s.pB / 1e3, 2)} kPa`;
        tQ.R1.textContent = `Q ${fmt(s.Q / UL_MIN, 2)} µL/min`; tQ.R4.textContent = `Q ${fmt(s.Q / UL_MIN, 2)} µL/min`;
        tQ.R2.textContent = `R₂: Q₂ = ${fmt(s.Q2 / UL_MIN, 2)} µL/min`;
        tQ.R3.textContent = valve ? `R₃ (h = ${h3} µm): Q₃ = ${fmt(s.Q3 / UL_MIN, 2)} µL/min` : "R₃: valve closed, Q₃ = 0";
        tR.R1.textContent = `R₁ = ${sci(s.R1, 2)}`; tR.R4.textContent = `R₄ = ${sci(s.R4, 2)}`;
        ch.R3.setAttribute("stroke-width", Math.max(2.5, (9 * h3) / 50));
        ch.R3.setAttribute("stroke-opacity", valve ? 0.45 : 0.15);
        valveEl.setAttribute("visibility", valve ? "hidden" : "visible");
        [e3a, e3, e3b].forEach((e) => { e.setAttribute("stroke-dasharray", valve ? "" : "4 5"); e.setAttribute("opacity", valve ? 1 : 0.4); });
        bat.setAttribute("visibility", mode === "p" ? "visible" : "hidden");
        cur.setAttribute("visibility", mode === "p" ? "hidden" : "visible");
        eV.textContent = mode === "p" ? `V = ${fmt(s.P / 1e3, 2)} V (set)` : `I = ${fmt(s.Q / UL_MIN, 2)} µA (set)`;
        eA.textContent = `V_A ${fmt(s.pA / 1e3, 2)} V`; eB.textContent = `V_B ${fmt(s.pB / 1e3, 2)} V`;
        eR.R1.textContent = `${fmt(toMO(s.R1), 3)} MΩ`; eR.R4.textContent = `${fmt(toMO(s.R4), 3)} MΩ`;
        eR.R2.textContent = `${fmt(toMO(s.R2), 3)} MΩ`; eR.R3.textContent = valve ? `${fmt(toMO(s.R3), 3)} MΩ` : "open circuit";
        eI.textContent = `I = ${fmt(s.Q / UL_MIN, 2)} µA,  I₂ = ${fmt(s.Q2 / UL_MIN, 2)} µA,  I₃ = ${fmt(s.Q3 / UL_MIN, 2)} µA`;
        ui.read.innerHTML = `total R<sub>hyd</sub> = R₁ + (R₂ ∥ R₃) + R₄ = <b>${sci(s.Rt, 3)} Pa·s/m³</b> (${fmt(toMO(s.Rt), 3)} MΩ in the twin) · ` +
          `<b style="color:${C.yellow}">Q = ${fmt(s.Q / UL_MIN, 2)} µL/min at p_in = ${fmt(s.P / 1e3, 2)} kPa</b><br>` +
          `R in units of Pa·s/m³ for 100 µm-wide channels, h = 50 µm, L = 1 cm (R₁, R₄) and 2 cm (R₂, R₃) · ` +
          `${mode === "p" ? "pressure controller: p_in fixed, Q follows" : "syringe pump: Q fixed, p_in follows"}`;
      }
      ui.button("pressure controller", () => { mode = "p"; slP.input.disabled = false; slQ.input.disabled = true; draw(); });
      ui.button("syringe pump", () => { mode = "q"; slP.input.disabled = true; slQ.input.disabled = false; draw(); });
      const slP = ui.slider("p_in", 0.5, 10, 0.5, pin, (v) => { pin = v; if (sol) draw(); return fmt(v, 1) + " kPa"; });
      const slQ = ui.slider("Q", 1, 30, 1, qset, (v) => { qset = v; if (sol) draw(); return v + " µL/min"; });
      slQ.input.disabled = true;
      ui.slider("h of branch 3", 20, 60, 5, h3, (v) => { h3 = v; if (sol) draw(); return v + " µm"; });
      ui.button("open / close valve on R₃", () => { valve = !valve; draw(); });
      draw();
      // flow animation: dots move at the mean speed U = Q/(w h) in each channel (slowed down 6×)
      const speed = (k) => {
        const s = sol, h = k === "R3" ? h3 * 1e-6 : 50e-6, Q = k === "R2" ? s.Q2 : k === "R3" ? s.Q3 : s.Q;
        return ((Q / (w * h)) * 1e3) * 6;     // mm/s × 6 px per (mm/s)
      };
      function place() {
        dots.forEach((d) => {
          if (!ch[d.k].getPointAtLength) return;
          const p = ch[d.k].getPointAtLength(d.s);
          d.el.setAttribute("cx", p.x); d.el.setAttribute("cy", p.y);
          d.el.setAttribute("visibility", d.k === "R3" && !valve ? "hidden" : "visible");
        });
      }
      place();
      if (!VIZ.reduceMotion) loop(svg, (t, dt) => { dt = Math.max(0, dt); dots.forEach((d) => { d.s = (d.s + speed(d.k) * dt) % d.len; }); place(); });
    },
  });

  // ════════════════════════ c2-compliance: the RC time constant of a soft chip ════════════════════════
  register("c2-compliance", {
    title: "Compliance is capacitance · a syringe pump, a bubble and the RC time constant",
    target: "After this you can estimate how long a chip takes to reach its set flow (τ = R_hyd C_hyd) and why a small air bubble makes a syringe pump sluggish.",
    caption: "a syringe pump starts at t = 0. Soft PDMS, tubing and especially air bubbles store volume when the pressure rises (C_hyd = dV/dp), so at first the pump fills them instead of pushing liquid through the chip. The flow out of the chip rises as 1 − e^(−t/τ), exactly like the voltage on a capacitor charging through a resistor. Shallower channels (bigger R) and bigger bubbles both slow it down.",
    links: [
      { id: "A7", why: "the same first-order RC lag, τ = RC, that sets a filter's cutoff" },
      { id: "B5", why: "a pressure sensor membrane is also a compliance" },
      { id: "C5", why: "integrated chips add deliberate compliances as flow-smoothing capacitors" },
    ],
    build(fig, ui) {
      let vb = 10, hh = 50;
      const ch = chart(ui.body, { w: 640, h: 270, xr: [0, 30], yr: [0, 1.15], xlabel: "time after the pump starts (s)", ylabel: "Q_out / Q_set" });
      const ref = ch.line(C.green, 2, "6 4"), out = ch.line(C.water, 3), tauL = ch.vline(C.yellow), lab = ch.label(C.yellow, 12.5), set1 = ch.hline(C.dim, "3 4");
      set1.set(1);
      const lab2 = ch.label(C.green, 12);
      function upd() {
        const R1 = Rrect(1e-3, 0.01, 100e-6, hh * 1e-6), Rt = 3 * R1;   // three 1-cm channels in series
        const Ct = 1e-14 + (vb * 1e-9) / 1e5;                           // tubing 1 µL/bar + bubble V/p (isothermal)
        const tau = Rt * Ct, tau0 = Rt * 1e-14;
        const pts = [], p0 = [];
        for (let i = 0; i <= 200; i++) { const t = (30 * i) / 200; pts.push([t, 1 - Math.exp(-t / tau)]); p0.push([t, 1 - Math.exp(-t / tau0)]); }
        out.set(pts); ref.set(p0);
        tauL.set(Math.min(30, tau));
        lab.set(Math.min(26, tau) + 0.4, 0.3, `τ = ${fmt(tau, 2)} s`);
        lab2.set(1.2, 1.08, "no bubble (tubing only)");
        ui.read.innerHTML = `R<sub>hyd</sub> = ${sci(Rt, 3)} Pa·s/m³ (three 1-cm channels, 100 × ${hh} µm) · C<sub>hyd</sub> = ${sci(Ct, 2)} m³/Pa<br>` +
          `<b style="color:${C.yellow}">τ = R C = ${fmt(tau, 2)} s</b> · 99 % of the set flow after ${fmt(tau * Math.log(100), 1)} s · without the bubble τ = ${fmt(tau0, 2)} s`;
      }
      ui.slider("air bubble", 0, 20, 1, vb, (v) => { vb = v; upd(); return v + " µL"; });
      ui.slider("channel height h", 30, 80, 5, hh, (v) => { hh = v; upd(); return v + " µm"; });
      upd();
    },
  });
})();
