# A8. Noise, resolution, calibration and drift

> **Connects:** builds on [A1 What a sensor is](A1-what-a-sensor-is-transduction-and-the-measurement-chain.md), [A7 Signal conditioning](A7-signal-conditioning-amplifiers-filters-and-adcs.md) · used by [A9 Sensor fusion and the Kalman filter](A9-sensor-fusion-and-the-kalman-filter.md), [B4 MEMS inertial sensors](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md), [B5 MEMS microphones, pressure sensors and actuators](B5-mems-microphones-pressure-sensors-and-actuators.md), [C5 Lab-on-a-chip](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md)

## Hook — a bathroom scale that reads 0.3 kg with nobody on it

Step off your bathroom scale and it still says **0.3 kg**. Step on, step off, step on again: you get 70.9, then 71.1, then 70.8.
Two different things are wrong. The 0.3 kg with nobody on it is the same every time: it is a **systematic error**, an offset, and
you can simply subtract it. The jumping between 70.8 and 71.1 is different every time: it is **random error**, noise, and no
subtraction will remove it, but taking the average of several readings will shrink it.

Every sensor in this notebook has both kinds of error. This note answers three questions: **how small a change can we trust**
(noise and resolution), **how do we make the numbers right** (calibration), and **why do they go wrong again** (drift).

## The idea in plain words

**Error.** The error of one reading is "measured minus true", $e=s_{\text{meas}}-s$, as in [A1](A1-what-a-sensor-is-transduction-and-the-measurement-chain.md).
Split it into two parts: a part that is the same every time (the **bias** or **systematic error**) and a part that changes
from reading to reading with average zero (the **random error** or **noise**).

**Accuracy and precision.** Picture darts on a target. **Precision** is how tightly the darts cluster (small random error).
**Accuracy** is how close their *centre* is to the bull's-eye (small bias). A sensor can be precise but inaccurate (a tight cluster
in the wrong place: the scale that always reads 0.3 kg too much), or accurate but imprecise (scattered around the right place). The
total rms error combines both like the sides of a right triangle: $\sqrt{\text{bias}^2+\sigma^2}$. The two need different cures:
**calibration** removes bias, **averaging** shrinks noise.

```viz
a8-target
```

**Gaussian noise and rms.** When noise comes from many small independent causes (electrons jiggling, molecules hitting a membrane),
the readings follow the bell-shaped **Gaussian** (normal) distribution. It is fixed by two numbers: its mean and its standard
deviation. For noise with zero mean the standard deviation equals the **rms** (root mean square) value, and we call it $\sigma_n$.
About 68% of readings fall within $\pm\sigma_n$, 95% within $\pm2\sigma_n$ and 99.7% within $\pm3\sigma_n$. Peak-to-peak noise on an
oscilloscope is roughly $6\sigma_n$.

**Where electronic noise comes from.** Three sources appear in almost every sensor.
- **Johnson (thermal) noise.** Every resistor at temperature $T$ produces a random voltage because its electrons are in thermal motion:
  $v_n=\sqrt{4k_BTR\,\Delta f}$, where $k_B=1.38\times10^{-23}$ J/K is Boltzmann's constant, $R$ the resistance and $\Delta f$ the
  bandwidth (the range of frequencies you let through, set by the filters of [A7](A7-signal-conditioning-amplifiers-filters-and-adcs.md)).
  A 1 kΩ resistor at room temperature gives about 4 nV for every √Hz of bandwidth. You cannot build a resistor without it; you can only
  lower $R$, cool it, or narrow $\Delta f$.
- **Shot noise.** Current is made of individual charges arriving at random, like raindrops on a roof. A current $I$ fluctuates by
  $i_n=\sqrt{2q_eI\,\Delta f}$, with $q_e=1.602\times10^{-19}$ C the electron charge. Its relative size $i_n/I$ grows as the current gets
  smaller, which is why dim light gives grainy photos ([A5](A5-optical-sensors-photodiodes-image-sensors-and-lidar.md)).
- **1/f (flicker) noise.** Many devices (transistors, carbon resistors, electrodes) also have a noise whose power grows at low
  frequencies, proportional to $1/f$. Below a **corner frequency** it dominates. Every decade of low frequency adds the same amount of
  noise, so very slow measurements (a glucose sensor drifting over an hour) can never be made arbitrarily quiet by waiting.

