# C4. Surface tension, capillarity, droplets and electrokinetics

> **Connects:** builds on [B1 Scaling laws](B1-scaling-laws-why-small-is-different.md), [A3 Capacitive sensors](A3-capacitive-sensors.md), [C1 Fluids at the microscale](C1-fluids-at-the-microscale-reynolds-number-and-laminar-flow.md), [C2 Pressure-driven flow](C2-pressure-driven-flow-and-hydraulic-circuits.md), [C3 Diffusion, mixing and the Péclet number](C3-diffusion-mixing-and-the-peclet-number.md) · used by [C5 Lab-on-a-chip, organ-on-chip and integrated sensing systems](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md)

## Hook — a paper towel soaking up a spill

Knock over a glass of juice and lay a paper towel on the puddle. Nobody pumps anything, yet the liquid climbs **up** into
the towel, against gravity, in a few seconds. Water climbs inside a tomato stem the same way, through tubes far thinner than
a hair. A home pregnancy test or a COVID test strip uses the same trick: you put a drop on one end, and a coloured line
appears 2 cm away a few minutes later. There is no battery, no pump and no valve.

Turn the picture around. Rain on a lotus or cabbage leaf does not spread. It beads up into silver balls that roll off and
take the dust with them. Rain on a freshly waxed car does the same. Some phone cameras focus with a **lens made of a water
drop**: a voltage changes the drop's shape, and nothing moves mechanically.

All of these come from one fact: **a liquid surface stores energy, and in a small world the surface wins.** This note turns
that into numbers, and adds a second small-world power: pushing liquid with **electric fields** (electrokinetics).

## The idea in plain words

**Surface tension is energy per area.** A molecule inside the liquid is pulled equally on all sides; one at the surface has
neighbours on one side only and sits at higher energy. So making surface costs energy, and the cost per square metre is the
**surface tension** $\gamma$ (J/m² = N/m). Water against air: $\gamma\approx72$ mN/m; ethanol 22, soapy water 25–30, mercury
485 mN/m. Read the same number as a **force per length**: a surface pulls along any line drawn on it with 72 mN per metre.
That is why a needle can float.

**Why it matters only when things are small (B1).** Surface forces scale with a length ($\gamma\ell$), weight with a volume
($\rho g_{\text{grav}}\ell^3$). Their ratio is the **Bond number** $\mathrm{Bo}=\rho g_{\text{grav}}\ell^2/\gamma$. It equals 1
at the **capillary length** $\sqrt{\gamma/(\rho g_{\text{grav}})}=2.71$ mm for water. A 1 cm puddle has $\mathrm{Bo}=13.6$
(gravity flattens it); a 100 µm channel has $\mathrm{Bo}=0.00136$ (surface tension rules, so chips work in any orientation).

**A curved surface squeezes: Laplace pressure.** A drop is like a balloon whose skin is under tension, so the inside is at
higher pressure by
$$\Delta p=\frac{2\gamma}{r}\qquad\text{(sphere of radius } r\text{)}.$$
That is 144 Pa for a 1 mm drop and 144 kPa (1.4 atmospheres) for a 1 µm droplet. With two different radii of curvature,
$\Delta p=\gamma(1/R_1+1/R_2)$; a soap bubble has two surfaces, so $\Delta p=4\gamma/r$.

**Wetting and the contact angle.** Where the liquid surface meets a wall it makes an angle $\theta$, measured through the
liquid. Three tensions pull on the contact line: solid–vapour $\gamma_{\text{sv}}$, solid–liquid $\gamma_{\text{sl}}$ and the
liquid surface $\gamma$. Balancing them along the wall gives **Young's equation**
$$\gamma\cos\theta=\gamma_{\text{sv}}-\gamma_{\text{sl}}.$$
If the solid "likes" water, $\cos\theta>0$ and $\theta<90^\circ$: **hydrophilic**, like clean glass ($0$–$20^\circ$), paper
or xylem walls. Otherwise $\theta>90^\circ$: **hydrophobic**, like PDMS, the silicone rubber most research chips are moulded
from (B2, $\theta\approx110^\circ$). The **lotus leaf** is waxy *and* covered in micro-bumps, so a drop touches solid over only
about 10% of its footprint and rests on air elsewhere. The Cassie–Baxter rule $\cos\theta^*=f(\cos\theta+1)-1$ with solid
fraction $f=0.1$ gives $\theta^*=159^\circ$: **superhydrophobic**, and drops roll off at the slightest tilt.

