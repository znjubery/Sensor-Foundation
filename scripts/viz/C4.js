/* C4 — surface tension, capillarity, droplets and electrokinetics: widgets for docs/C4-surface-tension-capillarity-droplets-and-electrokinetics.md */
(function () {
  "use strict";
  const { register, C, ROLE, scene3d, chart, ramp, fmt, loop, rng, mix, S, tween } = VIZ;
  const G = 9.81;

  // ───────────────────────────────── c4-capillary-3d ─────────────────────────────────
  register("c4-capillary-3d", {
    title: "3D · capillary rise: h = 2γ cosθ / (ρ g r), thin tubes climb higher",
    target: "After this you can predict how high (or how low) a liquid stands in a tube of radius r, and explain it as a force balance and as a Laplace suction.",
    caption: "three glass tubes (r = 0.4, 0.8 and 1.6 mm) dip in a bath; the columns stand at h, h/2 and h/4 because the rim pull grows like r but the weight like r². Drag the contact angle past 90° (PDMS, Teflon) and the meniscus flips from a cup to a dome and the level drops below the bath. Heights are to scale (grid lines every 10 mm); tube widths are drawn 2× wider than to scale.",
    links: [
      { id: "B1", why: "surface (∝ ℓ) beats weight (∝ ℓ³) below the 2.7 mm capillary length" },
      { id: "C2", why: "the same Laplace suction drives Poiseuille flow when it wicks along a channel" },
      { id: "C5", why: "capillary filling and hydrophobic stop valves meter the sample with no pump" },
    ],
    build(fig, ui) {
      const LIQ = [
        { name: "water", gamma: 0.072, rho: 1000, col: C.water },
        { name: "ethanol", gamma: 0.022, rho: 789, col: mix(C.water, "#ffffff", 0.35) },
        { name: "mercury", gamma: 0.485, rho: 13534, col: "#b9c2cf", theta: 140 },
      ];
      let liq = LIQ[0], theta = 0, step = 0;
      const tubes = [{ r: 0.4e-3, x: -2.3 }, { r: 0.8e-3, x: 0 }, { r: 1.6e-3, x: 2.3 }];
      const ZS = 1 / 8;            // display units per mm of height
      const RS = 0.25;             // display units per mm of radius (2x the height scale, for visibility)
      const ZBOT = -3.8, ZTOP = 5.5;
      const hOf = (r) => (2 * liq.gamma * Math.cos((theta * Math.PI) / 180)) / (liq.rho * G * r); // metres
      const sc = scene3d(ui.body, {
        w: 640, h: 460, scale: 40, yaw: -0.32, pitch: 0.24, dist: 40, center: [0, 0, 0.75],
        draw(g) {
          const ct = Math.cos((theta * Math.PI) / 180);
          // bath (translucent water box) and the ruler
          const bx = [-3.7, 3.7], by = [-1.3, 1.3];
          g.box([bx[0] - 0.08, by[0] - 0.08, ZBOT - 0.1], [bx[1] + 0.08, by[1] + 0.08, ZBOT], C.silicon, { alpha: 0.9 });
          g.poly([[bx[0], by[0], 0], [bx[1], by[0], 0], [bx[1], by[1], 0], [bx[0], by[1], 0]], liq.col, { alpha: 0.28, shade: false });
          g.poly([[bx[0], by[0], ZBOT], [bx[1], by[0], ZBOT], [bx[1], by[0], 0], [bx[0], by[0], 0]], liq.col, { alpha: 0.16, shade: false, bias: 30 });
          g.poly([[bx[1], by[0], ZBOT], [bx[1], by[1], ZBOT], [bx[1], by[1], 0], [bx[1], by[0], 0]], liq.col, { alpha: 0.12, shade: false });
          [[bx[0], by[0]], [bx[1], by[0]], [bx[1], by[1]], [bx[0], by[1]]].forEach((p) => g.line([p[0], p[1], ZBOT], [p[0], p[1], 0.6], C.silicon, 1.2));
          [[[bx[0], by[0]], [bx[1], by[0]]], [[bx[1], by[0]], [bx[1], by[1]]], [[bx[1], by[1]], [bx[0], by[1]]], [[bx[0], by[1]], [bx[0], by[0]]]].forEach(([a, b]) => {
            g.line([a[0], a[1], 0.6], [b[0], b[1], 0.6], C.silicon, 1.2);
            g.line([a[0], a[1], 0], [b[0], b[1], 0], mix(liq.col, "#ffffff", 0.3), 1.2);
          });
          // ruler behind the tubes: ticks every 10 mm
          const ry = 1.15, rx = -3.55;
          g.line([rx, ry, ZBOT + 0.3], [rx, ry, ZTOP], C.dim, 1.2);
          for (let mm = -30; mm <= 40; mm += 10) {
            const z = mm * ZS;
            g.line([rx, ry, z], [rx + 7.1, ry, z], mm === 0 ? C.axis : C.gridFaint, mm === 0 ? 1.2 : 1, mm === 0 ? [] : [4, 4]);
            g.text([rx - 0.25, ry, z], (mm > 0 ? "+" : "") + mm + " mm", C.dim, 11, "end");
          }
          tubes.forEach((tb, i) => {
            const a = tb.r * 1e3 * RS;              // display radius
            const h = hOf(tb.r);
            let zc = Math.max(ZBOT + 0.3, Math.min(ZTOP - 0.3, h * 1e3 * ZS));
            const hot = i === 1 && step <= 3;
            // meniscus: spherical cap of radius R = a / cosθ (signed)
            const capZ = (rr) => {
              if (Math.abs(ct) < 1e-3) return 0;
              const R = a / ct, sgn = Math.sign(R);
              return sgn * (Math.abs(R) - Math.sqrt(Math.max(0, R * R - rr * rr)));
            };
            const zc0 = zc - (capZ(a) > 0 ? 0 : 0);
            const zRim = zc0 + capZ(a);
            // liquid column (from the tube bottom up to the meniscus)
            const zb = ZBOT + 0.35;
            const zs = [zb, Math.min(0, zc0), zc0].filter((v, k, arr) => k === 0 || v > arr[k - 1] + 1e-6);
            for (let k = 0; k + 1 < zs.length; k++) g.cylinder([tb.x, 0, zs[k]], [tb.x, 0, zs[k + 1]], a * 0.97, liq.col, 14, { alpha: zs[k + 1] > 0.001 ? 0.85 : 0.45, open: true });
            g.surface((u, v) => [tb.x + u * Math.cos(v), Math.sin(v) * u, zc0 + capZ(u)], [0, a * 0.97, 3], [0, 2 * Math.PI, 14],
              () => mix(liq.col, "#ffffff", 0.25), { alpha: 0.95, bias: 0.05 });
            // glass tube (open cylinder), split in segments for depth sorting
            const segs = [ZBOT + 0.3, -1.5, 0, 1.8, 3.6, ZTOP];
            for (let k = 0; k + 1 < segs.length; k++)
              g.cylinder([tb.x, 0, segs[k]], [tb.x, 0, segs[k + 1]], a * 1.06, mix(C.silicon, "#ffffff", 0.3), 16, { alpha: 0.16, open: true, stroke: C.silicon, strokeAlpha: 0.25 });
            g.line([tb.x - a * 1.06, 0, ZBOT + 0.3], [tb.x - a * 1.06, 0, ZTOP], mix(C.silicon, "#ffffff", 0.4), 1);
            g.line([tb.x + a * 1.06, 0, ZBOT + 0.3], [tb.x + a * 1.06, 0, ZTOP], mix(C.silicon, "#ffffff", 0.4), 1);
            // labels
            g.text([tb.x, 0, ZTOP + 0.35], "r = " + fmt(tb.r * 1e3, 1) + " mm", hot ? C.yellow : C.text, 12.5);
            g.text([tb.x + a + 0.25, 0, zRim + 0.2], fmt(h * 1e3, 1) + " mm", ROLE.y, 13, "start");
            // forces on the highlighted tube
            if (i === 1 && step <= 1) {
              const n = 4, Lf = 1.25 * ct;
              for (let k = 0; k < n; k++) {
                const ph = (2 * Math.PI * k) / n + 0.3, px = tb.x + a * Math.cos(ph), py = a * Math.sin(ph);
                g.arrow([px, py, zRim], [px, py, zRim + Lf], ROLE.mech, 2.4);
              }
              g.text([tb.x - a - 0.35, 0, zRim + Lf * 0.6], "2πrγ cosθ", ROLE.mech, 12.5, "end");
            }
            if (i === 1 && step === 1 && zc0 > 0.05) {
              g.arrow([tb.x, -a - 0.12, zc0 * 0.75], [tb.x, -a - 0.12, zc0 * 0.75 - Math.min(2.2, 1.25 * Math.abs(ct) + 0.3)], ROLE.mech, 3.4);
              g.text([tb.x - a - 0.35, 0, zc0 * 0.45], "ρgπr²h", ROLE.mech, 12.5, "end");
            }
            if (i === 1 && step === 3) {
              g.text([tb.x - a - 0.3, 0, zc0 + 0.55], "p_atm", C.text, 12, "end");
              g.text([tb.x - a - 0.3, 0, zc0 - 0.3], "p_atm − 2γcosθ/r", ROLE.fluid, 12, "end");
              g.text([tb.x - a - 0.3, 0, 0.2], "p_atm (bath level)", C.text, 12, "end");
              g.line([tb.x + a * 1.2, 0, 0], [tb.x + a * 1.2, 0, zc0], ROLE.y, 2.2, [5, 4]);
            }
          });
          g.text([3.7, -1.3, ZBOT + 0.25], liq.name + " · θ = " + Math.round(theta) + "°", C.text, 13, "end");
        },
      });
      const thSl = ui.slider("contact angle θ", 0, 140, 1, theta, (v) => { theta = v; sc.render(); readout(); return Math.round(v) + "°"; });
      LIQ.forEach((L) => ui.button(L.name, () => { liq = L; thSl.set(L.theta !== undefined ? L.theta : 0); }));
      function readout() {
        const ct = Math.cos((theta * Math.PI) / 180), r = tubes[1].r, h = hOf(r);
        const F = 2 * Math.PI * r * liq.gamma * ct, W = liq.rho * G * Math.PI * r * r * h;
        ui.read.innerHTML =
          `<b>${liq.name}</b>: γ = ${fmt(liq.gamma * 1e3, 0)} mN/m, ρ = ${liq.rho} kg/m³ · cosθ = ${fmt(ct, 3)} (${ct >= 0 ? "wetting: rise" : "non-wetting: depression"})<br>` +
          `h = <b style="color:${C.yellow}">${tubes.map((t) => fmt(hOf(t.r) * 1e3, 1)).join(" / ")} mm</b> for r = 0.4 / 0.8 / 1.6 mm<br>` +
          `middle tube: pull 2πrγcosθ = <span style="color:${C.purple}">${fmt(F * 1e6, 1)} µN</span> = weight ρgπr²h = <span style="color:${C.purple}">${fmt(W * 1e6, 1)} µN</span> · ` +
          `suction 2γcosθ/r = <span style="color:${C.water}">${fmt((2 * liq.gamma * ct) / r, 0)} Pa</span>`;
      }
      ui.steps([
        "Around the rim the surface pulls along the wall: vertical force \\( F_\\gamma = 2\\pi r\\,\\gamma\\cos\\theta \\) (purple arrows). It grows like the <b>perimeter</b>, ∝ r.",
        "The raised column has weight \\( W=\\rho g_{\\text{grav}}\\,\\pi r^2 h \\) (down arrow). It grows like the <b>area</b>, ∝ r², for the same h.",
        "Balance \\( 2\\pi r\\gamma\\cos\\theta=\\rho g_{\\text{grav}}\\pi r^2h \\Rightarrow h=\\dfrac{2\\gamma\\cos\\theta}{\\rho g_{\\text{grav}} r} \\). Halve r, double h: read 36.7, 18.3 and 9.2 mm for water.",
        "Same result with pressure: under the curved meniscus \\( p=p_{\\text{atm}}-2\\gamma\\cos\\theta/r \\) (Laplace). Going down by h adds \\( \\rho g_{\\text{grav}} h \\), so the bath level is back at \\( p_{\\text{atm}} \\).",
        "Hydrophobic wall (PDMS, θ ≈ 110°): \\( \\cos\\theta<0 \\), the meniscus becomes a dome and h is negative: the liquid is pushed <b>down</b> (−10 mm at r = 0.5 mm).",
      ], (i) => {
        step = i;
        if (i === 4 && theta < 95) { const t0 = theta; tween(900, (e) => thSl.set(t0 + (110 - t0) * e)); }
        else if (i < 4 && theta > 90 && liq.name !== "mercury") { const t0 = theta; tween(600, (e) => thSl.set(t0 * (1 - e))); }
        sc.render(); readout();
      });
      readout();
    },
  });

  // ───────────────────────────────── c4-droplets-3d ─────────────────────────────────
  register("c4-droplets-3d", {
    title: "3D · a T-junction makes droplets: L/w ≈ 1 + Q_d/Q_c, f = Q_d/V",
    target: "After this you can predict the size and rate of droplets from the two flow rates, tell when Ca is small enough for the squeezing law, and turn a count of bright droplets into a concentration.",
    caption: "oil flows left to right; water enters from the side channel, blocks the junction, is squeezed off and drifts away as a plug (shown in slow motion). In the squeezing regime the length depends only on the flow ratio, not on how fast you pump; above Ca ≈ 0.01 the droplets are torn off early (illustrative trend). Step 5 seeds each droplet with DNA copies (Poisson) and lights up the ones that hold at least one, as in digital PCR.",
    links: [
      { id: "C1", why: "laminar, low-Re flow is why the interface is so regular" },
      { id: "C2", why: "the oil's pressure build-up behind the blocked junction is what squeezes the neck" },
      { id: "C5", why: "each droplet is a 0.75 nL test tube for on-chip PCR" },
      { id: "A8", why: "Poisson counting statistics set the precision of a digital assay" },
    ],
    build(fig, ui) {
      let q = 0.5, Qc = 2, step = -1;            // Qd/Qc, Qc in µL/min
      const w = 100e-6, hh = 50e-6, mu = 5e-3, gam = 5e-3, conc = 476;   // copies/µL
      const WD = 0.6, HD = 0.3;                  // display width/height of the channel (1 unit = 100/0.6 µm)
      const XJ0 = -4.6, XJ1 = XJ0 + WD, XEND = 7;
            const copies = [];                          // copies per droplet index
      const pois = (lam, k0) => { const r = rng(k0 * 7919 + 17); r(); r(); let L = Math.exp(-lam), k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; };
      let period = 0;                            // integer count of produced droplets
      function phys() {
        const U = (Qc * 1e-9 / 60) / (w * hh), Ca = (mu * U) / gam;
        let Lw = 1 + q;
        if (Ca > 0.01) Lw *= Math.pow(0.01 / Ca, 0.25);
        const L = Lw * w, V = w * hh * L, f = (q * Qc * 1e-9 / 60) / V;
        return { U, Ca, Lw, L, V, f, nbar: conc * V * 1e9 };
      }
      let P = phys();
      const pill = (g, xc, len, col, alpha) => {
        const a = len / 2, b = Math.min(WD * 0.46, a), c = Math.min(HD * 0.46, a);
        const sp = (x, e) => Math.sign(x) * Math.pow(Math.abs(x), e);
        g.surface((u, v) => [xc + a * sp(Math.sin(u), 0.4), b * sp(Math.cos(u), 0.4) * sp(Math.cos(v), 0.7), c * sp(Math.cos(u), 0.4) * sp(Math.sin(v), 0.7)],
          [-Math.PI / 2, Math.PI / 2, 8], [-Math.PI, Math.PI, 10], () => col, { alpha: alpha === undefined ? 1 : alpha, bias: 60 });
      };
      const sc = scene3d(ui.body, {
        w: 640, h: 330, scale: 44, yaw: -0.12, pitch: 0.95, dist: 40, center: [0.6, -1.45, 0], animate: !VIZ.reduceMotion,
        draw(g, t) {
          const Tv = Math.max(0.6, Math.min(4, 1.6 * (22.2 / Math.max(P.f, 0.1))));
          const frozen = step >= 0 && step <= 1;
          const tt = (frozen ? (step === 0 ? 0.55 : 0.88) : 0.3) * Tv + 8 * Tv + (frozen ? 0 : t);   // pre-roll: the channel starts full of droplets
          const ph = (tt / Tv) % 1, nNow = Math.floor(tt / Tv);
          if (nNow !== period) period = nNow;
          const Ld = P.Lw * WD, dp = P.Lw * WD * (1 + 1 / q);
          // chip body (PDMS) and channel outline
          g.box([-6.2, -3.1, -0.75], [7.4, 1.1, -HD / 2], C.silicon, { alpha: 1 });
          const oil = mix(C.water, C.bg, 0.72);
          g.poly([[-6.2, -WD / 2, -HD / 2 + 0.002], [XEND + 0.4, -WD / 2, -HD / 2 + 0.002], [XEND + 0.4, WD / 2, -HD / 2 + 0.002], [-6.2, WD / 2, -HD / 2 + 0.002]], oil, { shade: false, bias: 50 });
          g.poly([[XJ0, -3.1, -HD / 2 + 0.002], [XJ1, -3.1, -HD / 2 + 0.002], [XJ1, -WD / 2, -HD / 2 + 0.002], [XJ0, -WD / 2, -HD / 2 + 0.002]], oil, { shade: false, bias: 50 });
          const ed = mix(C.silicon, "#ffffff", 0.45);
          [-HD / 2, HD / 2].forEach((z) => {
            g.line([-6.2, WD / 2, z], [XEND + 0.4, WD / 2, z], ed, 1.2);
            g.line([-6.2, -WD / 2, z], [XJ0, -WD / 2, z], ed, 1.2);
            g.line([XJ1, -WD / 2, z], [XEND + 0.4, -WD / 2, z], ed, 1.2);
            g.line([XJ0, -WD / 2, z], [XJ0, -3.1, z], ed, 1.2);
            g.line([XJ1, -WD / 2, z], [XJ1, -3.1, z], ed, 1.2);
          });
          // arrows: inlets / outlet
          g.arrow([-6.0, 0, 0.5], [-4.9, 0, 0.5], C.water, 2.5); g.text([-6.0, 0, 0.85], "oil  Q_c", C.dim, 12, "start");
          g.arrow([XJ0 + WD / 2, -3.0, 0.5], [XJ0 + WD / 2, -2.1, 0.5], C.water, 2.5); g.text([XJ0 + WD / 2 + 0.4, -2.9, 0.5], "water  Q_d", C.water, 12, "start");
          // water in the side channel
          const waterCol = C.water;
          g.box([XJ0 + 0.03, -3.1, -HD / 2 + 0.02], [XJ1 - 0.03, -WD / 2 - 0.02, HD / 2 - 0.02], waterCol, { alpha: 0.95, bias: 60 });
          // the growing / necking plug at the junction
          const lit = (k) => step >= 4 && (copies[k] || 0) > 0;
          const colOf = (k) => (lit(k) ? C.yellow : waterCol);
          const cur = period;
          if (copies[cur] === undefined) copies[cur] = pois(P.nbar, cur);
          if (ph < 0.72) {
            const len = Math.max(WD * 0.5, Ld * (0.25 + 0.75 * (ph / 0.72)));
            pill(g, XJ0 + len / 2, len, waterCol);
            g.box([XJ0 + 0.03, -WD / 2 - 0.03, -HD / 2 + 0.03], [XJ1 - 0.03, 0, HD / 2 - 0.03], waterCol, { bias: 60 });
          } else {
            const e = (ph - 0.72) / 0.28, x0 = XJ0 + 0.35 * WD * e;
            pill(g, x0 + Ld / 2, Ld, waterCol);
            const nw = WD * 0.94 * (1 - e) + 0.02;
            g.box([XJ0 + WD / 2 - nw / 2, -WD / 2 - 0.03, -HD / 2 + 0.03], [XJ0 + WD / 2 + nw / 2, -0.05, HD / 2 - 0.03], waterCol, { bias: 60 });
            if (step === 1) {
              g.arrow([XJ0 - 0.9, 0, 0.45], [XJ0 + 0.05, 0, 0.45], C.purple, 3);
              g.text([XJ1 + 0.35, -1.05, 0], "← oil pressure squeezes the neck", C.purple, 12.5, "start");
            }
          }
          // detached droplets travelling downstream
          const xc0 = XJ0 + 0.35 * WD + Ld / 2;
          for (let n = 0; n < 12; n++) {
            const k = cur - 1 - n;
            if (k < 0) break;
            const xc = xc0 + (n + ph) * dp;
            if (xc - Ld / 2 > XEND) break;
            if (copies[k] === undefined) copies[k] = pois(P.nbar, k);
            pill(g, xc, Ld, colOf(k));
            if (step >= 4) for (let m = 0; m < Math.min(4, copies[k]); m++) g.text([xc - Ld * 0.25 + m * Ld * 0.17, 0, HD / 2 + 0.1], "●", C.blue, 9);
          }
          // annotations driven by the stepper
          if (step === 2 || step === 3) {
            const xa = xc0 + ph * dp, xb = xa + dp;
            g.line([xa - Ld / 2, -WD / 2 - 0.25, 0], [xa + Ld / 2, -WD / 2 - 0.25, 0], C.yellow, 2.4);
            g.text([xa, -WD / 2 - 0.6, 0], "L = " + fmt(P.L * 1e6, 0) + " µm", C.yellow, 12.5);
            if (step === 3 && xb + Ld / 2 < XEND) {
              g.line([xa, WD / 2 + 0.25, 0], [xb, WD / 2 + 0.25, 0], C.green, 2, [5, 4]);
              g.text([(xa + xb) / 2, WD / 2 + 0.6, 0], "spacing " + fmt(P.L * (1 + 1 / q) * 1e6, 0) + " µm", C.green, 12.5);
            }
          }
          g.text([XEND, -2.6, -0.2], "slow motion ×" + fmt(P.f * Tv, 0), C.dim, 12, "end");
        },
      });
      ui.slider("flow ratio Q_d/Q_c", 0.1, 2, 0.05, q, (v) => { q = v; P = phys(); copies.length = 0; readout(); sc.render(); return fmt(v, 2); });
      ui.slider("oil flow Q_c", 0.5, 20, 0.5, Qc, (v) => { Qc = v; P = phys(); copies.length = 0; readout(); sc.render(); return fmt(v, 1) + " µL/min"; });
      function readout() {
        const pos = 1 - Math.exp(-P.nbar);
        ui.read.innerHTML =
          `U = ${fmt(P.U * 1e3, 2)} mm/s · <b>Ca = ${P.Ca.toExponential(2)}</b> → ${P.Ca <= 0.01 ? `<span style="color:${C.green}">squeezing: L/w = 1 + Q_d/Q_c</span>` : `<span style="color:${C.red}">dripping: drops torn off early (trend only)</span>`}<br>` +
          `L = <b style="color:${C.yellow}">${fmt(P.L * 1e6, 0)} µm</b> (${fmt(P.Lw, 2)} w) · V ≈ w h L = <b>${fmt(P.V * 1e12, 2)} nL</b> · f = Q_d/V = <b>${fmt(P.f, 1)} Hz</b><br>` +
          `digital PCR at 476 copies/µL: n̄ = cV = ${fmt(P.nbar, 3)} copies/droplet → ${fmt(pos * 100, 1)}% of droplets light up`;
      }
      ui.steps([
        "The water tip grows into the main channel until it <b>blocks</b> it (frozen frame). Interfaces are stiff: \\( \\mathrm{Ca}=\\mu U/\\gamma \\ll 1 \\).",
        "Now the oil can only leak past the corners, so its pressure builds up behind the tip and <b>squeezes the neck</b> at a rate set by \\( Q_{\\text{c}} \\).",
        "While the neck closes (time \\( \\propto w\\cdot wh/Q_{\\text{c}} \\)) water keeps flowing in: \\( L_{\\text{drop}}=w\\,(1+\\alpha Q_{\\text{d}}/Q_{\\text{c}}) \\). Try Q_c: in the squeezing regime L does not change!",
        "Each droplet holds \\( V\\approx whL_{\\text{drop}} \\), so the rate is \\( f=Q_{\\text{d}}/V \\) and the spacing is \\( L_{\\text{drop}}(1+Q_{\\text{c}}/Q_{\\text{d}}) \\) (volume conservation).",
        "Digital PCR: copies per droplet are Poisson with mean \\( \\bar n=cV \\). After amplification a droplet is bright if it holds ≥ 1 copy: \\( p=1-e^{-\\bar n} \\), so \\( \\bar n=-\\ln(1-p) \\).",
      ], (i) => { step = i; readout(); sc.render(); });
      readout();
    },
  });

  // ───────────────────────────────── c4-eof ─────────────────────────────────
  register("c4-eof", {
    title: "Electro-osmosis · a charged wall drags a flat plug: u_eo = −ε₀ε_r ζ 𝓔 / μ",
    target: "After this you can explain why electro-osmotic flow is flat (a plug) while pressure flow is a parabola, compute u_eo, and say how salt sets the Debye length.",
    caption: "top: a channel seen from the side, with the negative wall charge (teal −) and the cloud of positive counter-ions (+, drawn much thicker than real). Two dye bands start together: the blue one rides the electro-osmotic plug and stays sharp; the red dashed one rides a pressure-driven parabola with the same mean speed and is smeared into an arrowhead. Bottom: the real profile next to the wall, on a log scale in nanometres. Add salt and the layer shrinks from about 1 µm to under 1 nm.",
    links: [
      { id: "C2", why: "the parabolic profile and R_hyd ∝ 1/h⁴ of pressure-driven flow" },
      { id: "C3", why: "the parabola's smearing is Taylor dispersion; the plug avoids it" },
      { id: "A6", why: "the same double layer is the capacitor at every electrode surface" },
      { id: "C5", why: "capillary electrophoresis and EOF pumping on a chip" },
    ],
    build(fig, ui) {
      let logc = -3, E = 100, step = 0;    // mol/L, V/cm
      const eps = 8.854e-12 * 78.5, zeta = -0.05, mu = 1e-3;
      const lamD = () => 0.304e-9 / Math.sqrt(Math.pow(10, logc));
      const ueo = () => (-eps * zeta * (E * 100)) / mu;
      const W = 640, H = 230, X0 = 30, X1 = 610, YT = 40, YB = 190;
      const svg = S("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "electro-osmotic flow in a channel" }, ui.body);
      S("rect", { x: X0, y: YT - 16, width: X1 - X0, height: 16, fill: C.silicon }, svg);
      S("rect", { x: X0, y: YB, width: X1 - X0, height: 16, fill: C.silicon }, svg);
      S("rect", { x: X0, y: YT, width: X1 - X0, height: YB - YT, fill: C.water, "fill-opacity": 0.08 }, svg);
      const gCharge = S("g", {}, svg), gCloud = S("g", {}, svg), gForce = S("g", {}, svg), gProf = S("g", {}, svg), gBand = S("g", {}, svg), gTxt = S("g", {}, svg);
      for (let x = X0 + 12; x < X1; x += 22) {
        [YT + 1, YB - 1].forEach((y) => { const t = S("text", { x, y: y + (y < 100 ? 6 : 4), fill: C.teal, "font-size": 15, "text-anchor": "middle", "font-weight": 700 }, gCharge); t.textContent = "−"; });
      }
      const tx = (x, y, s, col, anc, size) => { const t = S("text", { x, y, fill: col, "font-size": size || 12.5, "text-anchor": anc || "start", "font-family": "var(--font-mono, monospace)", "paint-order": "stroke", stroke: C.bg, "stroke-width": 4 }, gTxt); t.textContent = s; return t; };
      tx(X0 + 4, YT - 22, "glass wall, ζ = −50 mV", C.dim);
      const eLab = tx(X1, YT - 22, "", C.teal, "end");
      const lamLab = tx(X0 + 4, YB + 30, "", C.dim);
      const bandA = S("path", { fill: "none", stroke: C.blue, "stroke-width": 4, "stroke-linecap": "round" }, gBand);
      const bandB = S("path", { fill: "none", stroke: C.red, "stroke-width": 2.5, "stroke-dasharray": "6 4" }, gBand);
      const profA = S("path", { fill: C.water, "fill-opacity": 0.18, stroke: C.water, "stroke-width": 2.5 }, gProf);
      const profB = S("path", { fill: "none", stroke: C.red, "stroke-width": 2, "stroke-dasharray": "5 4" }, gProf);
      const arrows = [];
      for (let k = 0; k < 9; k++) arrows.push(S("line", { stroke: C.water, "stroke-width": 2, "marker-end": "" }, gProf));
      const XP = 70;      // profile baseline
      const lamPx = () => Math.max(3, Math.min(16, 3 + 4 * (Math.log10(lamD() * 1e9) + 0.2)));
      // the zoom chart: profile near the wall, log distance in nm
      const ch = chart(ui.body, { w: 640, h: 210, xr: [0.1, 1e4], yr: [0, 1.05], logx: true, xlabel: "distance from the wall (nm, log scale)", ylabel: "fraction", mb: 38 });
      const cPhi = ch.line(C.teal, 2.5), cU = ch.line(C.water, 3), vl = ch.vline(C.yellow), labPhi = ch.label(C.teal, 12.5), labU = ch.label(C.water, 12.5), labL = ch.label(C.yellow, 12.5);
      [[0.3, "ion", "middle"], [10, "antibody", "middle"], [5000, "half of a 10 µm channel", "end"]].forEach(([x, s, an]) => { const v = ch.vline(C.dim, "2 4"); v.set(x); const l = ch.label(C.dim, 11, an); l.set(an === "end" ? x * 0.9 : x, 0.05, s); });
      const hint = S("text", { x: (X0 + X1) / 2, y: (YT + YB) / 2, fill: C.dim, "font-size": 14, "text-anchor": "middle", "font-family": "var(--font-mono, monospace)" }, svg);
      hint.textContent = "press ▶ below: ion cloud → field → plug flow → compare with pressure";
      function drawStatic() {
        const lp = lamPx(), ue = ueo();
        // counter-ion cloud
        gCloud.innerHTML = "";
        if (step >= 1) {
          for (let x = X0 + 8; x < X1; x += 17) {
            [[YT + 9 + lp * 0.6, 1], [YB - 14 - lp * 0.6, -1]].forEach(([y]) => {
              const t = S("text", { x, y: y + 4, fill: C.teal, "font-size": 12, "text-anchor": "middle", opacity: 0.85 }, gCloud); t.textContent = "+";
            });
          }
          S("rect", { x: X0, y: YT, width: X1 - X0, height: lp + 6, fill: C.teal, "fill-opacity": 0.12 }, gCloud);
          S("rect", { x: X0, y: YB - lp - 6, width: X1 - X0, height: lp + 6, fill: C.teal, "fill-opacity": 0.12 }, gCloud);
        }
        // force on the cloud
        gForce.innerHTML = "";
        if (step >= 2) {
          const mk = (x, y) => { S("line", { x1: x, y1: y, x2: x + 26, y2: y, stroke: C.teal, "stroke-width": 2.5 }, gForce); S("polygon", { points: `${x + 32},${y} ${x + 24},${y - 4} ${x + 24},${y + 4}`, fill: C.teal }, gForce); };
          for (let x = X0 + 150; x < X1 - 40; x += 120) { mk(x, YT + 6 + lp * 0.5 + 12); mk(x, YB - 6 - lp * 0.5 - 12); }
          S("line", { x1: X1 - 150, y1: YT - 8, x2: X1 - 100, y2: YT - 8, stroke: C.teal, "stroke-width": 0 }, gForce);
        }
        eLab.textContent = step >= 2 ? `field 𝓔 = ${E} V/cm →` : "";
        // velocity profiles
        const umax = 1.5;   // parabola peak relative to the mean (slit)
        const pxPerU = 90;  // px per u_eo at 100 V/cm
        const s = ue / 3.475e-4;  // relative to 100 V/cm
        let dA = `M${XP},${YT}`, dB = "";
        for (let k = 0; k <= 60; k++) {
          const y = YT + ((YB - YT) * k) / 60, d = Math.min(y - YT, YB - y);
          const uA = s * (1 - Math.exp(-d / lp));
          dA += `L${XP + uA * pxPerU},${y}`;
          const eta = (2 * (y - YT)) / (YB - YT) - 1, uB = s * umax * (1 - eta * eta);
          dB += `${k ? "L" : "M"}${XP + uB * pxPerU},${y}`;
        }
        dA += `L${XP},${YB}Z`;
        profA.setAttribute("d", step >= 3 ? dA : "");
        profB.setAttribute("d", step >= 4 ? dB : "");
        arrows.forEach((a, k) => {
          const y = YT + ((YB - YT) * (k + 0.5)) / arrows.length, d = Math.min(y - YT, YB - y), uA = s * (1 - Math.exp(-d / lp));
          a.setAttribute("x1", XP); a.setAttribute("x2", XP + uA * pxPerU); a.setAttribute("y1", y); a.setAttribute("y2", y);
          a.setAttribute("visibility", step >= 3 ? "visible" : "hidden");
        });
        lamLab.textContent = `λ_D = ${lamD() * 1e9 < 10 ? fmt(lamD() * 1e9, 2) : fmt(lamD() * 1e9, 0)} nm (drawn ${fmt(lp, 0)} px thick, real ones are far thinner than the channel)`;
        // chart
        const L = lamD() * 1e9, xs = [];
        for (let k = 0; k <= 160; k++) xs.push(Math.pow(10, -1 + (5 * k) / 160));
        cPhi.set(xs.map((x) => [x, Math.exp(-x / L)]));
        cU.set(step >= 3 ? xs.map((x) => [x, 1 - Math.exp(-x / L)]) : []);
        vl.set(L);
        labL.set(L * 1.15, 0.5, "λ_D");
        hint.setAttribute("visibility", step === 0 ? "visible" : "hidden");
        labPhi.set(Math.max(0.12, L / 30), 0.9, "potential φ/ζ = e^(−y/λ_D)");
        labU.set(Math.min(2500, L * 4), 0.62, step >= 3 ? "speed u/u_eo = 1 − e^(−y/λ_D)" : "");
        const c = Math.pow(10, logc);
        ui.read.innerHTML =
          `salt c = ${c >= 1e-3 ? fmt(c * 1e3, c >= 0.01 ? 0 : 1) + " mM" : fmt(c * 1e6, c >= 1e-6 ? 0 : 2) + " µM"} → <b style="color:${C.teal}">λ_D = ${fmt(L, L < 10 ? 2 : 0)} nm</b> · ` +
          `𝓔 = ${E} V/cm → <b style="color:${C.water}">u_eo = ${fmt(ue * 1e3, 3)} mm/s</b> (mobility ${fmt(ue / (E * 100) * 1e8, 2)}×10⁻⁸ m²/V·s)<br>` +
          `pressure flow with the same mean: centre ${fmt(1.5 * ue * 1e3, 3)} mm/s, walls 0 → the band smears; the plug keeps it sharp`;
      }
      function bands(tau) {
        const s = ueo() / 3.475e-4, lp = lamPx(), pxs = 70;   // px per second at 100 V/cm
        let dA = "", dB = "";
        for (let k = 0; k <= 50; k++) {
          const y = YT + ((YB - YT) * k) / 50, d = Math.min(y - YT, YB - y);
          const uA = s * (1 - Math.exp(-d / lp)), eta = (2 * (y - YT)) / (YB - YT) - 1, uB = s * 1.5 * (1 - eta * eta);
          dA += `${k ? "L" : "M"}${Math.min(X1, 190 + uA * pxs * tau)},${y}`;
          dB += `${k ? "L" : "M"}${Math.min(X1, 190 + uB * pxs * tau)},${y}`;
        }
        bandA.setAttribute("d", step >= 3 ? dA : "");
        bandB.setAttribute("d", step >= 4 ? dB : "");
      }
      let tau0 = 0;
      if (VIZ.reduceMotion) bands(3);
      else loop(svg, (t, dt) => { const s = Math.max(0.05, ueo() / 3.475e-4); tau0 += dt; if (190 + s * 1.5 * 70 * tau0 > X1 + 40) tau0 = 0; bands(tau0); });
      ui.slider("salt (log₁₀ mol/L)", -7, 0, 0.1, logc, (v) => { logc = v; drawStatic(); return fmt(v, 1); });
      ui.slider("field 𝓔", 0, 200, 5, E, (v) => { E = v; drawStatic(); return v + " V/cm"; });
      ui.steps([
        "Glass in water loses protons from its silanol groups (SiOH → SiO⁻ + H⁺): the wall is <b>negative</b>, with zeta potential \\( \\zeta\\approx-50 \\) mV.",
        "Positive counter-ions crowd near the wall in the <b>double layer</b>. Poisson + Boltzmann give \\( \\phi=\\zeta e^{-y/\\lambda_D} \\) with \\( \\lambda_D=\\sqrt{\\varepsilon_0\\varepsilon_rk_BT/(2N_Aq_e^2c)}\\approx 0.304\\,\\text{nm}/\\sqrt{c[\\text{M}]} \\). Slide the salt.",
        "The field \\( \\mathcal E \\) pulls on that net positive charge: body force \\( \\rho_q\\mathcal E \\), only inside the thin layer (teal arrows).",
        "Stokes: \\( \\mu u''=-\\rho_q\\mathcal E=\\varepsilon_0\\varepsilon_r\\mathcal E\\,\\phi'' \\). Integrate twice: \\( u=\\frac{\\varepsilon_0\\varepsilon_r\\mathcal E}{\\mu}(\\phi-\\zeta) \\to u_{\\text{eo}}=-\\frac{\\varepsilon_0\\varepsilon_r\\zeta\\mathcal E}{\\mu} \\) outside the layer: a flat <b>plug</b> (blue band stays sharp).",
        "Pressure flow with the same mean is a parabola, \\( u=\\tfrac32\\bar u\\,(1-\\eta^2) \\): the centre outruns the walls and the red band is stretched (Taylor dispersion, C3). That is why electrophoresis chips pump with voltage.",
      ], (i) => { step = i; drawStatic(); });
      drawStatic();
    },
  });
})();
