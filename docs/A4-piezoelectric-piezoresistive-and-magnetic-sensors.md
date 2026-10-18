# A4. Piezoelectric, piezoresistive and magnetic sensors

> **Connects:** builds on [A1 What a sensor is](A1-what-a-sensor-is-transduction-and-the-measurement-chain.md), [A2 Resistive sensors and the Wheatstone bridge](A2-resistive-sensors-and-the-wheatstone-bridge.md), [A3 Capacitive sensors](A3-capacitive-sensors.md) · used by [A7 Signal conditioning](A7-signal-conditioning-amplifiers-filters-and-adcs.md), [A9 Sensor fusion](A9-sensor-fusion-and-the-kalman-filter.md), [B4 MEMS inertial sensors](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md), [B5 MEMS microphones, pressure sensors and actuators](B5-mems-microphones-pressure-sensors-and-actuators.md)

## Hook — the click of a gas-grill igniter

Press the button on a gas grill or a kitchen lighter. A spring-loaded hammer snaps onto a little ceramic cylinder, and a
blue spark jumps a few millimetres. There is **no battery**. The spark is made by the ceramic itself: squeeze certain
crystals and electric charge appears on their faces. The same click happens, millions of times smaller, inside a car's
knock sensor, a guitar pickup and the ultrasound probe a doctor presses on your belly.

Now take out your phone and open the compass app. The phone finds north from the Earth's magnetic field, which is about
a hundred times weaker than the field at the surface of a fridge magnet. Your car's ABS brakes count the teeth of a steel wheel spinning past a
magnet more than 700 times a second at motorway speed. **This note is about three ways a solid can feel a push or a
field directly:** it makes a charge (piezoelectric), it changes its resistance (piezoresistive), or it bends moving
charges sideways (Hall effect and magnetoresistance).

## The idea in plain words

**Piezoelectricity: squeezing makes charge.** In most solids the positive ions and the negative ions are arranged so
symmetrically that squeezing just moves everything closer together and nothing electrical happens. In some crystals
(quartz, the ceramic PZT, the plastic PVDF) the unit cell has **no centre of symmetry**. When you squeeze it, the
positive charges move a little differently from the negative ones, so the centre of positive charge no longer sits on
the centre of negative charge. Each cell becomes a tiny **electric dipole**. Billions of dipoles all point the same way;
inside the crystal their charges cancel, but on the two faces a layer of charge is left over: $+q$ on one face, $-q$ on
the other. The rule is beautifully simple:
$$q=d_{33}\,F .$$
Here $F$ is the force (newtons), $q$ the charge (coulombs) and $d_{33}$ the **piezoelectric charge coefficient**,
written in picocoulombs per newton (pC/N). The two subscripts say "charge collected on the faces perpendicular to
direction 3, for a force along direction 3". Quartz has about $2.3$ pC/N, the polymer PVDF about $33$ pC/N, and PZT
ceramic (lead zirconate titanate, a man-made ceramic that is "poled" in a strong field during manufacture) about
$400$ pC/N. Notice what is missing: the area $A$. A bigger crystal spreads the same force over more cells, each cell
makes less dipole, and the total charge comes out the same.

```viz
a4-piezo-3d
```

**From charge to voltage: the crystal is a capacitor.** The two metal electrodes on the faces, with the crystal as the
insulator between them, form a parallel-plate capacitor from [A3](A3-capacitive-sensors.md), $C=\varepsilon_0\varepsilon_rA/t$,
where $t$ is the crystal thickness and $\varepsilon_r$ its relative permittivity. Charge on a capacitor means a voltage
$V=q/C$:
$$V=\frac{d_{33}\,F\,t}{\varepsilon_0\varepsilon_r A}.$$
A thin, wide crystal has a big $C$ and a small voltage; a long, thin rod like the lighter element has a tiny $C$ and a
huge voltage. That is the whole design of an igniter: kilovolts from a thumb press.

