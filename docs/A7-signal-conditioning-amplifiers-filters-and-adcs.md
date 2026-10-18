# A7. Signal conditioning: amplifiers, filters and ADCs

> **Connects:** builds on [A1 What a sensor is](A1-what-a-sensor-is-transduction-and-the-measurement-chain.md), [A2 Resistive sensors and the Wheatstone bridge](A2-resistive-sensors-and-the-wheatstone-bridge.md) · used by [A8 Noise, resolution, calibration and drift](A8-noise-resolution-calibration-and-drift.md), [A9 Sensor fusion and the Kalman filter](A9-sensor-fusion-and-the-kalman-filter.md), [B4 MEMS inertial sensors](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md), [B5 MEMS microphones, pressure sensors and actuators](B5-mems-microphones-pressure-sensors-and-actuators.md)

## Hook — a hearing aid, and a staircase next to a ramp

A hearing aid has a microphone that produces a few **millivolts** when someone speaks. Inside, three things happen
before the sound reaches the ear again. An **amplifier** makes the millivolts a thousand times bigger. A **filter**
throws away what is not speech: the hiss above the voices and the rumble of a bus below them. Then an **analogue-to-digital
converter (ADC)** measures the voltage thousands of times a second and turns each measurement into a whole number,
so a tiny computer can process it.

The ADC is the strange part. A voltage can be anything, like a smooth **ramp**; a number has to be one of a fixed set of
values, like the steps of a **staircase**. And the ADC only looks every so often, like a film camera taking frames. Each of
those two shortcuts creates its own errors: **quantisation** (the gap between ramp and step) and **aliasing** (the wagon
wheel that seems to spin backwards in a film). This note is about the three blocks every sensor needs between the
physics and the number: **amplify, filter, convert**.

## The idea in plain words

**The chain.** In [A1](A1-what-a-sensor-is-transduction-and-the-measurement-chain.md) a sensor was a chain: stimulus $s$ →
physical change → voltage → number. In [A2](A2-resistive-sensors-and-the-wheatstone-bridge.md) a strain gauge bridge gave
less than a millivolt. That is far too small to measure directly: a typical microcontroller ADC with a $3.3$ V range and 12
bits has steps of $0.8$ mV, so the whole signal would fit inside a single step. **Signal conditioning** is everything that
happens between the sensor and the ADC to make the signal *big, clean and slow enough* to be measured well.

**The operational amplifier (op-amp).** An op-amp is a chip with two inputs, $+$ and $-$, and one output. It multiplies the
*difference* between its inputs by a huge open-loop gain $A_{\text{OL}}$ (often $10^5$–$10^6$): $V_{\text{out}}=A_{\text{OL}}(V_+-V_-)$.
On its own that is useless (any microvolt drives the output to the supply rail). The trick is **negative feedback**: connect
the output back to the $-$ input through resistors. The op-amp then adjusts its output until the two inputs are equal. This
gives the two **golden rules** for an op-amp with negative feedback:

1. **No current flows into the inputs** (their input resistance is enormous).
2. **The output does whatever it takes to make $V_+=V_-$** (because $A_{\text{OL}}$ is so large, the difference is tiny).

With those two rules you can analyse almost any amplifier in three lines.

**Non-inverting amplifier.** The signal goes into $+$. The output feeds back to $-$ through a divider of $R_f$ (from output to $-$)
and $R_g$ (from $-$ to ground). Rule 2 says the divider's middle must equal the input, $V_{\text{in}}=V_{\text{out}}R_g/(R_f+R_g)$, so
the gain is $G=1+R_f/R_g$. It never loads the sensor (rule 1), which is why it is the first stage after a delicate sensor.

**Inverting amplifier.** The signal goes into $-$ through $R_{\text{in}}$, with $+$ grounded. Rule 2 makes the $-$ input a
**virtual ground** (0 V without being connected to ground). All of the input current $V_{\text{in}}/R_{\text{in}}$ must flow on
through $R_f$ (rule 1), so $V_{\text{out}}=-V_{\text{in}}R_f/R_{\text{in}}$ and $G=-R_f/R_{\text{in}}$. A variant with only $R_f$ turns a photodiode
current into a voltage, $V_{\text{out}}=-IR_f$: the **transimpedance amplifier** of [A5](A5-optical-sensors-photodiodes-image-sensors-and-lidar.md).

