# B4. MEMS inertial sensors: accelerometers and gyroscopes

> **Connects:** builds on [B3 Micromechanics](B3-micromechanics-beams-springs-and-resonators.md) (spring–mass, $\omega_0$, $Q_f$), [A3 Capacitive sensors](A3-capacitive-sensors.md) (differential capacitors), [A8 Noise, resolution, calibration and drift](A8-noise-resolution-calibration-and-drift.md), [B1 Scaling laws](B1-scaling-laws-why-small-is-different.md) · used by [B5 MEMS microphones, pressure sensors and actuators](B5-mems-microphones-pressure-sensors-and-actuators.md), [A9 Sensor fusion and the Kalman filter](A9-sensor-fusion-and-the-kalman-filter.md), [C5 Lab-on-a-chip and integrated systems](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md)

## Hook — a ball on a spring in a box, and a merry-go-round

Hang a ball from a spring inside a closed cardboard box. Jerk the box upward and the ball sinks toward the floor of the
box; brake a lift and it floats up; tip the box over and the ball sags toward whichever wall is now "down". You never
see the outside world, yet by watching *where the ball sits inside the box* you know how the box is accelerating and
which way it is tilted. That is an accelerometer.

Now stand on a spinning merry-go-round and roll a ball straight toward a friend on the other side. To you, the ball
curves away sideways, although nobody pushed it. That sideways "push" is the **Coriolis effect**, and its size is
proportional to how fast the merry-go-round turns. Keep a mass *moving* inside a chip, watch for a sideways push, and you
have a gyroscope.

Your phone contains both, each smaller than a grain of sand. They rotate the screen when you turn it, count your steps,
fire a car's airbag in 20 ms, and keep a drone level in the wind.

## The idea in plain words

**A proof mass on springs.** Etch a block of silicon, the **proof mass** $m$, and hang it from thin folded beams, the
**springs** with stiffness $k$, inside a fixed silicon frame (B2 makes this, B3 tells you its stiffness). When the frame
accelerates with acceleration $a$, the mass only gets dragged along by the springs, so the springs must stretch until
they supply the force $F=ma$. At rest in the moving frame, Hooke's law balances Newton's law:
$$kx=ma\quad\Longrightarrow\quad x=\frac{m}{k}\,a=\frac{a}{\omega_0^2},\qquad \omega_0=\sqrt{k/m}.$$
Here $x$ is how far the mass shifts relative to the frame (along the **sense axis**), and $\omega_0=2\pi f_0$ is the
natural angular frequency of the spring–mass. The mass moves *opposite* to the frame's acceleration: it lags behind.

**The great trade-off: sensitivity against bandwidth.** The formula $x=a/\omega_0^2$ contains only one design number,
$\omega_0$. A soft spring (low $f_0$) gives a big, easy-to-read shift, but the sensor can only follow motions slower
than about $f_0$, because above resonance the mass cannot keep up. A stiff spring (high $f_0$) follows fast crashes
and vibrations, but moves so little that reading it is hard. Halving $f_0$ gives four times the signal and half the
bandwidth. Every accelerometer is a choice on this line: a phone's screen-rotation sensor sits at a few kHz, an airbag
sensor at tens of kHz.

**Reading nanometres with a differential comb.** The mass carries rows of **fingers**. Each moving finger sits between two
fixed fingers, one on each side, with rest gap $g_0$ and facing area $A$. That makes two capacitors (A3):
$$C_1=\frac{\varepsilon_0A}{g_0-x},\qquad C_2=\frac{\varepsilon_0A}{g_0+x}.$$
When the mass shifts, one gap closes and the other opens. The difference
$C_1-C_2\approx 2C_0\,x/g_0$ (with $C_0=\varepsilon_0A/g_0$) is twice the single change, and anything that changes both
capacitors equally (temperature, humidity, the absolute value of $C_0$) cancels. This is the "divide to compare" thread of
the notebook: a Wheatstone bridge (A2), now made of capacitors. Drive the two outer electrodes with $+V_{\text{ex}}$ and
$-V_{\text{ex}}$ and read the middle one: the output is exactly
$$V_{\text{out}}=V_{\text{ex}}\frac{C_1-C_2}{C_1+C_2}=V_{\text{ex}}\frac{x}{g_0},$$
linear in $x$ even for big shifts. The whole chain is: acceleration → force → displacement → capacitance → voltage, and
the sensitivity is the product of the four gains (the first convention in notation.md).