**Averaging: noise falls as $1/\sqrt M$.** If you take $M$ independent readings and average them, the true value stays, but the
noise partly cancels. Variances of independent errors add, so the sum of $M$ noises has variance $M\sigma_n^2$; dividing by $M$ to get
the mean divides the variance by $M^2$. Result: the mean has noise $\sigma_n/\sqrt M$. Four times as many readings halve the noise;
100 readings cut it tenfold. The prices: it takes longer (bandwidth goes down, exactly the $\Delta f$ in the formulas above), and it does
**nothing** against bias, because the bias is in every reading.

```viz
a8-averaging
```

**Resolution, SNR and LOD.** The **resolution** $\Delta s_{\min}$ is the smallest change in the stimulus that stands out from the noise.
Translate the output noise back into stimulus units with the sensitivity $S$:
$$\Delta s_{\min}=\frac{\sigma_n}{S}.$$
A glucose electrode with $S=2$ nA/mM and 0.3 nA of noise resolves 0.15 mM. The **signal-to-noise ratio** compares a signal to the noise,
$\mathrm{SNR}=20\log_{10}(\text{signal rms}/\sigma_n)$ dB. The **limit of detection (LOD)** is the smallest amount you can say is
*present at all*. The usual rule is that the signal must be at least three noise standard deviations above the blank:
$\mathrm{LOD}=3\sigma_n/S$ (0.45 mM for the glucose electrode). At $3\sigma_n$, a blank sample fakes a detection only about 0.1% of the time.

**Calibration: fix the offset and the gain.** A linear sensor obeys $y=y_0+S\,s$ (A1). Calibration means measuring $y_0$ and $S$ for
*this* device and then inverting: $s=(y-y_0)/S$.
- **Two-point calibration.** Measure at two known stimuli. At $s=0$ you read the offset $y_0$ directly; at a second known $s_2$ you get
  $S=(y_2-y_0)/s_2$. The bathroom scale reads 0.3 kg empty and 70.9 kg with a certified 70.0 kg weight, so $y_0=0.3$ kg and
  $S=1.00857$; a raw 82.0 kg becomes 81.01 kg.
- **Least squares.** With more points, each with noise, find the line that minimises the sum of squared residuals
  $\sum (y_i-y_0-Ss_i)^2$. Setting both derivatives to zero gives the slope $S=\sum(s_i-\bar s)(y_i-\bar y)/\sum(s_i-\bar s)^2$ and
  intercept $y_0=\bar y-S\bar s$ (bars are means). The scatter of the residuals tells you the noise, so a good calibration also
  measures the precision.

**Drift: why calibration does not last.** A sensor's offset and gain change with **temperature**, **time** (ageing, electrode fouling,
mechanical creep) and **stress** (soldering, packaging). A tyre-pressure sensor whose offset changes by 0.1 kPa per °C and was
calibrated at 20 °C is 4 kPa off on a −20 °C morning. Cures: measure temperature too and correct with a table (most modern sensors
do this inside the chip), use a reference (a second, unstrained gauge in the bridge of A2), or recalibrate regularly (the "tare" button,
or a phone asking you to wave it in a figure eight).

**The Allan-deviation intuition.** Averaging longer helps... until it does not. For a gyroscope sitting still, average its reading over
a time $T_{\text{av}}$ and look at how much successive averages differ. That is the **Allan deviation** $\sigma_A(T_{\text{av}})$. At short
times white noise dominates and $\sigma_A$ falls as $1/\sqrt{T_{\text{av}}}$ (the $1/\sqrt M$ law). At long times the sensor's bias
wanders (drift), and $\sigma_A$ *rises* again. The bottom of the curve tells you the best averaging time and the best stability the
sensor can ever give. For a gyro with 0.1 °/s noise per sample at 100 Hz and a slow random-walk drift, the best is to average about 173 s,
reaching 0.0011 °/s (3.9 °/h). This is why a drone cannot hold its heading on the gyro alone, and needs the fusion of [A9](A9-sensor-fusion-and-the-kalman-filter.md).

**Calibration in 3D: the compass ellipsoid.** A phone's magnetometer measures a 3D vector $\mathbf m$. Turned in every direction in a
uniform field of 50 µT, a perfect sensor's readings lie on a **sphere** of radius 50 µT. A real phone has a magnetised speaker and
screws that add a constant vector, the **hard-iron offset** $\mathbf m_0$ (the 3D version of $y_0$), and steel parts that bend the field,
the **soft-iron** distortion: a matrix $A_{\text{si}}$ that stretches and tilts (the 3D version of $S$). The readings then lie on an
**offset, tilted ellipsoid**. Calibration fits that ellipsoid and maps it back to the sphere: subtract its centre, rotate to its axes,
rescale each axis, rotate back. Accelerometers are calibrated the same way on a sphere of radius 1 g, by resting them in many orientations.

