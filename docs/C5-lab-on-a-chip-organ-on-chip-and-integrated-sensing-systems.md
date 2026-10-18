# C5. Lab-on-a-chip, organ-on-chip and integrated sensing systems

> **Connects:** builds on [A1 What a sensor is](A1-what-a-sensor-is-transduction-and-the-measurement-chain.md), [A3 Capacitive sensors](A3-capacitive-sensors.md), [A5 Optical sensors](A5-optical-sensors-photodiodes-image-sensors-and-lidar.md), [A6 Electrochemical sensors](A6-electrochemical-sensors-and-biosensors.md), [A7 Signal conditioning](A7-signal-conditioning-amplifiers-filters-and-adcs.md), [A8 Noise, resolution, calibration](A8-noise-resolution-calibration-and-drift.md), [B1 Scaling laws](B1-scaling-laws-why-small-is-different.md), [B2 Microfabrication](B2-microfabrication-lithography-etching-deposition.md), [B3 Micromechanics](B3-micromechanics-beams-springs-and-resonators.md), [C1 Reynolds number](C1-fluids-at-the-microscale-reynolds-number-and-laminar-flow.md), [C2 Pressure-driven flow](C2-pressure-driven-flow-and-hydraulic-circuits.md), [C3 Diffusion and mixing](C3-diffusion-mixing-and-the-peclet-number.md), [C4 Surface tension and electrokinetics](C4-surface-tension-capillarity-droplets-and-electrokinetics.md) · used by: this is the capstone; every chain in the notebook ends here

## Hook — a whole kitchen shrunk onto a postage stamp

Making soup, you sieve the vegetables, measure a cup of water, stir, simmer, taste, and decide whether it needs salt. A
clinical lab does the same with blood: spin out the cells, pipette 10 µL, mix in a reagent, incubate, read a colour or a
current, decide. That takes a building, trained staff and a day.

A **lab-on-a-chip** puts the whole kitchen on a piece of plastic the size of a stamp. The grower in our story pricks her
finger, and a strip tells her glucose in 5 seconds. A field kit checks the river by her farm for *E. coli* and nitrate. A
chip with living lung cells "breathes" on a lab bench so a drug can be tested without a patient. Every note of this notebook
appears in that one chip: the plumbing of Part C, the fabrication of Part B, and the transducer, amplifier, ADC and noise of
Part A. This note walks one sample through the whole chain and asks at each stage how long it takes, what the gain is, and
what noise it adds.

## The idea in plain words

**A lab-on-a-chip is the measurement chain of A1 with plumbing in front.** In A1 a sensor turned a stimulus $s$ into an
output $y$ through a chain of stages, each with a gain. Here the stimulus is a **concentration** $c$ in a liquid: glucose in
blood, nitrate in river water, a virus's RNA in a nose swab. Before any transducer can feel it, the molecules must be
brought to the right place, in the right amount, mixed with the right reagent, and given time to react. So a chip has seven
stages:

1. **Sample in and sample prep:** capillary filling (C4), filtering or separating plasma from blood cells.
2. **Metering:** cutting out an exact volume with a chamber and capillary valves (C4, C2).
3. **Mixing** the sample with a reagent: hard at low Reynolds number (C1), so chips fold the streams (C3).
4. **Reaction or incubation:** binding, an enzyme reaction, or PCR thermal cycling (B1).
5. **Detection:** electrochemical (A6), optical (A5), impedance or capacitive (A3), or a mass-sensitive resonator (B3).
6. **Signal conditioning:** transimpedance amplifier, filter and ADC (A7).
7. **Noise, limit of detection and decision** (A8): is the number above the threshold, and can we trust it?

```viz
c5-chip-3d
```

**Stage 1: the volume problem comes first.** A chip handles microlitres. If bacteria are rare, there may simply be none in
the drop. The number of cells in a volume $V$ is random (Poisson) with mean $\bar n=cV$, and the chance of catching none is
$e^{-cV}$. To be 95% sure of catching at least one you need $cV\ge3$. A 10 µL sample of river water at 100 CFU/mL
(colony-forming units) holds on average one bacterium, so it misses 37% of the time. Drinking water must have zero
*E. coli* in 100 mL, so a test must start with 300 mL and **concentrate** it, for example by filtering it through a membrane
and washing the cells off into a few microlitres. No electronics can fix a sample that holds no target. For blood, the prep
step is separating plasma from red cells, because the cells scatter light and change the viscosity. Chips do it with a
filter membrane, by letting the cells settle, or with flow tricks (C1).

