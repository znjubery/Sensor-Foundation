# C1. Fluids at the microscale: Reynolds number and laminar flow

> **Connects:** builds on [B1 Scaling laws](B1-scaling-laws-why-small-is-different.md) · used by [C2 Pressure-driven flow](C2-pressure-driven-flow-and-hydraulic-circuits.md), [C3 Diffusion and mixing](C3-diffusion-mixing-and-the-peclet-number.md), [C4 Surface tension and droplets](C4-surface-tension-capillarity-droplets-and-electrokinetics.md), [C5 Lab-on-a-chip](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md)

## Hook — stirring honey vs. stirring water

Stir a cup of tea and pull the spoon out. The tea keeps swirling for several seconds: it has **momentum**, and it coasts.
Now stir a jar of honey and stop. The honey stops *at once*. Pull the spoon backwards along the path it came and a
streak of honey goes back almost to where it started. Nothing coasts, nothing swirls, and nothing mixes by itself.

A drop of water flowing through a channel thinner than a hair behaves like the honey, not like the tea. Water hasn't
changed; the **size** has. To a bacterium, water feels thicker than honey feels to you. This one fact explains why
two streams that meet inside a microfluidic chip flow side by side for centimetres without mixing, why a sperm cell
can't swim like a fish, and why the sap in a plant's veins moves like a slow, orderly conveyor belt. One dimensionless
number, the **Reynolds number**, tells you which world you are in.

## The idea in plain words

**Viscosity is the fluid's internal friction.** Picture a deck of playing cards on a table. Push the top card and the
cards below follow, each a little less than the one above. A flowing fluid is like that: thin layers slide over each
other, and each layer drags its neighbours along. The **dynamic viscosity** $\mu$ measures how hard that drag is. If
you slide one layer at speed $U$ past another a distance $h$ away, the friction force per unit area (the **shear
stress**) is $\mu U/h$. Water has $\mu\approx1$ mPa·s $=10^{-3}$ Pa·s; honey has about $10$ Pa·s, ten thousand times
more; air has $1.8\times10^{-5}$ Pa·s. Dividing by the density $\rho$ gives the **kinematic viscosity** $\nu=\mu/\rho$,
which says how fast a velocity difference *smooths itself out*: $10^{-6}$ m²/s for water, $1.5\times10^{-5}$ m²/s for
air.

**The no-slip condition.** Fluid touching a solid wall moves with the wall. If the wall is still, the fluid right at it
is still too, and speed builds up away from the wall. This is why dust stays on a fan blade and why a velocity profile
in a channel is curved: zero at the walls, fastest in the middle. (At the scale of a few nanometres, or for gases at
very low pressure, slip can appear; for liquids in chips, no-slip holds.)