**Capillary rise: the meniscus pulls the column up.** In a glass tube of inner radius $r$, the surface pulls along the wall
all around the rim; the vertical part is $2\pi r\,\gamma\cos\theta$. The column rises until its weight
$\rho g_{\text{grav}}\pi r^2h$ balances that pull, which is **Jurin's law**
$$h=\frac{2\gamma\cos\theta}{\rho\,g_{\text{grav}}\,r}.$$
Halve the radius and the column climbs twice as high: 29.4 mm in a 0.5 mm tube, 147 mm in a 0.1 mm tube, 0.73 m in a 20 µm
xylem vessel. On a hydrophobic wall $\cos\theta<0$ and the "rise" is negative: a 0.5 mm PDMS tube pushes the level **down**
10 mm. In pressure language, the meniscus makes a suction $2\gamma\cos\theta/r$ that holds up $\rho g_{\text{grav}}h$.

```viz
c4-capillary-3d
```

**Trees are not capillary tubes, but capillarity still saves them.** To lift water 100 m by rise alone, the tube would need
$r=0.147$ µm. Instead the leaf **pulls**: water evaporates from menisci in cell-wall pores about 5 nm across, which can hold a
suction of $2\gamma/r=28.8$ MPa, far more than the 0.98 MPa needed to hang a 100 m column (the cohesion–tension theory). The
sap-flow sensors of the story (A2) measure how fast that stretched column moves.

**Wicking in paper: Washburn's law.** In a paper strip the pull is the Laplace suction $2\gamma\cos\theta/r$ of pores of
effective radius $r$. The resistance grows with the wetted length $L$, because the liquid already inside must be dragged
along (Poiseuille, C2). Constant pull, growing resistance, so the front slows down:
$$L^2=\frac{\gamma\,r\cos\theta}{2\mu}\,t.$$
For $r=0.5$ µm, $\gamma r\cos\theta/(2\mu)=1.8\times10^{-5}$ m²/s: 1 cm in 5.6 s, 4 cm in 88.9 s (4× as far takes 16× as
long). A lateral-flow test runs on this clock: the sample wicks past gold-labelled antibodies, a test line, a control line and
into an absorbent pad, with no pump.

**Viscosity against surface tension: the capillary number** $\mathrm{Ca}=\mu U/\gamma$ compares the viscous stress that
stretches a moving interface with the tension that keeps it round. Water at 1 mm/s has $\mathrm{Ca}=1.4\times10^{-5}$
(stiff, round interfaces); oil with surfactant at a few mm/s has $\mathrm{Ca}\sim10^{-3}$–$10^{-2}$, the range for droplets.

**Droplets on demand: the T-junction.** Oil (the *continuous* phase, flow $Q_{\text{c}}$) runs along a main channel of width
$w$; water (the *dispersed* phase, $Q_{\text{d}}$) enters from a side channel. The water tip grows until it nearly blocks
the channel, then the oil behind it squeezes the neck until a droplet pinches off. In the **squeezing regime**
($\mathrm{Ca}\lesssim0.01$) the length depends only on the flow ratio:
$$\frac{L_{\text{drop}}}{w}\approx1+\alpha\,\frac{Q_{\text{d}}}{Q_{\text{c}}},\qquad\alpha\approx1.$$
Viscosity and $\gamma$ drop out! At higher $\mathrm{Ca}$ (dripping) shear tears droplets off earlier and they shrink. In
**digital PCR**, a sample is split into about 20,000 such droplets, each holding zero or a few DNA copies. After amplification
(C5) each is simply bright or dark, and Poisson statistics turns the bright fraction into an absolute count.