**Why a piezo sensor cannot weigh you.** Charge sitting on the electrodes slowly leaks away through the crystal, the
cable and the amplifier input, all of which act like a resistor $R$ in parallel with $C$. That is a first-order system
with time constant $\tau=RC$ (the same lag that appears in [A7](A7-signal-conditioning-amplifiers-filters-and-adcs.md)).
Press and hold, and the voltage decays as $V_0e^{-t/\tau}$; release, and the opposite voltage appears. The sensor
reports **changes** in force, not the force itself. In the language of filters it is a **high-pass filter** with corner
frequency $f_c=1/(2\pi RC)$: vibrations, knocks, sound and heartbeats above $f_c$ pass; a constant load below $f_c$ is
lost. Engineers read piezo sensors with a **charge amplifier**: an op-amp whose feedback capacitor $C_f$ swallows the
charge and outputs $V_{\text{out}}=-q/C_f$, independent of the cable length. A big feedback resistor $R_f$ across $C_f$
sets how slowly the output forgets, $\tau=R_fC_f$.

**Piezoresistivity: squeezing changes resistance.** In [A2](A2-resistive-sensors-and-the-wheatstone-bridge.md) a metal
strain gauge changes resistance mostly because it gets longer and thinner, so its **gauge factor**
$\mathrm{GF}=(\Delta R/R)/\varepsilon$ is about $2$ ($\varepsilon$ is the strain, the relative change of length). In
**doped silicon** something much stronger happens: the strain changes the energy bands of the crystal, which changes how
easily the charge carriers move (their mobility) and how many sit in each band. The resistivity itself changes, and the
gauge factor reaches about $100$, **fifty times more** than metal. That is why every MEMS pressure sensor in a tyre, a
blood-pressure cuff or a phone barometer ([B5](B5-mems-microphones-pressure-sensors-and-actuators.md)) has four
silicon piezoresistors diffused into a thin silicon membrane, wired as a Wheatstone bridge. Unlike a piezoelectric, a
piezoresistor measures a **steady** strain perfectly well: a resistance does not leak. The price is that silicon's
resistance also depends strongly on temperature, which the bridge and calibration must cancel.

**The Hall effect: a magnetic field pushes moving charge sideways.** Send a current $I$ along a thin plate and put it in a
magnetic field $B$ (in tesla, T) pointing through the plate. Each moving carrier feels the magnetic (Lorentz) force,
which acts at right angles to both its velocity and the field. The carriers drift towards one edge. Charge piles up there
(and the opposite charge on the other edge) until the electric field of the piled-up charge pushes back exactly as hard
as the magnetic field pushes. In that balance the two edges sit at a steady voltage, the **Hall voltage**
$$V_H=\frac{I\,B}{n\,q_e\,t}.$$
Here $n$ is the number of mobile carriers per cubic metre, $q_e=1.602\times10^{-19}$ C is the elementary charge, and
$t$ the plate thickness. **Few carriers make a big voltage**: with fewer carriers each one must drift faster to carry
the same current, and a faster carrier feels a bigger magnetic force. Copper has $n\approx8.5\times10^{28}$ m$^{-3}$
and gives almost nothing; lightly doped silicon has about $10^{22}$ m$^{-3}$, roughly ten million times fewer, and gives
millivolts. So every Hall sensor is a small, thin semiconductor plate, usually made in the same CMOS process as its amplifier.

```viz
a4-hall-3d
```

**What Hall sensors measure in practice.** A Hall plate gives a voltage proportional to $B$, so anything that changes a
magnetic field can be measured: a magnet on a door (laptop lid, fridge), a steel gear tooth passing a magnet
(wheel speed, crankshaft position), or the field around a wire carrying current (current sensors in electric cars and
chargers, which measure hundreds of amps without touching the wire). The sign of $V_H$ tells you the direction of
$B$, and the sign of the carriers: this is how physicists first proved that some materials conduct with positive "holes".

**Magnetoresistance and the compass.** The Earth's magnetic field is only about $50$ µT ($50\times10^{-6}$ T). It points
north but also dips into the ground: in Europe or North America the **inclination** (dip angle) is about $60$–$70°$, so
only the horizontal part, about $20$ µT, is useful for finding north. A plain Hall plate gives microvolts for that, too
little to trust. Phone compasses therefore use either Hall plates with tiny magnetic flux concentrators or
**magnetoresistive** films: in a thin film of permalloy (nickel–iron) the resistance depends on the angle between the
current and the film's magnetisation (anisotropic magnetoresistance, AMR, $\Delta R/R$ of about $2$–$3\%$), and a weak
field tilts that magnetisation. Stacked magnetic layers give even larger effects (giant and tunnel magnetoresistance,
GMR and TMR, the same physics as hard-disk read heads). Three such sensors along $x$, $y$, $z$ give the field vector,
and the heading follows from the two horizontal components.

```viz
a4-compass-3d
```

