# B5. MEMS microphones, pressure sensors and actuators

> **Connects:** builds on [B3 Micromechanics](B3-micromechanics-beams-springs-and-resonators.md) (stiffness, resonance), [A2 Resistive sensors and the Wheatstone bridge](A2-resistive-sensors-and-the-wheatstone-bridge.md), [A3 Capacitive sensors](A3-capacitive-sensors.md), [A4 Piezoelectric, piezoresistive and magnetic sensors](A4-piezoelectric-piezoresistive-and-magnetic-sensors.md), [B4 MEMS inertial sensors](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md) · used by [C2 Pressure-driven flow and hydraulic circuits](C2-pressure-driven-flow-and-hydraulic-circuits.md), [C5 Lab-on-a-chip and integrated systems](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md), [A9 Sensor fusion and the Kalman filter](A9-sensor-fusion-and-the-kalman-filter.md)

## Hook — a drum skin

Press the middle of a drum with one finger. The skin dips most in the centre, not at all at the rim, and if you look
closely the skin is bent most sharply right next to the rim, where it is clamped. Tap it, and the skin vibrates and
pushes air: that is sound. Shout at it, and the skin trembles in reply: that is a microphone.

Now shrink the drum to a millimetre across and make the skin out of silicon twenty times thinner than a hair. If the
air pressure on one side changes, the skin bows by a fraction of a micrometre. Put tiny resistors at the rim where it
bends hardest and you have the **pressure sensor** in a car tyre, a blood-pressure catheter, a weather station and the
barometer in your phone, which can tell which floor of a building you are on. Put a perforated plate just above a much
thinner skin and you have the **MEMS microphone**: a phone has three or four of them.

And run the same machines **backwards**: apply a voltage instead of reading one, and the skin or plate moves. That is
an **actuator**: the micromirrors in a projector, the nozzles of an inkjet printer, the motor that steadies a phone's
camera lens.

## The idea in plain words

**A clamped diaphragm under pressure.** A thin circular plate of radius $r_d$ and thickness $t$, clamped all around its
edge, feels a pressure difference $p$ (pressure on one side minus the other). It bends into a smooth bowl. How stiff it
is depends on its **bending stiffness**
$$D_p=\frac{Et^3}{12(1-\nu_P^2)},$$
the plate version of a beam's $EI_A$ from B3 ($E$ is Young's modulus, $\nu_P$ Poisson's ratio). The centre moves by
$$x_0=\frac{p\,r_d^4}{64\,D_p},\qquad x(r)=x_0\Big(1-\frac{r^2}{r_d^2}\Big)^2,$$
where $r$ is the distance from the centre. Two powers dominate: the deflection grows as the **fourth power** of the radius
and falls as the **cube** of the thickness. A drum twice as wide is sixteen times softer; a skin twice as thick is eight
times stiffer. That is how one fabrication process (B2) makes a stiff 100 kPa barometer and a floppy microphone membrane:
by choosing $r_d$ and $t$.

**Where the stress is.** The surface of the plate is stretched or squeezed as it bends. The largest stress is at the
clamped edge, where the plate turns from flat (in the frame) to curving down:
$$\sigma_{\text{edge}}=\frac{3p\,r_d^2}{4t^2},\qquad \sigma_{\text{centre}}=\frac{3(1+\nu_P)\,p\,r_d^2}{8t^2}\;(\text{opposite sign}).$$
In between there is a ring with no radial stress at all, at $r=r_d\sqrt{(1+\nu_P)/(3+\nu_P)}\approx0.62\,r_d$. Stress grows
as $(r_d/t)^2$, which is also what limits a design: make the plate too thin for its pressure and it cracks at the rim.