```viz
a8-calibration-3d
```

## Intuitive examples

1. **Johnson noise of a strain-gauge bridge.** A 10 kΩ resistance at 300 K over a 10 kHz bandwidth: $v_n=\sqrt{4k_BTR\Delta f}=1.29$ µV rms.
   A 1 mV bridge signal then has $\mathrm{SNR}=57.8$ dB. Per √Hz: 1 kΩ gives 4.07 nV, 10 kΩ gives 12.9 nV; a 1 MΩ pH-electrode
   resistance over 10 Hz already gives 0.41 µV. Cooling the 10 kΩ resistor to 77 K (liquid nitrogen) only halves the noise (0.65 µV).
2. **Shot noise in a photodiode.** $I=1$ µA over 10 kHz: $i_n=\sqrt{2q_eI\Delta f}=56.6$ pA, SNR $=17\,666$ (84.9 dB). At 1 nA (a
   thousand times dimmer) $i_n=1.79$ pA and SNR $=559$ (54.9 dB): a thousand times less light costs only $\sqrt{1000}\approx31.6$ in SNR.
3. **1/f noise.** An amplifier with 10 nV/√Hz white noise and a 10 Hz corner, measured from 0.1 to 10 Hz: 74.8 nV rms, against
   31.5 nV if it were white. Each decade of 1/f adds $(48.0\ \text{nV})^2$ of variance, however low you go.
4. **Kitchen scale averaging.** One reading has $\sigma_n=0.5$ g. Averaging $M=4$: 0.25 g; $M=16$: 0.125 g (a simulation of 20 000
   averages measures 0.1256 g); $M=100$: 0.05 g, but at 10 readings per second that takes 10 s.
5. **Resolution and LOD.** Glucose electrode, $S=2$ nA/mM, $\sigma_n=0.3$ nA: resolution 0.15 mM, LOD 0.45 mM. A barometer chip with
   $S=1$ mV/kPa and 0.02 mV noise resolves 20 Pa; air pressure falls by 11.8 Pa per metre near sea level, so that is **1.70 m** of altitude.
6. **Least-squares calibration of a load cell.** Known masses 0, 250, 500, 750, 1000 g give 8410, 12 530, 16 590, 20 770, 24 800 counts.
   The fit gives $S=16.408$ counts/g and $y_0=8416.0$ counts; residuals −6, 12, −30, 48, −24 counts, rms 36.3 counts $=2.21$ g. A reading of
   18 000 counts means 584.1 g.
7. **Temperature drift and hard iron.** A TPMS sensor with 0.1 kPa/°C offset drift, calibrated at 20 °C, is 4.0 kPa (1.7% of 230 kPa) off at
   both −20 °C and 60 °C. A 12 µT hard-iron offset against Europe's roughly 20 µT horizontal field can swing a compass heading by up to
   $\arcsin(12/20)=36.9°$. For the distortion in the 3D figure (offset (12, −8, 25) µT, axes ×1.25, ×0.85, ×1, tilted 30°), raw lengths
   range from 19.2 to 80.6 µT instead of 50.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $e=s_{\text{meas}}-s=\text{bias}+\text{noise}$ | systematic plus random error | $e$ error |
| rms error $=\sqrt{\text{bias}^2+\sigma_n^2}$ | accuracy and precision combined | |
| $v_n=\sqrt{4k_BTR\,\Delta f}$ | Johnson noise of a resistor | $k_B$, $T$, $R$, $\Delta f$ bandwidth |
| $i_n=\sqrt{2q_eI\,\Delta f}$ | shot noise of a current | $q_e$ electron charge, $I$ current |
| noise power $\propto 1/f$ below the corner | flicker noise: each decade adds equally | $f$ frequency |
| $\sigma_{\bar y}=\sigma_n/\sqrt M$ | averaging $M$ independent readings | $M$ samples |
| $\Delta s_{\min}=\sigma_n/S$ | resolution: noise floor over sensitivity | $S$ sensitivity |
| $\mathrm{SNR}=20\log_{10}(\text{signal rms}/\sigma_n)$ | signal-to-noise ratio in dB | |
| $\mathrm{LOD}=3\sigma_n/S$ | limit of detection | |
| $S=\dfrac{\sum(s_i-\bar s)(y_i-\bar y)}{\sum(s_i-\bar s)^2}$, $y_0=\bar y-S\bar s$ | least-squares calibration line | bars: means |
| $s=(y-y_0)/S$ | using the calibration | |
| $\mathbf m=A_{\text{si}}\mathbf B_E+\mathbf m_0$ | 3D sensor with soft and hard iron | $\mathbf B_E$ true field, $\mathbf m_0$ offset |

