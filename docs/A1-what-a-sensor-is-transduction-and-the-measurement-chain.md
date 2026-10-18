# A1. What a sensor is: transduction and the measurement chain

> **Connects:** builds on school physics only (this is the first note) · used by [A2 Resistive sensors and the Wheatstone bridge](A2-resistive-sensors-and-the-wheatstone-bridge.md), [A3 Capacitive sensors](A3-capacitive-sensors.md), [A4 Piezoelectric, piezoresistive and magnetic sensors](A4-piezoelectric-piezoresistive-and-magnetic-sensors.md), [A5 Optical sensors](A5-optical-sensors-photodiodes-image-sensors-and-lidar.md), [A6 Electrochemical sensors and biosensors](A6-electrochemical-sensors-and-biosensors.md), [A7 Signal conditioning](A7-signal-conditioning-amplifiers-filters-and-adcs.md), [A8 Noise, resolution, calibration and drift](A8-noise-resolution-calibration-and-drift.md)

## Hook — a kitchen scale and a heartbeat

Put a bag of flour on a kitchen scale and the display says **250 g**. Nothing inside the scale "knows" what a gram is.
What actually happens is a chain of small events. The flour pushes on a metal bar. The bar bends by a few micrometres.
Thin metal foil glued to the bar stretches, and its electrical resistance rises by about one part in ten thousand. A
little circuit turns that change into half a millivolt. An amplifier makes it 128 times bigger. A chip turns the
voltage into the integer 2048. A line of code finally turns 2048 into "250 g".

A smartwatch does the same thing with your pulse. A green LED shines into your wrist. Each heartbeat pushes a little
more blood into the capillaries, the blood absorbs a little more green light, and the photodiode under the glass
collects about 1% less light. That 1% wobble becomes a current, then a voltage, then a stream of numbers. Software
counts the wobbles and shows "75 bpm".

**Every sensor in this notebook is such a chain.** If you can draw the chain and put a number on each arrow, you
understand the sensor, whether it is a glucose strip, a drone gyroscope or a phone camera.

## The idea in plain words

**The stimulus and the output.** The thing the world does, the thing we want to know, is the **stimulus** or
**measurand**, written $s$. It could be a mass, a temperature, a light power, a pressure or a glucose concentration.
What comes out of the sensor is the **output** $y$. It is usually a voltage, a number of ADC counts or a frequency. A
**transducer** is anything that turns one kind of physical quantity into another, and a **sensor** is a transducer whose
job is to report on the world. In the pictures of this notebook the stimulus is always **blue** and the output is
always **yellow**.

**The measurement chain.** Almost every electronic sensor has four links:

1. **Stimulus → physical change.** The world changes something inside the device: a resistance $R$ (A2), a capacitance
   $C$ (A3), a displacement $x$ of a tiny mass (B4), a charge (A4), a photocurrent (A5) or an electrode potential (A6).
2. **Physical change → voltage.** A circuit such as a bridge, a divider or a charge amplifier turns that change into a
   voltage $V$.
3. **Voltage → clean, big voltage.** An amplifier with gain $G$ and filters make it large and quiet (A7).
4. **Voltage → number.** An analogue-to-digital converter (ADC) with $N$ bits and reference $V_{\text{ref}}$ cuts the
   voltage into steps of $\Delta V=V_{\text{ref}}/2^N$ and reports how many steps fit. Software then turns counts back into
   grams, degrees or beats per minute.

Each arrow has its own **gain**: how much the output of that stage changes per unit change of its input. The overall
**sensitivity** of the sensor is simply **the product of the stage gains**. Drag the mass in the 3D scale below and
watch the signal move stage by stage. The stepper multiplies the gains one at a time.

```viz
a1-chain-3d
```

