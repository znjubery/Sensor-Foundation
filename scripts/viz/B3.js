/* B3 — micromechanics: widgets for docs/B3-micromechanics-beams-springs-and-resonators.md */
(function () {
  "use strict";
  const { register, C, ROLE, scene3d, chart, S, fmt, mix, css, ramp, loop, reduceMotion } = VIZ;
  // core.js sizes every <svg> in a figure to 100% width; keep MathJax's own SVGs (stepper math) at their natural size
  if (!document.getElementById("viz-mjx-fix")) {
    const st = document.createElement("style");
    st.id = "viz-mjx-fix";
    st.textContent = "figure.viz mjx-container svg { display: inline; width: auto; height: auto; }";
    document.head.appendChild(st);
  }

  const E = 169e9, RHO = 2330, CF = (1.875104 ** 2) / (2 * Math.PI) / Math.sqrt(12), KT = 1.380649e-23 * 298.15;
  // first bending mode of a cantilever, normalised to 1 at the tip, and its curvature normalised to 1 at the root
  const BETA = 1.875104, SIG = 0.734096;
  const phi = (s) => (Math.cosh(BETA * s) - Math.cos(BETA * s) - SIG * (Math.sinh(BETA * s) - Math.sin(BETA * s))) / 2.0;
  const PHI1 = phi(1);
  const curv = (s) => (Math.cosh(BETA * s) + Math.cos(BETA * s) - SIG * (Math.sinh(BETA * s) + Math.sin(BETA * s))) / 2.0;

  // ═════════════════ b3-cantilever-3d ═════════════════
  register("b3-cantilever-3d", {
    title: "3D · a silicon cantilever bends: x = F/k with k = Ewt³/4L³, and rings at f₀ = 0.1615 (t/L²)√(E/ρ)",
    target: "After this you can predict how far a silicon beam bends, where its strain is largest, and why doubling its thickness makes it 8× stiffer and 2× higher in pitch.",
    caption: "lengths are to scale with each other, but the thickness is drawn about 7× and the deflection about 40× larger (clipped for very soft beams). The colour on the top surface is the surface strain (dark blue = none → yellow = most); it is always largest at the clamped root, which is where a piezoresistor goes. Step through the math to build k from the bending moment. Press “vibrate” to see the first mode shape (slowed down about 100 000×): the tip moves most, the root strains most.",
    links: [
      { id: "A2", why: "the root strain is what a strain gauge or piezoresistor reads" },
      { id: "B4", why: "the same beams become the springs that hold an accelerometer's proof mass" },
      { id: "B2", why: "this is the beam released in the surface-micromachining process" },
      { id: "B1", why: "k ∝ ℓ and m ∝ ℓ³ make f₀ ∝ 1/ℓ" },
    ],
    build(fig, ui) {
      let L = 200, w = 20, t = 2, F = 1, step = 0, vib = false;
      const props = () => {
        const Lm = L * 1e-6, wm = w * 1e-6, tm = t * 1e-6, Fn = F * 1e-6;
        const k = (E * wm * tm ** 3) / (4 * Lm ** 3), x = Fn / k, sig = (6 * Fn * Lm) / (wm * tm * tm);
        const f0 = CF * (tm / (Lm * Lm)) * Math.sqrt(E / RHO), m = RHO * Lm * wm * tm, meff = k / (2 * Math.PI * f0) ** 2;
        return { k, x, sig, eps: sig / E, f0, m, meff };
      };
      const sc = scene3d(ui.body, {
        w: 640, h: 360, scale: 92, yaw: -0.5, pitch: 0.38, center: [1.2, 0, -0.25], animate: !reduceMotion,
        draw(g, time, s3) {
          const p = props();
          const Ld = L * 0.009, wd = w * 0.022, td = t * 0.06, nu = 20;
          s3.o.center[0] = Ld / 2 - 0.2;
          const zTip = vib ? 0.7 * Math.sin(2 * Math.PI * 0.7 * time) : -Math.min(1.6, p.x * 1e6 * 0.35);
          const shape = (s) => (vib ? zTip * (phi(s) / PHI1) : zTip * (s * s * (3 - s)) / 2);
          const strainAt = (s) => (vib ? Math.abs(zTip / 0.7) * curv(s) / curv(0) * 0.85 : Math.min(1, (p.eps / 150e-6) * (1 - s)));
          // clamp block and chip
          g.box([-0.7, -0.75, -1.3], [0, 0.75, td / 2], C.silicon, { stroke: C.bg, strokeAlpha: 0.5, strokeWidth: 0.8, bias: -0.5 });
          g.text([-0.35, -0.75, -0.8], "anchor", C.text, 12);
          const top = (s) => step >= 2 || vib ? ramp(strainAt(s)) : step === 1 ? mix(C.silicon, ROLE.mech, 0.9 * (1 - s)) : mix(C.silicon, C.white, 0.15);
          for (let i = 0; i < nu; i++) {
            const s0 = i / nu, s1 = (i + 1) / nu, x0 = Ld * s0, x1 = Ld * s1, z0 = shape(s0), z1 = shape(s1), sm = (s0 + s1) / 2;
            const a = [x0, -wd / 2], b = [x1, wd / 2];
            g.poly([[x0, a[1], z0 + td / 2], [x1, a[1], z1 + td / 2], [x1, b[1], z1 + td / 2], [x0, b[1], z0 + td / 2]], top(sm), { shade: false });
            g.poly([[x0, a[1], z0 - td / 2], [x1, a[1], z1 - td / 2], [x1, b[1], z1 - td / 2], [x0, b[1], z0 - td / 2]], C.silicon);
            g.poly([[x0, a[1], z0 - td / 2], [x1, a[1], z1 - td / 2], [x1, a[1], z1 + td / 2], [x0, a[1], z0 + td / 2]], C.silicon);
            g.poly([[x0, b[1], z0 - td / 2], [x1, b[1], z1 - td / 2], [x1, b[1], z1 + td / 2], [x0, b[1], z0 + td / 2]], C.silicon);
          }
          const zL = shape(1);
          g.poly([[Ld, -wd / 2, zL - td / 2], [Ld, wd / 2, zL - td / 2], [Ld, wd / 2, zL + td / 2], [Ld, -wd / 2, zL + td / 2]], C.silicon);
          if (!vib) {
            g.arrow([Ld - 0.05, 0, zL + td / 2 + 0.8], [Ld - 0.05, 0, zL + td / 2 + 0.03], ROLE.mech, 3.5);
            g.text([Ld + 0.1, 0, zL + td / 2 + 0.9], "F = " + fmt(F, 2) + " µN", ROLE.mech, 13, "left");
          }
          if (step === 1 && !vib) {
            // bending moment diagram M(x) = F(L − x), drawn as a purple triangle on the wall behind the beam
            const yb = -wd / 2 - 0.35, hM = 0.8, z0 = -0.45;
            g.poly([[0, yb, z0], [Ld, yb, z0], [0, yb, z0 - hM]], ROLE.mech, { alpha: 0.4, shade: false, stroke: ROLE.mech, strokeAlpha: 0.9 });
            g.text([0.05, yb, z0 - hM - 0.18], "M = FL at the root", ROLE.mech, 12, "left");
            g.text([Ld + 0.1, yb, z0], "M = 0 at the tip", ROLE.mech, 12, "left");
          }
          if (step >= 2 && !vib) g.text([0.5, -wd / 2, shape(0.05) + 0.45], "ε_max = " + fmt(p.eps * 1e6, 1) + " µε", C.yellow, 12.5, "left");
          if (step >= 3 && !vib) {
            g.line([0, 0, td / 2], [Ld, 0, td / 2], C.dim, 1.2, [5, 4]);
            g.line([Ld + 0.25, 0, td / 2], [Ld + 0.25, 0, zL + td / 2], C.yellow, 2);
            g.text([Ld + 0.35, 0, (zL + td) / 2], "x = " + fmt(p.x * 1e6, 3) + " µm", C.yellow, 13, "left");
            if (-zL >= 1.59) g.text([Ld / 2, 0, -1.75], "(drawn deflection clipped)", C.dim, 11);
          }
          if (step >= 4 && !vib) g.text([Ld / 2, wd / 2, 1.25], "k = Ewt³/4L³ = " + fmt(p.k, 3) + " N/m", C.green, 14);
          if (vib) g.text([Ld / 2, wd / 2, 1.2], "first mode · f₀ = " + fmt(p.f0 / 1e3, 2) + " kHz", C.yellow, 14);
        },
      });
      sc.canvas.getContext("2d").lineJoin = "round";   // no miter spikes on outlined labels
      const read = () => {
        const p = props();
        ui.read.innerHTML = `k = Ewt³/4L³ = <b style="color:${C.green}">${fmt(p.k, p.k < 1 ? 4 : 3)} N/m</b> · tip deflection x = F/k = <b style="color:${C.yellow}">${fmt(p.x * 1e6, 3)} µm</b> · ` +
          `root stress 6FL/wt² = <b>${fmt(p.sig / 1e6, 2)} MPa</b> (strain <b>${fmt(p.eps * 1e6, 1)} µε</b>)<br>` +
          `f₀ = <b style="color:${C.yellow}">${fmt(p.f0 / 1e3, 2)} kHz</b> · mass ρLwt = ${fmt(p.m * 1e12, 2)} ng → m_eff = k/ω₀² = ${fmt(p.meff * 1e15, 0)} pg · thermal jiggle √(k_BT/k) = ${fmt(Math.sqrt(KT / p.k) * 1e12, 1)} pm`;
        if (!sc.o.animate) sc.render();
      };
      ui.slider("length L", 100, 500, 10, L, (v) => { L = v; read(); return v + " µm"; });
      ui.slider("width w", 5, 50, 1, w, (v) => { w = v; read(); return v + " µm"; });
      ui.slider("thickness t", 1, 5, 0.25, t, (v) => { t = v; read(); return fmt(v, 2) + " µm"; });
      ui.slider("tip force F", 0.1, 5, 0.1, F, (v) => { F = v; read(); return fmt(v, 1) + " µN"; });
      const vb = ui.button("vibrate (mode 1)", () => { vib = !vib; vb.textContent = vib ? "static load" : "vibrate (mode 1)"; read(); sc.render(); });
      ui.steps([
        "A cantilever of length \\(L\\), width \\(w\\), thickness \\(t\\), clamped at \\(x=0\\). Push its tip down with a force \\(F\\).",
        "Cut the beam at \\(x\\): the part beyond the cut is held by a bending moment \\(M(x)=F\\,(L-x)\\), largest at the root (purple triangle).",
        "The surface, \\(t/2\\) from the middle, is stretched: \\(\\sigma=\\dfrac{M\\,t/2}{I_A}=\\dfrac{6F(L-x)}{wt^2}\\), with \\(I_A=\\dfrac{wt^3}{12}\\). Strain \\(\\varepsilon=\\sigma/E\\) (colour).",
        "Curvature \\(z''=M/(EI_A)\\); integrate twice with \\(z(0)=z'(0)=0\\): \\(z=\\dfrac{F(3Lx^2-x^3)}{6EI_A}\\), so the tip moves \\(x=\\dfrac{FL^3}{3EI_A}\\).",
        "Spring constant \\(k=F/x=\\dfrac{3EI_A}{L^3}=\\dfrac{Ewt^3}{4L^3}\\). Try \\(t\\): ×2 gives ×8 in \\(k\\). Try \\(L\\): ×2 gives ÷8.",
        "Let go and it rings: \\(f_0=\\tfrac{1}{2\\pi}\\sqrt{k/m_{\\text{eff}}}=0.1615\\,\\dfrac{t}{L^2}\\sqrt{E/\\rho}\\), with \\(m_{\\text{eff}}\\approx0.243\\,\\rho Lwt\\). The beam now vibrates in this mode.",
      ], (i) => { step = i; if (i === 5 && !vib) { vib = true; vb.textContent = "static load"; } if (i < 5 && vib) { vib = false; vb.textContent = "vibrate (mode 1)"; } read(); sc.render(); });
    },
  });

  // ═════════════════ b3-resonance ═════════════════
  register("b3-resonance", {
    title: "Resonance · amplitude and phase of a driven mass–spring–damper, for several Q_f",
    target: "After this you can read a resonance curve: static gain F₀/k below ω₀, a peak Q_f·F₀/k at ω₀ with a 90° lag, a 1/ω² fall-off above, and bandwidth f₀/Q_f.",
    caption: "top: amplitude X/(F₀/k) against the drive frequency ratio r = ω/ω₀ on log–log axes, for Q_f = 0.5, 2, 10, 100 (thin) and your Q_f (bold yellow). Middle: the phase lag. Bottom: the mass on its spring, driven by the blue force; the yellow trace is the displacement, which lags the force by φ. Slide the drive through r = 1 and watch the lag jump from 0° to 180°, which is sharpest at high Q_f.",
    links: [
      { id: "B4", why: "accelerometers live on the flat left part; gyroscopes are driven at the peak" },
      { id: "B5", why: "a microphone membrane's resonance sets the top of its audio band" },
      { id: "A7", why: "the same curve is a second-order low-pass filter" },
      { id: "A9", why: "m ẍ + b ẋ + k x = F is a state-space motion model" },
    ],
    build(fig, ui) {
      let Q = 10, lr = 0, step = 0;
      const amp = (r, q) => 1 / Math.sqrt((1 - r * r) ** 2 + (r / q) ** 2);
      const ph = (r, q) => (Math.atan2(r / q, 1 - r * r) * 180) / Math.PI;
      const ch = chart(ui.body, { w: 640, h: 250, xr: [0.1, 10], yr: [0.01, 1000], logx: true, logy: true, xlabel: "", ylabel: "X / (F₀/k)", mb: 22 });
      const cp = chart(ui.body, { w: 640, h: 130, xr: [0.1, 10], yr: [0, 180], logx: true, xlabel: "drive ratio r = ω/ω₀", ylabel: "lag φ (°)", mt: 6 });
      const fam = [0.5, 2, 10, 100];
      const rs = []; for (let e = -1; e <= 1.0001; e += 0.005) rs.push(Math.pow(10, e));
      fam.forEach((q, i) => {
        const c = css(mix(C.dim, C.white, 0.12 * i));
        ch.line(c, 1.2).set(rs.map((r) => [r, amp(r, q)]));
        cp.line(c, 1.2).set(rs.map((r) => [r, ph(r, q)]));
        ch.label(C.dim, 11, "start").set(1.05, amp(1, q) * 1.25, "Q_f = " + q);
      });
      const asymL = ch.line(C.green, 1.8, "6 4"), asymH = ch.line(C.green, 1.8, "6 4");
      const peakH = ch.hline(C.green, "3 4"), bw = ch.line(C.red, 3), bwLab = ch.label(C.red, 12, "middle"), asLab = ch.label(C.green, 12, "start");
      const cur = ch.line(C.yellow, 3), curP = cp.line(C.yellow, 3);
      const vA = ch.vline(C.blue), vP = cp.vline(C.blue), dA = ch.dot(C.yellow, 5.5), dP = cp.dot(C.yellow, 5.5);
      // animation strip: wall, spring, mass, force arrow; traces of F (blue) and x (yellow)
      const svg = S("svg", { viewBox: "0 0 640 150", role: "img", "aria-label": "driven mass on a spring" }, ui.body);
      S("rect", { x: 14, y: 30, width: 10, height: 90, fill: C.silicon }, svg);
      const spring = S("polyline", { fill: "none", stroke: ROLE.mech, "stroke-width": 2.5, "stroke-linejoin": "round" }, svg);
      const damp = S("line", { stroke: C.dim, "stroke-width": 6, opacity: 0.6 }, svg);
      const mass = S("rect", { y: 55, width: 46, height: 46, rx: 6, fill: ROLE.mech }, svg);
      const fArrow = S("line", { stroke: C.blue, "stroke-width": 4, "stroke-linecap": "round" }, svg);
      const clipNote = S("text", { x: 150, y: 140, fill: C.dim, "font-size": 11, "text-anchor": "middle", "font-family": "var(--font-mono, monospace)" }, svg);
      S("text", { x: 150, y: 18, fill: C.dim, "font-size": 11.5, "text-anchor": "middle", "font-family": "var(--font-mono, monospace)" }, svg).textContent = "slow motion";
      S("rect", { x: 300, y: 12, width: 330, height: 126, fill: "none", stroke: C.grid, rx: 4 }, svg);
      S("line", { x1: 300, y1: 75, x2: 630, y2: 75, stroke: C.gridFaint }, svg);
      const trF = S("polyline", { fill: "none", stroke: C.blue, "stroke-width": 2 }, svg);
      const trX = S("polyline", { fill: "none", stroke: C.yellow, "stroke-width": 2.5 }, svg);
      const cursor = S("line", { y1: 12, y2: 138, stroke: C.dim, "stroke-dasharray": "3 3" }, svg);
      const lagTxt = S("text", { x: 306, y: 26, fill: C.text, "font-size": 12, "font-family": "var(--font-mono, monospace)" }, svg);
      S("text", { x: 306, y: 132, fill: C.blue, "font-size": 12, "text-anchor": "start", "font-family": "var(--font-mono, monospace)" }, svg).textContent = "force F";
      S("text", { x: 624, y: 132, fill: C.yellow, "font-size": 12, "text-anchor": "end", "font-family": "var(--font-mono, monospace)" }, svg).textContent = "displacement x";
      let phase = 0;
      function frame(tt) {
        const r = Math.pow(10, lr), X = amp(r, Q), lag = (ph(r, Q) * Math.PI) / 180;
        const px = Math.min(95, 24 * X), wt = 2 * Math.PI * tt;
        const xm = 150 + px * Math.cos(wt - lag) - 23;
        mass.setAttribute("x", xm);
        const pts = [], nz = 12;
        for (let i = 0; i <= nz; i++) { const xx = 24 + ((xm - 24) * i) / nz, yy = i === 0 || i === nz ? 70 : 70 + (i % 2 ? -9 : 9); pts.push(xx + "," + yy); }
        spring.setAttribute("points", pts.join(" "));
        damp.setAttribute("x1", 24); damp.setAttribute("x2", xm); damp.setAttribute("y1", 94); damp.setAttribute("y2", 94);
        const fx = 30 * Math.cos(wt);
        fArrow.setAttribute("x1", xm + 23); fArrow.setAttribute("x2", xm + 23 + fx); fArrow.setAttribute("y1", 78); fArrow.setAttribute("y2", 78);
        clipNote.textContent = 24 * X > 95 ? "(amplitude clipped: true X = " + fmt(X, 1) + " F₀/k)" : "";
        cursor.setAttribute("x1", 300 + ((tt % 2) / 2) * 330); cursor.setAttribute("x2", 300 + ((tt % 2) / 2) * 330);
      }
      function traces() {
        const r = Math.pow(10, lr), lag = (ph(r, Q) * Math.PI) / 180, a = [], b = [];
        for (let i = 0; i <= 120; i++) { const u = i / 120, wt = 2 * Math.PI * 2 * u; a.push((300 + 330 * u).toFixed(1) + "," + (75 - 45 * Math.cos(wt)).toFixed(1)); b.push((300 + 330 * u).toFixed(1) + "," + (75 - 45 * Math.cos(wt - lag)).toFixed(1)); }
        trF.setAttribute("points", a.join(" ")); trX.setAttribute("points", b.join(" "));
        lagTxt.textContent = "x lags F by φ = " + fmt(ph(r, Q), 1) + "°";
      }
      function draw() {
        const r = Math.pow(10, lr);
        cur.set(rs.map((x) => [x, amp(x, Q)])); curP.set(rs.map((x) => [x, ph(x, Q)]));
        vA.set(r); vP.set(r); dA.set(r, amp(r, Q)); dP.set(r, ph(r, Q));
        // overlays that follow the stepper
        asymL.set(step === 2 || step === 5 ? [[0.1, 1], [1, 1]] : []);
        asymH.set(step === 3 || step === 5 ? [[1, 1], [10, 0.01]] : []);
        asLab.set(step === 2 ? 0.12 : 1.15, step === 2 ? 1.6 : 0.022, step === 2 ? "X ≈ F₀/k (spring wins)" : step === 3 ? "X ≈ F₀/(mω²): slope −2" : "");
        if (step === 4 || step === 5) peakH.set(amp(1, Q)); else peakH.set(1e-9);
        if (step === 5 && Q > 0.75) {
          const hp = amp(1, Q) / Math.SQRT2, r1 = Math.sqrt(1 + 1 / (4 * Q * Q)) - 1 / (2 * Q), r2 = Math.sqrt(1 + 1 / (4 * Q * Q)) + 1 / (2 * Q);
          bw.set([[r1, hp], [r2, hp]]); bwLab.set(Math.sqrt(r1 * r2), hp / 2.2, "Δf = f₀/Q_f");
        } else { bw.set([]); bwLab.set(1, 1, ""); }
        traces();
        const f0 = 68.79;
        ui.read.innerHTML = `Q_f = <b style="color:${C.yellow}">${fmt(Q, Q < 10 ? 2 : 0)}</b> · r = ω/ω₀ = <b>${fmt(r, 3)}</b> (for the 68.79 kHz cantilever: ${fmt(f0 * r, 2)} kHz) · ` +
          `X = <b style="color:${C.yellow}">${fmt(amp(r, Q), 4)} F₀/k</b> · lag φ = <b>${fmt(ph(r, Q), 1)}°</b><br>peak Q_f·F₀/k = ${fmt(amp(1, Q), 2)} · bandwidth f₀/Q_f = ${fmt(f0 / Q * 1000, 0)} Hz · ring-down 2Q_f/ω₀ = ${fmt((2 * Q) / (2 * Math.PI * f0 * 1e3) * 1e3, 3)} ms`;
        if (reduceMotion) frame(0.15);
      }
      const qs = ui.slider("quality factor Q_f", -0.3, 3, 0.01, Math.log10(Q), (v) => { Q = Math.pow(10, v); draw(); return fmt(Q, Q < 10 ? 2 : 0); });
      const rsl = ui.slider("drive r = ω/ω₀", -1, 1, 0.005, lr, (v) => { lr = v; draw(); return fmt(Math.pow(10, v), 3); });
      ui.steps([
        "Drive the mass with \\(F_0\\cos\\omega t\\): \\(m\\ddot x+b\\dot x+kx=F_0\\cos\\omega t\\).",
        "Try \\(x=\\hat X e^{i\\omega t}\\): \\((k-m\\omega^2+i\\,b\\omega)\\hat X=F_0\\), so \\(X=\\dfrac{F_0/k}{\\sqrt{(1-r^2)^2+(r/Q_f)^2}}\\) with \\(r=\\omega/\\omega_0\\).",
        "Slow drive, \\(r\\ll1\\): \\(k\\) beats \\(m\\omega^2\\) and \\(b\\omega\\), so \\(X\\approx F_0/k\\), in phase. A quasi-static spring: the accelerometer regime.",
        "Fast drive, \\(r\\gg1\\): \\(m\\omega^2\\) wins, \\(X\\approx F_0/(m\\omega^2)=(F_0/k)/r^2\\), slope −2, lag 180°: the mass barely follows.",
        "At \\(r=1\\) the spring and mass terms cancel exactly; only damping is left: \\(X=F_0/(b\\omega_0)=Q_f\\,F_0/k\\), lag 90°.",
        "Half-power points where \\(\\lvert1-r^2\\rvert\\approx r/Q_f\\): width \\(\\Delta r\\approx1/Q_f\\), i.e. \\(\\Delta f=f_0/Q_f\\). High \\(Q_f\\): tall, narrow, slow to ring down.",
      ], (i) => {
        step = i;
        const target = { 2: -0.7, 3: 0.6, 4: 0, 5: 0 }[i];
        if (target !== undefined) rsl.set(target);
        if (i === 5 && Q < 5) qs.set(1);
        draw();
      });
      draw();
      if (!reduceMotion) loop(svg, (tt) => frame(tt * 0.5 * Math.pow(10, lr)));
      else frame(0.15);
    },
  });
})();
