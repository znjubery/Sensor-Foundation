/* A5 — optical sensors: widgets for docs/A5-optical-sensors-photodiodes-image-sensors-and-lidar.md */
(function () {
  "use strict";
  const { register, C, scene3d, chart, fmt, mix, rng, gauss, ramp, css } = VIZ;
  const C0 = 2.99792458e8;

  function poisson(mean, r) {
    if (mean <= 0) return 0;
    if (mean > 40) return Math.max(0, Math.round(mean + Math.sqrt(mean) * gauss(r)));
    const L = Math.exp(-mean); let k = 0, p = 1;
    do { k++; p *= r(); } while (p > L);
    return k - 1;
  }

  // ═════════════════════════════════════ 1. pixels are buckets for photo-electrons ═════════════════════════════════════
  register("a5-pixel-array-3d", {
    title: "3D · a camera sensor: photons rain into pixel wells, N_e electrons ± √N_e",
    target: "After this you can predict how many electrons a pixel collects, why dim photos are grainy (SNR = √N_e), and where a pixel saturates.",
    caption: "each square well is one pixel under its <b>Bayer</b> colour filter (two green, one red, one blue per 2×2 block). <span style='color:" + C.gold + "'>Gold dots</span> are photons; the <span style='color:" + C.yellow + "'>yellow fill</span> is the number of collected electrons, the output. The scene is brighter on the right (a sunlit leaf). Step through the math; from step 4 the red whiskers show ±√N_e and the inset shows the photo the pixels make (auto-brightened, like a phone at high ISO). Turn the light down and the photo turns to grain; turn it up and wells overflow (red caps).",
    links: [
      { id: "A3", why: "each well is a tiny capacitor: about 1 fF holds 6000 electrons per volt" },
      { id: "A8", why: "shot noise is the first noise floor; averaging M frames improves SNR by √M" },
      { id: "A7", why: "the column ADC turns each well's voltage into counts" },
      { id: "C5", why: "the same photodiode counts fluorescent photons on a lab-on-a-chip" },
    ],
    build(fig, ui) {
      const NXp = 6, FWC = 6000, RN = 2, ETA = 0.6;
      const TF = { R: 0.30, G: 0.42, B: 0.26 };                 // filter transmission for white light
      const colOf = { R: "#e5584f", G: "#5fbf5a", B: "#4f7fe0" };
      let logL = 3.8, logT = 0, step = 0, seed = 1, frame = null, t0 = 0;
      const bay = (i, j) => ((i + j) % 2 === 1 ? "G" : i % 2 === 0 ? "B" : "R");
      const pattern = (i, j) => { const x = i - 3.8, y = j - 3.3; return 0.25 + 0.75 * Math.exp(-(x * x + y * y) / 6); };
      const meanE = (i, j) => Math.pow(10, logL) * Math.pow(10, logT) * ETA * TF[bay(i, j)] * pattern(i, j) / 0.42;
      function newFrame() {
        const r = rng(seed++ * 7919);
        frame = [];
        for (let i = 0; i < NXp; i++) for (let j = 0; j < NXp; j++) {
          const m = meanE(i, j), n = poisson(m, r) + RN * gauss(r);
          frame.push({ i, j, m, n: Math.max(0, n), f: bay(i, j) });
        }
      }
      newFrame();
      const R = rng(3);
      const drops = Array.from({ length: 26 }, () => ({ x: R() * 6 - 3, y: R() * 6 - 3, z: 2 + R() * 4 }));
      let lastT = 0;
      const sc = scene3d(ui.body, {
        w: 640, h: 430, scale: 50, yaw: -0.55, pitch: 0.6, center: [0.3, 0.2, 0.8], animate: !VIZ.reduceMotion,
        draw(g, t) {
          const dt = Math.max(0, Math.min(0.05, t - lastT)); lastT = t;
          const cyc = 4.0, ph = VIZ.reduceMotion ? 1 : ((t - t0) % cyc) / 2.6;
          const fillPh = step >= 2 ? Math.min(1, ph) : 0;
          if (!VIZ.reduceMotion && step >= 2 && (t - t0) % cyc < dt * 1.5 && t - t0 > 1) newFrame();
          const Hw = 2.0, gap = 0.08;
          g.box([-3.1, -3.1, -0.25], [3.1, 3.1, 0], C.silicon, { bias: -100 });
          frame.forEach((p) => {
            const x0 = -3 + p.i + gap, x1 = -3 + p.i + 1 - gap, y0 = -3 + p.j + gap, y1 = -3 + p.j + 1 - gap;
            const val = Math.min(FWC, p.n) * fillPh, sat = p.n >= FWC && fillPh >= 1;
            const h = (Hw * val) / FWC;
            if (h > 0.004) g.box([x0 + 0.04, y0 + 0.04, 0], [x1 - 0.04, y1 - 0.04, h], mix(C.yellow, C.bg, 0.12), { alpha: step >= 3 ? 0.7 : 1 });
            if (sat) g.box([x0 + 0.03, y0 + 0.03, Hw], [x1 - 0.03, y1 - 0.03, Hw + 0.08], C.red);
            // well walls (open, translucent) and the colour filter on top
            const top = Hw + 0.12;
            [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(([u, v]) => g.line([u, v, 0], [u, v, top], mix(C.silicon, C.bg, 0.45), 1));
            g.poly([[x0, y0, top], [x1, y0, top], [x1, y1, top], [x0, y1, top]], colOf[p.f], { alpha: step >= 6 ? 0.6 : 0.32, shade: false, stroke: colOf[p.f], strokeAlpha: 0.95, strokeWidth: 1.4, bias: 3 });
            if (step >= 3 && fillPh >= 1 && !sat) {
              const s = Math.sqrt(Math.max(1, p.m)), xc = (x0 + x1) / 2, yc = (y0 + y1) / 2;
              const lo = (Hw * Math.max(0, p.m - s)) / FWC, hi = (Hw * Math.min(FWC, p.m + s)) / FWC;
              g.line([xc, yc, lo], [xc, yc, hi + 0.001], C.red, 2);
              g.line([xc - 0.15, yc, hi], [xc + 0.15, yc, hi], C.red, 2);
              g.line([xc - 0.15, yc, lo], [xc + 0.15, yc, lo], C.red, 2);
            }
          });
          // photons
          drops.forEach((d) => {
            if (!VIZ.reduceMotion) d.z -= 5 * dt;
            if (d.z < 0.2) { d.x = R() * 6 - 3; d.y = R() * 6 - 3; d.z = 4 + R() * 2; if (R() < 0.6) d.x = 0.5 + R() * 2.5; }
            g.sphere([d.x, d.y, d.z + 0.5], 0.07, C.gold);
          });
          if (step === 0) g.text([-3.3, -3.3, 4.6], "photon E = hc/λ", C.gold, 14, "left");
          if (step === 5) { g.line([3.25, -3, 0], [3.25, -3, Hw], C.green, 2); g.text([3.6, -3, Hw], "full well", C.green, 13, "left"); }
        },
        overlay(ctx) {
          if (step < 4) return;
          const x0 = 506, y0 = 10, cs = 19;
          const mx = Math.max(1, ...frame.map((p) => Math.min(FWC, p.m)));
          ctx.save();
          ctx.fillStyle = "rgba(14,17,22,0.9)"; ctx.fillRect(x0 - 6, y0 - 4, cs * 6 + 12, cs * 6 + 26);
          frame.forEach((p) => {
            const v = Math.max(0, Math.min(1, Math.min(FWC, p.n) / (mx * 1.1)));
            const base = { R: [255, 90, 80], G: [110, 220, 100], B: [90, 140, 255] }[p.f];
            ctx.fillStyle = css(base.map((c) => c * v));
            ctx.fillRect(x0 + p.i * cs, y0 + (5 - p.j) * cs, cs - 1, cs - 1);
          });
          ctx.font = "11px JetBrains Mono, ui-monospace, monospace"; ctx.fillStyle = C.dim; ctx.textAlign = "left"; ctx.textBaseline = "top";
          ctx.fillText("the photo", x0, y0 + cs * 6 + 6);
          ctx.restore();
        },
      });
      ui.slider("light level", 1, 4.5, 0.1, logL, (v) => { logL = v; newFrame(); upd(); return fmt(Math.pow(10, v), 0) + " photons/px/ms"; });
      ui.slider("exposure", -1, 2, 0.1, logT, (v) => { logT = v; newFrame(); upd(); return fmt(Math.pow(10, v), 2) + " ms"; });
      ui.button("new frame", () => { newFrame(); t0 = sc.t - 2.6; upd(); });
      ui.steps([
        "A photon carries energy \\( E_{\\text{ph}} = h_{\\text P}c_0/\\lambda \\): 2.25 eV for green light at 550 nm. Silicon needs at least its band gap, 1.12 eV, to free an electron, so it is blind beyond \\( \\lambda = h_{\\text P}c_0/E_g \\approx 1.1\\ \\mu\\text{m} \\).",
        "Not every photon counts: the fraction that frees an electron is the quantum efficiency \\( \\eta \\) (about 0.6 here). The colour filter on top also passes only part of white light.",
        "During the exposure \\( t_{\\exp} \\) the well collects \\( N_e =\\eta\\,\\Phi\\,t_{\\exp} \\) electrons, where \\( \\Phi \\) is the photon rate on that pixel. Twice the light or twice the time: twice the electrons (watch the wells fill).",
        "Photons arrive at random, like raindrops. The count obeys Poisson statistics: its spread is \\( \\sigma_{N_e} = \\sqrt{N_e} \\) (red whiskers). Neighbouring pixels in the same light differ by about that much.",
        "Signal-to-noise: \\( \\mathrm{SNR} = N_e/\\sqrt{N_e} = \\sqrt{N_e} \\). 100 electrons give SNR 10 (grainy); 10 000 give 100 (clean). Only more photons help: a bigger pixel, a brighter lens or a longer exposure.",
        "The well holds at most the full-well capacity (6000 e⁻ here). Beyond that the pixel clips (red caps). Dynamic range = full well ÷ read noise = 6000/2 = 3000, about 69.5 dB or 11.6 stops.",
        "Colour: each pixel sees only one colour. In the Bayer pattern half the pixels are green, a quarter red, a quarter blue; the camera interpolates the missing two colours at every pixel (demosaicing).",
      ], (i) => { step = i; t0 = sc.t; upd(); });
      function upd() {
        const mid = meanE(4, 3), lo = meanE(0, 0);
        const sat = frame.filter((p) => p.n >= FWC).length;
        const snr = (n) => n / Math.sqrt(n + RN * RN);
        ui.read.innerHTML =
          `brightest green pixel: N_e = <b style="color:${C.yellow}">${fmt(mid, 0)} e⁻</b>, √N_e = <span style="color:${C.red}">${fmt(Math.sqrt(mid), 1)}</span>, SNR = ${fmt(snr(Math.min(mid, FWC)), 1)} (${fmt(20 * Math.log10(snr(Math.min(mid, FWC))), 1)} dB)<br>` +
          `darkest corner pixel: N_e = ${fmt(lo, 0)} e⁻, SNR = ${fmt(snr(lo), 1)} · full well 6000 e⁻, read noise 2 e⁻ · ` +
          `<span style="color:${sat ? C.red : C.dim}">${sat} of 36 pixels saturated</span>`;
        if (VIZ.reduceMotion) sc.render();
      }
      upd();
    },
  });

  // ═════════════════════════════════════ 2. LiDAR: time of flight to a point cloud ═════════════════════════════════════
  register("a5-tof-3d", {
    title: "3D · a car's LiDAR: d = c t / 2, one laser pulse at a time, into a point cloud",
    target: "After this you can turn an echo time into a distance, say how timing resolution limits depth, and explain how a spinning LiDAR builds a point cloud.",
    caption: "a car (grey) with a LiDAR on its roof faces a street with a pedestrian, a tree, a parked van and a wall. The <span style='color:" + C.gold + "'>gold ray</span> is the laser pulse. Steps 1–4 follow one pulse to the pedestrian and back; steps 5–6 sweep 8 laser channels across the scene and the dots appear, coloured by distance. Coarsen the timing resolution and the cloud breaks into shells, c·Δt/2 apart. In the last step the solid objects fade: the points are all the car really knows.",
    links: [
      { id: "A9", why: "LiDAR points are fused with camera, radar and IMU data" },
      { id: "A7", why: "a time-to-digital converter measures t to tens of picoseconds" },
      { id: "A8", why: "timing jitter becomes distance noise, σ_d = cσ_t/2" },
      { id: "B4", why: "the car's IMU says where the LiDAR was when each pulse fired" },
    ],
    build(fig, ui) {
      let logDt = -9, step = 0, t0 = 0;
      const ELS = [-15, -11, -8, -5.5, -3.5, -1.5, 0.5, 2.5].map((d) => (d * Math.PI) / 180);
      const AZ0 = -62, AZ1 = 62, DAZ = 1.6;
      const O = [0, 0.4, 1.75];
      const boxes = [
        { a: [-7, 13, 0], b: [-0.5, 14, 3.2], col: "#8a7f72" },          // wall
        { a: [2.2, 9.5, 0], b: [4.0, 14.0, 2.1], col: "#5a6f8a" },        // parked van
      ];
      const cyls = [
        { x: 1.6, y: 6.0, r: 0.28, z0: 0, z1: 1.75, col: C.purple },     // pedestrian
        { x: -3.0, y: 6.5, r: 0.22, z0: 0, z1: 2.2, col: "#8a6a4a" },     // tree trunk
      ];
      const sph = [{ c: [-3.0, 6.5, 3.0], r: 1.1, col: "#4f8f4f" }];      // tree crown
      const ped = [cyls[0].x, cyls[0].y, 1.1];
      function hit(o, d) {
        let best = 40;
        if (d[2] < 0) best = Math.min(best, -o[2] / d[2]);
        boxes.forEach(({ a, b }) => {
          let tn = -1e9, tf = 1e9;
          for (let k = 0; k < 3; k++) {
            if (Math.abs(d[k]) < 1e-9) { if (o[k] < a[k] || o[k] > b[k]) return; continue; }
            let t1 = (a[k] - o[k]) / d[k], t2 = (b[k] - o[k]) / d[k];
            if (t1 > t2) [t1, t2] = [t2, t1];
            tn = Math.max(tn, t1); tf = Math.min(tf, t2);
          }
          if (tn <= tf && tn > 0) best = Math.min(best, tn);
        });
        cyls.forEach((c) => {
          const ox = o[0] - c.x, oy = o[1] - c.y, A = d[0] * d[0] + d[1] * d[1], B = 2 * (ox * d[0] + oy * d[1]), Cc = ox * ox + oy * oy - c.r * c.r;
          const disc = B * B - 4 * A * Cc; if (disc < 0 || A < 1e-12) return;
          const t = (-B - Math.sqrt(disc)) / (2 * A), z = o[2] + t * d[2];
          if (t > 0 && z >= c.z0 && z <= c.z1) best = Math.min(best, t);
        });
        sph.forEach((s) => {
          const oc = [o[0] - s.c[0], o[1] - s.c[1], o[2] - s.c[2]], B = oc[0] * d[0] + oc[1] * d[1] + oc[2] * d[2];
          const Cc = oc[0] * oc[0] + oc[1] * oc[1] + oc[2] * oc[2] - s.r * s.r, disc = B * B - Cc;
          if (disc < 0) return; const t = -B - Math.sqrt(disc); if (t > 0) best = Math.min(best, t);
        });
        return best < 39 ? best : null;
      }
      const dirOf = (az, el) => [Math.cos(el) * Math.sin(az), Math.cos(el) * Math.cos(az), Math.sin(el)];
      let cloud = [];
      function scan() {
        const r = rng(11), dd = (C0 * Math.pow(10, logDt)) / 2;
        cloud = [];
        for (let az = AZ0; az <= AZ1 + 1e-9; az += DAZ) ELS.forEach((el) => {
          const d = dirOf((az * Math.PI) / 180, el), t = hit(O, d);
          if (t === null) return;
          const meas = Math.max(0.1, Math.round((t + 0.25 * dd * gauss(r)) / dd) * dd);   // timing bins + a little jitter
          cloud.push({ az, p: [O[0] + meas * d[0], O[1] + meas * d[1], O[2] + meas * d[2]], d: meas });
        });
      }
      scan();
      const pedDir = (() => { const v = [ped[0] - O[0], ped[1] - O[1], ped[2] - O[2]], L = Math.hypot(...v); return v.map((x) => x / L); })();
      const pedT = hit(O, pedDir);
      const sc = scene3d(ui.body, {
        w: 640, h: 430, scale: 31, yaw: -0.5, pitch: 0.42, center: [-0.3, 6.5, 0.6], dist: 30, animate: !VIZ.reduceMotion,
        draw(g, t) {
          const fade = step >= 5;
          const op = fade ? { alpha: 0.12, shade: false } : undefined;
          g.grid(0, [-7, 6], [-2, 15], 1, "#1a2a33");
          // our car
          g.box([-0.9, -2.0, 0.3], [0.9, 2.2, 1.05], C.silicon, op);
          g.box([-0.8, -1.0, 1.05], [0.8, 1.2, 1.55], mix(C.silicon, C.bg, 0.3), op);
          g.cylinder([O[0], O[1], 1.55], [O[0], O[1], 1.8], 0.22, "#222a33", 12);
          boxes.forEach((b) => g.box(b.a, b.b, b.col, op));
          cyls.forEach((c) => g.cylinder([c.x, c.y, c.z0], [c.x, c.y, c.z1], c.r, c.col, 12, op));
          if (!fade) { g.sphere(sph[0].c, sph[0].r, sph[0].col); g.sphere([ped[0], ped[1], 1.95], 0.2, C.purple); }
          // the single pulse (steps 0–3)
          if (step <= 3 && pedT) {
            const hp = [O[0] + pedT * pedDir[0], O[1] + pedT * pedDir[1], O[2] + pedT * pedDir[2]];
            const ph = VIZ.reduceMotion ? 0.5 : ((t - t0) * 0.5) % 1;
            g.line(O, hp, mix(C.gold, C.bg, 0.4), 1.5, [5, 4]);
            const out = step === 0 ? Math.min(1, ph * 2) : ph < 0.5 ? ph * 2 : 2 - ph * 2;
            g.sphere([O[0] + out * pedT * pedDir[0], O[1] + out * pedT * pedDir[1], O[2] + out * pedT * pedDir[2]], 0.16, C.gold);
            if (step >= 2) g.text([(O[0] + hp[0]) / 2 + 0.6, (O[1] + hp[1]) / 2, (O[2] + hp[2]) / 2 + 0.6], `d = ${fmt(pedT, 2)} m`, C.yellow, 14);
            if (step === 3) {
              const dd = (C0 * Math.pow(10, logDt)) / 2;
              for (let k = -2; k <= 2; k++) { const s = Math.round(pedT / dd + k) * dd; if (s <= 0) continue; const q = [O[0] + s * pedDir[0], O[1] + s * pedDir[1], O[2] + s * pedDir[2]]; g.sphere(q, 0.07, k === 0 ? C.yellow : C.red); }
            }
          }
          // the sweeping ray (step ≥ 4)
          if (step >= 4 && !VIZ.reduceMotion) {
            const az = AZ0 + (((t - t0) * 40) % (AZ1 - AZ0));
            ELS.forEach((el, k) => {
              if (k % 2) return;
              const d = dirOf((az * Math.PI) / 180, el), h = hit(O, d) || 25;
              g.line(O, [O[0] + h * d[0], O[1] + h * d[1], O[2] + h * d[2]], C.gold, 1.2);
            });
          }
          g.text([O[0], O[1] - 0.2, 2.35], "LiDAR", C.gold, 12);
        },
        overlay(ctx, s) {
          if (step < 4) return;
          const az = VIZ.reduceMotion ? AZ1 + 1 : AZ0 + (((s.t - t0) * 40) % (AZ1 - AZ0)) + (step >= 5 ? 1e9 : 0);
          ctx.save();
          cloud.forEach((c) => {
            if (c.az > az) return;
            const P = s.project(c.p);
            ctx.fillStyle = css(ramp(1 - Math.min(1, c.d / 18)));
            ctx.fillRect(P[0] - 1.6, P[1] - 1.6, 3.2, 3.2);
          });
          ctx.restore();
        },
      });
      ui.slider("timing resolution Δt", -10.5, -8, 0.25, logDt, (v) => { logDt = v; scan(); upd(); return fmt(Math.pow(10, v) * 1e9, 2) + " ns"; });
      ui.steps([
        "At \\( t=0 \\) the laser fires a pulse a few nanoseconds long (905 or 1550 nm, invisible infrared). Light covers 30 cm per nanosecond.",
        "The pulse scatters off the pedestrian and a few photons come back to a fast photodiode (an APD or SPAD) next to the laser. A clock measures the round-trip time \\( t \\).",
        "The light went there and back, so \\( d = c_0\\,t/2 \\). For this pedestrian, the echo time is shown below; 100 m would take 667 ns.",
        "The clock ticks in steps \\( \\Delta t \\), so distance comes in steps \\( \\Delta d = c_0\\,\\Delta t/2 \\): 1 ns → 15 cm, 66.7 ps → 1 cm (red dots = the neighbouring bins).",
        "Now scan: a spinning head fires each channel at elevation \\( \\theta_e \\) while the azimuth \\( \\varphi \\) turns. Each echo gives \\( (x,y,z) = d\\,(\\cos\\theta_e\\sin\\varphi,\\ \\cos\\theta_e\\cos\\varphi,\\ \\sin\\theta_e) \\) from the sensor.",
        "The point cloud: thousands of these points per sweep (1.3 million per second for 64 channels). Points thin out with distance, spacing \\( \\approx d\\,\\Delta\\varphi \\), so far objects get few points.",
      ], (i) => { step = i; t0 = sc.t; upd(); });
      function upd() {
        const dt = Math.pow(10, logDt), dd = (C0 * dt) / 2;
        ui.read.innerHTML =
          `pedestrian: d = <b style="color:${C.yellow}">${fmt(pedT, 2)} m</b> → round trip t = 2d/c = <b>${fmt((2 * pedT) / C0 * 1e9, 2)} ns</b><br>` +
          `timing step Δt = ${fmt(dt * 1e9, 3)} ns → distance step Δd = cΔt/2 = <b style="color:${dd > 0.3 ? C.red : C.green}">${fmt(dd * 100, 1)} cm</b> · ` +
          `${cloud.length} points (8 channels × ${Math.round((AZ1 - AZ0) / DAZ) + 1} azimuths) · spacing at 10 m ≈ ${fmt(10 * (DAZ * Math.PI) / 180 * 100, 0)} cm`;
        if (VIZ.reduceMotion) sc.render();
      }
      upd();
    },
  });

  // ═════════════════════════════════════ 3. pulse oximetry ═════════════════════════════════════
  register("a5-ppg", {
    title: "Live plot · pulse oximetry: two colours of light, a ratio of ratios, SpO₂",
    target: "After this you can read heart rate from a PPG trace and turn the red and infrared pulse sizes into an oxygen saturation.",
    caption: "a finger clip or watch shines red (660 nm) and infrared (940 nm) light into the skin; a photodiode measures what comes back. Each heartbeat swells the arteries, more blood absorbs more light, and the signal dips. The traces show the dip as a percentage of the steady (DC) light. Oxygen-rich blood absorbs little red, so the red dip is small; lower the saturation and the red dip grows while the infrared one stays.",
    links: [
      { id: "A1", why: "light → photocurrent → number: the full measurement chain" },
      { id: "A7", why: "the 1% AC ripple on a big DC level needs filtering and gain" },
      { id: "A8", why: "the SpO₂ formula is an empirical calibration line" },
    ],
    build(fig, ui) {
      let spo2 = 97, hr = 72;
      const ch = chart(ui.body, { w: 640, h: 270, xr: [0, 4], yr: [-2.9, 0.6], xlabel: "time (s)", ylabel: "light change (% of DC)" });
      const red = ch.line("#ff7b6b", 2.4), ir = ch.line(C.gold, 2.4);
      const lr = ch.label("#ff7b6b", 12.5), li = ch.label(C.gold, 12.5);
      const marks = [0, 1, 2, 3, 4, 5, 6].map(() => ch.dot(C.yellow, 3.5));
      const wave = (ph) => { const a = Math.exp(-Math.pow((ph - 0.15) / 0.07, 2)), b = 0.35 * Math.exp(-Math.pow((ph - 0.45) / 0.08, 2)); return (a + b) / 1.0; };
      ui.slider("true SpO₂", 80, 100, 1, spo2, (v) => { spo2 = v; draw(); return v + " %"; });
      ui.slider("heart rate", 45, 150, 1, hr, (v) => { hr = v; draw(); return v + " bpm"; });
      function draw() {
        const Rr = (110 - spo2) / 25, acIR = 2.0, acR = Rr * acIR, f = hr / 60;
        const pr = [], pi = [];
        for (let k = 0; k <= 400; k++) {
          const t = (4 * k) / 400, ph = (t * f) % 1;
          pi.push([t, -acIR * wave(ph)]);
          pr.push([t, -acR * wave(ph)]);
        }
        red.set(pr); ir.set(pi);
        lr.set(3.05, Math.max(-2.75, -acR - 0.3), "red 660 nm"); li.set(3.05, 0.35, "infrared 940 nm");
        marks.forEach((m, k) => { const t = (k + 0.15) / f; if (t <= 4) m.set(t, -acIR * wave(0.15)); else m.set(NaN, NaN); });
        ui.read.innerHTML =
          `AC/DC: red <b style="color:#ff7b6b">${fmt(acR, 2)} %</b>, infrared <b style="color:${C.gold}">${fmt(acIR, 2)} %</b> → ratio of ratios R = ${fmt(Rr, 2)}<br>` +
          `calibration SpO₂ ≈ 110 − 25R = <b style="color:${C.green}">${fmt(110 - 25 * Rr, 1)} %</b> · peaks every ${fmt(60 / hr, 2)} s → <b style="color:${C.yellow}">${hr} bpm</b>` +
          (spo2 < 90 ? ` · <span style="color:${C.red}">below 90 %: low oxygen (hypoxaemia)</span>` : "");
      }
      draw();
    },
  });
})();