## Applications

| World | Noise, calibration and drift | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | soil-moisture probes calibrated per soil type (two-point: dry and saturated); leaf thermistors averaged over a minute; nitrate electrodes drift and need daily recalibration | a 0.5 °C bias in leaf temperature looks like plant stress; the cure is calibration, not averaging |
| 🧬 Biology & human health | glucose strips coded per batch (gain calibration); continuous glucose monitors recalibrated against finger pricks; pulse oximeters average 4–8 heartbeats | the LOD of a diagnostic test is a 3σ statement about the blank, which is why tests are run with controls |
| 🌍 Environment | low-cost CO₂ and NO₂ sensors drift with temperature and humidity and are co-located with reference stations to fit corrections; particle counters averaged over an hour | cheap sensor networks are useful only after the drift model is calibrated |
| 🤖 Robotics & drones | gyro bias measured at start-up while the drone sits still; accelerometer six-position calibration (a sphere of radius 1 g); Allan deviation decides the IMU grade | a 0.5 °/s uncorrected gyro bias becomes a 30° heading error in a minute |
| 🚗 Cars | TPMS and engine pressure sensors carry factory temperature-compensation tables; the steering-angle sensor is zeroed after an alignment | without temperature compensation a cold morning looks like a flat tyre |
| 📱 Phones & photography | compass hard/soft-iron calibration (the figure-eight wave); camera dark-frame subtraction removes fixed-pattern offset; night mode averages many frames ($1/\sqrt M$) | averaging 16 frames gives 4× less noise, which is why night photos need a steady hand |
| 🏠 Home & household | the tare button of a kitchen scale (offset); scales averaging until "stable"; smoke detectors self-calibrate their baseline as dust collects | tare removes bias, the "stable" icon is averaging, and baseline tracking is drift correction |

## Derivation

**(a) Variance of a mean, $\sigma_n/\sqrt M$.**
1. Readings $y_i=s+n_i$, with $n_i$ independent, mean 0, variance $\sigma_n^2$.
2. Mean $\bar y=s+\frac1M\sum_i n_i$, so $\bar y$ has mean $s$.
3. Independent variances add: $\operatorname{Var}(\sum_i n_i)=M\sigma_n^2$.
4. Scaling by $1/M$ scales a variance by $1/M^2$: $\operatorname{Var}(\bar y)=\sigma_n^2/M$.
5. Standard deviation $\sigma_n/\sqrt M$. A bias $b$ added to each reading gives mean $s+b$: unchanged by averaging.

**(b) Least-squares line.**
1. Minimise $J=\sum_i(y_i-y_0-Ss_i)^2$ over $y_0$ and $S$.
2. $\partial J/\partial y_0=0$: $\sum(y_i-y_0-Ss_i)=0$, i.e. $y_0=\bar y-S\bar s$.
3. Substitute: $J=\sum\big((y_i-\bar y)-S(s_i-\bar s)\big)^2$.
4. $\partial J/\partial S=0$: $S=\sum(s_i-\bar s)(y_i-\bar y)/\sum(s_i-\bar s)^2$.
5. With two points this reduces to the two-point formula $S=(y_2-y_1)/(s_2-s_1)$.

**(c) Johnson noise from equipartition (sketch).**
1. A resistor $R$ with a capacitor $C$ across it: thermal equilibrium gives the capacitor energy $\tfrac12C\langle v^2\rangle=\tfrac12k_BT$.
2. So $\langle v^2\rangle=k_BT/C$, independent of $R$.
3. The RC filter's noise bandwidth is $\int_0^\infty\lvert H\rvert^2df=\frac{\pi}{2}f_c=\frac{1}{4RC}$ (A7).
4. If the resistor's noise density is $e^2$ (V²/Hz), then $\langle v^2\rangle=e^2/(4RC)$.
5. Equate: $e^2/(4RC)=k_BT/C$ ⇒ $e^2=4k_BTR$, so $v_n=\sqrt{4k_BTR\Delta f}$.

