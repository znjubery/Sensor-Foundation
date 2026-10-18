# A9. Sensor fusion and the Kalman filter

> **Connects:** builds on [A7 Signal conditioning](A7-signal-conditioning-amplifiers-filters-and-adcs.md), [A8 Noise, resolution, calibration and drift](A8-noise-resolution-calibration-and-drift.md) · used by [B4 MEMS inertial sensors](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md), [B5 MEMS microphones, pressure sensors and actuators](B5-mems-microphones-pressure-sensors-and-actuators.md), [C5 Lab-on-a-chip](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md)

## Hook — two friends' guesses, weighted by how reliable each one is

You are guessing the height of a tree with two friends. Ana is a surveyor with a laser meter; she says 12 m and is usually
within half a metre. Ben squints and says 15 m; he is usually off by 3 m. Do you take the average, 13.5 m? Of course not:
you lean heavily towards Ana. But you do not ignore Ben completely either. The question "how much to lean" has an exact
answer, and it is the heart of every drone, phone and car that knows where it is.

A drone holding its height has the same problem. Its **barometer** gives altitude directly but jitters by a metre or two. Its
**accelerometer** is smooth and fast, but to get altitude you must integrate it twice, so its small bias grows into metres of drift
within seconds. Neither alone is good enough. **Sensor fusion** combines them so that each covers the other's weakness, and the
**Kalman filter** is the recipe that does it, step by step, with the trust in each sensor computed on the fly.

## The idea in plain words

**Two guesses of one quantity.** Suppose two sensors measure the same thing $x$: reading $z_1$ with noise standard deviation $\sigma_1$,
and $z_2$ with $\sigma_2$. Their errors are independent and unbiased (calibrated, as in [A8](A8-noise-resolution-calibration-and-drift.md)).
Any blend $\hat x=w\,z_1+(1-w)\,z_2$ with weights adding to 1 is also unbiased. Its variance, because independent variances add
with the squares of their weights, is
$$\sigma^2(w)=w^2\sigma_1^2+(1-w)^2\sigma_2^2.$$
This is a parabola in $w$. Its lowest point is at $w=\sigma_2^2/(\sigma_1^2+\sigma_2^2)$: **each sensor is weighted by the other's
variance**, which is the same as weighting each by its own $1/\sigma^2$. The result is
$$\hat x=\frac{z_1/\sigma_1^2+z_2/\sigma_2^2}{1/\sigma_1^2+1/\sigma_2^2},\qquad \frac1{\sigma^2}=\frac1{\sigma_1^2}+\frac1{\sigma_2^2}.$$
The quantity $1/\sigma^2$ is called the **precision**, and **precisions add**. So the fused answer is always *better than the better
sensor*, never worse, even when the second sensor is poor. A barometer saying 102 m (±2 m) and a GPS saying 98 m (±4 m) fuse to
101.2 m ±1.79 m.

This is not a trick specific to fusion. It is exactly what weighted **least squares** gives (A8): minimise
$(x-z_1)^2/\sigma_1^2+(x-z_2)^2/\sigma_2^2$, set the derivative to zero, and the same formula appears. And if both readings are
Gaussian bell curves, multiplying them gives another bell curve with exactly this mean and this width.

```viz
a9-two-guesses
```

**Rewrite it as a correction.** The same answer can be written as "start from guess 1 and move part of the way to guess 2":
$$\hat x=z_1+K\,(z_2-z_1),\qquad K=\frac{\sigma_1^2}{\sigma_1^2+\sigma_2^2}.$$
The **gain** $K$ is a number between 0 and 1. If guess 1 is very uncertain ($\sigma_1$ large), $K\to1$ and we jump to the new
reading. If the new reading is very noisy, $K\to0$ and we barely move. **$K$ says how much to trust the new measurement.** The
difference $z_2-z_1$ is called the **innovation**: the surprise in the new reading.

**The Kalman filter: fusion over time.** Now let the quantity change. A drone's altitude $x$ evolves, and every $\Delta t$ (here 0.1 s)
we have two pieces of information:
- a **model** that predicts where it should be now from where it was, using the accelerometer: the climb rate $u$ (from integrating
  the accelerometer) says $x_k\approx x_{k-1}+u_k\Delta t$. The model is imperfect: its error per step has variance $\sigma_w^2$,
  the **process noise**;