```viz
c4-droplets-3d
```

**Electrowetting: turning the contact angle with a voltage (A3).** Put a drop on an insulating film (thickness
$t_{\text{d}}$, permittivity $\varepsilon_0\varepsilon_r$) over an electrode and apply $V$. Drop and electrode form a
capacitor (A3) whose energy per area, $\varepsilon_0\varepsilon_rV^2/(2t_{\text{d}})$, lowers the solid–liquid tension. That
gives the **Young–Lippmann** equation
$$\cos\theta(V)=\cos\theta_0+\frac{\varepsilon_0\varepsilon_rV^2}{2\gamma\,t_{\text{d}}}.$$
With a 1 µm film of $\varepsilon_r=3$ and $\theta_0=120^\circ$: 30 V gives $109.5^\circ$, 60 V gives $80.6^\circ$. A **liquid
lens** changes the curvature of a water/oil interface this way, refocusing in milliseconds with no motor. **Digital
microfluidics** switches a grid of electrodes so drops are pulled from pad to pad, merged, split and mixed.

**Electrokinetics: walls are charged, and that charge can pump.** Glass in water is negatively charged (surface silanol
groups give up protons). Positive ions crowd near the wall in a thin cloud, the **electric double layer**, whose thickness is
the **Debye length**:
$$\lambda_D=\sqrt{\frac{\varepsilon_0\varepsilon_rk_BT}{2N_Aq_e^2c}}\;\approx\;\frac{0.304\ \text{nm}}{\sqrt{c\ [\text{mol/L}]}}\quad\text{(1:1 salt, 25 °C)},$$
with $N_A$ Avogadro's number, $q_e$ the elementary charge and $c$ the salt concentration. Salt shrinks the layer: 0.79 nm in
saline or blood (150 mM), 9.6 nm in 1 mM buffer, about 300 nm in deionised water that has absorbed a little CO₂ (≈1 µM
ions), about 960 nm in ideally pure water (10⁻⁷ M). The potential where the liquid starts to slide is the **zeta potential**
$\zeta$, typically −20 to −80 mV for glass.

**Electro-osmotic flow: the skin drags the whole liquid.** A field $\mathcal E$ along the channel pushes the positive cloud,
and the cloud drags the liquid by viscosity. Outside the layer there is no net charge and no force, so everything slides at
one speed:
$$u_{\text{eo}}=-\frac{\varepsilon_0\varepsilon_r\zeta\,\mathcal E}{\mu}.$$
For $\zeta=-50$ mV and 100 V/cm, $u_{\text{eo}}=0.35$ mm/s toward the negative electrode. The point is the **shape**.
Pressure flow (C2) is a parabola, so a dye band is stretched into an arrowhead and smeared (Taylor dispersion, C3).
Electro-osmotic flow is a **plug**, flat except within a few $\lambda_D$ of the wall, so a band stays sharp. And
$u_{\text{eo}}$ does not depend on channel size, while pressure flow needs huge pressures in narrow channels
($R_{\text{hyd}}\propto1/h^4$ for a tube, C2).

```viz
c4-eof
```

**Electrophoresis and dielectrophoresis: moving the molecules, not the liquid.** A charged particle drifts at
$u=\mu_{\text{ep}}\mathcal E$ ($\mu_{\text{ep}}$ = electrophoretic mobility). DNA has a fixed charge per length, so in free
solution all lengths move alike; a **gel** is a molecular sieve that slows long strands more, so DNA spreads into bands by
size. **Capillary electrophoresis** runs in a 50 µm capillary at tens of kV, because the thin tube sheds Joule heat (B1).
Electro-osmosis carries everything to the detector, and each species' own mobility sets its arrival time. An *uncharged*
cell in a **non-uniform** field is polarised and pulled toward or away from strong field (**dielectrophoresis**, force
$\propto r^3\,\nabla\lvert\mathcal E\rvert^2$), which sorts live from dead cells on electrode arrays.