**Navier–Stokes, in words.** Every flowing liquid obeys Newton's second law, written per unit volume:
$$\underbrace{\rho\Big(\frac{\partial\mathbf u}{\partial t}+(\mathbf u\cdot\nabla)\mathbf u\Big)}_{\text{mass × acceleration (inertia)}}=\underbrace{-\nabla p}_{\text{pressure push}}+\underbrace{\mu\nabla^2\mathbf u}_{\text{viscous friction}}.$$
Here $\mathbf u$ is the velocity field (an arrow at every point) and $p$ the pressure. The left side is "mass times
acceleration" for a small parcel of fluid. The term $(\mathbf u\cdot\nabla)\mathbf u$ is the tricky one: it says a parcel
speeds up or turns simply because it is *carried* into a region where the flow is different. That term is **nonlinear**
(velocity times velocity), and all the richness of turbulence, eddies and vortices hides in it. On the right, pressure
pushes from high to low, and viscosity tries to make every parcel move like its neighbours ($\nabla^2\mathbf u$ is large
where the velocity is "bent"). Add $\nabla\cdot\mathbf u=0$ (liquid can't be squeezed) and you have the full law.

**The Reynolds number compares inertia with friction.** For a flow of speed $U$ past or through something of size
$L$, the inertial term is about $\rho U^2/L$ and the viscous term about $\mu U/L^2$. Their ratio is
$$\mathrm{Re}=\frac{\rho U^2/L}{\mu U/L^2}=\frac{\rho UL}{\mu}=\frac{UL}{\nu}.$$
When $\mathrm{Re}\gg1$, inertia rules: fluid coasts, swirls and forms eddies. When $\mathrm{Re}\ll1$, friction rules:
the fluid stops the moment you stop pushing. Because $\mathrm{Re}$ contains the product $UL$, and small things are
also slow, $\mathrm{Re}$ falls roughly as the square of the size (B1). Shrink a pipe 1000 times and run it 1000 times
slower, and $\mathrm{Re}$ falls a million times.

```viz
c1-reynolds-ladder
```

**Laminar and turbulent.** In a straight pipe, flow is **laminar** (in smooth layers, "lamina" = sheet) up to
$\mathrm{Re}\approx2300$, using the pipe diameter for $L$. Above that, small disturbances are amplified, puffs of chaos
appear, and above about 4000 the flow is fully **turbulent**: velocity fluctuates wildly and randomly, and anything
in it is mixed in seconds. A garden hose at full blast is turbulent; a microchannel is never anywhere close. To reach
$\mathrm{Re}=2300$ in a 100 µm channel, water would have to race through at tens of metres per second, which would
need a pressure the chip can't survive.

**Stokes flow and time reversibility.** When $\mathrm{Re}\ll1$, you may drop the whole left side of Navier–Stokes:
$$0=-\nabla p+\mu\nabla^2\mathbf u\qquad(\text{Stokes, or creeping, flow}).$$
This equation has no time in it, and it is **linear**. Two remarkable things follow. First, the flow at each instant
is set entirely by the boundaries at that instant: no memory, no coasting. Second, if you reverse the push, every
velocity reverses exactly. Run a pump forwards for 3 s, then backwards for 3 s, and every fluid parcel returns to where
it started. G. I. Taylor famously filmed a drop of dye in glycerol being smeared into a thin sheet by a rotating
cylinder, then "un-mixed" back into a drop by turning the cylinder back.

**The scallop theorem.** Edward Purcell's 1976 lecture *Life at low Reynolds number* drew the consequence for
swimming. A scallop opens its shell slowly and closes it fast; at high $\mathrm{Re}$ the fast jet pushes it forward. At
low $\mathrm{Re}$ the speed doesn't matter, only the sequence of shapes. A motion that simply goes back and forth
(**reciprocal**: open–close–open) retraces itself and the swimmer ends where it began. So microorganisms use motions
that are *not* time-symmetric: the rotating corkscrew flagellum of *E. coli*, the travelling wave on a sperm's tail,
the beating of cilia with a stiff power stroke and a floppy return stroke. Purcell's number: if a bacterium stops
swimming, it coasts about a tenth of an ångström, less than the width of an atom, in less than a microsecond.

**Two streams that don't mix.** Feed a dyed stream and a clear stream into a Y-shaped junction. At low $\mathrm{Re}$
they flow side by side down the channel, their interface sharp and straight, because nothing stirs them: no eddies,
no swirls. The only thing that blurs the interface is **diffusion** of molecules across it, which is slow (C3). Chip
designers use this to put a sample next to a reagent, to sort particles, or to bathe one half of a cell in a drug and
the other half in plain medium.

```viz
c1-channel-3d
```

**The entrance length.** Fluid entering a channel from a big reservoir starts with a nearly flat velocity profile. The
no-slip walls slow the fluid next to them, and that "slowness" spreads inward until the full curved profile (the
parabola of C2) is established. The distance this takes is the **entrance length**, which we write $L_e$ (a local
symbol). For laminar flow, a good fit across all $\mathrm{Re}$ is
$$\frac{L_e}{D_h}\approx\frac{0.6}{1+0.035\,\mathrm{Re}}+0.056\,\mathrm{Re},$$
where $D_h$ is the hydraulic diameter of the channel (the diameter for a round pipe; $2wh/(w+h)$ for a rectangle of
width $w$ and height $h$). At high $\mathrm{Re}$ this is the textbook $L_e\approx0.06\,\mathrm{Re}\,D_h$; at low
$\mathrm{Re}$ it settles to about $0.6\,D_h$. So in a chip the profile is fully developed within one channel width of
the inlet, and the simple formulas of C2 hold almost everywhere.

**What Re does *not* say.** $\mathrm{Re}$ compares inertia with viscosity only. Whether two streams mix is a
different question (flow speed against diffusion: the Péclet number of C3). Whether droplets form is yet another
(viscosity against surface tension: the capillary number of C4). Microfluidics is the art of knowing which ratio rules.

## Intuitive examples

1. **A microchannel.** Water ($\rho=1000$ kg/m³, $\mu=10^{-3}$ Pa·s) at $U=1$ mm/s in a channel $L=100$ µm wide:
   $\mathrm{Re}=1000\times10^{-3}\times10^{-4}/10^{-3}=0.1$. Speed it up to 1 cm/s and $\mathrm{Re}=1.0$; still laminar,
   still nearly Stokes flow.
2. **Blood in a capillary.** A red cell squeezes through an 8 µm capillary at about 1 mm/s; with blood
   ($\rho=1060$ kg/m³, $\mu\approx3.5$ mPa·s), $\mathrm{Re}=2.4\times10^{-3}$. In the aorta (2.5 cm, 0.2 m/s mean)
   $\mathrm{Re}\approx1500$: laminar on average, but close enough to the transition that the peak of each heartbeat can
   produce brief disturbed flow.
3. **Purcell's ladder.** *E. coli*: 1 µm, 30 µm/s, $\mathrm{Re}=3\times10^{-5}$. A human sperm (50 µm, 50 µm/s):
   $\mathrm{Re}=2.5\times10^{-3}$. A small fish (5 cm, 10 cm/s): $5\times10^{3}$. A human swimmer (2 m, 1 m/s):
   $2\times10^{6}$. Between the bacterium and the swimmer, eleven powers of ten.
4. **Spoons.** A spoon (2 cm) stirred at 5 cm/s: in tea $\mathrm{Re}=1000$ (it swirls), in honey ($\mu=10$ Pa·s,
   $\rho=1400$ kg/m³) $\mathrm{Re}=0.14$, the same world as a microchannel. Honey is a hands-on microfluidics lab.
5. **Machines in air.** Air has $\nu=1.5\times10^{-5}$ m²/s. A drone's propeller blade (2 cm chord, 50 m/s):
   $\mathrm{Re}=6.7\times10^{4}$. A car (4.5 m, 30 m/s): $9\times10^{6}$. An airliner at cruise (40 m, 250 m/s, thin
   cold air): $2.7\times10^{8}$.
6. **A garden hose.** 16 mm hose: at 1 m/s, $\mathrm{Re}=16\,000$, turbulent (the jet is rough). Turn it down to
   0.1 m/s and $\mathrm{Re}=1600$: the stream from the nozzle turns glassy and smooth. Its entrance length is then
   $\approx90$ diameters, 1.4 m, while in a 100 µm channel at $\mathrm{Re}=0.1$ it is 60 µm.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| shear stress $=\mu\,\dfrac{du}{dy}$ | friction between sliding layers | $\mu$ dynamic viscosity (Pa·s), $u$ speed, $y$ distance across the flow |
| $\nu=\mu/\rho$ | how fast velocity differences diffuse away | water $10^{-6}$ m²/s, air $1.5\times10^{-5}$ m²/s |
| $\rho\big(\partial_t\mathbf u+(\mathbf u\cdot\nabla)\mathbf u\big)=-\nabla p+\mu\nabla^2\mathbf u$, $\ \nabla\cdot\mathbf u=0$ | Navier–Stokes: Newton's law per volume, incompressible | $\mathbf u$ velocity field, $p$ pressure, $\rho$ density |
| $\mathrm{Re}=\dfrac{\rho UL}{\mu}=\dfrac{UL}{\nu}$ | inertia ÷ viscous friction | $U$ speed scale, $L$ size scale (for a channel, $D_h$) |
| $0=-\nabla p+\mu\nabla^2\mathbf u$ | Stokes flow, valid for $\mathrm{Re}\ll1$: linear, no time, reversible | |
| $\mathrm{Re}_{\text{pipe}}\lessapprox2300$ | laminar pipe flow; turbulent above ~4000 | $L$ = pipe diameter |
| $D_h=\dfrac{4\times\text{area}}{\text{perimeter}}=\dfrac{2wh}{w+h}$ | hydraulic diameter of a rectangular channel | $w$ width, $h$ height |
| $\dfrac{L_e}{D_h}\approx\dfrac{0.6}{1+0.035\,\mathrm{Re}}+0.056\,\mathrm{Re}$ | entrance length for the profile to develop | $L_e$ local symbol |
| $t_{\text{coast}}=\dfrac{2\rho r^2}{9\mu}$ | how long a sphere of radius $r$ keeps moving after the push stops | from mass ÷ Stokes drag $6\pi\mu r$ |

## Applications

| World | Reynolds number and laminar flow | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | sap in xylem vessels (20–100 µm, ~1 mm/s): $\mathrm{Re}\sim0.01$–$0.1$; nutrient films in hydroponics; sap-flow chips on stems | sap moves in smooth layers, so its flow follows the simple laws of C2 and a heat-pulse sap-flow sensor can be modelled exactly |
| 🧬 Biology & human health | bacteria and sperm swim at $\mathrm{Re}\ll1$; capillaries $\sim10^{-3}$; aorta $\sim1500$; lab-on-a-chip blood tests | microswimmers need non-reciprocal strokes; turbulence near heart valves is a warning sign; chips keep blood samples in tidy layers |
| 🌍 Environment | water-quality chips co-flow a sample beside a reagent; particle counters guide air in a laminar sheath | the sample and reagent only meet by diffusion at a controlled interface, so the colour change is reproducible |
| 🤖 Robotics & drones | propeller blades at $\mathrm{Re}\sim10^4$–$10^5$; micro-robots for drug delivery at $\mathrm{Re}\ll1$ | small drone propellers are less efficient (viscous losses grow as Re falls); micro-robots must corkscrew like bacteria |
| 🚗 Cars | car body $\mathrm{Re}\sim10^7$ (turbulent wake, drag); fuel injectors and the λ-sensor's gas channels are small and laminar | streamlining fights turbulence; a sensor's tiny gas path behaves predictably |
| 📱 Phones & photography | air in a MEMS microphone's vent and behind the membrane: tiny $\mathrm{Re}$, squeeze-film flow | that air acts as a damper, not a wind; it shapes the microphone's frequency response (B5) |
| 🏠 Home & household | tap water: turbulent at full flow, glassy at a trickle; honey, syrup, shampoo; smoke rising smoothly then breaking up | the smooth column of smoke above a candle turns turbulent once its Re grows; honey is your kitchen's microchannel |

## Derivation

**(a) Shear stress and viscosity.**
1. Two plates a distance $h$ apart, the top one sliding at $U$, liquid in between.
2. No-slip: the liquid at the bottom is still, at the top moves at $U$; in steady flow the speed rises linearly, $u(y)=Uy/h$.
3. The force per area needed to keep the plate moving is measured to be proportional to the velocity gradient: shear stress $=\mu\,du/dy=\mu U/h$.
4. That proportionality constant is the dynamic viscosity $\mu$ (units Pa·s).

**(b) Newton's law for a fluid parcel (Navier–Stokes in words).**
1. Take a small cube of fluid, volume $dV$, mass $\rho\,dV$.
2. Its acceleration, following the parcel, is $\dfrac{D\mathbf u}{Dt}=\partial_t\mathbf u+(\mathbf u\cdot\nabla)\mathbf u$ (change in time at a point plus change because it moves to a new point).
3. Net pressure force: pressure is higher on one face than the opposite face, giving $-\nabla p\,dV$.
4. Net viscous force: the shear stress on opposite faces differs by its gradient, giving $\mu\nabla^2\mathbf u\,dV$.
5. Newton: $\rho\,D\mathbf u/Dt=-\nabla p+\mu\nabla^2\mathbf u$. Mass conservation for a liquid: $\nabla\cdot\mathbf u=0$.

**(c) Re from scaling each term.**
1. Velocities are of size $U$; they change over distances of size $L$.
2. Each spatial derivative contributes a factor $1/L$: $(\mathbf u\cdot\nabla)\mathbf u\sim U\cdot U/L$.
3. Two derivatives: $\nabla^2\mathbf u\sim U/L^2$.
4. Ratio of inertial to viscous: $\dfrac{\rho U^2/L}{\mu U/L^2}=\dfrac{\rho UL}{\mu}\equiv\mathrm{Re}$.
5. Rescale: $\mathbf u=U\tilde{\mathbf u}$, $\mathbf x=L\tilde{\mathbf x}$, $p=(\mu U/L)\tilde p$ and divide by $\mu U/L^2$: $\mathrm{Re}\,\dfrac{D\tilde{\mathbf u}}{D\tilde t}=-\tilde\nabla\tilde p+\tilde\nabla^2\tilde{\mathbf u}$.
6. So $\mathrm{Re}$ is the only parameter left. As $\mathrm{Re}\to0$ the left side vanishes: the Stokes equation.

**(d) Time reversibility of Stokes flow.**
1. Stokes: $\mu\nabla^2\mathbf u=\nabla p$, with $\mathbf u$ given on the walls.
2. If $(\mathbf u,p)$ solves it, then $(-\mathbf u,-p)$ solves it too (linear equation, flip both sides).
3. So reversing the boundary motion or the pressure exactly reverses every velocity.
4. A parcel's path is $\mathbf x(t)=\mathbf x_0+\int\mathbf u\,dt$; running the push backwards for the same time cancels the integral: the parcel returns to $\mathbf x_0$.
5. Inertia would break this: a parcel that has speeded up keeps going (the $D\mathbf u/Dt$ term remembers the past).

**(e) Coasting time of a small sphere.**
1. A sphere of radius $r$ moving at $U$ in Stokes flow feels drag $F=6\pi\mu rU$ (Stokes' law).
2. Its mass is $m=\tfrac43\pi r^3\rho$. Newton: $m\,dU/dt=-6\pi\mu r\,U$.
3. So $U$ decays as $e^{-t/t_{\text{coast}}}$ with $t_{\text{coast}}=\dfrac{m}{6\pi\mu r}=\dfrac{2\rho r^2}{9\mu}$.
4. Coasting distance $=U\,t_{\text{coast}}$. For $r=1$ µm, $U=30$ µm/s: $t_{\text{coast}}=0.22$ µs and the distance is $6.7\times10^{-12}$ m $=0.067$ Å.

**(f) Entrance length.**
1. Near the inlet the wall slows a thin layer; momentum diffuses inward with diffusivity $\nu$.
2. To reach the centre, a distance $\sim D_h/2$, takes a time $t\sim D_h^2/\nu$, during which the fluid travels $L_e\sim U t=U D_h^2/\nu=\mathrm{Re}\,D_h$. The measured constant is $0.056$.
3. At low $\mathrm{Re}$, viscosity acts upstream as well, so the profile can't develop in less than about half a diameter: hence the $0.6/(1+0.035\,\mathrm{Re})$ term.

## Worked check

A PDMS channel $w=100$ µm wide and $h=50$ µm high carries water at a mean speed of $U=5$ mm/s.

- Hydraulic diameter: $D_h=2wh/(w+h)=2(100)(50)/150=66.7$ µm.
- Reynolds number: $\mathrm{Re}=\rho UD_h/\mu=1000\times0.005\times66.7\times10^{-6}/10^{-3}=0.333$.
- As two forces per volume: inertia $\rho U^2/D_h=1000\times(0.005)^2/66.7\times10^{-6}=375$ N/m³; viscous
  $\mu U/D_h^2=10^{-3}\times0.005/(66.7\times10^{-6})^2=1125$ N/m³. Ratio $375/1125=0.333$ ✓, the same number.
- Entrance length: $L_e/D_h=0.6/(1+0.035\times0.333)+0.056\times0.333=0.612$, so $L_e\approx41$ µm. The
  profile is fully developed within half a channel width.
- To make this channel turbulent you would need $U=2300\,\mu/(\rho D_h)=34.5$ m/s, about 6900 times faster.
  (The check script `scripts/checks/C1_check.py` reproduces every number in this note.)

## Whiteboard plan

- **Panel 1 — honey vs. tea.** Two cups, one spoon each. Tea: curly arrows that keep going after the spoon stops.
  Honey: a streak that stops and can be pulled back. Write "inertia" over the tea and "friction" over the honey.
- **Panel 2 — viscosity.** A deck of cards sheared sideways; then two plates with a straight velocity profile and
  "stress $=\mu\,du/dy$". Values: water $10^{-3}$, honey $10$, air $1.8\times10^{-5}$ Pa·s.
- **Panel 3 — Navier–Stokes, labelled.** Write the equation with three braces: "mass × acceleration", "pressure push",
  "friction". Circle $(\mathbf u\cdot\nabla)\mathbf u$ and say "nonlinear: the source of turbulence".
- **Panel 4 — Re.** Under each brace write its size, $\rho U^2/L$ and $\mu U/L^2$; divide; box
  $\mathrm{Re}=\rho UL/\mu$. Draw the log ladder: bacterium $10^{-5}$, chip $0.1$, aorta $10^3$, swimmer $10^6$,
  plane $10^8$, with lines at 1 and 2300.
- **Panel 5 — the chip.** A Y-junction with a yellow and a blue stream side by side, a parabolic arrow profile, and
  a short bracket "entrance length ≈ 0.6 $D_h$". Next to it a turbulent pipe with scribbles.
- **Panel 6 — the scallop.** A scallop opening and closing with arrows "→ then ←, net 0", and a corkscrew flagellum
  with "non-reciprocal: net motion". Write "Stokes: no time, linear ⇒ reversible".

## Common mistakes and where the intuition breaks

- **Using the wrong length.** $L$ must be the size over which the velocity changes: the channel's smallest
  dimension or its hydraulic diameter, not its length. A 5 cm-long, 50 µm-high channel has $L\approx D_h$, not 5 cm.
- **Thinking low Re means "slow".** A microchannel flow can be fast (cm/s) and still have $\mathrm{Re}<1$; a
  glacier is slow and its Re is tiny for a different reason (enormous viscosity). Re is a *ratio*.
- **Treating 2300 as universal.** It is for long straight pipes with ordinary disturbances. Very smooth pipes have
  stayed laminar to $10^5$; flow around obstacles, in curved channels or over a wing becomes unsteady at quite
  different values. In a curved microchannel at $\mathrm{Re}\sim10$–$100$, inertia already produces secondary
  "Dean" vortices, which **inertial microfluidics** uses to sort cells.
- **"Laminar means mixed slowly, so it must mix eventually."** Without diffusion, laminar streams never mix; with
  diffusion they mix over a length $\sim\mathrm{Pe}\,w$ that can be centimetres (C3). Turbulence mixes by stretching;
  laminar flow only shears.
- **Forgetting no-slip at the walls.** The mean speed is not the speed of every parcel. Particles near the walls lag,
  which is why a dye plug smears out along the channel (Taylor dispersion, C3).
- **Applying Stokes reversibility with inertia, elasticity or diffusion present.** Taylor's demo works because dye
  diffuses very slowly in glycerol. Wait too long and diffusion, which is *not* reversible, blurs the drop for good.
  Polymer solutions (saliva, mucus) are elastic and also break the scallop theorem.

## Remember

**"Re = ρUL/μ = inertia ÷ friction. In a chip Re ≪ 1: the flow is laminar, instantaneous and reversible, and two streams never mix except by diffusion."**

## Self-test

1. A blood-plasma microchannel is 50 µm wide; plasma has $\mu=1.2$ mPa·s, $\rho=1025$ kg/m³, and flows at 2 mm/s. Find Re. Is it laminar?
   <details><summary>Answer</summary>Re = 1025 × 0.002 × 50e-6 / 1.2e-3 ≈ 0.085. Far below 1 (and far below 2300): laminar, practically Stokes flow.</details>
2. Why can't a microscopic robot swim by flapping a single rigid fin back and forth, however fast?
   <details><summary>Answer</summary>At Re much less than 1 the flow has no inertia and is time-reversible, so only the sequence of shapes matters, not the speed. Flapping one hinge back and forth is a reciprocal motion: the return stroke undoes the forward stroke exactly (scallop theorem). It needs a non-reciprocal motion, such as a rotating corkscrew or a travelling wave.</details>
3. A chip channel is copied 10× larger in every dimension, and the liquid is pushed 10× faster. By how much does Re change, and is the copy still laminar if the original had Re = 0.1?
   <details><summary>Answer</summary>Re is proportional to U times L, so it grows 10 × 10 = 100 times, to Re = 10. Still laminar (far below 2300), but inertia is no longer negligible: the flow is no longer reversible Stokes flow, and in curved channels secondary (Dean) vortices start to appear.</details>

**Next:** [C2 Pressure-driven flow and hydraulic circuits](C2-pressure-driven-flow-and-hydraulic-circuits.md) — now that we know chip flow is laminar, we can solve it exactly: a parabola, a law $Q\propto r_0^4$, and Ohm's law for water.