**Stage 2: metering with no moving parts.** A chamber of known size fills by capillarity (C4) until the liquid reaches a
hydrophobic patch, where the meniscus is pinned. That **capillary stop valve** holds until the driving pressure exceeds its
Laplace burst pressure, $\Delta p_{\text{burst}}=2\gamma\lvert\cos\theta\rvert(1/w+1/h)$. That is 1.48 kPa for a
100 µm × 50 µm channel with $\theta=110^\circ$. The pump pressure itself comes from Ohm's law for fluids (C2),
$\Delta p=R_{\text{hyd}}Q$: pushing 1 µL/min through a 5 cm serpentine of that size takes about 1.17 kPa. Spinning the
chip like a CD raises the pressure step by step and opens valves in sequence; such "lab-on-a-CD" analysers are sold for blood
tests.

**Stage 3: mixing.** At low Reynolds number two streams flow side by side and mix only by diffusion (C1, C3). The time
to diffuse across a width $w$ is $t\approx w^2/(2D)$. For a protein ($D=4\times10^{-11}$ m²/s) across 100 µm that is 125 s.
The **Péclet number** $\mathrm{Pe}=Uw/D=2500$ says the flow carries it 2500 times faster than it diffuses, so the protein
would leave the chip before it mixed. A **serpentine** or **herringbone mixer** folds the streams into thin layers
(striations). At 10 µm thickness the mixing time falls to 1.25 s, because it scales as thickness squared.

**Stage 4: is the reaction limited by chemistry or by delivery?** Capture antibodies on a sensor surface bind targets at a
rate $k_{\text{on}}b_mc_s$, where $k_{\text{on}}$ is the binding rate constant, $b_m$ the density of capture sites and $c_s$
the concentration right at the surface. Diffusion resupplies the surface at a rate $D(c-c_s)/\delta$ across a depletion
layer of thickness $\delta$. Their ratio is a **Damköhler number**
$$\mathrm{Da}=\frac{k_{\text{on}}b_m\delta}{D}.$$
If $\mathrm{Da}\gg1$ the surface eats molecules faster than diffusion brings them. The assay is **transport-limited**, and
stirring, flow or a thinner $\delta$ helps. If $\mathrm{Da}\ll1$ it is **reaction-limited**, and only better chemistry helps.
For a typical antibody surface ($k_{\text{on}}=10^6$ /(M·s), $10^4$ sites per µm², $\delta=10$ µm), $\mathrm{Da}=4.15$:
transport-limited. In still liquid a perfectly absorbing sensor of area $A$ collects
$$N(t)=2cA\sqrt{\frac{Dt}{\pi}}$$
molecules. At **1 fM** (0.6 molecules per nL!), a 100 µm × 100 µm sensor catches about **one molecule in 10 minutes**. At
1 pM it catches about a thousand. For ultra-low concentrations the limit is set by physics (how many molecules can reach
the sensor), not by the electronics. That is why sensitive chips flow the sample past the sensor, capture targets on beads,
or amplify the target itself.

**PCR on a chip: small means fast (B1).** PCR copies DNA by cycling between about 95 °C (separate the strands), 55 °C
(primers bind) and 72 °C (copy). Each perfect cycle doubles the target, so 30 cycles give $2^{30}=1.07\times10^9$ copies. The
time is set by how fast heat diffuses through the sample, $\tau\approx L^2/\alpha_{\text{th}}$, where
$\alpha_{\text{th}}=1.43\times10^{-7}$ m²/s is the thermal diffusivity of water. The equation is the same as C3's diffusion,
with heat in place of molecules. A 50 µL tube ($L\approx2$ mm) needs about 28 s to follow a temperature step. A 100 µm chip
chamber needs 0.07 s. A metal block ramps at about 3 °C/s, so 30 cycles spend 13.3 min just changing temperature. A chip at
30 °C/s needs 1.3 min. Split the reaction into droplets (C4) and you have digital PCR.