**One family, three physical routes.** All three effects are **linear around an operating point** (the thread from
[A1](A1-what-a-sensor-is-transduction-and-the-measurement-chain.md)): $q\approx d_{33}F$, $\Delta R/R\approx\mathrm{GF}\,\varepsilon$,
$V_H\approx (I/nq_et)\,B$. What differs is what they cannot do: piezoelectrics forget steady forces, piezoresistors
drift with temperature, and magnetic sensors see every stray magnet nearby.

## Intuitive examples

1. **The lighter spark.** A PZT cylinder 2.5 mm across ($A=4.91$ mm²) and 5 mm long, $d_{33}=400$ pC/N,
   $\varepsilon_r=1700$, hit with $F=500$ N: $q=d_{33}F=200$ nC; $C=\varepsilon_0\varepsilon_rA/t=14.8$ pF;
   $V=q/C=13.5$ kV. Enough to jump a few-millimetre gap in air.
2. **A quartz force sensor and its memory.** Quartz, $d_{33}=2.3$ pC/N, under $10$ N gives $q=23$ pC. A charge amplifier
   with $C_f=100$ pF outputs $0.23$ V. With $R_f=1$ GΩ, $\tau=R_fC_f=0.10$ s and $f_c=1.59$ Hz: after one $\tau$ only
   $36.8\%$ of a held step remains, after $0.5$ s only $0.67\%$. For the same $10$ N, PVDF gives $330$ pC ($14\times$ quartz)
   and PZT $4000$ pC ($174\times$). Quartz wins anyway in laboratories: it is extremely stable and barely leaks.
3. **Silicon vs metal under the same strain.** At $\varepsilon=100$ microstrain ($10^{-4}$), a metal gauge ($\mathrm{GF}=2$)
   changes by $\Delta R/R=0.020\%$, a silicon piezoresistor ($\mathrm{GF}=100$) by $1.000\%$. In a quarter bridge at $3.3$ V
   that is $0.165$ mV versus $8.25$ mV.
4. **A silicon Hall plate near a magnet.** $n=10^{22}$ m⁻³, $t=10$ µm, $I=1$ mA, $B=50$ mT: $V_H=3.12$ mV, a sensitivity
   of $62.4$ mV/T. The same plate in the Earth's $50$ µT gives only $3.12$ µV. A copper strip ($n=8.5\times10^{28}$ m⁻³,
   $t=0.1$ mm) carrying $1$ A in $1$ T gives just $0.73$ µV.
5. **ABS wheel speed.** A tone wheel with $48$ teeth on a wheel of radius $0.30$ m at $100$ km/h: $14.74$ revolutions per
   second, so the Hall sensor sees $707$ pulses per second. At walking pace ($5$ km/h) it is still $35.4$ Hz, which is
   why ABS can work down to a crawl, unlike older coil pickups whose voltage vanishes at low speed.
6. **Current sensing without touching the wire.** $10$ A through a ring-shaped iron core with a $1.5$ mm air gap puts
   $B=\mu_0I/\text{gap}=8.38$ mT in the gap ($\mu_0=4\pi\times10^{-7}$ T·m/A is the magnetic constant), and the silicon Hall
   plate there reads $0.523$ mV. Without the core, $5$ mm from the bare wire, the field is only $\mu_0I/(2\pi r)=0.40$ mT.
7. **The compass.** With a total field of $50$ µT and a dip of $66°$, the horizontal part is $20.3$ µT and the vertical
   part $45.7$ µT. An AMR bridge with sensitivity $3.2$ mV/V per gauss ($1$ gauss $=100$ µT) on a $5$ V supply gives
   $3.20$ mV for $20$ µT; the Hall plate above gives $1.25$ µV, about $2563$ times less. If the phone reads
   $B_x=14.1$ µT and $B_y=-14.1$ µT, its heading is $45.0°$ (north-east). A $2$ µT stray offset from a magnetic case
   turns the heading by $5.7°$ when you face north.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $q=d_{33}\,F$ | direct piezoelectric effect: charge from force | $d_{33}$ in pC/N (quartz 2.3, PVDF 33, PZT ≈ 400) |