## Intuitive examples

1. **The Laplace pressure of small drops.** Water with $\gamma=72$ mN/m gives $2\gamma/r=144$ Pa for $r=1$ mm,
   14.4 kPa for $r=10$ µm and 144 kPa for $r=1$ µm. A 1 cm soap bubble ($\gamma=25$ mN/m, two surfaces) needs only
   $4\gamma/r=10$ Pa. Small things are stiff.
2. **Capillary rise in glass, PDMS and xylem.** In glass ($\theta=0$), $h=29.4$ mm for $r=0.5$ mm and 146.8 mm for
   $r=0.1$ mm. In a 20 µm xylem vessel, $h=0.734$ m. In PDMS ($\theta=110^\circ$), $r=0.5$ mm gives $h=-10.0$ mm, a
   depression. The widget's tubes ($r=0.4$, 0.8, 1.6 mm) give 36.7, 18.3 and 9.2 mm for water. Mercury in a 0.4 mm glass tube
   gives −14.0 mm, and ethanol gives 14.2 mm.
3. **A lateral-flow test.** Effective pore radius 0.5 µm and water: $L^2=(1.8\times10^{-5}\ \text{m}^2/\text{s})\,t$. The
   front reaches 1 cm in 5.6 s and 4 cm in 88.9 s, where it is slowing to 0.225 mm/s. Whole blood ($\mu\approx3.5$ mPa·s) needs
   311 s for the same 4 cm. That is why such tests ask you to wait about 5–15 minutes.
4. **Making droplets for digital PCR.** Main channel 100 µm × 50 µm, oil at $Q_{\text{c}}=2$ µL/min (mean speed 6.67 mm/s,
   $\mu=5$ mPa·s, $\gamma=5$ mN/m with surfactant, so $\mathrm{Ca}=6.7\times10^{-3}$: squeezing), and water at
   $Q_{\text{d}}=1$ µL/min. Then $L_{\text{drop}}=150$ µm and $V=whL_{\text{drop}}=0.75$ nL, about the volume of a 113 µm
   sphere. The droplets come out at $f=Q_{\text{d}}/V=22.2$ Hz, spaced 450 µm apart. If 6,000 of 20,000 droplets light up
   ($p=0.30$), the mean number of copies per droplet is $\bar n=-\ln(1-p)=0.357$, so the sample holds 476 copies/µL. Counting
   only the bright droplets would say 400/µL, because some droplets contain two or more copies.
5. **Electrowetting a lens.** 1 µm insulator with $\varepsilon_r=3$, $\theta_0=120^\circ$: $\cos\theta$ goes from −0.500 at 0 V
   to −0.334 at 30 V ($109.5^\circ$) and +0.164 at 60 V ($80.6^\circ$). The angle goes from beading to wetting with no moving
   parts.
6. **Debye length and electro-osmosis.** $\lambda_D=0.79$ nm (150 mM), 9.62 nm (1 mM), 304 nm (1 µM). With $\zeta=-50$ mV at
   100 V/cm, $u_{\text{eo}}=0.348$ mm/s (mobility $3.48\times10^{-8}$ m²/(V·s)). In a 50 cm capillary at 25 kV, anions with
   $\mu_{\text{ep}}=-2.0$ and $-2.2\times10^{-8}$ m²/(V·s) travel at 0.738 and 0.638 mm/s and arrive at 678 s and 784 s.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $\Delta p=\dfrac{2\gamma}{r}$; in general $\gamma\left(\dfrac1{R_1}+\dfrac1{R_2}\right)$ | Laplace pressure: curved surfaces squeeze | $\gamma$ surface tension (water 72 mN/m), $r$ radius |