**Piezoresistive pressure sensor: a bridge at the edge.** Silicon has a huge **piezoresistive** effect (A4): stretching it
changes its resistivity, not just its shape, giving gauge factors near 100 instead of 2 for metal. Four resistors are
doped into the diaphragm at the edge, where the stress is highest. In p-type silicon the relative change is about
$\Delta R/R\approx\tfrac{\pi_{44}}{2}(\sigma_\parallel-\sigma_\perp)$, where $\sigma_\parallel$ is the stress along the
current, $\sigma_\perp$ the stress across it, and $\pi_{44}\approx1.38\times10^{-9}$ Pa⁻¹ the piezoresistive coefficient.
At the edge the stress across the radius is $\nu_P$ times the radial one, so a resistor laid **along** the radius changes
by $+\tfrac{\pi_{44}}{2}(1-\nu_P)\sigma_{\text{edge}}$ and one laid **across** it by the same amount with a minus sign. Wire
the two "+" and the two "−" resistors into opposite arms of a Wheatstone bridge (A2) and you get the maximum output,
$V_{\text{out}}=V_{\text{ex}}\,\Delta R/R$, while equal changes in all four (temperature!) cancel.

```viz
b5-membrane-3d
```

**Capacitive pressure sensors.** Alternatively, put a fixed electrode under the diaphragm across a gap $g_0$: the plate
and electrode form a capacitor, and pressure narrows the gap (A3). Capacitive sensors use almost no power and drift less
with temperature than piezoresistors, which is why the barometers in phones and watches are often capacitive. The price
is a non-linear response ($C\propto1/(g_0-x)$) and a need for careful electronics, because the changes are femtofarads.

**The barometer: altitude from pressure.** Air near sea level weighs about $\rho=1.225$ kg/m³, so going up one metre
removes a column of air of weight $\rho g_{\text{grav}}\approx12$ Pa per square metre (here $g_{\text{grav}}=9.81$ m/s²):
$$\frac{dp}{dz}=-\rho\,g_{\text{grav}}\approx-12\ \text{Pa per metre}.$$
One floor of a building (3 m) is 36 Pa out of 101 325 Pa, about 0.04 %. A good MEMS barometer resolves about 1 Pa,
roughly 8 cm of height, which is how a phone tells emergency services which floor you are on and how a drone holds its
altitude. The weather changes the pressure by hundreds of pascals per day, so absolute altitude needs a reference; height
*changes* over minutes are reliable. In A9 the barometer is fused with the accelerometer of B4.

**The MEMS microphone.** A microphone is a pressure sensor for very small, fast pressure changes. Sound is a pressure
wiggle on top of the atmosphere, measured in **dB SPL** (sound pressure level):
$$L=20\log_{10}\frac{p_{\text{rms}}}{20\ \mu\text{Pa}},$$
where 20 µPa is the quietest sound a young ear hears. So 94 dB SPL is exactly 1 Pa rms (loud speech at arm's length),
60 dB SPL a conversation (20 mPa), 120 dB SPL a jet at close range (20 Pa). A MEMS microphone uses a very thin membrane
(about 1 µm of polysilicon) with a stiff **perforated backplate** a few micrometres above it; the holes let the air
between them escape so it doesn't act as a stiff cushion. The two form a capacitor charged by a bias voltage $V_b$
through a huge resistor, so the charge stays constant while the sound wiggles the gap. With constant charge $q$,
$V=q/C=q\,g/(\varepsilon_0A)$: the voltage follows the gap linearly, $\Delta V=V_b\,\Delta g/g_0$. A small amplifier chip
(ASIC) in the same package boosts and digitises it.

Microphone datasheets quote three numbers:
- **sensitivity**, the output for 1 Pa (94 dB SPL), in dBV/Pa: $-38$ dBV/Pa means $10^{-38/20}=12.6$ mV per pascal;
- **SNR**, the signal at 94 dB SPL compared with the microphone's own noise, typically 60–70 dB; the noise floor in dB SPL is
  $94-\mathrm{SNR}$, the quietest sound it can hear;
- **AOP** (acoustic overload point), around 120–130 dB SPL, where the output distorts.

```viz
b5-microphone-3d
```

**Actuators: the same structures driven by voltage.** Put a voltage $V$ across a capacitor with a movable plate and the
plates attract with
$$F_e=\frac{\varepsilon_0AV^2}{2(g_0-x)^2},$$
which is the slope of the stored energy $\tfrac12CV^2$ (A3). The spring pulls back with $kx$. Here is the catch: the
electrostatic force grows faster than the spring force as the gap closes. Up to one third of the gap the spring wins
and the plate finds a stable rest; beyond $x=g_0/3$ no balance is possible, and the plate **snaps shut**. This is
**pull-in**, at the voltage
$$V_{\text{pi}}=\sqrt{\frac{8kg_0^3}{27\,\varepsilon_0A}}.$$
Every capacitive MEMS device must respect it: a sensor's readout voltage must stay far below $V_{\text{pi}}$ (B4), and a
microphone's bias is set at a safe fraction of it.

```viz
b5-pull-in
```

**The actuator toolbox.**
- **Comb drives**: interleaved fingers that slide past each other instead of closing a gap. The force
  $F=N\varepsilon_0tV^2/g$ (for $N$ moving fingers of thickness $t$ at gap $g$) does not depend on position, so there is
  no pull-in along the motion and the travel can be tens of micrometres. They drive the gyroscopes of B4.
- **Thermal bimorphs**: two layers with different thermal expansion, like a bimetal strip in an old thermostat. Heat them
  with a current and the strip curls. Slow (milliseconds) but strong and with large motion.
- **Piezoelectric actuators** (A4): a thin PZT film changes length with voltage. Piezo inkjet heads squeeze a tiny ink
  chamber with them to shoot a drop; they also drive ultrasonic transducers and some autofocus lenses.
- **Thermal inkjet**: a thin-film heater flashes the ink to vapour in a microsecond; the growing bubble pushes out a drop
  of a few picolitres. Cheap enough to throw away with the cartridge.
- **DLP micromirrors**: millions of aluminium mirrors, each about 5 µm wide, on torsion hinges above electrodes. Each
  tips electrostatically to $+12°$ or $-12°$ and lands on a stop: pull-in used on purpose, as a clean digital switch.
  Flipping thousands of times per frame makes grey levels.
- **Optical image stabilisation (OIS)**: a gyroscope (B4) measures the hand's shake and an actuator (a voice-coil motor,
  or in some phones a MEMS stage) shifts the lens or the image sensor by $f_L\,\theta$ to cancel it, with $f_L$ the focal
  length and $\theta$ the shake angle.