- a **measurement** $z_k=x_k+v_k$ from the barometer, with noise variance $\sigma_v^2$.

The filter keeps an estimate $\hat x$ and its variance $p$ (how unsure it is), and repeats two steps forever:

1. **Predict.** Move the estimate with the model: $\hat x^-=\hat x+u\,\Delta t$. Uncertainty grows, because the model adds its own
   error: $p^-=p+\sigma_w^2$.
2. **Update.** Fuse the prediction (variance $p^-$) with the measurement (variance $\sigma_v^2$) exactly as with the two guesses:
   $$K=\frac{p^-}{p^-+\sigma_v^2},\qquad \hat x=\hat x^-+K\,(z-\hat x^-),\qquad p=(1-K)\,p^-.$$

That is the whole 1D Kalman filter: five lines. The prediction is "guess 1", the barometer is "guess 2", and the gain is recomputed
every step from how uncertain the prediction currently is. After a few steps $p$ settles to a steady value where the growth in the
predict step exactly balances the shrinking in the update step, and $K$ becomes a constant. For $\sigma_w^2=0.01$ m² and $\sigma_v^2=4$ m²
the steady gain is $K=0.049$: the filter acts like an average of about 20 barometer readings, but one that follows the drone's motion
thanks to the model. Its error is 0.44 m instead of the barometer's 2 m.

```viz
a9-kalman
```

**What the two noises mean.** $\sigma_v$ is how much you distrust the sensor; $\sigma_w$ is how much you distrust your model. If you
claim the model is perfect ($\sigma_w\to0$), $K\to0$ and the filter ignores the barometer and drifts with the accelerometer. If you
claim the barometer is perfect ($\sigma_v\to0$), $K\to1$ and the estimate copies every noisy reading. Tuning a Kalman filter means
choosing these two honestly, from the noise and drift measured as in A8.

**The complementary filter: the cheap cousin for tilt.** A phone or drone also needs its **tilt angle** $\theta$. An accelerometer at
rest measures gravity, so $\theta_{\text{acc}}=\arctan(a_x/a_z)$: correct on average but noisy, and fooled by every shake. A
**gyroscope** measures the rotation rate $\Omega$; integrating it, $\theta\leftarrow\theta+\Omega\Delta t$, is smooth and fast but drifts
because of the gyro's bias. The **complementary filter** combines them:
$$\hat\theta_k=\alpha\,(\hat\theta_{k-1}+\Omega_k\Delta t)+(1-\alpha)\,\theta_{\text{acc},k},\qquad \alpha=\frac{\tau}{\tau+\Delta t}.$$
This is a **high-pass** filter on the gyro and a **low-pass** filter on the accelerometer with the same time constant $\tau$ ([A7](A7-signal-conditioning-amplifiers-filters-and-adcs.md)):
fast changes come from the gyro, the long-term truth from gravity. The two filters add up to exactly 1 at every frequency, so the
true angle passes undistorted, hence "complementary". It is a Kalman filter with a fixed gain.

**GPS + IMU and the drone in 3D.** Outdoors, a drone fuses a **GPS** (about 1 fix per second, ±3 m, never drifts) with an **IMU**
(accelerometers and gyros at hundreds of Hz, smooth, but drifts). Between fixes the filter predicts with the IMU, and its uncertainty
grows; at each fix it updates and the uncertainty shrinks. In 3D the uncertainty is no longer a number $p$ but an **ellipsoid**: GPS is
typically worse vertically than horizontally, so the ellipsoid is tall. When GPS is lost (under a bridge, in a forest), the filter coasts
on the IMU and the ellipsoid balloons, growing like $t^2$ because a bias in acceleration integrates twice.

```viz
a9-drone-3d
```

## Intuitive examples