```viz
b4-accelerometer-3d
```

**What an accelerometer really reads: gravity included.** The spring cannot tell the difference between "the frame is
being pushed up at 1 g" and "the frame sits still on a table while gravity pulls the mass down". Einstein made a whole
theory of this. So an accelerometer at rest reads 1 g *upward*, and the reading along each axis is the component of that
vector. If the phone is pitched by an angle $\theta_p$ (nose up) and rolled by $\phi_r$ (right side up), the three axes read
$$(a_x,a_y,a_z)=g_{\text{grav}}\,(\sin\theta_p,\;\cos\theta_p\sin\phi_r,\;\cos\theta_p\cos\phi_r),$$
where $g_{\text{grav}}=9.81$ m/s² (bare $g$ is a gap in this notebook). Invert it:
$$\theta_p=\operatorname{atan2}\!\big(a_x,\sqrt{a_y^2+a_z^2}\big),\qquad \phi_r=\operatorname{atan2}(a_y,a_z).$$
That is how a phone rotates its screen, how a spirit-level app works and how a drone knows which way is down. The catch:
the formula assumes the phone is not accelerating. A drone that swerves, or a car that brakes, fools it, which is why
accelerometers are paired with gyroscopes. (Sign conventions for pitch and roll vary between companies; the idea does not.)

**A gyroscope that does not spin.** Old gyroscopes were spinning wheels; MEMS ones are **vibrating masses**. A comb drive
shakes the mass back and forth along $x$ at its resonance (the **drive mode**), so it always has a velocity
$\dot x=\omega_dX_d\cos\omega_dt$, where $X_d$ is the drive amplitude and $\omega_d$ the drive frequency. If the chip
rotates at rate $\Omega$ about the axis perpendicular to the chip, then, seen from inside the chip, the moving mass feels the
**Coriolis force**
$$\mathbf F=-2m\,\boldsymbol\Omega\times\mathbf v,\qquad \lvert F\rvert=2m\,\Omega\,\dot x,$$
at right angles to both the rotation axis and the velocity. It pushes the mass sideways along $y$, the **sense mode**.
Because $\dot x$ flips sign every half cycle, the force wiggles at $\omega_d$ with an amplitude proportional to $\Omega$.
The chip reads that sideways wiggle with capacitor plates and multiplies it by a reference locked to the drive
(**demodulation**, a lock-in amplifier, A7), which turns the 20 kHz wiggle into a steady number proportional to $\Omega$,
with its sign. No rotation, no wiggle: that is why the mass must keep moving.

**Mode matching.** The sense mode is itself a spring–mass with its own natural frequency $\omega_s$. If $\omega_s$ is far
from $\omega_d$, the Coriolis force only nudges it statically, $y\approx F/k_s$. If you tune $\omega_s$ close to
$\omega_d$, resonance amplifies the response (B3), up to $Q_f$ times when the two modes are **matched**. More signal, but
the same rule as before bites: a resonance with quality factor $Q_f$ needs about $Q_f$ cycles to build up, so the
bandwidth shrinks to about $f_d/(2Q_f)$. Consumer gyros keep the modes a few hundred hertz to a kilohertz apart;
navigation-grade ones match them and use feedback to regain bandwidth.

```viz
b4-gyro-3d
```

**The IMU: six (or nine) numbers.** An **inertial measurement unit** packs three accelerometer axes and three gyroscope axes
into one package of about $3\times3\times1$ mm, often with a three-axis magnetometer (A4) as a compass, the "9-axis" IMU.
Accelerometers give tilt (but are fooled by acceleration); gyros give rate of turn (but drift); the magnetometer gives
heading (but is fooled by steel and motors). Combining them is sensor fusion (A9).

**Bias, noise density and drift.** Two numbers on every datasheet decide how good an inertial sensor is (A8):
- the **bias** ($\Omega_b$ for a gyro, $a_b$ for an accelerometer), the reading with no input (a gyro reading 0.05 °/s while lying still, an accelerometer reading 1 mg on
  a level table). It changes with temperature and time, so it can only be partly calibrated away;
