# A3. Capacitive sensors

> **Connects:** builds on [A1 What a sensor is](A1-what-a-sensor-is-transduction-and-the-measurement-chain.md), [A2 Resistive sensors and the Wheatstone bridge](A2-resistive-sensors-and-the-wheatstone-bridge.md) · used by [A7 Signal conditioning](A7-signal-conditioning-amplifiers-filters-and-adcs.md), [B3 Micromechanics](B3-micromechanics-beams-springs-and-resonators.md), [B4 MEMS inertial sensors](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md), [B5 MEMS microphones, pressure sensors and actuators](B5-mems-microphones-pressure-sensors-and-actuators.md), [C5 Lab-on-a-chip](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md)

## Hook — two hands almost clapping

Hold your hands flat, palms facing, a few centimetres apart, and bring them slowly together. Nothing touches, yet if your
palms were metal plates with a battery between them, something would grow steadily as they approach: the amount of charge
they can hold. Halve the gap and they hold twice as much. Make the hands bigger and they hold more. Slip a sheet of wet
paper between them and they hold much more, because water is very good at "helping" an electric field.

That stored-charge-per-volt is the **capacitance**, and each of those three moves is a sensor. Change the **gap** and you
have the accelerometer and microphone in your phone (B4, B5). Change the **overlap area** and you have a rotary knob or a
MEMS comb drive. Change the **material in between** and you have a humidity sensor, a soil-moisture probe or a fuel gauge.
Your phone's touchscreen uses yet another version: your finger, a salty bag of water connected to the ground, steals
field lines from a grid of invisible electrodes under the glass.

## The idea in plain words

**Capacitance.** Two conductors separated by an insulator form a **capacitor**. Put a voltage $V$ across them and a charge
$+q$ collects on one and $-q$ on the other. The ratio is the **capacitance**,
$$C=\frac{q}{V},$$
measured in farads (F). Sensor capacitances are tiny: picofarads (1 pF $=10^{-12}$ F) and femtofarads (1 fF $=10^{-15}$ F).
Unlike a resistor, an ideal capacitor does not consume power. It stores energy and gives it back, so capacitive sensors can
run on very little current, and they do not heat themselves (compare A2).

**The parallel-plate capacitor.** Two plates of area $A$ a gap $g$ apart, with a material of **relative permittivity**
$\varepsilon_r$ in between, have
$$C=\frac{\varepsilon_0\varepsilon_rA}{g},$$
where $\varepsilon_0=8.854\times10^{-12}$ F/m is the permittivity of empty space. The relative permittivity says how
strongly a material's molecules line up to weaken the field and "make room" for more charge: air ≈ 1, plastics 2–4, glass
≈ 7, dry soil ≈ 4, and water ≈ 80, because water molecules are strong little dipoles. A 1 mm × 1 mm plate pair 2 µm apart
in air has $C=4.427$ pF.

**Three knobs, three kinds of sensor.** The formula has three things the world can change:
- **Gap** $g$: a plate moves, as in accelerometers, microphones and pressure membranes. $C\propto1/g$ is *nonlinear*.
- **Area** $A$: plates slide past each other, as in comb fingers, rotary encoders and fluid level. $C\propto A$ is *linear*.
- **Dielectric** $\varepsilon_r$: the material changes, as in humidity films, soil moisture and ice detection. $C\propto\varepsilon_r$ is linear.

Play with all three in the 3D capacitor below. Field lines are teal (electrical), the dielectric is blue (it is the
stimulus there), and the plates are grey.

```viz
a3-plates-3d
```