1. **Barometer and GPS altitude.** $z_1=102$ m ($\sigma_1=2$ m) and $z_2=98$ m ($\sigma_2=4$ m). Weight on the barometer
   $16/20=0.80$; fused $\hat x=101.20$ m; variance $1/(1/4+1/16)=3.20$ m², $\sigma=1.789$ m. The plain average (100.0 m) would have
   $\sigma=2.236$ m, worse than the barometer alone. In Kalman form, $K=4/20=0.20$ and $102+0.2\times(98-102)=101.20$ m.
2. **Two equal thermometers.** 10 °C and 12 °C, both $\sigma=1$ °C: fused 11.0 °C with $\sigma=0.707$ °C $=1/\sqrt2$, the $1/\sqrt M$ law of A8 with $M=2$.
3. **Three Kalman steps by hand.** Start $\hat x=100$ m, $p=9$ m²; $\sigma_w^2=0.01$, $\sigma_v^2=4$. Reading 104: $p^-=9.010$, $K=0.6925$,
   $\hat x=102.770$, $p=2.770$. Reading 101: $p^-=2.780$, $K=0.4100$, $\hat x=102.044$, $p=1.640$. Reading 103: $p^-=1.650$, $K=0.2921$,
   $\hat x=102.323$, $p=1.168$ ($\sigma=1.08$ m). The gain falls as the filter becomes sure of itself.
4. **Steady state.** $\sigma_w^2=0.01$, $\sigma_v^2=4$: $p^-=0.2051$, $K=0.0488$, $\sigma=0.442$ m (vs 2 m raw); a simulation of 20 000 steps
   measures 0.435 m. More process noise, $\sigma_w^2=0.1$: $K=0.146$, $\sigma=0.765$ m. A better barometer, $\sigma_v^2=0.25$: $K=0.181$, $\sigma=0.213$ m.
5. **Complementary filter for tilt.** $\tau=0.5$ s, $\Delta t=0.01$ s: $\alpha=0.9804$. A gyro bias of 0.5 °/s alone gives 30° of drift after
   60 s; in the complementary filter it leaves a constant error of only $b\tau=0.25°$. Accelerometer tilt with $a_x=0.17$ g, $a_z=0.985$ g:
   9.8°; but a 0.2 g sideways jolt fools it by 11.3°, which is why the gyro must carry the fast part.
6. **Why GPS is needed.** An accelerometer bias of 0.05 m/s², integrated twice, gives a position error $\tfrac12bt^2$: 0.025 m after 1 s,
   2.5 m after 10 s, **90 m** after 60 s. A barometer with 20 Pa of noise, at 11.8 Pa per metre, is good to 1.70 m, never drifting far.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $\hat x=\dfrac{z_1/\sigma_1^2+z_2/\sigma_2^2}{1/\sigma_1^2+1/\sigma_2^2}$ | inverse-variance (minimum-variance) fusion | $z_1,z_2$ readings, $\sigma_1,\sigma_2$ their noise |
| $1/\sigma^2=1/\sigma_1^2+1/\sigma_2^2$ | precisions add: fused is better than either | |
| $\hat x=z_1+K(z_2-z_1)$, $K=\sigma_1^2/(\sigma_1^2+\sigma_2^2)$ | the same, as a correction with gain $K$ | |
| $\hat x^-=\hat x+u\,\Delta t$, $p^-=p+\sigma_w^2$ | Kalman predict | $u$ model input, $\sigma_w^2$ process noise |
| $K=p^-/(p^-+\sigma_v^2)$ | Kalman gain: trust in the new reading | $\sigma_v^2$ measurement noise |
| $\hat x=\hat x^-+K(z-\hat x^-)$, $p=(1-K)p^-$ | Kalman update | $z$ measurement |
| $(p^-)^2-\sigma_w^2p^--\sigma_w^2\sigma_v^2=0$ | steady-state predicted variance | |
| $\hat\theta_k=\alpha(\hat\theta_{k-1}+\Omega_k\Delta t)+(1-\alpha)\theta_{\text{acc},k}$ | complementary filter | $\alpha=\tau/(\tau+\Delta t)$ |
| $\theta_{\text{acc}}=\arctan(a_x/a_z)$ | tilt from gravity | $a_x,a_z$ accelerometer axes |
| $e=\tfrac12 b\,t^2$ | dead-reckoning drift from an accelerometer bias $b$ | |

## Applications