**The transfer function.** If you plot output against stimulus you get the sensor's **transfer function** $y=f(s)$, its
"personality". The ideal sensor is a straight line,
$$y=y_0+S\,s,$$
where the **offset** $y_0$ is the output with no stimulus at all (the scale's reading with an empty pan) and the
**sensitivity** $S=dy/ds$ is the slope (counts per kilogram, millivolts per kilopascal). Real transfer functions bend.
They flatten when the amplifier or the material **saturates**, they may have a dead zone near zero, and they may give a
slightly different reading on the way up than on the way down.

**Range.** The **full-scale range** $s_{\text{FS}}$ is the span of stimulus the sensor is built for, for example 0–5 kg for a
kitchen scale. Above it the output saturates or the device breaks. Many specifications are quoted as a percentage of full
scale (%FS).

**Linearity.** Near any working point a smooth curve looks like its tangent line. This is the most-used idea in the whole
notebook: **linearise around an operating point**,
$$\Delta y\approx S\,\Delta s,\qquad S=f'(s_{\text{op}}),$$
a first-order Taylor step. The size of the error depends on how far you step: it grows like $\Delta s^2$. The
**linearity error** of a sensor is the largest gap between its real curve and the straight line used to interpret it,
usually quoted in %FS. Move the operating point in the figure below and watch the tangent (green) and the error (red).

```viz
a1-transfer-curve
```

**Hysteresis.** Some materials remember where they came from. A polymer humidity sensor might read 51% RH when the air
is getting wetter and 53% RH at the same true humidity when the air is getting drier. The transfer function becomes a thin
loop instead of a line. The width of the loop is the **hysteresis**, here 2% RH. Toggle it in the figure above.

**Resolution, accuracy and precision are three different things.**
- **Resolution** $\Delta s_{\min}$ is the smallest change in $s$ that you can see in the output. It is limited by the
  display step, by the ADC step $\Delta V$ and, most of all, by **noise** (A8). One ADC count does not help if the
  reading jumps by 3 counts on its own.
- **Accuracy** is how close the reading is to the truth on average. The **error** is always "measured minus true",
  $e=s_{\text{meas}}-s$. A constant error is a **bias**, and calibration (A8) removes it.
- **Precision** (repeatability) is how close repeated readings are to *each other*, measured by their standard
  deviation. A sensor can be precise but inaccurate (tight cluster, wrong place) or accurate but imprecise (right on
  average, but scattered).

**Active and passive sensors.** Some sensors make their own electrical signal from the energy of the stimulus. A
thermocouple makes a voltage from a temperature difference, a photodiode makes a current from light (A5), and a piezo
disc makes a charge when squeezed (A4). These are called **self-generating** or **active** sensors. Others only *change*
a property, such as a resistance or a capacitance, and you must push a current or voltage through them to read that
property: strain gauges, thermistors (A2) and capacitive sensors (A3). These are **modulating** or **passive**
sensors, and their output is proportional to the **excitation** $V_{\text{ex}}$ you supply. Be careful: some books
swap the words "active" and "passive" (an "active pixel" in A5 means "has its own amplifier"). The physics is what
matters: *does the stimulus supply the energy, or does my circuit?*

**Response time: the first-order lag.** No sensor answers instantly. A thermometer has to warm up, and a humidity film
has to soak up water. Very often the reading $y$ creeps toward its final value $K s$ at a speed proportional to how far it
still has to go:
$$\tau\,\dot y+y=K\,s,$$
where $\tau$ is the **time constant** and $K$ is the static gain. After a sudden step in $s$ the solution is
$$y(t)=y_{\text{final}}+(y_{\text{start}}-y_{\text{final}})\,e^{-t/\tau}.$$
After $\tau$ the sensor has covered 63.2% of the jump, after $3\tau$ 95.0%, and after $5\tau$ 99.3%. The same equation
describes an $RC$ filter (A7), a thermistor bead warming up (A2), an electrode soaking in a solution (A6) and a molecule
diffusing to a surface (C3). Try reading the thermometer too early below.

```viz
a1-step-response
```

## Intuitive examples

1. **Kitchen scale, stage by stage.** The load-cell bar is made so that 5 kg gives 1000 µε (microstrain), so 200 µε/kg.
   Foil gauges with $\mathrm{GF}=2$ turn this into $\Delta R/R=400$ ppm per kg. A full bridge excited with $V_{\text{ex}}=5$ V
   gives 2.000 mV/kg (the datasheet calls this "2 mV/V rated output"). An amplifier with $G=128$ makes it 0.2560 V/kg.
   A 16-bit ADC with $V_{\text{ref}}=2.048$ V has steps of $\Delta V=31.25$ µV, i.e. 32 000 counts per volt. Product:
   $S=8192$ counts/kg. Full scale (5 kg) is 1.280 V, or 40 960 counts, and one count is 0.1221 g. But if the reading wobbles
   by 3 counts rms, the smallest change you can trust is about 0.37 g, not 0.12 g.
2. **Smartwatch PPG.** The photodiode delivers a steady 1 µA of green light current. Each heartbeat reduces it by about
   1% (the "perfusion index"), so the pulse is a 10 nA wobble. A transimpedance amplifier with a 100 kΩ resistor turns
   this into 0.100 V of steady signal and a 1.00 mV pulse on top. If the pulse peaks arrive every 0.8 s, the watch shows
   75 beats per minute. The hard part is not the gain: it is separating the 1% heartbeat from the steady 99% and from arm
   motion.
3. **A fever thermometer is a first-order lag.** A probe with $\tau=10$ s at 22 °C goes under the tongue at 37 °C. It
   starts climbing at $15/\tau=1.50$ °C/s, reads 31.48 °C after 10 s, 36.25 °C after 30 s and 36.90 °C after 50 s. It is
   within 0.1 °C of the truth only after $\tau\ln(15/0.1)=50.1$ s. That is why a "fast" thermometer beeps and then
   *predicts* the final value from the shape of the curve.
4. **Accurate, precise, resolved.** A bathroom scale with 0.1 kg resolution weighs a 70.0 kg calibration mass five times:
   70.4, 70.6, 70.5, 70.5, 70.6 kg. Mean 70.52 kg, so the error is $e=+0.52$ kg (poor accuracy). The sample standard
   deviation is 0.084 kg (good precision). One calibration offset fixes the accuracy; nothing but better hardware or
   averaging fixes precision.
5. **Saturation eats sensitivity.** Many sensor front-ends follow $y=V_{\text{sat}}\tanh(S_0s/V_{\text{sat}})$: a straight line of
   slope $S_0$ that bends over toward $\pm V_{\text{sat}}$. At $S_0s/V_{\text{sat}}=0.1$ the curve is only 0.3% below the
   straight line. At 0.5 it is 7.6% below and the local slope has dropped to 0.786 $S_0$. At 2 it is 51.8% below and the local
   slope is 0.071 $S_0$: a big change in $s$ hardly moves $y$.
6. **Hysteresis in a humidity sensor.** At a true 52% RH, a polymer sensor reads 51% when the air is getting wetter and 53%
   when it is getting drier. The loop width is 2% RH, which is 2% of its 0–100% full scale.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $y=f(s)$ | transfer function: the whole personality of the sensor | $s$ stimulus, $y$ output |
| $y=y_0+S\,s$ | ideal linear sensor | $y_0$ offset, $S$ sensitivity |
| $S=\dfrac{dy}{ds}=\prod_i S_i$ | sensitivity is the slope; for a chain it is the product of the stage gains | $S_i$ gain of stage $i$ |
| $\Delta y\approx S\,\Delta s$, error $\approx\tfrac12 f''\,\Delta s^2$ | linearise around an operating point | $\Delta s$ small step |
| $s_{\text{meas}}=\dfrac{y-y_0}{S}$ | reading the sensor: invert the calibration line | |
| $e=s_{\text{meas}}-s$ | error: measured minus true; its mean is the bias | |
| $\Delta V=V_{\text{ref}}/2^N$ | ADC step size (one LSB) | $N$ bits, $V_{\text{ref}}$ reference |
| $\Delta s_{\min}\approx \sigma_n/S$ | resolution is set by noise, not by display digits | $\sigma_n$ rms noise in output units |
| $\tau\dot y+y=Ks$ ⇒ $y=y_f+(y_0'-y_f)e^{-t/\tau}$ | first-order response; 63.2% after $\tau$, 99.3% after $5\tau$ | $\tau$ time constant, $y_0'$ start value |

## Applications

| World | The measurement chain | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | leaf-clip thermistor: leaf temperature → $\Delta R$ → divider voltage → ADC; its $\tau$ of a few seconds must be shorter than a passing cloud | whether stomata are closed (a warm leaf is a thirsty leaf) |
| 🧬 Biology & human health | PPG watch: blood volume → 1% less light → photocurrent → transimpedance volts → counts | heart rate and, with two colours, blood oxygen (A5) |
| 🌍 Environment | weather-station humidity film: water uptake → $\Delta C$ → frequency → counts; hysteresis of 1–2% RH matters | dew point, fog and frost warnings |
| 🤖 Robotics & drones | force sensor in a gripper fingertip: force → strain → bridge → counts at 1 kHz | grip hard enough not to drop an egg, soft enough not to crush it |
| 🚗 Cars | tyre-pressure sensor: pressure → membrane bending → $\Delta R$ or $\Delta C$ → ADC → radio | a warning before a slow leak becomes a blow-out |
| 📱 Phones & photography | camera pixel: photons → electrons → voltage → 10–12-bit number; saturation = blown-out highlights | exposure; the "transfer curve" of a pixel is its photon transfer curve (A5) |
| 🏠 Home & household | kitchen scale chain from Example 1 with tare (offset) and calibration (slope) | 250 g of flour, to 0.4 g |

## Derivation

**(a) Sensitivity of a chain is a product (chain rule).**
1. Stage outputs: $u_1=f_1(s)$, $u_2=f_2(u_1)$, …, $y=f_n(u_{n-1})$.
2. Chain rule: $\dfrac{dy}{ds}=\dfrac{dy}{du_{n-1}}\cdots\dfrac{du_2}{du_1}\dfrac{du_1}{ds}$.
3. Each factor is a stage gain $S_i$, so $S=\prod_i S_i$, and the units cancel in a chain too: kg → strain → ΔR/R → V → V → counts.
4. In decibels, gains multiply ⇒ dB add (A7).

**(b) Linearisation around an operating point.**
1. Taylor: $f(s_{\text{op}}+\Delta s)=f(s_{\text{op}})+f'(s_{\text{op}})\Delta s+\tfrac12 f''(s_{\text{op}})\Delta s^2+\dots$
2. Call $y_{\text{op}}=f(s_{\text{op}})$ and $S=f'(s_{\text{op}})$: $\Delta y=y-y_{\text{op}}\approx S\,\Delta s$.
3. The first neglected term is $\tfrac12 f''\Delta s^2$: halve the step and the relative error halves.
4. For $f=\tanh$ at $u_{\text{op}}=0.5$, $\Delta u=0.1$: exact $\Delta y=0.07493$, linear $0.07864$; the 5.0% gap is the curvature.

**(c) Reading the sensor (inverse of the calibration line).**
1. Calibration line: $y=y_0+S\,s$.
2. Solve for the stimulus: $s_{\text{meas}}=(y-y_0)/S$.
3. An error $\delta y$ in the output becomes an error $\delta y/S$ in the stimulus: high sensitivity shrinks the effect of output noise.

**(d) The first-order lag.**
1. Rule: the speed of approach is proportional to the remaining distance, $\dot y=(Ks-y)/\tau$.
2. Put $z=y-Ks$ (for constant $s$): $\dot z=-z/\tau$.
3. Separate and integrate: $z(t)=z(0)e^{-t/\tau}$.
4. Back to $y$: $y(t)=Ks+(y(0)-Ks)e^{-t/\tau}$.
5. Time to get within $\delta$ of the end: $\lvert z(0)\rvert e^{-t/\tau}=\delta$ ⇒ $t=\tau\ln(\lvert z(0)\rvert/\delta)$.
6. Initial slope: $\dot y(0)=(Ks-y(0))/\tau$, the tangent at $t=0$ hits the final value exactly at $t=\tau$.

**(e) Precision from repeated readings.**
1. Mean $\bar s=\frac1M\sum s_i$; bias $=\bar s-s$.
2. Sample standard deviation $\sqrt{\frac{1}{M-1}\sum (s_i-\bar s)^2}$: the spread, independent of the bias.
3. Averaging $M$ readings shrinks random scatter by $1/\sqrt M$ (A8), but never shrinks the bias.

## Worked check

**The kitchen scale weighs 250 g of flour.** Offset with an empty pan: $y_0=1200$ counts.
- Strain: $200\times10^{-6}\,\text{/kg}\times0.250$ kg $=50$ µε.
- Resistance: $\Delta R/R=\mathrm{GF}\cdot\varepsilon=2\times50$ µε $=100$ ppm.
- Full bridge: $V_{\text{out}}=V_{\text{ex}}\,\Delta R/R=5\times10^{-4}\times5$ V $=0.500$ mV.
- Amplifier: $128\times0.500$ mV $=64.0$ mV.
- ADC: $64.0$ mV $/\,31.25$ µV $=2048$ counts above the offset, so $y=1200+2048=3248$ counts.
- Reading back: $s_{\text{meas}}=(3248-1200)/8192=0.2500$ kg $=250.0$ g ✓. The total sensitivity is
  $2\times10^{-4}\cdot2\cdot5\cdot128\cdot32000=8192$ counts/kg ✓.

**The thermometer:** $\tau=10$ s, from 22 °C to 37 °C. At $t=10$ s: $37-15e^{-1}=37-15(0.3679)=31.48$ °C ✓. Within 0.1 °C:
$t=10\ln150=50.1$ s ✓. All numbers come from `scripts/checks/A1_check.py`.

## Whiteboard plan

- **Panel 1 — the chain.** Draw five boxes in a row: *world → physical change → voltage → bigger voltage → number*. Under the
  arrows write the kitchen-scale gains: 200 µε/kg, ×2, ×5 V, ×128, ×32 000/V. Say: "Multiply along the arrows: 8192 counts per kilogram."
- **Panel 2 — the transfer curve.** Axes $s$ and $y$. An S-shaped curve that flattens at the top. Mark $y_0$ on the $y$-axis,
  draw the tangent at an operating point and label its slope $S$. Say: "Near this point the curve *is* its tangent."
- **Panel 3 — linearise.** Zoom on the tangent: a small triangle with sides $\Delta s$ and $S\Delta s$, and the red gap between
  tangent and curve labelled $\tfrac12f''\Delta s^2$.
- **Panel 4 — three targets.** Draw three dartboards: a tight cluster off-centre (precise, not accurate), a loose cloud around the
  centre (accurate, not precise), and a tight cluster in the centre. Next to them a ruler with coarse ticks for "resolution".
- **Panel 5 — the lag.** A step in $s$ (blue) and the exponential creep of $y$ (yellow). Mark $\tau$ where the tangent at $t=0$ meets
  the final value and write 63%, 95%, 99.3% at $\tau,3\tau,5\tau$.
- **Panel 6 — active vs passive.** A photodiode with an arrow "light pays" and a strain gauge with a battery "my circuit pays".

## Common mistakes and where the intuition breaks

- **Confusing resolution with accuracy.** A display with 0.001 °C digits can be 2 °C wrong. More digits only show more
  noise unless the chain behind them is calibrated.
- **Thinking one ADC count is the resolution.** If the noise is 3 counts rms, the real resolution is a few counts. See A8.
- **Using the datasheet sensitivity outside the operating point.** $S$ is a *local* slope. Near saturation it can be ten
  times smaller, and the linear formula then badly overestimates $\Delta y$.
- **Forgetting the offset.** Reading $s=y/S$ instead of $(y-y_0)/S$ is the "scale shows 0.3 kg with nobody on it" mistake.
- **Reading a lagging sensor too early.** After one time constant you have only 63% of the change. Wait $5\tau$, or model the lag.
- **Ratiometric thinking for passive sensors.** A passive sensor's output scales with $V_{\text{ex}}$. If the supply drifts by
  1%, so does the reading, unless the ADC uses the same supply as its reference (A2, A7).
- **Where the simple chain breaks:** stages are not always independent. The sensor can load the circuit (a thermistor heated by
  its own measuring current, A2), the measurement can change the measurand (a hot-wire probe cooling the air it measures), and
  the noise added at an *early* stage gets multiplied by every later gain. That is why the first amplifier matters most (A7).

## Remember

**"Stimulus → physical change → voltage → number: multiply the gains, linearise around the operating point, and never confuse resolution, accuracy and precision."**

## Self-test

1. A pressure sensor gives 2 mV/kPa at the bridge, an amplifier multiplies by 100, and a 12-bit ADC uses $V_{\text{ref}}=3.3$ V.
   What is the sensitivity in counts per kPa, and how many kPa is one count?
   <details><summary>Answer</summary>Amplified: 0.2 V/kPa. One LSB = 3.3/4096 = 0.806 mV, so 1/0.000806 = 1241 counts per volt. S = 0.2 × 1241 ≈ 248 counts/kPa, and one count ≈ 0.004 kPa = 4 Pa (if noise allows).</details>
2. A humidity sensor has τ = 8 s. The humidity jumps from 40% to 60% RH. What does it read after 8 s and after 24 s?
   <details><summary>Answer</summary>After τ: 40 + 20 × 0.632 = 52.6% RH. After 3τ: 40 + 20 × 0.950 = 59.0% RH.</details>
3. Ten readings of a 100.0 g reference mass have a mean of 100.0 g but scatter by ±2 g. Is the scale accurate, precise, both or neither? What helps?
   <details><summary>Answer</summary>Accurate (no bias) but not precise (large scatter). Averaging many readings, or lowering the noise in the electronics, helps; recalibration does not.</details>

**Next:** [A2 Resistive sensors and the Wheatstone bridge](A2-resistive-sensors-and-the-wheatstone-bridge.md) — the first link of the kitchen-scale chain, a 100 ppm change in resistance, and the bridge that turns it into half a millivolt.