- the **noise density**, in µg/√Hz for accelerometers and (°/s)/√Hz for gyros: the rms noise in a 1 Hz bandwidth.
  The rms noise in a bandwidth $\Delta f$ is the density times $\sqrt{\Delta f}$.

Bias hurts most when you **integrate**. A gyro gives the *rate* of turn; the angle is its integral, so a constant bias $\Omega_b$
becomes an angle error $\Omega_b\,t$ that grows forever, and white noise with density $N_\Omega$ adds a random walk of
size $N_\Omega\sqrt t$ (the **angle random walk**, usually quoted as $60N_\Omega$ in °/√h). Position from an accelerometer
is a double integral, so a bias $a_b$ gives a position error $\tfrac12 a_b\,t^2$: a disaster within a minute. That is why a phone cannot
track your position from its IMU alone, and why every drone fuses the gyro with something that does not drift.

```viz
b4-drift
```

**Why tiny is good, and where it stops (B1).** A smaller proof mass makes a higher $f_0$ for the same spring, so it
moves less; but the thermal jiggling of the mass by air molecules (Brownian noise) grows as the mass shrinks:
the noise floor is $a_n=\sqrt{4k_BT\omega_0/(mQ_f)}$ per √Hz. Shrinking $m$ by 10 raises the floor by $\sqrt{10}$. That is the
fundamental limit of a microgram proof mass, and the reason high-end accelerometers use bigger masses and vacuum
packaging.

## Intuitive examples

1. **The phone accelerometer by numbers.** A proof mass of $m=1$ µg with $f_0=3$ kHz has $\omega_0=18\,850$ rad/s and
   $k=m\omega_0^2=0.355$ N/m (softer than a hair on a comb). One g moves it $x=9.81/(3.553\times10^8)=27.6$ nm, about
   117 silicon atoms side by side. One milli-g moves it 27.6 pm, a fraction of an atom's diameter, which works because the capacitor
   averages over a huge area.
2. **The trade-off in one row.** $x$ per g for $f_0=1$, $3$, $10$, $30$ kHz: $248$ nm, $27.6$ nm, $2.48$ nm, $0.28$ nm.
   Ten times the bandwidth costs a hundred times the signal.
3. **Tilt.** A phone held with readings $(a_x,a_y,a_z)=(0,\;0.5,\;0.866)$ g is rolled by $\operatorname{atan2}(0.5,0.866)=30.0°$;
   readings $(-0.259,\;0,\;0.966)$ g mean a pitch of $-15.0°$. With 100 µg/√Hz and a 100 Hz bandwidth, the noise is
   1.0 mg rms, a tilt resolution of 0.057°. A single axis loses accuracy near vertical: the same 1 mg is $0.057°$ at
   level, $0.081°$ at 45° and $0.330°$ at 80°, because $\sin\theta_p$ flattens out. Use all three axes.
4. **The Brownian floor.** For $m=1$ µg, $f_0=3$ kHz, $Q_f=1$ (air damping) at 25 °C ($k_BT=4.12\times10^{-21}$ J):
   $a_n=5.57\times10^{-4}$ m/s²/√Hz $=57$ µg/√Hz, or 0.57 mg rms over 100 Hz. Real consumer parts quote about
   100–200 µg/√Hz: they are within a factor of a few of physics.
5. **Integrating a bias.** A gyro bias of 0.05 °/s gives 0.5° after 10 s, 3.0° after a minute and 30.0° after 10 min. A
   noise density of 0.01 (°/s)/√Hz adds a random walk of only 0.10° after 100 s (0.6 °/√h). An accelerometer bias of 1 mg
   integrated twice gives 0.005 m after 1 s, 0.49 m after 10 s and 17.7 m after a minute.
6. **Airbag.** A car hitting a wall at 50 km/h (13.89 m/s) and stopping in 0.1 s decelerates on average at 139 m/s² $=14.2$ g,
   with peaks several times higher. In the first 20 ms, while the controller decides, the speed already drops by 2.78 m/s.
   An airbag accelerometer with $f_0=20$ kHz moves only 31.1 nm at 50 g, so it does not slam into its stops.
