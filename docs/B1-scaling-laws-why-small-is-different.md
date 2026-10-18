# B1. Scaling laws: why small is different

> **Connects:** builds on [A3 Capacitive sensors](A3-capacitive-sensors.md) (the electrostatic force between plates), [A8 Noise, resolution, calibration and drift](A8-noise-resolution-calibration-and-drift.md) (thermal noise and $1/\sqrt M$) · used by [B2 Microfabrication](B2-microfabrication-lithography-etching-deposition.md), [B3 Micromechanics](B3-micromechanics-beams-springs-and-resonators.md), [B4 MEMS inertial sensors](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md), [B5 MEMS microphones, pressure sensors and actuators](B5-mems-microphones-pressure-sensors-and-actuators.md), [C1 Fluids at the microscale](C1-fluids-at-the-microscale-reynolds-number-and-laminar-flow.md), [C3 Diffusion, mixing and the Péclet number](C3-diffusion-mixing-and-the-peclet-number.md), [C4 Surface tension, capillarity, droplets and electrokinetics](C4-surface-tension-capillarity-droplets-and-electrokinetics.md)

## Hook — an ant, an elephant and a glass of iced tea

An ant carries a leaf many times its own weight and walks away after falling off a table. An elephant cannot jump at
all, and a fall of a few metres would break its legs. A water strider stands on a pond as if the water were a
trampoline; you would sink straight through. Crushed ice cools your iced tea in seconds, while one big ice cube takes
minutes.

None of this is because ants are made of better stuff. Ant muscle is ordinary muscle and ice is ice. **The difference
is size.** When you shrink an object, its surface shrinks more slowly than its volume. Forces that act on surfaces
(muscle strength, surface tension, electrostatic pull) shrink more slowly than forces that act on volume (weight,
inertia). Shrink anything far enough and the "small" forces of everyday life take over.

That is the entire reason MEMS (micro-electro-mechanical systems) work. A phone accelerometer has a proof mass a
fraction of a millimetre wide, held on springs thinner than a hair and moved by electrostatic forces that would be useless
in a washing machine. This note teaches the one habit that makes the micro-world predictable: **before using any formula,
ask how the effect scales with size.**

## The idea in plain words

**Shrink everything by the same factor.** Let $\ell$ be a typical length of an object: the side of a cube, the length
of a beam, the body length of an insect. "Shrinking by 10" means every length becomes $\ell/10$ while the shape and
the material stay the same. Then every *length* is divided by 10, every *area* by $10^2=100$ and every *volume* by
$10^3=1000$. We write this as $A\propto\ell^2$ and $V\propto\ell^3$, where $\propto$ means "is proportional to".
Most of what follows is this one fact applied again and again.

**Surface beats volume when things are small.** A cube of side $\ell$ has six faces, so its surface area is $A=6\ell^2$
and its volume is $V=\ell^3$. Their ratio is
$$\frac{A}{V}=\frac{6}{\ell}.$$
A 2 cm ice cube has $A/V=300$ per metre. Cut it into 1000 pieces of 2 mm and the volume is unchanged, but the total
surface grows tenfold, so $A/V=3000$ per metre and the tea cools ten times faster. A 1 µm cube has $A/V=6\times10^{6}$ per
metre. At that size an object is "almost all surface". Heat flows in and out in an instant, molecules stick to the
walls, and forces that act on surfaces outweigh forces that act on bulk.

```viz
b1-cubes-3d
```

**How forces scale: the four exponents.** Here are the forces you meet in sensors, each written as a size law:

- **Weight and inertia**, $F=mg_{\text{grav}}$ and $F=m\ddot x$. The mass is $m=\rho V\propto\ell^3$, where $\rho$ is the density
  and $g_{\text{grav}}=9.81$ m/s² is gravity. So weight $\propto\ell^3$. Shrink by 10 and the weight drops 1000 times.
- **Electrostatic force** between two charged plates at a fixed electric field strength $\mathcal E$ is
  $F=\tfrac12\varepsilon_0\mathcal E^2A$, where $\varepsilon_0=8.854\times10^{-12}$ F/m is the permittivity of free
  space and $A$ is the plate area. So $F\propto\ell^2$. It is the same pull that you met as a capacitance in
  [A3](A3-capacitive-sensors.md).
