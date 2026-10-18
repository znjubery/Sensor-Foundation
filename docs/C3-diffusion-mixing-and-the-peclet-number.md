# C3. Diffusion, mixing and the Péclet number

> **Connects:** builds on [C1 Fluids at the microscale](C1-fluids-at-the-microscale-reynolds-number-and-laminar-flow.md), [C2 Pressure-driven flow](C2-pressure-driven-flow-and-hydraulic-circuits.md), [A8 Noise, resolution, calibration and drift](A8-noise-resolution-calibration-and-drift.md) (sums of random kicks), [B1 Scaling laws](B1-scaling-laws-why-small-is-different.md) · used by [C4 Surface tension, droplets and electrokinetics](C4-surface-tension-capillarity-droplets-and-electrokinetics.md), [C5 Lab-on-a-chip](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md)

## Hook — a tea bag in still water

Lower a tea bag into a glass of cold water and don't stir. A brown cloud creeps out, but an hour later the top of the
glass is still pale. Leave it overnight and the colour is finally even. Stir with a spoon and the same job takes two
seconds.

The creeping cloud is **diffusion**: every tea molecule is jostled by water molecules and wanders off on a random walk.
It is hopeless over centimetres and very fast over micrometres, because the time it takes grows with the *square* of
the distance. That single square explains why a microfluidic chip can't rely on stirring (it has no turbulence, C1),
why it doesn't need to if its channels are thin enough, why glucose reaches a test-strip electrode in seconds, and how
a chip can separate small molecules from big cells without any filter at all.

## The idea in plain words