| $V=\dfrac{q}{C}=\dfrac{d_{33}F\,t}{\varepsilon_0\varepsilon_rA}$ | open-circuit voltage of the crystal | $t$ thickness, $A$ electrode area |
| $V_{\text{out}}=-q/C_f$, $\tau=R_fC_f$, $f_c=\dfrac{1}{2\pi R_fC_f}$ | charge amplifier and its high-pass corner | $C_f$, $R_f$ feedback capacitor and resistor |
| $V(t)=V_0\,e^{-t/\tau}$ | a held force leaks away | $\tau=RC$ |
| $\Delta R/R=\mathrm{GF}\cdot\varepsilon$, $\mathrm{GF}\approx\pi_lE$ | piezoresistive strain gauge | silicon GF ≈ 100, metal ≈ 2; $\pi_l$ piezoresistive coefficient |
| $F=q_e\,v_d\,B$ | magnetic force on a moving carrier | $v_d$ drift speed, $B$ field in T |
| $V_H=\dfrac{I\,B}{n\,q_e\,t}$ | Hall voltage | $n$ carriers per m³, $t$ plate thickness |
| $\psi=\operatorname{atan2}(-B_y,\,B_x)$ | compass heading from the horizontal field | $B_x$ forward, $B_y$ right, phone held flat |

## Applications

| World | Piezo, piezoresistive and magnetic sensing | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | PVDF film rain and hail sensors on weather masts; piezoresistive dendrometers on stems; Hall flow meters on irrigation lines; Hall wheel sensors on tractor implements | rain and hail intensity from impact pulses; the stem shrinks a few µm when the plant is thirsty; litres of water delivered; seed-drill speed |
| 🧬 Biology & human health | ultrasound probes (PZT sends and receives); PVDF pulse and breathing belts; piezoresistive catheter blood-pressure tips; magnetic sensing of nanoparticle labels in diagnostics | images of organs; heartbeats and breaths; arterial pressure each beat; how many labelled molecules are bound |
| 🌍 Environment | piezoelectric geophones and hydrophones; quartz crystal microbalances weighing deposited dust; Hall anemometer rotors; magnetometers mapping rocks and ocean floors | earthquakes, whales, ship noise; particle mass; wind speed; buried geology |
| 🤖 Robotics & drones | piezoresistive tactile skins and force/torque sensors; Hall encoders on motor shafts; 3-axis magnetometer in the drone IMU; Hall current sensors on motor drivers | grip force; joint angle and speed; heading for navigation; motor torque |
| 🚗 Cars | piezo knock sensors on the engine block; Hall wheel-speed (ABS) and crankshaft sensors; piezoresistive MAP and tyre-pressure sensors; Hall battery current sensors | when to retard ignition; slip of each wheel; manifold and tyre pressure; state of charge |
| 📱 Phones & photography | the compass (Hall or AMR/TMR); a Hall sensor that detects a magnetic cover; piezoresistive barometer for altitude; piezo actuators in some autofocus and haptics | which way the phone points; flip-cover open or closed; which floor you are on; focus and vibration |
| 🏠 Home & household | gas-grill and lighter igniters; piezo buzzers in smoke alarms; Hall sensors in washing-machine drums and door-closed switches; piezoresistive load cells in scales | a spark with no battery; a loud alarm from a few mW; drum speed and lid state; your weight |

## Derivation

**(a) Charge from force (piezoelectric).**
1. Stress on the crystal: $\sigma=F/A$.
2. Each cell's dipole grows in proportion to the stress, so the dipole per volume (the polarisation) is $P=d_{33}\,\sigma$.
3. A uniform polarisation leaves a surface charge density equal to $P$ on each face.
4. Total charge: $q=P\,A=d_{33}\,(F/A)\,A=d_{33}F$; the area cancels.
5. The electrodes form a capacitor $C=\varepsilon_0\varepsilon_rA/t$, so $V=q/C=d_{33}F\,t/(\varepsilon_0\varepsilon_rA)$.

**(b) Why the force leaks away.**
1. Model the sensor plus amplifier as $C$ in parallel with $R$, holding charge $Q$.
2. The leakage current is $V/R=Q/(RC)$ and it drains the charge: $\dot Q=-Q/(RC)$.
3. Solution: $Q(t)=Q_0e^{-t/\tau}$ with $\tau=RC$.
4. For a sinusoidal force at angular frequency $\omega$ the output follows $\lvert V\rvert\propto\omega\tau/\sqrt{1+(\omega\tau)^2}$: about $1$ when $\omega\tau\gg1$, small when $\omega\tau\ll1$.
5. The corner sits at $\omega\tau=1$, i.e. $f_c=1/(2\pi RC)$: a first-order high-pass filter.