7. **Image stabilisation.** Your hand shakes a phone by about 0.05° at a few hertz. With a 4.3 mm focal length, the image
   moves $4.3\text{ mm}\times0.05°\times\pi/180=3.75$ µm, about 3.1 pixels of 1.2 µm: a visibly blurred photo in a 1/15 s
   exposure. The gyro measures the shake and the lens is shifted back (B5).

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $m\ddot x+b\dot x+kx=-ma$ | proof mass in an accelerating frame | $x$ shift relative to frame, $b$ damping |
| $x=\dfrac{ma}{k}=\dfrac{a}{\omega_0^2}$ (for $f\ll f_0$) | static deflection: sensitivity $\propto 1/\omega_0^2$ | $\omega_0=\sqrt{k/m}=2\pi f_0$ |
| $C_{1,2}=\dfrac{\varepsilon_0A}{g_0\mp x}$, $\;C_1-C_2\approx2C_0\dfrac{x}{g_0}$ | differential comb readout | $g_0$ rest gap, $A$ finger area, $C_0=\varepsilon_0A/g_0$ |
| $V_{\text{out}}=V_{\text{ex}}\dfrac{C_1-C_2}{C_1+C_2}=V_{\text{ex}}\dfrac{x}{g_0}$ | capacitive half-bridge, exactly linear | $V_{\text{ex}}$ drive amplitude |
| $\theta_p=\operatorname{atan2}\big(a_x,\sqrt{a_y^2+a_z^2}\big)$, $\;\phi_r=\operatorname{atan2}(a_y,a_z)$ | tilt from gravity (no acceleration) | $\theta_p$ pitch, $\phi_r$ roll |
| $\mathbf F=-2m\,\boldsymbol\Omega\times\mathbf v$, $\;\lvert F\rvert=2m\Omega\dot x$ | Coriolis force on the driven mass | $\Omega$ rotation rate, $\dot x=\omega_dX_d\cos\omega_dt$ |
| $y=\dfrac{F}{m\sqrt{(\omega_s^2-\omega_d^2)^2+(\omega_s\omega_d/Q_f)^2}}$ | sense-mode response | $\omega_s$ sense, $\omega_d$ drive frequency |
| matched: $y=Q_fF/k$, bandwidth $\approx f_d/(2Q_f)$ | mode matching: signal vs speed | $Q_f$ quality factor |
| $a_n=\sqrt{4k_BT\omega_0/(mQ_f)}$ | Brownian noise floor (per √Hz) | $k_B$, $T$ |
| $\theta_{\text{err}}=\Omega_b\,t\pm N_\Omega\sqrt t$; $\;x_{\text{err}}=\tfrac12 a_b\,t^2$ | integrated bias and noise | $\Omega_b$, $a_b$ biases; $N_\Omega$ gyro noise density |

## Applications

| World | Inertial sensing | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | tilt and sway loggers strapped to tree trunks and crop stems; IMUs on tractors, sprayer booms and grazing-cow collars | how wind loads trees (wind-throw risk), lodging of cereals, auto-steering to 2 cm, animal activity and rumination |
| 🧬 Biology & human health | step counters, fall detectors, tremor monitors (Parkinson tremor at 4–6 Hz), sleep trackers, gait labs | daily activity, falls in the elderly, how a treatment changes a tremor, posture and gait asymmetry |
| 🌍 Environment | low-cost MEMS seismometers, bridge and building health monitors, wave buoys, avalanche beacons | earthquake early warning from dense networks, ageing of structures, wave height and period |
| 🤖 Robotics & drones | the IMU in every flight controller, gyro-stabilised gimbals, legged-robot balance, pedestrian dead reckoning | attitude at 1–8 kHz for the control loop; drift-free once fused with GPS, barometer and camera (A9) |
| 🚗 Cars | airbag crash sensors (±50 to ±200 g), stability-control yaw-rate gyros, rollover detection, tunnel navigation | when to fire an airbag within ~20 ms; whether the car is skidding; position where GPS is lost |
| 📱 Phones & photography | screen rotation, step counting, gyro-based optical and electronic image stabilisation, AR and games | which way is up; how much the hand shook during the exposure, so the lens or crop can undo it |
| 🏠 Home & household | washing-machine imbalance detection, laptop free-fall detection that parks the disk head, game controllers, smart-lock knock sensing | stop the spin before the drum walks; save the disk in the 0.3 s of a fall |