**The gap is nonlinear, and the differential capacitor fixes it.** If a plate moves by $x$ toward the other, the gap becomes
$g_0-x$ and
$$C(x)=\frac{\varepsilon_0\varepsilon_rA}{g_0-x}=\frac{C_0}{1-x/g_0},$$
with $C_0$ the rest capacitance. For small $x$ this is $C\approx C_0(1+x/g_0)$, a sensitivity of $C_0/g_0$ (A1:
linearise). For bigger moves the curve bends up steeply: at $x=0.1\,g_0$ the true value is $1.111\,C_0$, not $1.10\,C_0$,
and at $x=0.5\,g_0$ it is $2\,C_0$, not $1.5\,C_0$. The cure is the same "divide to compare" trick as the Wheatstone bridge
(A2). Put a **movable middle plate** between two fixed plates. When it moves by $x$, one gap shrinks to $g_0-x$ and the other
grows to $g_0+x$, so $C_1$ rises and $C_2$ falls. Then
$$\frac{C_1-C_2}{C_1+C_2}=\frac{x}{g_0}\qquad\text{exactly.}$$
The ratio is perfectly linear in $x$, and anything that changes both capacitors the same way (temperature, humidity in
the gap, the supply voltage) cancels. Almost every MEMS accelerometer and gyroscope (B4) is a differential capacitor.

**Fringe fields.** The formula assumes the field stays neatly between the plates. In reality some field lines bulge out
around the edges, the **fringe field**, and add capacitance. When the gap is tiny compared with the plate (2 µm vs 1 mm)
the extra is only about 1%. When the gap is comparable to the plate size, as for a touchscreen electrode under 0.5 mm of
glass or a soil probe, fringing *is* the sensor. These sensors are often **coplanar**: two electrodes side by side on one
board, whose arching fringe field reaches out into whatever lies in front of them (soil, a finger, a liquid).

**Soil moisture and humidity: sensing the dielectric.** A capacitive soil probe is a pair of coplanar electrodes, coated so
that no current flows. Its fringe field passes half through the board and half through the soil, so its capacitance is
roughly $C\approx C_{\text{half}}(\varepsilon_{r,\text{soil}}+\varepsilon_{r,\text{board}})$, where $C_{\text{half}}$ (local
to this note) is the vacuum capacitance of one half-space. Water's $\varepsilon_r\approx80$ dominates the mixture. An
empirical rule called the **Topp equation**,
$$\varepsilon_{r,\text{soil}}\approx3.03+9.3\,\theta+146\,\theta^2-76.7\,\theta^3,$$
links it to the **volumetric water content** $\theta$ (m³ of water per m³ of soil, local to this note). A **capacitive humidity
sensor** uses a thin polymer film as the dielectric. Water vapour soaks in and raises $\varepsilon_r$, so $C$ climbs by a
fraction of a picofarad per %RH.

**Touchscreens: self and mutual capacitance.** Under the glass of a phone are two layers of transparent indium-tin-oxide
(ITO) strips, rows and columns about 5 mm apart.
- **Self-capacitance** measures each strip against ground. A finger near a strip adds a path to ground through your body,
  so the strip's capacitance *rises*. It is sensitive and simple, but with two fingers you only know which two rows and which
  two columns are touched, which gives four candidate points, two of them "ghosts".
- **Mutual capacitance** drives one row (the transmitter) and measures the charge arriving on each column (the receiver),
  node by node. A finger near a crossing *steals* some of the field lines and sends them to ground, so the **mutual
  capacitance drops**, typically by 10–20%. Every crossing is measured separately, so ten fingers give ten clean blobs. Phones
  use mutual capacitance.

The controller sees a small heatmap of $\Delta C$ and computes the **centroid** (the $\Delta C$-weighted average position) of
each blob. That is why it can locate your finger to well under a millimetre with 5 mm electrodes. Move the finger over the
grid below.

```viz
a3-touch-grid-3d
```