| $\gamma\cos\theta=\gamma_{\text{sv}}-\gamma_{\text{sl}}$ | Young: the contact angle is a tug of war at the contact line | $\theta$ contact angle; $\theta<90^\circ$ hydrophilic |
| $h=\dfrac{2\gamma\cos\theta}{\rho g_{\text{grav}}r}$ | Jurin: capillary rise (negative on hydrophobic walls) | $\rho$ density, $g_{\text{grav}}$ gravity |
| $L^2=\dfrac{\gamma r\cos\theta}{2\mu}\,t$ | Washburn: wicking slows as $\sqrt t$ | $\mu$ viscosity, $r$ pore radius, $L$ wetted length |
| $\mathrm{Bo}=\dfrac{\rho g_{\text{grav}}\ell^2}{\gamma}$, $\mathrm{Ca}=\dfrac{\mu U}{\gamma}$ | gravity vs surface tension; viscous drag vs surface tension | $\ell$ size, $U$ speed |
| $\dfrac{L_{\text{drop}}}{w}\approx1+\alpha\dfrac{Q_{\text{d}}}{Q_{\text{c}}}$ | T-junction droplet length (squeezing, $\mathrm{Ca}\lesssim0.01$) | $w$ channel width, $\alpha\approx1$ |
| $\cos\theta(V)=\cos\theta_0+\dfrac{\varepsilon_0\varepsilon_rV^2}{2\gamma t_{\text{d}}}$ | electrowetting (Young–Lippmann) | $t_{\text{d}}$ insulator thickness |
| $\lambda_D=\sqrt{\dfrac{\varepsilon_0\varepsilon_rk_BT}{2N_Aq_e^2c}}\approx\dfrac{0.304\text{ nm}}{\sqrt{c\,[\text{M}]}}$ | Debye length: thickness of the ion cloud | $c$ salt concentration |
| $u_{\text{eo}}=-\dfrac{\varepsilon_0\varepsilon_r\zeta\mathcal E}{\mu}$ | electro-osmotic plug flow | $\zeta$ zeta potential, $\mathcal E$ field |
| $u=\mu_{\text{ep}}\mathcal E$ | electrophoretic drift of a charged particle | $\mu_{\text{ep}}$ mobility |

## Applications

| World | Surface tension and electrokinetics | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | xylem capillarity plus 5 nm cell-wall menisci holding transpiration tension; waxy, bumpy leaves; soil pores holding water by Laplace suction | why a stem stays full and a tall tree can drink; why dew beads on cabbage |
| 🧬 Biology & human health | lateral-flow pregnancy and COVID tests (Washburn); digital PCR droplets; DNA gels; lung surfactant lowering $\gamma$ in tiny alveoli | test timing; absolute DNA counts; why premature babies need surfactant |
| 🌍 Environment | paper water tests (nitrate, E. coli); droplet PCR for viruses in wastewater; capillary electrophoresis of river ions | cheap tests with no pump; separating nitrate from chloride by mobility |
| 🤖 Robotics & drones | superhydrophobic coatings on drone cameras; capillary grippers for millimetre parts; digital-microfluidic droplet "robots" | lenses that shed rain; gentle grip with no clamp |
| 🚗 Cars | hydrophobic windscreen coatings ($\theta>100^\circ$); fuel-injector sprays; hydrophobic vent membranes on headlamps | drops blow off at speed; fine droplets burn cleanly |
| 📱 Phones & photography | electrowetting liquid-lens autofocus; oleophobic screen coatings; hydrophobic speaker meshes holding water back by Laplace pressure | focus in milliseconds with no motor; how a phone survives a splash |
| 🏠 Home & household | paper towels and sponges (Washburn); candle wicks; non-stick pans ($\theta\approx110^\circ$); detergent lowering $\gamma$ to about 30 mN/m | why the towel is fast at first, then slow; why soap gets into fabric |

## Derivation