**The instrumentation amplifier (in-amp) and CMRR.** A bridge has *two* output wires, both sitting near $V_{\text{ex}}/2$. The signal is
their small **difference**; the large voltage they share is the **common-mode** voltage. An in-amp is three op-amps arranged so
that it amplifies the difference by a gain set by one resistor $R_G$ (for the classic AD620/INA128 chips, $G=1+49.4\ \text{k}\Omega/R_G$)
and largely ignores the common mode. How well it ignores it is the **common-mode rejection ratio**,
$\mathrm{CMRR}=G_{\text{diff}}/G_{\text{cm}}$, usually quoted in dB.

**Why differential beats single-ended: mains hum.** Your body is an antenna. In a room wired for 230 V or 120 V, it picks up
a 50 or 60 Hz voltage of up to about a volt. An ECG wants the heart's 1 mV. Measure one electrode against ground
(**single-ended**) and the hum is 500 times bigger than the heartbeat. But the hum appears on *both* chest electrodes almost
equally: it is common mode. An in-amp with CMRR $=100$ dB ($10^5$) turns 0.5 V of common-mode hum into the same output as 5 µV of
real difference signal: 0.5% of the ECG. That is the **"divide to compare"** thread of [A2](A2-resistive-sensors-and-the-wheatstone-bridge.md):
subtract two wires that share the disturbance, and the disturbance cancels.

**Filters: keep the frequencies you want.** Every real signal is a sum of sines of different frequencies $f$ (or angular frequencies
$\omega=2\pi f$). A filter's job is to pass some and block others. The simplest is a resistor $R$ followed by a capacitor $C$ to ground,
with the output taken across $C$: the **RC low-pass**. A capacitor is a bucket of charge. It takes time to fill through the
resistor, so it cannot follow fast wiggles, but it follows slow changes perfectly. The time it needs is the **time constant**
$\tau=RC$: after a step, the output reaches 63.2% of the way in one $\tau$ and 99.3% in $5\tau$.

In frequency terms, the filter's **transfer function** (output over input for a sine) is
$$H(f)=\frac{1}{1+j\,f/f_c},\qquad \lvert H\rvert=\frac{1}{\sqrt{1+(f/f_c)^2}},\qquad f_c=\frac{1}{2\pi RC}.$$
Here $j=\sqrt{-1}$ keeps track of the phase. Far below the **cutoff frequency** $f_c$, $\lvert H\rvert\approx1$ and the signal passes.
At $f_c$, $\lvert H\rvert=1/\sqrt2=0.707$, which is **−3 dB** (half the power). Far above, $\lvert H\rvert\approx f_c/f$: every factor of 10 in frequency
costs a factor of 10 in amplitude, a slope of **−20 dB per decade**. The output also **lags**: phase $\varphi=-\arctan(f/f_c)$, −45° at
$f_c$. Swap $R$ and $C$ and you get the **high-pass**, $H=\dfrac{j f/f_c}{1+j f/f_c}$, which blocks DC and slow drifts and passes fast changes.
A plot of gain in dB and phase against $\log f$ is a **Bode plot**, and it is how engineers read every filter, amplifier and sensor.

```viz
a7-bode
```

**Sampling and Nyquist.** An ADC does not watch the voltage continuously; it takes **samples** at a rate $f_s$ (samples per second).
The **Nyquist–Shannon theorem** says a signal can be rebuilt exactly from its samples only if it contains no frequencies at or above
$f_s/2$, the **Nyquist frequency**. If it does, those frequencies do not disappear; they **fold back** and pretend to be a lower
frequency, the **alias**
$$f_{\text{alias}}=\big\lvert f-f_s\cdot\mathrm{round}(f/f_s)\big\rvert.$$
A 60 Hz hum sampled at 100 Hz shows up as a perfectly believable 40 Hz wave, and no software can tell it apart from a real 40 Hz
signal afterwards. A phone camera filming at 30 frames per second is a sampler too: a two-blade drone propeller at 5400 rpm
(90 turns per second, a blade pattern repeating at 180 Hz $=6\times30$) looks **frozen**, and at 5300 rpm it seems to turn slowly
**backwards**. The cure is an **anti-aliasing filter**: a low-pass *before* the ADC that removes everything above $f_s/2$, while it is
still an analogue voltage.

