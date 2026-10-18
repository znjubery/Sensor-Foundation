# A2. Resistive sensors and the Wheatstone bridge

> **Connects:** builds on [A1 What a sensor is](A1-what-a-sensor-is-transduction-and-the-measurement-chain.md) · used by [A3 Capacitive sensors](A3-capacitive-sensors.md), [A4 Piezoelectric, piezoresistive and magnetic sensors](A4-piezoelectric-piezoresistive-and-magnetic-sensors.md), [A7 Signal conditioning](A7-signal-conditioning-amplifiers-filters-and-adcs.md), [A8 Noise, resolution, calibration and drift](A8-noise-resolution-calibration-and-drift.md), [B5 MEMS microphones, pressure sensors and actuators](B5-mems-microphones-pressure-sensors-and-actuators.md), [C2 Pressure-driven flow and hydraulic circuits](C2-pressure-driven-flow-and-hydraulic-circuits.md)

## Hook — a rubber band that gets thinner as you stretch it

Stretch a rubber band and watch it. It gets longer, and it also gets **thinner**. If the rubber band were a wire carrying
current, both changes would make it harder for electrons to get through: a longer path and a narrower road. Its resistance
would go up.

Glue a very thin metal wire to a steel bar. Bend the bar a tiny bit, too little to see, and the wire stretches by
0.04%. Its resistance rises by 0.08%, from 120 Ω to 120.09 Ω. That is the whole trick behind bathroom scales, kitchen
scales, crane load meters, bridge monitors and the force sensors in robot wrists. The same idea works with heat instead
of force: the resistance of platinum rises as it warms, and a thermistor's resistance falls steeply. The same idea also
works with light, because a photoresistor's resistance drops in the sun.

**The problem is size.** A 0.08% change on top of 120 Ω is like hearing someone whisper in a stadium. The **Wheatstone
bridge** solves it by *comparing* instead of measuring. Two identical voltage dividers sit side by side, and you look
only at the *difference* between them. When nothing happens the difference is exactly zero, and a tiny change stands
out against that zero.

## The idea in plain words

**Resistance depends on material and shape.** A conductor of length $L$, cross-section area $A$ and **resistivity**
$\rho$ (a material property in Ω·m: copper $1.68\times10^{-8}$, constantan $4.9\times10^{-7}$) has
$$R=\rho\,\frac{L}{A}.$$
Longer means more resistance, and fatter means less. A sensor can change $R$ in three ways: by changing $L$, by changing
$A$, or by changing $\rho$ itself (with temperature, light or stress).

**Strain gauges: stretch changes $L$, $A$ and $\rho$.** **Strain** $\varepsilon=\Delta L/L$ is the fractional stretch, and it
is usually tiny: 1000 µε (microstrain) means 0.1%. When a wire stretches by $\varepsilon$, its length grows by
$(1+\varepsilon)$. Its width and thickness each shrink by $(1-\nu_P\varepsilon)$, where **Poisson's ratio** $\nu_P\approx0.3$ for
metals says how much a material narrows when pulled. The area shrinks by about $(1-2\nu_P\varepsilon)$. Together,
$$\frac{\Delta R}{R}=(1+2\nu_P)\,\varepsilon+\frac{\Delta\rho}{\rho}=\mathrm{GF}\cdot\varepsilon .$$
The number $\mathrm{GF}$ is the **gauge factor**. Geometry alone gives $1+2\nu_P=1.6$. In metal foils the resistivity also
rises a little when stretched (the **piezoresistive** effect), which brings constantan to $\mathrm{GF}\approx2$. In doped
silicon the piezoresistive part is huge and $\mathrm{GF}$ reaches 100 or more (A4, B5).

A real foil gauge is a **serpentine**: a thin metal track that runs back and forth a dozen times on a plastic film. This
packs a long $L$ (high $R$, typically 120 Ω or 350 Ω) into a few millimetres. It also makes the gauge sensitive *along*
the strands and almost blind *across* them. Glue it where the strain is largest, at the surface near the clamped root of a
bending beam. Load the beam below and watch the strain colour and the resistance.

```viz
a2-strain-gauge-3d
```