**Stage 5: detection, the transducer.** Every Part A idea appears here.
- **Electrochemical (A6):** an enzyme turns glucose into electrons at an electrode. After a potential step the current
  follows the **Cottrell** law, $I=n\mathcal FAc\sqrt{D/(\pi t)}$, with $n$ electrons per molecule and $\mathcal F$ the
  Faraday constant. Its $\sqrt{D/(\pi t)}$ is the same diffusion flux as the molecule-collection formula above. A 1 mm²
  electrode at 5 mM glucose gives 6.30 µA after 5 s.
- **Optical (A5):** fluorescence or colour (absorbance). Beer–Lambert absorbance is proportional to path length, and a 50 µm
  channel has 200× less path than a 1 cm cuvette. Chips therefore prefer fluorescence, or a phone camera reading a
  lateral-flow line.
- **Impedance and capacitance (A3):** cells and bound layers change the resistance or capacitance between electrodes. The
  simplest case is the Coulter counter below. Remember the Debye screening of C4: in saline only charges within about 1 nm of
  the surface are seen.
- **Mass (B3):** a resonator's frequency drops when mass lands on it, $\Delta f/f_0\approx-\Delta m/(2m)$, so a quartz
  crystal or a MEMS cantilever weighs a bound layer of virus or protein.

**Counting cells one by one: the Coulter counter.** Push diluted blood through a small aperture (diameter $D_{\text{ap}}$,
length $L$) filled with salt water of resistivity $\rho_e$. The aperture has resistance $R=4\rho_eL/(\pi D_{\text{ap}}^2)$.
A cell is an insulator, so while it passes it displaces conducting liquid and the resistance jumps by
$$\Delta R\approx\frac{4\rho_e d^3}{\pi D_{\text{ap}}^4}\qquad(d\ll D_{\text{ap}}).$$
This is $\Delta R/R\approx1.5\,V_{\text{cell}}/V_{\text{ap}}$: the pulse height measures the cell's **volume**. Each pulse is one
cell, so counting pulses counts cells. For a 50 µm aperture a red cell (90 fL) gives a 23.5 Ω bump on 20.5 kΩ. A white cell
gives a 5.8× taller pulse, and a platelet a 9× shorter one. A complete blood count is a histogram of these pulses.
Optical flow cytometers do the same with laser scatter and fluorescence (A5).

```viz
c5-coulter
```

**Stages 6–7: from current to a trustworthy number.** The transducer's current is tiny, so a transimpedance amplifier
turns it into a voltage $V=IR_f$, a filter limits the bandwidth, and an ADC turns it into counts (A7). Each stage multiplies
the signal by a gain, so the overall **sensitivity** is the product
$$S=\frac{\text{counts}}{\text{mM}}=\underbrace{\frac{\text{molecules/s}}{\text{mM}}}_{\text{chemistry + transport}}\times\underbrace{nq_e}_{\text{charge}}\times\underbrace{R_f}_{\text{TIA}}\times\underbrace{\frac{2^N}{V_{\text{ref}}}}_{\text{ADC}}.$$
Each stage also adds noise. Refer every noise source back to the input, by dividing by the gain in front of it, and add the
variances: $\sigma_{\text{tot}}^2=\sum\sigma_i^2$. The **limit of detection** is the concentration whose signal stands three
standard deviations above the blank (A8):
$$\mathrm{LOD}=\frac{3\,\sigma_{\text{tot}}}{S}.$$
In a glucose strip the blank's chemistry (strip-to-strip background current, about 20 nA) dominates. The resistor's Johnson
noise (1.4 pA) is negligible, and a 12-bit ADC adds 2.8 nA. A cheap 8-bit ADC would add 45 nA and become the weakest link.
The **decision** compares the result with a threshold: below 3.9 mM is hypoglycaemia, above 50 mg/L (0.806 mM) nitrate the
EU says the water is unfit to drink, and any *E. coli* in 100 mL fails. The LOD must sit well below the threshold, or the
decision is a coin toss.

```viz
c5-signal-budget
```