**(d) Shot noise (sketch).**
1. In time $t_0$, a current $I$ carries on average $\bar k=It_0/q_e$ electrons, arriving independently (Poisson), so the count fluctuates by $\sqrt{\bar k}$.
2. Current fluctuation: $q_e\sqrt{\bar k}/t_0=\sqrt{q_eI/t_0}$.
3. Averaging over $t_0$ is a bandwidth $\Delta f=1/(2t_0)$: $i_n=\sqrt{2q_eI\Delta f}$.
4. Relative noise $i_n/I=\sqrt{2q_e\Delta f/I}$ falls as $1/\sqrt I$: more light, relatively less noise.

**(e) Resolution and LOD.**
1. Small-signal output change: $\Delta y=S\,\Delta s$.
2. It is visible when $\Delta y\gtrsim\sigma_n$, so $\Delta s_{\min}=\sigma_n/S$.
3. "Present at all" with false-alarm probability about 0.1% (one-sided $3\sigma$): $\mathrm{LOD}=3\sigma_n/S$.

**(f) Allan deviation shape.**
1. White noise $\sigma_n$ per sample at rate $f_s$: averages over $T_{\text{av}}$ contain $M=f_sT_{\text{av}}$ samples, so the white part is $\sigma_n/\sqrt{f_sT_{\text{av}}}$.
2. A bias that random-walks with strength $K_b$ adds a part that grows: $\sigma_A^2=\dfrac{\sigma_n^2}{f_sT_{\text{av}}}+\dfrac{K_b^2T_{\text{av}}}{3}$.
3. Minimum where the derivative is zero: $T_{\text{av}}^*=\sqrt{3\sigma_n^2/f_s}/K_b$.
4. With $\sigma_n=0.1$ °/s, $f_s=100$ Hz, $K_b=10^{-4}$ °/s/√s: $T_{\text{av}}^*=173$ s, $\sigma_A=0.0011$ °/s.

**(g) Ellipsoid to sphere.**
1. Readings $\mathbf m=A_{\text{si}}\mathbf B_E+\mathbf m_0$ with $\lvert\mathbf B_E\rvert=50$ µT.
2. Then $\mathbf B_E=A_{\text{si}}^{-1}(\mathbf m-\mathbf m_0)$, and $\lvert\mathbf B_E\rvert^2=$ const gives $(\mathbf m-\mathbf m_0)^{\mathsf T}\mathsf Q'(\mathbf m-\mathbf m_0)=1$, an ellipsoid, with $\mathsf Q'=A_{\text{si}}^{-\mathsf T}A_{\text{si}}^{-1}/50^2$.
3. Expanded, it is $\mathbf m^{\mathsf T}\mathsf Q\mathbf m+2\mathbf d^{\mathsf T}\mathbf m=1$: linear in the 9 unknowns, so it is a least-squares fit like (b).
4. Centre: the gradient $2\mathsf Q\mathbf m+2\mathbf d$ vanishes at $\mathbf m_0=-\mathsf Q^{-1}\mathbf d$.
5. Diagonalise $\mathsf Q'=\mathsf V\Lambda\mathsf V^{\mathsf T}$; then $\mathbf m_{\text{cal}}=50\,\mathsf V\Lambda^{1/2}\mathsf V^{\mathsf T}(\mathbf m-\mathbf m_0)$ has length 50 µT for every reading.

## Worked check

**Johnson noise.** $4k_BT=4\times1.380649\times10^{-23}\times300=1.6568\times10^{-20}$ J. Times $R\Delta f=10^4\times10^4=10^8$:
$1.6568\times10^{-12}$ V². Square root: $v_n=1.287$ µV ✓. Averaging $M=100$ independent readings lowers it to 128.7 nV.

**Two-point calibration.** $y_0=0.3$ kg, $S=(70.9-0.3)/70.0=1.00857$. Raw 82.0 kg: $(82.0-0.3)/1.00857=81.01$ kg ✓.

**LOD.** $3\times0.3$ nA $/\ 2$ nA/mM $=0.45$ mM ✓. (All numbers: `scripts/checks/A8_check.py`.)

## Whiteboard plan