**Temperature changes $\rho$: RTDs and thermistors.** In a metal, warmer atoms vibrate more and scatter electrons more, so
$\rho$ rises nearly linearly with temperature. A **resistance temperature detector (RTD)** made of platinum follows
$$R=R_0(1+\alpha\,\Delta T),$$
where $\alpha=0.00385$ /K for standard platinum and $R_0=100$ Ω at 0 °C (a "Pt100"). It is accurate, stable and linear, but its
change is small: 0.385 Ω per kelvin. A **thermistor** is a ceramic semiconductor bead. Heat frees more charge carriers, so an
**NTC** (negative temperature coefficient) thermistor's resistance falls steeply:
$$R=R_0\,e^{\beta(1/T-1/T_0)},$$
with $T$ in kelvin, $R_0$ the resistance at $T_0=298.15$ K (25 °C) and $\beta$ typically 3000–4500 K. Its local coefficient
$\frac{1}{R}\frac{dR}{dT}=-\beta/T^2$ is about −4.4%/K, more than ten times the platinum value. The price is that it is
strongly nonlinear. Compare the two in the R–T figure further down.

**Light changes $\rho$: photoresistors.** In a cadmium-sulphide **photoresistor** (LDR), photons free electrons, so the
resistance drops with illuminance, roughly as a power law $R\propto E_v^{-\gamma}$ with $\gamma\approx0.7$ ($E_v$ in lux is
local to this note). LDRs are cheap and slow (tens of milliseconds) and are used in night lights and street lamps. Fast and
precise light sensing uses photodiodes (A5).

**From resistance to voltage: the divider.** A passive sensor needs an **excitation** (A1). The simplest circuit puts the sensor
$R_s$ in series with a fixed resistor $R_f$ across a supply $V_{\text{ex}}$. The voltage across the sensor is
$$V=V_{\text{ex}}\frac{R_s}{R_s+R_f}.$$
This is a **voltage divider**. Its sensitivity $dV/dR_s=V_{\text{ex}}R_f/(R_s+R_f)^2$ is largest when $R_f=R_s$, where it equals
$V_{\text{ex}}/(4R_s)$. The divider has one big flaw: at rest it already outputs $V_{\text{ex}}/2$, and the signal is a tiny
wiggle on top of that large constant voltage.

**The Wheatstone bridge: two dividers, one difference.** Build a second, identical divider next to the first and measure
the voltage *between* their midpoints:
$$V_{\text{out}}=V_{\text{ex}}\left(\frac{R_2}{R_1+R_2}-\frac{R_4}{R_3+R_4}\right).$$
If $R_1/R_2=R_3/R_4$ the bridge is **balanced** and $V_{\text{out}}=0$ exactly, whatever $V_{\text{ex}}$ is. Now let one arm
change by $\Delta R$. For small changes,
$$V_{\text{out}}\approx\frac{V_{\text{ex}}}{4}\,\frac{\Delta R}{R}\qquad\text{(quarter bridge).}$$
You can get more by putting more gauges to work. In a **half bridge**, two gauges sit in the same divider, one stretched
(top of the beam, $+\Delta R$) and one compressed (bottom, $-\Delta R$). This doubles the output and makes it exactly
linear: $V_{\text{out}}=\frac{V_{\text{ex}}}{2}\frac{\Delta R}{R}$. In a **full bridge**, all four arms are active, giving
$V_{\text{out}}=V_{\text{ex}}\frac{\Delta R}{R}$, four times the quarter bridge, again exactly linear. Kitchen and bathroom
scales use full bridges (A1). Build each one in the live circuit below, and step through the derivation.

```viz
a2-bridge
```

**Why the bridge also fixes temperature.** A strain gauge is also a (bad) thermometer. When the bar warms up, the gauge's
resistance and the bar's length both change, and the gauge reports an **apparent strain** even though nothing is loaded.
In a half or full bridge, every gauge sees the same temperature, so the drift appears equally in both arms of each divider
and cancels in the difference. The load, by contrast, stretches one gauge and squeezes the other, so it adds. **Divide to
compare** is a thread through the whole notebook: differential capacitors (A3), differential accelerometers (B4) and
two-colour pulse oximetry (A5) all use it.