**(c) Gauge factor of silicon.**
1. Resistance $R=\rho L/(wt)$, so $\Delta R/R=\Delta\rho/\rho+\Delta L/L-\Delta w/w-\Delta t/t$.
2. Geometry: $\Delta L/L=\varepsilon$, $\Delta w/w=\Delta t/t=-\nu_P\varepsilon$, so the shape part is $(1+2\nu_P)\varepsilon\approx1.6\,\varepsilon$ for $\nu_P=0.3$. This is all a metal has.
3. In silicon the resistivity changes with stress: $\Delta\rho/\rho=\pi_l\,\sigma=\pi_lE\,\varepsilon$.
4. For p-type silicon along a ⟨110⟩ direction, $\pi_l\approx69\times10^{-11}$ Pa⁻¹ and $E\approx169$ GPa, so $\mathrm{GF}\approx\pi_lE\approx117$.
5. The resistivity term beats the geometry term by about $70$ times: in silicon the shape barely matters.

**(d) The Hall voltage.**
1. Current through a cross-section $w\times t$: $I=n\,q_e\,v_d\,w\,t$, so $v_d=I/(n\,q_e\,w\,t)$.
2. Magnetic force on one carrier: $F=q_e\,v_d\,B$, sideways.
3. Charge builds on the edges until the electric force balances it: $q_e\mathcal E_H=q_ev_dB$, so $\mathcal E_H=v_dB$.
4. Voltage across the width: $V_H=\mathcal E_H\,w=v_d\,B\,w$.
5. Substitute $v_d$: $V_H=\dfrac{I}{n\,q_e\,w\,t}\,B\,w=\dfrac{IB}{n\,q_e\,t}$; the width cancels.

**(e) Heading from a magnetometer.**
1. Let the phone lie flat with heading $\psi$ (clockwise from north); $B_h$ is the horizontal field.
2. The forward sensor reads $B_x=B_h\cos\psi$; the right-hand sensor reads $B_y=-B_h\sin\psi$.
3. Divide: $\tan\psi=-B_y/B_x$; use $\operatorname{atan2}$ so the quadrant comes out right. $B_h$ cancels, so the field's strength does not matter.
4. If the phone is tilted, the big vertical part of the field leaks into $B_x$ and $B_y$; the accelerometer measures the tilt so it can be removed ([B4](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md)).

## Worked check

**A PVDF pulse sensor.** A PVDF film strap on the wrist ($d_{33}=33$ pC/N, film capacitance $C=1$ nF) feels a $2$ N push
with every heartbeat.
- Charge: $q=33\times10^{-12}\times2=66$ pC. Voltage: $V=q/C=66\times10^{-12}/10^{-9}=66$ mV. Easy to measure.
- A cheap $10$ MΩ amplifier input: $\tau=RC=10^7\times10^{-9}=10$ ms, $f_c=1/(2\pi\times0.01)=15.9$ Hz. A held press decays
  to $e^{-3}=5.0\%$ in $30$ ms, and the $1.2$ Hz heartbeat lies **below** $f_c$: the pulse is largely filtered away.
- To put $f_c$ at $0.1$ Hz: $R=1/(2\pi f_cC)=1/(2\pi\times0.1\times10^{-9})=1.59$ GΩ, so $\tau=1.59$ s. Now the pulse passes.

**A Hall plate.** $I=2$ mA, $B=0.1$ T, $n=5\times10^{21}$ m⁻³, $t=5$ µm.
- $n\,q_e\,t=5\times10^{21}\times1.602\times10^{-19}\times5\times10^{-6}=4.005\times10^{-3}$ C/m².
- $V_H=IB/(nq_et)=(2\times10^{-3}\times0.1)/(4.005\times10^{-3})=49.9$ mV ✓ (all numbers from `scripts/checks/A4_check.py`).

## Whiteboard plan

- **Panel 1 — the lighter.** Draw a hammer hitting a cylinder with a spark at the end. Write $q=d_{33}F$ and
  "no battery". Say: "Squeeze the right crystal and charge comes out."
- **Panel 2 — the unit cell.** A square of four $-$ corners with a $+$ in the middle; next to it a squashed square with the
  $+$ shifted up and a little dipole arrow. Then a whole slab with $+++$ on top and $---$ underneath. Write
  $P=d_{33}F/A$, $q=PA=d_{33}F$, and circle "A cancels".