**Reading out picofarads.** Two common circuits:
- **Charge amplifier.** Apply a voltage step $V_{\text{ex}}$ to the sensor. The charge $q=CV_{\text{ex}}$ that flows is
  collected on a feedback capacitor $C_f$ around an op-amp, giving $V_{\text{out}}=-V_{\text{ex}}C/C_f$. With a differential
  sensor driven by opposite steps, only the difference arrives: $V_{\text{out}}=V_{\text{ex}}(C_1-C_2)/C_f$. This is how MEMS
  accelerometers read attofarad changes (A7).
- **RC timing.** Charge the sensor through a resistor $R$ and time how long it takes to cross a threshold. The voltage rises
  as $V(t)=V_{\text{ex}}(1-e^{-t/RC})$ (A1's first-order lag), so the time to reach half the supply is $RC\ln2$. Doubling $C$
  doubles the time. Microcontroller touch buttons and cheap soil sensors work this way, or use an oscillator whose frequency
  is proportional to $1/(RC)$.

```viz
a3-rc-timing
```

## Intuitive examples

1. **A MEMS-size capacitor.** Plates of 1 mm × 1 mm, 2 µm apart, in air: $C_0=4.427$ pF. Close the gap to 1 µm and it
   doubles to 8.854 pF. The slope at rest is $C_0/g_0=2.213$ pF/µm $=2.21$ fF per nanometre.
2. **Gap nonlinearity and the differential cure.** Move the middle plate by $0.1g_0=0.2$ µm. Then $C_1=4.919$ pF and $C_2=4.025$ pF.
   One-sided, $C_1/C_0=1.1111$ instead of the linear 1.10, so the change is 11.1% larger than the linear prediction. But
   $(C_1-C_2)/(C_1+C_2)=0.1000=x/g_0$ exactly. At $x=0.3g_0$: $C_1=1.4286\,C_0$ (linear guess 1.30), and the ratio is still
   exactly 0.3000.
3. **A humidity sensor.** A polymer sensor reads 180.0 pF at 55% RH and rises by 0.34 pF per %RH: 171.5 pF at 30% RH and
   188.5 pF at 80% RH. The whole range is a 17.0 pF swing, 9.4% of the base value.
4. **Soil moisture.** With $C_{\text{half}}=2$ pF and an FR4 board ($\varepsilon_r=4.4$): dry soil ($\theta=0.05$,
   $\varepsilon_r=3.85$) gives 16.5 pF. Moist soil ($\theta=0.30$, $\varepsilon_r=16.89$) gives 42.6 pF, and wet soil
   ($\theta=0.40$, $\varepsilon_r=25.20$) gives 59.2 pF. Charged through 1 MΩ, the time to half supply goes from 11.4 µs to
   29.5 µs to 41.0 µs. A microcontroller timer counts that easily.
5. **A fingertip on glass.** A 25 mm² finger pad through 0.5 mm of cover glass ($\varepsilon_r=7$) forms about 3.10 pF with the
   electrode below. A mutual node of about 1.0 pF loses 0.15 pF (15%) under a finger. A 70 × 150 mm screen with 5 mm pitch
   has 14 × 30 = 420 nodes but only 44 self-capacitance channels. Scanning at 120 Hz means 50 400 node readings per second.
6. **Sub-pitch position.** Three neighbouring columns at 0, 5 and 10 mm show $\Delta C=0.05$, 0.20 and 0.15 pF. The centroid
   is $(0\cdot0.05+5\cdot0.20+10\cdot0.15)/0.40=6.25$ mm. The finger is a bit right of the middle electrode, located far more
   finely than the 5 mm pitch.
7. **Fringing matters when the gap is large.** For a 1 mm square plate, Palmer's edge-correction formula gives +1.2% extra
   capacitance at $g=2$ µm, +35.4% at 100 µm and +144.0% at 500 µm. At that last size the "parallel-plate" formula
   underestimates the capacitance by more than a factor of two.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $C=q/V$ | capacitance: charge stored per volt | $q$ charge, $V$ voltage |
| $C=\varepsilon_0\varepsilon_rA/g$ | parallel plates | $\varepsilon_0=8.854$ pF/m, $\varepsilon_r$ relative permittivity, $A$ area, $g$ gap |
| $C(x)=\dfrac{C_0}{1-x/g_0}\approx C_0\Big(1+\dfrac{x}{g_0}\Big)$ | gap sensing: nonlinear, slope $C_0/g_0$ | $x$ displacement toward the plate |
| $\dfrac{C_1-C_2}{C_1+C_2}=\dfrac{x}{g_0}$ | differential capacitor: exactly linear | $C_{1,2}=\varepsilon_0\varepsilon_rA/(g_0\mp x)$ |
| $C\propto A$, $C\propto\varepsilon_r$ | area and dielectric sensing: linear | |
| $\varepsilon_{r}\approx3.03+9.3\theta+146\theta^2-76.7\theta^3$ | Topp equation for soil | $\theta$ volumetric water content |
| $V_{\text{out}}=-V_{\text{ex}}\,C/C_f$; differential $V_{\text{ex}}(C_1-C_2)/C_f$ | charge amplifier | $C_f$ feedback capacitor |
| $t_{1/2}=RC\ln2$ | RC timing to half the supply | $R$ charging resistor |
| $x_c=\dfrac{\sum_i x_i\,\Delta C_i}{\sum_i\Delta C_i}$ | touch centroid | $x_i$ electrode positions |

## Applications

| World | Capacitive sensing | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | capacitive soil-moisture probes at several depths; leaf-wetness sensors (a film whose $\varepsilon_r$ jumps when dew forms) | when and how much to irrigate; fungal-disease risk after long leaf wetness |
| 🧬 Biology & human health | capacitive ECG electrodes through clothing; breathing belts; cell counters in chips that see a cell change $\varepsilon_r$ between electrodes (C5) | heart and breathing without skin contact; cell number and size |
| 🌍 Environment | capacitive humidity films in every weather station and air-quality monitor; ice detectors on wind turbines | dew point, fog risk, de-icing |
| 🤖 Robotics & drones | capacitive tactile skins that feel a hand before contact; MEMS accelerometers and gyroscopes (differential) in IMUs (B4) | safe human–robot interaction; attitude and stabilisation |
| 🚗 Cars | airbag accelerometers; rain sensors behind the windscreen; capacitive door handles and seat-occupancy sensing | crash detection in milliseconds; automatic wipers; keyless entry |
| 📱 Phones & photography | mutual-capacitance touchscreen; MEMS microphones (B5); accelerometers for screen rotation and image stabilisation | where your fingers are, 120 times a second; sound; steady photos |
| 🏠 Home & household | touch buttons on induction hobs; washing-machine water level; fill-level sensors in coffee machines; smart-thermostat humidity | buttons with no moving parts; how full a tank is |

## Derivation

**(a) The parallel-plate formula.**
1. Charge $q$ spread over area $A$ gives a surface charge density $q/A$.
2. Gauss's law between large plates: field $\mathcal E=\dfrac{q}{\varepsilon_0\varepsilon_rA}$, uniform across the gap.
3. Voltage is field × distance: $V=\mathcal E g=\dfrac{qg}{\varepsilon_0\varepsilon_rA}$.
4. $C=q/V=\dfrac{\varepsilon_0\varepsilon_rA}{g}$.

**(b) Gap sensing is nonlinear.**
1. $C(x)=\dfrac{\varepsilon_0\varepsilon_rA}{g_0-x}=\dfrac{C_0}{1-u}$ with $u=x/g_0$.
2. Geometric series: $\dfrac{1}{1-u}=1+u+u^2+\dots$, so $C\approx C_0(1+u+u^2)$.
3. The linear term gives sensitivity $C_0/g_0$; the $u^2$ term is the nonlinearity (11.1% vs 10% at $u=0.1$).

**(c) The differential capacitor is exactly linear.**
1. $C_1=\dfrac{C_0}{1-u}$, $C_2=\dfrac{C_0}{1+u}$.
2. $C_1-C_2=C_0\dfrac{(1+u)-(1-u)}{1-u^2}=\dfrac{2C_0u}{1-u^2}$.
3. $C_1+C_2=C_0\dfrac{(1+u)+(1-u)}{1-u^2}=\dfrac{2C_0}{1-u^2}$.
4. Divide: $\dfrac{C_1-C_2}{C_1+C_2}=u=\dfrac{x}{g_0}$. The $1-u^2$ and $C_0$ (which carries $\varepsilon_r$, $A$ and temperature) cancel.

**(d) Charge amplifier.**
1. A voltage step $V_{\text{ex}}$ on the sensor pushes charge $q=CV_{\text{ex}}$ toward the op-amp input.
2. The op-amp holds its input at 0 V, so all of that charge must go onto $C_f$.
3. $V_{\text{out}}=-q/C_f=-V_{\text{ex}}C/C_f$. With opposite steps on $C_1$ and $C_2$: $q=V_{\text{ex}}(C_1-C_2)$.

**(e) RC timing.**
1. Charging through $R$: $RC\,\dot V+V=V_{\text{ex}}$ (A1's first-order lag with $\tau=RC$).
2. Solution from 0: $V=V_{\text{ex}}(1-e^{-t/RC})$.
3. Set $V=V_{\text{ex}}/2$: $e^{-t/RC}=1/2$ ⇒ $t_{1/2}=RC\ln2$, proportional to $C$.

**(f) Centroid interpolation.**
1. Treat each node's $\Delta C_i$ as a weight at its position $x_i$.
2. The weighted mean $x_c=\sum x_i\Delta C_i/\sum\Delta C_i$ is the centre of the blob.
3. It is unbiased when the blob is symmetric and spans at least three electrodes, which is why electrode pitch (5 mm) is chosen close to a finger's width.

## Worked check

**Differential capacitor**, $A=1$ mm², $g_0=2$ µm, air, middle plate moved by $x=0.2$ µm ($u=0.1$).
- $C_0=8.854\times10^{-12}\times10^{-6}/(2\times10^{-6})=4.427$ pF.
- $C_1=4.427/0.9=4.919$ pF, $C_2=4.427/1.1=4.025$ pF.
- $(C_1-C_2)/(C_1+C_2)=0.894/8.944=0.1000=x/g_0$ ✓.
- One-sided: $C_1/C_0=1.1111$ vs the linear guess 1.10 ✓.

**Charge-amplifier readout** of a 10 nm move: $C_1-C_2=44.3$ fF; with $V_{\text{ex}}=3.3$ V and $C_f=1$ pF,
$V_{\text{out}}=3.3\times0.0443=146$ mV ✓.

**Soil** at $\theta=0.30$: $\varepsilon_r=3.03+2.79+13.14-2.07=16.89$; $C=2(16.89+4.4)=42.6$ pF; $t_{1/2}=10^6\times42.6\times10^{-12}\times0.693=29.5$ µs ✓.
All numbers come from `scripts/checks/A3_check.py`.

## Whiteboard plan

- **Panel 1 — two plates.** Draw plates with $+q$ and $-q$, straight field lines between them and curved ones at the edges.
  Write $C=\varepsilon_0\varepsilon_rA/g$ with three arrows: "move it, slide it, fill it".
- **Panel 2 — $1/g$ is curved.** Plot $C$ against $x$: a hyperbola rising steeply toward $x=g_0$, and its tangent at 0. Mark
  11.1% vs 10%.
- **Panel 3 — the differential sandwich.** Three plates, the middle one shifted right. Write $C_1\uparrow$, $C_2\downarrow$ and
  box $\frac{C_1-C_2}{C_1+C_2}=\frac{x}{g_0}$. Say: "the Wheatstone bridge again."
- **Panel 4 — soil.** A probe in the ground with arching fringe lines into the soil, droplets of water ($\varepsilon_r=80$) among
  grains ($\varepsilon_r\approx4$). Write the Topp curve as a rising sketch.
- **Panel 5 — the touch grid.** Rows and columns, a finger blob, a 3 × 3 table of $\Delta C$ numbers, and the centroid
  arithmetic. Side note: self-capacitance with two fingers → four candidates, two ghosts.
- **Panel 6 — readout.** An op-amp with $C_f$ in feedback ($V_{\text{out}}=-V_{\text{ex}}C/C_f$) next to an RC charging curve with
  the half-supply time $RC\ln2$ marked.

## Common mistakes and where the intuition breaks

- **Treating gap sensing as linear.** $C\propto1/g$; the linear formula is only good for $x\ll g_0$. Use differential
  sensing or the exact formula.
- **Forgetting parasitic capacitance.** The wires and pads around a 4 pF sensor can easily add 10–20 pF that changes
  with temperature and with your hand. Guard electrodes and differential designs exist because of this.
- **Assuming a finger always increases $C$.** It does in self-capacitance and *decreases* it in mutual capacitance. A water
  drop on a phone screen confuses self-capacitance more than mutual, and gloves (an insulator) defeat both.
- **Ignoring fringing for wide gaps.** At $g\approx a/2$ the real capacitance is more than twice the formula.
- **Soil probes measure soil, not water.** Salt, temperature and how tightly the soil is packed against the probe also change
  the reading. Calibrate for each soil type (A8).
- **Plates attract.** The voltage that reads a capacitor also pulls the plates together with force $\varepsilon_0AV^2/(2g^2)$:
  12.1 µN at 3.3 V across 2 µm. For a soft MEMS spring that is not small, and above a critical voltage the plate snaps
  shut ("pull-in", B3, B5).
- **Where the picture breaks:** at high frequency or with lossy, salty materials, the capacitor also leaks current, and
  $\varepsilon_r$ itself depends on frequency. Water's 80 drops at gigahertz frequencies. Good soil and biology sensors
  measure at a chosen frequency, or measure the full complex impedance.

## Remember

**"$C=\varepsilon_0\varepsilon_rA/g$: move it, slide it or fill it. Gap is nonlinear, so sense it differentially, $\frac{C_1-C_2}{C_1+C_2}=\frac{x}{g_0}$."**

## Self-test

1. A 4.427 pF air-gap capacitor: what is $C$ if you halve the gap? If you double the area? If you fill it with a polymer of $\varepsilon_r=3$?
   <details><summary>Answer</summary>Halving the gap: 8.85 pF. Doubling the area: 8.85 pF. Filling with εr = 3: 13.28 pF. All three knobs enter the formula as a simple factor.</details>
2. A differential sensor ($g_0=2$ µm) reads $C_1=4.660$ pF and $C_2=4.216$ pF. How far has the middle plate moved?
   <details><summary>Answer</summary>(C1 − C2)/(C1 + C2) = 0.444/8.876 = 0.050, so x = 0.050 × 2 µm = 100 nm toward plate 1.</details>
3. Columns at 10, 15 and 20 mm report ΔC = 0.10, 0.30 and 0.10 pF. Where is the finger? With two fingers, why does a self-capacitance screen get confused?
   <details><summary>Answer</summary>Centroid = (10·0.10 + 15·0.30 + 20·0.10)/0.50 = 15.0 mm. Self-capacitance only says which rows and which columns are touched; two rows × two columns give four crossing points, and two of them are ghosts. Mutual capacitance measures each crossing separately.</details>

**Next:** [A4 Piezoelectric, piezoresistive and magnetic sensors](A4-piezoelectric-piezoresistive-and-magnetic-sensors.md) — materials that make their own charge when squeezed, resistors with a gauge factor of 100, and the Hall effect that lets a car count wheel turns.