**Self-heating: the measurement disturbs the measurand.** The current that reads a thermistor also heats it, with power
$P=I^2R$. The bead warms above its surroundings by $P/\delta$, where $\delta$ is the **dissipation constant** (in mW/K,
local to this note; about 1–3 mW/K for a small bead in still air). Use a small excitation, pulse it briefly, or put the bead
where it is well cooled.

```viz
a2-rt-curves
```

## Intuitive examples

1. **Why foil gauges use constantan.** A track 5 µm thick and 20 µm wide ($A=1.0\times10^{-10}$ m²) needs 24.49 mm of
   constantan to reach 120 Ω, so 12 strands of 2.04 mm fit on a stamp-sized film. The same track in copper would be only
   4.11 Ω, and copper's resistance also changes by 0.39% per kelvin. Constantan was chosen for a temperature coefficient
   close to zero.
2. **Geometry gives 1.6, the metal gives the rest.** Stretch a wire by 1000 µε with $\nu_P=0.30$: the length grows by
   1.001 and the area shrinks to 0.999400 of its value, so $R$ grows by 1.001601, i.e. $\Delta R/R=1.6\times10^{-3}$ from
   shape alone. Constantan's measured $\mathrm{GF}\approx2.05$, so about 0.45 comes from the resistivity change.
3. **A bending steel ruler.** A steel beam ($E=200$ GPa) 20 mm wide and 2 mm thick, loaded with 10 N at 100 mm from the
   gauge, has surface stress $\sigma=6Fx/(wt^2)=75.0$ MPa and strain $\varepsilon=\sigma/E=375$ µε. A 120 Ω gauge with
   $\mathrm{GF}=2$ changes by 750 ppm, i.e. 0.090 Ω. At $V_{\text{ex}}=5$ V a quarter bridge gives 0.9371 mV, a half bridge
   1.8750 mV and a full bridge 3.7500 mV.
4. **Platinum vs thermistor.** A Pt100 reads 100.000 Ω at 0 °C, 114.245 Ω at 37 °C and 138.500 Ω at 100 °C (0.385 Ω/K;
   with 1 mA that is 0.385 mV/K). A 10 kΩ NTC with $\beta=3950$ K reads 33 621 Ω at 0 °C, 10 000 Ω at 25 °C and 5989 Ω at
   37 °C. Its local coefficient at 25 °C is −4.44%/K, 11.5 times larger than platinum's 0.385%/K.
5. **A leaf thermometer.** Put that NTC in a 10k/10k divider at 3.3 V on a leaf clip. Near 25 °C the output moves
   36.7 mV/K, so a 0.1 K warming of the leaf gives 3.67 mV. A 12-bit ADC (0.806 mV per count) resolves 22 mK per count.
6. **A night light.** An LDR of 10 kΩ at 10 lux ($\gamma=0.7$) drops to 1995 Ω at 100 lux and 398 Ω at 1000 lux. As the
   lower arm of a divider with 10 kΩ on top at 3.3 V, it outputs 1.650 V, 0.549 V and 0.126 V. The light switches on below
   a threshold voltage.
7. **Self-heating.** In that 10k/10k divider at 3.3 V the thermistor carries 0.165 mA and dissipates 0.272 mW. At
   $\delta=2$ mW/K it runs 0.136 K warm, which is more than the 0.1 K you wanted to see on the leaf! At 1.0 V excitation
   the heating is 25.0 µW and the error only 12.5 mK.
8. **Temperature compensation.** Suppose a gauge has a thermal output of 20 ppm/K. A 5 K warm-up then gives 100 ppm, an
   apparent strain of 50 µε, which is 13% of the 375 µε signal. In a quarter bridge the reading jumps from 0.9371 to
   1.0620 mV. In a half bridge where both gauges warm equally, it goes from 1.8750 to 1.8748 mV: the drift has cancelled.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $R=\rho L/A$ | resistance from material and shape | $\rho$ resistivity, $L$ length, $A$ area |