- **Surface tension** pulls along a line. A water surface pulls on anything touching it with $\gamma$ newtons per metre
  of contact line ($\gamma=0.072$ N/m for water). So $F=\gamma\times(\text{contact length})\propto\ell$.
- **Viscous drag** on a small sphere of radius $r$ moving at speed $U$ through a liquid of viscosity $\mu$ is
  Stokes' law, $F=6\pi\mu rU$. At a fixed speed this is $\propto\ell$, the same slope as surface tension.
- **Magnetic force** from a coil. If the wire carries a fixed current density $J$ (amperes per square metre of
  copper, limited by heating), the current is $J\ell^2$ and the field it makes at a distance $\sim\ell$ is about
  $B\approx\mu_0J\ell$, with $\mu_0=4\pi\times10^{-7}$ H/m. The magnetic pressure $B^2/(2\mu_0)$ times an area
  $\ell^2$ gives $F\approx\tfrac12\mu_0J^2\ell^4$. Shrink by 10 and the magnetic force drops **ten thousand** times.

William Trimmer packed this into one "bracket" (a column of exponents) that MEMS designers memorise:
$$F\propto\begin{bmatrix}\ell^1\\ \ell^2\\ \ell^3\\ \ell^4\end{bmatrix}\ \begin{matrix}\text{surface tension, viscous drag}\\ \text{electrostatics}\\ \text{gravity, inertia}\\ \text{magnetics}\end{matrix}$$
Read it from bottom to top: the lower the exponent, the better the force survives shrinking. Dividing by the mass
($\propto\ell^3$) gives the acceleration each force can produce: $a\propto[\ell^{-2},\ell^{-1},\ell^{0},\ell^{1}]$.
So a 100 µm silicon block feels an electrostatic acceleration 100 times larger than a 1 cm block under the same field. Small
things are *quick*.

```viz
b1-forces-chart
```

**Why insects walk on water.** Weight $\rho g_{\text{grav}}\ell^3$ and surface tension $\gamma\ell$ are equal when
$\ell=\sqrt{\gamma/(\rho g_{\text{grav}})}$. For water this length is 2.7 mm, called the **capillary length**. A
water strider's legs touch the surface along a couple of centimetres, so surface tension can hold about 30 times its
weight. A 70 kg person would need about 4.8 km of contact line. Below a few millimetres, gravity is a minor detail. Above
a few centimetres, surface tension is.

**Why MEMS uses electrostatics while big motors use magnets.** Big motors win with $\ell^4$: a 10 cm copper coil
easily makes about 1 T, a magnetic pressure of about 400 kPa. In air at large gaps the electric field cannot exceed about
$3\times10^6$ V/m (beyond that the air sparks), so the electrostatic pressure is only 40 Pa: 10 000 times weaker.
Shrink to MEMS size and the picture flips. The magnetic force collapses as $\ell^4$, while thin gaps of 1–2 µm can hold
fields near $10^8$ V/m without sparking, which gives an electrostatic pressure of 44 kPa. Electrostatic drives are also simple to make
(two layers of silicon and a voltage, with no coils and no magnets), and the same plates double as a capacitive sensor.
That is why accelerometers, gyroscopes, mirrors and microphones in your phone are electrostatic.

**Springs get stiffer relative to mass, so small things ring at high pitch.** A spring's stiffness $k$ (newtons per
metre) for a beam scales as $k\propto E\ell$, where $E$ is Young's modulus (how stiff the material is). The mass scales
as $m\propto\rho\ell^3$. The natural angular frequency $\omega_0=\sqrt{k/m}$ therefore scales as
$$\omega_0\propto\frac1\ell\sqrt{\frac{E}{\rho}}.$$
Shrink a diving board 1000 times and it vibrates 1000 times faster. A 1 m silicon plank 1 cm thick would sway at
14 Hz. The same shape at 1 mm long rings at 14 kHz, and at 100 µm at 138 kHz. Ringing fast means a MEMS sensor can
follow fast changes, and it shrugs off the slow shaking of a car. [B3](B3-micromechanics-beams-springs-and-resonators.md)
does the exact beam formula.

