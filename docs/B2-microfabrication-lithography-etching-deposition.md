# B2. Microfabrication: lithography, etching, deposition

> **Connects:** builds on [B1 Scaling laws](B1-scaling-laws-why-small-is-different.md) (why tiny structures are worth building, and why surface forces cause stiction) · used by [B3 Micromechanics](B3-micromechanics-beams-springs-and-resonators.md), [B4 MEMS inertial sensors](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md), [B5 MEMS microphones, pressure sensors and actuators](B5-mems-microphones-pressure-sensors-and-actuators.md), [C2 Pressure-driven flow](C2-pressure-driven-flow-and-hydraulic-circuits.md), [C5 Lab-on-a-chip](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md)

## Hook — a stencil, a spray can and a layered cake

To paint a sharp logo on a T-shirt you cut a stencil, lay it on the cloth, spray, and peel it off. Paint lands only where
the stencil is open. To build a layered cake you stack sponge, cream, sponge, and if you want a hollow inside, you bake
around something that you later melt away.

**Microfabrication is exactly that, done hundreds of times smaller than a hair and thousands of devices at once.** Light
shining through a glass "stencil" (a photomask) hardens or softens a thin film of light-sensitive lacquer (photoresist).
Chemicals or plasmas then eat away the material wherever the lacquer is gone. New layers are grown or sprayed on, and a
layer that was only there to hold up the next one (the *sacrificial layer*) is dissolved at the end. What remains is a
silicon beam floating 2 µm above the chip, free to move. Every accelerometer, gyroscope, microphone and pressure sensor
in a phone or car is made this way, on wafers that each carry thousands of identical chips.

## The idea in plain words

**The wafer: a perfect crystal.** Everything starts with a disc of single-crystal silicon, 100–300 mm across and about
0.5–0.8 mm thick, polished like a mirror. Silicon atoms sit on a cubic lattice, and planes through that lattice have
names written as three numbers in brackets. The wafer surface is usually a **(100)** plane, the face of the cube. The
**(111)** planes, through three corners of the cube, are the most tightly packed. They meet the surface at an angle of
$\arccos(1/\sqrt3)=54.74°$. Remember this angle: some chemicals almost refuse to etch (111) planes, and that turns the crystal
itself into a ruler.

**Adding material: oxidation and deposition.** Three ways to put a thin film (a "thin film" is 10 nm to a few µm) on the
wafer:
- **Thermal oxidation.** Heat silicon to 900–1200 °C in oxygen or steam and it grows silicon dioxide (glass), $\text{SiO}_2$.
  The oxide eats into the wafer: growing 1 µm of oxide consumes 0.44 µm of silicon. Growth slows down as the oxide gets
  thicker, because oxygen must diffuse through what is already there (the Deal–Grove law,
  $t_{\text{ox}}^2+A_{\text{DG}}\,t_{\text{ox}}=B_{\text{DG}}\,t$, with $t_{\text{ox}}$ the oxide thickness, $t$ the time and $A_{\text{DG}},B_{\text{DG}}$
  constants of the furnace). Oxide is the perfect insulator and the perfect sacrificial layer.
- **Chemical vapour deposition (CVD).** Gases react on the hot wafer and leave a solid film. LPCVD (low pressure, about 600 °C)
  makes polycrystalline silicon ("poly"), the structural material of most MEMS, at about 10 nm/min. PECVD uses a plasma to do
  it at 300 °C. CVD coats every surface, including side walls: it is *conformal*.
- **Physical vapour deposition (PVD).** Metals are evaporated or **sputtered**: argon ions knock atoms off a metal target and
  they fly in straight lines to the wafer. Sputtering is how aluminium wires, gold electrodes and the piezoelectric films
  of [B5](B5-mems-microphones-pressure-sensors-and-actuators.md) are made.

**Patterning: photolithography.** A film everywhere is useless; you need it *in the shape* of a beam, a comb or an
electrode. The recipe:
1. **Spin-coat** a photoresist: a drop on the wafer spun at a few thousand rpm spreads into an even film 1–5 µm thick.
   Faster spinning gives a thinner film, with thickness $\propto1/\sqrt{\text{rpm}}$.
2. **Expose** through a **photomask**, a glass plate with a chrome pattern, using ultraviolet light (365 nm "i-line").
3. **Develop**: in a *positive* resist the exposed parts dissolve; in a *negative* resist (like SU-8) they stay.
4. Now the resist is a stencil on the wafer. **Etch** the film below wherever it is uncovered, or deposit metal on top and
   dissolve the resist (lift-off).