**Organ-on-chip: the sample is alive.** In a **lung-on-chip**, a thin porous PDMS membrane separates two channels. Lung
cells grow on top, exposed to air, and blood-vessel cells grow below, fed by flowing medium. Side chambers under vacuum
stretch the membrane about 10% at 0.2 Hz, like breathing. The cells feel the flow as **wall shear stress**
$\tau_w=6\mu Q/(wh^2)$ (C2). Blood-vessel cells like about 1 Pa, which in a 1 mm × 100 µm channel needs 100 µL/min. Gut,
liver, kidney and blood-brain-barrier chips follow the same idea. They test drugs on human tissue that moves and flows like
the real thing, which a flat dish cannot do. Sensors are built in: electrodes measure the barrier's electrical resistance
(TEER), and oxygen and pH spots glow (A5).

**Plant-on-chip and root-on-chip.** Seedlings of *Arabidopsis* (a small model plant) grow their roots into PDMS channels
under a microscope. The chip changes nutrients, salt or hormones around a single root in seconds, using laminar streams (C1)
to treat one side only, while fluorescent sensors in the cells report sugar or calcium. In the field, a sap chip near the
grower's tomato stem can read nitrate or potassium with ion-selective electrodes (A6, about 59 mV per decade).

**Wearable sweat patches.** A skin patch has a soft microfluidic serpentine. Sweat glands push sweat in (at about
1 µL/(cm²·min) during exercise), and a 2 cm² inlet fills a 20 µL channel in about 10 min. Paper or colour spots read
chloride, lactate or glucose, and a phone camera or an NFC chip reads the result. Sweat glucose is about 100× more dilute
than blood glucose, so the LOD budget is tight.

**Cost and manufacturing (B2).** Research chips are **PDMS** moulded on a lithographic master: cheap, clear and
gas-permeable (good for cells), but they absorb oily drug molecules and recover their hydrophobicity (C4). Products are
**injection-moulded** plastic (cents per chip), **paper** with wax-printed walls (wicking is the pump), or **glass and
silicon** where electrodes, heaters or optics are needed. Glucose strips, with screen-printed carbon electrodes, are made by
the billion. Cost pushes every function toward "passive": capillary pumps, stop valves, dried reagents.

## Intuitive examples

1. **River water and the volume limit.** At 100 CFU/mL, a 10 µL sample holds $\bar n=1.00$ cell on average:
   $P(\ge1)=1-e^{-1}=0.632$. 95% detection needs $\bar n=3.00$, so 30 µL at that level. The drinking-water limit
   (1 per 100 mL) needs 300 mL, concentrated before the chip.
2. **Diffusion clocks.** Across a 50 µm channel, glucose ($D=6.7\times10^{-10}$ m²/s) needs 1.87 s, an antibody
   ($4\times10^{-11}$) 31.25 s. A protein needs 125 s to mix across 100 µm, but only 1.25 s across 10 µm striations from a
   herringbone mixer; $\mathrm{Pe}=2500$ at 1 mm/s.
3. **The transport limit.** $\mathrm{Da}=4.15$ for the antibody surface. A 100 µm × 100 µm sensor in still liquid collects in
   10 minutes 1.05 molecules at 1 fM, $1.05\times10^3$ at 1 pM and $1.05\times10^6$ at 1 nM.
4. **A glucose strip, end to end.** Cottrell at 5 mM ($n=2$, $A=1$ mm², $t=5$ s): $I=6.30$ µA ($1.260$ µA/mM), which is
   $1.97\times10^{13}$ glucose molecules oxidised per second. $R_f=82$ kΩ gives 0.517 V and a 12-bit, 3.3 V ADC reads 641
   counts (128.3 counts/mM). The full scale of 30 mM is 37.8 µA → 3.10 V, which fits; $R_f$ must stay below 87 kΩ. Noise:
   20 nA blank, 1.42 pA Johnson, 2.84 nA quantisation, so $\sigma_{\text{tot}}=20.20$ nA and $\mathrm{LOD}=0.048$ mM
   (0.87 mg/dL). With an 8-bit ADC the quantisation is 45.4 nA and the LOD rises to 0.118 mM.
5. **PCR heat.** $\tau=L^2/\alpha_{\text{th}}$: 28 s for a 2 mm tube, 0.0699 s for a 100 µm chamber. 30 cycles of 80 °C of
   ramping: 800 s (13.3 min) at 3 °C/s vs 80 s (1.3 min) at 30 °C/s. 30 doublings: $1.074\times10^9$ copies.