```viz
a7-aliasing
```

**The ADC: bits, steps and quantisation noise.** An $N$-bit ADC with reference voltage $V_{\text{ref}}$ divides the range $0\ldots V_{\text{ref}}$ into
$2^N$ steps of size $\Delta V=V_{\text{ref}}/2^N$, the **LSB** (least significant bit). Every reading is rounded to a step, so it is off by an
error $e$ somewhere between $-\Delta V/2$ and $+\Delta V/2$. For a busy signal that error is equally likely anywhere in that interval
(a **uniform** distribution), and its rms value is
$$\sigma_q=\frac{\Delta V}{\sqrt{12}}.$$
This **quantisation noise** is the price of turning a ramp into a staircase. For a sine wave filling the whole range, the ratio of
signal rms to quantisation-noise rms gives the famous rule
$$\mathrm{SNR}\approx 6.02\,N+1.76\ \text{dB}:$$
each extra bit halves the step and buys 6 dB. A 12-bit ADC reaches 74 dB, a 16-bit one 98 dB, a 24-bit one 146 dB (on paper:
in practice the analogue noise of [A8](A8-noise-resolution-calibration-and-drift.md) hits first).

```viz
a7-adc-3d
```

**Gain staging: fill the staircase.** Bits are only useful if the signal uses them. A 0.825 mV bridge signal straight into a
12-bit, 3.3 V ADC spans about **one** step: the reading jumps between two codes. Put an in-amp with $G=1001$ in front, and the
same strain spans about **1025** steps. The rule: amplify *early* (before noise from later stages is added), choose the gain so
the largest expected signal nearly fills $V_{\text{ref}}$ without clipping, filter before sampling, and pick $f_s$ well above twice the
highest frequency you care about. The order of the blocks is the order of this note: **amplify → filter → sample → quantise**.

## Intuitive examples

1. **Strain gauge on a bathroom-scale beam (gain staging).** Quarter bridge, $V_{\text{ex}}=3.3$ V, $\mathrm{GF}=2$, strain 500 µε:
   $\Delta R/R=0.001$ and $V_{\text{out}}=V_{\text{ex}}\Delta R/(4R)=0.825$ mV. A 12-bit, 3.3 V ADC has $\Delta V=0.806$ mV, so the raw bridge
   spans only **1.02 LSB**. An in-amp with $R_G=49.4\ \Omega$ gives $G=1+49.4\ \text{k}\Omega/49.4\ \Omega=1001$ (60 dB) and an output of
   0.826 V $=$ **1025 LSB**, i.e. 0.49 µε per step. The largest gain before 0.825 mV clips at 3.3 V would be 4000.
2. **Op-amp gains.** Non-inverting with $R_f=99$ kΩ, $R_g=1$ kΩ: $G=100$ (40 dB). Inverting with $R_f=47$ kΩ, $R_{\text{in}}=4.7$ kΩ:
   $G=-10$, and the source sees an input resistance of only 4.7 kΩ (the price of the virtual ground).
3. **ECG in a wired room (CMRR).** 0.5 V of 50/60 Hz common-mode hum vs a 1 mV heartbeat: single-ended, hum is **500×** the
   signal. With CMRR 80 dB it becomes 50 µV (5% of the ECG); 100 dB, 5 µV (0.5%); 120 dB, 0.5 µV (0.05%). A simple
   difference amplifier built with 0.1% resistors only guarantees CMRR $=(1+G)/(4\times0.001)=500$ (54 dB), which is why medical
   front ends use laser-trimmed in-amps.
4. **The RC low-pass in numbers.** $R=10$ kΩ, $C=100$ nF: $\tau=1$ ms and $f_c=159.15$ Hz. At $f_c$: 0.707, −3.01 dB, −45°.
   At 1 kHz: 0.157, −16.07 dB, −80.96°. At $10f_c$: −20.04 dB; at $100f_c$: −40.00 dB.
5. **A leaf thermistor next to a pump motor.** Temperature changes over seconds, so filter hard: $R=100$ kΩ, $C=1$ µF gives
   $\tau=0.1$ s, $f_c=1.59$ Hz. The 50 Hz pickup is cut to 0.032 (−29.9 dB) and 60 Hz to 0.027 (−31.5 dB). A high-pass is the
   opposite tool: 0.5 Hz (318 kΩ with 1 µF) on an ECG removes baseline wander from breathing (0.25 Hz passes only 0.447) while a
   72 bpm heartbeat (1.2 Hz) keeps 0.923 of its amplitude.