- **Panel 1: two kinds of error.** Four targets: tight and centred, tight and off, loose and centred, loose and off. Label the axes
  "precision" (spread) and "accuracy" (offset). Write "calibration fixes the offset; averaging fixes the spread".
- **Panel 2: the bell curve.** A Gaussian with ±σ, ±2σ, ±3σ marks: 68%, 95%, 99.7%. Write "rms = σ for zero-mean noise".
- **Panel 3: three noises.** A resistor with jittering electrons → $\sqrt{4k_BTR\Delta f}$; raindrops on a roof → $\sqrt{2q_eI\Delta f}$; a
  log-log noise plot that rises at low $f$ (1/f) and flattens (white) with the corner marked.
- **Panel 4: averaging.** A noisy trace, a smooth running mean, and $\sigma/\sqrt M$ with "4× samples → ½ noise". Show the slow
  response to a step. Then $\Delta s_{\min}=\sigma_n/S$, $\mathrm{LOD}=3\sigma_n/S$.
- **Panel 5: calibration.** Scatter of known $s$ vs measured $y$, the fitted line, its intercept $y_0$ and slope $S$, and
  $s=(y-y_0)/S$. Beside it a thermometer and "drift: $y_0(T)$".
- **Panel 6: the 3D compass.** An offset, tilted egg next to a centred ball. Arrows: subtract centre, rotate, scale, rotate back.

## Common mistakes and where the intuition breaks

- **Averaging a bias away.** No number of readings removes an offset that is in every reading. Averaging gives you a very precise wrong answer.
- **Averaging correlated noise.** The $1/\sqrt M$ law needs *independent* samples. Samples taken faster than the filter's time constant
  (A7) are almost copies of each other; 1/f noise and drift are correlated over long times. That is exactly what the Allan deviation shows.
- **Confusing resolution with accuracy.** A display with 0.01 g digits on a kitchen scale is not 0.01 g accurate; resolution is about noise,
  accuracy about calibration.
- **Calibrating outside the conditions of use.** A sensor calibrated at 20 °C carries a temperature-dependent offset elsewhere. Calibrate
  over the range you need, or model the drift.
- **Two points when the sensor is not linear.** A two-point line through a curved response is exact at the two points and wrong in the
  middle. Use more points, check the residuals, and fit a curve if they show a pattern.
- **Mixing up rms, peak and peak-to-peak.** For Gaussian noise, peak-to-peak on a scope is about $6\sigma_n$; for a sine, rms = amplitude/√2.
- **Where the Gaussian picture breaks.** Real sensors also produce rare large spikes (a cosmic ray on a pixel, a dropped bit, a bump on
  the table). A single outlier can wreck a least-squares fit; robust methods (median, discarding points beyond 3σ) are then better.

## Remember

**"Bias needs calibration, noise needs averaging, and averaging only buys 1/√M while time and drift keep score."**

## Self-test

1. A thermistor bridge has 2 µV rms noise in its bandwidth and a sensitivity of 400 µV/°C. What is its resolution in °C, and how many readings must you average to resolve 0.001 °C?
   <details><summary>Answer</summary>Resolution = 2/400 = 0.005 °C. To reach 0.001 °C you need 5 times less noise, so M = 25 independent readings (as long as drift stays smaller than 0.001 °C over that time).</details>
2. A pH sensor reads 4.12 in a pH 4.00 buffer and 7.18 in a pH 7.00 buffer. Find the offset and the gain, and correct a reading of 5.60.
   <details><summary>Answer</summary>Gain S = (7.18 − 4.12)/(7.00 − 4.00) = 1.02. Offset: y0 = 4.12 − 1.02 × 4.00 = 0.04. Corrected pH = (5.60 − 0.04)/1.02 = 5.45.</details>
3. Your phone compass points 30° wrong near a laptop, but is fine in the park. Hard iron or soft iron, and why does the figure-eight wave not fix it permanently?
   <details><summary>Answer</summary>The laptop's magnets add a field that the phone did not carry when it was calibrated, so it acts like a new external offset. Calibration only removes distortions that move with the phone (its own hard and soft iron); a field from outside that changes from place to place cannot be calibrated away and has to be detected (for example because the measured length is no longer 50 µT) and ignored, using the gyro instead (A9).</details>

**Next:** [A9 Sensor fusion and the Kalman filter](A9-sensor-fusion-and-the-kalman-filter.md) — when every sensor has its own noise and drift, the best answer comes from combining them, each weighted by how much it can be trusted.