6. **Coulter counting.** In PBS ($\rho_e=0.67$ Ω·m), a 50 µm × 60 µm aperture has $R=20.47$ kΩ. A red cell (90 fL,
   $d=5.56$ µm) gives $\Delta R=23.46$ Ω (0.115%), which is 2.35 mV at 0.1 mA. A white cell (10 µm) gives 136.6 Ω and a
   platelet 2.61 Ω. Blood diluted 1:10,000 at 1 µL/s gives 500 cells/s; the aperture holds 0.059 cells on average, so 5.7% of
   pulses risk a coincidence.
7. **Plumbing numbers.** The organ-chip needs $Q=100$ µL/min for $\tau_w=1$ Pa. The serpentine needs 1168 Pa at 1 µL/min.
   A hydrophobic stop valve bursts at 1478 Pa. The sweat patch fills in 10 min, and the nitrate limit is 0.806 mM.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $P(\text{none})=e^{-cV}$; need $cV\ge3$ | sampling: rare targets may not be in the drop | $c$ concentration, $V$ sample volume |
| $t\approx w^2/(2D)$, $\mathrm{Pe}=Uw/D$ | diffusion and mixing time; flow vs diffusion (C3) | $D$ diffusion coefficient |
| $\mathrm{Da}=k_{\text{on}}b_m\delta/D$ | reaction vs delivery: $\gg1$ transport-limited | $b_m$ site density, $\delta$ depletion layer |
| $N=2cA\sqrt{Dt/\pi}$ | molecules collected by a sensor in still liquid | $A$ sensor area |
| $I=n\mathcal FAc\sqrt{D/(\pi t)}$ | Cottrell current of an electrochemical cell (A6) | $n$ electrons, $\mathcal F$ Faraday constant |
| $\tau\approx L^2/\alpha_{\text{th}}$ | thermal time of a sample: PCR speed (B1) | $\alpha_{\text{th}}$ thermal diffusivity |
| $\Delta R\approx4\rho_ed^3/(\pi D_{\text{ap}}^4)$ | Coulter pulse ∝ cell volume | $\rho_e$ resistivity, $d$ cell diameter |
| $\tau_w=6\mu Q/(wh^2)$ | shear on cells in an organ-chip (C2) | $w$, $h$ channel width and height |
| $S=\prod_i g_i$, $\ \mathrm{LOD}=3\sigma_{\text{tot}}/S$ | chain sensitivity and limit of detection (A1, A8) | $g_i$ stage gains, $\sigma_{\text{tot}}^2=\sum\sigma_i^2$ |

## Applications

| World | Lab-on-a-chip and integrated sensing | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | sap and soil nitrate/potassium chips (ion-selective electrodes); root-on-chip; field LAMP/PCR cartridges for crop pathogens | when to fertilise; how roots react to salt; whether a blight has arrived before leaves show it |
| 🧬 Biology & human health | glucose strips; Coulter and flow-cytometry blood counts; 15–45 min PCR cartridges; lung-, gut- and liver-on-chip; sweat patches | a number at the bedside instead of a day later; drug tests on human tissue |
| 🌍 Environment | *E. coli*, nitrate and heavy-metal chips for rivers and wells; droplet PCR of wastewater | safe or unsafe water, with the sampling volume set by Poisson statistics |
| 🤖 Robotics & drones | drones that dip samplers into lakes and carry chip analysers; lab robots feeding organ-chips | maps of water quality; round-the-clock experiments |
| 🚗 Cars | breath-alcohol interlocks (fuel-cell electrochemistry, A6); urea-quality sensors for diesel exhaust fluid; cabin particle counters that count pulses like a Coulter counter | safe driving; clean exhaust; air-quality alerts |
| 📱 Phones & photography | phone cameras reading lateral-flow lines (A5); smartphone microscopes; NFC-read sweat patches | turning a faint line into a calibrated number and a record |
| 🏠 Home & household | pregnancy and COVID tests; pool, aquarium and water-hardness strips; smart toilets doing urinalysis | a decision at home, with no lab |

## Derivation

**(a) Sampling (Poisson).**
1. Targets are scattered at random, so the count in volume $V$ is Poisson with mean $\bar n=cV$: $P(k)=\bar n^ke^{-\bar n}/k!$.
2. $P(0)=e^{-cV}$. For $P(\ge1)\ge0.95$: $e^{-cV}\le0.05$, so $cV\ge\ln20=3.0$.

