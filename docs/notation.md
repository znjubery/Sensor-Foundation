# Notation — one set of symbols for every note

Every note uses these symbols and nothing else. If a note needs a new symbol, add it here first.
Math is LaTeX between `$…$`. Units are SI unless a note says otherwise; micro-scale numbers are written with prefixes
(µm, nL, pF, mV, ppm). **Rule of thumb for clashes:** the *bare* letter has one meaning; every other meaning carries a subscript.

## The measurement chain (Part A)
| Thing | Symbol | Example / rule |
|---|---|---|
| Stimulus / measurand (what the world does) | $s$ | strain, light power, pressure, glucose concentration |
| Sensor output | $y$ | volts, counts, hertz; ideal linear sensor $y=y_0+S\,s$ |
| Offset (output at zero stimulus) | $y_0$ | |
| Sensitivity | $S=dy/ds$ | units "output per stimulus", e.g. mV/kPa |
| Full-scale range, resolution | $s_{\text{FS}}$, $\Delta s_{\min}$ | resolution = smallest change you can see above noise |
| Error ("measured minus true") | $e=s_{\text{meas}}-s$ | always measured minus true, like a residual |
| Voltage, current, resistance, power | $V$, $I$, $R$, $P$ | supply/excitation voltage $V_{\text{ex}}$, bridge output $V_{\text{out}}$ |
| Capacitance, charge | $C$, $q$ | $q=CV$ |
| Inductance | $L_{\text{ind}}$ | bare $L$ is a length |
| Gauge factor | $\mathrm{GF}$ | $\Delta R/R=\mathrm{GF}\cdot\varepsilon$ |
| Temperature coefficient of resistance | $\alpha$ | $R=R_0(1+\alpha\,\Delta T)$ |
| Thermistor constant | $\beta$ | $R=R_0\,e^{\beta(1/T-1/T_0)}$ |
| Time constant, cutoff frequency | $\tau=RC$, $f_c=1/(2\pi\tau)$ | |
| Frequency, angular frequency | $f$, $\omega=2\pi f$ | |
| Gain (amplifier) | $G$ | in dB: $20\log_{10}G$ |
| ADC bits, reference voltage, step size (LSB) | $N$, $V_{\text{ref}}$, $\Delta V=V_{\text{ref}}/2^N$ | |
| Sampling frequency | $f_s$ | Nyquist: signal content must stay below $f_s/2$ |
| Noise (rms), standard deviation | $\sigma_n$; general std $\sigma_{(\cdot)}$ with subscript | bare $\sigma$ = mechanical stress |
| Bandwidth | $\Delta f$ | Johnson noise $v_n=\sqrt{4k_BTR\Delta f}$ |
| Number of averaged samples | $M$ | noise falls as $1/\sqrt M$ |
| Signal-to-noise ratio | $\mathrm{SNR}$ | in dB: $20\log_{10}(\text{signal rms}/\text{noise rms})$ |
| Photodiode responsivity, quantum efficiency | $\mathcal{R}$, $\eta$ | $I=\mathcal{R}P_{\text{opt}}$; bare $R$ is resistance |
| Optical power, wavelength | $P_{\text{opt}}$, $\lambda$ | photon energy $h_{\text P}c_0/\lambda$ |
| Electrode potential | $V$ (with subscript: $V_{\text{cell}}$, $E^0$ written $V^0$) | Nernst slope $\frac{R_gT}{z\mathcal F}\ln 10\approx 59$ mV/decade at 25 °C |
| Kalman filter (1D) | estimate $\hat x$, its variance $p$, gain $K$, measurement $z$ | process noise variance $\sigma_w^2$, measurement noise variance $\sigma_v^2$ |