5. **Strip** the resist and start the next layer. A MEMS process uses 3–10 masks, which must be aligned to each other to
   about 1 µm.

How small can you print? Light bends around the edges of the mask (diffraction), so lines cannot be much smaller than
the wavelength. For a projection lens the smallest half-pitch is
$$R=k_1\frac{\lambda}{\mathrm{NA}},$$
where $\lambda$ is the wavelength, $\mathrm{NA}$ the numerical aperture of the lens (how wide a cone of light it collects,
at most about 1.35 with water immersion) and $k_1\approx0.3$–0.8 a "process skill" factor. MEMS rarely needs better than
1 µm and is often printed by a simple *proximity* aligner, where the mask hovers at a gap $g$ above the resist and
$W_{\min}\approx\sqrt{\lambda g}$, which is about 2 µm for a 10 µm gap. Chips for computers push the same formula to the limit with
193 nm and 13.5 nm (EUV) light.

```viz
b2-process-3d
```

**Removing material: etching.** Etching is how the stencil's shape is carved into the layer below. Two things matter:
how *selective* the etch is (it should eat the film, not the mask) and whether it is *isotropic* (equal speed in all
directions) or *anisotropic* (directional).
- **Wet isotropic etching** (for example HF for oxide, or HNA acid for silicon) eats sideways as fast as downward. A trench
  of depth $d$ undercuts the mask by $d$ on each side and has rounded walls.
- **Wet anisotropic etching** of silicon in hot potassium hydroxide (KOH, about 80 °C) attacks (100) planes 100–400 times
  faster than (111) planes. The etch stops on the slow (111) planes, so a square mask opening becomes an upside-down
  pyramid with walls sloping at 54.74°. Each wall drops $\tan54.74°=\sqrt2$ µm for every µm it moves inward, so a long
  opening of width $W$ becomes a V-groove whose two walls meet, and the etch stops by itself, at depth
  $$d=\frac{W}{2}\tan54.74°=\frac{W}{\sqrt2}\approx0.707\,W.$$
  Turned around: a wall that has gone down by $d$ has moved inward by only $d/\sqrt2$.
  Etch from the back through the wafer and stop a few µm short (timed, or on a boron-doped layer) and you get a thin
  **membrane**: the heart of a pressure sensor ([B5](B5-mems-microphones-pressure-sensors-and-actuators.md)).
- **Dry etching** uses a plasma. **Deep reactive-ion etching (DRIE)**, the *Bosch process*, alternates two short steps
  every few seconds: an SF₆ plasma etches silicon downward, then a C₄F₈ plasma coats everything with a thin
  Teflon-like film. Ions bombard the floor and clear the film there, but the side walls stay protected. The result
  is vertical walls of any shape with aspect ratios (depth/width) of 20:1 or more, with tiny ripples ("scallops") on
  the walls. DRIE is what makes the combs of accelerometers and gyroscopes.

```viz
b2-etch-profile
```

**Two ways to make a machine.** In **bulk micromachining** you carve into the wafer itself: KOH membranes, DRIE
through-wafer structures, V-grooves. The structures are thick (tens to hundreds of µm), so they are heavy, stiff and
quiet. In **surface micromachining** you build on top of the wafer: deposit a *sacrificial* oxide, open anchor holes,
deposit structural polysilicon, pattern it, then dissolve the oxide in hydrofluoric acid (HF). This **release** step
leaves beams and plates hanging 1–2 µm above the substrate, attached only at the anchors. The 3D figure above walks
through exactly this sequence to make a cantilever, the part that [B3](B3-micromechanics-beams-springs-and-resonators.md)
analyses.

**Stiction: the curse of release.** After the HF, the wafer is rinsed in water and dried. As the last water evaporates
from the 2 µm gap, the meniscus pulls the beam down with the Laplace pressure $\Delta p=2\gamma\cos\theta/g$ ($\gamma$ =
surface tension, $\theta$ = contact angle, $g$ = gap). That is 72 kPa for a 2 µm gap, enough to slam a soft beam onto the
substrate, where it sticks for good. This is B1's scaling in action: surface forces ($\propto\ell$ or $\ell^2$) beat spring forces in the micro-world.
Fabs avoid it with **critical-point drying** (CO₂ goes from liquid to gas without a meniscus), HF vapour release, dimples
under the plates and anti-stick coatings.