## Derivation

**(a) The accelerometer as a spring–mass in a moving frame.**
1. Let the frame be at position $u(t)$ and the mass at $u+x$. Newton on the mass: $m(\ddot u+\ddot x)=-kx-b\dot x$.
2. Call the frame's acceleration $a=\ddot u$: $m\ddot x+b\dot x+kx=-ma$. The frame's acceleration acts like a force $-ma$.
3. For slow inputs (frequency $\ll f_0$) the mass is in equilibrium: $\ddot x,\dot x\approx0$, so $x=-ma/k$.
4. With $k=m\omega_0^2$: $\lvert x\rvert=a/\omega_0^2$. The mass is gone from the result; only $\omega_0$ remains.
5. For a sinusoidal input at $\omega$, $\lvert x\rvert=\dfrac{a/\omega_0^2}{\sqrt{(1-\omega^2/\omega_0^2)^2+(\omega/(Q_f\omega_0))^2}}$: flat below $\omega_0$, falling as $1/\omega^2$ above. That is the bandwidth.

**(b) Differential capacitors.**
1. $C_1=\dfrac{\varepsilon_0A}{g_0-x}$, $C_2=\dfrac{\varepsilon_0A}{g_0+x}$.
2. $C_1-C_2=\varepsilon_0A\dfrac{(g_0+x)-(g_0-x)}{g_0^2-x^2}=\dfrac{2\varepsilon_0A\,x}{g_0^2-x^2}\approx2C_0\dfrac{x}{g_0}$ for $x\ll g_0$.
3. $C_1+C_2=\dfrac{2\varepsilon_0A\,g_0}{g_0^2-x^2}$.
4. Ratio: $\dfrac{C_1-C_2}{C_1+C_2}=\dfrac{x}{g_0}$ exactly: the $1/(g_0^2-x^2)$ nonlinearity cancels.
5. The middle electrode between $+V_{\text{ex}}$ (via $C_1$) and $-V_{\text{ex}}$ (via $C_2$) settles where the charges balance: $V_{\text{out}}=V_{\text{ex}}\dfrac{C_1-C_2}{C_1+C_2}=V_{\text{ex}}\dfrac{x}{g_0}$.

**(c) Tilt from gravity.**
1. At rest the accelerometer reads the "up" vector of length $g_{\text{grav}}$, written in the chip's axes.
2. Roll by $\phi_r$ about $x$, then pitch by $\theta_p$ about $y$: the up vector in chip axes is $g_{\text{grav}}(\sin\theta_p,\;\cos\theta_p\sin\phi_r,\;\cos\theta_p\cos\phi_r)$.
3. $a_y/a_z=\tan\phi_r$, so $\phi_r=\operatorname{atan2}(a_y,a_z)$.
4. $a_y^2+a_z^2=g_{\text{grav}}^2\cos^2\theta_p$, so $\tan\theta_p=a_x/\sqrt{a_y^2+a_z^2}$.
5. Sensitivity of one axis: $da_x/d\theta_p=g_{\text{grav}}\cos\theta_p$, which goes to zero at 90°: a 1 mg error costs $1\text{ mrad}/\cos\theta_p$.

**(d) Coriolis force on a vibrating mass.**
1. In a frame rotating at $\boldsymbol\Omega$, Newton's law gains the term $-2m\,\boldsymbol\Omega\times\mathbf v$ (plus a centrifugal term $\propto\Omega^2$, negligible here).
2. Drive: $x=X_d\sin\omega_dt$, so $\mathbf v=\omega_dX_d\cos(\omega_dt)\,\hat{\mathbf x}$.
3. With $\boldsymbol\Omega=\Omega\hat{\mathbf z}$: $\hat{\mathbf z}\times\hat{\mathbf x}=\hat{\mathbf y}$, so $\mathbf F=-2m\Omega\omega_dX_d\cos(\omega_dt)\,\hat{\mathbf y}$.
4. The sense mode obeys $m\ddot y+b_s\dot y+k_sy=F_y$, a driven oscillator at $\omega_d$ (B3).
5. Its amplitude is $y=F/\big(m\sqrt{(\omega_s^2-\omega_d^2)^2+(\omega_s\omega_d/Q_f)^2}\big)$; at $\omega_s=\omega_d$ this is $Q_fF/(m\omega_d^2)=Q_fF/k$.
6. Multiply $y(t)$ by a reference in phase with $F$ and average: the result is $\propto\Omega$, sign included.

