# C2. Pressure-driven flow and hydraulic circuits

> **Connects:** builds on [C1 Fluids at the microscale](C1-fluids-at-the-microscale-reynolds-number-and-laminar-flow.md), [A2 Resistive sensors and the Wheatstone bridge](A2-resistive-sensors-and-the-wheatstone-bridge.md) (Ohm's law, series and parallel), [A7 Signal conditioning](A7-signal-conditioning-amplifiers-filters-and-adcs.md) (RC time constant) · used by [C3 Diffusion and mixing](C3-diffusion-mixing-and-the-peclet-number.md), [C5 Lab-on-a-chip](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md)

## Hook — a garden hose, and Ohm's law for water

Squeeze the end of a garden hose and the water shoots further, but less of it comes out. Use a long, thin hose and the
trickle at the end is feeble however far you open the tap. Everyone feels the rule: **a narrow, long pipe resists
flow, and you need pressure to push through it.**

In a microfluidic chip that rule becomes exact. Because the flow is laminar (C1), the flow rate through a channel is
*proportional* to the pressure across it, just as current through a resistor is proportional to voltage. A chip with
a dozen channels is literally a resistor network, and you can design it with the same series and parallel rules you
use for a Wheatstone bridge (A2). The same law tells a tree how hard it must pull to lift water 30 m up its trunk, and
it hides a surprise: halve the radius of a tube and the flow drops not 2 or 4 times, but **16 times**.

## The idea in plain words

**Pressure pushes, viscosity resists.** To make a liquid flow along a channel of length $L$, you keep the pressure at
the inlet higher than at the outlet by $\Delta p$. The liquid accelerates until the friction of its layers rubbing
against each other and against the still walls (no-slip, C1) exactly balances the push. In a microchannel this takes
microseconds, so the flow is always in this balanced, **steady** state. What comes out is a **volumetric flow rate**
$Q$, in m³/s; chip people prefer µL/min (1 µL/min $=1.67\times10^{-11}$ m³/s).

**The parabola.** In a round tube of radius $r_0$ (the symbol $r_0$ is local to this note; $r$ measures the distance
from the axis), the speed is zero at the wall and largest on the axis. A force balance on a cylinder of fluid (derived
below and in the 3D figure) gives the **Hagen–Poiseuille profile**
$$u(r)=\frac{\Delta p}{4\mu L}\,(r_0^2-r^2),$$
a paraboloid like an upside-down bowl. Its peak is $u_{\max}=\Delta p\,r_0^2/(4\mu L)$, and its average over the
cross-section is exactly half of that: fast fluid in the middle, crawling fluid at the edge.

**The fourth-power law.** The flow rate is the volume under that bowl:
$$Q=\frac{\pi r_0^4}{8\mu L}\,\Delta p.$$
The $r_0^4$ has two halves: the bowl gets taller as $r_0^2$ (more room for the speed to build up away from the walls),
and the area it covers grows as $r_0^2$ too. Halve the radius and $Q$ falls $2^4=16$ times. This is why a slightly
narrowed artery matters so much, why the thinnest part of a chip dominates its flow, and why blood vessels widen
(vasodilation) to boost flow with tiny changes in diameter.

```viz
c2-poiseuille-3d
```

**Rectangular channels.** Chips are moulded or etched, so their channels have a rectangular cross-section of width
$w$ and height $h$ (take $h\le w$). The exact profile is a Fourier series (it is in the widget), but for design one
formula is enough:
$$R_{\text{hyd}}\approx\frac{12\mu L}{w\,h^3\,(1-0.63\,h/w)}.$$
For a very flat channel ($h\ll w$) the profile across the height is a parabola, and the $h^3$ comes from the same
logic as $r_0^4$: one power of $h$ from the area, two from the height of the parabola. The bracket corrects for the
side walls. It is within 0.2 % of the exact series for $h/w\le0.5$, and 14 % high for a square channel. The lesson:
**the height is critical.** A 10 % error in the mould depth changes the flow by about 30 %.

**Ohm's law for fluids.** Since $Q\propto\Delta p$, define the **hydraulic resistance** $R_{\text{hyd}}$ by
$$\Delta p=Q\,R_{\text{hyd}}\qquad\Longleftrightarrow\qquad V=I\,R.$$
For a tube $R_{\text{hyd}}=8\mu L/(\pi r_0^4)$; for a rectangle, the formula above. Units: Pa·s/m³. The analogy is
exact, not loose: pressure ↔ voltage, flow rate ↔ current, channel ↔ resistor. Volume is conserved at every
junction (Kirchhoff's current law), and pressure drops add around any loop (Kirchhoff's voltage law). So:

- **Series** channels add: $R_{\text{tot}}=R_1+R_2+\dots$ (the same $Q$ passes through each, and the drops add).
- **Parallel** channels combine as $1/R_{\text{tot}}=1/R_1+1/R_2+\dots$ (the same $\Delta p$ across each, and the flows add).
- A **pressure divider**: the pressure at a junction between $R_1$ and $R_2$ in series is $p_{\text{in}}R_2/(R_1+R_2)$.

```viz
c2-circuit
```

**Pumps are sources.** A **pressure controller** (a regulated gas pressure on top of a liquid reservoir) fixes
$\Delta p$: it is a voltage source, and the flow it gives depends on the chip's resistance. A **syringe pump**
(a motor pushing a plunger at constant speed) fixes $Q$: it is a current source, and the pressure rises to whatever
the chip needs, which can crack a chip if a channel clogs. Pressure controllers respond in milliseconds; syringe pumps
are precise in the long run but slow to settle, because of the next effect.

**Compliance is capacitance.** PDMS, the soft silicone most chips are made from, bulges when the pressure rises;
tubing stretches; an air bubble compresses. Each stores extra volume $dV$ when the pressure rises by $dp$. That ratio
is the **hydraulic compliance** $C_{\text{hyd}}=dV/dp$ (local symbol), the twin of a capacitor's $C=dq/dV$. A
compliance feeding a resistance gives a first-order lag with time constant
$$\tau=R_{\text{hyd}}\,C_{\text{hyd}},$$
exactly the RC filter of A7. Start a syringe pump and the flow through the chip rises as $1-e^{-t/\tau}$. An air bubble
of volume $V$ at pressure $p$ has $C_{\text{hyd}}=V/p$ (from $pV=$ const), which is huge: a 10 µL bubble at
atmospheric pressure adds $10^{-13}$ m³/Pa, ten times more than typical tubing (about 1 µL per bar, $10^{-14}$ m³/Pa). Experimenters learn to hunt bubbles.

```viz
c2-compliance
```

**Wall shear stress.** The fluid drags on the wall with a stress $\tau_w=\mu\,|du/dr|$ at the wall. For a tube,
$\tau_w=4\mu Q/(\pi r_0^3)=4\mu\bar u/r_0$, where $\bar u$ is the mean speed; for a flat channel, $\tau_w=6\mu Q/(wh^2)$.
Cells care about this number. The endothelial cells that line blood vessels align with the flow, change their genes
and keep the vessel healthy when $\tau_w$ is around 1–2 Pa; regions of low or oscillating shear (artery branches) are
where plaques form. An **organ-on-a-chip** that grows blood-vessel cells must therefore set its flow to give the right
$\tau_w$, not just "some flow".

**Xylem: a tree's microchannels.** Water rises in plants through **xylem** vessels, dead hollow cells joined into
tubes 20–100 µm wide: microchannels, with $\mathrm{Re}\sim0.01$–$0.1$. Nothing pushes from below. Evaporation from the
leaves pulls, putting the water under **tension** (negative pressure), and water's cohesion keeps the column from
breaking (the cohesion–tension theory). Poiseuille tells the tree how hard to pull: friction in the vessels plus the
weight of the column. Plants also branch their vessels in a nearly optimal way. **Murray's law** says a network that
minimises the work of pumping plus the cost of building and filling the vessels has $Q\propto r_0^3$ in every
branch, so at each fork $r_{\text{parent}}^3=\sum r_{\text{daughter}}^3$. As a bonus, $\tau_w\propto Q/r_0^3$ is then
the same everywhere. Blood vessels follow Murray's law surprisingly well; xylem follows a modified version.

## Intuitive examples

1. **A round capillary.** Radius $r_0=50$ µm, length 1 cm, water, $\Delta p=1$ kPa (1 % of an atmosphere):
   $R_{\text{hyd}}=8\mu L/(\pi r_0^4)=4.07\times10^{12}$ Pa·s/m³, so $Q=2.45\times10^{-10}$ m³/s $=14.7$ µL/min. Peak
   speed 62.5 mm/s, mean 31.25 mm/s (exactly half), $\mathrm{Re}=3.1$: laminar. Halve the radius: 16× less flow.
2. **A typical chip channel.** $w=100$ µm, $h=50$ µm, $L=1$ cm: $R_{\text{hyd}}=1.40\times10^{13}$ Pa·s/m³ (the
   exact series gives $1.399\times10^{13}$, 0.15 % different). To push 10 µL/min you need 2.34 kPa; the mean speed is
   33.3 mm/s. Make it 25 µm high instead and $R_{\text{hyd}}$ rises 6.5×.
3. **A network.** Inlet channel $R_1$ (1 cm), then two 2 cm branches in parallel, then $R_4$ (1 cm), all
   100 × 50 µm. Each 2 cm branch has $2.80\times10^{13}$; the pair in parallel has $1.40\times10^{13}$, the same as one
   1 cm channel. Total $4.20\times10^{13}$ Pa·s/m³. At 5 kPa: $Q=7.14$ µL/min, 3.57 µL/min in each branch, and the
   junctions sit at 3.33 kPa and 1.67 kPa.
4. **Bubbles slow pumps.** That network plus 1 µL/bar of tubing compliance ($10^{-14}$ m³/Pa) has $\tau=0.42$ s. Add a
   10 µL bubble and $\tau=4.62$ s: the flow needs 21 s to get within 1 % of the set value.
5. **Shear for cells.** In a 1 mm wide, 100 µm high organ-chip channel, a wall shear of 1 Pa needs
   $Q=\tau_w wh^2/(6\mu)=100$ µL/min. In a capillary ($r_0=4$ µm, 0.5 mm/s, blood 3.5 mPa·s), $\tau_w=1.75$ Pa; in the
   aorta (12.5 mm radius, 0.2 m/s mean), Poiseuille gives only about 0.22 Pa.
6. **A 30 m tree.** Xylem vessels $r_0=20$ µm carrying sap at 1 mm/s (3.6 m/h): the pressure gradient is
   $8\mu\bar u/r_0^2=0.020$ MPa/m. Over 30 m: 0.60 MPa of friction plus $\rho g_{\text{grav}}H=0.29$ MPa to lift the
   column, about 0.89 MPa of tension, close to the −1 to −2 MPa measured in leaves of tall trees.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $u(r)=\dfrac{\Delta p}{4\mu L}(r_0^2-r^2)$ | parabolic (Poiseuille) profile in a tube | $r_0$ tube radius, $r$ distance from the axis, $L$ length |
| $Q=\dfrac{\pi r_0^4\,\Delta p}{8\mu L}$, $\ \bar u=\tfrac12u_{\max}$ | Hagen–Poiseuille flow rate; mean = half the peak | $Q$ in m³/s, $\bar u=Q/(\pi r_0^2)$ |
| $\Delta p=Q\,R_{\text{hyd}}$ | Ohm's law for fluids | $R_{\text{hyd}}$ in Pa·s/m³ |
| $R_{\text{hyd}}=\dfrac{8\mu L}{\pi r_0^4}$ | round tube | |
| $R_{\text{hyd}}\approx\dfrac{12\mu L}{wh^3(1-0.63h/w)}$ | rectangular channel, $h\le w$ | $w$ width, $h$ height |
| $R_{\text{s}}=R_1+R_2$, $\ \dfrac1{R_{\text{p}}}=\dfrac1{R_1}+\dfrac1{R_2}$ | series and parallel channels | |
| $C_{\text{hyd}}=dV/dp$, $\ \tau=R_{\text{hyd}}C_{\text{hyd}}$ | compliance and the RC settling time | bubble: $C_{\text{hyd}}=V/p$ |
| $\tau_w=\dfrac{4\mu Q}{\pi r_0^3}$ (tube), $\ \tau_w=\dfrac{6\mu Q}{wh^2}$ (flat channel) | wall shear stress | $\tau_w$ in Pa |
| $r_{\text{parent}}^3=\sum r_{\text{daughter}}^3$ | Murray's law for branching vessels | two equal daughters: $r=0.794\,r_{\text{parent}}$ |

## Applications

| World | Pressure-driven flow and hydraulic circuits | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | xylem vessels as parallel microchannels; drip-irrigation emitters (long narrow labyrinths as resistors); sap-flow chips | how much tension a leaf must pull (≈0.9 MPa for 30 m); why one embolised (air-filled) vessel cuts flow; why emitters deliver the same flow along a long pipe |
| 🧬 Biology & human health | blood vessels ($Q\propto r_0^4$); organ-on-chip shear; IV drips and catheters; dialysis membranes | a 20 % narrowing cuts flow by 59 %; endothelial cells need $\tau_w\approx1$–2 Pa; a thinner catheter needs much more pressure |
| 🌍 Environment | water-quality chips pumped by gravity or a small pressure; soil water moving through pores | a field chip can run on a fixed head of water if its total $R_{\text{hyd}}$ is known; soil permeability is Poiseuille through many pores |
| 🤖 Robotics & drones | soft robots driven by hydraulic or pneumatic channels; microfluidic "logic"; fuel lines on drones | actuator speed is set by $\tau=R_{\text{hyd}}C_{\text{hyd}}$ of the channel and the soft chamber |
| 🚗 Cars | fuel injectors, brake lines, oil passages; the λ-sensor's diffusion barrier | brake fluid must be bubble-free (bubbles are compliance: a spongy pedal); injector flow is calibrated by $\Delta p$ |
| 📱 Phones & photography | the tiny vent channel behind a MEMS microphone or barometer membrane; inkjet nozzles | vent resistance × back-volume compliance is an RC that sets the microphone's low-frequency cutoff (B5) |
| 🏠 Home & household | taps, shower heads, coffee machines (water through a coffee puck), washing-machine level sensors (air in a tube) | finer coffee grounds = smaller pores = much higher $R_{\text{hyd}}$; a water-level sensor reads the pressure trapped in a compliant air column |

## Derivation

**(a) Force balance on a fluid cylinder (round tube).**
1. Steady, laminar flow along the axis of a tube of radius $r_0$ and length $L$, pressure drop $\Delta p$.
2. Cut out a coaxial cylinder of fluid of radius $r$. The pressure difference pushes on its ends: $F_{\text{push}}=\Delta p\,\pi r^2$.
3. The slower fluid outside rubs on its side with shear stress $-\mu\,du/dr$ over area $2\pi rL$: $F_{\text{drag}}=-\mu\,\dfrac{du}{dr}\,2\pi rL$.
4. No acceleration (steady, and the profile doesn't change along the tube), so the forces balance: $\Delta p\,\pi r^2=-\mu\,\dfrac{du}{dr}\,2\pi rL$.
5. Solve for the slope: $\dfrac{du}{dr}=-\dfrac{\Delta p\,r}{2\mu L}$.
6. Integrate from the wall, where no-slip gives $u(r_0)=0$: $u(r)=\dfrac{\Delta p}{4\mu L}(r_0^2-r^2)$.

**(b) Flow rate, mean speed, resistance.**
1. Split the cross-section into thin rings of radius $r$, width $dr$, area $2\pi r\,dr$; the volume per second through a ring is $u(r)\,2\pi r\,dr$.
2. $Q=\displaystyle\int_0^{r_0}\frac{\Delta p}{4\mu L}(r_0^2-r^2)\,2\pi r\,dr=\frac{\pi\Delta p}{2\mu L}\Big[\frac{r_0^2r^2}{2}-\frac{r^4}{4}\Big]_0^{r_0}=\frac{\pi r_0^4\Delta p}{8\mu L}$.
3. Mean speed: $\bar u=Q/(\pi r_0^2)=\Delta p\,r_0^2/(8\mu L)=\tfrac12u_{\max}$.
4. Resistance: $R_{\text{hyd}}=\Delta p/Q=8\mu L/(\pi r_0^4)$.

**(c) Flat channel, $h\ll w$.**
1. Same balance on a slab of thickness $2y$ centred in a channel of height $h$ (per unit width): $\Delta p\cdot2y=-2\mu L\,du/dy$.
2. Integrate with $u=0$ at $y=\pm h/2$: $u(y)=\dfrac{\Delta p}{2\mu L}\Big(\dfrac{h^2}{4}-y^2\Big)$.
3. Integrate over height and width: $Q=\dfrac{wh^3\Delta p}{12\mu L}$, so $R_{\text{hyd}}=\dfrac{12\mu L}{wh^3}$.
4. Side walls slow the fluid near them; the exact Fourier solution gives the factor $1-\dfrac{192h}{\pi^5w}\sum_{n\text{ odd}}\dfrac{\tanh(n\pi w/2h)}{n^5}\approx1-0.63\,h/w$.

**(d) Wall shear stress.**
1. Tube: $\tau_w=\mu\,|du/dr|$ at $r=r_0$ $=\Delta p\,r_0/(2L)$.
2. Replace $\Delta p$ using $Q$: $\tau_w=\dfrac{4\mu Q}{\pi r_0^3}=\dfrac{4\mu\bar u}{r_0}$.
3. Flat channel: $\tau_w=\mu\,|du/dy|$ at $y=h/2$ $=\Delta p\,h/(2L)=\dfrac{6\mu Q}{wh^2}$.

**(e) Circuits and compliance.**
1. Conservation of volume at a junction: $\sum Q_{\text{in}}=\sum Q_{\text{out}}$ (Kirchhoff's current law).
2. Series: same $Q$, so $\Delta p=Q(R_1+R_2)$. Parallel: same $\Delta p$, so $Q=\Delta p(1/R_1+1/R_2)$.
3. A compliant chamber at pressure $p$ stores $V(p)$; its inflow is $dV/dt=C_{\text{hyd}}\,dp/dt$, like $I=C\,dV/dt$.
4. A syringe pump delivers $Q_0$ into the chamber, which empties through $R_{\text{hyd}}$: $C_{\text{hyd}}\dot p=Q_0-p/R_{\text{hyd}}$.
5. This is the first-order lag $\tau\dot p+p=Q_0R_{\text{hyd}}$ with $\tau=R_{\text{hyd}}C_{\text{hyd}}$, so $Q_{\text{out}}=p/R_{\text{hyd}}=Q_0(1-e^{-t/\tau})$.

**(f) Murray's law (the intuition).**
1. Pumping power through a vessel: $\Delta p\,Q=R_{\text{hyd}}Q^2\propto Q^2L/r_0^4$.
2. Cost of keeping the vessel (its volume of blood or sap): $\propto r_0^2L$.
3. Minimise the sum over $r_0$: $-4aQ^2/r_0^5+2b\,r_0=0\Rightarrow Q\propto r_0^3$.
4. Volume conservation at a fork, $Q_{\text{p}}=\sum Q_{\text{d}}$, then gives $r_{\text{p}}^3=\sum r_{\text{d}}^3$, and $\tau_w\propto Q/r_0^3$ is the same in every branch.

## Worked check

Two identical channels (100 µm × 50 µm × 1 cm) in parallel, followed by one more of the same channel in series, are
fed by a syringe pump at 20 µL/min of water.

- One channel: $R=\dfrac{12(10^{-3})(10^{-2})}{(10^{-4})(5\times10^{-5})^3(1-0.63\times0.5)}=\dfrac{1.2\times10^{-4}}{8.5625\times10^{-18}}=1.40\times10^{13}$ Pa·s/m³.
- Parallel pair: $R/2=7.01\times10^{12}$; total $R+R/2=2.10\times10^{13}$ Pa·s/m³.
- $Q=20$ µL/min $=3.33\times10^{-10}$ m³/s, so the pump must reach $\Delta p=QR_{\text{tot}}=7007$ Pa ≈ 7.0 kPa.
- The junction between the pair and the last channel sits at $Q\cdot R=2336$ Pa (only the last channel lies below it),
  and each parallel branch carries 10 µL/min (equal resistances share equally) ✓.
- Electrical twin: 7.0 V across a 0.35 MΩ resistor network carries 20 µA (with 1 kPa ↔ 1 V, 1 µL/min ↔ 1 µA).
  All numbers come from `scripts/checks/C2_check.py`.

## Whiteboard plan

- **Panel 1 — the hose.** A thick short hose and a thin long one with the same tap. Write "$Q$ grows with $\Delta p$,
  shrinks with $L$, and very fast with radius".
- **Panel 2 — the fluid cylinder.** A tube in side view, an inner cylinder of radius $r$, arrows "$\Delta p\,\pi r^2$"
  on its end and "drag $\times 2\pi rL$" on its side. Five lines of algebra down to the parabola; draw the profile
  as arrows, zero at the walls.
- **Panel 3 — rings.** The cross-section as a target of rings; write $Q=\int u\,2\pi r\,dr=\pi r_0^4\Delta p/(8\mu L)$.
  Circle the 4 and write "halve $r_0$ → ÷16". Beside it: rectangle, $12\mu L/(wh^3)$, "height cubed".
- **Panel 4 — Ohm's law for water.** Two columns: $V=IR$ | $\Delta p=QR_{\text{hyd}}$; battery | pressure controller;
  current source | syringe pump; capacitor | soft PDMS / bubble. Draw the chip network and its circuit twin.
- **Panel 5 — RC.** A syringe, a bubble, a channel; under it the curve $1-e^{-t/\tau}$ with $\tau=RC$ marked.
- **Panel 6 — the tree.** A 30 m tree with xylem tubes; "friction 0.6 MPa + lift 0.29 MPa ≈ 0.9 MPa of tension"; a
  forking vessel with "$r_{\text p}^3=r_1^3+r_2^3$".

## Common mistakes and where the intuition breaks

- **Forgetting the fourth (or third) power.** Doubling a channel's height doesn't double the flow, it multiplies it
  by about 8. Fabrication tolerances on $h$ matter far more than on $w$ or $L$.
- **Using the mean speed as the speed of everything.** The centre moves at twice the mean (tube) or 1.5 times the mean
  (flat channel); particles near walls barely move. Residence times differ, which spreads out a sample (C3).
- **Using $12\mu L/(wh^3)$ for a square channel.** Without the $(1-0.63h/w)$ bracket a square channel's resistance is
  underestimated by a factor of 2.4. And always put the *smaller* dimension as $h$.
- **Ignoring tubing and connectors.** Thin tubing is a resistor too: 30 cm of 250 µm inside-diameter tubing has
  $3.1\times10^{12}$ Pa·s/m³, a fifth of one chip channel. Measure or include it.
- **Thinking a syringe pump gives a steady flow instantly.** Compliance (soft PDMS, tubing, bubbles) creates a lag of
  seconds to minutes, and stepper motors add pulsation. Pressure controllers are faster but depend on $R_{\text{hyd}}$,
  which changes if a channel clogs or a cell gets stuck.
- **Where the analogy breaks.** Hydraulic resistance is linear only while $\mathrm{Re}$ stays small; at higher Re
  (big pipes, turbulent hoses) $\Delta p$ grows faster than $Q$. Soft channels also widen under pressure, so
  $R_{\text{hyd}}$ drops as $\Delta p$ rises (a "nonlinear resistor"). And blood is not a simple fluid: red cells make
  it shear-thinning and they gather in the centre of small vessels.
- **Negative pressure in xylem is not a vacuum pump.** A suction pump can lift water only about 10 m (one atmosphere).
  Trees reach 100 m because the water is under true tension, held together by cohesion; that state is metastable and
  can break (embolism), which is what an ultrasonic "cavitation" sensor on a stem listens for.

## Remember

**"Δp = Q·R_hyd: a tube's R_hyd = 8μL/(πr₀⁴), a channel's ≈ 12μL/(wh³). Series add, parallel add as 1/R, and τ = R_hyd·C_hyd."**

## Self-test

1. A channel network has a total hydraulic resistance of $5\times10^{13}$ Pa·s/m³. What pressure gives 6 µL/min, and what flow do you get from 2 kPa?
   <details><summary>Answer</summary>6 µL/min = 1.0e-10 m³/s, so Δp = 1.0e-10 × 5e13 = 5000 Pa = 5 kPa. From 2 kPa: Q = 2000 / 5e13 = 4e-11 m³/s = 2.4 µL/min.</details>
2. An artery narrows so its radius is 80 % of normal. If the pressure across it stays the same, what fraction of the flow remains? What if the body wants to keep the flow constant?
   <details><summary>Answer</summary>Q scales as radius to the fourth: 0.8^4 = 0.41, so 41 % of the flow remains (a 59 % drop). To keep the flow, the pressure drop across that segment would have to rise by 1/0.41 ≈ 2.4 times.</details>
3. A 1 mm-wide, 100 µm-high organ-chip channel gives 0.5 Pa wall shear at 50 µL/min. You want 2 Pa. Name two ways to get it.
   <details><summary>Answer</summary>Shear in a flat channel is 6μQ/(w h²). Either raise the flow 4×, to 200 µL/min, or halve the height to 50 µm (shear rises 4× at the same flow, but the pressure needed rises about 8×). Using a more viscous medium also works.</details>

**Next:** [C3 Diffusion, mixing and the Péclet number](C3-diffusion-mixing-and-the-peclet-number.md) — the flow now carries molecules down the channel; how long until they spread across it and mix?
