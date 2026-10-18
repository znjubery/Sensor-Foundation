/* A8 — noise, resolution, calibration and drift: widgets for docs/A8-noise-resolution-calibration-and-drift.md */
(function () {
  "use strict";
  const { register, C, scene3d, chart, fmt, rng, gauss, ramp, tween, lerp, S, H } = VIZ;

  // ── a8-target: accuracy (bias) vs precision (spread) ─────────────────────────────────────────────────────
  register("a8-target", {
    title: "Accuracy vs precision · bias is a shift, noise is a spread",
    target: "Tell a systematic error (bias, fixed by calibration) from a random error (spread σ, reduced by averaging), and combine them as rms error = √(bias² + σ²).",
    caption: "each red dot is one reading; the centre of the target is the true value. The yellow ✕ is the mean of the 40 readings and the yellow circle its uncertainty σ/√40. The histogram on the right shows the horizontal coordinate of the readings: its width is the precision, its offset from the blue true value is the accuracy. Note how averaging shrinks the yellow circle but never moves it onto the bull's-eye.",
    links: [
      { id: "A1", why: "the ideal sensor line y = y₀ + S s: a wrong y₀ is pure bias" },
      { id: "A9", why: "fusion weights each sensor by its spread σ, never by its bias" },
      { id: "A6", why: "a glucose strip from a bad batch is precise but inaccurate until it is coded" },
    ],
    build(fig, ui) {
      let bias = 1.2, sig = 0.5, seed = 3;
      const row = H("div", { style: "display:flex;gap:0;align-items:center" }, ui.body);
      const left = H("div", { style: "flex:1 1 50%" }, row), right = H("div", { style: "flex:1 1 50%" }, row);
      const sv = S("svg", { viewBox: "0 0 320 300", role: "img", "aria-label": "target with shots" }, left);
      const hist = chart(right, { w: 320, h: 300, xr: [-3, 3], yr: [0, 1.2], xlabel: "horizontal reading", ylabel: "density", ml: 40, mr: 10 });
      const cx = 160, cy = 150, U = 32;     // pixels per unit; rings every unit
      const gT = S("g", {}, sv), gS = S("g", {}, sv);
      for (let k = 4; k >= 1; k--) S("circle", { cx, cy, r: k * U, fill: k % 2 ? "#1a2230" : "#141b25", stroke: "#2c3a4a" }, gT);
      S("circle", { cx, cy, r: 5, fill: C.blue }, gT);
      S("line", { x1: cx - 4.3 * U, y1: cy, x2: cx + 4.3 * U, y2: cy, stroke: "#2c3a4a", "stroke-dasharray": "3 3" }, gT);
      const bars = S("g", {}, hist.gMain), gauss1 = hist.line(C.red, 2), vT = hist.vline(C.blue, ""), vM = hist.vline(C.yellow, "5 3");
      const lb = hist.label(C.red, 11.5);
      function draw() {
        const r = rng(seed), pts = [];
        const bx = bias * Math.cos(Math.PI / 5), by = bias * Math.sin(Math.PI / 5);
        for (let i = 0; i < 40; i++) pts.push([bx + sig * gauss(r), by + sig * gauss(r)]);
        gS.innerHTML = "";
        let mx = 0, my = 0; pts.forEach((p) => { mx += p[0] / 40; my += p[1] / 40; });
        pts.forEach((p) => S("circle", { cx: cx + p[0] * U, cy: cy - p[1] * U, r: 4, fill: C.red, "fill-opacity": 0.85 }, gS));
        S("circle", { cx: cx + mx * U, cy: cy - my * U, r: Math.max(2, (sig / Math.sqrt(40)) * U), fill: "none", stroke: C.yellow, "stroke-width": 1.6 }, gS);
        const X = cx + mx * U, Y = cy - my * U;
        S("path", { d: `M${X - 6},${Y - 6}L${X + 6},${Y + 6}M${X - 6},${Y + 6}L${X + 6},${Y - 6}`, stroke: C.yellow, "stroke-width": 2.6 }, gS);
        if (Math.hypot(mx, my) > 0.25) {
          S("line", { x1: cx, y1: cy, x2: X, y2: Y, stroke: C.yellow, "stroke-width": 1.4, "stroke-dasharray": "4 3" }, gS);
        }
        // histogram of x
        bars.innerHTML = "";
        const bw = 0.3, cnt = {};
        pts.forEach((p) => { const k = Math.floor(p[0] / bw); cnt[k] = (cnt[k] || 0) + 1; });
        Object.keys(cnt).forEach((k) => {
          const x0 = k * bw, h = cnt[k] / (40 * bw);
          S("rect", { x: hist.X(x0), y: hist.Y(Math.min(1.2, h)), width: hist.X(x0 + bw) - hist.X(x0) - 1, height: hist.Y(0) - hist.Y(Math.min(1.2, h)), fill: C.red, "fill-opacity": 0.35 }, bars);
        });
        const gp = []; for (let i = 0; i <= 120; i++) { const x = -3 + i / 20; gp.push([x, Math.exp(-0.5 * ((x - bx) / sig) ** 2) / (sig * Math.sqrt(2 * Math.PI))]); }
        gauss1.set(gp); vT.set(0); vM.set(mx);
        lb.set(-2.85, 1.12, "σ = " + fmt(sig, 2));
        const rms = Math.sqrt(bias * bias + 2 * sig * sig);
        ui.read.innerHTML = `bias (accuracy) = <b style="color:${C.yellow}">${fmt(bias, 2)}</b> rings · spread per axis (precision) σ = <b style="color:${C.red}">${fmt(sig, 2)}</b> · ` +
          `mean of 40 lands within σ/√40 = ${fmt(sig / Math.sqrt(40), 3)} of the biased point · rms distance from centre = √(bias² + 2σ²) = <b>${fmt(rms, 2)}</b>`;
      }
      const sB = ui.slider("bias", 0, 2.5, 0.05, bias, (v) => { bias = v; draw(); return fmt(v, 2); });
      const sS = ui.slider("spread σ", 0.05, 1.5, 0.05, sig, (v) => { sig = v; draw(); return fmt(v, 2); });
      const pre = (b, s) => { sB.set(b); sS.set(s); };
      ui.button("accurate + precise", () => pre(0, 0.15));
      ui.button("precise, not accurate", () => pre(2, 0.15));
      ui.button("accurate, not precise", () => pre(0, 1.1));
      ui.button("new shots", () => { seed++; draw(); });
      draw();
    },
  });

  // ── a8-averaging: σ/√M, and the price you pay for it ────────────────────────────────────────────────────
  register("a8-averaging", {
    title: "Averaging · M readings shrink random noise to σ_n/√M",
    target: "Derive why the mean of M independent readings has noise σ_n/√M, predict how many samples buy a given resolution, and see the two prices: a slower response and no help against bias.",
    caption: "top: readings (yellow dots) of a <span style='color:" + C.blue + "'>true value</span> that steps from 2 to 3 at sample 100, and the running mean of the last M readings (green). Bottom: histograms of 4000 single readings (red) and 4000 M-sample means (green), each with its Gaussian. Quadrupling M halves the green width; the green line also reacts M samples late to the step.",
    links: [
      { id: "A7", why: "a running mean is a digital low-pass filter: narrower bandwidth, less noise" },
      { id: "A9", why: "the Kalman filter is an average that knows how much to trust each new sample" },
      { id: "B1", why: "the same √M law makes Brownian motion spread as √t" },
      { id: "A5", why: "photon shot noise is why long exposures and pixel binning look smoother" },
    ],
    build(fig, ui) {
      let kM = 3, sig = 0.4, step = 0;
      const N = 200, NH = 4000;
      const r = rng(11), z = new Float64Array(NH * 64);
      for (let i = 0; i < z.length; i++) z[i] = gauss(r);
      const tr = chart(ui.body, { w: 640, h: 220, xr: [0, N], yr: [0.5, 4.5], xlabel: "sample number", ylabel: "reading" });
      const holder = H("div", {}, ui.body);
      const truth = tr.line(C.blue, 2, "6 4"), avg = tr.line(C.green, 3), off = tr.line(C.red, 2, "3 3");
      const dots = S("g", {}, tr.gMain);
      const lab = tr.label(C.green, 12.5), lab2 = tr.label(C.red, 12);
      const lagV = tr.vline(C.dim, "2 3");
      function draw() {
        const M = Math.pow(2, kM), b = step >= 5 ? 0.6 : 0;
        const tv = (i) => (i < 100 ? 2 : 3);
        truth.set([[0, 2], [100, 2], [100, 3], [N, 3]]);
        const y = []; for (let i = 0; i < N; i++) y.push(tv(i) + b + sig * z[i]);
        dots.innerHTML = "";
        y.forEach((v, i) => S("circle", { cx: tr.X(i), cy: tr.Y(Math.max(0.5, Math.min(4.5, v))), r: 2.3, fill: C.yellow, "fill-opacity": 0.8 }, dots));
        const showAvg = step >= 1;
        const ap = []; let s = 0;
        for (let i = 0; i < N; i++) { s += y[i]; if (i >= M) s -= y[i - M]; if (i >= M - 1) ap.push([i, s / M]); }
        avg.set(showAvg ? ap : []);
        lab.set(4, 4.25, showAvg ? "running mean of M = " + M : "");
        off.set(step >= 5 ? [[0, 2 + b], [100, 2 + b], [100, 3 + b], [N, 3 + b]] : []);
        lab2.set(108, 1.0, step >= 5 ? "an offset survives any averaging" : "");
        if (step === 4) lagV.set(100 + M); else lagV.set(-10);
        dots.setAttribute("opacity", step === 4 ? 0.35 : 1);
        // histograms
        holder.innerHTML = "";
        const sm = sig / Math.sqrt(M), top = 1.2 / (Math.sqrt(2 * Math.PI) * (step >= 2 ? sm : sig));
        const hc = chart(holder, { w: 640, h: 180, xr: [-2.4, 2.4], yr: [0, top], xlabel: "reading − true value", ylabel: "density", mt: 10 });
        const bin = (vals, w, col, a) => {
          const cnt = {}; vals.forEach((v) => { const k = Math.floor(v / w); cnt[k] = (cnt[k] || 0) + 1; });
          Object.keys(cnt).forEach((k) => { const h = Math.min(top, cnt[k] / (vals.length * w)); S("rect", { x: hc.X(k * w), y: hc.Y(h), width: Math.max(0.5, hc.X((+k + 1) * w) - hc.X(k * w) - 0.6), height: hc.Y(0) - hc.Y(h), fill: col, "fill-opacity": a }, hc.gMain); });
        };
        const raw = [], mean = [];
        for (let i = 0; i < NH; i++) raw.push(sig * z[i] + b);
        for (let i = 0; i < NH; i++) { let q = 0; for (let j = 0; j < M; j++) q += z[i * M + j]; mean.push((sig * q) / M + b); }
        bin(raw, 0.08, C.red, 0.35);
        const gc = (sd, col, w) => { const l = hc.line(col, w); const p = []; for (let i = 0; i <= 240; i++) { const x = -2.4 + i / 50; p.push([x, Math.exp(-0.5 * ((x - b) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI))]); } l.set(p); };
        gc(sig, C.red, 2);
        let measured = 0;
        if (step >= 2) {
          bin(mean, Math.max(0.01, Math.min(0.08, sm / 3)), C.green, 0.45); gc(sm, C.green, 2.4);
          let mu = 0; mean.forEach((v) => (mu += v / NH)); mean.forEach((v) => (measured += (v - mu) ** 2 / (NH - 1))); measured = Math.sqrt(measured);
        }
        if (step >= 3) {
          [-1, 1].forEach((sgn) => { hc.vline(C.green, "4 3").set(b + sgn * sm); hc.vline(C.red, "2 3").set(b + sgn * sig); });
          hc.label(C.green, 12, "middle").set(b, top * 0.93, "±σ_n/√M");
        }
        hc.vline(C.blue, "").set(0);
        ui.read.innerHTML = `σ_n = <b style="color:${C.red}">${fmt(sig, 2)}</b> · M = <b>${M}</b> · σ_n/√M = <b style="color:${C.green}">${fmt(sm, 3)}</b>` +
          (step >= 2 ? ` · measured std of the 4000 means = ${fmt(measured, 3)}` : "") +
          ` · at 10 readings/s one mean takes ${fmt(M / 10, 1)} s` + (step >= 5 ? ` · <span style="color:${C.red}">offset 0.6 still there</span>` : "");
      }
      ui.slider("average M", 0, 6, 1, kM, (v) => { kM = v; draw(); return String(Math.pow(2, v)); });
      ui.slider("noise σ_n", 0.1, 0.8, 0.05, sig, (v) => { sig = v; draw(); return fmt(v, 2); });
      ui.steps([
        "One reading is truth plus noise: \\( y_i = s + n_i \\), with \\( n_i \\) Gaussian, mean 0, standard deviation \\( \\sigma_n \\) (red histogram).",
        "Average \\( M \\) readings: \\( \\bar y = \\tfrac{1}{M}\\sum_{i=1}^{M} y_i = s + \\tfrac{1}{M}\\sum n_i \\). The truth \\( s \\) survives untouched (green line).",
        "For independent noise, variances add: \\( \\operatorname{Var}\\big(\\sum n_i\\big) = M\\sigma_n^2 \\). Dividing by \\( M \\) divides the variance by \\( M^2 \\): \\( \\operatorname{Var}(\\bar y) = \\sigma_n^2/M \\).",
        "So \\( \\sigma_{\\bar y} = \\sigma_n/\\sqrt M \\). Four times the samples halves the noise; 100 samples cut it tenfold (dashed lines: ±σ_n and ±σ_n/√M).",
        "The price: the mean only reacts after \\( M \\) new samples (dashed line at sample \\( 100 + M \\)). Averaging is a low-pass filter (A7): bandwidth down, noise down, response slower.",
        "It only fights <i>random</i> noise. A systematic offset (red dashed, +0.6) is in every reading, so it is in the mean too. Only calibration removes it.",
      ], (i) => { step = i; draw(); });
    },
  });

  // ── a8-calibration-3d: magnetometer ellipsoid → sphere (hard and soft iron) ─────────────────────────────
  const mv = (A, v) => [0, 1, 2].map((i) => A[i][0] * v[0] + A[i][1] * v[1] + A[i][2] * v[2]);
  const tr3 = (A) => [0, 1, 2].map((i) => [A[0][i], A[1][i], A[2][i]]);
  function solve(A, b) {           // Gaussian elimination with partial pivoting
    const n = b.length, M = A.map((r, i) => r.concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) { let s = M[r][n]; for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k]; x[r] = s / M[r][r]; }
    return x;
  }
  function jacobi(A) {             // eigen-decomposition of a symmetric 3×3: A = V diag(l) Vᵀ
    const a = A.map((r) => r.slice()), V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    for (let sweep = 0; sweep < 30; sweep++) {
      for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
        if (Math.abs(a[p][q]) < 1e-14) continue;
        const th = (a[q][q] - a[p][p]) / (2 * a[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < 3; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
        for (let k = 0; k < 3; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; }
        for (let k = 0; k < 3; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; }
      }
    }
    return { l: [a[0][0], a[1][1], a[2][2]], V };
  }

  register("a8-calibration-3d", {
    title: "3D · calibrating a phone compass: an offset, tilted ellipsoid becomes a sphere",
    target: "Explain hard-iron (offset) and soft-iron (scale and tilt) errors of a 3-axis magnetometer, and calibrate it by fitting an ellipsoid, removing its centre, and rescaling its axes to the known field of 50 µT.",
    caption: "every dot is one raw reading of the field (Bx, By, Bz) while the phone is turned in all directions; ideally they would lie on the grey sphere of radius 50 µT. Colour = the length of each reading: <span style='color:#8fb3e6'>blue</span> too short, white about 50 µT, <span style='color:#f0a08f'>red</span> too long. Step through the calibration and watch the cloud move onto the sphere and the colours turn white. The red arrow is the hard-iron offset (a magnetised screw, the speaker magnet); the squashing and tilt is soft iron (steel that bends the field).",
    links: [
      { id: "A4", why: "the Hall and magnetoresistive sensors that produce these three numbers" },
      { id: "B4", why: "an accelerometer is calibrated the same way, on a sphere of radius 1 g" },
      { id: "A9", why: "the calibrated compass is fused with the gyro to give a steady heading" },
      { id: "A1", why: "offset y₀ and sensitivity S, now in three dimensions" },
    ],
    build(fig, ui) {
      const BE = 50, NP = 240;
      let hard = 1, soft = 1, step = 0, stageA = 0, stageB = 0, tw = 1;
      let pts = [], fit = null;
      const u0 = [];
      { const r = rng(21); for (let i = 0; i < NP; i++) { const zz = 1 - (2 * (i + 0.5)) / NP, rr = Math.sqrt(1 - zz * zz), ph = i * 2.39996; u0.push([rr * Math.cos(ph) + 0.05 * gauss(r), rr * Math.sin(ph) + 0.05 * gauss(r), zz + 0.05 * gauss(r)].map((v, k, a) => v)); }
        u0.forEach((u, i) => { const L = Math.hypot(u[0], u[1], u[2]); u0[i] = u.map((v) => v / L); }); }
      const noise = (() => { const r = rng(5); return u0.map(() => [gauss(r), gauss(r), gauss(r)].map((v) => 0.6 * v)); })();
      function makeData() {
        const off = [12 * hard, -8 * hard, 25 * hard], sc = [1 + 0.25 * soft, 1 - 0.15 * soft, 1];
        const th = Math.PI / 6, c = Math.cos(th), s = Math.sin(th), Rz = [[c, -s, 0], [s, c, 0], [0, 0, 1]];
        const A = [0, 1, 2].map((i) => [0, 1, 2].map((j) => Rz[i][0] * sc[0] * Rz[j][0] + Rz[i][1] * sc[1] * Rz[j][1] + Rz[i][2] * sc[2] * Rz[j][2]));
        pts = u0.map((u, i) => { const m = mv(A, u.map((v) => BE * v)); return [0, 1, 2].map((k) => m[k] + off[k] + noise[i][k]); });
        // least-squares ellipsoid fit: x^T Q x + 2 l^T x = 1  (9 unknowns, linear)
        const AtA = Array.from({ length: 9 }, () => new Array(9).fill(0)), Atb = new Array(9).fill(0);
        pts.forEach(([x, y, z]) => { const d = [x * x, y * y, z * z, 2 * x * y, 2 * x * z, 2 * y * z, 2 * x, 2 * y, 2 * z]; for (let i = 0; i < 9; i++) { Atb[i] += d[i]; for (let j = 0; j < 9; j++) AtA[i][j] += d[i] * d[j]; } });
        const p = solve(AtA, Atb);
        const Q = [[p[0], p[3], p[4]], [p[3], p[1], p[5]], [p[4], p[5], p[2]]], l = [p[6], p[7], p[8]];
        const cen = solve(Q.map((r) => r.slice()), l).map((v) => -v);
        const k = 1 + cen[0] * mv(Q, cen)[0] + cen[1] * mv(Q, cen)[1] + cen[2] * mv(Q, cen)[2];
        const Qn = Q.map((r) => r.map((v) => v / k));
        const e = jacobi(Qn);
        fit = { c: cen, V: e.V, lam: e.l, ax: e.l.map((v) => 1 / Math.sqrt(v)), off, sc };
      }
      // the five stages of the calibration as maps R^3 -> R^3 (µT)
      function stage(m, k) {
        if (k === 0) return m;
        const d = [m[0] - fit.c[0], m[1] - fit.c[1], m[2] - fit.c[2]];
        if (k === 1) return d;
        const r = mv(tr3(fit.V), d);
        if (k === 2) return r;
        const s = r.map((v, i) => BE * Math.sqrt(fit.lam[i]) * v);
        if (k === 3) return s;
        return mv(fit.V, s);
      }
      const at = (m) => { const a = stage(m, stageA), b = stage(m, stageB); return [lerp(a[0], b[0], tw), lerp(a[1], b[1], tw), lerp(a[2], b[2], tw)]; };
      const K = 0.1;   // scene units per µT
      const P = (v) => v.map((x) => x * K);
      const sc3 = scene3d(ui.body, {
        w: 640, h: 440, scale: 25, yaw: -0.65, pitch: 0.38, center: [0.4, -0.2, 0.9], dist: 40,
        draw(g) {
          g.axes(6.2, ["Bx", "By", "Bz"]);
          // reference sphere: the true Earth field, radius 50 µT
          for (let j = 1; j < 6; j++) { const zz = -1 + j / 3, rr = Math.sqrt(Math.max(0, 1 - zz * zz)); const ring = []; for (let i = 0; i <= 28; i++) { const a = (2 * Math.PI * i) / 28; ring.push([5 * rr * Math.cos(a), 5 * rr * Math.sin(a), 5 * zz]); } g.polyline(ring, "#3a4654", 1); }
          for (let j = 0; j < 6; j++) { const a = (Math.PI * j) / 6, mer = []; for (let i = 0; i <= 18; i++) { const t = (Math.PI * i) / 18; mer.push([5 * Math.sin(t) * Math.cos(a), 5 * Math.sin(t) * Math.sin(a), 5 * Math.cos(t)]); } g.polyline(mer, "#3a4654", 1); }
          // fitted ellipsoid wireframe (green), carried through the same stage map as the data
          if (step >= 1) {
            const E = (u) => { const q = fit.ax.map((a, i) => a * u[i]); const w = mv(fit.V, q); return P(at([w[0] + fit.c[0], w[1] + fit.c[1], w[2] + fit.c[2]])); };
            for (let j = 1; j < 6; j++) { const zz = -1 + j / 3, rr = Math.sqrt(1 - zz * zz), ring = []; for (let i = 0; i <= 24; i++) { const a = (2 * Math.PI * i) / 24; ring.push(E([rr * Math.cos(a), rr * Math.sin(a), zz])); } g.polyline(ring, C.green, 1.3); }
            for (let j = 0; j < 4; j++) { const a = (Math.PI * j) / 4, mer = []; for (let i = 0; i <= 14; i++) { const t = (Math.PI * i) / 14; mer.push(E([Math.sin(t) * Math.cos(a), Math.sin(t) * Math.sin(a), Math.cos(t)])); } g.polyline(mer, C.green, 1.3); }
            const cc = P(at(fit.c));
            if (Math.hypot(cc[0], cc[1], cc[2]) > 0.3) { g.arrow([0, 0, 0], cc, C.red, 3); g.text([cc[0], cc[1], cc[2] + 0.6], "hard-iron offset", C.red, 12.5); }
            if (step === 3 || step === 4) {
              [0, 1, 2].forEach((i) => { const v = [fit.V[0][i], fit.V[1][i], fit.V[2][i]].map((x) => x * fit.ax[i]); const tip = P(at([fit.c[0] + v[0], fit.c[1] + v[1], fit.c[2] + v[2]])), base = P(at(fit.c)); g.arrow(base, tip, C.purple, 3); });
            }
          }
          pts.forEach((m) => { const q = at(m), L = Math.hypot(q[0], q[1], q[2]); g.sphere(P(q), 0.15, ramp(0.5 + (L - BE) / 50, "div")); });
        },
      });
      function readout() {
        const L = pts.map((m) => { const q = stage(m, stageB); return Math.hypot(q[0], q[1], q[2]); });
        const mn = Math.min(...L), mx = Math.max(...L);
        const ax = fit.ax.slice().sort((a, b) => b - a);
        const hb = Math.hypot(fit.c[0], fit.c[1]);
        ui.read.innerHTML = `|B| of the readings now: <b>${fmt(mn, 1)} … ${fmt(mx, 1)} µT</b> (true 50) · ` +
          `fitted offset m₀ = (${fit.c.map((v) => fmt(v, 1)).join(", ")}) µT, true (${fit.off.map((v) => fmt(v, 1)).join(", ")})<br>` +
          `fitted semi-axes ${ax.map((v) => fmt(v, 1)).join(", ")} µT, true ${fit.sc.map((v) => fmt(BE * v, 1)).sort((a, b) => b - a).join(", ")} · ` +
          `uncalibrated, a ${fmt(hb, 1)} µT horizontal offset against a 20 µT horizontal field can swing the heading by up to <b style="color:${C.red}">${hb < 20 ? fmt((Math.asin(hb / 20) * 180) / Math.PI, 0) + "°" : "180°"}</b>`;
      }
      const toStage = (k) => {
        const from = stageB; stageA = from; stageB = k;
        if (from === k) { tw = 1; sc3.render(); readout(); return; }
        tween(900, (t) => { tw = t; sc3.render(); }, () => { stageA = k; tw = 1; sc3.render(); });
        readout();
      };
      makeData();
      ui.slider("hard iron", 0, 1.5, 0.1, hard, (v) => { hard = v; makeData(); sc3.render(); readout(); return "×" + fmt(v, 1); });
      ui.slider("soft iron", 0, 1.5, 0.1, soft, (v) => { soft = v; makeData(); sc3.render(); readout(); return "×" + fmt(v, 1); });
      const map = [0, 0, 1, 2, 3, 4];
      ui.steps([
        "Raw readings: \\( \\mathbf m = A_{\\text{si}}\\,\\mathbf B_E + \\mathbf m_0 \\). The true field \\( \\mathbf B_E \\) (length 50 µT) lies on a sphere; the soft-iron matrix \\( A_{\\text{si}} \\) squashes and tilts it, the hard-iron offset \\( \\mathbf m_0 \\) shifts it. The lengths swing from about 19 to 81 µT.",
        "Fit a quadric \\( \\mathbf m^{\\mathsf T}\\mathsf Q\\,\\mathbf m + 2\\,\\mathbf d^{\\mathsf T}\\mathbf m = 1 \\) to all points by least squares. It is <i>linear</i> in its 9 unknowns (6 in the symmetric \\( \\mathsf Q \\), 3 in \\( \\mathbf d \\)), just like fitting a line. Its centre is \\( \\mathbf m_0 = -\\mathsf Q^{-1}\\mathbf d \\) (red arrow).",
        "Remove the hard iron: \\( \\mathbf m - \\mathbf m_0 \\). The cloud is now centred, but still an ellipsoid \\( (\\mathbf m-\\mathbf m_0)^{\\mathsf T}\\mathsf Q'(\\mathbf m-\\mathbf m_0) = 1 \\).",
        "Diagonalise \\( \\mathsf Q' = \\mathsf V\\Lambda \\mathsf V^{\\mathsf T} \\). The eigenvectors (purple) are the ellipsoid's axes; rotating by \\( \\mathsf V^{\\mathsf T} \\) lines them up with x, y, z. Semi-axis \\( i \\) has length \\( 1/\\sqrt{\\lambda_i} \\).",
        "Scale each axis by \\( 50\\sqrt{\\lambda_i} \\) µT: every semi-axis becomes 50 µT, so the ellipsoid becomes the sphere.",
        "Rotate back: \\( \\mathbf m_{\\text{cal}} = 50\\,\\mathsf V\\Lambda^{1/2}\\mathsf V^{\\mathsf T}(\\mathbf m - \\mathbf m_0) \\). All lengths are now 50 µT ± noise; the heading computed from \\( (m_x, m_y) \\) is trustworthy.",
      ], (i) => { step = i; toStage(map[i]); });
    },
  });
})();