| World | Sensor fusion | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | tractors and spraying drones fuse RTK-GPS with IMUs to drive rows within 2 cm; soil-moisture maps fuse point probes with satellite and drone imagery, weighted by their uncertainty | weighting by variance is how a few accurate probes correct many cheap, noisy images |
| 🧬 Biology & human health | smartwatches fuse PPG heart rate with the accelerometer to reject motion artefacts; continuous glucose monitors use a Kalman filter to smooth readings and predict 20 minutes ahead | the filter's prediction step is what lets a glucose alarm warn before the level is low |
| 🌍 Environment | air-quality networks fuse cheap sensors with a few reference stations; weather forecasting is a giant Kalman-type fusion (data assimilation) of millions of observations with a physics model | a forecast is a predict step; every new weather-balloon reading is an update |
| 🤖 Robotics & drones | every flight controller fuses gyro + accelerometer (attitude), barometer + accelerometer (altitude), GPS + IMU (position), plus optical flow and LiDAR near the ground | without fusion a drone either jitters (raw barometer) or drifts away (raw IMU) |
| 🚗 Cars | navigation fuses GPS with wheel-speed sensors and a yaw-rate gyro to keep the position in tunnels; driver assistance fuses radar (good range) and camera (good classification) | in a tunnel the uncertainty ellipse grows until the first GPS fix snaps it back |
| 📱 Phones & photography | the "game rotation vector" fuses gyro, accelerometer and compass; optical image stabilisation uses the gyro at kHz rates; photo stacking fuses frames weighted by sharpness | the compass needle stays steady because the gyro carries the fast motion and the magnetometer the slow truth |
| 🏠 Home & household | robot vacuums fuse wheel odometry, a gyro and LiDAR or camera features to map rooms; smart thermostats fuse several room sensors and the weather forecast | the robot "knows" where it is by fusing a drifting model with occasional landmark sightings |

## Derivation

**(a) Minimum-variance blend.**
1. $\hat x=wz_1+(1-w)z_2$ with $z_i=x+n_i$; $\hat x-x=wn_1+(1-w)n_2$, mean 0 for any $w$.
2. Independent errors: $\sigma^2(w)=w^2\sigma_1^2+(1-w)^2\sigma_2^2$.
3. $d\sigma^2/dw=2w\sigma_1^2-2(1-w)\sigma_2^2=0$ ⇒ $w^*=\sigma_2^2/(\sigma_1^2+\sigma_2^2)$.
4. Second derivative $2(\sigma_1^2+\sigma_2^2)>0$: a minimum.
5. Plug in: $\sigma^2(w^*)=\sigma_1^2\sigma_2^2/(\sigma_1^2+\sigma_2^2)$, i.e. $1/\sigma^2=1/\sigma_1^2+1/\sigma_2^2$.
6. Divide top and bottom by $\sigma_1^2\sigma_2^2$: $\hat x=(z_1/\sigma_1^2+z_2/\sigma_2^2)/(1/\sigma_1^2+1/\sigma_2^2)$.

**(b) The same from weighted least squares.**
1. Minimise $J(x)=(x-z_1)^2/\sigma_1^2+(x-z_2)^2/\sigma_2^2$.
2. $dJ/dx=2(x-z_1)/\sigma_1^2+2(x-z_2)/\sigma_2^2=0$.
3. Solve for $x$: the formula of (a). The curvature $d^2J/dx^2=2(1/\sigma_1^2+1/\sigma_2^2)=2/\sigma^2$ is the precision.

**(c) The same from multiplying Gaussians.**
1. $e^{-(x-z_1)^2/2\sigma_1^2}\cdot e^{-(x-z_2)^2/2\sigma_2^2}=e^{-J(x)/2}$ with $J$ from (b).
2. $J$ is a parabola in $x$, so the product is a Gaussian centred where $J$ is smallest, with $1/\sigma^2$ equal to half the curvature of $J$.

**(d) Gain form.**
1. $\hat x=w^*z_1+(1-w^*)z_2=z_1+(1-w^*)(z_2-z_1)$.
2. $1-w^*=\sigma_1^2/(\sigma_1^2+\sigma_2^2)=K$.
3. $\sigma^2=\sigma_1^2\sigma_2^2/(\sigma_1^2+\sigma_2^2)=(1-K)\sigma_1^2$.