## Mechanics and MEMS (Part B)
| Thing | Symbol | Rule |
|---|---|---|
| Length, width, thickness of a structure | $L$, $w$, $t$ | in fluids $w$, $h$ (height) and $L$ describe the channel |
| Displacement | $x$ (along the sensing axis) | velocity $\dot x$, acceleration $\ddot x$ |
| Force, mass, spring constant, damping | $F$, $m$, $k$, $b$ | $m\ddot x+b\dot x+kx=F$ |
| Natural frequency | $\omega_0=\sqrt{k/m}$, $f_0=\omega_0/2\pi$ | |
| Quality factor, damping ratio | $Q_f$, $\zeta_d$ | $Q_f=\sqrt{km}/b=1/(2\zeta_d)$ |
| External acceleration, rotation rate | $a$, $\Omega$ | static deflection $x=ma/k=a/\omega_0^2$; Coriolis $F=2m\,\Omega\,\dot x$ |
| Stress, strain | $\sigma$, $\varepsilon$ | $\sigma=E\varepsilon$ |
| Young's modulus, Poisson's ratio | $E$, $\nu_P$ | |
| Second moment of area | $I_A$ | rectangle $I_A=wt^3/12$; bare $I$ is current |
| Density | $\rho$ | |
| Permittivity | $\varepsilon_0$, $\varepsilon_r$ (always subscripted) | bare $\varepsilon$ = strain. Plate capacitor $C=\varepsilon_0\varepsilon_rA/g$ |
| Gap, plate area | $g$, $A$ | $g_0$ = rest gap |
| Electric field | $\mathcal E$ | bare $E$ = Young's modulus |
| Size scale (for scaling laws) | $\ell$ | "everything shrinks by 10" ⇒ $\ell\to\ell/10$ |
| Boltzmann constant, temperature | $k_B$, $T$ | $k_BT\approx4.1\times10^{-21}$ J at 25 °C |

## Fluids and microfluidics (Part C)
| Thing | Symbol | Rule |
|---|---|---|
| Velocity field, speed scale | $\mathbf u$, $U$ | $u$ = velocity along the channel |
| Pressure, pressure drop | $p$, $\Delta p$ | |
| Volumetric flow rate | $Q$ | quality factor is $Q_f$ |
| Dynamic viscosity, kinematic viscosity | $\mu$, $\nu=\mu/\rho$ | water ≈ $1$ mPa·s, $\nu\approx10^{-6}$ m²/s |
| Hydraulic resistance | $R_{\text{hyd}}$ | $\Delta p=R_{\text{hyd}}Q$ (Ohm's law for fluids) |
| Channel width, height, length; hydraulic diameter | $w$, $h$, $L$, $D_h$ | |
| Wall shear stress | $\tau_w$ | bare $\tau$ = time constant |
| Diffusion coefficient | $D$ | diffusion length $\sqrt{2Dt}$ (1D) |
| Concentration | $c$ | |
| Surface tension, contact angle | $\gamma$, $\theta$ | Laplace pressure $\Delta p=2\gamma/r$ for a sphere |
| Zeta potential, Debye length | $\zeta$, $\lambda_D$ | electro-osmotic speed $u_{\text{eo}}=-\varepsilon_0\varepsilon_r\zeta\mathcal E/\mu$ |
| Dimensionless numbers | $\mathrm{Re}=\rho UL/\mu$, $\mathrm{Pe}=UL/D$, $\mathrm{Ca}=\mu U/\gamma$, $\mathrm{Bo}=\rho g_{\text{grav}}L^2/\gamma$ | upright roman letters; gravity is $g_{\text{grav}}$ (bare $g$ = gap) |

## Conventions to say out loud (students trip on these)
1. **Every sensor is a chain:** stimulus $s$ → physical change (ΔR, ΔC, Δx, ΔI) → voltage → number. Each arrow has a gain; the sensitivity $S$ is their product.
2. **Small-signal thinking:** most sensors are linearised around an operating point, $\Delta y\approx S\,\Delta s$ (a first-order Taylor step).
3. **Ratios beat absolutes:** relative changes ($\Delta R/R$, $\Delta C/C$, ppm) travel across devices; absolute numbers don't.
4. **Analogies are exact here:** voltage ↔ pressure, current ↔ flow, resistor ↔ channel, capacitor ↔ compliant chamber, mass–spring ↔ LC circuit.
5. **Scaling first:** before any formula, ask how the effect scales with size $\ell$ (B1). It explains why MEMS and microfluidics work at all.

## Colours in the visuals (same object, same colour, in every note's interactive figure — `scripts/viz/core.js`)
| Colour | Object | Examples |
|---|---|---|
| blue | the stimulus / measurand — what the world does | strain, light, acceleration, glucose |
| yellow | the sensor's output signal | $V_{\text{out}}$, ADC counts, frequency shift |
| green | the ideal model, calibration line, filtered estimate | $y=y_0+Ss$, Kalman $\hat x$ |
| red | noise, error, drift | $e$, $\sigma_n$ |
| teal | electrical quantities | voltage, charge, field lines, current |
| gold | heat and light | temperature, photons |
| purple | mechanical quantities | force, proof mass, spring, displacement |
| bright blue ("water") | fluid | flow, velocity profile, concentration |
| grey | the device body | silicon, glass, PDMS |