**(b) Damköhler number.**
1. At steady state the binding flux equals the diffusive supply: $k_{\text{on}}b_mc_s=D(c-c_s)/\delta$.
2. Solve: $c_s=c/(1+\mathrm{Da})$ with $\mathrm{Da}=k_{\text{on}}b_m\delta/D$.
3. $\mathrm{Da}\gg1$ ⇒ $c_s\ll c$: the surface is starved (transport-limited). $\mathrm{Da}\ll1$ ⇒ $c_s\approx c$ (reaction-limited).

**(c) Molecules collected (and Cottrell).**
1. A perfectly absorbing plane in still liquid: the concentration profile is $c\,\mathrm{erf}\big(y/(2\sqrt{Dt})\big)$ (C3).
2. Flux at the wall: $j=D\,\partial c/\partial y\vert_0=c\sqrt{D/(\pi t)}$.
3. Integrate over time and area: $N=A\int_0^tj\,dt'=2cA\sqrt{Dt/\pi}$.
4. Multiply the molar flux by $n\mathcal F$ for electrons: $I=n\mathcal FAc\sqrt{D/(\pi t)}$, which is Cottrell's law.

**(d) Chain gain and LOD.**
1. Stage $i$ maps its input to its output with gain $g_i$, so $y=(\prod g_i)\,c=S\,c$ (A1).
2. A noise $\sigma_i$ added after stage $i$ looks, at the input, like $\sigma_i/(g_1\cdots g_i)$.
3. Independent noises add in variance: $\sigma_{\text{tot}}^2=\sum\sigma_i^2$ (all referred to one point).
4. Detection requires the signal to stand 3σ above the blank: $S\cdot\mathrm{LOD}=3\sigma_{\text{tot}}$.

**(e) Coulter pulse.**
1. Aperture resistance: $R=\rho_eL/A_{\text{ap}}=4\rho_eL/(\pi D_{\text{ap}}^2)$.
2. A small insulating sphere in a uniform field adds the resistance of 3/2 of its own volume of liquid: $\Delta R/R\approx\tfrac32V_{\text{cell}}/V_{\text{ap}}$.
3. With $V_{\text{cell}}=\pi d^3/6$ and $V_{\text{ap}}=\pi D_{\text{ap}}^2L/4$: $\Delta R/R=d^3/(D_{\text{ap}}^2L)$, so $\Delta R=4\rho_ed^3/(\pi D_{\text{ap}}^4)$.

**(f) Thermal time of PCR and shear in an organ-chip.**
1. Heat diffuses like molecules, with $\alpha_{\text{th}}$ in place of $D$: $\tau\sim L^2/\alpha_{\text{th}}$, which shrinks as $\ell^2$ (B1).
2. Between plates (C2) $u=6\bar u\,(y/h)(1-y/h)$, so $\tau_w=\mu\,du/dy\vert_0=6\mu\bar u/h=6\mu Q/(wh^2)$.

## Worked check

**Multiply the stage gains of the glucose strip** (5 mM, $n=2$, $A=1$ mm², $D=6.7\times10^{-10}$ m²/s, $t=5$ s):
- Chemistry + transport: $\sqrt{D/(\pi t)}=6.531\times10^{-6}$ m/s, so the flux is $3.933\times10^{12}$ molecules/s per mM.
- × charge $nq_e=3.204\times10^{-19}$ C → $1.2603$ µA/mM.
- × $R_f=82$ kΩ → $0.1033$ V/mM.
- × ADC $2^{12}/3.3\ \text{V}=1241.2$ counts/V → $S=128.3$ counts/mM, so 5 mM reads 641 counts ✓.
- Noise at the current: $\sqrt{(20)^2+(0.00142)^2+(2.84)^2}=20.20$ nA, so $\mathrm{LOD}=3(20.20)/1260.3=0.0481$ mM, about
  6.2 counts ✓.
- Cross-check by Cottrell directly: $2\cdot96485\cdot10^{-6}\cdot5\cdot6.531\times10^{-6}=6.30$ µA ✓ (all numbers from
  `scripts/checks/C5_check.py`).

## Whiteboard plan