**(e) The 1D Kalman filter.**
1. Model: $x_k=x_{k-1}+u_k\Delta t+w_k$, $w_k$ with variance $\sigma_w^2$; measurement $z_k=x_k+v_k$, variance $\sigma_v^2$.
2. Predict: $\hat x^-=\hat x_{k-1}+u_k\Delta t$; its error $(\hat x_{k-1}-x_{k-1})-w_k$ has variance $p^-=p_{k-1}+\sigma_w^2$ (independent errors add).
3. Update: fuse "guess 1" $=\hat x^-$ (variance $p^-$) with "guess 2" $=z_k$ (variance $\sigma_v^2$) using (d): $K=p^-/(p^-+\sigma_v^2)$.
4. $\hat x_k=\hat x^-+K(z_k-\hat x^-)$, $p_k=(1-K)p^-$.
5. Steady state: $p=p^-\sigma_v^2/(p^-+\sigma_v^2)$ and $p^-=p+\sigma_w^2$ ⇒ $(p^-)^2-\sigma_w^2p^--\sigma_w^2\sigma_v^2=0$ ⇒ $p^-=\tfrac12\big(\sigma_w^2+\sqrt{\sigma_w^4+4\sigma_w^2\sigma_v^2}\big)$.
6. In steady state the update is $\hat x_k=(1-K)\hat x^-+Kz_k$: a first-order low-pass on the measurements (A7), whose cutoff is set by $\sigma_w/\sigma_v$.

**(f) Complementary filter steady error from a gyro bias.**
1. True tilt 0, accelerometer perfect, gyro reads a bias $b$: $e_k=\alpha(e_{k-1}+b\Delta t)$.
2. Steady state $e=\alpha(e+b\Delta t)$ ⇒ $e=\alpha b\Delta t/(1-\alpha)$.
3. With $\alpha=\tau/(\tau+\Delta t)$: $\alpha/(1-\alpha)=\tau/\Delta t$, so $e=b\tau$: bounded, instead of growing as $bt$.

**(g) Dead reckoning drift.**
1. Constant acceleration bias $b$: velocity error $bt$.
2. Integrate again: position error $\tfrac12bt^2$. Drift grows quadratically, which is why the IMU needs an absolute sensor (GPS, barometer).

## Worked check

**Fusion.** $z_1=102$, $\sigma_1^2=4$; $z_2=98$, $\sigma_2^2=16$. Weights $1/4=0.25$ and $1/16=0.0625$; sum 0.3125.
$\hat x=(102\times0.25+98\times0.0625)/0.3125=(25.5+6.125)/0.3125=101.20$ m ✓; $\sigma^2=1/0.3125=3.20$ m², $\sigma=1.79$ m ✓.
A brute-force search over $w=0,0.001,\dots,1$ finds the minimum variance at $w=0.800$ ✓.

**One Kalman step.** $\hat x=100$, $p=9$, $\sigma_w^2=0.01$, $\sigma_v^2=4$, $z=104$: $p^-=9.01$; $K=9.01/13.01=0.6925$;
$\hat x=100+0.6925\times4=102.770$; $p=(1-0.6925)\times9.01=2.770$ ✓.

**Complementary filter.** $\alpha=0.5/0.51=0.9804$; steady error $0.9804\times0.5\times0.01/(1-0.9804)=0.2500°$ $=b\tau$ ✓.
(All numbers: `scripts/checks/A9_check.py`.)

## Whiteboard plan

- **Panel 1: two friends.** Two bell curves on an altitude axis, a narrow one at 102 and a wide one at 98. Draw the narrower,
  taller fused bell at 101.2, closer to the narrow one. Write "precisions add: $1/\sigma^2=1/\sigma_1^2+1/\sigma_2^2$".