**(a) Surface tension as energy and as force.**
1. Making area $dA$ costs energy $dW=\gamma\,dA$, so $\gamma$ is in J/m².
2. Stretch a soap film of width $w$ by $dx$: two surfaces gain $dA=2w\,dx$.
3. Work $F\,dx=\gamma\,2w\,dx$, so $F=2\gamma w$: $\gamma$ is also a force per length (N/m).

**(b) Laplace pressure of a sphere.**
1. Grow the drop from $r$ to $r+dr$: the pressure difference does work $\Delta p\,dV=\Delta p\,4\pi r^2dr$.
2. The surface energy rises by $\gamma\,dA=\gamma\,8\pi r\,dr$.
3. At equilibrium they are equal: $\Delta p\,4\pi r^2=8\pi\gamma r$, so $\Delta p=2\gamma/r$.

**(c) Young's equation.** Along the wall at the contact line, $\gamma_{\text{sv}}$ pulls outward and $\gamma_{\text{sl}}+\gamma\cos\theta$ pulls inward; balance gives $\gamma\cos\theta=\gamma_{\text{sv}}-\gamma_{\text{sl}}$.

**(d) Jurin's law (capillary rise).**
1. Upward pull around the rim: $F_\gamma=2\pi r\,\gamma\cos\theta$.
2. Weight of the raised column: $W=\rho g_{\text{grav}}\,\pi r^2h$ (ignoring the small meniscus volume).
3. Set them equal: $h=2\gamma\cos\theta/(\rho g_{\text{grav}}r)$.
4. Pressure version: under a meniscus of radius $r/\cos\theta$, $p=p_{\text{atm}}-2\gamma\cos\theta/r$, and hydrostatics adds back $\rho g_{\text{grav}}h$ at the bath level. Same result.

**(e) Washburn's law.**
1. Mean speed in a pore of radius $r$ (Poiseuille, C2): $dL/dt=r^2\Delta p/(8\mu L)$.
2. The driving pressure is the Laplace suction $\Delta p=2\gamma\cos\theta/r$.
3. So $L\,dL/dt=\gamma r\cos\theta/(4\mu)$.
4. Integrate from $L=0$ at $t=0$: $L^2/2=\gamma r\cos\theta\,t/(4\mu)$, so $L^2=\gamma r\cos\theta\,t/(2\mu)$.

**(f) T-junction, squeezing regime.**
1. The water tip grows until it fills the channel width $w$: length about $w$.
2. Oil can then only leak past through the corners, so it squeezes the neck at a speed set by $Q_{\text{c}}$; pinching takes a time $t_{\text{p}}\approx\alpha\,w\cdot wh/Q_{\text{c}}$.
3. Meanwhile water keeps flowing in, adding length $Q_{\text{d}}t_{\text{p}}/(wh)=\alpha wQ_{\text{d}}/Q_{\text{c}}$.
4. Total: $L_{\text{drop}}=w(1+\alpha Q_{\text{d}}/Q_{\text{c}})$. Frequency $f=Q_{\text{d}}/V$ with $V\approx whL_{\text{drop}}$.

**(g) Electrowetting.**
1. The insulator is a capacitor with $C/A=\varepsilon_0\varepsilon_r/t_{\text{d}}$ (A3).
2. At fixed voltage, charging it lowers the free energy per wetted area by $\tfrac12(C/A)V^2$, so $\gamma_{\text{sl}}\to\gamma_{\text{sl}}-\varepsilon_0\varepsilon_rV^2/(2t_{\text{d}})$.
3. Put this into Young: $\cos\theta(V)=\cos\theta_0+\varepsilon_0\varepsilon_rV^2/(2\gamma t_{\text{d}})$.