**(e) Integrating errors.**
1. Gyro: $\theta_{\text{meas}}(t)=\int_0^t(\Omega+\Omega_b+n_\Omega)\,dt'$, so the error is $\Omega_b\,t+\int_0^tn_\Omega\,dt'$ ($n_\Omega$ = rate noise).
2. Sample the rate every $\Delta t$: each sample has noise variance $N_\Omega^2/\Delta t$ (density squared times bandwidth $1/\Delta t$). The angle adds $t/\Delta t$ such samples, each multiplied by $\Delta t$; variances add (A8): $\frac{t}{\Delta t}\cdot\frac{N_\Omega^2}{\Delta t}\cdot\Delta t^2=N_\Omega^2t$, so the spread is $N_\Omega\sqrt t$.
3. Accelerometer to position: $x_{\text{err}}=\int\!\!\int a_b\,dt\,dt=\tfrac12 a_b\,t^2$.

## Worked check

**The accelerometer** ($m=1$ µg, $f_0=3$ kHz, 20 fingers per side, overlap 100 µm × 20 µm, $g_0=2$ µm, $V_{\text{ex}}=1$ V):
- $\omega_0=2\pi\cdot3000=18\,850$ rad/s, $\omega_0^2=3.553\times10^8$ s⁻², $k=10^{-9}\cdot3.553\times10^8=0.355$ N/m.
- $x=9.81/3.553\times10^8=2.761\times10^{-8}$ m $=27.6$ nm per g; $x/g_0=0.0138$.
- $A=20\times100\,\mu\text{m}\times20\,\mu\text{m}=4.0\times10^{-8}$ m², $C_0=8.854\times10^{-12}\cdot4\times10^{-8}/2\times10^{-6}=177$ fF.
- $C_1=179.56$ fF, $C_2=174.67$ fF, $C_1-C_2=4.89$ fF per g (linear estimate $2C_0x/g_0=4.89$ fF ✓). One milli-g: 4.9 aF.
- $V_{\text{out}}=1\text{ V}\times0.0138=13.8$ mV per g, the same from $(C_1-C_2)/(C_1+C_2)$ ✓.

**The gyroscope** ($m=1$ µg, $f_d=20$ kHz, $X_d=10$ µm, $\Omega=100$ °/s):
- $v_{\max}=2\pi\cdot20\,000\cdot10^{-5}=1.257$ m/s; $\Omega=1.7453$ rad/s.
- $F=2\cdot10^{-9}\cdot1.7453\cdot1.257=4.39$ nN, 0.447 times the mass's own weight (9.81 nN).
- Sense mode at 21 kHz: $k_s=17.4$ N/m, static $F/k_s=0.252$ nm; with the drive at 20 kHz, $y=F/(m\lvert\omega_s^2-\omega_d^2\rvert)=2.71$ nm (×10.76). Per 1 °/s: 27.1 pm.
- Matched with $Q_f=1000$: $y=278$ nm, but bandwidth $20\,000/2000=10$ Hz.

All numbers come from `scripts/checks/B4_check.py`.

## Whiteboard plan

- **Panel 1 — ball in a box.** Draw a box, a ball on two springs, an arrow "box accelerates →" and the ball shifted ←.
  Write $kx=ma$ ⇒ $x=a/\omega_0^2$. Say: "The only design number is $\omega_0$."
- **Panel 2 — the trade-off.** A log–log sketch: $x$ per g falls as $1/f_0^2$, bandwidth rises as $f_0$. Mark "phone, 3 kHz,
  28 nm" and "airbag, 20 kHz, 0.62 nm/g". Say: "Ten times faster costs a hundred times the signal."
- **Panel 3 — the comb.** One moving finger between two fixed ones, gaps $g_0-x$ and $g_0+x$. Write $C_1,C_2$, then
  $V_{\text{out}}=V_{\text{ex}}x/g_0$. Circle "fF per g, aF per mg".
- **Panel 4 — tilt.** A tilted phone, the up-vector of 1 g split into $a_x$, $a_y$, $a_z$; write the two atan2 formulas.
  Add a car braking: "this fools it".