- **Panel 2: the parabola.** Plot $\sigma^2(w)=w^2\sigma_1^2+(1-w)^2\sigma_2^2$ for $w$ from 0 to 1, mark its bottom at 0.8. Derive $w^*$ in two lines.
- **Panel 3: the gain.** A number line from $z_1$ to $z_2$ with an arrow covering the fraction $K$. Write "$K$ = how much I trust the new reading".
- **Panel 4: predict–update loop.** A circle with two boxes: "predict: $\hat x^-=\hat x+u\Delta t$, $p^-=p+\sigma_w^2$" and "update: $K$, $\hat x$, $p$".
  Beside it a sawtooth of $p$ over time: up a little at each predict, down at each update, settling to a steady band.
- **Panel 5: tilt.** A tilted phone, gravity arrow, gyro arrow. Write the complementary filter and "gyro: high-pass, accelerometer: low-pass".
- **Panel 6: the drone.** A flight path with GPS dots and a 3D ellipse around the estimate, growing in a tunnel and snapping back. Write $\tfrac12bt^2$.

## Common mistakes and where the intuition breaks

- **Averaging instead of weighting.** A plain average of a good and a bad sensor can be worse than the good sensor alone (2.24 m vs 2 m
  in example 1). Always weight by $1/\sigma^2$.
- **Fusing biased sensors.** The derivation assumes zero-mean errors. A biased sensor pulls the fused answer by its weight times its bias,
  and the filter's $p$ will claim a confidence it does not have. Calibrate first (A8), or add the bias to the state so the filter estimates it.
- **Fusing correlated errors.** Two readings from the same sensor, or two sensors sharing the same wind gust, are not independent; treating
  them as independent overcounts the information and makes the filter overconfident.
- **Setting $\sigma_w$ to zero "because the model is good".** Then $K\to0$, the filter stops listening and drifts with the model. Every model has some error; an honest $\sigma_w$ keeps the filter alive.
- **Confusing $p$ with the actual error.** $p$ is what the filter *believes*; it is right only if $\sigma_v$, $\sigma_w$ and the model are right. Checking that the innovations $z-\hat x^-$ really have variance $p^-+\sigma_v^2$ is the standard test.
- **Where 1D intuition breaks.** With position *and* velocity, or three axes, $p$ becomes a covariance matrix and $K$ a matrix: a GPS position
  fix also corrects the velocity, because the two errors are correlated. Real motion is often nonlinear (rotations), which needs the
  extended or unscented Kalman filter, but the predict–update logic and the meaning of $K$ stay the same.

## Remember

**"Weight every guess by 1/σ²; the Kalman filter predicts with the model, then moves a fraction K = p⁻/(p⁻ + σ_v²) towards the measurement."**

## Self-test

1. A phone's GPS says you are at 50 m along a street (±8 m), and a Wi-Fi fix says 62 m (±4 m). What is the fused position and its uncertainty?
   <details><summary>Answer</summary>Weights 1/64 and 1/16, i.e. 1:4. Fused = (50·1 + 62·4)/5 = 59.6 m. Variance 1/(1/64 + 1/16) = 12.8 m², so σ ≈ 3.58 m, better than either.</details>
2. In a Kalman filter the prediction has p⁻ = 1 m² and the barometer has σ_v² = 3 m². The prediction is 20.0 m and the reading is 22.0 m. Find K, the new estimate and p.
   <details><summary>Answer</summary>K = 1/(1 + 3) = 0.25. Estimate = 20.0 + 0.25·(22.0 − 20.0) = 20.5 m. p = (1 − 0.25)·1 = 0.75 m².</details>
3. A complementary filter runs at 200 Hz with τ = 1 s, and the gyro has a 0.2 °/s bias. What is α, and how large is the steady tilt error? What happens to that error if you make τ ten times longer, and what do you lose?
   <details><summary>Answer</summary>Δt = 0.005 s, so α = 1/1.005 ≈ 0.995. The steady error is bτ = 0.2 °/s × 1 s = 0.2°. With τ = 10 s it grows to 2°, but the accelerometer's shake noise is filtered more strongly. Long τ trusts the gyro (and its bias) more; short τ trusts the noisy accelerometer more.</details>

**Next:** [B1 Scaling laws: why small is different](B1-scaling-laws-why-small-is-different.md) — the accelerometers, gyros and barometers we have been fusing are tiny silicon machines, and at that size physics behaves differently.
