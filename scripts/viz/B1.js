/* B1 — scaling laws: widgets for docs/B1-scaling-laws-why-small-is-different.md */
(function () {
  "use strict";
  const { register, C, ROLE, scene3d, chart, fmt, mix } = VIZ;
  // core.js sizes every <svg> in a figure to 100% width; keep MathJax's own SVGs (stepper math) at their natural size
  if (!document.getElementById("viz-mjx-fix")) {
    const st = document.createElement("style");
    st.id = "viz-mjx-fix";
    st.textContent = "figure.viz mjx-container svg { display: inline; width: auto; height: auto; }";
    document.head.appendChild(st);
  }

  // ── shared physics constants (same numbers as scripts/checks/B1_check.py) ──
  const G = 9.81, GAMMA = 0.072, RHO = 2330, EPS0 = 8.854e-12, MU0 = 4e-7 * Math.PI;
  const DTH = 149 / (2330 * 705), DGLU = 6.7e-10, VSI = Math.sqrt(169e9 / 2330), CF = (1.875104 ** 2) / (2 * Math.PI) / Math.sqrt(12);

  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  function sci(x, d) {
    if (!isFinite(x) || x === 0) return "0";
    const e = Math.floor(Math.log10(Math.abs(x)));
    if (e >= -2 && e <= 3) return fmt(x, d === undefined ? 3 : d);
    const m = x / Math.pow(10, e);
    return fmt(m, d === undefined ? 2 : d) + "×10" + String(e).split("").map((c) => SUP[c]).join("");
  }
  function lenStr(l) {
    if (l >= 1) return fmt(l, 2) + " m";
    if (l >= 1e-2) return fmt(l * 100, 2) + " cm";
    if (l >= 1e-3) return fmt(l * 1e3, 2) + " mm";
    if (l >= 1e-6) return fmt(l * 1e6, l < 1e-5 ? 2 : 0) + " µm";
    return fmt(l * 1e9, 0) + " nm";
  }
  function timeStr(t) {
    if (t < 1e-6) return fmt(t * 1e9, 1) + " ns";
    if (t < 1e-3) return fmt(t * 1e6, 1) + " µs";
    if (t < 1) return fmt(t * 1e3, 1) + " ms";
    if (t < 120) return fmt(t, 1) + " s";
    if (t < 7200) return fmt(t / 60, 1) + " min";
    if (t < 172800) return fmt(t / 3600, 1) + " h";
    return fmt(t / 86400, 1) + " days";
  }

  // ═════════════════ b1-cubes-3d: cut a cube, watch surface win ═════════════════
  register("b1-cubes-3d", {
    title: "3D · cut a cube into n³ pieces: the surface grows ×n, the weight of each piece falls ×n³",
    target: "After this you can explain with A/V = 6/ℓ why crushed ice, cells and MEMS parts are “all surface”, and predict when surface tension beats weight.",
    caption: "the grey faces are the original outside of the cube; the <span style='color:" + C.gold + "'>gold</span> faces are the new surface created by cutting. The piece pulled out on the right feels its weight (<span style='color:" + ROLE.mech + "'>purple</span>, ∝ ℓ³) and the pull of a water surface (<span style='color:" + ROLE.fluid + "'>blue</span>, ∝ ℓ); the arrows show each force's share of the tug-of-war. Slide the size down to 100 µm and the surface force takes over completely.",
    links: [
      { id: "C4", why: "surface tension and the capillary length, used to pump liquid without a pump" },
      { id: "C3", why: "large A/V is why molecules reach the walls of a microchannel so fast" },
      { id: "B3", why: "the same ℓ-counting gives the stiffness k ∝ ℓ and the mass m ∝ ℓ³ of a beam" },
      { id: "A2", why: "a small thermistor bead (large A/V) follows temperature quickly" },
    ],
    build(fig, ui) {
      let n = 3, lg = -2, step = 0;
      const SZ = 3;
      const sc = scene3d(ui.body, {
        w: 640, h: 380, scale: 54, yaw: -0.62, pitch: 0.38, center: [0.9, 0, 1.55],
        draw(g) {
          const cut = step >= 1 ? n : 1;
          const gap = step >= 1 ? 0.45 / n : 0;
          const s = SZ / cut;
          const off = (i) => -SZ / 2 + i * (s + gap) - ((cut - 1) * gap) / 2;
          const pull = step >= 3;
          for (let i = 0; i < cut; i++) for (let j = 0; j < cut; j++) for (let k = 0; k < cut; k++) {
            if (pull && i === cut - 1 && j === 0 && k === cut - 1 && cut > 1) continue;  // this one is pulled out
            const x0 = off(i), y0 = off(j), z0 = off(k) + SZ / 2;
            const x1 = x0 + s, y1 = y0 + s, z1 = z0 + s;
            const newCol = step >= 2 ? C.gold : C.silicon;
            const fc = (outer) => (outer ? C.silicon : newCol);
            const op = { stroke: C.bg, strokeAlpha: 0.7, strokeWidth: 0.7 };
            g.poly([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], fc(k === 0), op);
            g.poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], fc(k === cut - 1), op);
            g.poly([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], fc(j === 0), op);
            g.poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], fc(j === cut - 1), op);
            g.poly([[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]], fc(i === 0), op);
            g.poly([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], fc(i === cut - 1), op);
          }
          if (step === 0 && n > 1) {   // where the cuts will go
            const s0 = SZ / n, h = SZ / 2;
            for (let q = 1; q < n; q++) {
              const c = -h + q * s0;
              g.polyline([[c, -h - 0.01, 0], [c, -h - 0.01, SZ], [c, h, SZ + 0.01]], C.gold, 1.4, [5, 4]);
              g.polyline([[-h, -h - 0.01, c + h], [h + 0.01, -h - 0.01, c + h], [h + 0.01, h, c + h]], C.gold, 1.4, [5, 4]);
              g.polyline([[h + 0.01, c, 0], [h + 0.01, c, SZ], [-h, c, SZ + 0.01]], C.gold, 1.4, [5, 4]);
            }
          }
          g.text([0, -SZ / 2 - 0.5, -0.25], "side ℓ = " + lenStr(Math.pow(10, lg)), C.text, 13);
          if (pull) {
            // the pulled-out piece, drawn at true relative size, with the tug-of-war arrows
            const sp = SZ / n, cx = 3.6, cz = 2.0;
            const a = [cx - sp / 2, -sp / 2, cz - sp / 2], b = [cx + sp / 2, sp / 2, cz + sp / 2];
            g.box(a, b, n > 1 ? C.gold : C.silicon, { stroke: C.bg, strokeAlpha: 0.7, strokeWidth: 0.7 });
            const lp = Math.pow(10, lg) / n, Fg = RHO * G * lp ** 3, Fs = GAMMA * lp;
            const tot = 2.2, Lw = (tot * Fg) / (Fg + Fs), Ls = (tot * Fs) / (Fg + Fs);
            g.arrow([cx, 0, cz - sp / 2], [cx, 0, cz - sp / 2 - Math.max(0.05, Lw)], ROLE.mech, 4);
            g.arrow([cx, 0, cz + sp / 2], [cx, 0, cz + sp / 2 + Math.max(0.05, Ls)], ROLE.fluid, 4);
            g.text([cx + 0.15, 0, cz - sp / 2 - Math.max(0.05, Lw) - 0.25], "weight " + Math.round((100 * Fg) / (Fg + Fs)) + "%", ROLE.mech, 13);
            g.text([cx + 0.15, 0, cz + sp / 2 + Math.max(0.05, Ls) + 0.25], "surface " + Math.round((100 * Fs) / (Fg + Fs)) + "%", ROLE.fluid, 13);
            g.text([cx, 0, cz - sp / 2 - Math.max(0.05, Lw) - 0.6], "one piece, ℓ/n = " + lenStr(lp), C.text, 12);
          }
        },
      });
      sc.canvas.getContext("2d").lineJoin = "round";   // no miter spikes on outlined labels
      const read = () => {
        const l = Math.pow(10, lg), lp = l / n, Fg = RHO * G * lp ** 3, Fs = GAMMA * lp;
        ui.read.innerHTML =
          `pieces <b>${n ** 3}</b> of side <b>${lenStr(lp)}</b> · total area 6ℓ²n = <b style="color:${C.gold}">${n}×</b> the original · ` +
          `A/V = 6n/ℓ = <b>${sci((6 * n) / l)} m⁻¹</b><br>one silicon piece: weight ρg(ℓ/n)³ = <b style="color:${ROLE.mech}">${sci(Fg)} N</b> · ` +
          `water pull γ(ℓ/n) = <b style="color:${ROLE.fluid}">${sci(Fs)} N</b> · surface/weight = <b>${sci(Fs / Fg)}</b>` +
          ` (equal at ℓ/n = ${fmt(Math.sqrt(GAMMA / (RHO * G)) * 1e3, 2)} mm)`;
      };
      ui.slider("cuts per side n", 1, 5, 1, n, (v) => { n = v; read(); sc.render(); return String(v); });
      ui.slider("cube side ℓ", -5, -1, 0.1, lg, (v) => { lg = v; read(); sc.render(); return lenStr(Math.pow(10, v)); });
      ui.steps([
        "One cube of side \\(\\ell\\): area \\(A=6\\ell^2\\), volume \\(V=\\ell^3\\), so \\(A/V=6/\\ell\\). The dashed gold lines show where we will cut.",
        "Cut each side into \\(n\\) parts: \\(n^3\\) pieces, each of side \\(\\ell/n\\). The volume (and total mass) is unchanged.",
        "Total area \\(=n^3\\cdot6(\\ell/n)^2=6\\ell^2\\,n\\): every cut adds new surface (gold). \\(A/V=6n/\\ell\\) grows as the pieces shrink.",
        "Pull out one piece. Its weight is \\(\\rho g_{\\text{grav}}(\\ell/n)^3\\), down by \\(n^3\\); a water surface pulls with \\(\\gamma\\,(\\ell/n)\\), down only by \\(n\\).",
        "Ratio \\(\\dfrac{\\gamma\\ell_p}{\\rho g_{\\text{grav}}\\ell_p^3}=\\dfrac{\\gamma}{\\rho g_{\\text{grav}}\\ell_p^2}\\): equal at \\(\\ell_p=\\sqrt{\\gamma/(\\rho g_{\\text{grav}})}\\approx1.8\\) mm for silicon. Smaller pieces belong to surface tension.",
      ], (i) => { step = i; read(); sc.render(); });
    },
  });

  // ═════════════════ b1-forces-chart: the four exponents on a log-log plot ═════════════════
  register("b1-forces-chart", {
    title: "Forces vs size · on log–log axes a power law ℓⁿ is a straight line of slope n",
    target: "After this you can derive the exponents of Trimmer's bracket [ℓ¹ ℓ² ℓ³ ℓ⁴] and find the size where one force overtakes another.",
    caption: "each line is one force acting on a silicon cube of side ℓ (surface tension of water, Stokes drag at 1 mm/s in water, electrostatic pull at field 𝓔, weight, and the force of a coil at current density J). Step through the math: each step derives one exponent and lights up its line with a slope triangle (×10 in size → ×10ⁿ in force). The dots mark the crossover sizes; move the 𝓔 and J sliders to see the electrostatic/magnetic crossover slide between 0.1 mm and a few cm.",
    links: [
      { id: "A3", why: "the electrostatic force ½ε₀𝓔²A is the pull between capacitor plates" },
      { id: "B4", why: "comb drives and electrostatic self-test of accelerometers live on the ℓ² line" },
      { id: "C1", why: "inertia (ℓ³) vs viscous drag (ℓ) is the Reynolds number" },
      { id: "C4", why: "the surface-tension line explains capillary pumping and droplets" },
    ],
    build(fig, ui) {
      let lE = Math.log10(3e6), lJ = 7, lx = -4, step = 0;
      const ch = chart(ui.body, { w: 640, h: 330, xr: [1e-6, 1], yr: [-18, 8], logx: true, xlabel: "size ℓ (m)", ylabel: "log₁₀ F (N)", ml: 50, mr: 18 });
      const F = [
        { key: "st", name: "surface tension γℓ", n: 1, col: ROLE.fluid, c: () => GAMMA },
        { key: "visc", name: "Stokes drag 6πμℓU", n: 1, col: ROLE.fluid, dash: "6 4", c: () => 6 * Math.PI * 1e-3 * 1e-3 },
        { key: "es", name: "electrostatic ½ε₀𝓔²ℓ²", n: 2, col: ROLE.elec, c: () => 0.5 * EPS0 * Math.pow(10, 2 * lE) },
        { key: "g", name: "weight ρgℓ³", n: 3, col: ROLE.mech, c: () => RHO * G },
        { key: "mag", name: "magnetic ½μ₀J²ℓ⁴", n: 4, col: C.gold, c: () => 0.5 * MU0 * Math.pow(10, 2 * lJ) },
      ];
      const hot = [[], ["g"], ["es"], ["st", "visc"], ["mag"], ["st", "visc", "es", "g", "mag"]];
      F.forEach((f) => { f.ln = ch.line(f.col, 2, f.dash); f.lab = ch.label(f.col, 12, "end"); });
      const tri = ch.line(C.white, 1.5, "3 3"), triLab = ch.label(C.white, 12, "start");
      const vx = ch.vline(C.dim);
      const xdots = [0, 1, 2].map(() => ({ d: ch.dot(C.yellow, 5), l: ch.label(C.yellow, 11.5, "start") }));
      const val = (f, l) => Math.log10(f.c() * Math.pow(l, f.n));
      function draw() {
        const H = hot[step];
        F.forEach((f) => {
          const on = H.indexOf(f.key) >= 0, pts = [];
          for (let e = -6; e <= 0.001; e += 0.1) { const l = Math.pow(10, e); pts.push([l, val(f, l)]); }
          f.ln.set(pts);
          f.ln.el.setAttribute("stroke-width", on ? 4 : 1.8);
          f.ln.el.setAttribute("opacity", step === 0 || on ? 1 : 0.3);
          // label near the right edge, or where the line leaves the box
          let lx2 = 0.5;
          while (lx2 > 1e-6 && val(f, lx2) > 7.2) lx2 /= 1.25;
          f.lab.set(lx2, Math.min(7.2, val(f, lx2)) + (f.key === "visc" ? -0.9 : 0.8), f.name);
          f.lab.el.setAttribute("opacity", step === 0 || on ? 1 : 0.35);
        });
        // slope triangle on the first highlighted line
        if (step >= 1 && step <= 4) {
          const f = F.find((q) => q.key === H[0]), l0 = 2e-6, y0 = val(f, l0);
          tri.set([[l0, y0], [2e-5, y0], [2e-5, y0 + f.n]]);
          triLab.set(2.4e-5, y0 + f.n / 2, "×10 in ℓ → ×10" + SUP[f.n] + " in F");
        } else { tri.set([]); triLab.set(1, 100, ""); }
        // crossovers
        const pairs = [["g", "st", "weight = surface"], ["g", "es", "weight = electrostatic"], ["es", "mag", "electrostatic = magnetic"]];
        pairs.forEach(([a, b, name], i) => {
          const fa = F.find((q) => q.key === a), fb = F.find((q) => q.key === b);
          const l = Math.pow(fb.c() / fa.c(), 1 / (fa.n - fb.n));
          const show = step === 5 && l > 1e-6 && l < 1;
          xdots[i].d.set(show ? l : NaN, val(fa, l));
          xdots[i].l.set(l * 1.35, val(fa, l) - 0.9 - i * 0.2, show ? lenStr(l) : "");
          xdots[i].cross = l;
        });
        const l = Math.pow(10, lx);
        vx.set(l);
        const rows = F.map((f) => `<span style="color:${f.col}">${f.name.split(" ")[0]} ${sci(f.c() * Math.pow(l, f.n))} N</span>`).join(" · ");
        ui.read.innerHTML = `at ℓ = <b>${lenStr(l)}</b>: ${rows}<br>crossovers: weight = surface at <b>${lenStr(xdots[0].cross)}</b> · ` +
          `electrostatic = magnetic at <b>${lenStr(xdots[2].cross)}</b> (𝓔 = ${sci(Math.pow(10, lE))} V/m, J = ${sci(Math.pow(10, lJ))} A/m²)`;
      }
      ui.slider("field 𝓔", 6, 8.5, "any", lE, (v) => { lE = v; draw(); return sci(Math.pow(10, v)) + " V/m"; });
      ui.slider("current density J", 6, 9, "any", lJ, (v) => { lJ = v; draw(); return sci(Math.pow(10, v)) + " A/m²"; });
      ui.slider("size ℓ", -6, 0, 0.05, lx, (v) => { lx = v; draw(); return lenStr(Math.pow(10, v)); });
      ui.steps([
        "Shrink every length by 10: areas fall ×100, volumes ×1000. On log–log axes a law \\(F=c\\,\\ell^n\\) is a straight line, \\(\\log F=\\log c+n\\log\\ell\\), with slope \\(n\\).",
        "Weight and inertia: \\(F=m g_{\\text{grav}}=\\rho\\ell^3 g_{\\text{grav}}\\) ⇒ slope 3. Shrink ×10 and the weight drops ×1000.",
        "Electrostatics at a fixed field: pressure \\(\\tfrac12\\varepsilon_0\\mathcal E^2\\) times area \\(\\ell^2\\) ⇒ slope 2.",
        "Surface tension: \\(\\gamma\\) times a contact length ⇒ slope 1. Stokes drag \\(6\\pi\\mu\\ell U\\) at fixed speed: also slope 1.",
        "Magnetics: current \\(J\\ell^2\\) makes \\(B\\approx\\mu_0J\\ell\\); pressure \\(B^2/2\\mu_0\\) times \\(\\ell^2\\) ⇒ \\(F\\approx\\tfrac12\\mu_0J^2\\ell^4\\), slope 4.",
        "Trimmer's bracket \\(F\\propto[\\ell^1,\\ell^2,\\ell^3,\\ell^4]\\); per unit mass \\(a\\propto[\\ell^{-2},\\ell^{-1},\\ell^0,\\ell^1]\\). Where two lines cross, the lower exponent wins for all smaller sizes.",
      ], (i) => { step = i; draw(); });
    },
  });

  // ═════════════════ b1-clocks: time scales vs size ═════════════════
  register("b1-clocks", {
    title: "Clocks of the small world · resonance ∝ ℓ, falling ∝ √ℓ, heat and molecules ∝ ℓ²",
    target: "After this you can estimate how fast something of size ℓ rings, falls, heats up and gets reached by diffusing molecules, and why microdevices are fast.",
    caption: "the <span style='color:" + ROLE.mech + "'>purple</span> line is the period of a silicon cantilever with length ℓ and thickness ℓ/100; the dashed grey line is the time to fall its own size; <span style='color:" + ROLE.heat + "'>gold</span> is the time to heat silicon through ℓ; <span style='color:" + ROLE.fluid + "'>blue</span> is the time for glucose to diffuse ℓ in water. The ℓ² lines are steeper, so they win (get shortest) at small sizes. Move the slider from a human down to a cell.",
    links: [
      { id: "B3", why: "the exact cantilever frequency f₀ = 0.162 (t/L²)√(E/ρ)" },
      { id: "C3", why: "diffusion time ℓ²/2D is why microfluidic mixing takes seconds" },
      { id: "B5", why: "small heaters (inkjet, gas sensors) switch in microseconds" },
      { id: "A7", why: "a thermal time constant is a first-order lag τ" },
    ],
    build(fig, ui) {
      let lx = -4;
      const ch = chart(ui.body, { w: 640, h: 320, xr: [1e-6, 1], yr: [-9, 6], logx: true, xlabel: "size ℓ (m)", ylabel: "log₁₀ time (s)", ml: 50, mr: 18 });
      const T = [
        { name: "resonance period", col: ROLE.mech, f: (l) => (100 * l) / (CF * VSI) },
        { name: "fall own size", col: C.dim, dash: "6 4", f: (l) => Math.sqrt((2 * l) / G) },
        { name: "heat through (Si)", col: ROLE.heat, f: (l) => (l * l) / DTH },
        { name: "glucose diffuses", col: ROLE.fluid, f: (l) => (l * l) / (2 * DGLU) },
      ];
      [[1, "1 s"], [Math.log10(3600), "1 h"], [Math.log10(86400), "1 day"], [-3, "1 ms"], [-6, "1 µs"]].forEach(([y, s]) => {
        ch.hline(C.grid, "2 5").set(y); ch.label(C.dim, 11, "start").set(1.4e-6, y + 0.35, s);
      });
      [[10e-6, "cell"], [300e-6, "MEMS mass"], [5e-3, "ant"], [0.15, "phone"]].forEach(([l, s]) => {
        ch.label(C.dim, 11, "middle").set(l, 5.4, "▾ " + s);
      });
      T.forEach((q) => {
        const pts = [];
        for (let e = -6; e <= 0.001; e += 0.1) { const l = Math.pow(10, e); pts.push([l, Math.log10(q.f(l))]); }
        q.ln = ch.line(q.col, 2.6, q.dash); q.ln.set(pts);
        q.dot = ch.dot(q.col, 5);
      });
      ch.label(ROLE.fluid, 12, "start").set(2e-4, 3.3, "∝ ℓ²");
      ch.label(ROLE.mech, 12, "start").set(0.05, -1.3, "∝ ℓ");
      ch.label(C.dim, 12, "start").set(0.05, 0.3, "∝ √ℓ");
      const vx = ch.vline(C.yellow);
      function draw() {
        const l = Math.pow(10, lx);
        vx.set(l);
        T.forEach((q) => q.dot.set(l, Math.log10(q.f(l))));
        ui.read.innerHTML = `ℓ = <b>${lenStr(l)}</b> · ` + T.map((q) => `<span style="color:${q.col === C.dim ? C.text : q.col}">${q.name}: <b>${timeStr(q.f(l))}</b></span>`).join(" · ") +
          `<br>shrink ×10 → period ×1/10, fall ×1/3.2, heating and diffusion ×1/100`;
      }
      ui.slider("size ℓ", -6, 0, 0.05, lx, (v) => { lx = v; draw(); return lenStr(Math.pow(10, v)); });
      draw();
    },
  });
})();