**A random walk.** A dissolved molecule is hit by water molecules about $10^{13}$ times a second, from random
directions. Model this as a walk: every short time $\tau_s$ it takes a step of length $\delta$, left or right with
equal chance, forgetting its past ($\tau_s$ and $\delta$ are local symbols). After $N$ steps its position is the sum of
$N$ random $\pm\delta$. On average it goes nowhere: $\langle x\rangle=0$ (the angle brackets mean "average over many
molecules"). But its *spread* grows: the mean square displacement is
$$\langle x^2\rangle=N\delta^2=2Dt,\qquad D=\frac{\delta^2}{2\tau_s},$$
where $t=N\tau_s$ is the elapsed time and $D$ is the **diffusion coefficient** (m²/s). The typical distance travelled,
$\sqrt{\langle x^2\rangle}=\sqrt{2Dt}$, grows as the **square root of time**: to go twice as far takes four times as
long. In 2D, $\langle r^2\rangle=4Dt$; in 3D, $6Dt$. This is the same mathematics as noise adding up in A8: independent
kicks add in squares, so their sum grows as $\sqrt N$.

```viz
c3-random-walk
```

**Where $D$ comes from: Stokes–Einstein.** A molecule or particle of radius $r$ is driven by thermal energy $k_BT$
($4.1\times10^{-21}$ J at 25 °C) and held back by viscous drag $6\pi\mu r$ (Stokes' law, C1). Einstein showed in 1905
that
$$D=\frac{k_BT}{6\pi\mu r}.$$
Small and hot means fast; big and viscous means slow. In water at 25 °C ($\mu=0.89$ mPa·s): glucose
($r\approx0.38$ nm) has $D=6.5\times10^{-10}$ m²/s; the blood protein albumin (3.5 nm) $7.0\times10^{-11}$; an
antibody (5.5 nm) $4.5\times10^{-11}$; a bacterium (1 µm) $2.5\times10^{-13}$; a human cell (5 µm) $4.9\times10^{-14}$.
So small molecules sit near $10^{-9}$, proteins near $10^{-10}$–$10^{-11}$, cells near $10^{-13}$ m²/s.

**Fick's laws.** Follow many molecules at once and describe them by a concentration $c(\mathbf x,t)$ (mol/m³). More
molecules jump from crowded places to empty ones than the reverse, so there is a net **flux** down the gradient:
$$J=-D\,\frac{\partial c}{\partial x}\qquad\text{(Fick's first law)}.$$
Conservation (what flows out of a slice is lost from it) turns this into
$$\frac{\partial c}{\partial t}=D\,\nabla^2c\qquad\text{(Fick's second law)}.$$
This is exactly the **heat equation**: heat diffusing through a thermistor (A2) and a glucose cloud spreading through
a channel are the same mathematics, with temperature replaced by concentration. Its basic solution, a puff released at
a point, is a Gaussian $c\propto e^{-x^2/4Dt}/\sqrt{4\pi Dt}$ whose width grows as $\sqrt{2Dt}$.

**The Péclet number: carried or spread?** In a channel, molecules are *carried* along by the flow at speed $U$ and
*spread* across it by diffusion. Across a channel of width $w$, diffusion needs a time $t_D\sim w^2/D$. In that time
the flow carries them a distance $Ut_D=Uw^2/D$. The ratio of these effects is the **Péclet number**
$$\mathrm{Pe}=\frac{Uw}{D}=\frac{\text{transport by flow}}{\text{transport by diffusion}},$$
and the **mixing length** is about $L_{\text{mix}}\sim\mathrm{Pe}\cdot w$: Pe channel widths. It is built just
like the Reynolds number (C1), with $D$ in place of $\nu$. But in water $D$ is about 1000 times smaller than
$\nu=10^{-6}$ m²/s, so a chip with $\mathrm{Re}=0.1$ typically has $\mathrm{Pe}=100$: flow wins over diffusion even
when viscosity wins over inertia.

**Two streams in a T-junction.** A sample (concentration 1) and a buffer (0) meet and flow side by side (C1). The
sharp step between them blurs as the molecules diffuse: after flowing a distance $x$ (time $x/U$) the blurred zone is
about $\sqrt{4Dx/U}$ wide. Once it has reached the walls, the step erodes towards a flat $c=\tfrac12$. The exact
solution (a sum of sine waves, derived below) says the stripes have faded to 10 % of their initial contrast at
$x\approx0.23\,\mathrm{Pe}\,w$. For glucose in a 100 µm channel at 1 mm/s, that is about 3.6 mm; for a protein,
several centimetres. Most chips are a few centimetres long, so **proteins don't mix by themselves**.

```viz
c3-mixing-3d
```

**Mixers fold the fluid.** Since a chip can't make turbulence, it must make the diffusion distance smaller. A
**serpentine** channel with sharp bends adds some secondary flow; the famous **staggered herringbone mixer** (Stroock
and co-workers, 2002) has chevron-shaped grooves on the floor that make the fluid corkscrew. Each cycle of grooves
stretches and folds the two streams, so the stripes of sample and buffer get thinner: roughly halved each cycle. This
is **chaotic advection**: laminar flow that still stretches material exponentially. After $n$ cycles the stripes are
$\delta_n\approx w/2^n$ thick (local symbol), and diffusion across $\delta_n$ takes only $\delta_n^2/D$, which
collapses quickly. The number of cycles needed grows only as $\log_2$ of Pe: about $\tfrac12\log_2(\mathrm{Pe}\,w/\lambda_{\text{hb}})$
for a cycle length $\lambda_{\text{hb}}$. A protein that needed 20 cm in a straight channel mixes in about 1 mm.

**The H-filter: separating by diffusion.** Run blood (or a dirty water sample) beside a clean buffer stream for a few
seconds, then split the channel again into two outlets, like an "H". Small molecules diffuse across into the buffer in
the time available; big particles, cells and bacteria barely move. The buffer outlet now carries the small molecules,
cleaned of cells, with no membrane to clog. Separation without a filter.

**Taylor dispersion.** In pressure-driven flow the centre moves twice as fast as the mean (C2) and the walls not at
all, so a short plug of sample is smeared into a long streak. Diffusion across the channel partly rescues it: molecules
keep sampling fast and slow lanes, so the plug spreads like a diffusion with an **effective** coefficient
$D_{\text{eff}}=D\,(1+\mathrm{Pe}_r^2/48)$ in a tube of radius $r_0$, with $\mathrm{Pe}_r=\bar u r_0/D$. This can be
hundreds to thousands of times larger than $D$, which blurs pulses in chromatography and in chip-based assays.

**Diffusion to a sensor surface.** A biosensor (A6) consumes the molecules that reach it: a glucose electrode oxidises
glucose, an antibody spot captures a protein. Next to the surface, a **depletion layer** forms, about $\sqrt{\pi Dt}$
thick, and grows with time; the flux to the surface falls as $J=c_0\sqrt{D/(\pi t)}$ (the Cottrell law, A6). In still
liquid, the signal therefore drifts down as $1/\sqrt t$. Flow over the sensor stops the layer from growing (Pe again),
which gives a steady, larger signal. Diffusion, not chemistry, often sets how fast a sensor responds.

## Intuitive examples

1. **Diffusion is fast, then slow.** Glucose ($D=6.5\times10^{-10}$ m²/s) diffuses 1 µm in 0.8 ms, 10 µm in 77 ms,
   100 µm in 7.7 s, 1 mm in 13 min (774 s) and 1 cm in 21.5 h, from $t=x^2/(2D)$. The tea in the glass (1 cm,
   $D\approx10^{-9}$ m²/s) needs about 14 h.
2. **Big molecules are slow.** Albumin ($7.0\times10^{-11}$ m²/s) needs 71 s for 100 µm and 2 h for 1 mm. A bacterium
   ($2.5\times10^{-13}$ m²/s) diffuses only 2.2 µm in 10 s, far less than its own swimming in one second.
3. **Pe in a chip.** $w=100$ µm, $U=1$ mm/s. A small molecule ($D=10^{-9}$): $\mathrm{Pe}=100$, crossing time
   $w^2/D=10$ s, mixing length $\sim\mathrm{Pe}\,w=1$ cm (exact 90 % point: 2.3 mm). A protein ($5\times10^{-11}$):
   $\mathrm{Pe}=2000$, crossing time 200 s, $\mathrm{Pe}\,w=20$ cm (90 % point: 4.7 cm).
4. **Herringbone.** The protein case with grooves of cycle length $\lambda_{\text{hb}}=200$ µm: diffusion can finish
   stripes of $\sqrt{D\lambda_{\text{hb}}/U}=3.2$ µm in one cycle, so it needs $\log_2(100/3.16)=5.0$ halvings: 5 cycles,
   1.0 mm, 200 times shorter than 20 cm. For Pe from $10^2$ to $10^5$ the cycles needed only grow from 2.8 to 7.8.
5. **H-filter.** In 10 s beside a buffer, glucose spreads $\sqrt{2Dt}=114$ µm (across the channel), albumin 37 µm,
   bacteria 2.2 µm: the far outlet gets small molecules and almost no cells.
6. **Taylor smear.** In a tube of radius 50 µm at 1 mm/s, glucose has $\mathrm{Pe}_r=77$ and a plug spreads as if
   $D_{\text{eff}}=126\,D$; albumin, $\mathrm{Pe}_r=713$, spreads as if $D_{\text{eff}}\approx10^4D$.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $\langle x^2\rangle=2Dt$ (1D), $4Dt$ (2D), $6Dt$ (3D) | mean square displacement of a random walk | $D$ diffusion coefficient (m²/s), $t$ time |
| $D=\dfrac{\delta^2}{2\tau_s}$ | from step length and step time | $\delta$, $\tau_s$ local |
| $D=\dfrac{k_BT}{6\pi\mu r}$ | Stokes–Einstein | $r$ particle radius, $\mu$ viscosity, $k_BT$ thermal energy |
| $J=-D\,\dfrac{\partial c}{\partial x}$ | Fick's first law: flux down the gradient | $c$ concentration, $J$ in mol/(m²·s) |
| $\dfrac{\partial c}{\partial t}=D\,\nabla^2c$ | Fick's second law (heat equation) | |
| $c(x,t)=\dfrac{1}{\sqrt{4\pi Dt}}\,e^{-x^2/4Dt}$ | spreading puff (per unit amount) | width $\sqrt{2Dt}$ |
| $\mathrm{Pe}=\dfrac{Uw}{D}$, $\ t_D\sim\dfrac{w^2}{D}$, $\ L_{\text{mix}}\sim\mathrm{Pe}\,w$ | flow vs. diffusion; mixing time and length | $U$ mean speed, $w$ channel width |
| $L_{90}=\dfrac{\ln10}{\pi^2}\,\mathrm{Pe}\,w\approx0.23\,\mathrm{Pe}\,w$ | 90 % mixed, two streams, plug flow | exact series below |
| $n\approx\log_2\dfrac{w}{\sqrt{D\lambda_{\text{hb}}/U}}=\tfrac12\log_2\dfrac{\mathrm{Pe}\,w}{\lambda_{\text{hb}}}$ | cycles of a folding mixer | $\lambda_{\text{hb}}$ cycle length (local) |
| $D_{\text{eff}}=D\Big(1+\dfrac{\mathrm{Pe}_r^2}{48}\Big)$ | Taylor dispersion in a tube | $\mathrm{Pe}_r=\bar ur_0/D$ |
| $J=c_0\sqrt{\dfrac{D}{\pi t}}$, depletion $\sqrt{\pi Dt}$ | flux to a consuming sensor in still liquid | $c_0$ bulk concentration |

## Applications

| World | Diffusion, mixing and Péclet | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | CO₂ diffusing into leaves through stomata; nutrients diffusing to roots; nitrate electrodes in soil water | a leaf's last 100 µm to the chloroplasts is pure diffusion; a soil nitrate sensor responds in seconds to minutes because ions must diffuse through its membrane |
| 🧬 Biology & human health | oxygen from capillaries to cells (no cell is more than ~100 µm from one); glucose strips; H-filters for blood plasma | tissue beyond ~200 µm starves (diffusion time ∝ distance²); a test strip waits a few seconds for glucose to diffuse to the electrode |
| 🌍 Environment | water-quality chips mixing a sample with a colour reagent; pollutant plumes in still air or groundwater | a mixer turns a centimetre-long reaction zone into a millimetre; still-air diffusion is slow, so wind (Pe ≫ 1) carries pollution far |
| 🤖 Robotics & drones | gas sensors on drones sampling plumes; "electronic noses" with a diffusion barrier | the sensor's response time is set by diffusion through its membrane, $t\sim L^2/D$; moving air (high Pe) speeds it up |
| 🚗 Cars | the λ (oxygen) sensor's diffusion barrier; fuel–air mixing; catalytic converter channels | a limiting-current λ-sensor *uses* a diffusion barrier so its current is proportional to oxygen concentration |
| 📱 Phones & photography | humidity and gas sensors behind a tiny vent; Brownian motion of particles seen in phone-microscope videos | the vent's diffusion time sets how quickly the phone's humidity reading follows a change; tracking particles gives $D$ and so their size |
| 🏠 Home & household | tea, coffee, sugar in a cup; CO detectors and smoke detectors; air fresheners | stir to replace slow diffusion by fast advection; a CO detector's electrochemical cell has a diffusion-limited, linear response |

## Derivation

**(a) Random walk to $\langle x^2\rangle=2Dt$.**
1. Steps $s_i=\pm\delta$, independent, equally likely: $\langle s_i\rangle=0$, $\langle s_i^2\rangle=\delta^2$, $\langle s_is_j\rangle=0$ for $i\ne j$.
2. Position after $N$ steps: $x_N=\sum_{i=1}^N s_i$, so $\langle x_N\rangle=0$.
3. Square and average: $\langle x_N^2\rangle=\sum_i\langle s_i^2\rangle+\sum_{i\ne j}\langle s_is_j\rangle=N\delta^2$.
4. With $N=t/\tau_s$: $\langle x^2\rangle=(\delta^2/\tau_s)\,t\equiv2Dt$, defining $D=\delta^2/(2\tau_s)$.
5. In 3D each axis walks independently: $\langle r^2\rangle=\langle x^2\rangle+\langle y^2\rangle+\langle z^2\rangle=6Dt$.

**(b) Fick's laws from the walk.**
1. Between two neighbouring slices at $x$ and $x+\delta$, half the molecules in each jump towards the other every $\tau_s$.
2. Net number crossing per area per time: $J=\dfrac{\delta}{2\tau_s}\big(c(x)-c(x+\delta)\big)\approx-\dfrac{\delta^2}{2\tau_s}\dfrac{\partial c}{\partial x}=-D\dfrac{\partial c}{\partial x}$.
3. Conservation in a slice of thickness $dx$: $\dfrac{\partial c}{\partial t}dx=J(x)-J(x+dx)$, so $\dfrac{\partial c}{\partial t}=-\dfrac{\partial J}{\partial x}=D\dfrac{\partial^2c}{\partial x^2}$.
4. Check the Gaussian: $c=(4\pi Dt)^{-1/2}e^{-x^2/4Dt}$ satisfies it, and its variance is $\int x^2c\,dx=2Dt$, matching (a).

**(c) Stokes–Einstein (sketch).**
1. A particle pulled by a force $F$ through a liquid drifts at $v=F/(6\pi\mu r)$: its mobility is $1/(6\pi\mu r)$.
2. In a force field, molecules pile up with the Boltzmann distribution $c\propto e^{-\text{energy}/k_BT}$; then the drift flux $c\,F/(6\pi\mu r)$ and the diffusion flux $-D\,dc/dx=D\,cF/(k_BT)$ must cancel.
3. That requires $D=k_BT/(6\pi\mu r)$.

**(d) Two streams in a channel (plug flow).**
1. Steady state, flow $U$ along $x$, walls at $y=\pm w/2$ with no flux, and diffusion along $x$ negligible ($\mathrm{Pe}\gg1$): $U\,\partial c/\partial x=D\,\partial^2c/\partial y^2$.
2. This is the 1D heat equation with "time" $x/U$. Initial step: $c=1$ for $y>0$, $0$ for $y<0$.
3. Expand in modes that satisfy the walls: $c=\tfrac12+\dfrac{2}{\pi}\displaystyle\sum_{m\text{ odd}}\frac{1}{m}\sin\frac{m\pi y}{w}\,e^{-m^2\pi^2x/(\mathrm{Pe}\,w)}$.
4. The slowest mode ($m=1$) decays by 10× when $\pi^2x/(\mathrm{Pe}\,w)=\ln10$: $L_{90}=(\ln10/\pi^2)\,\mathrm{Pe}\,w\approx0.23\,\mathrm{Pe}\,w$.

**(e) Why folding wins.**
1. After $n$ folds the stripes are $\delta_n=w/2^n$ thick; across a stripe, diffusion takes $\delta_n^2/D$.
2. Mixing finishes when that is shorter than the time of one cycle, $\lambda_{\text{hb}}/U$: $w/2^n\le\sqrt{D\lambda_{\text{hb}}/U}$.
3. So $n=\log_2\big(w\sqrt{U/(D\lambda_{\text{hb}})}\big)=\tfrac12\log_2(\mathrm{Pe}\,w/\lambda_{\text{hb}})$, and $L_{\text{mix}}\approx n\lambda_{\text{hb}}\propto\ln\mathrm{Pe}$ instead of $\propto\mathrm{Pe}$.

**(f) Diffusion to a consuming surface.**
1. Surface at $x=0$ keeps $c=0$; bulk $c_0$ at $t=0$.
2. Solution of Fick's second law: $c=c_0\,\mathrm{erf}\big(x/\sqrt{4Dt}\big)$.
3. Flux into the surface: $J=D\,\partial c/\partial x\big|_0=c_0\sqrt{D/(\pi t)}$, falling as $1/\sqrt t$.
4. Equivalent depletion thickness $c_0/(\partial c/\partial x)_0=\sqrt{\pi Dt}$.

## Worked check

Glucose in a channel $w=200$ µm wide, mean speed $U=0.5$ mm/s, water at 25 °C.

- Stokes–Einstein: $D=\dfrac{4.116\times10^{-21}}{6\pi(0.89\times10^{-3})(0.38\times10^{-9})}=6.46\times10^{-10}$ m²/s.
- Péclet: $\mathrm{Pe}=Uw/D=(5\times10^{-4})(2\times10^{-4})/(6.46\times10^{-10})=155$.
- Crossing time $w^2/D=(2\times10^{-4})^2/6.46\times10^{-10}=62$ s; scaling estimate $L_{\text{mix}}\sim\mathrm{Pe}\,w=31$ mm.
- Exact 90 % point: $0.233\times155\times0.2$ mm $=7.2$ mm. The estimate gets the scale right; the exact
  factor $\ln10/\pi^2$ makes it about four times shorter.
- In one second a glucose molecule wanders $\sqrt{2Dt}=35.9$ µm across the channel, so the 100 µm to the far wall
  takes several seconds, consistent with the numbers above. (All from `scripts/checks/C3_check.py`, which also checks
  $\langle x^2\rangle=2Dt$ with 20 000 simulated walkers: 398 vs. 400.)

## Whiteboard plan

- **Panel 1 — the drunk walk.** A number line, a dot hopping ±1 with a coin. Write $x_N=s_1+\dots+s_N$,
  $\langle x\rangle=0$, $\langle x^2\rangle=N\delta^2$. Say: "cross terms cancel; squares add".
- **Panel 2 — √t.** A widening Gaussian at $t$, $4t$, $9t$ with widths 1, 2, 3. Box $\langle x^2\rangle=2Dt$ and
  "twice as far = four times as long". Table: 1 µm → ms, 100 µm → s, 1 cm → day.
- **Panel 3 — Stokes–Einstein.** A small fast molecule and a big slow sphere; $D=k_BT/(6\pi\mu r)$ with glucose,
  protein and cell values in a column.
- **Panel 4 — Fick.** Two slices with more dots on the left; arrow $J=-D\,\partial c/\partial x$; conservation gives
  $\partial c/\partial t=D\nabla^2c$, "the heat equation".
- **Panel 5 — the T-junction.** Yellow and blue streams side by side, a blur growing like $\sqrt x$, a flat ½ far
  downstream. Write $\mathrm{Pe}=Uw/D$ and $L_{\text{mix}}\sim\mathrm{Pe}\,w$; put numbers: glucose 1 cm, protein 20 cm.
- **Panel 6 — folding.** A rectangle cut and stacked (baker's map): 2, 4, 8, 16 stripes; "stripe width halves per
  cycle, mixing length ∝ log Pe". Beside it an H-filter with small dots crossing and big cells staying.

## Common mistakes and where the intuition breaks

- **Thinking distance grows linearly with time.** Diffusion is $\sqrt t$, not $t$. Extrapolating "10 µm in 0.1 s"
  to "1 cm in 100 s" is wrong by a factor of 1000: it takes a day.
- **Mixing up the 1D, 2D and 3D formulas.** $2Dt$ is per axis. The distance from the start in 3D is
  $\sqrt{6Dt}$. Measure particle tracks in a 2D microscope image and use $4Dt$.
- **Confusing Re and Pe.** Low Re (no turbulence) doesn't mean fast mixing: in a chip Re ≈ 0.1 but Pe ≈ 100–10 000.
  They differ by $\nu/D$ (the Schmidt number), about 1500 for glucose in water.
- **Using Stokes–Einstein for things that aren't spheres in a simple liquid.** Long DNA, elongated proteins and
  molecules in crowded cells diffuse more slowly than the formula says; ions are affected by their electric charge.
- **Assuming plug flow everywhere.** Near the top and bottom walls of a real channel the fluid is slow, so the
  interface spreads faster there (a "butterfly" shape across the height), and along the channel Taylor dispersion
  smears pulses. The simple $0.23\,\mathrm{Pe}\,w$ is a good first estimate, not the last word.
- **Where the random walk breaks.** At times shorter than about $t_{\text{coast}}$ (C1), a particle still "remembers"
  its velocity and moves ballistically; and in very crowded or porous media diffusion becomes anomalous
  ($\langle x^2\rangle\propto t^\alpha$ with $\alpha<1$).

## Remember

**"Diffusion spreads as √(2Dt), with D = k_BT/(6πμr); flow carries, diffusion spreads, and Pe = Uw/D says who wins: mixing length ~ Pe·w, unless you fold."**

## Self-test

1. How long does albumin ($D=7.0\times10^{-11}$ m²/s) take to diffuse across a 50 µm channel (use $t=x^2/2D$)?
   <details><summary>Answer</summary>t = (50e-6)² / (2 × 7.0e-11) = 2.5e-9 / 1.4e-10 ≈ 18 s.</details>
2. You double the flow speed in a straight T-junction mixer. What happens to Pe and to the mixing length? And in a herringbone mixer?
   <details><summary>Answer</summary>Pe doubles, so the straight-channel mixing length (proportional to Pe × w) doubles. In the herringbone mixer the number of cycles grows only as half of log2(Pe), so doubling Pe adds only about half a cycle: the mixing length barely changes.</details>
3. A tracked bead in water at 25 °C shows ⟨x²⟩ growing by 2 µm² every second. What is D, and how big is the bead?
   <details><summary>Answer</summary>The slope is 2D = 2 µm²/s, so D = 1 µm²/s = 1e-12 m²/s. Stokes–Einstein: r = k_BT/(6πμD) = 4.116e-21 / (6π × 0.89e-3 × 1e-12) ≈ 0.25 µm, so a bead of about 0.5 µm diameter.</details>

**Next:** [C4 Surface tension, capillarity, droplets and electrokinetics](C4-surface-tension-capillarity-droplets-and-electrokinetics.md) — now the walls and interfaces take over: capillary forces pump paper tests and pinch off droplets, and electric fields move liquids without any pressure at all.