**(h) Debye length.**
1. Poisson: $\varepsilon_0\varepsilon_r\,\phi''=-\rho_q$, where $\phi(y)$ is the potential at distance $y$ from the wall and $\rho_q$ the charge density.
2. Boltzmann: ions of charge $\pm q_e$ have densities $N_Ac\,e^{\mp q_e\phi/k_BT}$, so $\rho_q=-2N_Acq_e\sinh(q_e\phi/k_BT)$.
3. Linearise for small $\phi$ (Taylor): $\rho_q\approx-2N_Acq_e^2\phi/k_BT$.
4. Then $\phi''=\phi/\lambda_D^2$ with $\lambda_D^2=\varepsilon_0\varepsilon_rk_BT/(2N_Aq_e^2c)$, so $\phi=\zeta\,e^{-y/\lambda_D}$.

**(i) Electro-osmotic velocity.**
1. Stokes flow with an electric body force (no pressure gradient): $\mu u''+\rho_q\mathcal E=0$.
2. Replace $\rho_q$ using Poisson: $\mu u''=\varepsilon_0\varepsilon_r\mathcal E\,\phi''$.
3. Integrate twice with $u(0)=0$, $\phi(0)=\zeta$, and $u',\phi'\to0$ far away: $u(y)=\dfrac{\varepsilon_0\varepsilon_r\mathcal E}{\mu}\big(\phi(y)-\zeta\big)$.
4. Outside the layer $\phi\to0$: $u_{\text{eo}}=-\varepsilon_0\varepsilon_r\zeta\mathcal E/\mu$, the same everywhere, which is a plug.

## Worked check

**Force balance in a 0.5 mm glass tube** ($\gamma=0.072$ N/m, $\theta=0$, $\rho=1000$ kg/m³):
- Jurin: $h=2(0.072)/(1000\cdot9.81\cdot0.0005)=0.02936$ m $=29.36$ mm.
- Pull: $F_\gamma=2\pi(0.0005)(0.072)=2.262\times10^{-4}$ N $=226.2$ µN.
- Weight: $\rho g_{\text{grav}}\pi r^2h=1000\cdot9.81\cdot\pi(0.0005)^2(0.02936)=226.2$ µN ✓. That is a 23.1 mg column of water.
- Pressure view: $2\gamma/r=288$ Pa of suction under the meniscus, and $\rho g_{\text{grav}}h=288$ Pa ✓.

**Washburn clock:** with $k=\gamma r\cos\theta/(2\mu)=0.072\cdot0.5\times10^{-6}/(2\times10^{-3})=1.8\times10^{-5}$ m²/s,
4 cm takes $0.04^2/k=88.9$ s and 2 cm takes 22.2 s, which is 4× shorter for half the distance ✓.

**Electro-osmosis:** $\varepsilon_0\varepsilon_r=8.854\times10^{-12}\cdot78.5=6.95\times10^{-10}$ F/m;
$u_{\text{eo}}=6.95\times10^{-10}\cdot0.050\cdot10^4/10^{-3}=3.48\times10^{-4}$ m/s $=0.348$ mm/s ✓ (all checked by
`scripts/checks/C4_check.py`).

## Whiteboard plan

- **Panel 1: the surface molecule.** Draw a beaker with one molecule deep inside (arrows in all directions) and one at the
  surface (arrows only down and sideways). Write "$\gamma$ = energy per area = force per length; water 72 mN/m". Then draw
  $\mathrm{Bo}=\rho g\ell^2/\gamma$ and mark 2.7 mm: "below this, surface wins".
- **Panel 2: Laplace.** A drop with arrows pushing in; write $2\gamma/r$ and the table 1 mm → 144 Pa, 1 µm → 144 kPa.
- **Panel 3: contact angle.** Three drops on a line: glass (flat), PDMS (bead, $110^\circ$), lotus (ball on bumps,
  $159^\circ$). Draw the Young tug-of-war arrows at one contact line.
- **Panel 4: three tubes.** Thin, medium and thick tubes in a tray with columns at $h$, $h/2$ and $h/4$, purple arrows up at
  the rim, and a weight arrow down. Box $h=2\gamma\cos\theta/(\rho g r)$. Then a PDMS tube with the level below. Say: "the
  sign of $\cos\theta$ decides up or down."
