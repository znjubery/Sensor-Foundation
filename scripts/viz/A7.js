/* A7 — signal conditioning: widgets for docs/A7-signal-conditioning-amplifiers-filters-and-adcs.md */
(function () {
  "use strict";
  const { register, C, scene3d, chart, fmt, rng, gauss, mix, S, H } = VIZ;

  const LN10 = Math.log(10);
  const dB = (g) => 20 * Math.log10(g);
  function fHz(f) { return f >= 1000 ? fmt(f / 1000, f >= 1e4 ? 1 : 2) + " kHz" : fmt(f, f >= 100 ? 0 : f >= 10 ? 1 : 2) + " Hz"; }

  // ── a7-bode: an RC filter, its Bode plot, and what it does to a noisy signal ───────────────────────────
  register("a7-bode", {
    title: "RC filter · Bode plot and a live noisy signal: H = 1/(1 + jωRC)",
    target: "Read a Bode plot: find f_c = 1/(2πRC), the −3 dB point, the −20 dB/decade slope and the phase lag, and predict which parts of a noisy signal survive.",
    caption: "top: the circuit (teal) · middle: gain in dB and phase against frequency on a log axis, with the <span style='color:" + C.blue + "'>20 Hz signal</span> and the <span style='color:" + C.red + "'>1.5 kHz interference</span> marked · bottom: the noisy input (yellow), the clean signal it carries (blue dashed) and the filter output (green). Slide f_c and watch the interference vanish while the signal survives; push f_c below 20 Hz and the signal itself is eaten. The first few ms show the τ lag as the capacitor charges.",
    links: [
      { id: "A2", why: "a thermistor bead is the same first-order lag, with heat instead of charge" },
      { id: "A8", why: "the bandwidth Δf set here is the Δf in the Johnson-noise formula" },
      { id: "A9", why: "the complementary filter is this low-pass plus its high-pass twin" },
      { id: "C2", why: "R and C have exact twins in a microchannel and a soft chamber" },
    ],
    build(fig, ui) {
      let lfc = Math.log10(159.15), hp = false, step = 0;
      const fSig = 20, fInt = 1500, R = 10e3;
      // the circuit strip
      const cs = S("svg", { viewBox: "0 0 640 96", role: "img", "aria-label": "RC filter circuit" }, ui.body);
      const gC = S("g", {}, cs);
      // charts
      const mag = chart(ui.body, { w: 640, h: 220, xr: [1, 1e5], yr: [-60, 6], logx: true, xlabel: "frequency f (Hz)", ylabel: "gain (dB)", mb: 36 });
      const ph = chart(ui.body, { w: 640, h: 130, xr: [1, 1e5], yr: [-90, 90], logx: true, xlabel: "", ylabel: "phase (°)", mb: 22 });
      const tm = chart(ui.body, { w: 640, h: 210, xr: [0, 0.2], yr: [-2.4, 3.6], xlabel: "time t (s)", ylabel: "voltage (V)" });
      // magnitude chart pieces
      const vSig = mag.vline(C.blue, "3 4"), vInt = mag.vline(C.red, "3 4");
      const asym = mag.line(C.green, 2, "7 5");
      const mline = mag.line(C.yellow, 2.8);
      const vfc = mag.vline(C.white, "2 4"), h3 = mag.hline(C.white, "2 4");
      const d3 = mag.dot(C.white, 5);
      const dDec1 = mag.dot(C.green, 4.5), dDec2 = mag.dot(C.green, 4.5);
      const lfcL = mag.label(C.white, 12.5), l3 = mag.label(C.white, 12), lDec = mag.label(C.green, 12), lH = mag.label(C.yellow, 13);
      const lSig = mag.label(C.blue, 11.5), lInt = mag.label(C.red, 11.5);
      // phase chart pieces
      const pline = ph.line(C.teal, 2.4), pdot = ph.dot(C.white, 4.5), plab = ph.label(C.white, 12), pz = ph.hline(C.dim, "2 4");
      const vfcP = ph.vline(C.white, "2 4");
      // time chart pieces
      const tIn = tm.line(C.yellow, 1), tTrue = tm.line(C.blue, 2, "6 4"), tOut = tm.line(C.green, 2.8);
      tIn.el.setAttribute("opacity", 0.55);
      const tLab = tm.label(C.green, 12.5);
      // the noisy input, generated once (seeded)
      const dt = 1 / 50000, n = Math.round(0.2 / dt), r = rng(7);
      const xin = new Float64Array(n + 1), xtrue = new Float64Array(n + 1);
      for (let i = 0; i <= n; i++) {
        const t = i * dt;
        xtrue[i] = 0.6 + Math.sin(2 * Math.PI * fSig * t);
        xin[i] = xtrue[i] + 0.5 * Math.sin(2 * Math.PI * fInt * t + 0.4) + 0.25 * gauss(r);
      }
      const tt = []; for (let i = 0; i <= n; i += 5) tt.push([i * dt, xtrue[i]]);
      tTrue.set(tt);
      const ti = []; for (let i = 0; i <= n; i += 5) ti.push([i * dt, xin[i]]);
      tIn.set(ti);

      function circuit() {
        gC.innerHTML = "";
        const hiC = step === 0 || step === 1, hiR = step === 1;
        const col = C.teal, hot = C.yellow;
        const ln = (x1, y1, x2, y2, c, w) => S("line", { x1, y1, x2, y2, stroke: c || col, "stroke-width": w || 2, "stroke-linecap": "round" }, gC);
        const tx = (x, y, s, c, sz, anc) => { const e = S("text", { x, y, fill: c || C.text, "font-size": sz || 13, "text-anchor": anc || "middle", "font-family": "var(--font-mono, monospace)" }, gC); e.textContent = s; return e; };
        const resistor = (x0, y0, x1, y1, hiOn) => {   // zig-zag along a horizontal or vertical segment
          const c = hiOn ? hot : col, pts = [], N = 8;
          const horiz = y0 === y1;
          for (let k = 0; k <= N; k++) {
            const u = k / N, off = k === 0 || k === N ? 0 : (k % 2 ? 7 : -7);
            pts.push(horiz ? [x0 + (x1 - x0) * u, y0 + off] : [x0 + off, y0 + (y1 - y0) * u]);
          }
          S("polyline", { points: pts.map((p) => p.join(",")).join(" "), fill: "none", stroke: c, "stroke-width": 2.2, "stroke-linejoin": "round" }, gC);
        };
        const cap = (x, y, horiz, hiOn) => {           // two plates centred at (x, y)
          const c = hiOn ? hot : col;
          if (horiz) { ln(x - 4, y - 13, x - 4, y + 13, c, 3); ln(x + 4, y - 13, x + 4, y + 13, c, 3); }
          else { ln(x - 13, y - 4, x + 13, y - 4, c, 3); ln(x - 13, y + 4, x + 13, y + 4, c, 3); }
        };
        S("circle", { cx: 30, cy: 30, r: 4, fill: col }, gC); tx(30, 16, "v_in", C.yellow, 12);
        S("circle", { cx: 330, cy: 30, r: 4, fill: col }, gC); tx(330, 16, "v_out", C.green, 12);
        ln(30, 30, 110, 30); ln(250, 30, 330, 30); ln(190, 30, 190, 30);
        if (!hp) {
          resistor(110, 30, 170, 30, hiR); ln(170, 30, 250, 30);
          ln(210, 30, 210, 54); cap(210, 58, false, hiC); ln(210, 62, 210, 80);
          tx(140, 52, "R", hiR ? hot : C.dim, 12); tx(236, 62, "C", hiC ? hot : C.dim, 12);
        } else {
          ln(110, 30, 136, 30); cap(140, 30, true, hiC); ln(144, 30, 250, 30);
          ln(210, 30, 210, 44); resistor(210, 44, 210, 74, hiR); ln(210, 74, 210, 80);
          tx(140, 56, "C", hiC ? hot : C.dim, 12); tx(232, 62, "R", hiR ? hot : C.dim, 12);
        }
        ln(196, 80, 224, 80); ln(201, 85, 219, 85); ln(206, 90, 214, 90);
        const fc = Math.pow(10, lfc);
        tx(370, 26, hp ? "H = jωRC / (1 + jωRC)" : "H = 1 / (1 + jωRC)", C.yellow, 15, "start");
        tx(370, 50, (hp ? "high-pass" : "low-pass") + " · f_c = 1/(2πRC) = " + fHz(fc), C.text, 12.5, "start");
        tx(370, 72, "R = 10 kΩ, C = " + capStr(1 / (2 * Math.PI * fc * R)), C.dim, 12.5, "start");
      }
      function capStr(Cf) { return Cf >= 1e-6 ? fmt(Cf * 1e6, 2) + " µF" : Cf >= 1e-9 ? fmt(Cf * 1e9, 1) + " nF" : fmt(Cf * 1e12, 0) + " pF"; }
      const Hmag = (f, fc) => (hp ? (f / fc) / Math.sqrt(1 + (f / fc) ** 2) : 1 / Math.sqrt(1 + (f / fc) ** 2));
      const Hph = (f, fc) => (hp ? 90 - (Math.atan(f / fc) * 180) / Math.PI : (-Math.atan(f / fc) * 180) / Math.PI);
      const vis = (el, on) => el.setAttribute("opacity", on ? 1 : 0.22);

      function draw() {
        const fc = Math.pow(10, lfc), tau = 1 / (2 * Math.PI * fc);
        circuit();
        const pts = [], pps = [];
        for (let k = 0; k <= 300; k++) { const f = Math.pow(10, 5 * k / 300); pts.push([f, dB(Hmag(f, fc))]); pps.push([f, Hph(f, fc)]); }
        mline.set(pts); pline.set(pps);
        // asymptotes: flat line and the 20 dB/decade line
        asym.set(hp ? [[1, 20 * Math.log10(1 / fc)], [fc, 0], [1e5, 0]] : [[1, 0], [fc, 0], [1e5, -20 * Math.log10(1e5 / fc)]]);
        vfc.set(fc); h3.set(-3.01); d3.set(fc, -3.01); vfcP.set(fc);
        lfcL.set(fc * 1.12, -54, "f_c"); l3.set(1.3, -6.5, "−3 dB");
        const f1 = hp ? fc / 10 : fc * 10, f2 = hp ? fc / 100 : fc * 100;
        dDec1.set(f1, dB(Hmag(f1, fc))); dDec2.set(f2, dB(Hmag(f2, fc)));
        lDec.set(hp ? f2 * 1.2 : f1 * 1.25, dB(Hmag(f1, fc)) + 4, "−20 dB per decade");
        lH.set(hp ? 2e3 : 1.3, hp ? -10 : -14, "|H| = " + (hp ? "(f/f_c)/√(1+(f/f_c)²)" : "1/√(1+(f/f_c)²)"));
        lH.el.setAttribute("text-anchor", hp ? "middle" : "start");
        vSig.set(fSig); vInt.set(fInt);
        lSig.set(fSig * 1.1, -46, "signal"); lInt.set(fInt * 1.1, -46, "hum/noise");
        pdot.set(fc, hp ? 45 : -45); plab.set(fc * 1.2, hp ? 58 : -58, (hp ? "+45°" : "−45°") + " at f_c"); pz.set(0);
        // time-domain filtering: exact first-order update per sample
        const a = 1 - Math.exp(-dt / tau); let y = 0; const out = [];
        for (let i = 0; i <= n; i++) { y += a * (xin[i] - y); if (i % 5 === 0) out.push([i * dt, hp ? xin[i] - y : y]); }
        tOut.set(out);
        tLab.set(0.004, 3.25, hp ? "output: offset and slow parts removed" : "output: τ ẏ + y = v_in");
        // which parts the stepper is talking about
        const s = step;
        vis(mline.el, s >= 1); vis(asym.el, s >= 4); [vfc.el, h3.el, d3.el, l3.el, lfcL.el].forEach((e) => vis(e, s >= 2 && (s !== 2 || e === vfc.el || e === lfcL.el)));
        [dDec1.el, dDec2.el, lDec.el].forEach((e) => vis(e, s >= 4)); vis(lH.el, s >= 2);
        [pline.el, pdot.el, plab.el, vfcP.el].forEach((e) => vis(e, s >= 5));
        [tOut.el, tLab.el].forEach((e) => vis(e, s >= 6 || s === 0));
        const g20 = Hmag(fSig, fc), gI = Hmag(fInt, fc);
        ui.read.innerHTML = `f_c = <b>${fHz(fc)}</b> · τ = RC = <b>${tau >= 9.99e-4 ? fmt(tau * 1e3, 2) + " ms" : fmt(tau * 1e6, 1) + " µs"}</b> · ` +
          `<span style="color:${C.blue}">20 Hz signal: ×${fmt(g20, 3)} (${fmt(dB(g20), 1)} dB, ${fmt(Hph(fSig, fc), 1)}°)</span> · ` +
          `<span style="color:${C.red}">1.5 kHz interference: ×${fmt(gI, 3)} (${fmt(dB(gI), 1)} dB)</span>`;
      }
      ui.slider("cutoff f_c", 0.3, 4.3, 0.001, lfc, (v) => { lfc = v; draw(); return fHz(Math.pow(10, v)); });
      const bL = ui.button("low-pass", () => { hp = false; draw(); }), bH = ui.button("high-pass", () => { hp = true; draw(); });
      bL.title = "R in series, C to ground"; bH.title = "C in series, R to ground";
      ui.steps([
        "A resistor obeys \\( V = IR \\). A capacitor's current is \\( I = C\\,dV/dt \\); for a sine \\( e^{j\\omega t} \\) that is \\( I = j\\omega C\\,V \\), so its impedance is \\( Z_C = 1/(j\\omega C) \\): huge at low \\( f \\), tiny at high \\( f \\).",
        "The circuit is a voltage divider: \\( H = \\dfrac{v_{\\text{out}}}{v_{\\text{in}}} = \\dfrac{Z_C}{R + Z_C} = \\dfrac{1}{1 + j\\omega RC} \\). Multiply top and bottom by \\( j\\omega C \\) to check.",
        "Size of a complex number \\( 1 + jx \\) is \\( \\sqrt{1 + x^2} \\), so \\( \\lvert H\\rvert = 1/\\sqrt{1 + (\\omega RC)^2} = 1/\\sqrt{1 + (f/f_c)^2} \\) with \\( f_c = 1/(2\\pi RC) \\). For \\( R = 10 \\) kΩ, \\( C = 100 \\) nF: \\( f_c = 159 \\) Hz.",
        "At \\( f = f_c \\): \\( \\lvert H\\rvert = 1/\\sqrt 2 = 0.707 \\), i.e. \\( 20\\log_{10}0.707 = -3.01 \\) dB: half the power is gone. That is why \\( f_c \\) is called the −3 dB point.",
        "Far above \\( f_c \\): \\( \\lvert H\\rvert \\approx f_c/f \\). Ten times the frequency gives one tenth of the amplitude: \\( -20 \\) dB per decade (green dots at \\( 10f_c \\): −20 dB, \\( 100f_c \\): −40 dB).",
        "The angle of \\( 1/(1 + jx) \\) is \\( \\varphi = -\\arctan(f/f_c) \\): no lag far below \\( f_c \\), −45° at \\( f_c \\), −90° far above. The output always lags the input.",
        "In time, the same circuit is \\( \\tau\\,\\dot y + y = v_{\\text{in}} \\) with \\( \\tau = RC \\): the output chases the input with lag \\( \\tau \\). Fast wiggles (1.5 kHz) are averaged away; the slow 20 Hz signal gets through.",
      ], (i) => { step = i; if (i < 6) hp = false; draw(); });
    },
  });

  // ── a7-aliasing: sampling a sine below and above Nyquist; a propeller filmed at 30 fps ──────────────────
  register("a7-aliasing", {
    title: "Sampling · Nyquist and aliasing: a 60 Hz hum and a propeller in a phone video",
    target: "Predict the frequency a sampled signal appears to have, f_alias = |f − f_s·round(f/f_s)|, and explain why content above f_s/2 must be filtered out before the ADC.",
    caption: "top: the true signal (blue) is sampled at the yellow dots; the curve through the dots is what the computer reconstructs: <span style='color:" + C.green + "'>green</span> when f < f_s/2 (correct), <span style='color:" + C.red + "'>red</span> when it is an alias. Middle: the frequency line folds at the Nyquist frequency f_s/2. Bottom: eight video frames of a two-blade propeller whose blade pattern repeats at f; the small yellow paint mark shows where it really is, which a real video cannot see.",
    links: [
      { id: "A5", why: "a rolling-shutter image sensor samples in time, line by line" },
      { id: "A8", why: "an alias is a systematic error, not noise: averaging does not remove it" },
      { id: "B4", why: "MEMS gyros are sampled, and vibration aliases into fake rotation" },
    ],
    build(fig, ui) {
      let f = 60, fs = 1000;
      const holder = H("div", {}, ui.body);
      const fold = chart(ui.body, { w: 640, h: 104, xr: [0, 400], yr: [0, 1], xlabel: "frequency (Hz)", ylabel: "", mt: 8, mb: 32, ml: 20 });
      fold.svg.querySelectorAll("text[text-anchor=end]").forEach((e) => e.remove());
      const fr = S("svg", { viewBox: "0 0 640 118", role: "img", "aria-label": "propeller frames" }, ui.body);
      const vN = fold.vline(C.white, "4 4"), vS = fold.vline(C.dim, "2 3");
      const dF = fold.dot(C.blue, 6), dA = fold.dot(C.green, 6);
      const lN = fold.label(C.white, 11.5), lF = fold.label(C.blue, 11.5), lA = fold.label(C.green, 11.5), lS = fold.label(C.dim, 11.5);
      const arc = S("path", { fill: "none", stroke: C.red, "stroke-width": 1.8, "stroke-dasharray": "4 3" }, fold.gTop);
      const signedAlias = (f0, fs0) => f0 - fs0 * Math.round(f0 / fs0);
      function draw() {
        const fa = signedAlias(f, fs), ok = f < fs / 2, Tw = 10 / fs;
        holder.innerHTML = "";
        const ch = chart(holder, { w: 640, h: 220, xr: [0, Tw], yr: [-1.35, 1.35], xlabel: "time t (s)", ylabel: "signal" });
        // relabel x ticks in ms: chart writes seconds; overlay a small note instead
        const tl = ch.label(C.dim, 11.5); tl.set(Tw * 0.995, 1.22, "window = 10 samples = " + fmt(Tw * 1000, 1) + " ms"); tl.el.setAttribute("text-anchor", "end");
        const tr = ch.line(C.blue, 1.6), rc = ch.line(ok ? C.green : C.red, 2.6, ok ? "" : "7 4");
        const pts = [], rp = [], N = 3000;
        for (let i = 0; i <= N; i++) { const t = (Tw * i) / N; pts.push([t, Math.sin(2 * Math.PI * f * t)]); rp.push([t, Math.sin(2 * Math.PI * fa * t)]); }
        tr.set(pts); rc.set(rp);
        tr.el.setAttribute("opacity", 0.75);
        for (let k = 0; k <= 10; k++) { const t = k / fs; ch.dot(C.yellow, 5).set(t, Math.sin(2 * Math.PI * f * t)); }
        // the folding diagram
        vN.set(fs / 2); vS.set(Math.min(fs, 400));
        lN.set(Math.min(fs / 2, 396) + 3, 0.86, "f_s/2"); lS.set(Math.min(fs, 396) + 3, 0.86, fs <= 380 ? "f_s" : "");
        dF.set(f, 0.62); lF.set(f + 6, 0.62, "f = " + fmt(f, 1));
        dA.el.setAttribute("fill", ok ? C.green : C.red); lA.el.setAttribute("fill", ok ? C.green : C.red);
        dA.set(Math.abs(fa), 0.22); lA.set(Math.abs(fa) + 6, 0.22, "seen as " + fmt(Math.abs(fa), 1) + " Hz");
        if (!ok) {
          const x1 = fold.X(f), y1 = fold.Y(0.62), x2 = fold.X(Math.abs(fa)), y2 = fold.Y(0.22), xm = fold.X(fs / 2);
          arc.setAttribute("d", `M${x1},${y1} Q${xm},${(y1 + y2) / 2 - 30} ${x2},${y2}`);
        } else arc.setAttribute("d", "");
        // propeller frames: rotation = f/2 rev/s (two identical blades → pattern repeats twice per turn)
        fr.innerHTML = "";
        for (let k = 0; k < 8; k++) {
          const cx = 42 + k * 79, cy = 52, th = 2 * Math.PI * (f / 2) * (k / fs), L = 30;
          S("circle", { cx, cy, r: 36, fill: "#141b23", stroke: "#26313d" }, fr);
          for (let b = 0; b < 2; b++) {
            const a = th + b * Math.PI, ex = cx + L * Math.sin(a), ey = cy - L * Math.cos(a);
            S("line", { x1: cx, y1: cy, x2: ex, y2: ey, stroke: C.purple, "stroke-width": 7, "stroke-linecap": "round" }, fr);
            if (b === 0) S("circle", { cx: cx + 0.8 * L * Math.sin(a), cy: cy - 0.8 * L * Math.cos(a), r: 2.6, fill: C.yellow }, fr);
          }
          S("circle", { cx, cy, r: 4, fill: C.silicon }, fr);
          const t = S("text", { x: cx, y: 106, fill: C.dim, "font-size": 11, "text-anchor": "middle", "font-family": "var(--font-mono, monospace)" }, fr);
          t.textContent = "frame " + (k + 1);
        }
        const rpm = (f / 2) * 60, appRev = fa / 2;
        ui.read.innerHTML = `f = <b>${fmt(f, 1)} Hz</b> · f_s = <b>${fmt(fs, 0)} Hz</b> · Nyquist f_s/2 = ${fmt(fs / 2, 1)} Hz · ` +
          `appears as <b style="color:${ok ? C.green : C.red}">${fmt(Math.abs(fa), 2)} Hz</b> ${ok ? "(correct)" : "(alias!)"}<br>` +
          `as a two-blade propeller: ${fmt(rpm, 0)} rpm → looks like ${Math.abs(appRev) < 1e-6 ? "<b>frozen</b>" : fmt(Math.abs(appRev), 2) + " rev/s " + (appRev < 0 ? "<b>backwards</b>" : "forwards")}`;
      }
      const sF = ui.slider("signal f", 0, 200, 0.01, f, (v) => { f = v; draw(); return fmt(v, 1) + " Hz"; });
      const sS = ui.slider("sampling f_s", 10, 400, 1, 400, (v) => { fs = v; draw(); return fmt(v, 0) + " Hz"; });
      const preset = (a, b) => { f = a; fs = b; sF.set(a); sS.set(b); draw(); };
      ui.button("60 Hz hum, f_s = 400 Hz", () => preset(60, 400));
      ui.button("60 Hz hum, f_s = 100 Hz", () => preset(60, 100));
      ui.button("prop 5300 rpm, 30 fps", () => preset(176.67, 30));
      ui.button("prop 5400 rpm, 30 fps", () => preset(180, 30));
      preset(60, 100);
    },
  });

  // ── a7-adc-3d: the quantisation staircase, its error ribbon, and the 6.02 N + 1.76 dB rule ────────────
  register("a7-adc-3d", {
    title: "3D · an ADC turns a ramp into a staircase: Δ = V_ref/2^N, error rms = Δ/√12",
    target: "See how the number of bits N sets the step size Δ, why the rounding error is a uniform ±Δ/2 'noise' with rms Δ/√12, and where SNR ≈ 6.02 N + 1.76 dB comes from.",
    caption: "three layers, front to back: the <span style='color:" + C.blue + "'>analogue input</span> v(t) (blue line), the <span style='color:" + C.yellow + "'>ADC codes</span> (yellow columns, one per sample) and the <span style='color:" + C.red + "'>error</span> e = code·Δ − v, magnified so that ±Δ/2 always fills the same band. Each extra bit halves Δ and the error, which is +6.02 dB of SNR. Drag to orbit; look along the time axis to see the staircase hug the ramp.",
    links: [
      { id: "A5", why: "each camera pixel's charge goes through exactly this staircase (bit depth of a RAW photo)" },
      { id: "A8", why: "Δ/√12 adds to the other noise sources; resolution is limited by the larger one" },
      { id: "A2", why: "the bridge's millivolts need gain before they span many steps" },
    ],
    build(fig, ui) {
      let N = 3, sine = false;
      const Vref = 3.3, ns = 64, X0 = -4.2, X1 = 4.2, Zs = 4 / Vref;   // 3.3 V → 4 scene units
      const yIn = -1.7, yQ = 0, yE = 1.9, zE = 5.1, eBand = 0.55;
      const vin = (u) => (sine ? Vref / 2 + (Vref / 2) * 0.98 * Math.sin(2 * Math.PI * u) : Vref * (0.02 + 0.96 * u));
      const quant = (v) => { const d = Vref / Math.pow(2, N); const k = Math.min(Math.pow(2, N) - 1, Math.max(0, Math.floor(v / d))); return (k + 0.5) * d; };
      const sc = scene3d(ui.body, {
        w: 640, h: 420, scale: 49, yaw: -0.5, pitch: 0.3, center: [0, 0.1, 2.85], dist: 30,
        draw(g) {
          g.grid(0, [X0, X1], [-2.4, 2.6], 0.6);
          const dx = (X1 - X0) / ns, d = Vref / Math.pow(2, N);
          // input line (blue) on its own layer
          const ip = []; for (let i = 0; i <= 160; i++) { const u = i / 160; ip.push([X0 + (X1 - X0) * u, yIn, vin(u) * Zs]); }
          g.polyline(ip, C.blue, 3);
          g.poly([[X0, yIn, 0], [X1, yIn, 0], [X1, yIn, Vref * Zs], [X0, yIn, Vref * Zs]], C.blue, { alpha: 0.06, shade: false });
          // ADC code columns (yellow)
          for (let i = 0; i < ns; i++) {
            const u = (i + 0.5) / ns, q = quant(vin(u)), x = X0 + i * dx;
            g.box([x + 0.01, yQ - 0.32, 0], [x + dx - 0.01, yQ + 0.32, q * Zs], mix(C.yellow, "#8a6d10", 0.15 + 0.35 * (i % 2)));
          }
          // reference levels of the staircase (faint) when there are few of them
          if (N <= 4) for (let k = 0; k <= Math.pow(2, N); k++) g.line([X1 + 0.05, yQ + 0.32, k * d * Zs], [X1 + 0.35, yQ + 0.32, k * d * Zs], C.dim, 1);
          // error ribbon (red), magnified: ±Δ/2 → ±eBand
          g.poly([[X0, yE, zE - eBand], [X1, yE, zE - eBand], [X1, yE, zE + eBand], [X0, yE, zE + eBand]], C.red, { alpha: 0.07, shade: false });
          g.line([X0, yE, zE], [X1, yE, zE], C.dim, 1, [4, 4]);
          const ep = []; for (let i = 0; i <= 400; i++) { const u = i / 400, v = vin(u); ep.push([X0 + (X1 - X0) * u, yE, zE + ((quant(v) - v) / (d / 2)) * eBand]); }
          g.polyline(ep, C.red, 2);
          g.text([X0 - 0.2, yIn, vin(0) * Zs + 0.45], "input v(t)", C.blue, 13, "end");
          g.text([X0 - 0.2, yQ, 0.5], "ADC codes", C.yellow, 13, "end");
          g.text([X0 - 0.2, yE, zE + eBand + 0.3], "error (±Δ/2 band)", C.red, 13, "end");
          g.text([X1 + 0.3, yIn, -0.35], "time →", C.dim, 12);
          g.line([X0, yIn - 0.4, 0], [X0, yIn - 0.4, Vref * Zs], C.axis, 1.4);
          g.text([X0, yIn - 0.75, Vref * Zs], "3.3 V", C.dim, 12);
          g.text([X0, yIn - 0.75, 0], "0 V", C.dim, 12);
        },
      });
      function stats() {
        const d = Vref / Math.pow(2, N); let e2 = 0, s2 = 0; const M = 20000;
        for (let i = 0; i < M; i++) { const u = (i + 0.37) / M, v = vin(u), e = quant(v) - v; e2 += e * e; s2 += (v - Vref / 2) ** 2; }
        const erms = Math.sqrt(e2 / M), snr = 10 * Math.log10(s2 / e2);
        const vs = (x) => (x >= 1e-3 ? fmt(x * 1e3, 1) + " mV" : fmt(x * 1e6, 1) + " µV");
        ui.read.innerHTML = `N = <b>${N} bits</b> → 2^N = ${Math.pow(2, N)} levels · Δ = V_ref/2^N = <b>${vs(d)}</b> · ` +
          `error rms: measured <b style="color:${C.red}">${vs(erms)}</b>, theory Δ/√12 = ${vs(d / Math.sqrt(12))}<br>` +
          (sine ? `full-scale sine: SNR measured <b>${fmt(snr, 1)} dB</b>, rule 6.02N + 1.76 = <b>${fmt(6.02 * N + 1.76, 1)} dB</b>`
                : `ramp input: the error is a sawtooth, uniform between −Δ/2 and +Δ/2 (switch to a sine for the SNR rule)`);
      }
      ui.slider("bits N", 1, 10, 1, N, (v) => { N = v; sc.render(); stats(); return v + " bit"; });
      ui.button("ramp", () => { sine = false; sc.render(); stats(); });
      ui.button("full-scale sine", () => { sine = true; sc.render(); stats(); });
      stats();
    },
  });
})();