**Time scales: heat and molecules travel in time $\propto\ell^2$.** Heat spreads by diffusion: in a time $\tau$ it reaches
a distance of about $\sqrt{D_{\text{th}}\tau}$, where $D_{\text{th}}$ is the material's thermal diffusivity
($9\times10^{-5}$ m²/s for silicon). Turned around, the time to heat or cool something of size $\ell$ is
$\tau\approx\ell^2/D_{\text{th}}$. Half the size means a quarter of the time. A 100 µm silicon heater reaches its temperature in about
0.1 ms, which is why a MEMS gas sensor can pulse its heater on and off many times a second. Molecules in a liquid
spread the same way: the time to diffuse a distance $\ell$ is about $\ell^2/(2D)$, where $D$ is the diffusion
coefficient. Glucose crosses 10 µm in 75 ms but needs 20 hours to cross 1 cm. That single fact is why microfluidic chips
([C3](C3-diffusion-mixing-and-the-peclet-number.md)) can mix and react in seconds what a test tube does in hours.

```viz
b1-clocks
```

**The price of small: thermal noise.** Every object at temperature $T$ is jiggled by the random kicks of molecules, with
energy $k_BT\approx4.1\times10^{-21}$ J per degree of freedom ($k_B$ is Boltzmann's constant). For a 1 kg mass that is
nothing. For a proof mass of one microgram it is the noise floor. The random force on a damped mass has a spectral density
$\sqrt{4k_BTb}$ (newtons per $\sqrt{\text{Hz}}$, $b$ = damping), and dividing by the mass gives an acceleration noise
$$a_n=\sqrt{\frac{4k_BT\,\omega_0}{m\,Q_f}},$$
with $Q_f$ the quality factor ([B3](B3-micromechanics-beams-springs-and-resonators.md)). Shrinking by 10 makes the mass 1000
times lighter and the noise $\sqrt{1000}\approx32$ times bigger. This is the same random noise as the Johnson noise of a
resistor in [A8](A8-noise-resolution-calibration-and-drift.md), now shaking a mass instead of electrons. It sets a lower
limit on how small an accelerometer can usefully be.

## Intuitive examples

1. **Ice cubes vs crushed ice.** A 2 cm cube has $A/V=6/\ell=300$ m⁻¹. Cut into 1000 cubes of 2 mm, the total area
   goes from 24 cm² to 240 cm² (×10) and $A/V=3000$ m⁻¹. A 1 µm cube: $6\times10^6$ m⁻¹.
2. **Ant vs human vs elephant.** Strength $\propto$ muscle cross-section $\propto\ell^2$; weight $\propto\ell^3$, so
   strength-to-weight $\propto1/\ell$. A 5 mm ant is 350 times smaller than a 1.75 m person, so the simple law predicts 350 times
   more strength per weight (real ants manage tens of times their weight; joints and posture matter too). An elephant
   (3 m) gets only 0.58 of a human's strength per weight, so it cannot jump.
3. **Water strider.** Mass 10 mg, weight 0.098 mN. With about 2 cm of leg on the water and surface tension pulling on both
   sides, the maximum support is $2\gamma L=2.88$ mN, a margin of about ×29. The capillary length of water is
   $\sqrt{\gamma/(\rho g_{\text{grav}})}=2.71$ mm. A 70 kg human would need 4769 m (4.8 km) of contact line.
4. **The same shape rings 1000 times faster.** A silicon cantilever with length $L$ and thickness $t=L/100$ has
   $f_0=0.16154\,(t/L^2)\sqrt{E/\rho}$ with $\sqrt{E/\rho}=8517$ m/s. At $L=1$ m it is 13.76 Hz, at 1 mm 13.76 kHz,
   and at 100 µm 137.6 kHz.
5. **Heating time.** Silicon's $D_{\text{th}}=149/(2330\times705)=9.07\times10^{-5}$ m²/s. A 100 µm heater needs
   $\ell^2/D_{\text{th}}=0.11$ ms. A 1 cm block needs 1.1 s, 10 000 times longer for 100 times the size.
6. **Diffusion time** for glucose ($D=6.7\times10^{-10}$ m²/s): 10 µm in 0.075 s, 1 mm in 746 s (12.4 min), 1 cm in
   74 600 s (20.7 h).
7. **Thermal noise of a proof mass** ($f_0=5$ kHz, $Q_f=1$, 25 °C, $k_BT=4.116\times10^{-21}$ J): $m=1$ µg gives
   $a_n=7.19\times10^{-4}$ m/s²/√Hz, about 73 millionths of $g_{\text{grav}}$ per √Hz. That is a typical phone accelerometer.
   A 1 ng mass (the same design 10× smaller in size) gives $0.0227$ m/s²/√Hz, 31.6 times worse; a 1 g mass gives $7.19\times10^{-7}$.
8. **Electric vs magnetic pressure.** $\tfrac12\varepsilon_0\mathcal E^2=39.84$ Pa at $3\times10^6$ V/m (air
   breakdown at mm gaps) and $4.427\times10^4$ Pa at $10^8$ V/m (a µm gap). $B^2/(2\mu_0)=3.979\times10^5$ Pa at 1 T. A
   coil with $J=10^7$ A/m² makes $B\approx\mu_0J\ell=1.26$ T at 10 cm, 0.126 T at 1 cm and only $1.26\times10^{-4}$ T at
   10 µm.
9. **Fog floats.** A 10 µm water droplet falling in air (Stokes drag vs weight) settles at only 3.03 mm/s. Its
   weight ($\ell^3$) is tiny next to the drag ($\ell$).

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $A\propto\ell^2,\ V\propto\ell^3,\ A/V=6/\ell$ (cube) | surface wins as things shrink | $\ell$ size, $A$ area, $V$ volume |
| $F_{\text{grav}}=\rho g_{\text{grav}}\ell^3$ | weight and inertia $\propto\ell^3$ | $\rho$ density, $g_{\text{grav}}$ gravity |
| $F_{\text{es}}=\tfrac12\varepsilon_0\mathcal E^2\ell^2$ | electrostatic pull at fixed field $\propto\ell^2$ | $\varepsilon_0$ permittivity, $\mathcal E$ field |
| $F_{\text{st}}=\gamma\ell$, $F_{\text{visc}}=6\pi\mu\ell U$ | surface tension, Stokes drag $\propto\ell$ | $\gamma$ surface tension, $\mu$ viscosity, $U$ speed |
| $F_{\text{mag}}\approx\tfrac12\mu_0J^2\ell^4$ | coil force at fixed current density $\propto\ell^4$ | $\mu_0$ permeability, $J$ current density |
| $F\propto[\ell^1,\ell^2,\ell^3,\ell^4]$, $a\propto[\ell^{-2},\ell^{-1},\ell^0,\ell^1]$ | Trimmer's bracket: force and acceleration | $a$ acceleration |
| $\ell_c=\sqrt{\gamma/(\rho g_{\text{grav}})}$ | below $\ell_c$ surface tension beats weight (2.7 mm for water) | $\ell_c$ capillary length |
| $\omega_0=\sqrt{k/m}\propto\dfrac1\ell\sqrt{E/\rho}$ | small things ring at high frequency | $k$ stiffness, $E$ Young's modulus |
| $\tau_{\text{th}}\approx\ell^2/D_{\text{th}}$, $t_{\text{diff}}\approx\ell^2/(2D)$ | heat and molecules travel in time $\propto\ell^2$ | $D_{\text{th}}$ thermal diffusivity, $D$ diffusion coefficient |
| $a_n=\sqrt{4k_BT\omega_0/(mQ_f)}\propto\ell^{-3/2}$ | thermal noise grows as the mass shrinks (at fixed $\omega_0$) | $k_B$ Boltzmann, $T$ temperature, $Q_f$ quality factor |

## Applications

| World | Scaling with size $\ell$ | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | water rises in xylem vessels tens of µm wide by capillarity, where surface tension ($\ell$) beats weight ($\ell^3$); a leaf (thin, large $A/V$) reaches air temperature within seconds | why a leaf-clip thermometer must be tiny and light, and why sap-flow chips use µm channels ([C2](C2-pressure-driven-flow-and-hydraulic-circuits.md), [C4](C4-surface-tension-capillarity-droplets-and-electrokinetics.md)) |
| 🧬 Biology & human health | cells are 10 µm: oxygen and glucose diffuse across them in milliseconds; a 1 mm blob would starve without blood vessels | why organs need capillaries and why organ-on-chip channels are 100 µm, not 1 cm ([C5](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md)) |
| 🌍 Environment | fog droplets (10 µm) settle at 3 mm/s and stay airborne; MEMS hot-plate gas sensors heat 100 µm membranes in about 0.1 ms using milliwatts | particulate counters must handle floating particles; a battery-powered NO₂ sensor can pulse its heater |
| 🤖 Robotics & drones | a drone IMU's proof mass is µg-sized, so it ignores motor vibration below its kHz resonance but pays a thermal-noise floor | choose the IMU by its noise density in µg/√Hz ([B4](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md), [A9](A9-sensor-fusion-and-the-kalman-filter.md)) |
| 🚗 Cars | the airbag accelerometer is electrostatically self-tested at every start (electrostatics beats magnetics at 100 µm); big motors and seat actuators stay magnetic | the force law follows the size: comb drives inside the chip, coils outside |
| 📱 Phones & photography | MEMS microphones, gyroscopes and autofocus mirrors are electrostatic; camera OIS lenses (mm-sized, heavier) still use voice-coil magnets | the crossover between electrostatic and magnetic actuation lies in the mm range |
| 🏠 Home & household | crushed ice cools faster (10× the surface); a tiny thermistor bead reads the room in seconds, a big metal probe in minutes | fast sensors are small sensors ([A2](A2-resistive-sensors-and-the-wheatstone-bridge.md)) |

## Derivation

**(a) Area and volume of a shrunken shape.**
1. Scale every length by a factor $\lambda_s$: $x\to\lambda_s x$, for all three coordinates.
2. An area element $dA=dx\,dy$ becomes $\lambda_s^2\,dA$, so every area scales as $\lambda_s^2$.
3. A volume element $dV=dx\,dy\,dz$ becomes $\lambda_s^3\,dV$, so every volume (and mass, at fixed $\rho$) scales as $\lambda_s^3$.
4. Therefore $A/V\propto\lambda_s^{-1}$; for a cube $A/V=6\ell^2/\ell^3=6/\ell$.
5. Cutting a cube into $n^3$ pieces: total area $n^3\cdot6(\ell/n)^2=6\ell^2n$, which is $n$ times the original.

**(b) The force exponents.**
1. Gravity: $F=\rho V g_{\text{grav}}=\rho g_{\text{grav}}\ell^3$, exponent 3. Inertia $m\ddot x$ at a fixed acceleration: also 3.
2. Electrostatic: energy density in the field $u=\tfrac12\varepsilon_0\mathcal E^2$ (J/m³ = N/m², a pressure). Force = pressure × area $\propto\ell^2$.
3. At fixed *voltage* instead: $\mathcal E=V/g$ with gap $g\propto\ell$, so $F=\varepsilon_0AV^2/(2g^2)\propto\ell^0$. Shrinking helps even more.
4. Surface tension: force = $\gamma$ × contact length $\propto\ell$. Stokes drag $6\pi\mu rU$ at fixed $U$: $\propto\ell$.
5. Magnetic: current $I=J\ell^2$; field at distance $\ell$ from a wire $B=\mu_0I/(2\pi\ell)\propto\mu_0J\ell$.
6. Magnetic pressure $B^2/(2\mu_0)\propto\mu_0J^2\ell^2$; times area $\ell^2$: $F\propto\ell^4$.

**(c) Acceleration and travel time (Trimmer).**
1. $a=F/m$ with $m\propto\ell^3$: $a\propto[\ell^{-2},\ell^{-1},\ell^0,\ell^1]$.
2. Time to move a distance $x\propto\ell$ from rest: $x=\tfrac12at^2$ ⇒ $t=\sqrt{2x/a}\propto\sqrt{\ell/a}$.
3. So $t\propto[\ell^{1.5},\ell^{1},\ell^{0.5},\ell^{0}]$: every actuator gets faster when small, electrostatic ones in proportion to $\ell$.

**(d) Crossover lengths.**
1. Weight = surface tension: $\rho g_{\text{grav}}\ell^3=\gamma\ell$ ⇒ $\ell_c=\sqrt{\gamma/(\rho g_{\text{grav}})}$.
2. Electrostatic = magnetic: $\tfrac12\varepsilon_0\mathcal E^2\ell^2=\tfrac12\mu_0J^2\ell^4$ ⇒ $\ell=\dfrac{\mathcal E}{J}\sqrt{\varepsilon_0/\mu_0}$.
3. With $\mathcal E=3\times10^6$ V/m and $J=10^7$ A/m², this gives 0.80 mm; with $10^8$ V/m it gives 26.5 mm.

**(e) Resonance.**
1. A beam's stiffness: $k=Ewt^3/(4L^3)$ ([B3](B3-micromechanics-beams-springs-and-resonators.md)); with all lengths $\propto\ell$: $k\propto E\ell^4/\ell^3=E\ell$.
2. Mass $m=\rho Lwt\propto\rho\ell^3$.
3. $\omega_0=\sqrt{k/m}\propto\sqrt{E\ell/(\rho\ell^3)}=\dfrac1\ell\sqrt{E/\rho}$.

**(f) Diffusion times.**
1. Heat diffusion: $\partial T/\partial t=D_{\text{th}}\nabla^2T$. With $t\sim\tau$ and $\nabla^2\sim1/\ell^2$, balancing gives $1/\tau\sim D_{\text{th}}/\ell^2$.
2. So $\tau_{\text{th}}\sim\ell^2/D_{\text{th}}$; molecules in 1D spread as $\sqrt{2Dt}$, so $t_{\text{diff}}=\ell^2/(2D)$ ([C3](C3-diffusion-mixing-and-the-peclet-number.md)).

**(g) Thermal noise.**
1. Damping $b=m\omega_0/Q_f$ (from $Q_f=\sqrt{km}/b$ and $k=m\omega_0^2$).
2. Thermal force noise density $\sqrt{4k_BTb}$ (the mechanical twin of Johnson noise $\sqrt{4k_BTR}$, [A8](A8-noise-resolution-calibration-and-drift.md)).
3. Divide by $m$: $a_n=\sqrt{4k_BTb}/m=\sqrt{4k_BT\omega_0/(mQ_f)}$.
4. With $m\propto\ell^3$ and $\omega_0\propto1/\ell$: $a_n\propto\sqrt{\ell^{-1}/\ell^3}=\ell^{-2}$ for a fully shrunk device, or $\ell^{-3/2}$ if $\omega_0$ is held fixed.

## Worked check

Take a 1 cm silicon cube ($\rho=2330$ kg/m³) and shrink it 100 times to 100 µm.

- $A/V$: $6/0.01=600$ m⁻¹ → $6/10^{-4}=6\times10^4$ m⁻¹ (×100).
- Weight $\rho g_{\text{grav}}\ell^3$: $2.286\times10^{-2}$ N → $2.286\times10^{-8}$ N (×10⁻⁶).
- Surface tension $\gamma\ell$: $7.2\times10^{-4}$ N → $7.2\times10^{-6}$ N (×10⁻²). The ratio surface/weight goes from 0.0315 to 315.
- Electrostatic at $3\times10^6$ V/m, $39.84\,\ell^2$: $3.98\times10^{-3}$ N → $3.98\times10^{-7}$ N.
- Magnetic at $J=10^7$ A/m², $6.283\times10^7\,\ell^4$: 0.628 N → $6.28\times10^{-9}$ N. The ratio electrostatic/magnetic goes
  from 0.0063 (magnets win 160 times) to 63.4 (electrostatics wins 63 times).
- Acceleration from the electrostatic force: $1.71$ m/s² → 171 m/s² (×100, the $\ell^{-1}$ entry), while gravity stays 9.81 m/s².
- Heating time $\ell^2/D_{\text{th}}$: 1.1 s → 0.11 ms (×10⁻⁴).

All numbers come from `scripts/checks/B1_check.py`.

## Whiteboard plan

- **Panel 1: the cube.** Draw a cube of side $\ell$, then the same cube cut into 27 pieces. Write $A=6\ell^2$, $V=\ell^3$,
  $A/V=6/\ell$, and "cut n per side → area ×n". Say: "Same ice, ten times the surface, ten times faster melting."
- **Panel 2: the bracket.** Write Trimmer's column $[\ell^1,\ell^2,\ell^3,\ell^4]$ with the four force names next to it.
  Arrow: "shrink ⇒ the top rows win."
- **Panel 3: log-log plot.** Axes $\log\ell$ and $\log F$; four straight lines with slopes 1, 2, 3, 4. Circle the crossing of
  slope 1 and slope 3 at a few mm and label it "water strider zone". Circle the crossing of slopes 2 and 4: "below here MEMS goes electrostatic".
- **Panel 4: a ringing ruler.** Draw a long ruler and a tiny one. Write $\omega_0=\sqrt{k/m}$, $k\propto\ell$, $m\propto\ell^3$
  ⇒ $\omega_0\propto1/\ell$. Say: "1000× smaller, 1000× higher pitch."
- **Panel 5: clocks.** Write $\tau\propto\ell^2$ for heat and molecules: 10 µm → 75 ms, 1 cm → 20 h for glucose.
- **Panel 6: the price.** A tiny mass being kicked by molecules: $a_n=\sqrt{4k_BT\omega_0/(mQ_f)}$. Say: "Small is fast and strong,
  but noisy."

## Common mistakes and where the intuition breaks

- **Scaling laws are ratios, not values.** "$F\propto\ell^2$" says what happens when you shrink a *given* design. It does
  not say an electrostatic force is large; the prefactor (field, material) still matters. Always compare two forces at the
  same $\ell$.
- **Assuming everything shrinks together.** Real devices do not scale uniformly. Gaps can shrink faster than plates,
  voltages are often held fixed, and films have a fixed thickness set by the process. Re-derive the exponent for the
  quantity that is actually held constant (fixed field gives $\ell^2$; fixed voltage gives $\ell^0$).
- **The magnetic $\ell^4$ assumes fixed current density.** Small wires cool better, so microcoils can carry 10–100 times
  more current density, which softens $\ell^4$ toward $\ell^3$ or $\ell^2$. Magnetics is not impossible in MEMS (phone
  compasses, some mirrors), just usually not worth it.
- **Fields do not stay fixed either.** Air sparks at about 3 V/µm for mm gaps, but much higher fields survive in µm gaps (the Paschen
  curve), which is one more gift of smallness to electrostatics.
- **Continuum physics has a floor.** Below about 10 nm, surfaces become atomic, gases stop behaving like fluids (the mean free
  path of air is 68 nm) and quantum effects appear. The laws here hold from about 1 µm up to metres.
- **Small is noisy.** Thermal noise, Brownian motion and sticking (stiction, [B2](B2-microfabrication-lithography-etching-deposition.md))
  all grow in importance as you shrink. Scaling explains what MEMS can do, and also what it cannot.

## Remember

**"Shrink by 10: lengths ÷10, areas ÷100, volumes ÷1000. Surface forces win, things get fast, and noise grows."**

## Self-test

1. A MEMS mirror is shrunk by a factor of 2 in every direction while the electric field in its gap is kept fixed. By what
   factor does the electrostatic force change, and the angular acceleration it can produce?
   <details><summary>Answer</summary>Force ∝ ℓ², so it falls to 1/4. Mass ∝ ℓ³ falls to 1/8, so linear acceleration a = F/m doubles (∝ 1/ℓ). The moment of inertia ∝ ℓ⁵ falls to 1/32 and the torque ∝ ℓ³ falls to 1/8, so the angular acceleration grows 4×. Smaller mirrors scan faster.</details>
2. Why can a mosquito land on water, but a sparrow cannot?
   <details><summary>Answer</summary>Weight scales as ℓ³ and surface tension support as ℓ. They balance near the capillary length of water, about 2.7 mm. A mosquito (a few mm, a few mg) is near or below it, so surface tension can hold it. A sparrow (about 15 cm, 25 g) is far above it: its weight is thousands of times larger than what surface tension along its feet can supply.</details>
3. A 1 mm gas-sensor heater reaches temperature in 11 ms. How fast would a 100 µm version be, and why does that save battery?
   <details><summary>Answer</summary>Thermal time ∝ ℓ², so 10× smaller is 100× faster: about 0.11 ms. The heater can be pulsed on only briefly for each reading, and the heat capacity (∝ ℓ³) is 1000× smaller, so each pulse costs far less energy.</details>

**Next:** [B2 Microfabrication: lithography, etching, deposition](B2-microfabrication-lithography-etching-deposition.md): now that we know small machines are worth building, here is how to build them out of a silicon wafer.
