/* A9 — sensor fusion and the Kalman filter: widgets for docs/A9-sensor-fusion-and-the-kalman-filter.md */
(function () {
  "use strict";
  const { register, C, scene3d, chart, fmt, rng, gauss, mix, S, H } = VIZ;
  const gpdf = (x, m, s) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));

  // ── a9-two-guesses: inverse-variance weighting, derived as the minimum-variance blend ─────────────────
  register("a9-two-guesses", {
    title: "Two noisy guesses · the best blend weights each by 1/σ²",
    target: "Derive the minimum-variance blend of two readings, x̂ = (z₁/σ₁² + z₂/σ₂²)/(1/σ₁² + 1/σ₂²), see why the result is narrower than both, and rewrite it as the Kalman update x̂ = z₁ + K(z₂ − z₁).",
    caption: "top: the barometer's altitude reading z₁ (yellow) and the GPS reading z₂ (teal) as bell curves of width σ; the green curve is the fused estimate. Bottom: the variance of the blend w z₁ + (1 − w) z₂ for every weight w, a parabola whose lowest point is the optimal weight. Step through the derivation; then move the sliders and see the fused curve lean towards the more reliable sensor.",
    links: [
      { id: "A8", why: "the σ of each sensor comes from its noise floor; weighted least squares gives the same formula" },
      { id: "A3", why: "averaging two capacitive electrodes is the equal-σ special case" },
      { id: "B4", why: "a phone fuses gyro and accelerometer tilt this way, sample by sample" },
    ],
    build(fig, ui) {
      let z1 = 102, z2 = 98, s1 = 2, s2 = 4, step = 0;
      const holder = H("div", {}, ui.body);
      function draw() {
        holder.innerHTML = "";
        const v1 = s1 * s1, v2 = s2 * s2, wst = v2 / (v1 + v2), xf = wst * z1 + (1 - wst) * z2, vf = (v1 * v2) / (v1 + v2), sf = Math.sqrt(vf);
        const top = 1.18 * gpdf(0, 0, step >= 3 ? sf : Math.min(s1, s2));
        const ch = chart(holder, { w: 640, h: 240, xr: [86, 114], yr: [0, top], xlabel: "altitude (m)", ylabel: "probability density" });
        const curve = (m, s, col, w, dash) => { const l = ch.line(col, w, dash); const p = []; for (let i = 0; i <= 280; i++) { const x = 86 + i / 10; p.push([x, gpdf(x, m, s)]); } l.set(p); return l; };
        const a1 = ch.area(C.yellow, 0.12), a2 = ch.area(C.teal, 0.12);
        const base = (m, s) => { const lo = [], hi = []; for (let i = 0; i <= 280; i++) { const x = 86 + i / 10; lo.push([x, 0]); hi.push([x, gpdf(x, m, s)]); } return [lo, hi]; };
        a1.set(...base(z1, s1)); a2.set(...base(z2, s2));
        curve(z1, s1, C.yellow, 2.4); curve(z2, s2, C.teal, 2.4);
        ch.label(C.yellow, 12.5).set(z1 + 0.5, gpdf(z1, z1, s1) * 1.03, "barometer z₁ = " + fmt(z1, 1) + " ± " + fmt(s1, 1));
        ch.label(C.teal, 12.5, "end").set(z2 - 0.5, gpdf(z2, z2, s2) + top * 0.04, "GPS z₂ = " + fmt(z2, 1) + " ± " + fmt(s2, 1));
        const w = step >= 3 ? wst : 0.5, xw = w * z1 + (1 - w) * z2, sw = Math.sqrt(w * w * v1 + (1 - w) ** 2 * v2);
        if (step >= 1 && step < 3) { curve(xw, sw, C.dim, 2, "6 4"); ch.label(C.dim, 12).set(xw + sw, gpdf(xw + sw, xw, sw) + top * 0.05, "w = ½ blend: σ = " + fmt(sw, 2)); }
        if (step >= 3) {
          curve(xf, sf, C.green, 3.2);
          ch.label(C.green, 12.5, "end").set(xf - sf * 0.9, gpdf(xf, xf, sf) * 1.04, "fused " + fmt(xf, 2) + " ± " + fmt(sf, 2));
          ch.vline(C.green, "3 3").set(xf);
        }
        if (step >= 4) {   // the normalised product of the two Gaussians lies exactly on the green curve
          const l = ch.line(C.white, 1.6, "2 4"), p = []; let Z = 0; const raw = [];
          for (let i = 0; i <= 280; i++) { const x = 86 + i / 10, q = gpdf(x, z1, s1) * gpdf(x, z2, s2); raw.push([x, q]); Z += q * 0.1; }
          raw.forEach(([x, q]) => p.push([x, q / Z])); l.set(p);
        }
        if (step >= 5) {   // K (z2 − z1) as an arrow from z1
          const K = v1 / (v1 + v2), yA = top * 0.1;
          const a = S("line", { x1: ch.X(z1), y1: ch.Y(yA), x2: ch.X(z1 + K * (z2 - z1)), y2: ch.Y(yA), stroke: C.purple, "stroke-width": 3, "marker-end": "" }, ch.gTop);
          S("circle", { cx: ch.X(z1 + K * (z2 - z1)), cy: ch.Y(yA), r: 4.5, fill: C.purple }, ch.gTop);
          ch.label(C.purple, 12, "middle").set(z1 + 0.5 * K * (z2 - z1), yA + top * 0.06, "K (z₂ − z₁), K = " + fmt(K, 2));
          void a;
        }
        // variance as a function of w
        const vmax = Math.max(v1, v2) * 1.08;
        const vc = chart(holder, { w: 640, h: 150, xr: [0, 1], yr: [0, vmax], xlabel: "weight w on the barometer", ylabel: "variance (m²)", mt: 8 });
        if (step >= 2) {
          const l = vc.line(C.red, 2.4), p = []; for (let i = 0; i <= 100; i++) { const ww = i / 100; p.push([ww, ww * ww * v1 + (1 - ww) ** 2 * v2]); } l.set(p);
          vc.label(C.red, 12).set(0.03, v2 * 0.88, "σ²(w) = w²σ₁² + (1−w)²σ₂²");
        }
        if (step >= 1) { vc.dot(step >= 3 ? C.green : C.dim, 6).set(w, w * w * v1 + (1 - w) ** 2 * v2); vc.vline(step >= 3 ? C.green : C.dim, "3 3").set(w); }
        if (step >= 3) vc.label(C.green, 12, wst > 0.5 ? "end" : "start").set(wst > 0.5 ? wst - 0.02 : wst + 0.02, vf + vmax * 0.12, "w* = σ₂²/(σ₁²+σ₂²) = " + fmt(wst, 3));
        ui.read.innerHTML = `weights: barometer <b>${fmt(wst, 3)}</b>, GPS <b>${fmt(1 - wst, 3)}</b> · fused x̂ = <b style="color:${C.green}">${fmt(xf, 2)} m</b> · ` +
          `σ = <b style="color:${C.green}">${fmt(sf, 3)} m</b> (smaller than both ${fmt(s1, 1)} and ${fmt(s2, 1)}) · plain average would give σ = ${fmt(Math.sqrt(0.25 * (v1 + v2)), 3)} m`;
      }
      ui.slider("GPS z₂", 90, 110, 0.5, z2, (v) => { z2 = v; draw(); return fmt(v, 1) + " m"; });
      ui.slider("σ₁ baro", 0.5, 6, 0.25, s1, (v) => { s1 = v; draw(); return fmt(v, 2) + " m"; });
      ui.slider("σ₂ GPS", 0.5, 6, 0.25, s2, (v) => { s2 = v; draw(); return fmt(v, 2) + " m"; });
      ui.steps([
        "Two readings of the same altitude: barometer \\( z_1 = 102 \\) m with \\( \\sigma_1 = 2 \\) m, GPS \\( z_2 = 98 \\) m with \\( \\sigma_2 = 4 \\) m. Their errors are independent.",
        "Try any blend \\( \\hat x = w\\,z_1 + (1-w)\\,z_2 \\). Because the weights add to 1, it is unbiased for every \\( w \\). The grey dashed curve is the plain average \\( w = \\tfrac12 \\).",
        "Its variance (independent errors add as squares): \\( \\sigma^2(w) = w^2\\sigma_1^2 + (1-w)^2\\sigma_2^2 \\): a parabola in \\( w \\) (red, bottom).",
        "Minimise: \\( \\dfrac{d\\sigma^2}{dw} = 2w\\sigma_1^2 - 2(1-w)\\sigma_2^2 = 0 \\Rightarrow w^* = \\dfrac{\\sigma_2^2}{\\sigma_1^2+\\sigma_2^2} = \\dfrac{16}{20} = 0.8 \\). Fused: \\( \\hat x = 101.2 \\) m.",
        "Rearranged: \\( \\hat x = \\dfrac{z_1/\\sigma_1^2 + z_2/\\sigma_2^2}{1/\\sigma_1^2 + 1/\\sigma_2^2} \\) and \\( \\dfrac{1}{\\sigma^2} = \\dfrac1{\\sigma_1^2} + \\dfrac1{\\sigma_2^2} \\): precisions add, so \\( \\sigma = 1.79 \\) m. Multiplying the two bells and renormalising (white dots) gives the same curve.",
        "Kalman form: \\( \\hat x = z_1 + K\\,(z_2 - z_1) \\) with \\( K = \\dfrac{\\sigma_1^2}{\\sigma_1^2+\\sigma_2^2} = 0.2 \\). Call \\( z_1 \\) the prediction (variance \\( p \\)) and \\( z_2 \\) the new measurement: \\( K = p/(p+\\sigma_v^2) \\).",
      ], (i) => { step = i; if (i < 5) { /* keep sliders */ } draw(); });
    },
  });

  // ── a9-kalman: 1D altitude from barometer + accelerometer, predict / update ────────────────────────────
  register("a9-kalman", {
    title: "1D Kalman filter · drone altitude from a jittery barometer and a drifting accelerometer",
    target: "Run the predict/update cycle by hand (x̂⁻ = x̂ + uΔt, p⁻ = p + σ_w², K = p⁻/(p⁻ + σ_v²), x̂ = x̂⁻ + K(z − x̂⁻), p = (1 − K)p⁻) and predict how σ_v and σ_w change the gain and the result.",
    caption: "top: the <span style='color:" + C.blue + "'>true altitude</span> (climb, hover, descend), the <span style='color:" + C.yellow + "'>barometer readings</span>, the <span style='color:" + C.red + "'>accelerometer-only estimate</span> that drifts away, and the <span style='color:" + C.green + "'>Kalman estimate</span> with its ±√p band. Bottom: a zoom on the last two seconds. Press <b>next</b> to alternate predict (the band widens by σ_w) and update (the estimate jumps a fraction K towards the new reading and the band shrinks).",
    links: [
      { id: "A8", why: "σ_v is the barometer's noise floor and σ_w the accelerometer's drift, measured as in A8" },
      { id: "A7", why: "in steady state this filter is a first-order low-pass with a self-tuned cutoff" },
      { id: "B5", why: "the MEMS barometer that produces z" },
      { id: "B4", why: "the MEMS accelerometer that produces u" },
    ],
    build(fig, ui) {
      let sv = 1.5, sw = 0.1, k = 150, ph = 1;
      const dt = 0.1, N = 300;
      const ss = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
      const htrue = (t) => (t < 9 ? 20 * ss((t - 2) / 7) : t < 17 ? 20 : 20 - 12 * ss((t - 17) / 7));
      const r = rng(17), zn = [], un = [], bn = [];
      for (let i = 0; i <= N; i++) { zn.push(gauss(r)); un.push(gauss(r)); bn.push(gauss(r)); }
      let F = null;
      function sim() {
        const T = [], Z = [], U = [], DR = [], XM = [], PM = [], KK = [], XH = [], P = [];
        let bias = 0.15;
        for (let i = 0; i <= N; i++) {
          const t = i * dt; T.push(htrue(t));
          Z.push(T[i] + sv * zn[i]);
          bias += 0.005 * bn[i];
          U.push((htrue(t + 0.05) - htrue(t - 0.05)) / 0.1 + bias + 0.3 * un[i]);
        }
        let xh = Z[0], p = sv * sv, dr = Z[0];
        XM.push(xh); PM.push(p); KK.push(1); XH.push(xh); P.push(p); DR.push(dr);
        for (let i = 1; i <= N; i++) {
          const xm = xh + U[i - 1] * dt, pm = p + sw * sw, K = pm / (pm + sv * sv);
          xh = xm + K * (Z[i] - xm); p = (1 - K) * pm; dr += U[i - 1] * dt;
          XM.push(xm); PM.push(pm); KK.push(K); XH.push(xh); P.push(p); DR.push(dr);
        }
        F = { T, Z, U, DR, XM, PM, KK, XH, P };
      }
      const main = chart(ui.body, { w: 640, h: 240, xr: [0, N * dt], yr: [-8, 30], xlabel: "time (s)", ylabel: "altitude (m)" });
      const band = main.area(C.green, 0.22), lT = main.line(C.blue, 2, "6 4"), lDR = main.line(C.red, 2, "4 3"), lX = main.line(C.green, 2.6);
      const gZ = S("g", {}, main.gMain), vNow = main.vline(C.white, "2 3");
      const holder = H("div", {}, ui.body);
      function draw() {
        const t = (i) => i * dt;
        lT.set(F.T.map((v, i) => [t(i), v]));
        lDR.set(F.DR.slice(0, k + 1).map((v, i) => [t(i), v]));
        const upto = ph ? k : k - 1;
        lX.set(F.XH.slice(0, upto + 1).map((v, i) => [t(i), v]));
        band.set(F.XH.slice(0, upto + 1).map((v, i) => [t(i), v - Math.sqrt(F.P[i])]), F.XH.slice(0, upto + 1).map((v, i) => [t(i), v + Math.sqrt(F.P[i])]));
        gZ.innerHTML = "";
        for (let i = 0; i <= (ph ? k : k - 1); i++) S("circle", { cx: main.X(t(i)), cy: main.Y(F.Z[i]), r: 1.8, fill: C.yellow, "fill-opacity": 0.75 }, gZ);
        vNow.set(t(k));
        // zoom on the last 2 s
        holder.innerHTML = "";
        const t0 = t(k) - 2, t1 = t(k) + 0.75, yc = F.T[k], hr = 2.6 * sv + 1.2;
        const zc = chart(holder, { w: 640, h: 190, xr: [t0, t1], yr: [yc - hr, yc + hr], xlabel: "time (s), zoom", ylabel: "altitude (m)", mt: 10 });
        const bar = (x, y, s, col, w) => { zc.line(col, w || 2).set([[x, y - s], [x, y + s]]); };
        zc.line(C.blue, 2, "6 4").set(F.T.map((v, i) => [t(i), v]).filter(([x]) => x >= t0 - 0.2 && x <= t1 + 0.2));
        for (let i = Math.max(0, k - 21); i < k; i++) { zc.dot(C.yellow, 3).set(t(i), F.Z[i]); zc.dot(C.green, 3.5).set(t(i), F.XH[i]); }
        zc.line(C.green, 2).set(F.XH.slice(Math.max(0, k - 21), k).map((v, j) => [t(Math.max(0, k - 21) + j), v]));
        const xprev = F.XH[k - 1], xm = F.XM[k], pm = F.PM[k], K = F.KK[k];
        // predict: arrow from x̂(k−1) to x̂⁻(k), band ±√p⁻
        zc.line(C.purple, 2.2, "5 3").set([[t(k - 1), xprev], [t(k), xm]]);
        const dm = zc.dot(C.bg, 6); dm.set(t(k), xm); dm.el.setAttribute("stroke", C.green); dm.el.setAttribute("stroke-width", 2.5);
        bar(t(k) - 0.04, xm, Math.sqrt(pm), C.green, 2.4);
        zc.label(C.green, 12, "end").set(t(k) - 0.09, xm + Math.sqrt(pm) + hr * 0.08, "predict x̂⁻ ± √p⁻");
        if (ph) {
          zc.dot(C.yellow, 5).set(t(k), F.Z[k]); bar(t(k) + 0.04, F.Z[k], sv, C.yellow, 1.6);
          zc.label(C.yellow, 12).set(t(k) + 0.08, F.Z[k], "z ± σ_v");
          zc.line(C.purple, 2.6).set([[t(k), xm], [t(k), F.XH[k]]]);
          zc.dot(C.green, 6).set(t(k), F.XH[k]); bar(t(k) + 0.1, F.XH[k], Math.sqrt(F.P[k]), C.green, 3.2);
          zc.label(C.green, 12).set(t(k) + 0.15, F.XH[k] - hr * 0.22, "update x̂ ± √p");
        }
        // statistics
        const rms = (a) => Math.sqrt(a.reduce((s, v, i) => s + (v - F.T[i]) ** 2, 0) / a.length);
        const pinf = (sw * sw + Math.sqrt(sw ** 4 + 4 * sw * sw * sv * sv)) / 2, Kinf = pinf / (pinf + sv * sv);
        ui.read.innerHTML = `step k = ${k} (t = ${fmt(t(k), 1)} s) · <b>${ph ? "update" : "predict"}</b> · x̂⁻ = ${fmt(xm, 2)} m, p⁻ = ${fmt(pm, 3)} m² · ` +
          (ph ? `z = ${fmt(F.Z[k], 2)} m · K = p⁻/(p⁻ + σ_v²) = <b>${fmt(K, 3)}</b> · x̂ = <b style="color:${C.green}">${fmt(F.XH[k], 2)} m</b>, p = ${fmt(F.P[k], 3)} m²` : `waiting for the barometer…`) +
          `<br>steady-state gain K∞ = <b>${fmt(Kinf, 3)}</b> (averages about ${fmt(1 / Kinf, 0)} readings) · rms error: barometer ${fmt(rms(F.Z), 2)} m, accelerometer only ${fmt(rms(F.DR), 2)} m, <b style="color:${C.green}">Kalman ${fmt(rms(F.XH), 2)} m</b>`;
      }
      ui.slider("baro noise σ_v", 0.3, 4, 0.1, sv, (v) => { sv = v; sim(); draw(); return fmt(v, 1) + " m"; });
      ui.slider("model noise σ_w", 0.005, 0.5, 0.005, sw, (v) => { sw = v; sim(); draw(); return fmt(v, 3) + " m"; });
      ui.button("next ▶ (predict / update)", () => { if (ph) { if (k < N) { k++; ph = 0; } } else ph = 1; draw(); });
      ui.button("run to the end", () => { k = N; ph = 1; draw(); });
      ui.button("restart", () => { k = 1; ph = 0; draw(); });
      sim(); draw();
    },
  });

  // ── a9-drone-3d: GPS + IMU fusion in 3D with an uncertainty ellipsoid ──────────────────────────────────
  register("a9-drone-3d", {
    title: "3D · a drone fuses 1 Hz GPS with a 20 Hz IMU: the 2σ uncertainty ellipsoid breathes",
    target: "See how a Kalman filter blends a slow, noisy but drift-free sensor (GPS) with a fast but drifting one (accelerometer): the uncertainty grows between fixes, shrinks at each fix, and balloons during a GPS outage.",
    caption: "<span style='color:" + C.blue + "'>blue</span>: the true flight path over a field; <span style='color:" + C.red + "'>red</span>: the last GPS fixes (σ horizontal, 1.5σ vertical); <span style='color:" + C.green + "'>green</span>: the fused trail and the 2σ ellipsoid around the current estimate. The ellipsoid is taller than wide because GPS is worse vertically. Press <b>GPS outage</b> (t = 15–27 s, e.g. under a bridge or trees): the filter coasts on the accelerometer and its ellipsoid grows like t², then snaps back at the first fix.",
    links: [
      { id: "B4", why: "the MEMS accelerometer and gyro inside the IMU" },
      { id: "A8", why: "accelerometer bias is the drift that GPS keeps correcting" },
      { id: "B3", why: "the predict step is Newton's law, the same model as a mass–spring" },
      { id: "A5", why: "LiDAR and optical flow are the next sensors you would fuse in" },
    ],
    build(fig, ui) {
      let sg = 3, outage = false, paused = false, tView = 22;
      const dt = 0.05, T = 40, NS = Math.round((2 * T) / dt), om = (2 * Math.PI) / T;
      const pos = (t) => [22 * Math.sin(om * t), 14 * Math.sin(2 * om * t), 10 + 4 * Math.sin(om * t + 1)];
      const vel = (t) => [22 * om * Math.cos(om * t), 28 * om * Math.cos(2 * om * t), 4 * om * Math.cos(om * t + 1)];
      const acc = (t) => [-22 * om * om * Math.sin(om * t), -56 * om * om * Math.sin(2 * om * t), -4 * om * om * Math.sin(om * t + 1)];
      const r = rng(31), an = [], gn = [];
      for (let i = 0; i <= NS; i++) an.push([gauss(r), gauss(r), gauss(r)]);
      for (let i = 0; i <= 2 * T + 1; i++) gn.push([gauss(r), gauss(r), gauss(r)]);
      const bias = [0.06, -0.05, 0.04], sa = 0.3;
      let sim = null;
      function run() {
        const X = [], Sd = [], G = [], DR = [];
        const st = [0, 1, 2].map((a) => ({ x: pos(0)[a], v: vel(0)[a], p00: 4, p01: 0, p11: 1 }));
        const dr = [0, 1, 2].map((a) => ({ x: pos(0)[a], v: vel(0)[a] }));
        const q = sa * sa * 20;   // inflated to cover the unmodelled accelerometer bias
        for (let i = 0; i <= NS; i++) {
          const t = i * dt, ta = acc(t);
          if (i > 0) for (let a = 0; a < 3; a++) {
            const u = ta[a] + bias[a] + sa * an[i][a], s = st[a];
            s.x += s.v * dt + 0.5 * u * dt * dt; s.v += u * dt;
            s.p00 += 2 * dt * s.p01 + dt * dt * s.p11 + q * dt ** 4 / 4; s.p01 += dt * s.p11 + q * dt ** 3 / 2; s.p11 += q * dt * dt;
            dr[a].x += dr[a].v * dt + 0.5 * u * dt * dt; dr[a].v += u * dt;
          }
          const tm = t % T, gpsOn = !(outage && tm >= 15 && tm < 27);
          if (i % 20 === 0 && gpsOn) {
            const k = i / 20, tp = pos(t), fix = [0, 1, 2].map((a) => tp[a] + (a === 2 ? 1.5 * sg : sg) * gn[k][a]);
            G.push({ i, p: fix });
            for (let a = 0; a < 3; a++) {
              const s = st[a], R = (a === 2 ? 1.5 * sg : sg) ** 2, Sx = s.p00 + R, K0 = s.p00 / Sx, K1 = s.p01 / Sx, y = fix[a] - s.x;
              s.x += K0 * y; s.v += K1 * y; const p00 = s.p00, p01 = s.p01; s.p00 = (1 - K0) * p00; s.p01 = (1 - K0) * p01; s.p11 -= K1 * p01;
            }
          }
          X.push(st.map((s) => s.x)); Sd.push(st.map((s) => Math.sqrt(s.p00))); DR.push(dr.map((s) => s.x));
        }
        sim = { X, Sd, G, DR };
      }
      run();
      const idxAt = (t) => Math.round(T / dt) + Math.floor((t % T) / dt);
      const field = mix(C.green, C.bg, 0.72);
      const sc = scene3d(ui.body, {
        w: 640, h: 430, scale: 11, yaw: -0.55, pitch: 0.45, center: [0, 0, 9], dist: 140, animate: !VIZ.reduceMotion,
        draw(g, tt) {
          const t = VIZ.reduceMotion || paused ? tView : (tView = tt % T);
          const i = idxAt(t);
          g.grid(0, [-28, 28], [-20, 20], 4, field);
          // true path
          const tp = []; for (let k = 0; k <= 100; k++) tp.push(pos((T * k) / 100));
          g.polyline(tp, mix(C.blue, C.bg, 0.35), 1.6);
          // GPS fixes from the last 12 s
          sim.G.filter((f) => f.i <= i && f.i > i - 12 / dt).forEach((f) => { const age = (i - f.i) * dt / 12; g.sphere(f.p, 0.42, mix(C.red, C.bg, 0.65 * age)); });
          // fused trail (8 s)
          const tr = []; for (let k = Math.max(0, i - 160); k <= i; k += 2) tr.push(sim.X[k]); g.polyline(tr, C.green, 2.4);
          // drone at the true position
          const p = pos(t), v = vel(t), hd = Math.atan2(v[1], v[0]);
          const rot = (dx, dy) => [p[0] + dx * Math.cos(hd) - dy * Math.sin(hd), p[1] + dx * Math.sin(hd) + dy * Math.cos(hd)];
          g.line([p[0], p[1], 0.02], [p[0], p[1], p[2] - 0.5], C.dim, 1, [3, 4]);
          const sh = []; for (let k = 0; k < 12; k++) { const a = (2 * Math.PI * k) / 12; sh.push([p[0] + 1.6 * Math.cos(a), p[1] + 1.6 * Math.sin(a), 0.03]); } g.poly(sh, "#05070a", { alpha: 0.6, shade: false });
          g.box([p[0] - 0.7, p[1] - 0.7, p[2] - 0.25], [p[0] + 0.7, p[1] + 0.7, p[2] + 0.25], C.purple);
          [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => {
            const [rx, ry] = rot(1.6 * a, 1.6 * b); g.line([p[0], p[1], p[2]], [rx, ry, p[2] + 0.2], C.silicon, 3);
            const disc = []; for (let k = 0; k < 10; k++) { const an2 = (2 * Math.PI * k) / 10; disc.push([rx + 0.9 * Math.cos(an2), ry + 0.9 * Math.sin(an2), p[2] + 0.3]); }
            g.poly(disc, C.purple, { alpha: 0.35, shade: false, stroke: C.purple });
          });
          // estimate + 2σ ellipsoid
          const e = sim.X[i], sd = sim.Sd[i];
          g.sphere(e, 0.45, C.green);
          g.surface((u2, v2) => [e[0] + 2 * sd[0] * Math.cos(u2) * Math.sin(v2), e[1] + 2 * sd[1] * Math.sin(u2) * Math.sin(v2), e[2] + 2 * sd[2] * Math.cos(v2)],
            [0, 2 * Math.PI, 16], [0, Math.PI, 9], () => C.green, { alpha: 0.2, stroke: C.green, strokeAlpha: 0.35, strokeWidth: 0.6 });
          const tm = t % T, off = outage && tm >= 15 && tm < 27;
          g.text([e[0], e[1], e[2] + 2 * sd[2] + 1.6], off ? "GPS lost: coasting on the IMU" : "2σ ellipsoid", off ? C.red : C.green, 12.5);
          if (Math.floor(tt * 4) % 2 === 0 || paused || VIZ.reduceMotion) readout(t, i);
        },
      });
      function readout(t, i) {
        const e = sim.X[i], sd = sim.Sd[i], p = pos(t), err = Math.hypot(e[0] - p[0], e[1] - p[1], e[2] - p[2]);
        const tm = t % T, off = outage && tm >= 15 && tm < 27;
        const de = sim.DR[i], dErr = Math.hypot(de[0] - p[0], de[1] - p[1], de[2] - p[2]);
        ui.read.innerHTML = `t = ${fmt(tm, 1)} s · GPS ${off ? `<b style="color:${C.red}">lost</b>` : `σ = ${fmt(sg, 1)} m (vertical ${fmt(1.5 * sg, 1)} m)`} · ` +
          `fused σ: x ${fmt(sd[0], 2)}, y ${fmt(sd[1], 2)}, z ${fmt(sd[2], 2)} m · <b style="color:${C.green}">fused error ${fmt(err, 2)} m</b> · IMU alone (since launch) ${fmt(dErr, 0)} m off`;
      }
      ui.slider("GPS σ", 1, 6, 0.5, sg, (v) => { sg = v; run(); if (!sc.o.animate) sc.render(); return fmt(v, 1) + " m"; });
      const bO = ui.button("GPS outage: off", () => { outage = !outage; bO.textContent = "GPS outage: " + (outage ? "on" : "off"); run(); sc.render(); });
      if (VIZ.reduceMotion) ui.slider("time", 0, T - 0.05, 0.05, tView, (v) => { tView = v; sc.render(); return fmt(v, 1) + " s"; });
      else { const bP = ui.button("pause", () => { paused = !paused; bP.textContent = paused ? "play" : "pause"; }); }
      readout(tView, idxAt(tView));
    },
  });
})();