## Intuitive examples

1. **A barometer diaphragm.** Silicon ($E=160$ GPa, $\nu_P=0.27$), $r_d=500$ µm, $t=20$ µm, under 100 kPa: $D_p=1.151\times10^{-4}$
   N·m, $x_0=0.85$ µm (only 4.2 % of $t$, so the linear theory holds), edge stress 46.9 MPa, centre 29.8 MPa. The force on
   the disc is 78.5 mN, the weight of 8.0 g.
2. **One metre of altitude.** $dp/dz=1.225\times9.81=12.02$ Pa/m, so one floor (3 m) is 36 Pa. With the diaphragm above,
   12 Pa moves the centre by 0.10 nm and changes the bridge by 9.3 µV: a job for the amplifiers and averaging of A7 and
   A8. In the standard atmosphere, $p(100\text{ m})=100\,129$ Pa (11.96 Pa/m) and $p(1000\text{ m})=89\,875$ Pa (only
   11.45 Pa/m: the rule of 12 Pa/m holds near sea level).
3. **A tyre on a hot day (TPMS).** 230 kPa gauge (2.3 bar, 33 psi) is 331.3 kPa absolute. Driving warms the air from 20 °C
   to 60 °C at fixed volume: $p\propto T$, so 376.5 kPa absolute, 275 kPa gauge, +45 kPa. A TPMS chip therefore measures
   temperature too, or the car would warn about a tyre that is fine.
4. **Blood pressure.** 120 mmHg $=16.00$ kPa and 80 mmHg $=10.67$ kPa (1 mmHg $=133.3$ Pa). A catheter-tip sensor with
   $r_d=100$ µm and $t=2$ µm deflects 217 nm at 120 mmHg with 30 MPa at its edge: small enough to fit inside a blood vessel.
5. **Sound levels.** 30 dB SPL (a quiet bedroom) is 0.632 mPa; 60 dB SPL is 0.02 Pa; 94 dB SPL is 1 Pa; 120 dB SPL is
   20 Pa. A $-38$ dBV/Pa microphone gives 12.6 mV at 1 Pa and 0.252 mV at 60 dB SPL; with SNR 65 dB its noise is
   7.08 µV, equivalent to a 29 dB SPL sound.