**Soft lithography: microfluidics in rubber.** Microfluidic chips ([C2](C2-pressure-driven-flow-and-hydraulic-circuits.md),
[C5](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md)) are usually not etched at all. A **master** is made
once by lithography in a thick negative resist (SU-8, 20–100 µm tall ridges in the shape of the channels). Liquid
**PDMS** (polydimethylsiloxane, a silicone rubber) mixed 10:1 with a curing agent is poured on, baked at about 65 °C for 2 h
and peeled off: a perfect negative with the channels as grooves. Punch inlet holes, treat with an oxygen plasma and press
onto glass: the surfaces bond permanently and seal the channels. PDMS is transparent, gas-permeable (cells can
breathe) and cheap, which is why biology labs make their own chips in an afternoon.

**Yield and cost: why MEMS is cheap.** A processed wafer costs maybe €1000–€3000, whether it holds 10 chips or
10 000. The number of square dies of area $A_{\text{die}}$ on a wafer of diameter $d_w$ is about
$$N_{\text{die}}\approx\frac{\pi(d_w/2)^2}{A_{\text{die}}}-\frac{\pi d_w}{\sqrt{2A_{\text{die}}}},$$
where the second term removes the partial dies cut off at the round edge. Random defects (dust, scratches) at a density
$n_d$ per cm² kill a die if one lands on it; with Poisson statistics the fraction of good dies is $Y=e^{-n_dA_{\text{die}}}$.
The cost of one good die is the wafer cost divided by $N_{\text{die}}Y$. Small dies win twice, since there are more of them
and each is less likely to catch a defect. This is how a phone accelerometer can cost less than 50 cents.

```viz
b2-wafer-yield
```

## Intuitive examples

1. **The magic angle.** The angle between (100) and (111) planes is $\arccos(1/\sqrt3)=54.74°$, and
   $\tan54.74°=1.4142=\sqrt2$ exactly. A KOH V-groove from a 10 µm opening is $10/\sqrt2=7.07$ µm deep, and from a 100 µm opening 70.71 µm deep.
2. **A pressure-sensor membrane.** To leave a 1000 µm square, 20 µm thick membrane in a 525 µm wafer, KOH must etch
   505 µm. Each wall moves inward by $d/\sqrt2$, so the back-side mask opening must be $1000+\sqrt2\cdot505=1714.2$ µm
   wide. At about 1 µm/min this takes 505 min, about 8.4 h.
3. **Lithography resolution** $R=k_1\lambda/\mathrm{NA}$: i-line projection ($k_1=0.6$, 365 nm, NA 0.5) gives 438 nm; ArF
   immersion ($k_1=0.3$, 193 nm, NA 1.35) 42.9 nm; EUV ($k_1=0.4$, 13.5 nm, NA 0.33) 16.4 nm. A MEMS proximity aligner at
   a 10 µm gap gives $\sqrt{\lambda g}=1.91$ µm, and at 40 µm 3.82 µm.
4. **Oxide growth** (wet, 1100 °C, $A_{\text{DG}}=0.11$ µm, $B_{\text{DG}}=0.51$ µm²/h): 0.5 µm takes 0.60 h, 1 µm takes
   2.18 h and 2 µm takes 8.27 h, four times longer for twice the thickness, as diffusion through the oxide predicts. The 1 µm oxide
   consumes 0.44 µm of silicon.
5. **Spin coating.** A resist that gives 1.4 µm at 4000 rpm gives 2.80 µm at 1000 rpm, 1.98 µm at 2000 rpm and 1.14 µm
   at 6000 rpm. LPCVD poly at 10 nm/min needs 200 min for a 2 µm structural layer.
6. **Isotropic vs DRIE.** A 4 µm opening etched 10 µm deep isotropically ends up 24 µm wide at the top. DRIE cuts a 2 µm
   wide, 40 µm deep trench (aspect ratio 20) in 80 cycles of 0.5 µm; at 8 s per cycle that is 640 s, about 10.7 min.
7. **Stiction.** Water drying in a 2 µm gap: $\Delta p=2\gamma/g=72$ kPa, a force of 720 µN on a 100 µm × 100 µm plate.
   A 1 N/m spring pulled down 2 µm resists with only 2 µN, so the capillary force wins 360 times.