- **Panel 5 — the merry-go-round.** Top view: a mass shuttling left–right on a turning disc, sideways arrows
  alternating. Write $\mathbf F=-2m\boldsymbol\Omega\times\mathbf v$; "4.4 nN at 100 °/s".
- **Panel 6 — drift.** Angle error vs time: a straight line $\Omega_b\,t$ with a fuzzy $\pm N_\Omega\sqrt t$ band, and a flat jittery
  accelerometer trace. Say: "the gyro is good now, the accelerometer is good on average: fuse them (A9)."

## Common mistakes and where the intuition breaks

- **"An accelerometer at rest reads zero."** It reads 1 g upward. Free fall reads zero: that is how laptops detect a drop.
- **Using tilt formulas while accelerating.** atan2 of the readings is only the tilt when the device is not accelerating.
  A car braking at 0.3 g looks like a 16.7° pitch.
- **Forgetting $x$ is tiny.** At 27.6 nm per g, a 1 mg resolution means 28 pm; packaging stress, temperature and
  electrostatic forces from the readout itself are all larger than that, and must be cancelled by symmetry (differential
  design) and calibration (A8).
- **"Higher $Q_f$ is always better."** In an accelerometer a high $Q_f$ means ringing after every bump, so they are
  deliberately air-damped near $Q_f\approx0.5$–1. In a gyro, high $Q_f$ gives signal but costs bandwidth.
- **Mixing up rate and angle.** A gyro measures $\Omega$ (°/s), not the angle. The angle needs integration, and integration
  turns any bias into a ramp.
- **The Coriolis sign.** It is $-2m\boldsymbol\Omega\times\mathbf v$ (equivalently $2m\,\mathbf v\times\boldsymbol\Omega$);
  getting it wrong flips the reported direction of turn. The magnitude $2m\Omega\dot x$ is what sizes the chip.
- **Where the intuition breaks:** the "ball in a box" picture assumes the input is slow. Near $f_0$ the mass resonates
  and the reading is wrong by up to $Q_f$ times; above $f_0$ it hardly moves at all. Vibration near $f_0$ (a drone's
  propellers, a car engine) can be rectified into a false DC reading, which is why sensors sit on rubber mounts and why
  datasheets list "vibration rectification error".

## Remember

**"$x=a/\omega_0^2$ and $V_{\text{out}}=V_{\text{ex}}x/g_0$; gravity is part of the reading; a gyro reads $2m\Omega\dot x$ and integration turns bias into drift."**

## Self-test

1. An accelerometer is redesigned from $f_0=2$ kHz to $f_0=6$ kHz with the same gap and capacitors. By what factor does its output per g change, and why might the designer accept that?
   <details><summary>Answer</summary>x = a/ω0², so tripling f0 divides the deflection and the output by 9. The designer gains three times the bandwidth (it can follow faster events such as crashes or vibration) and a stiffer, more robust structure that is less likely to stick to its stops after a shock.</details>
2. A phone lying flat reads (a_x, a_y, a_z) = (0, 0, 1) g. It is then held so that it reads (0.5, 0, 0.866) g. What is its pitch, and what would a single x-axis accelerometer with 1 mg error say about the uncertainty?
   <details><summary>Answer</summary>Pitch = atan2(0.5, 0.866) = 30°. One axis alone: sin θ = 0.5 with a 0.001 error gives an angle error of 0.001/cos 30° = 1.15 mrad ≈ 0.066°.</details>
3. A drone gyro has a bias of 0.02 °/s and a noise density of 0.005 (°/s)/√Hz. What is the yaw error after 5 minutes of gyro-only integration, and which term dominates?
   <details><summary>Answer</summary>Bias: 0.02 × 300 = 6°. Noise: 0.005 × √300 ≈ 0.087°. The bias dominates by far, which is why gyros are calibrated at start-up (bias measured while still) and fused with a magnetometer or GPS for heading.</details>

**Next:** [B5 MEMS microphones, pressure sensors and actuators](B5-mems-microphones-pressure-sensors-and-actuators.md) — the same springs and capacitors, now as a membrane that feels pressure and sound, and run backwards as actuators that move mirrors, lenses and ink.