- **Panel 3 — leak and high-pass.** Sketch a force step (purple) and below it a voltage spike that decays, then a
  negative spike at release (yellow). Write $\tau=RC$ and $f_c=1/(2\pi RC)$. Say: "Piezo hears changes, not weights."
- **Panel 4 — silicon vs metal.** Two bars: $\mathrm{GF}=2$ and $\mathrm{GF}=100$. Write $\Delta R/R=\mathrm{GF}\,\varepsilon$
  and "$0.165$ mV vs $8.25$ mV at $100\,\mu\varepsilon$".
- **Panel 5 — the Hall plate.** A rectangle with current arrows, $\otimes$ for $B$ into the board, an electron path
  bending to the bottom edge, $---$ at the bottom and $+++$ at the top. Write the balance $q_e\mathcal E_H=q_ev_dB$ and box
  $V_H=IB/(nq_et)$. Say: "fewer carriers means faster carriers, so a bigger push."
- **Panel 6 — compass.** A circle with N, E, S, W, a phone rotated by $\psi$, and the two readings $B_x$, $B_y$. Write
  $\psi=\operatorname{atan2}(-B_y,B_x)$ and "only the horizontal 20 µT counts".

## Common mistakes and where the intuition breaks

- **"A piezo sensor can measure my weight."** Not for long. Any static force decays with $\tau=RC$. Use a piezoresistive
  or capacitive load cell for steady loads; use piezo for vibration, impact and sound.
- **Thinking a bigger crystal gives more charge.** For a force along the poling axis, $q=d_{33}F$ does not depend on the
  area. A bigger area only adds capacitance and lowers the voltage.
- **Forgetting temperature with silicon.** A silicon piezoresistor's resistance changes by roughly $0.1$–$0.3\%$ per kelvin,
  comparable to a large strain signal. That is why they are used in full bridges where all four arms warm up together
  ([A2](A2-resistive-sensors-and-the-wheatstone-bridge.md)).
- **"Metals make good Hall sensors because they conduct well."** The opposite: $V_H\propto1/n$, and metals have far too
  many carriers.
- **Mixing up $B$ and the Earth's field direction.** The field points north *and down*. Holding the phone tilted lets
  the large vertical part leak into the heading; without tilt compensation a $10°$ tilt can cause a much larger heading error.
- **Ignoring nearby iron.** Steel, magnets and current-carrying wires add offsets ("hard iron") and distort the field
  ("soft iron"). This is why compass apps ask you to wave the phone in a figure-eight: they are calibrating
  ([A8](A8-noise-resolution-calibration-and-drift.md)).
- **Where linearity breaks:** a piezo ceramic depolarises if heated above its Curie temperature (about $200$–$350$ °C for PZT);
  a Hall plate saturates its amplifier; AMR films flip their magnetisation in strong fields, so they carry a "set/reset"
  coil to restore them.

## Remember

**"Squeeze a crystal: $q=d_{33}F$, but it leaks with $\tau=RC$. Strain silicon: $\mathrm{GF}\approx100$. Push moving charges with $B$: $V_H=IB/(nq_et)$."**

## Self-test

1. A PZT disc ($d_{33}=400$ pC/N) is part of a car knock sensor. How much charge does a $0.5$ N vibration peak produce, and why does it not matter that the sensor cannot measure the engine's steady weight?
   <details><summary>Answer</summary>q = 400 pC/N × 0.5 N = 200 pC. Knock is a vibration at several kHz, far above the high-pass corner f_c = 1/(2πRC), so it passes; the steady weight of the engine is a DC force that leaks away and is not wanted anyway.</details>
2. You halve the thickness of a Hall plate and double the current. What happens to $V_H$?
   <details><summary>Answer</summary>V_H = IB/(n q_e t). Doubling I doubles it and halving t doubles it again: V_H becomes 4 times larger (as long as the plate does not overheat).</details>
3. A phone lying flat reads $B_x=0$ µT and $B_y=-20$ µT. Which way is it pointing?
   <details><summary>Answer</summary>ψ = atan2(−B_y, B_x) = atan2(20, 0) = 90°: the phone points east. (Check: B_y = −B_h sin ψ = −20 µT for ψ = 90°.)</details>

**Next:** [A5 Optical sensors: photodiodes, image sensors and LiDAR](A5-optical-sensors-photodiodes-image-sensors-and-lidar.md) — instead of pushing charges with force or fields, light knocks electrons loose one photon at a time.