6. **Actuators by numbers.** A plate with $k=1$ N/m, $g_0=2$ µm and $A=100$ µm × 100 µm pulls in at 5.17 V. A comb drive with
   100 fingers, $t=20$ µm, $g=2$ µm at 30 V pushes with 7.97 µN, moving 8.0 µm on the same 1 N/m spring. An aluminium-on-
   silicon bimorph ($\Delta\alpha=20.4$ ppm/K, total 2 µm thick, 200 µm long) heated by 100 K curls to a radius of 0.65 mm
   and its tip rises 30.6 µm. A 4 pL inkjet drop is 19.7 µm across. A 0.1° hand shake with a 4.3 mm lens needs a 7.5 µm
   correction, 6.2 pixels of 1.22 µm.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $D_p=\dfrac{Et^3}{12(1-\nu_P^2)}$ | bending stiffness of a plate | $E$, $\nu_P$, thickness $t$ |
| $x_0=\dfrac{p\,r_d^4}{64D_p}$, $\;x(r)=x_0(1-r^2/r_d^2)^2$ | clamped circular plate, uniform pressure, $x_0\ll t$ | $r_d$ radius, $p$ pressure difference |
| $\sigma_{\text{edge}}=\dfrac{3p\,r_d^2}{4t^2}$ | largest (radial) surface stress, at the rim | grows as $(r_d/t)^2$ |
| $\Delta R/R=\pm\tfrac{\pi_{44}}{2}(1-\nu_P)\sigma_{\text{edge}}$, $\;V_{\text{out}}=V_{\text{ex}}\Delta R/R$ | piezoresistors at the rim, full bridge | $\pi_{44}$ piezoresistive coefficient |
| $dp/dz=-\rho g_{\text{grav}}\approx-12$ Pa/m | barometric altitude near sea level | $\rho$ air density |
| $L=20\log_{10}(p_{\text{rms}}/20\,\mu\text{Pa})$ | sound pressure level in dB SPL | 94 dB SPL = 1 Pa |
| $\Delta V=V_b\,\Delta g/g_0$ | constant-charge capacitive microphone | $V_b$ bias, $g_0$ gap |
| $F_e=\dfrac{\varepsilon_0AV^2}{2(g_0-x)^2}$ | parallel-plate electrostatic force | $A$ plate area |
| $x_{\text{pi}}=g_0/3$, $\;V_{\text{pi}}=\sqrt{\dfrac{8kg_0^3}{27\varepsilon_0A}}$ | pull-in point and voltage | $k$ spring constant |
| $F=\dfrac{N\varepsilon_0tV^2}{g}$ | comb drive, independent of travel | $N$ moving fingers |
| $\kappa=\dfrac{3\Delta\alpha\,\Delta T}{2h}$ | bimorph curvature (equal layers) | $\Delta\alpha$ expansion mismatch, $h$ total thickness |

## Applications

| World | Diaphragms, microphones and actuators | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | leaf-clip and stem pressure probes, soil tensiometers with MEMS pressure chips, spray-nozzle pressure on sprayers, microphones listening for insects and cavitation clicks in stressed xylem | how hard roots must pull to get water (water stress), even spraying, pests heard before they are seen |
| 🧬 Biology & human health | blood-pressure catheter tips, intracranial and intraocular pressure implants, hearing aids (2–3 MEMS mics for direction), inhalers and ventilators measuring airflow pressure, insulin micropumps | pressure inside the body with a sensor smaller than a grain of rice; speech pulled out of noise |
| 🌍 Environment | weather-station barometers, river and well level loggers (water pressure: 9.8 kPa per metre of depth), acoustic monitoring of birds, bats and traffic noise | storms from falling pressure, flood levels, biodiversity and noise maps from sound |
| 🤖 Robotics & drones | barometric altitude hold, airspeed (pitot) sensors, microphone arrays for sound localisation, MEMS-mirror LiDAR scanners, suction-cup grippers with pressure feedback | altitude to ~10 cm, whether a grip has sealed, where a voice comes from |
| 🚗 Cars | TPMS in every wheel, manifold-air and brake-pressure sensors, MEMS-mirror LiDAR and head-up displays, cabin microphones for hands-free calls | a slow puncture before it is dangerous, engine air for the fuel calculation, the road ahead in 3D |
| 📱 Phones & photography | 3–4 MEMS microphones (calls, noise cancellation, voice assistant), the barometer, OIS actuators shifting the lens or sensor, MEMS autofocus | which floor you are on, your voice separated from the wind, sharp photos from a shaking hand |
| 🏠 Home & household | inkjet printers (thermal and piezo), DLP projectors, smart speakers with 6–8 microphones, washing-machine water-level sensors, gas-meter and HVAC pressure sensors | where each pixel of ink and light goes; how much water is in the drum; whether the filter is clogged |