| $\dfrac{\Delta R}{R}=(1+2\nu_P)\varepsilon+\dfrac{\Delta\rho}{\rho}=\mathrm{GF}\,\varepsilon$ | strain gauge: geometry + piezoresistance | $\varepsilon$ strain, $\nu_P$ Poisson, $\mathrm{GF}$ gauge factor |
| $\sigma=\dfrac{6Fx}{wt^2}$, $\varepsilon=\sigma/E$ | surface strain of a rectangular beam, load $F$ at distance $x$ | $w$ width, $t$ thickness, $E$ Young's modulus |
| $R=R_0(1+\alpha\,\Delta T)$ | RTD (platinum, $\alpha=0.00385$/K) | $R_0$ at 0 °C |
| $R=R_0e^{\beta(1/T-1/T_0)}$, $\tfrac1R\tfrac{dR}{dT}=-\beta/T^2$ | NTC thermistor | $T$ in kelvin, $\beta$ in K |
| $V=V_{\text{ex}}\dfrac{R_s}{R_s+R_f}$; best $R_f=R_s$ | voltage divider | $R_s$ sensor, $R_f$ fixed |
| $V_{\text{out}}=V_{\text{ex}}\Big(\dfrac{R_2}{R_1+R_2}-\dfrac{R_4}{R_3+R_4}\Big)$ | Wheatstone bridge; zero when $R_1/R_2=R_3/R_4$ | |
| $V_{\text{out}}\approx\tfrac{V_{\text{ex}}}{4}\tfrac{\Delta R}{R}$, $\tfrac{V_{\text{ex}}}{2}\tfrac{\Delta R}{R}$, $V_{\text{ex}}\tfrac{\Delta R}{R}$ | quarter, half, full bridge | |
| $\Delta T_{\text{self}}=I^2R/\delta$ | self-heating error | $\delta$ dissipation constant (W/K) |

## Applications

| World | Resistive sensing and bridges | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | NTC leaf-clip thermistors; heat-pulse sap-flow probes with pairs of thermistors in a bridge; stem dendrometers with strain gauges | leaf temperature, water flow in the stem, daily stem shrinking from thirst |
| 🧬 Biology & human health | thermistor fever thermometers; strain-gauge blood-pressure transducers in hospitals; stretchable resistive patches for breathing | body temperature to 0.1 K, arterial pressure waveform, breathing rate |
| 🌍 Environment | Pt100 weather-station thermometers; strain-gauge rain and snow weighing gauges; hot-wire anemometers | air temperature, precipitation by weight, wind speed |
| 🤖 Robotics & drones | six-axis force/torque sensors in robot wrists (full bridges on a metal cross); resistive tactile skins | contact forces for assembly and safe human–robot touch |
| 🚗 Cars | NTC coolant and intake-air sensors; piezoresistive manifold-pressure bridges; seat-occupancy mats | engine fuelling, airbag decisions |
| 📱 Phones & photography | battery NTC (charging stops if too hot); force-sensitive resistors in styluses | safe charging; pressure-sensitive drawing |
| 🏠 Home & household | kitchen and bathroom scales (full-bridge load cells); thermostats and oven probes; LDR night lights | grams of flour, room temperature, lights on at dusk |

## Derivation

**(a) Gauge factor from $R=\rho L/A$.**
1. Take logarithms: $\ln R=\ln\rho+\ln L-\ln A$.
2. Differentiate: $\dfrac{dR}{R}=\dfrac{d\rho}{\rho}+\dfrac{dL}{L}-\dfrac{dA}{A}$.
3. Length: $dL/L=\varepsilon$. Width and thickness each shrink by $\nu_P\varepsilon$, so $dA/A=-2\nu_P\varepsilon$.
4. Hence $\dfrac{dR}{R}=(1+2\nu_P)\varepsilon+\dfrac{d\rho}{\rho}$, and dividing by $\varepsilon$ gives $\mathrm{GF}=1+2\nu_P+\dfrac{d\rho/\rho}{\varepsilon}$.