8. **Cost per die** (200 mm wafer, €2000, $n_d=0.5$ cm⁻²): 2 mm × 2 mm dies give $N_{\text{die}}=7631$, $Y=0.9802$,
   €0.267 per good die. 10 mm × 10 mm dies give 269 dies with $Y=0.6065$: €12.26 each, 46 times more for 25 times the area.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $\theta_{111}=\arccos(1/\sqrt3)=54.74°$, $\tan\theta_{111}=\sqrt2$ | angle of KOH side walls on a (100) wafer | (100), (111) crystal planes |
| $d=\tfrac W2\tan54.74°=W/\sqrt2\approx0.707\,W$ | self-limiting depth of a KOH V-groove | $W$ mask opening, $d$ depth |
| $W_{\text{back}}=W_{\text{mem}}+\sqrt2\,d$ | back-side opening for a membrane of width $W_{\text{mem}}$ | $d$ etch depth |
| $R=k_1\lambda/\mathrm{NA}$; $W_{\min}\approx\sqrt{\lambda g}$ | smallest printable feature (projection; proximity) | $\lambda$ wavelength, NA numerical aperture, $g$ mask gap |
| $t_{\text{ox}}^2+A_{\text{DG}}t_{\text{ox}}=B_{\text{DG}}t$ | Deal–Grove oxidation: thick oxide grows as $\sqrt t$ | $t_{\text{ox}}$ oxide thickness, $t$ time |
| $t_{\text{resist}}\propto1/\sqrt{\text{rpm}}$ | spin-coated film thickness | rpm spin speed |
| $\Delta p=2\gamma\cos\theta/g$ | capillary pressure that causes stiction | $\gamma$ surface tension, $\theta$ contact angle |
| $N_{\text{die}}\approx\dfrac{\pi d_w^2}{4A_{\text{die}}}-\dfrac{\pi d_w}{\sqrt{2A_{\text{die}}}}$, $Y=e^{-n_dA_{\text{die}}}$ | dies per wafer and Poisson yield | $d_w$ wafer diameter, $n_d$ defect density |
| cost per good die $=\dfrac{\text{wafer cost}}{N_{\text{die}}Y}$ | why small chips are cheap | |

## Applications

| World | Microfabrication | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | a sap-flow chip is a sputtered platinum heater on a KOH-etched membrane; soil-moisture probes use lithographed interdigitated electrodes | the thin membrane (small heat capacity, B1) makes the heater respond in ms and sip power |
| 🧬 Biology & human health | glucose strips are screen-printed or sputtered electrodes; organ-on-chip devices are PDMS cast from an SU-8 master | a biology lab can make its own channels from one master, many times over ([C5](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md)) |
| 🌍 Environment | metal-oxide gas sensors sit on 1–2 µm suspended membranes released by KOH or DRIE; water-quality chips are glass or PDMS microfluidics | a suspended membrane lets a 300 °C hot plate run on a few mW |
| 🤖 Robotics & drones | IMU gyroscopes are DRIE-etched silicon combs 20–60 µm thick with µm gaps, sealed in vacuum at wafer level | vertical DRIE walls give large capacitance and mass in a small die ([B4](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md)) |
| 🚗 Cars | tyre-pressure sensors use KOH membranes with diffused piezoresistors; airbag accelerometers are surface-micromachined polysilicon | the 54.74° geometry sets the die size of every piezoresistive pressure sensor ([A4](A4-piezoelectric-piezoresistive-and-magnetic-sensors.md)) |
| 📱 Phones & photography | MEMS microphones have a 1 µm polysilicon membrane released over a back-plate; the CMOS image sensor is made with the same lithography | billions of identical dies per year at cents each: small die, high yield ([B5](B5-mems-microphones-pressure-sensors-and-actuators.md), [A5](A5-optical-sensors-photodiodes-image-sensors-and-lidar.md)) |
| 🏠 Home & household | smoke and CO detectors, thermostat humidity sensors (polymer film between lithographed electrodes), inkjet printheads (DRIE nozzles) | the same batch process makes devices that cost less than their packaging |

## Derivation

**(a) The 54.74° angle.**
1. The (100) plane has normal $\mathbf n_1=(1,0,0)$; a (111) plane has normal $\mathbf n_2=(1,1,1)/\sqrt3$.
2. The angle between planes is the angle between normals: $\cos\theta=\mathbf n_1\cdot\mathbf n_2=1/\sqrt3$.
3. $\theta=\arccos(0.5774)=54.74°$; then $\sin\theta=\sqrt{2/3}$ and $\tan\theta=\sqrt{2/3}/\sqrt{1/3}=\sqrt2$.