## Derivation

**(a) Clamped circular plate under uniform pressure.**
1. For an axisymmetric plate, bending balance gives $D_p\,\nabla^4x=p$, with $\nabla^4$ the biharmonic operator in polar form (the plate version of $EI_Ax''''=q$ for a beam, B3).
2. Integrating once using the shear force on a circle of radius $r$ (which carries the load $p\pi r^2$): $D_p\dfrac{d}{dr}\Big[\dfrac1r\dfrac{d}{dr}\Big(r\dfrac{dx}{dr}\Big)\Big]=\dfrac{pr}{2}$.
3. Integrate three more times; keep the solution finite at $r=0$; impose clamping $x(r_d)=0$ and $dx/dr(r_d)=0$.
4. Result: $x(r)=\dfrac{p}{64D_p}(r_d^2-r^2)^2=x_0(1-r^2/r_d^2)^2$, with $x_0=\dfrac{p\,r_d^4}{64D_p}$.
5. Check: at the rim the value and the slope are zero; the curvature is largest there.

**(b) Surface stress.**
1. Radial surface stress $\sigma_r=\dfrac{6M_r}{t^2}$ with the bending moment $M_r=-D_p\Big(\dfrac{d^2x}{dr^2}+\dfrac{\nu_P}{r}\dfrac{dx}{dr}\Big)$.
2. Insert $x(r)$: $M_r=\dfrac{p}{16}\big[(1+\nu_P)r_d^2-(3+\nu_P)r^2\big]$.
3. Rim ($r=r_d$): $M_r=-\dfrac{pr_d^2}{8}$, so $\lvert\sigma_{\text{edge}}\rvert=\dfrac{3pr_d^2}{4t^2}$.
4. Centre ($r=0$): $M_r=\dfrac{(1+\nu_P)pr_d^2}{16}$, so $\sigma_{\text{centre}}=\dfrac{3(1+\nu_P)pr_d^2}{8t^2}$, opposite sign.
5. Zero radial stress where $(1+\nu_P)r_d^2=(3+\nu_P)r^2$: $r=0.62\,r_d$ for $\nu_P=0.27$.

**(c) The bridge.**
1. At the clamped rim the tangential stress is $\nu_P$ times the radial one (the rim cannot stretch around its circumference).
2. Radial resistor: $\Delta R/R=\tfrac{\pi_{44}}{2}(\sigma_r-\sigma_\theta)=\tfrac{\pi_{44}}{2}(1-\nu_P)\sigma_{\text{edge}}$. Tangential resistor: the negative of that.
3. Full bridge with $R(1+\delta)$ and $R(1-\delta)$ in opposite arms: $V_{\text{out}}=V_{\text{ex}}\Big[\dfrac{1+\delta}{2}-\dfrac{1-\delta}{2}\Big]=V_{\text{ex}}\,\delta$ (A2).

**(d) Pull-in.**
1. Net force on the plate: $F(x)=kx-\dfrac{\varepsilon_0AV^2}{2(g_0-x)^2}$; equilibrium where $F=0$.
2. Stable if pushing closer creates a net restoring force: $\dfrac{dF}{dx}>0$, i.e. $k>\dfrac{\varepsilon_0AV^2}{(g_0-x)^3}=\dfrac{2F_e}{g_0-x}$.
3. The last stable point has both $kx=F_e$ and $k=\dfrac{2F_e}{g_0-x}$. Divide: $x=\dfrac{g_0-x}{2}$, so $x=g_0/3$.
4. Substitute: $k\dfrac{g_0}{3}=\dfrac{\varepsilon_0AV^2}{2(2g_0/3)^2}=\dfrac{9\varepsilon_0AV^2}{8g_0^2}$, so $V_{\text{pi}}^2=\dfrac{8kg_0^3}{27\varepsilon_0A}$.

**(e) Constant-charge microphone.**
1. The bias resistor is so large ($\sim$GΩ) that charge cannot flow in or out during one sound cycle: $q=C_0V_b$ is fixed.
2. $V=q/C=\dfrac{q\,g}{\varepsilon_0A}$ is linear in the gap $g$.
3. So $\Delta V=V_b\dfrac{\Delta g}{g_0}$, with $\Delta g$ the average membrane motion (one third of $x_0$ for the bowl shape $(1-r^2/r_d^2)^2$).

## Worked check

**Pressure sensor** ($E=160$ GPa, $\nu_P=0.27$, $r_d=500$ µm, $t=20$ µm, $p=100$ kPa, $\pi_{44}/2=69\times10^{-11}$ Pa⁻¹, $V_{\text{ex}}=3.3$ V):
- $D_p=160\times10^9\cdot(20\times10^{-6})^3/(12\cdot0.9271)=1.151\times10^{-4}$ N·m.
- $x_0=10^5\cdot(5\times10^{-4})^4/(64\cdot1.151\times10^{-4})=8.49\times10^{-7}$ m $=0.85$ µm; $x_0/t=0.042$ ✓ small.
- $\sigma_{\text{edge}}=3\cdot10^5\cdot2.5\times10^{-7}/(4\cdot4\times10^{-10})=46.9$ MPa.
- $\Delta R/R=69\times10^{-11}\cdot0.73\cdot46.9\times10^6=2.36$ %; $V_{\text{out}}=3.3\times0.0236=77.9$ mV, i.e. 0.78 mV/kPa.

**Microphone** ($r_d=300$ µm, $t=1$ µm, $E=160$ GPa, $\nu_P=0.22$, $g_0=3$ µm, $V_b=10$ V):
- $D_p=1.401\times10^{-8}$ N·m; at 1 Pa $x_0=9.03$ nm, mean motion $x_0/3=3.01$ nm.
- $C_0=\varepsilon_0\pi r_d^2/g_0=0.83$ pF; $\Delta C=0.84$ fF per Pa.
- $\Delta V=10\text{ V}\times3.01\text{ nm}/3\ \mu\text{m}=10.0$ mV/Pa $=-40.0$ dBV/Pa; the ASIC adds 2.0 dB to reach the $-38$ dBV/Pa datasheet value.
- Piston estimate of pull-in: $k_{\text{eff}}=p\pi r_d^2/(x_0/3)=94$ N/m, $V_{\text{pi}}=17.3$ V, so the 10 V bias is at 0.58 $V_{\text{pi}}$ ✓.

**Pull-in** ($k=1$ N/m, $g_0=2$ µm, $A=10^{-8}$ m²): $V_{\text{pi}}=\sqrt{8\cdot1\cdot8\times10^{-18}/(27\cdot8.854\times10^{-12}\cdot10^{-8})}=5.17$ V.
At $x=g_0/3=0.667$ µm: $kx=667$ nN and $F_e=667$ nN, and $dF_e/dx=1.000$ N/m $=k$ ✓ (the curves touch). Below pull-in,
3 V gives a stable rest at 112 nm (0.056 $g_0$) and 5 V at 477 nm (0.239 $g_0$).

All numbers come from `scripts/checks/B5_check.py`.

## Whiteboard plan

- **Panel 1 — the drum.** A side view of a clamped plate sagging under arrows $p$. Write $x_0=pr_d^4/(64D_p)$ and
  $D_p\propto t^3$. Say: "Fourth power of size, cube of thickness."
- **Panel 2 — where it hurts.** The same plate, coloured: red at the rims, blue in the middle, a white ring at 0.62 $r_d$.
  Write $\sigma_{\text{edge}}=3pr_d^2/4t^2$. Draw four little resistors at the rim: two radial (+), two tangential (−).
- **Panel 3 — the bridge.** A diamond of four resistors, $+$ and $-$ in opposite arms, $V_{\text{out}}=V_{\text{ex}}\Delta R/R$.
  Number: 77.9 mV at 100 kPa; 9.3 µV per metre of altitude.
- **Panel 4 — the microphone.** Membrane, perforated backplate, constant charge. Write
  94 dB SPL = 1 Pa, $-38$ dBV/Pa = 12.6 mV/Pa, noise floor = 94 − SNR.
- **Panel 5 — pull-in.** Force vs gap: a straight line $kx$ and a steep curve $F_e$; three voltages; the tangent case at
  $g_0/3$. Write $V_{\text{pi}}=\sqrt{8kg_0^3/27\varepsilon_0A}$.
- **Panel 6 — the actuator zoo.** Comb drive, bimorph, piezo and thermal inkjet, DLP mirror, OIS: one sketch each, with
  "what moves it" and "how far".

## Common mistakes and where the intuition breaks

- **Gauge vs absolute pressure.** A tyre gauge reads pressure above the atmosphere; a barometer reads absolute pressure
  (vacuum on the other side of the diaphragm). The gas law $p\propto T$ works only with absolute pressure.
- **Big deflections.** $x_0=pr_d^4/64D_p$ assumes $x_0\ll t$. Once $x_0$ is comparable to $t$ the plate must also stretch like
  a balloon, which stiffens it; the response becomes non-linear and the formula overestimates the deflection.
- **Built-in stress.** Thin films are rarely stress-free. Microphone membranes are often tension-dominated (more like a drum
  skin than a plate), and a little compressive stress can make a membrane buckle. Real designs are calibrated, not
  computed.
- **Resistors in the wrong place.** In the middle of the diaphragm the stress is smaller and has the opposite sign; at
  0.62 $r_d$ it is zero. Put the bridge at the rim.
- **dB confusion.** dB SPL compares pressures with 20 µPa; dBV compares voltages with 1 V. Both use $20\log_{10}$ because they
  are amplitudes. +6 dB is twice the pressure; +20 dB is ten times.
- **"More voltage, more motion."** For a gap-closing actuator only up to $g_0/3$; past that it snaps. And after a snap, the
  plate often stays stuck at a much lower voltage (hysteresis), or forever (stiction).
- **Where the intuition breaks:** a microphone is not a slow pressure sensor. Above its membrane's resonance it stops
  following the sound, and the air in the gap and the holes adds damping and stiffness. The frequency response of a
  microphone is set as much by its air paths (C2's hydraulic circuits) as by its silicon.

## Remember

**"Plates bend as $r_d^4/t^3$ and are stressed most at the rim; put the bridge there. 94 dB SPL is 1 Pa. A gap-closing actuator snaps at $g_0/3$."**

## Self-test

1. A pressure-sensor diaphragm is redesigned with half the thickness and the same radius. What happens to the centre deflection and to the edge stress at the same pressure?
   <details><summary>Answer</summary>D_p falls by 2³ = 8, so the deflection grows 8 times. The edge stress 3 p r_d²/(4 t²) grows by 2² = 4 times. The sensor is more sensitive but breaks at a quarter of the old pressure, and the deflection may no longer be small compared with t.</details>
2. A phone barometer reads 101 300 Pa on the ground floor and 101 192 Pa a little later. Roughly how many floors up are you, and why is "a little later" important?
   <details><summary>Answer</summary>The drop is 108 Pa; at about 12 Pa per metre that is 9 m, roughly 3 floors of 3 m. "A little later" matters because the weather also changes the pressure by hundreds of pascals over hours, so only quick changes can be read as height.</details>
3. A parallel-plate actuator pulls in at 20 V. You halve the gap and keep everything else the same. What is the new pull-in voltage, and how far can the plate now move stably?
   <details><summary>Answer</summary>V_pi grows as g0^(3/2), so it falls by 2^1.5 ≈ 2.83: about 7.1 V. The stable travel is still one third of the gap, which is now half as large, so half as much motion.</details>

**Next:** [C1 Fluids at the microscale](C1-fluids-at-the-microscale-reynolds-number-and-laminar-flow.md) — the air in a microphone gap and the ink in a nozzle are fluids at the microscale; Part C shows why they behave like honey.