- **Panel 5: the paper strip and the droplet maker.** A strip with the front at $\sqrt t$ marks (1 cm, 2 cm and 4 cm at 5.6,
  22 and 89 s), then a T-junction with plugs of length $w(1+Q_{\text{d}}/Q_{\text{c}})$.
- **Panel 6: the charged wall.** Minus signs on the wall, a cloud of plus signs of thickness $\lambda_D$, then a flat
  velocity profile (EOF) next to a parabola (pressure). Write $u_{\text{eo}}=-\varepsilon_0\varepsilon_r\zeta\mathcal E/\mu$
  and "plug = sharp bands".

## Common mistakes and where the intuition breaks

- **Radius vs diameter.** Jurin and Laplace use the *radius*. Putting in the diameter halves the answer.
- **Forgetting the sign of $\cos\theta$.** Above $90^\circ$ the meniscus bulges up and the liquid is pushed *down*. PDMS
  channels do not fill by themselves unless they are plasma-treated to make them hydrophilic, and that treatment fades over
  hours (B2).
- **"Wicking speed is constant."** It is not: $L\propto\sqrt t$, so a strip twice as long takes four times as long.
- **Contact angles are not single numbers.** Real surfaces show **hysteresis** (advancing angle > receding angle), and a
  contact line can stay **pinned** on a scratch. That is why drops cling to a tilted window, and why hydrophobic "stop
  valves" in chips work (C5).
- **The Debye layer is "just a few ions".** In saline it is under 1 nm thick, so a charge-sensing biosensor (a FET, A6) is
  blind beyond a nanometre: a target bound on a 10 nm antibody is **screened**.
- **Electro-osmosis has limits.** It needs $\lambda_D\ll$ channel size, a stable $\zeta$ (which changes with pH and with
  proteins sticking to the wall), and modest fields, because Joule heating warms the liquid. Uneven $\zeta$ along a channel
  brings back pressure gradients and curves the plug.
- **The squeezing law is for $\mathrm{Ca}\lesssim0.01$.** At higher $\mathrm{Ca}$ or in very viscous oil the droplet is torn off
  earlier and is smaller than $1+Q_{\text{d}}/Q_{\text{c}}$ predicts.

## Remember

**"Surface energy scales like $\ell^2$ and weight like $\ell^3$: below 2.7 mm, $2\gamma/r$ and $\cos\theta$ run the show, and a
charged wall turns a voltage into a flat plug of flow."**

## Self-test

1. A paper test takes 60 s to wick 3 cm. How long to wick 6 cm, and what happens if the sample is three times as viscous?
   <details><summary>Answer</summary>L squared is proportional to t, so double the distance takes 4 times as long: 240 s. Washburn has mu in the denominator, so a 3x viscous sample is 3x slower: 180 s for 3 cm.</details>
2. Water in a hydrophilic glass tube of radius 0.2 mm rises how high? What if the tube is PDMS with a contact angle of 110 degrees?
   <details><summary>Answer</summary>h = 2(0.072)/(1000 x 9.81 x 0.0002) = 73.4 mm in glass. In PDMS cos(110) = -0.342, so h = -25.1 mm: the level inside sits 25 mm below the outside.</details>
3. A biosensor works in blood (150 mM salt). Why can it barely sense the charge of a protein bound 10 nm above its surface, and how would diluting the sample 100x help?
   <details><summary>Answer</summary>The Debye length at 150 mM is about 0.8 nm, so charges further away are screened by the ion cloud. Diluting 100x gives 1.5 mM and a Debye length of 0.304/sqrt(0.0015) = 7.9 nm, so the charge becomes partly visible again, at the price of 100x fewer target molecules.</details>

**Next:** [C5 Lab-on-a-chip, organ-on-chip and integrated sensing systems](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md) — with pumps made of paper, valves made of contact angles and droplets made by a T-junction, we can finally build a whole lab on a stamp-sized chip.
