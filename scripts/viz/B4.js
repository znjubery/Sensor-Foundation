/* B4 — MEMS inertial sensors: widgets for docs/B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md */
(function () {
  "use strict";
  const { register, C, ROLE, scene3d, chart, fmt, rng, gauss, mix, css } = VIZ;
  const GRAV = 9.81, EPS0 = 8.854e-12, D2R = Math.PI / 180;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // a box whose 8 corners go through a transform T (for tilted or rotating chips)
  function tbox(g, T, a, b, col, op) {
    const [x0, y0, z0] = a, [x1, y1, z1] = b;
    const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]].map(T);
    [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]].forEach((f) => g.poly(f.map((i) => v[i]), col, op));
  }
  // a folded (serpentine) spring between two points in the chip plane, beams perpendicular to the a→b line
  function meander(a, b, n, amp) {
    const pts = [a.slice()];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, px = -dy / L, py = dx / L;
    for (let i = 0; i < n; i++) {
      const s = (i + 0.5) / n, side = i % 2 ? -1 : 1;
      const cx = a[0] + dx * s, cy = a[1] + dy * s, h = 0.5 / n;
      pts.push([cx - dx * h + px * amp * side, cy - dy * h + py * amp * side, a[2]]);
      pts.push([cx + dx * h + px * amp * side, cy + dy * h + py * amp * side, a[2]]);
    }
    pts.push(b.slice());
    return pts;
  }
  function panel(ctx, x, y, w, h) {
    ctx.fillStyle = "rgba(14,17,22,0.86)"; ctx.strokeStyle = "#34404d"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke();
  }
  function txt(ctx, s, x, y, col, size, align) {
    ctx.font = `${size || 12}px JetBrains Mono, ui-monospace, monospace`; ctx.textAlign = align || "left"; ctx.textBaseline = "middle";
    ctx.fillStyle = css(col || C.text); ctx.fillText(s, x, y);
  }

  // ══════════════════════════════ 1. the capacitive accelerometer in a tilting phone ══════════════════════════════
  register("b4-accelerometer-3d", {
    title: "3D · an accelerometer chip: proof mass, folded springs, differential comb",
    target: "After this you can follow one number from F = ma through x = a/ω₀² and ΔC to a voltage, and read pitch and roll from gravity.",
    caption: "tilt the phone or push it along the sense axis \\(x\\): the <span style='color:" + C.purple + "'>proof mass</span> slides on its <span style='color:" + C.purple + "'>folded springs</span> (motion hugely exaggerated: the real shift is nanometres), closing the gaps of <span style='color:" + C.teal + "'>C₁</span> and opening those of <span style='color:" + C.teal + "'>C₂</span>. The <span style='color:" + C.blue + "'>blue arrows</span> are gravity and the push; the bars show C₁, C₂ and the <span style='color:" + C.yellow + "'>output voltage</span>. Raise f₀ and watch the same 1 g move the mass less.",
    links: [
      { id: "B3", why: "the folded spring and ω₀ = √(k/m) come from beam mechanics" },
      { id: "A3", why: "C₁ and C₂ are the differential gap-closing capacitors" },
      { id: "A8", why: "the aF-level ΔC is why noise and calibration matter" },
      { id: "A9", why: "the tilt read here is fused with the gyro's rate" },
    ],
    build(fig, ui) {
      let pitch = 30, roll = 0, push = 0, f0 = 3, step = 0;
      const m = 1e-9, g0 = 2e-6, A = 4e-8, C0 = EPS0 * A / g0, Vex = 1;

      function phys() {
        const th = pitch * D2R, ph = roll * D2R;
        const ax = Math.sin(th) + push, ay = Math.cos(th) * Math.sin(ph), az = Math.cos(th) * Math.cos(ph); // in g
        const w0 = 2 * Math.PI * f0 * 1e3, k = m * w0 * w0;
        const x = clamp((ax * GRAV) / (w0 * w0), -0.9 * g0, 0.9 * g0);
        const C1 = EPS0 * A / (g0 - x), C2 = EPS0 * A / (g0 + x);
        const V = Vex * (C1 - C2) / (C1 + C2);
        const pr = Math.atan2(ax, Math.hypot(ay, az)) / D2R, rl = Math.atan2(ay, az) / D2R;
        return { ax, ay, az, w0, k, x, C1, C2, V, pr, rl };
      }
      // body → world: roll about x first, then pitch about y (the +x end goes up for positive pitch)
      function T(p) {
        const th = pitch * D2R, ph = roll * D2R;
        const y1 = p[1] * Math.cos(ph) - p[2] * Math.sin(ph), z1 = p[1] * Math.sin(ph) + p[2] * Math.cos(ph);
        return [p[0] * Math.cos(th) - z1 * Math.sin(th), y1, p[0] * Math.sin(th) + z1 * Math.cos(th)];
      }
      const fingersX = [-1.0, -0.5, 0, 0.5, 1.0], fw = 0.05, gapV = 0.09;

      const sc = scene3d(ui.body, {
        w: 640, h: 440, scale: 84, yaw: -0.5, pitch: 0.82, center: [0.1, -0.2, 0.35],
        draw(g) {
          const P = phys();
          // visual shift: exaggerated, saturating; the mass moves toward −x when the reading a_x is positive
          const d = -0.075 * Math.tanh((P.x / 27.6e-9) * 0.4);
          const hot = (k) => step === k;
          // phone body and chip substrate (always behind the chip)
          tbox(g, T, [-3.0, -2.9, -0.34], [3.0, 2.4, -0.1], "#232a33", { bias: -60 });
          g.poly([[-2.6, -2.0, 0], [2.6, -2.0, 0], [2.6, 2.0, 0], [-2.6, 2.0, 0]].map(T), mix(C.silicon, "#000000", 0.45), { bias: -40, shade: false });
          // frame walls
          const fr = C.silicon, zf = 0.36;
          tbox(g, T, [-2.6, -2.0, 0], [2.6, -1.75, zf], fr); tbox(g, T, [-2.6, 1.75, 0], [2.6, 2.0, zf], fr);
          tbox(g, T, [-2.6, -1.75, 0], [-2.35, 1.75, zf], fr); tbox(g, T, [2.35, -1.75, 0], [2.6, 1.75, zf], fr);
          // proof mass + moving fingers (purple)
          const mc = hot(0) ? C.purple : mix(C.purple, "#000000", 0.12);
          tbox(g, T, [-1.3 + d, -0.55, 0.06], [1.3 + d, 0.55, 0.3], mc);
          fingersX.forEach((xi) => {
            tbox(g, T, [xi - fw + d, 0.55, 0.06], [xi + fw + d, 1.55, 0.3], mc);
            tbox(g, T, [xi - fw + d, -1.55, 0.06], [xi + fw + d, -0.55, 0.3], mc);
          });
          // fixed fingers: C1 on the −x side of each moving finger (its gap closes when a_x > 0), C2 on the +x side
          const r1 = clamp((P.C1 / C0 - 1) * 8, 0, 1), r2 = clamp((P.C2 / C0 - 1) * 8, 0, 1);
          const lit = step >= 2;
          const c1 = lit ? mix(C.teal, C.white, 0.15 + 0.6 * r1) : mix(C.teal, C.silicon, 0.35);
          const c2 = lit ? mix(mix(C.teal, "#000000", 0.35), C.white, 0.6 * r2) : mix(C.teal, C.silicon, 0.55);
          fingersX.forEach((xi) => {
            const xa = xi - fw - gapV - fw, xb = xi + fw + gapV + fw;
            [[0.7, 1.75], [-1.75, -0.7]].forEach(([ya, yb]) => {
              tbox(g, T, [xa - fw, ya, 0.06], [xa + fw, yb, 0.3], c1);
              tbox(g, T, [xb - fw, ya, 0.06], [xb + fw, yb, 0.3], c2);
            });
          });
          // folded springs from the mass ends to anchors on the substrate
          const sw = hot(1) ? 4.2 : 2.6, scol = hot(1) ? mix(C.purple, C.white, 0.45) : C.purple;
          [[-1.3 + d, -2.05], [1.3 + d, 2.05]].forEach(([xm, xa]) => {
            g.polyline(meander([xm, 0, 0.18], [xa, 0, 0.18], 6, 0.42).map(T), scol, sw);
            tbox(g, T, [xa - 0.12 * Math.sign(xa) - 0.12, -0.18, 0], [xa - 0.12 * Math.sign(xa) + 0.12, 0.18, 0.3], mix(C.silicon, C.white, 0.15));
          });
          // labels on the chip
          g.text(T([-1.0 - 2 * fw - gapV - 0.12, -2.22, 0.4]), "C₁", C.teal, 13);
          g.text(T([-1.0 + 2 * fw + gapV + 0.12, -2.22, 0.4]), "C₂", mix(C.teal, C.white, 0.3), 13);
          g.text(T([0.35, -0.3, 0.45]), "proof mass m", C.text, 12);
          g.arrow(T([1.7, -2.3, 0.4]), T([2.6, -2.3, 0.4]), C.axis, 1.6);
          g.text(T([2.9, -2.3, 0.4]), "x", C.dim, 13);
          // gravity (world-fixed) and the push along the sense axis
          if (Math.abs(push) > 0.01) {
            g.arrow(T([-1.6, -2.75, 0.25]), T([-1.6 + 0.9 * push, -2.75, 0.25]), ROLE.s, 3.5);
            g.text(T([-1.6 + 0.9 * push + 0.35 * Math.sign(push), -2.75, 0.25]), "a", ROLE.s, 14);
          }
          // step pictures: the inertial force on the mass, the displacement
          if (step === 0 || step === 1) {
            const L = clamp(-1.6 * P.ax, -1.5, 1.5);
            if (Math.abs(L) > 0.03) {
              g.arrow(T([d, 0, 0.9]), T([d + L, 0, 0.9]), mix(C.purple, C.white, 0.7), 4.5);
              g.text(T([d + L + 0.35 * Math.sign(L), 0, 1.05]), step === 0 ? "−m a" : "k x", mix(C.purple, C.white, 0.5), 14);
            }
          }
        },
        overlay(ctx) {
          // gravity always points straight down the screen (the camera never rolls), so draw it flat
          ctx.strokeStyle = css(ROLE.s); ctx.fillStyle = css(ROLE.s); ctx.lineWidth = 4; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(600, 34); ctx.lineTo(600, 92); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(600, 106); ctx.lineTo(592, 90); ctx.lineTo(608, 90); ctx.closePath(); ctx.fill();
          txt(ctx, "gravity", 600, 20, ROLE.s, 13, "center");
          if (step < 2) return;
          const P = phys();
          panel(ctx, 8, 8, 218, step >= 4 ? 104 : 74);
          const bar = (y, lab, val, frac, col) => {
            txt(ctx, lab, 16, y, col, 12);
            ctx.fillStyle = "#1d2530"; ctx.fillRect(110, y - 6, 106, 12);
            ctx.fillStyle = css(col); const w = clamp(frac, -1, 1) * 53;
            ctx.fillRect(163 + Math.min(0, w), y - 6, Math.abs(w), 12);
            ctx.fillStyle = css(C.dim); ctx.fillRect(162.5, y - 8, 1, 16);
            txt(ctx, val, 216, y + 13, C.dim, 10.5, "right");
          };
          const s = 1 / 0.015;  // ±1.5 % of C0 fills the bar
          bar(22, "C₁ − C₀", (P.C1 - C0) * 1e15 >= 0 ? "+" + fmt((P.C1 - C0) * 1e15, 2) + " fF" : fmt((P.C1 - C0) * 1e15, 2) + " fF", ((P.C1 - C0) / C0) * s, C.teal);
          bar(52, "C₂ − C₀", fmt((P.C2 - C0) * 1e15, 2) + " fF", ((P.C2 - C0) / C0) * s, mix(C.teal, "#000000", 0.2));
          if (step >= 4) bar(84, "V_out", fmt(P.V * 1e3, 1) + " mV", P.V / 0.03, C.yellow);
        },
      });

      ui.slider("pitch θp", -90, 90, 1, pitch, (v) => { pitch = v; sc.render(); update(); return v + "°"; });
      ui.slider("roll φr", -90, 90, 1, roll, (v) => { roll = v; sc.render(); update(); return v + "°"; });
      ui.slider("push a", -2, 2, 0.1, push, (v) => { push = v; sc.render(); update(); return fmt(v, 1) + " g"; });
      ui.slider("f₀", 1, 10, 0.5, f0, (v) => { f0 = v; sc.render(); update(); return fmt(v, 1) + " kHz"; });

      function update() {
        const P = phys();
        ui.read.innerHTML =
          `<span style="color:${C.blue}">a_x = ${fmt(P.ax, 3)} g</span> · k = mω₀² = ${fmt(P.k, 3)} N/m · ` +
          `<span style="color:${C.purple}">x = a/ω₀² = ${fmt(P.x * 1e9, 2)} nm</span> (x/g₀ = ${fmt(P.x / g0, 4)})<br>` +
          `<span style="color:${C.teal}">C₁ = ${fmt(P.C1 * 1e15, 2)} fF · C₂ = ${fmt(P.C2 * 1e15, 2)} fF · ΔC = ${fmt((P.C1 - P.C2) * 1e15, 3)} fF</span> · ` +
          `<span style="color:${C.yellow}">V_out = ${fmt(P.V * 1e3, 2)} mV</span> (V_ex = 1 V)<br>` +
          `three axes (a_x, a_y, a_z) = (${fmt(P.ax, 2)}, ${fmt(P.ay, 2)}, ${fmt(P.az, 2)}) g → ` +
          `<span style="color:${C.green}">pitch ${fmt(P.pr, 1)}°, roll ${fmt(P.rl, 1)}°</span>` +
          (Math.abs(push) > 0.01 ? ` <span style="color:${C.red}">(the push fools the tilt estimate!)</span>` : "");
      }
      update();

      ui.steps([
        "<b>Newton.</b> The frame accelerates and the proof mass is only dragged along by its springs, so the springs must supply \\( F=ma \\). Tilting does the same job: the part of gravity along the sense axis is \\( a_x=g_{\\text{grav}}\\sin\\theta_p \\). The purple arrow is the inertial force \\( -ma \\) the mass feels.",
        "<b>Hooke.</b> At rest in the moving frame: \\( kx=ma \\;\\Rightarrow\\; x=\\dfrac{m}{k}\\,a=\\dfrac{a}{\\omega_0^2} \\). With \\( m=1\\,\\mu\\text{g} \\), \\( f_0=3 \\) kHz: \\( k=0.355 \\) N/m and 1 g gives \\( x=27.6 \\) nm. The springs light up: they do the work.",
        "<b>Two capacitors.</b> Every moving finger sits between two fixed ones: \\( C_1=\\dfrac{\\varepsilon_0A}{g_0-x} \\), \\( C_2=\\dfrac{\\varepsilon_0A}{g_0+x} \\). One gap closes, the other opens. With \\( A=4\\times10^{-8}\\,\\text{m}^2 \\), \\( g_0=2\\,\\mu\\text{m} \\): \\( C_0=177 \\) fF.",
        "<b>Differential.</b> \\( C_1-C_2=\\dfrac{2\\varepsilon_0A\\,x}{g_0^2-x^2}\\approx 2C_0\\dfrac{x}{g_0} \\): the common part cancels and the change doubles. 1 g → 4.89 fF; 1 mg → 4.9 aF.",
        "<b>To volts.</b> Drive the outer plates with \\( \\pm V_{\\text{ex}} \\) and read the middle: \\( V_{\\text{out}}=V_{\\text{ex}}\\dfrac{C_1-C_2}{C_1+C_2}=V_{\\text{ex}}\\dfrac{x}{g_0} \\), exactly linear in \\( x \\). For 1 V: 13.8 mV per g.",
        "<b>Tilt.</b> Three such axes read \\( (a_x,a_y,a_z)=g_{\\text{grav}}(\\sin\\theta_p,\\;\\cos\\theta_p\\sin\\phi_r,\\;\\cos\\theta_p\\cos\\phi_r) \\), so \\( \\theta_p=\\operatorname{atan2}\\big(a_x,\\sqrt{a_y^2+a_z^2}\\big) \\), \\( \\phi_r=\\operatorname{atan2}(a_y,a_z) \\). Add a push and the formula is fooled: gravity and acceleration look the same.",
      ], (i) => { step = i; sc.render(); update(); });
    },
  });

  // ══════════════════════════════ 2. the vibratory gyroscope on a turntable ══════════════════════════════
  register("b4-gyro-3d", {
    title: "3D · a vibrating-mass gyroscope: Coriolis turns rotation into a sideways wiggle",
    target: "After this you can explain why a gyro must keep its mass moving, compute the Coriolis force 2mΩv, and see why mode matching trades bandwidth for signal.",
    caption: "the <span style='color:" + C.purple + "'>mass</span> is driven back and forth along x; while the turntable spins at <span style='color:" + C.blue + "'>Ω</span> the <span style='color:" + C.purple + "'>Coriolis force</span> pushes it sideways along y, always at right angles to its <span style='color:" + C.white + "'>velocity</span>. The <span style='color:" + C.yellow + "'>yellow trace</span> is the path in the chip frame: a straight line with no rotation, an ellipse with rotation (a tilted line when the modes are matched, because the response then lags by 90°), mirrored for negative Ω. Motion is slowed and exaggerated; the scope shows drive (purple) and sense (yellow).",
    links: [
      { id: "B3", why: "drive and sense are two resonant modes, Q_f from damping" },
      { id: "A3", why: "the sideways nanometres are read by capacitor plates" },
      { id: "A7", why: "demodulating at the drive frequency is a lock-in amplifier" },
      { id: "A9", why: "the gyro rate is integrated and corrected by the accelerometer" },
    ],
    build(fig, ui) {
      let Om = 100, df = 1000, step = 1;
      const md = 1e-9, fd = 20000, Xd = 10e-6, Qf = 1000, wv = 2 * Math.PI * 0.55;
      function phys() {
        const wd = 2 * Math.PI * fd, ws = 2 * Math.PI * (fd + df);
        const v = wd * Xd, F = 2 * md * Math.abs(Om) * D2R * v;
        const den = Math.sqrt(Math.pow(ws * ws - wd * wd, 2) + Math.pow((ws * wd) / Qf, 2));
        const y = F / (md * den), ystat = F / (md * ws * ws);
        const lag = Math.atan2((ws * wd) / Qf, ws * ws - wd * wd);
        return { v, F, y, ystat, lag };
      }
      const yVis = (P) => (step >= 1 ? 0.55 * Math.tanh(P.y / 6e-9) * Math.sign(Om) : 0);
      // local chip coordinates of the mass at time s
      const pos = (s, P) => [0.5 * Math.sin(wv * s), -yVis(P) * Math.cos(wv * s - P.lag)];

      const sc = scene3d(ui.body, {
        w: 640, h: 420, scale: 76, yaw: -0.45, pitch: 0.8, center: [0, 0, 0.1], animate: !VIZ.reduceMotion,
        draw(g, t) {
          if (VIZ.reduceMotion) t = 0.45;
          const P = phys();
          const psi = Om * D2R * 0.5 * t;
          const R = (p) => [p[0] * Math.cos(psi) - p[1] * Math.sin(psi), p[0] * Math.sin(psi) + p[1] * Math.cos(psi), p[2]];
          // turntable
          const n = 40, rT = 2.75, ring = [];
          for (let i = 0; i < n; i++) { const a = (2 * Math.PI * i) / n; ring.push([rT * Math.cos(a), rT * Math.sin(a)]); }
          g.poly(ring.map(([x, y]) => [x, y, -0.12]), "#2a323c", { bias: -60, shade: false });
          for (let i = 0; i < n; i++) {
            const a = ring[i], b = ring[(i + 1) % n];
            g.poly([[a[0], a[1], -0.12], [b[0], b[1], -0.12], [b[0], b[1], -0.42], [a[0], a[1], -0.42]], "#20262e", { bias: -70 });
          }
          for (let i = 0; i < 6; i++) { const a = (Math.PI * i) / 3 + 0.3; g.line(R([2.0 * Math.cos(a), 2.0 * Math.sin(a), -0.11]), R([2.6 * Math.cos(a), 2.6 * Math.sin(a), -0.11]), "#4a5664", 2); }
          // chip: substrate and frame
          g.poly([[-1.75, -1.55, -0.1], [1.75, -1.55, -0.1], [1.75, 1.55, -0.1], [-1.75, 1.55, -0.1]].map(R), mix(C.silicon, "#000000", 0.45), { bias: -40, shade: false });
          const zf = 0.3, fr = C.silicon;
          tbox(g, R, [-1.75, -1.55, -0.1], [1.75, -1.38, zf], fr); tbox(g, R, [-1.75, 1.38, -0.1], [1.75, 1.55, zf], fr);
          tbox(g, R, [-1.75, -1.38, -0.1], [-1.58, 1.38, zf], fr); tbox(g, R, [1.58, -1.38, -0.1], [1.75, 1.38, zf], fr);
          // drive combs (fixed, teal) and sense plates (teal, brighter when they are being read)
          const sCol = step >= 3 ? mix(C.teal, C.white, 0.35) : mix(C.teal, C.silicon, 0.45);
          tbox(g, R, [-1.4, -0.35, -0.1], [-1.25, 0.35, 0.2], mix(C.teal, C.silicon, 0.3));
          tbox(g, R, [1.25, -0.35, -0.1], [1.4, 0.35, 0.2], mix(C.teal, C.silicon, 0.3));
          tbox(g, R, [-0.6, 1.05, -0.1], [0.6, 1.2, 0.2], sCol);
          tbox(g, R, [-0.6, -1.2, -0.1], [0.6, -1.05, 0.2], sCol);
          // the mass and its springs
          const [mx, my] = pos(t, P);
          const ms = 0.42;
          tbox(g, R, [mx - ms, my - ms, 0], [mx + ms, my + ms, 0.22], mix(C.purple, C.silicon, 0.25));
          [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
            g.polyline(meander([mx + sx * ms, my + sy * ms, 0.11], [sx * 1.5, sy * 1.3, 0.11], 5, 0.07).map(R), C.purple, 2);
          });
          // the path in the chip frame
          if (step >= 2) {
            const tr = [];
            for (let i = 0; i <= 48; i++) { const s = t - (2 * Math.PI / wv) * (i / 48); const q = pos(s, P); tr.push(R([q[0], q[1], 0.25])); }
            g.polyline(tr, C.yellow, 1.8);
          }
          // arrows: Ω, velocity, Coriolis force
          const sgn = Math.sign(Om) || 1;
          if (Math.abs(Om) > 0.5) {
            const zA = sgn > 0 ? 0 : 1.6, zB = zA + sgn * (0.6 + Math.abs(Om) / 300);
            g.arrow([2.3, -2.0, zA], [2.3, -2.0, zB], ROLE.s, 4);
            g.text([2.6, -2.0, Math.max(zA, zB) + 0.2], "Ω", ROLE.s, 16);
            const arc = [];
            for (let i = 0; i <= 16; i++) { const a = sgn * (-0.3 + (4.2 * i) / 16); arc.push([2.3 + 0.35 * Math.cos(a), -2.0 + 0.35 * Math.sin(a), (zA + zB) / 2]); }
            g.polyline(arc, ROLE.s, 2);
          }
          const vx = Math.cos(wv * t);
          if (Math.abs(vx) > 0.05) {
            g.arrow(R([mx, my, 0.4]), R([mx + 0.8 * vx, my, 0.4]), C.white, 2.5);
            g.text(R([mx + 0.8 * vx + 0.22 * Math.sign(vx), my, 0.5]), "v", C.white, 13);
          }
          if (step >= 1 && Math.abs(Om) > 0.5) {
            const Fy = -sgn * vx * (0.35 + Math.abs(Om) / 450);
            if (Math.abs(Fy) > 0.05) {
              g.arrow(R([mx, my, 0.4]), R([mx, my + Fy, 0.4]), mix(C.purple, C.white, 0.35), 3.5);
              g.text(R([mx + 0.1, my + Fy + 0.2 * Math.sign(Fy), 0.55]), "F_c", C.purple, 13);
            }
          }
          g.text(R([0, 1.85, 0.3]), "sense y", C.teal, 11);
          g.text(R([2.2, 0, 0.3]), "drive x", C.dim, 11);
        },
        overlay(ctx, scn) {
          const P = phys(), t = VIZ.reduceMotion ? 0.45 : scn.t;
          const x0 = 444, y0 = 8, w = 188, h = step >= 5 ? 112 : 84;
          panel(ctx, x0, y0, w, h);
          txt(ctx, "drive x(t)", x0 + 8, y0 + 12, C.purple, 11);
          txt(ctx, "sense y(t)", x0 + w - 8, y0 + 12, C.yellow, 11, "right");
          const plot = (fn, col, amp) => {
            ctx.strokeStyle = css(col); ctx.lineWidth = 1.8; ctx.beginPath();
            for (let i = 0; i <= 80; i++) { const s = t - 4 + (4 * i) / 80; const v = fn(s); const X = x0 + 8 + ((w - 16) * i) / 80, Y = y0 + 48 - v * amp; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
            ctx.stroke();
          };
          plot((s) => pos(s, P)[0] / 0.5, C.purple, 22);
          plot((s) => pos(s, P)[1] / 0.55, C.yellow, 22);
          if (step >= 5) {
            // demodulated output: y(t) times a reference locked to the Coriolis force (phase lag known), low-passed → ∝ Ω
            const out = yVis(P) / 0.55;
            txt(ctx, "demodulated rate", x0 + 8, y0 + 86, C.text, 11);
            ctx.fillStyle = "#1d2530"; ctx.fillRect(x0 + 8, y0 + 96, w - 16, 9);
            ctx.fillStyle = css(C.yellow); const bw = clamp(out, -1, 1) * (w - 16) / 2;
            ctx.fillRect(x0 + w / 2 + Math.min(0, bw), y0 + 96, Math.abs(bw), 9);
          }
        },
      });

      ui.slider("rotation Ω", -300, 300, 10, Om, (v) => { Om = v; update(); if (!sc.o.animate) sc.render(); return v + " °/s"; });
      const sDf = ui.slider("mode split Δf", 0, 2000, 50, df, (v) => { df = v; update(); if (!sc.o.animate) sc.render(); return v === 0 ? "0 (matched)" : v + " Hz"; });

      function update() {
        const P = phys();
        ui.read.innerHTML =
          `drive f_d = 20 kHz, X_d = 10 µm → v_max = ω_d X_d = ${fmt(P.v, 3)} m/s · m = 1 µg<br>` +
          `<span style="color:${C.purple}">F_c = 2mΩv = ${fmt(P.F * 1e9, 2)} nN</span> (${fmt(P.F / (md * GRAV), 3)} × its weight) · ` +
          `<span style="color:${C.yellow}">sense amplitude y = ${P.y * 1e9 >= 10 ? fmt(P.y * 1e9, 0) : fmt(P.y * 1e9, 2)} nm</span>` +
          ` (static F/k_s = ${fmt(P.ystat * 1e9, 3)} nm, gain ×${fmt(P.y / P.ystat, 1)})<br>` +
          (df === 0 ? `<span style="color:${C.red}">mode-matched: Q_f = 1000 gives ×${fmt(P.y / P.ystat, 0)}, but the bandwidth shrinks to f_d/(2Q_f) = 10 Hz</span>`
            : `sense mode at ${fmt((fd + df) / 1000, 2)} kHz: the closer to 20 kHz, the bigger y, the slower the response`);
      }
      update();

      ui.steps([
        "<b>Drive.</b> An electrostatic comb shakes the mass along \\( x \\) at its resonance: \\( x=X_d\\sin\\omega_dt \\), so \\( \\dot x=\\omega_dX_d\\cos\\omega_dt \\). With \\( X_d=10\\,\\mu\\text{m} \\), \\( f_d=20 \\) kHz: \\( v_{\\max}=1.257 \\) m/s.",
        "<b>Coriolis.</b> Seen from the rotating chip, a moving mass feels \\( \\mathbf F=-2m\\,\\boldsymbol\\Omega\\times\\mathbf v \\), of size \\( 2m\\Omega\\dot x \\), at right angles to both. 100 °/s on 1 µg: \\( F=2(10^{-9})(1.745)(1.257)=4.39 \\) nN.",
        "<b>It wiggles.</b> \\( \\dot x \\) flips sign every half cycle, so the force (and the sideways motion) oscillates at \\( \\omega_d \\) with amplitude \\( \\propto\\Omega \\). The path becomes an ellipse whose width measures \\( \\Omega \\).",
        "<b>Sense mode.</b> The sideways spring–mass answers like any driven oscillator: \\( y=\\dfrac{F}{m\\sqrt{(\\omega_s^2-\\omega_d^2)^2+(\\omega_s\\omega_d/Q_f)^2}} \\). With \\( f_s=21 \\) kHz: \\( y=2.71 \\) nm, 10.8 × the static \\( F/k_s=0.252 \\) nm.",
        "<b>Mode matching.</b> Put \\( \\omega_s=\\omega_d \\): \\( y=Q_f\\,F/k \\), here \\( 1000\\times \\) bigger, 278 nm. The price: the response builds up over \\( Q_f \\) cycles, so the bandwidth is only \\( f_d/(2Q_f)=10 \\) Hz.",
        "<b>Demodulate.</b> Multiply the sense signal by a reference locked to the drive (shifted by the sense mode's known phase lag) and low-pass: the 20 kHz wiggle becomes a steady number \\( \\propto\\Omega \\), with its sign. Turn \\( \\Omega \\) negative and the bar flips.",
      ], (i) => {
        step = i;
        if (i === 4 && df !== 0) sDf.set(0);
        if (i === 3 && df === 0) sDf.set(1000);
        update(); if (!sc.o.animate) sc.render();
      });
    },
  });

  // ══════════════════════════════ 3. bias and noise integrate: why the gyro drifts ══════════════════════════════
  register("b4-drift", {
    title: "Gyro drift: integrating a small bias gives a growing angle error",
    target: "After this you can predict the angle error of a gyro from its bias (Ω_b·t) and noise density (N_Ω√t), and see why an accelerometer is used to pull it back.",
    caption: "a drone rocks gently (<span style='color:" + C.white + "'>dashed</span> = true tilt). Integrating the gyro rate gives the <span style='color:" + C.red + "'>red</span> estimate: smooth but it walks away along Ω_b·t, inside the <span style='color:" + C.red + "'>shaded</span> ±N_Ω√t band. The accelerometer's tilt (<span style='color:" + C.blue + "'>blue</span>) never drifts but is jittery from vibration. The <span style='color:" + C.green + "'>green</span> complementary filter trusts the gyro for fast changes and the accelerometer for the long run.",
    links: [
      { id: "A8", why: "bias, noise density and drift are defined there" },
      { id: "A9", why: "the green line is the simplest version of the Kalman filter" },
      { id: "A7", why: "the blend is a low-pass on one sensor plus a high-pass on the other" },
    ],
    build(fig, ui) {
      let bias = 0.05, N = 0.01, tau = 2, seed = 7;
      const Tm = 120, fs = 50, dt = 1 / fs, sAcc = 1.5;
      const ch = chart(ui.body, { w: 640, h: 300, xr: [0, Tm], yr: [-9, 19], xlabel: "time t (s)", ylabel: "tilt angle (°)" });
      const band = ch.area(C.red, 0.13);
      const lAcc = ch.line(C.blue, 1); lAcc.el.setAttribute("opacity", 0.5);
      const lTrue = ch.line(C.white, 1.6, "5 4");
      const lGyro = ch.line(C.red, 2.4);
      const lFuse = ch.line(C.green, 2.6);
      const lab1 = ch.label(C.red, 12.5), lab2 = ch.label(C.green, 12.5), lab3 = ch.label(C.blue, 12.5);
      function run() {
        const r = rng(seed), true_ = [], acc = [], gyro = [], fuse = [], lo = [], hi = [];
        let th = 0, f = 0, e2f = 0, e2a = 0, n = 0;
        const sRate = N * Math.sqrt(fs), al = tau / (tau + dt);
        for (let i = 0; i <= Tm * fs; i++) {
          const t = i * dt, tt = 6 * Math.sin((2 * Math.PI * t) / 25), rate = ((6 * 2 * Math.PI) / 25) * Math.cos((2 * Math.PI * t) / 25);
          const meas = rate + bias + sRate * gauss(r);
          const a = tt + sAcc * gauss(r);
          if (i > 0) { th += meas * dt; f = al * (f + meas * dt) + (1 - al) * a; }
          if (i % 5 === 0) { true_.push([t, tt]); gyro.push([t, th]); fuse.push([t, f]); acc.push([t, a]); const c = tt + bias * t; lo.push([t, c - N * Math.sqrt(t)]); hi.push([t, c + N * Math.sqrt(t)]); }
          if (t > 10) { e2f += (f - tt) ** 2; e2a += (a - tt) ** 2; n++; }
        }
        // make the ±N√t band visible even when it is thin: at least ±0.15° wide
        band.set(lo.map(([t, v], j) => [t, Math.min(v, (lo[j][1] + hi[j][1]) / 2 - 0.15)]), hi.map(([t, v], j) => [t, Math.max(v, (lo[j][1] + hi[j][1]) / 2 + 0.15)]));
        lTrue.set(true_); lAcc.set(acc); lGyro.set(gyro); lFuse.set(fuse);
        const endErr = th - 6 * Math.sin((2 * Math.PI * Tm) / 25);
        lab1.set(3, 16.4, "gyro only");
        lab3.set(30, 16.4, "accelerometer tilt");
        lab2.set(74, 16.4, "fused (complementary)");
        ui.read.innerHTML =
          `after ${Tm} s: <span style="color:${C.red}">gyro-only error = ${fmt(endErr, 2)}°</span> ` +
          `(bias predicts Ω_b·t = ${fmt(bias * Tm, 2)}°, noise adds ±N_Ω√t = ±${fmt(N * Math.sqrt(Tm), 2)}°)<br>` +
          `<span style="color:${C.blue}">accelerometer rms error = ${fmt(Math.sqrt(e2a / n), 2)}°</span> (vibration) · ` +
          `<span style="color:${C.green}">fused rms error = ${fmt(Math.sqrt(e2f / n), 2)}°</span> with τ = ${fmt(tau, 1)} s · ` +
          `ARW = 60·N_Ω = ${fmt(60 * N, 2)} °/√h`;
      }
      ui.slider("gyro bias Ω_b", 0, 0.1, 0.005, bias, (v) => { bias = v; run(); return fmt(v, 3) + " °/s"; });
      ui.slider("noise N_Ω", 0.002, 0.05, 0.002, N, (v) => { N = v; run(); return fmt(v, 3) + " °/s/√Hz"; });
      ui.slider("blend τ", 0.2, 20, 0.2, tau, (v) => { tau = v; run(); return fmt(v, 1) + " s"; });
      ui.button("new noise", () => { seed = (seed * 7919 + 13) % 100000; run(); });
      run();
    },
  });
})();