6. **Aliases you have seen.** 60 Hz hum sampled at 100 Hz → **40 Hz**; sampled at 1000 Hz it stays 60 Hz. 50 Hz hum sampled at
   exactly 50 Hz → **0 Hz**, a fake constant offset; 60 Hz at 50 Hz → 10 Hz. A two-blade propeller filmed at 30 fps: 5400 rpm
   looks frozen (alias 0 Hz), 5300 rpm (blade pattern 176.67 Hz) looks like −3.33 Hz, i.e. **1.67 turns per second backwards**.
7. **ADC steps.** At 3.3 V: 8 bits → 12.9 mV steps, SNR 49.9 dB; 10 bits → 3.22 mV, 62.0 dB; 12 bits → 0.806 mV, noise
   0.233 mV rms, 74.0 dB; 16 bits → 50.4 µV, 98.1 dB. A 24-bit ADC with 2.5 V reference has 0.149 µV steps (146.2 dB on paper).
   A simulation that quantises 200 000 random points of a full-scale sine with 12 bits measures 0.234 mV rms error and
   73.96 dB, matching the formulas.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $V_+=V_-$, no input current | the op-amp golden rules (with negative feedback) | $V_+$, $V_-$: input voltages |
| $G=1+R_f/R_g$ | non-inverting amplifier | $R_f$ feedback, $R_g$ to ground |
| $G=-R_f/R_{\text{in}}$ | inverting amplifier (virtual ground) | $R_{\text{in}}$ input resistor |
| $G=1+49.4\ \text{k}\Omega/R_G$ | a classic in-amp (AD620/INA128) | $R_G$ gain resistor |
| $\mathrm{CMRR}=G_{\text{diff}}/G_{\text{cm}}$, dB $=20\log_{10}$ | how well common-mode hum is rejected | $G_{\text{cm}}$: gain for the shared voltage |
| $\tau=RC$, $f_c=1/(2\pi\tau)$ | time constant and cutoff of an RC filter | $R$, $C$ |
| $\lvert H\rvert=1/\sqrt{1+(f/f_c)^2}$, $\varphi=-\arctan(f/f_c)$ | RC low-pass: −3 dB at $f_c$, −20 dB/decade | $f$ frequency |
| $\lvert H\rvert=(f/f_c)/\sqrt{1+(f/f_c)^2}$ | RC high-pass | |
| $\tau\dot y+y=v_{\text{in}}$ | the same low-pass in time: first-order lag | $y$: output voltage |
| $f_{\text{alias}}=\lvert f-f_s\,\mathrm{round}(f/f_s)\rvert$ | where a frequency lands after sampling | $f_s$ sampling rate; keep $f<f_s/2$ |
| $\Delta V=V_{\text{ref}}/2^N$ | ADC step (LSB) | $N$ bits |
| $\sigma_q=\Delta V/\sqrt{12}$ | quantisation noise (rms) | |
| $\mathrm{SNR}\approx6.02N+1.76$ dB | ideal ADC with a full-scale sine | |

## Applications