**(b) The divider and its best fixed resistor.**
1. Series current $I=V_{\text{ex}}/(R_s+R_f)$, so the sensor voltage is $V=IR_s=V_{\text{ex}}R_s/(R_s+R_f)$.
2. Sensitivity: $\dfrac{dV}{dR_s}=V_{\text{ex}}\dfrac{R_f}{(R_s+R_f)^2}$.
3. Maximise over $R_f$: the derivative of $R_f/(R_s+R_f)^2$ is zero when $(R_s+R_f)-2R_f=0$, i.e. $R_f=R_s$.
4. Then $dV/dR_s=V_{\text{ex}}/(4R_s)$, and $dV/dT=\tfrac{V_{\text{ex}}}{4}\cdot\tfrac{1}{R}\tfrac{dR}{dT}$.

**(c) The bridge.**
1. Left divider (top $R_1$, bottom $R_2$): $V_A=V_{\text{ex}}R_2/(R_1+R_2)$. Right divider: $V_B=V_{\text{ex}}R_4/(R_3+R_4)$.
2. $V_{\text{out}}=V_A-V_B$. Balanced when $R_2/(R_1+R_2)=R_4/(R_3+R_4)$ ⇔ $R_1R_4=R_2R_3$ ⇔ $R_1/R_2=R_3/R_4$.
3. Quarter: $R_2=R(1+x)$, others $R$, with $x=\Delta R/R$: $V_{\text{out}}=V_{\text{ex}}\Big(\dfrac{1+x}{2+x}-\dfrac12\Big)=V_{\text{ex}}\dfrac{x}{2(2+x)}$.
4. For small $x$: $V_{\text{out}}\approx V_{\text{ex}}x/4$, with relative error $\approx x/2$ (A1: linearise).
5. Half: $R_1=R(1-x)$, $R_2=R(1+x)$: $V_A=V_{\text{ex}}(1+x)/2$, so $V_{\text{out}}=V_{\text{ex}}x/2$ exactly.
6. Full: also $R_3=R(1+x)$, $R_4=R(1-x)$: $V_B=V_{\text{ex}}(1-x)/2$, so $V_{\text{out}}=V_{\text{ex}}x$ exactly.

**(d) Temperature cancels in a half bridge.**
1. Add the same thermal change $\theta$ to both active arms: $R_1=R(1-x+\theta)$, $R_2=R(1+x+\theta)$.
2. $V_A=V_{\text{ex}}\dfrac{1+x+\theta}{2+2\theta}$, so $V_{\text{out}}=\dfrac{V_{\text{ex}}}{2}\dfrac{x}{1+\theta}$.
3. $\theta$ only rescales the signal by $1/(1+\theta)$ (100 ppm here): no offset, no apparent strain.

**(e) Beam strain (from B3).**
1. Bending moment at distance $x$ from the load: $M=Fx$.
2. Surface stress of a rectangle: $\sigma=M(t/2)/I_A$ with $I_A=wt^3/12$, so $\sigma=6Fx/(wt^2)$.
3. Hooke: $\varepsilon=\sigma/E$. The top surface is stretched and the bottom is compressed by the same amount, which is what a half bridge needs.

## Worked check

**The bending steel beam**, $F=10$ N, $x=100$ mm, $w=20$ mm, $t=2$ mm, $E=200$ GPa, $\mathrm{GF}=2$, $R=120$ Ω, $V_{\text{ex}}=5$ V.
- $\sigma=6(10)(0.1)/(0.02\cdot0.002^2)=6/(8\times10^{-8})=75.0$ MPa; $\varepsilon=75\times10^6/200\times10^9=375$ µε.
- $\Delta R/R=2\times375$ µε $=750$ ppm; $\Delta R=0.090$ Ω.
- Quarter bridge, approximate: $5/4\times7.5\times10^{-4}=0.9375$ mV. Exact: $5\times0.09/(2\times240.09)=0.9371$ mV. The
  difference is 0.0375% $=x/2$ ✓.
- Half bridge: $5/2\times7.5\times10^{-4}=1.8750$ mV; full bridge: $3.7500$ mV ✓.

**The thermistor at 37 °C:** $10\,000\,e^{3950(1/310.15-1/298.15)}=10\,000\,e^{-0.5126}=5989$ Ω ✓. All numbers come from
`scripts/checks/A2_check.py`.

## Whiteboard plan

- **Panel 1 — the rubber band.** Draw a short fat wire and a long thin one with $R=\rho L/A$ above both. Arrows: $L$ up, $A$
  down, $\rho$ up a little. Write $\mathrm{GF}=1+2\nu_P+\dots\approx2$.
