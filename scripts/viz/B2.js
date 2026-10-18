/* B2 — microfabrication: widgets for docs/B2-microfabrication-lithography-etching-deposition.md */
(function () {
  "use strict";
  const { register, C, ROLE, scene3d, plane, S, H, fmt, mix, rng, reduceMotion } = VIZ;
  // core.js sizes every <svg> in a figure to 100% width; keep MathJax's own SVGs (stepper math) at their natural size
  if (!document.getElementById("viz-mjx-fix")) {
    const st = document.createElement("style");
    st.id = "viz-mjx-fix";
    st.textContent = "figure.viz mjx-container svg { display: inline; width: auto; height: auto; }";
    document.head.appendChild(st);
  }

  const OXIDE = "#cfe3ef", RESIST = "#e58fb4", CHROME = "#9aa3ad";
  const POLY = mix(C.silicon, ROLE.mech, 0.45);
  const SQ2 = Math.SQRT2, ANG = (Math.acos(1 / Math.sqrt(3)) * 180) / Math.PI;

  // ═════════════════ b2-process-3d: surface micromachining of a cantilever, layer by layer ═════════════════
  register("b2-process-3d", {
    title: "3D · surface micromachining: build a free-standing polysilicon cantilever in ten steps",
    target: "After this you can name every step that turns a bare wafer into a released MEMS beam, and say what each layer is for.",
    caption: "thicknesses are drawn about 10× too large next to the lengths, so you can see the layers: grey = silicon wafer, pale blue = sacrificial oxide, purple-grey = structural polysilicon, pink = photoresist, gold = UV light. Step through the process; at the end the oxide is dissolved in HF and the beam hangs 2 µm above the wafer, held only by its anchor (and it vibrates, as B3 will compute). Drag to look under the beam.",
    links: [
      { id: "B3", why: "the released beam is the cantilever whose stiffness k = Ewt³/4L³ we compute next" },
      { id: "B4", why: "accelerometer proof masses and springs are made by this same sequence" },
      { id: "B1", why: "stiction during release is surface tension winning at small ℓ" },
      { id: "A3", why: "the 2 µm gap under the beam is a capacitor gap g₀" },
    ],
    build(fig, ui) {
      let step = 0;
      const X0 = -3, X1 = 3, Y0 = -1.6, Y1 = 1.6;
      const zS = -0.9, zO = 0.4, zP = 0.78, zR = 1.05;          // tops of substrate, oxide, poly, resist
      const bx = [-2.3, 2.1], by = [-0.55, 0.55], ax = [-2.3, -1.55];  // beam and anchor footprints
      const sc = scene3d(ui.body, {
        w: 640, h: 400, scale: 64, yaw: -0.5, pitch: 0.5, center: [0, 0, 0.75], animate: !reduceMotion,
        draw(g, t) {
          const ed = { stroke: C.bg, strokeAlpha: 0.5, strokeWidth: 0.8, bias: -6 };
          g.box([X0, Y0, zS], [X1, Y1, 0], C.silicon, ed);
          g.text([-1.2, Y0, -0.5], "silicon wafer", C.text, 12);
          // oxide
          if (step >= 1 && step <= 8) {
            const oc = OXIDE, op = { stroke: C.bg, strokeAlpha: 0.35, strokeWidth: 0.8, bias: -3 };
            if (step === 1) g.box([X0, Y0, 0], [X1, Y1, zO], oc, op);
            else {
              g.box([X0, Y0, 0], [ax[0], Y1, zO], oc, op);
              g.box([ax[1], Y0, 0], [X1, Y1, zO], oc, op);
              g.box([ax[0], Y0, 0], [ax[1], by[0], zO], oc, op);
              g.box([ax[0], by[1], 0], [ax[1], Y1, zO], oc, op);
            }
            g.text([1.4, Y0, zO / 2], "SiO₂ (sacrificial, 2 µm)", C.text, 12);
          }
          // polysilicon
          let wob = 0;
          if (step >= 9 && !reduceMotion) wob = 0.12 * Math.sin(2 * Math.PI * 0.9 * t);
          if (step >= 3) {
            const pc = step >= 9 ? mix(C.silicon, ROLE.mech, 0.7) : POLY, op = { stroke: C.bg, strokeAlpha: 0.45, strokeWidth: 0.8, bias: 0.02 };
            if (step <= 6) {
              g.box([X0, Y0, zO], [X1, Y1, zP], pc, op);
              g.box([ax[0], by[0], 0], [ax[1], by[1], zO], pc, op);
            } else {
              g.box([ax[0], by[0], 0], [ax[1], by[1], zP], pc, op);    // anchor
              // beam from anchor to tip, as segments so it can bend after release
              const n = step >= 9 ? 8 : 1, xa = ax[1], L = bx[1] - xa;
              const z = (u) => wob * (u * u * (3 - u)) / 2;
              for (let i = 0; i < n; i++) {
                const u0 = i / n, u1 = (i + 1) / n, x0 = xa + L * u0, x1 = xa + L * u1, z0 = z(u0), z1 = z(u1);
                const P = (x, y, zz) => [x, y, zz];
                g.poly([P(x0, by[0], zP + z0), P(x1, by[0], zP + z1), P(x1, by[1], zP + z1), P(x0, by[1], zP + z0)], pc, op);
                g.poly([P(x0, by[0], zO + z0), P(x1, by[0], zO + z1), P(x1, by[1], zO + z1), P(x0, by[1], zO + z0)], pc, op);
                g.poly([P(x0, by[0], zO + z0), P(x1, by[0], zO + z1), P(x1, by[0], zP + z1), P(x0, by[0], zP + z0)], pc, op);
                g.poly([P(x0, by[1], zO + z0), P(x1, by[1], zO + z1), P(x1, by[1], zP + z1), P(x0, by[1], zP + z0)], pc, op);
                if (i === n - 1) g.poly([P(x1, by[0], zO + z1), P(x1, by[1], zO + z1), P(x1, by[1], zP + z1), P(x1, by[0], zP + z1)], pc, op);
              }
              g.box([ax[0] - 0.7, by[0], zO], [ax[0], by[1], zP], pc, op);  // a short pad behind the anchor
            }
            if (step <= 6) g.text([1.4, Y0, (zO + zP) / 2], "poly-Si (structural, 2 µm)", C.white, 12);
            else g.text([0.6, by[0], zP + 0.35], step >= 9 ? "released poly-Si beam" : "poly-Si beam", C.white, 12);
          }
          // resist
          if (step >= 4 && step <= 7) {
            const exposed = step === 5;
            const rc = RESIST, xc = mix(RESIST, C.gold, 0.6), op = { stroke: C.bg, strokeAlpha: 0.4, strokeWidth: 0.8, bias: 0.03 };
            if (step <= 5) {
              // split into the beam-shaped part (shadowed by chrome) and the rest (exposed in step 5)
              g.box([bx[0], by[0], zP], [bx[1], by[1], zR], rc, op);
              const rest = [[[X0, Y0], [bx[0], Y1]], [[bx[1], Y0], [X1, Y1]], [[bx[0], Y0], [bx[1], by[0]]], [[bx[0], by[1]], [bx[1], Y1]]];
              rest.forEach(([a, b]) => g.box([a[0], a[1], zP], [b[0], b[1], zR], exposed ? xc : rc, op));
            } else g.box([bx[0], by[0], zP], [bx[1], by[1], zR], rc, op);
            g.text(step <= 5 ? [1.4, Y0, (zP + zR) / 2] : [0.6, by[0], zR + 0.3], step === 5 ? "exposed resist turns soluble" : "photoresist (1.4 µm)", C.white, 12);
          }
          // mask and UV light
          if (step === 5) {
            const zm = 2.5;
            g.poly([[X0, Y0, zm], [X1, Y0, zm], [X1, Y1, zm], [X0, Y1, zm]], "#bcd3e6", { alpha: 0.18, stroke: "#bcd3e6", strokeAlpha: 0.6, shade: false, bias: -0.5 });
            g.poly([[bx[0], by[0], zm + 0.01], [bx[1], by[0], zm + 0.01], [bx[1], by[1], zm + 0.01], [bx[0], by[1], zm + 0.01]], CHROME, { shade: false });
            g.text([X0 + 0.2, Y1, zm + 0.3], "photomask (chrome on glass)", C.text, 12);
            g.text([(bx[0] + bx[1]) / 2, 0, zm + 0.12], "chrome", C.text, 12);
            [[-2.6, -1.15], [-0.9, -1.15], [0.8, -1.15], [2.5, -1.15], [-2.6, 1.15], [-0.9, 1.15], [0.8, 1.15], [2.5, 1.15], [2.65, 0]].forEach(([x, y]) => {
              g.arrow([x, y, zm - 0.05], [x, y, zR + 0.08], C.gold, 2);
              g.line([x, y, zm + 0.7], [x, y, zm + 0.05], C.gold, 2);
            });
            g.text([2.9, Y0, zm + 0.9], "UV 365 nm", C.gold, 12);
          }
          if (step >= 9) {
            g.arrow([0.9, by[0] - 0.05, 0.02], [0.9, by[0] - 0.05, zO - 0.02], C.yellow, 2);
            g.arrow([0.9, by[0] - 0.05, zO - 0.02], [0.9, by[0] - 0.05, 0.02], C.yellow, 2);
            g.text([0.9, by[0] - 0.4, 0.2], "gap 2 µm", C.yellow, 12);
          }
        },
      });
      sc.canvas.getContext("2d").lineJoin = "round";   // no miter spikes on outlined labels
      const notes = [
        "start: a polished single-crystal silicon wafer, (100) surface",
        "oxide grown/deposited everywhere: 2 µm, conformal (LPCVD or thermal, ~1100 °C)",
        "mask 1: litho + HF etch open an anchor window down to the wafer",
        "LPCVD polysilicon at ~600 °C, 10 nm/min: 2 µm takes 200 min; it fills the anchor",
        "spin-coat positive resist: 1.4 µm at 4000 rpm (thickness ∝ 1/√rpm)",
        "mask 2: UV through the photomask; the chrome shadows the beam shape",
        "develop: the exposed (soluble) resist washes away; a beam-shaped stencil remains",
        "reactive-ion etch: poly is removed wherever the resist does not cover it",
        "strip the resist (solvent or O₂ plasma)",
        "release: HF dissolves the oxide; dry without a meniscus (critical-point dryer) to avoid stiction",
      ];
      ui.steps([
        "Bare (100) wafer. Everything will be built on its top surface: <b>surface micromachining</b>.",
        "Deposit the <b>sacrificial layer</b>: 2 µm of SiO₂. Its thickness becomes the gap \\(g_0\\) under the beam.",
        "Lithography + etch an <b>anchor</b> hole through the oxide, where the beam will be fixed to the wafer.",
        "Deposit the <b>structural layer</b>: 2 µm of polysilicon, the beam thickness \\(t\\). It also fills the anchor hole.",
        "Spin on photoresist: film thickness \\(\\propto 1/\\sqrt{\\text{rpm}}\\).",
        "Expose through the mask. Smallest printable line \\(R=k_1\\lambda/\\mathrm{NA}\\) (or \\(\\approx\\sqrt{\\lambda g}\\) for a proximity gap \\(g\\)).",
        "Develop: positive resist dissolves where it was exposed. The resist now has the shape of the beam (\\(L\\times w\\)).",
        "Anisotropic plasma etch transfers the pattern into the poly; the oxide below acts as an etch stop.",
        "Strip the resist. The beam is patterned but still glued to the oxide.",
        "Release in HF: the oxide vanishes, the beam is free above a gap \\(g_0=2\\) µm. Capillary pressure \\(2\\gamma/g_0=72\\) kPa while drying is why careful drying matters.",
      ], (i) => { step = i; ui.read.innerHTML = `step ${i + 1} of 10 · <b>${notes[i]}</b>`; sc.render(); });
    },
  });

  // ═════════════════ b2-etch-profile: isotropic vs KOH vs DRIE ═════════════════
  register("b2-etch-profile", {
    title: "Etch profiles · isotropic bowl, KOH V-groove at 54.74°, DRIE vertical trench",
    target: "After this you can predict the shape and depth of a trench from the mask opening W and the etch type, including the self-limiting KOH depth d = W/√2.",
    caption: "cross-section through the wafer (grey) under a hard mask (pale blue) with an opening W. The etchant is shown in blue. Isotropic etching undercuts the mask by the etch depth; KOH stops on the slow (111) planes at 54.74°, so the groove closes at depth (W/2)·tan 54.74° = W/√2 however long you wait; DRIE goes straight down, with scallops from each etch/passivate cycle (enlarged here). Use the stepper to derive the KOH geometry.",
    links: [
      { id: "B5", why: "KOH back-side etching makes the thin membrane of a pressure sensor" },
      { id: "B4", why: "DRIE cuts the vertical combs of accelerometers and gyroscopes" },
      { id: "C2", why: "channel cross-sections (V, round, rectangular) set the hydraulic resistance" },
      { id: "A4", why: "piezoresistors sit at the edge of KOH membranes, where the stress is largest" },
    ],
    build(fig, ui) {
      let mode = "koh", W = 60, d = 50, step = 0;
      const P = plane(ui.body, { w: 640, xr: [-80, 80], yr: [-78, 20], grid: false, axes: false, label: "etch cross-section" });
      const si = S("rect", { x: P.X(-80), y: P.Y(0), width: P.X(80) - P.X(-80), height: P.Y(-78) - P.Y(0), fill: C.silicon }, P.gMain);
      const etch = S("path", { fill: C.water, "fill-opacity": 0.55, stroke: C.water, "stroke-width": 1.5 }, P.gMain);
      const maskL = S("rect", { fill: OXIDE }, P.gMain), maskR = S("rect", { fill: OXIDE }, P.gMain);
      const geo = S("g", {}, P.gTop);
      const ttl = P.text(C.text, 14, null, "start");
      function setMask() {
        const th = 3;
        maskL.setAttribute("x", P.X(-80)); maskL.setAttribute("y", P.Y(th)); maskL.setAttribute("width", P.X(-W / 2) - P.X(-80)); maskL.setAttribute("height", P.Y(0) - P.Y(th));
        maskR.setAttribute("x", P.X(W / 2)); maskR.setAttribute("y", P.Y(th)); maskR.setAttribute("width", P.X(80) - P.X(W / 2)); maskR.setAttribute("height", P.Y(0) - P.Y(th));
      }
      const pt = (x, y) => P.X(x).toFixed(1) + "," + P.Y(y).toFixed(1);
      function line(x0, y0, x1, y1, col, dash, w) { S("line", { x1: P.X(x0), y1: P.Y(y0), x2: P.X(x1), y2: P.Y(y1), stroke: col, "stroke-width": w || 1.6, "stroke-dasharray": dash || "" }, geo); }
      function txt(x, y, s, col, anchor, size) { const e = S("text", { x: P.X(x), y: P.Y(y), fill: col, "font-size": size || 13, "text-anchor": anchor || "middle", "dominant-baseline": "middle", "font-family": "var(--font-mono, monospace)", "paint-order": "stroke", stroke: C.bg, "stroke-width": 3 }, geo); e.textContent = s; }
      function draw() {
        geo.innerHTML = "";
        setMask();
        let dd = d, info = "";
        if (mode === "iso") {
          const r = d * P.s;
          etch.setAttribute("d", `M${pt(-W / 2 - d, 0)} A${r},${r} 0 0 0 ${pt(-W / 2, -d)} L${pt(W / 2, -d)} A${r},${r} 0 0 0 ${pt(W / 2 + d, 0)} Z`);
          line(-W / 2 - d, 6, -W / 2, 6, C.red, "", 2); txt(-W / 2 - d / 2, 10, "undercut " + fmt(d, 0), C.red, "middle", 12);
          info = `isotropic: depth ${fmt(d, 1)} µm, top width W + 2d = <b>${fmt(W + 2 * d, 1)} µm</b> (undercut ${fmt(d, 1)} µm under each mask edge)`;
        } else if (mode === "koh") {
          const dmax = W / SQ2;
          dd = Math.min(d, dmax);
          const xf = W / 2 - dd / SQ2;
          etch.setAttribute("d", `M${pt(-W / 2, 0)} L${pt(-xf, -dd)} L${pt(xf, -dd)} L${pt(W / 2, 0)} Z`);
          // geometry overlays, following the stepper
          if (step >= 1) {
            const R = Math.min(10, W / 3), cx = W / 2, arc = [];  // arc at the right mask edge, from the surface (pointing left) down to the wall
            for (let q = 0; q <= 16; q++) { const th = Math.PI + ((ANG * Math.PI) / 180) * (q / 16); arc.push(pt(cx + R * Math.cos(th), R * Math.sin(th))); }
            S("polyline", { points: arc.join(" "), fill: "none", stroke: C.gold, "stroke-width": 2.2 }, geo);
            txt(cx - R - 1.5, -R * 0.45, "54.74°", C.gold, "end", 12.5);
          }
          if (step >= 2) {
            const run = Math.min(12, W / 2), x0 = -W / 2;
            line(x0, 0, x0 + run, 0, C.green, "4 3", 2); line(x0 + run, 0, x0 + run, -run * SQ2, C.green, "4 3", 2);
            txt(x0 + run / 2, -3.5, "r", C.green, "middle", 12); txt(x0 + run + 2, -run * SQ2 / 2, "drop √2·r", C.green, "start", 12);
          }
          if (step >= 3 || d >= dmax) {
            line(0, 0, 0, -dmax, C.yellow, "5 4", 1.6);
            txt(2, -dmax - 6, "d = W/√2 = " + fmt(dmax, 1) + " µm", C.yellow, "start", 13);
          }
          if (step >= 4) {
            txt(-78, -64, "membrane from the back: W_back = W_mem + √2·d", C.teal, "start", 12.5);
            txt(-78, -70, "(505 µm deep, 1000 µm membrane → 1714 µm opening)", C.teal, "start", 12);
          }
          info = d >= dmax ? `KOH: the (111) walls have met; the groove <b>stopped by itself</b> at d = (W/2)·tan 54.74° = W/√2 = <b>${fmt(dmax, 2)} µm</b>` :
            `KOH: floor at ${fmt(dd, 1)} µm, flat floor still ${fmt(2 * xf, 1)} µm wide; it will stop at W/√2 = ${fmt(dmax, 2)} µm`;
        } else {
          const n = Math.max(1, Math.round(d / 6)), h = d / n, bulge = 1.6;
          let p = `M${pt(-W / 2, 0)}`;
          for (let i = 0; i < n; i++) p += ` Q${pt(-W / 2 - bulge * 2, -(i + 0.5) * h)} ${pt(-W / 2, -(i + 1) * h)}`;
          p += ` L${pt(W / 2, -d)}`;
          for (let i = n - 1; i >= 0; i--) p += ` Q${pt(W / 2 + bulge * 2, -(i + 0.5) * h)} ${pt(W / 2, -i * h)}`;
          etch.setAttribute("d", p + " Z");
          txt(W / 2 + 6, -d / 2, n + " cycles", C.dim, "start", 12);
          info = `DRIE (Bosch): depth ${fmt(d, 1)} µm, width ${fmt(W, 1)} µm, aspect ratio <b>${fmt(d / W, 2)}</b>, ${n} etch/passivate cycles (scallops enlarged)`;
        }
        line(-W / 2, 9 + (mode === "iso" ? 5 : 0), W / 2, 9 + (mode === "iso" ? 5 : 0), C.blue, "", 2);
        txt(0, 13 + (mode === "iso" ? 5 : 0), "W = " + fmt(W, 0) + " µm", C.blue, "middle", 12.5);
        ttl.set(-78, -56, { iso: "wet isotropic (HF / HNA)", koh: "wet anisotropic: KOH on (100) Si", drie: "dry: DRIE Bosch process" }[mode]);
        ui.read.innerHTML = info;
      }
      ui.button("isotropic", () => { mode = "iso"; draw(); });
      ui.button("KOH", () => { mode = "koh"; draw(); });
      ui.button("DRIE", () => { mode = "drie"; draw(); });
      ui.slider("opening W", 10, 100, 1, W, (v) => { W = v; draw(); return v + " µm"; });
      ui.slider("etch depth", 0, 75, 0.5, d, (v) => { d = v; draw(); return v + " µm"; });
      ui.steps([
        "A (100) wafer with a mask opening \\(W\\). KOH etches (100) planes 100–400× faster than (111) planes.",
        "The (111) planes meet the surface at \\(\\cos\\theta=\\mathbf n_{100}\\cdot\\mathbf n_{111}=1/\\sqrt3\\), so \\(\\theta=54.74°\\) and \\(\\tan\\theta=\\sqrt2\\).",
        "Each wall starts at the mask edge and drops \\(\\sqrt2\\) for every unit of run \\(r\\) inward.",
        "The walls meet after a run of \\(W/2\\): \\(d=\\tfrac W2\\tan54.74°=W/\\sqrt2\\approx0.707\\,W\\). Then only (111) is exposed and the etch stops.",
        "Reverse it for a membrane: a floor of width \\(W_{\\text{mem}}\\) at depth \\(d\\) needs \\(W_{\\text{back}}=W_{\\text{mem}}+\\sqrt2\\,d\\) (505 µm deep, 1 mm membrane: 1714 µm).",
      ], (i) => { step = i; mode = "koh"; if (i >= 3) d = 75; draw(); });
    },
  });

  // ═════════════════ b2-wafer-yield: dies, defects and cost ═════════════════
  register("b2-wafer-yield", {
    title: "Wafer map · dies per wafer, random defects, and the cost of one good chip",
    target: "After this you can estimate how many chips fit on a wafer, what fraction survive random defects (Y = e^(−n_d A)), and why small dies are cheap.",
    caption: "a 200 mm wafer cut into square dies. Red dots are random defects (particles); a die hit by one is dead (red), the others are good (green). Grow the die and watch two effects at once: fewer dies fit, and each one is more likely to catch a defect. The counted numbers jitter around the formulas, as random samples should.",
    links: [
      { id: "B4", why: "a phone accelerometer die is about 2 mm × 2 mm: thousands per wafer" },
      { id: "A8", why: "defects are random: the same Poisson statistics as photon shot noise" },
      { id: "C5", why: "glass and PDMS chips for diagnostics follow the same cost logic" },
    ],
    build(fig, ui) {
      let a = 6, nd = 0.5, seed = 7;
      const Wd = 640, Hd = 400, dpr = Math.min(2, window.devicePixelRatio || 1);
      const cv = H("canvas", { width: Wd * dpr, height: Hd * dpr }, ui.body);
      cv.style.cursor = "default";
      const ctx = cv.getContext("2d");
      const R = 100, sc = 1.85, cx = 225, cy = 200;   // mm, px per mm
      function draw() {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = C.bg; ctx.fillRect(0, 0, Wd, Hd);
        ctx.beginPath(); ctx.arc(cx, cy, R * sc, 0, 2 * Math.PI); ctx.fillStyle = "#2a3038"; ctx.fill();
        ctx.strokeStyle = C.silicon; ctx.lineWidth = 1.5; ctx.stroke();
        // defects (uniform in the disc; count = n_d × area)
        const r = rng(seed), nDef = Math.round(nd * Math.PI * 10 * 10), defs = [];
        for (let i = 0; i < nDef; i++) { const rr = R * Math.sqrt(r()), th = 2 * Math.PI * r(); defs.push([rr * Math.cos(th), rr * Math.sin(th)]); }
        // dies on a grid centred on the wafer
        const n = Math.ceil(R / a) + 1;
        let tot = 0, good = 0;
        for (let i = -n; i < n; i++) for (let j = -n; j < n; j++) {
          const x0 = i * a, y0 = j * a, x1 = x0 + a, y1 = y0 + a;
          const far = Math.max(Math.hypot(x0, y0), Math.hypot(x1, y0), Math.hypot(x0, y1), Math.hypot(x1, y1));
          if (far > R - 3) continue;   // 3 mm edge exclusion
          tot++;
          const hit = defs.some(([x, y]) => x >= x0 && x < x1 && y >= y0 && y < y1);
          if (!hit) good++;
          ctx.fillStyle = hit ? "rgba(252,98,85,0.55)" : "rgba(131,193,103,0.55)";
          ctx.fillRect(cx + x0 * sc + 0.5, cy + y0 * sc + 0.5, a * sc - 1, a * sc - 1);
        }
        ctx.fillStyle = C.red;
        defs.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(cx + x * sc, cy + y * sc, 2.2, 0, 2 * Math.PI); ctx.fill(); });
        // numbers panel
        const A = a * a, Nf = Math.floor((Math.PI * R * R) / A - (Math.PI * 2 * R) / Math.sqrt(2 * A)), Yf = Math.exp(-nd * A / 100);
        const lines = [
          ["die " + fmt(a, 1) + " × " + fmt(a, 1) + " mm", C.text],
          ["defects " + fmt(nd, 2) + " /cm² (" + nDef + ")", C.red],
          ["", C.text],
          ["dies counted   " + tot, C.text],
          ["formula N_die  " + Nf, C.dim],
          ["good counted   " + good, C.green],
          ["yield counted  " + fmt((100 * good) / Math.max(1, tot), 1) + " %", C.green],
          ["e^(−n_d·A)     " + fmt(100 * Yf, 1) + " %", C.dim],
          ["", C.text],
          ["wafer €2000", C.text],
          ["€ per good die " + (good ? fmt(2000 / good, good > 1000 ? 3 : 2) : "∞"), C.yellow],
        ];
        ctx.font = "13px JetBrains Mono, ui-monospace, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        lines.forEach(([s, col], i) => { ctx.fillStyle = col; ctx.fillText(s, 440, 70 + i * 24); });
        ctx.fillStyle = C.dim; ctx.fillText("200 mm wafer", 12, 18);
        ui.read.innerHTML = `${tot} dies, ${good} good (${fmt((100 * good) / Math.max(1, tot), 1)} %) → <b style="color:${C.yellow}">€${good ? fmt(2000 / good, 3) : "∞"}</b> per good die · ` +
          `formulas: N ≈ ${Nf}, Y = e<sup>−n<sub>d</sub>A</sup> = ${fmt(Yf, 3)}, €${fmt(2000 / (Nf * Yf), 3)}`;
      }
      ui.slider("die side", 2, 20, 0.5, a, (v) => { a = v; draw(); return fmt(v, 1) + " mm"; });
      ui.slider("defect density n_d", 0, 2, 0.05, nd, (v) => { nd = v; draw(); return fmt(v, 2) + " /cm²"; });
      ui.button("new wafer (new defects)", () => { seed = (seed * 9301 + 49297) % 233280 || 1; draw(); });
      draw();
    },
  });
})();