| World | Amplify, filter, convert | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | leaf-clip thermistors and sap-flow heaters read through a bridge + in-amp, with a 1 Hz low-pass against pump-motor hum; soil-moisture capacitance converted at a few samples per minute | slow plant signals can be filtered hard; the cutoff is set by how fast the plant changes, not by the electronics |
| 🧬 Biology & human health | ECG/EEG front ends: in-amp with CMRR > 100 dB, 0.5 Hz high-pass against breathing wander, 40–150 Hz low-pass, 24-bit ADC; hearing-aid microphones at 16–48 kHz sampling | a heartbeat of 1 mV is readable next to 0.5 V of mains hum only because the hum is common mode |
| 🌍 Environment | gas-sensor electrodes (nA currents) through transimpedance amplifiers; weather-station anemometer pulses counted; rain gauges sampled slowly | very small currents need a large feedback resistor and a heavy low-pass |
| 🤖 Robotics & drones | IMU chips sample accelerometers at 1–8 kHz with built-in digital low-pass filters; motor vibration at 200–400 Hz must not alias into the 50 Hz control loop | a propeller's vibration aliased into the gyro looks like real rotation and can crash a drone |
| 🚗 Cars | knock sensors (piezo, 5–15 kHz) band-pass filtered; wheel-speed and crankshaft Hall signals squared up by comparators; airbag accelerometers sampled at several kHz | anti-aliasing and gain decide whether a crash pulse is seen correctly in milliseconds |
| 📱 Phones & photography | each camera pixel has its own amplifier (ISO is analogue gain before a 10–14-bit ADC); MEMS microphones have built-in sigma-delta ADCs; rolling shutters alias fast propellers and wheels | RAW photos store 12–14 bits so shadows can be brightened without visible steps |
| 🏠 Home & household | kitchen scales: a load-cell bridge, an in-amp with $G\approx128$ and a 24-bit ADC sampling 10–80 times per second with built-in 50/60 Hz rejection | the mains-rejection setting on a scale chip is an anti-hum filter matched to your country's grid |

## Derivation

**(a) Non-inverting gain from the golden rules.**
1. The feedback divider sets $V_-=V_{\text{out}}\,\dfrac{R_g}{R_f+R_g}$ (no current flows into the input, rule 1).
2. Rule 2: $V_-=V_+=V_{\text{in}}$.
3. So $V_{\text{in}}=V_{\text{out}}R_g/(R_f+R_g)$, i.e. $G=V_{\text{out}}/V_{\text{in}}=1+R_f/R_g$.
4. With finite open-loop gain: $V_{\text{out}}=A_{\text{OL}}(V_{\text{in}}-\beta V_{\text{out}})$ with $\beta=R_g/(R_f+R_g)$, so $G=\dfrac{A_{\text{OL}}}{1+A_{\text{OL}}\beta}\to\dfrac1\beta$ as $A_{\text{OL}}\to\infty$.

**(b) Inverting gain.**
1. $V_+=0$, so rule 2 gives $V_-=0$ (virtual ground).
2. Current in: $I=V_{\text{in}}/R_{\text{in}}$; rule 1 sends all of it through $R_f$.
3. $V_{\text{out}}=V_--IR_f=-V_{\text{in}}R_f/R_{\text{in}}$.

**(c) Why a differential amplifier rejects common mode.**
1. Write the two inputs as $V_1=V_{\text{cm}}+V_d/2$ and $V_2=V_{\text{cm}}-V_d/2$.
2. An amplifier's output is $V_{\text{out}}=G_{\text{diff}}V_d+G_{\text{cm}}V_{\text{cm}}$.
3. Divide by $G_{\text{diff}}$: the hum looks like an input difference of $V_{\text{cm}}/\mathrm{CMRR}$.
4. 0.5 V of hum at CMRR $10^5$ looks like 5 µV.

**(d) RC low-pass transfer function.**
1. Capacitor: $I=C\,dV/dt$. For $V=\hat V e^{j\omega t}$, $dV/dt=j\omega V$, so $V/I=1/(j\omega C)=Z_C$.
2. Voltage divider of $R$ and $Z_C$: $H=Z_C/(R+Z_C)$.
3. Multiply by $j\omega C$: $H=1/(1+j\omega RC)$.
4. Modulus: $\lvert 1+jx\rvert=\sqrt{1+x^2}$, so $\lvert H\rvert=1/\sqrt{1+(\omega RC)^2}=1/\sqrt{1+(f/f_c)^2}$ with $f_c=1/(2\pi RC)$.
5. At $f=f_c$: $\lvert H\rvert=1/\sqrt2$, $20\log_{10}(1/\sqrt2)=-3.01$ dB.
6. For $f\gg f_c$: $\lvert H\rvert\approx f_c/f$; $\times10$ in $f$ → $-20$ dB.
7. Phase of $1/(1+jx)$ is $-\arctan x$: −45° at $f_c$, → −90°.
8. High-pass ($R$ and $C$ swapped): $H=R/(R+Z_C)=j\omega RC/(1+j\omega RC)$.