**(b) V-groove depth and membrane opening.**
1. The (111) wall makes the angle $\theta=54.74°$ with the wafer surface; it starts at the mask edge (KOH barely undercuts).
2. Going a horizontal distance (run) $r$ inward from the edge, the wall drops by $r\tan\theta=\sqrt2\,r$.
3. The two walls of a groove of opening $W$ meet in the middle, at a run of $W/2$: $d=\tfrac W2\tan\theta=W/\sqrt2$.
4. There the (100) floor has vanished, only slow (111) planes are exposed, and the etch practically stops: the groove is self-limiting.
5. Turned around, a wall that has reached depth $d$ has moved inward by $d/\tan\theta=d/\sqrt2$ on each side.
6. So a membrane (or flat floor) of width $W_{\text{mem}}$ at depth $d$ needs a mask opening $W_{\text{back}}=W_{\text{mem}}+2d/\sqrt2=W_{\text{mem}}+\sqrt2\,d$.

**(c) Isotropic undercut.** The etch front moves at the same speed in every direction, so from each mask edge it is a
quarter circle of radius $d$: the top width becomes $W+2d$.

**(d) Lithography limit.**
1. A grating of period $p$ diffracts light at angles $\sin\vartheta=\lambda/p$.
2. The lens must capture at least the first diffracted order to form an image: $\lambda/p\le\mathrm{NA}$.
3. So $p_{\min}=\lambda/\mathrm{NA}$ and the half-pitch $R=p/2=0.5\,\lambda/\mathrm{NA}$; process tricks push the factor $k_1$
   down to about 0.25–0.3.