- **Panel 1: the kitchen and the chip.** Draw the soup steps above the seven chip stages and connect them with arrows: sieve
  → filter, cup → metering chamber, spoon → serpentine, pot → incubation chamber (heater under it), tasting → electrodes,
  "more salt?" → decision. Under each stage write the note number.
- **Panel 2: is the target even in the drop?** A drop with 0, 1 or 3 dots. Write $P(\text{none})=e^{-cV}$ and "$cV\ge3$".
- **Panel 3: delivery.** A sensor on a wall with a depletion layer $\delta$; write $\mathrm{Da}=k_{\text{on}}b_m\delta/D$ and
  "1 fM → 1 molecule per 10 min".
- **Panel 4: the chain.** Five boxes: c → molecules/s → I → V → counts, with the gains on the arrows and a red noise squiggle
  entering each box. Box $S=\prod g_i$ and $\mathrm{LOD}=3\sigma/S$.
- **Panel 5: Coulter.** An aperture with a cell in it, a pulse train below, and a histogram with three humps (platelets, red
  cells, white cells).
- **Panel 6: the living chip.** Lung-on-chip cross-section: air above, membrane with cells, medium below, vacuum chambers at
  the sides; write $\tau_w=6\mu Q/(wh^2)$ and "10% stretch at 0.2 Hz".

## Common mistakes and where the intuition breaks

- **"Smaller is always faster."** Diffusion over short distances is fast, but at low concentration a small sensor catches
  very few molecules. Small volumes also hold few targets. Shrinking helps reaction speed, but it hurts sampling and
  delivery.
- **Confusing sensitivity with LOD.** A huge gain amplifies the noise too. The LOD is set by the noise referred to the
  input, usually the chemistry of the blank, not by the amplifier.
- **Clipping.** More $R_f$ looks like more signal until the output hits $V_{\text{ref}}$. Size the gain for the top of the
  range (here $R_f\le87$ kΩ for 30 mM).
- **Averaging fixes everything.** Averaging $M$ readings shrinks random electronic noise by $1/\sqrt M$ (A8), but not
  strip-to-strip differences, which must be calibrated with batch codes and controls.
- **Matrix effects.** Real samples are not buffer. Red-cell fraction changes the diffusion in a glucose strip, proteins foul
  electrodes, high salt screens charge sensors (C4), and PDMS soaks up drug molecules in organ-chips.
- **Bubbles.** One trapped bubble blocks a channel (Laplace pressure, C4) or insulates an electrode.
- **Poisson counts have Poisson noise.** Counting $N$ events (cells, droplets) has a relative error of about $1/\sqrt N$, so
  10,000 counted cells give about ±1%.

## Remember

**"A chip is the A1 chain with plumbing in front: each stage has a time, a gain and a noise, and the weakest stage, often
getting molecules to the sensor, sets the limit of detection."**

## Self-test

1. A chip analyses 5 µL of water. What is the lowest bacterial concentration it can detect with 95% confidence, whatever its electronics?
   <details><summary>Answer</summary>It needs c V of at least 3, so c = 3 / 5 µL = 0.6 per µL = 600 per mL. Anything rarer must be concentrated first (for example by filtering a large volume).</details>
2. In the glucose strip, someone raises the feedback resistor to 1 MΩ "for more signal". What happens at 5 mM?
   <details><summary>Answer</summary>V = 6.30 µA x 1 MΩ = 6.30 V, above the 3.3 V reference, so the amplifier and ADC clip. The highest readable concentration becomes 3.3 / (1.26 µA/mM x 1 MΩ) = 2.62 mM, below the normal range. The LOD does not improve, because the blank noise dominates.</details>
3. A Coulter aperture is narrowed from 50 µm to 25 µm (same length). How do the red-cell pulse and the aperture resistance change?
   <details><summary>Answer</summary>The pulse scales as 1/D^4, so it is 16 times larger (about 375 Ω). The resistance scales as 1/D^2, so it is 4 times larger (about 81.9 kΩ). The relative pulse grows 4 times, but the aperture clogs more easily and needs more pressure.</details>

**Next:** [Back to the storyline](index.md): you have now followed every arrow of the map. Pick any device in the story (a leaf clip, a drone gyroscope, a test strip) and trace its chain from stimulus to trusted number.