**(e) The same filter in time.**
1. Current through $R$: $(v_{\text{in}}-y)/R$; it all charges $C$: $C\dot y=(v_{\text{in}}-y)/R$.
2. Rearranged: $RC\,\dot y+y=v_{\text{in}}$, i.e. $\tau\dot y+y=v_{\text{in}}$, the first-order lag.
3. Step input of size 1 from $y=0$: $y=1-e^{-t/\tau}$; $63.2\%$ at $t=\tau$, $99.3\%$ at $5\tau$.
4. Try $y=\hat y e^{j\omega t}$: $(1+j\omega\tau)\hat y=\hat v$, which is part (d) again.

**(f) Aliasing.**
1. Samples of $\sin(2\pi f t)$ at $t=k/f_s$ are $\sin(2\pi f k/f_s)$.
2. Adding $2\pi m k$ ($m$ any integer) changes nothing: $\sin(2\pi (f-mf_s)k/f_s)$ gives the same numbers.
3. So $f$ and $f-mf_s$ are indistinguishable; the one closest to zero is $f-f_s\,\mathrm{round}(f/f_s)$, with $\lvert\cdot\rvert\le f_s/2$.
4. Only if every component already satisfies $f<f_s/2$ is the alias the true frequency.

**(g) Quantisation noise and the 6.02 N + 1.76 rule.**
1. Error $e$ uniform on $[-\Delta V/2,\Delta V/2]$, density $1/\Delta V$.
2. Variance $\displaystyle\int_{-\Delta V/2}^{\Delta V/2}\frac{e^2}{\Delta V}\,de=\frac{\Delta V^2}{12}$, so $\sigma_q=\Delta V/\sqrt{12}$.
3. A full-scale sine has amplitude $V_{\text{ref}}/2$ and rms $V_{\text{ref}}/(2\sqrt2)$.
4. Ratio: $\dfrac{V_{\text{ref}}/(2\sqrt2)}{V_{\text{ref}}/(2^N\sqrt{12})}=2^N\sqrt{12}/(2\sqrt2)=2^N\sqrt{3/2}$.
5. In dB: $20\log_{10}2^N+20\log_{10}\sqrt{1.5}=6.0206\,N+1.7609$.

## Worked check

**RC filter.** $R=10$ kΩ, $C=100$ nF: $\tau=RC=10^4\times10^{-7}=10^{-3}$ s, $f_c=1/(2\pi\times10^{-3})=159.15$ Hz. At $f=1$ kHz:
$f/f_c=6.2832$, $(f/f_c)^2=39.478$, $\lvert H\rvert=1/\sqrt{40.478}=0.1572$, i.e. $20\log_{10}0.1572=-16.07$ dB, and $\varphi=-\arctan6.2832=-80.96°$ ✓.
So a 1 kHz whine of 1 V leaves the filter as 0.157 V, lagging by almost a quarter cycle.

**12-bit ADC.** $\Delta V=3.3/4096=0.8057$ mV; $\sigma_q=0.8057/\sqrt{12}=0.2326$ mV. A full-scale sine has rms
$3.3/(2\sqrt2)=1.1667$ V, so $\mathrm{SNR}=20\log_{10}(1.1667/0.0002326)=74.01$ dB, and the rule gives $6.02\times12+1.76=74.00$ dB ✓.

**Gain staging.** $0.825$ mV $\times1001=0.8258$ V; $0.8258/0.0008057=1025$ steps ✓. (All numbers: `scripts/checks/A7_check.py`.)

## Whiteboard plan

- **Panel 1: the chain.** Draw sensor → [amplify] → [filter] → [sample] → [quantise] → number. Under the sensor write "0.8 mV",
  under the ADC "1 step = 0.8 mV". Say: "Without the first box, the whole signal is one step."
- **Panel 2: the op-amp rules.** A triangle with $+$, $-$, output. Write the two golden rules in a box. Draw the non-inverting
  circuit, mark $V_-=V_{\text{in}}$, and derive $G=1+R_f/R_g$ in three lines.
- **Panel 3: hum and CMRR.** Two electrode wires with the same wavy hum drawn on both and a tiny heartbeat on one. Draw a
  minus sign between them; the hum cancels. Write "0.5 V / 10⁵ = 5 µV".
- **Panel 4: the Bode plot.** Log $f$ axis; flat line at 0 dB, knee at $f_c$ with a dot at −3 dB, straight line falling 20 dB per decade.
  Below, the phase going from 0 through −45° to −90°. Next to it the RC circuit and $H=1/(1+j\omega RC)$.