**(e) Deal–Grove.**
1. Oxygen flux through an oxide of thickness $t_{\text{ox}}$ is $\propto1/(t_{\text{ox}}+\text{const})$ (Fick's law plus surface reaction).
2. The growth speed $dt_{\text{ox}}/dt\propto$ flux: $(2t_{\text{ox}}+A_{\text{DG}})\,dt_{\text{ox}}=B_{\text{DG}}\,dt$.
3. Integrate from 0: $t_{\text{ox}}^2+A_{\text{DG}}t_{\text{ox}}=B_{\text{DG}}t$. For thick oxides $t_{\text{ox}}\approx\sqrt{B_{\text{DG}}t}$.

**(f) Yield and cost.**
1. Defects land at random, on average $n_dA_{\text{die}}$ per die (Poisson).
2. The probability of zero defects is $Y=e^{-n_dA_{\text{die}}}$.
3. Good dies $=N_{\text{die}}Y$; cost per good die $=$ wafer cost $/(N_{\text{die}}Y)$, which grows faster than the area.

## Worked check

**A KOH V-groove for an optical fibre.** A (100) wafer gets a 60 µm wide mask opening.
- Depth: $d=\tfrac{60}{2}\tan54.74°=30\times1.4142=42.43$ µm.
- Check the run: $d/\tan54.74°=42.43/1.4142=30.00$ µm $=W/2$ ✓ (the two walls meet in the middle).
- Length of each sloping wall: $(W/2)/\cos54.74°=30/0.5774=51.96$ µm.
- At 1 µm/min the groove self-limits after about 42.4 min, so over-etching does no harm.
- If instead you want a flat-bottomed trench 60 µm wide at a depth of 20 µm, the mask opening must be $60+\sqrt2\cdot20=88.28$ µm.
- A common slip is to divide by $\tan54.74°$ instead of multiplying; it would give 21.21 µm, half the true depth.

**Cost of one good die** (200 mm wafer, €2000, $n_d=0.5$ cm⁻², 2 mm × 2 mm): $\pi\,100^2/4=7853.98$ minus
$\pi\,200/\sqrt8=222.14$ gives 7631 dies; $Y=e^{-0.5\times0.04}=0.9802$; $2000/(7631\times0.9802)=0.267$, so €0.267 per good die.

All numbers come from `scripts/checks/B2_check.py`.

## Whiteboard plan

- **Panel 1: the stencil.** Draw a wafer cross-section, a resist layer and a mask above with UV arrows. Write
  "spin → expose → develop → etch → strip". Say: "Spray paint through a stencil, thousands of chips at once."
- **Panel 2: the layer cake.** Stack: Si, oxide (sacrificial), poly (structural), resist. Then the same stack after
  patterning and the HF release: a beam hanging over an empty gap with one anchor. Label "surface micromachining".
- **Panel 3: three etch profiles.** Side by side: a rounded isotropic bowl with undercut $d$; a KOH V with 54.74° marked
  and $d=W/\sqrt2$; a DRIE trench with straight walls and scallops. Write the cube and its (111) plane in a corner.
- **Panel 4: resolution.** Write $R=k_1\lambda/\mathrm{NA}$ and a 3-row table: 365 nm → 438 nm, 193 nm immersion → 43 nm,
  EUV → 16 nm. Say: "MEMS needs 1 µm; your laptop's chip needs 20 nm."
- **Panel 5: stiction.** A beam above the substrate with a drop of water in the gap and the arrow $\Delta p=2\gamma/g=72$ kPa.
  Say: "B1 again: surface forces win at the micro-scale."
- **Panel 6: the wafer map.** A circle full of squares with a few red dots (defects). Write $Y=e^{-n_dA_{\text{die}}}$ and
  "cost per good die = wafer cost / (N·Y)".

## Common mistakes and where the intuition breaks

- **Dividing instead of multiplying by tan 54.74°.** The (111) wall is steep: it drops $\sqrt2$ for each unit it moves
  sideways. A V-groove is deeper ($0.707\,W$) than it is half-wide. Draw the triangle before using a formula.
- **Thinking KOH makes any shape.** KOH follows the crystal: a round or diagonal opening still ends in a pit bounded by
  (111) planes, and convex corners get eaten away (fabs add "corner compensation" shapes). For arbitrary shapes, use DRIE.
- **Positive vs negative resist.** In positive resist the light *removes* resist; the mask's chrome is what remains. In
  negative resist (SU-8) the light *keeps* it. Mixing them up inverts the whole device.
- **"Resolution is just the wavelength."** Real limits also include resist thickness, depth of focus, alignment between masks
  (often the real limit in MEMS, about 0.5–1 µm) and the etch, which can widen or undercut the printed line.
- **Ignoring stress.** Deposited films are rarely stress-free. Compressive poly buckles fixed-fixed beams; stress gradients
  curl released cantilevers. Annealing and folded springs ([B3](B3-micromechanics-beams-springs-and-resonators.md)) are the
  remedies.
- **Forgetting the release.** Surface-micromachined parts stick if dried naively. Stiction and particles cause most yield loss in MEMS.
- **Where the picture breaks:** "a thin film is a perfect box" is a cartoon. Real films have rounded steps, grains, residual
  stress and a thickness that varies by a few percent across the wafer, and that variation is what calibration
  ([A8](A8-noise-resolution-calibration-and-drift.md)) later has to remove.

## Remember

**"Deposit, pattern with light, etch, repeat; release last. Crystal planes give 54.74°, plasmas give vertical walls, and small dies are cheap."**

## Self-test

1. A square KOH mask opening of 200 µm × 200 µm is etched on a (100) wafer until it stops. What shape results, and how deep is it?
   <details><summary>Answer</summary>An inverted square pyramid bounded by four (111) planes, each sloping at 54.74°. The walls meet at the centre after a run of 100 µm, so the depth is 100 × tan 54.74° = 100 × 1.414 ≈ 141 µm.</details>
2. Why do surface-micromachined beams stick to the substrate after release, and name two cures.
   <details><summary>Answer</summary>As the rinse water dries in the 1–2 µm gap, its meniscus pulls with a Laplace pressure 2γ cos θ / g of order 70 kPa, far more than a soft spring can resist; once in contact, surface forces keep the beam stuck. Cures: critical-point drying with CO₂ (no meniscus), HF-vapour release, dimples that reduce the contact area, hydrophobic anti-stiction coatings.</details>
3. A die of 1 cm² on a wafer with 0.5 defects per cm² has what yield? What if the die is shrunk to 0.25 cm²?
   <details><summary>Answer</summary>Y = e^(−0.5×1) = 0.61 for 1 cm²; e^(−0.5×0.25) = 0.88 for 0.25 cm². The smaller die also fits about 4× more per wafer, so the cost per good die falls by more than 5×.</details>

**Next:** [B3 Micromechanics: beams, springs and resonators](B3-micromechanics-beams-springs-and-resonators.md): we can now build a released silicon beam; next we calculate how stiff it is and at what frequency it rings.