- **Panel 2 — the gauge on a beam.** A clamped beam, a hand pressing on the tip, a serpentine near the root. Colour the
  top red/stretched and the bottom blue/squeezed. Write 375 µε → 0.09 Ω.
- **Panel 3 — the divider's problem.** A divider at 2.5 V with a 0.94 mV wiggle on top (the same 0.09 Ω at 5 V). Say: "a whisper in a stadium."
- **Panel 4 — the bridge.** A diamond with $R_1$–$R_4$, $V_{\text{ex}}$ at the top, ground at the bottom, and a voltmeter across
  the middle. Write the balance condition $R_1/R_2=R_3/R_4$ and $V_{\text{out}}\approx\frac{V_{\text{ex}}}{4}\frac{\Delta R}{R}$.
- **Panel 5 — quarter, half, full.** Three small diamonds with 1, 2 and 4 active arms (arrows ↑↓). Under them: ×1, ×2, ×4 and
  "linear!" under half and full.
- **Panel 6 — thermometers.** Two curves of $R(T)$: a gentle straight platinum line and a steep falling NTC exponential. A
  small flame under the bead labelled $I^2R$.

## Common mistakes and where the intuition breaks

- **Forgetting that the change is tiny.** $\Delta R/R$ is in ppm. Measuring $R$ directly with a multimeter to 0.1 Ω cannot
  see a 0.09 Ω change on top of drift. Bridges and ratios are the answer.
- **Putting the second gauge in the wrong arm.** In a half bridge the stretched and compressed gauges must be in the *same*
  divider (adjacent arms). Put them in opposite arms and the signals cancel while the temperature drift adds.
- **Using the quarter-bridge formula for large changes.** For a thermistor, $\Delta R/R$ can be 50%. Then $V_{\text{ex}}x/4$
  is badly wrong; use the exact divider formula.
- **Mixing up °C and K in the $\beta$ formula.** $1/T$ must be in kelvin: 25 °C is 298.15 K.
- **More excitation is not free.** Doubling $V_{\text{ex}}$ doubles the signal, but quadruples the self-heating ($P\propto V^2$).
- **Lead wires are resistors too.** Two 2 m leads of thin (0.14 mm²) copper add about 0.48 Ω to a Pt100, a 1.2 K error. Three- and four-wire
  connections exist to remove it.
- **Where the picture breaks:** the gauge reports the strain *under it*, averaged over its length. Near a hole or a weld the
  strain changes over millimetres, and the reading depends on exactly where the gauge sits. Silicon piezoresistors (A4)
  have a large $\mathrm{GF}$ but also a large temperature coefficient, so bridges there are not optional.

## Remember

**"$\Delta R/R=\mathrm{GF}\,\varepsilon$ is ppm-small: compare two dividers, and let the bridge cancel what both arms share."**

## Self-test

1. A full-bridge load cell has $\Delta R/R=500$ ppm at full load and $V_{\text{ex}}=10$ V. What is the output? What would a single gauge in a quarter bridge give?
   <details><summary>Answer</summary>Full bridge: 10 V × 500e-6 = 5.0 mV. Quarter bridge: 10/4 × 500e-6 = 1.25 mV, four times less (and slightly nonlinear).</details>
2. A Pt100 reads 109.62 Ω. What is the temperature?
   <details><summary>Answer</summary>ΔT = (109.62/100 − 1)/0.00385 = 0.0962/0.00385 = 25.0 °C.</details>
3. A 10 kΩ NTC thermistor ($\beta=3950$ K) reads 5000 Ω. Roughly how warm is it? Why can't you use $R=R_0(1+\alpha\Delta T)$ here?
   <details><summary>Answer</summary>1/T = 1/298.15 + ln(0.5)/3950, so T ≈ 314.6 K ≈ 41.5 °C. The NTC is exponential and its coefficient changes with temperature, so a single straight-line α only works for small steps around one operating point.</details>

**Next:** [A3 Capacitive sensors](A3-capacitive-sensors.md) — instead of squeezing electrons through a narrower wire, change the space between two plates; the same "divide to compare" trick returns as the differential capacitor.