- **Panel 5: aliasing.** A fast sine with dots every so often, and the slow dashed sine through the dots. Draw a propeller in
  four frames rotating backwards. Write $f_{\text{alias}}=\lvert f-f_s\,\mathrm{round}(f/f_s)\rvert$ and "filter before you sample".
- **Panel 6: the staircase.** A ramp and a staircase on top of it; below, the sawtooth error between $\pm\Delta V/2$. Write
  $\Delta V/\sqrt{12}$ and $6.02N+1.76$ dB, and "one more bit = 6 dB".

## Common mistakes and where the intuition breaks

- **Amplifying after filtering or after the ADC.** Digital gain multiplies the quantisation noise too; it adds no information.
  Gain must come *before* the ADC, and the first stage should have the most gain because its noise is the one that gets amplified most.
- **Thinking aliasing can be fixed in software.** After sampling, a 60 Hz hum at $f_s=100$ Hz *is* a 40 Hz signal. Only an analogue
  filter before the ADC (or a higher $f_s$) prevents it. A first-order RC is weak (a 10 Hz cutoff still leaves 16% of 60 Hz), so real
  anti-alias filters are higher order or the ADC oversamples and filters digitally.
- **Treating −3 dB as "the end of the passband".** At $f_c$ the signal has already lost 29% of its amplitude, and the phase lag is 45°.
  If you need 1% accuracy, stay below about $0.14f_c$.
- **Forgetting the lag.** A low-pass with $\tau=0.1$ s delays a fast temperature step by about 0.1 s. In a control loop (a drone,
  a thermostat) delay can cause oscillation.
- **"More bits = more accuracy."** Bits set the step size, not the truth. A 24-bit ADC whose analogue front end has 5 µV of noise behaves
  like a much smaller ADC (its "effective number of bits" is lower), and offset or gain errors are untouched: see [A8](A8-noise-resolution-calibration-and-drift.md).
- **Quantisation noise is not always noise.** The uniform $\Delta V/\sqrt{12}$ model needs a busy signal. A constant input gives a constant
  error (a bias), and a slow ramp gives a sawtooth; adding a little random **dither** before the ADC makes the error random again so it can be averaged away.
- **Golden rules have limits.** The op-amp's gain falls at high frequency (gain × bandwidth is fixed, e.g. 1 MHz), its output cannot go
  beyond the supply rails, and real inputs draw a tiny bias current. The rules are the first approximation, like $y=y_0+Ss$ in A1.

## Remember

**"Amplify early, filter before you sample, keep everything below f_s/2, and fill the staircase: each bit is 6 dB."**

## Self-test

1. A photodiode amplifier needs a gain of 25 with a non-inverting stage and $R_g=1$ kΩ. What is $R_f$? What would the gain be if you mistakenly built the inverting version with the same resistors?
   <details><summary>Answer</summary>G = 1 + Rf/Rg = 25 gives Rf = 24 kΩ. The inverting version gives G = −Rf/Rin = −24 (24 times bigger, and upside down).</details>
2. A drone's gyro is sampled at 500 Hz, and the propellers shake the frame at 470 Hz. At what frequency does the vibration appear in the gyro data, and what should the designer do?
   <details><summary>Answer</summary>The alias is |470 − 500·round(470/500)| = |470 − 500| = 30 Hz, right inside the drone's control bandwidth, so it looks like a real 30 Hz wobble. Add an analogue or on-chip low-pass well below 250 Hz before sampling, sample faster (e.g. 8 kHz, then filter digitally), or mount the IMU on soft dampers.</details>
3. A 10-bit ADC with $V_{\text{ref}}=5$ V measures a sensor whose largest output is 0.5 V. How many steps does the signal use, what is the step size, and what gain would make it use about 90% of the range?
   <details><summary>Answer</summary>Step = 5/1024 = 4.88 mV. 0.5 V spans about 102 steps (out of 1024). A gain of 9 gives 4.5 V = 90% of the range, about 922 steps, i.e. about 3.2 bits more resolution.</details>

**Next:** [A8 Noise, resolution, calibration and drift](A8-noise-resolution-calibration-and-drift.md) — once the signal is a number, we must ask how much of it we can trust: noise, offsets, gains and drift.
