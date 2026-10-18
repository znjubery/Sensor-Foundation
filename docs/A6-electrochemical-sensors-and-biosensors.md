# A6. Electrochemical sensors and biosensors

> **Connects:** builds on [A1 What a sensor is](A1-what-a-sensor-is-transduction-and-the-measurement-chain.md), [A3 Capacitive sensors](A3-capacitive-sensors.md) · used by [A7 Signal conditioning](A7-signal-conditioning-amplifiers-filters-and-adcs.md), [A8 Noise, resolution, calibration and drift](A8-noise-resolution-calibration-and-drift.md), [C3 Diffusion, mixing and the Péclet number](C3-diffusion-mixing-and-the-peclet-number.md), [C5 Lab-on-a-chip](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md)

## Hook — a battery made from a lemon

Push a galvanised (zinc-coated) nail and a copper coin into a lemon and connect them to a voltmeter: about one volt. No
moving parts, no light, nothing visible happens, yet the lemon is a battery. Zinc atoms give up electrons more eagerly
than copper does, and the juice lets ions move between the two metals to close the circuit. **The voltage tells you
which chemicals are there and how much of them.**

Every electrochemical sensor is a small, carefully designed version of that lemon. A pH probe in a swimming pool, the
glucose meter a person with diabetes uses five times a day, the carbon-monoxide alarm on a bedroom ceiling and a nitrate
probe in a farmer's soil all measure chemistry by measuring either a **voltage** (how hard the electrons want to move) or
a **current** (how many electrons per second the chemistry delivers).

## The idea in plain words

**Redox: chemistry is electron trading.** In a reduction–oxidation (redox) reaction one species gives up electrons
(it is **oxidised**) and another takes them (it is **reduced**). Zinc metal → zinc ions + 2 electrons is an oxidation;
copper ions + 2 electrons → copper metal is a reduction. Normally the trade happens when molecules bump into each other.
At an **electrode**, a piece of metal or carbon dipped in a solution, the electrons go through the electrode and the wire
instead, so we can measure them. One mole of electrons carries a charge of $\mathcal F=96\,485$ C, the **Faraday
constant**, so counting coulombs counts molecules.

**The electrode–electrolyte interface.** Where metal meets a salty liquid, charge separates: excess electrons (or a lack
of them) on the metal surface, a layer of oppositely charged ions in the liquid just a nanometre away. This **double
layer** is a capacitor with a gap of molecular size, so it is huge per area (about $10$–$40$ µF per cm²,
see [A3](A3-capacitive-sensors.md)). Changing the electrode's voltage first has to charge this capacitor, which is why
every amperometric measurement starts with a short charging spike. The voltage across the double layer decides which
reactions run and how fast.

**Potentiometric sensors: measure the voltage, draw no current.** If an electrode can exchange electrons (or a membrane
can let through ions) with one particular species, a voltage builds up until the electrical push exactly balances the
chemical urge, and then nothing more flows. That equilibrium voltage depends on the logarithm of the ion's activity $a$
(its "effective concentration"; in dilute solutions roughly its concentration in mol/L), as stated by the **Nernst
equation**:
$$V=V^0+\frac{R_gT}{z\mathcal F}\ln a=V^0+\frac{R_gT\ln10}{z\mathcal F}\log_{10}a .$$
Here $V^0$ is a constant for the electrode, $R_g=8.314$ J/(mol·K) the gas constant, $T$ the absolute temperature and $z$ the
ion's charge ($+1$ for H⁺ or K⁺, $+2$ for Ca²⁺, $-1$ for nitrate NO₃⁻). The slope is about **59 mV per factor of ten**
at 25 °C for $z=1$. The sensor is linear in $\log a$, not in $a$, which is ideal for quantities that span many decades.

```viz
a6-nernst
```

**The pH electrode.** A thin bulb of special glass lets its surface exchange H⁺ ions with the solution. Inside the bulb
is a buffer of fixed pH and an internal wire; outside, a **reference electrode** (silver coated with silver chloride in
a KCl solution) provides a stable, known potential to measure against. Because $\mathrm{pH}=-\log_{10}a_{\mathrm{H^+}}$,
the voltage falls by $59.16$ mV for every pH unit at 25 °C; a typical glass electrode is built to read $0$ mV at pH 7.
**Ion-selective electrodes** replace the glass by a plastic membrane containing a molecule (an ionophore or ion
exchanger) that binds only one ion: nitrate for soil and water, potassium and sodium for blood and sweat, calcium for
milk. Their weak points are temperature (the slope is proportional to $T$), drift of $V^0$ (they must be calibrated in
known buffers, [A8](A8-noise-resolution-calibration-and-drift.md)) and interfering ions that the membrane also lets through a little.

**Amperometric sensors: hold the voltage, measure the current.** Now force the reaction to run. Hold the electrode at a
potential where the target molecule is oxidised (or reduced) the instant it arrives. The current then tells you how many
molecules arrive per second. Each molecule delivers $n$ electrons, so
$$I=n\,\mathcal F\times(\text{moles arriving per second}).$$
Because the electrode consumes everything that touches it, the molecules nearby are used up and a **depletion layer**
forms. New molecules must **diffuse** across it ([C3](C3-diffusion-mixing-and-the-peclet-number.md)), and its thickness
grows like $\sqrt{\pi Dt}$, where $D$ is the diffusion coefficient. The flux through a layer is about
$D\,c/\delta$, so the current falls as $1/\sqrt t$: the **Cottrell equation**
$$I(t)=n\,\mathcal F\,A\,c\,\sqrt{\frac{D}{\pi t}},$$
with $A$ the electrode area and $c$ the bulk concentration. Everything except $c$ is fixed by the design, so if you always
read the current at the same moment, **current is proportional to concentration**.

**The glucose strip.** A strip is a tiny electrochemical cell: printed carbon electrodes under a capillary chamber that
sucks up about half a microlitre of blood ([C4](C4-surface-tension-capillarity-droplets-and-electrokinetics.md)). On the
working electrode sits the enzyme **glucose oxidase** (GOx). Enzymes are the secret of **selectivity**: GOx has a pocket
shaped for glucose, so the dozens of other molecules in blood are ignored. GOx oxidises glucose and passes 2 electrons per
glucose to a **mediator** molecule (for example ferricyanide), which carries them to the electrode. The meter applies its
potential, waits a few seconds, reads a current of a few microamps and converts it to mg/dL with a calibration factor.

```viz
a6-strip-3d
```

**The three-electrode cell.** If the same electrode both carried the current and served as the voltage reference, its
potential would shift as current flowed, and the resistance of the liquid would add an error $IR$. So serious
electrochemical sensors use three electrodes: the **working electrode** (WE), where the reaction of interest happens; the
**reference electrode** (RE), which carries no current and therefore keeps a stable potential; and the **counter
electrode** (CE), which supplies the current. A feedback circuit, the **potentiostat**, adjusts the CE so that
$V_{\text{WE}}-V_{\text{RE}}$ stays exactly at the set value, and a transimpedance amplifier
([A7](A7-signal-conditioning-amplifiers-filters-and-adcs.md)) turns the WE current into a voltage.

**Gas sensors.** An **electrochemical CO sensor** is an amperometric cell with a porous membrane. CO diffuses in and is
oxidised at a platinum WE (CO + H₂O → CO₂ + 2H⁺ + 2e⁻), giving a current proportional to the CO concentration, typically
tens of nanoamps per ppm. It is selective, needs almost no power and lasts years, which is why it is used in home alarms.
A **metal-oxide (MOX) sensor** works differently: a film of tin dioxide heated to $200$–$400$ °C has oxygen bound on its
grains that traps electrons; reducing gases (CO, methane, alcohol, volatile organics) react with that oxygen, release the
electrons and **lower the resistance**, roughly as a power law $R_s=R_0(c/c_0)^{-\kappa}$ with $\kappa\approx0.5$ ($R_0$ is
the resistance at a reference concentration $c_0$). MOX sensors are cheap and sensitive but not very selective, drift
with humidity and need their heater.

**Biosensors in general.** A biosensor is a transducer (electrode, photodiode, mass sensor) plus a **biological
recognition element** that provides selectivity: an enzyme (glucose oxidase, lactate oxidase, urease), an antibody that
binds one protein (pregnancy and COVID tests, cardiac markers), or a DNA strand that binds only its complementary
sequence. The recognition element decides *what* is measured; the transducer decides *how small* an amount can be seen.

**Limit of detection.** Repeat the measurement on a blank (a sample with none of the target) and you still get a
slightly fluctuating current with standard deviation $\sigma_{\text{blank}}$. A real signal must stand clearly above
that. The usual rule: the **limit of detection** is the concentration whose signal equals three blank standard deviations,
$$c_{\text{LOD}}=\frac{3\,\sigma_{\text{blank}}}{S},$$
where $S=dI/dc$ is the sensitivity. To quantify (not just detect) people use $10\sigma_{\text{blank}}/S$.

```viz
a6-cottrell
```

## Intuitive examples

1. **The lemon battery.** Standard potentials: Cu²⁺/Cu $+0.34$ V, Zn²⁺/Zn $-0.76$ V, so the ideal cell gives
   $0.34-(-0.76)=1.10$ V. The free energy released per mole of zinc is $-z\mathcal FV=-2\times96485\times1.10=-212$ kJ.
2. **The Nernst slope.** $R_gT\ln10/\mathcal F$ is $54.20$ mV/decade at $0$ °C, $59.16$ at $25$ °C and $61.54$ at $37$ °C.
   For a doubly charged ion ($z=2$, calcium) it halves: $29.58$ mV/decade at 25 °C.
3. **pH.** From pH 7 to pH 4 the glass electrode's voltage rises by $3\times59.16=177.5$ mV. A $1$ mV reading error is
   only $0.0169$ pH. But calibrating at 25 °C and measuring at 37 °C, three units away from pH 7, gives a $7.1$ mV error,
   i.e. $0.12$ pH, unless the meter compensates for temperature.
4. **Nitrate in soil water.** From $10$ to $100$ mg/L of nitrate the ion-selective electrode ($z=-1$) moves by $-59.2$ mV.
   A drift of only $5$ mV looks like a factor $1.21$ in concentration, a $21\%$ error: that is why field probes are
   recalibrated often.
5. **A glucose strip.** $n=2$ electrons per glucose, $A=1$ mm², $D=6.7\times10^{-10}$ m²/s, $c=5$ mM ($=5$ mol/m³ $=90.1$ mg/dL):
   $I(1\ \text{s})=14.09$ µA, $I(4\ \text{s})=7.05$ µA (four times longer, half the current), $I(5\ \text{s})=6.30$ µA,
   $I(10\ \text{s})=4.46$ µA. The sensitivity at 5 s is $1.26$ µA/mM, the depletion layer is $\sqrt{\pi Dt}=103$ µm thick,
   and $10$ mM gives $12.60$ µA. In the first 5 s the strip collects $63$ µC.
6. **A CO alarm.** At $70$ nA/ppm: $30$ ppm gives $2.10$ µA, $70$ ppm (a level that should trigger an alarm within an hour or
   so) $4.90$ µA, $400$ ppm $28.00$ µA. A $100$ kΩ transimpedance amplifier turns $70$ ppm into $0.49$ V.
7. **A MOX sensor.** With $\kappa=0.5$, four times more gas halves the resistance ($\times0.50$), and $100$ times more gas
   divides it by ten ($\times0.10$).
8. **Why three electrodes.** $10$ µA through $1$ kΩ of solution resistance shifts the electrode potential by $10$ mV, enough
   to change which reactions run. The reference electrode, carrying no current, has no such drop.
9. **Enzyme saturation.** With a Michaelis constant $K_M=25$ mM (the concentration at which the enzyme runs at half speed),
   the response $c/(K_M+c)$ falls short of a straight line by $4\%$ at $1$ mM, $17\%$ at $5$ mM and $44\%$ at $20$ mM. Real
   strips put a diffusion-limiting membrane over the enzyme so that the electrode, not the enzyme, sets the current.
10. **Limit of detection.** A blank noise of $\sigma_{\text{blank}}=0.05$ µA and $S=1.26$ µA/mM give
    $c_{\text{LOD}}=0.119$ mM ($2.1$ mg/dL) and a limit of quantification of $0.40$ mM, far below the clinically interesting
    range of $3$–$20$ mM.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $q=n\,\mathcal F\times\text{moles}$ | electrons count molecules | $n$ electrons per molecule, $\mathcal F=96485$ C/mol |
| $V=V^0+\dfrac{R_gT}{z\mathcal F}\ln a$ | Nernst: equilibrium potential | $a$ activity, $z$ ion charge, $R_g$ gas constant |
| $\dfrac{R_gT\ln10}{z\mathcal F}=59.16\ \text{mV}/z$ at 25 °C | slope per decade | proportional to $T$ |
| $V=59.16\ \text{mV}\times(7-\mathrm{pH})$ | ideal glass pH electrode at 25 °C | $\mathrm{pH}=-\log_{10}a_{\mathrm{H^+}}$ |
| $I(t)=n\mathcal FAc\sqrt{D/(\pi t)}$ | Cottrell: diffusion-limited current after a potential step | $A$ area, $c$ bulk concentration, $D$ diffusion coefficient |
| $\delta\approx\sqrt{\pi Dt}$ | depletion-layer thickness | grows like $\sqrt t$ |
| $I_{\text{CO}}=S_{\text{CO}}\,c$ | amperometric gas sensor | $S_{\text{CO}}$ in nA/ppm |
| $R_s=R_0(c/c_0)^{-\kappa}$ | metal-oxide gas sensor | $\kappa\approx0.3$–$0.8$ |
| $\dfrac{c}{K_M+c}$ | enzyme (Michaelis–Menten) saturation | $K_M$ Michaelis constant |
| $c_{\text{LOD}}=3\sigma_{\text{blank}}/S$ | limit of detection | $S=dI/dc$ sensitivity |

## Applications

| World | Electrochemical sensing | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | nitrate, potassium and pH ion-selective electrodes in soil and in hydroponic nutrient tanks; sap-nitrate test strips; dissolved-oxygen probes in fish ponds | when and how much to fertilise; whether the nutrient solution has drifted; whether fish are short of oxygen |
| 🧬 Biology & human health | glucose strips and continuous glucose monitors (an enzyme electrode under the skin); blood-gas analysers (pH, CO₂, K⁺, Na⁺); lactate sensors for athletes; antibody-based rapid tests | insulin dose; acid–base and salt balance in intensive care; when muscles switch to anaerobic work; infection or pregnancy |
| 🌍 Environment | electrochemical NO₂, O₃ and CO sensors in air-quality stations; pH, conductivity and dissolved-oxygen probes in rivers; heavy-metal stripping electrodes | traffic pollution at street level; whether a river can support fish; lead or mercury contamination |
| 🤖 Robotics & drones | gas-sensing drones over landfills, volcanoes and leaks; robots sampling water quality; electronic noses (MOX arrays) on inspection robots | where methane or CO is escaping; pollution maps; spoiled food or chemical leaks |
| 🚗 Cars | the lambda (oxygen) sensor in the exhaust, a zirconia Nernst cell; cabin air-quality MOX sensors; NOx sensors after the catalyst | the air-to-fuel ratio, set to burn cleanly; when to recirculate cabin air; whether the catalyst works |
| 📱 Phones & photography | add-on electrochemical readers that plug into a phone (glucose, breath alcohol); sweat-sensing patches read by phone; MOX air-quality modules in wearables | test results logged on the phone; hydration and electrolytes; indoor air quality |
| 🏠 Home & household | CO alarms (electrochemical); pool and aquarium pH and chlorine probes; MOX sensors in smart air purifiers and kitchen hoods; breathalysers | the poisonous gas you cannot smell; whether the pool is safe; cooking fumes and volatile organics; alcohol in breath |

## Derivation

**(a) The Nernst equation.**
1. Moving one mole of ions of charge $z$ through a potential difference $V$ costs electrical work $z\mathcal FV$.
2. The chemical free energy of the ions depends on their activity: $\mu=\mu^0+R_gT\ln a$.
3. Equilibrium (no net transfer) means the two balance: $z\mathcal FV=\mu^0+R_gT\ln a$, up to a constant.
4. Collect the constants into $V^0$: $V=V^0+\dfrac{R_gT}{z\mathcal F}\ln a$.
5. Base 10: $\ln a=\ln10\,\log_{10}a$, so the slope is $\dfrac{R_gT\ln10}{z\mathcal F}=\dfrac{8.314\times298.15\times2.3026}{96485}=0.05916$ V per decade.
6. The thermal voltage $R_gT/\mathcal F=25.69$ mV at 25 °C is the natural unit; $\ln10=2.303$ turns it into $59.16$ mV.

**(b) The Cottrell equation (diffusion to a flat electrode).**
1. After the potential step the surface concentration is zero; far away it stays $c$.
2. Diffusion ([C3](C3-diffusion-mixing-and-the-peclet-number.md)): $\partial c/\partial t=D\,\partial^2c/\partial x^2$, with $x$ the distance from the electrode.
3. The solution is an error-function profile, $c(x,t)=c\,\operatorname{erf}\!\big(x/(2\sqrt{Dt})\big)$.
4. Flux at the surface: $D\,\partial c/\partial x\rvert_{x=0}=D\,c\cdot\dfrac{2}{\sqrt\pi}\cdot\dfrac{1}{2\sqrt{Dt}}=c\sqrt{\dfrac{D}{\pi t}}$.
5. That is the same as $D\,c/\delta$ with an effective layer $\delta=\sqrt{\pi Dt}$.
6. Current $=n\mathcal FA\times$ flux: $I=n\mathcal FAc\sqrt{D/(\pi t)}$.
7. Charge collected up to $t$: $Q=\int_0^tI\,dt'=2n\mathcal FAc\sqrt{Dt/\pi}$, growing like $\sqrt t$.

**(c) Limit of detection.**
1. Calibration line: $I=I_0+S\,c$ (the blank gives $I_0$ with spread $\sigma_{\text{blank}}$).
2. Demand that a real signal exceed the blank by $3\sigma_{\text{blank}}$ (false alarms below about 0.1–1%).
3. $S\,c_{\text{LOD}}=3\sigma_{\text{blank}}$, so $c_{\text{LOD}}=3\sigma_{\text{blank}}/S$.
4. To halve the LOD, double $S$ (bigger electrode, more electrons per molecule) or halve the noise (averaging, shielding, [A8](A8-noise-resolution-calibration-and-drift.md)).

## Worked check

**A glucose strip reading.** Blood with $c=8$ mM, read at $t=5$ s, with $n=2$, $A=10^{-6}$ m², $D=6.7\times10^{-10}$ m²/s.
- $\sqrt{D/(\pi t)}=\sqrt{6.7\times10^{-10}/(\pi\times5)}=6.531\times10^{-6}$ m/s.
- $I=2\times96485\times10^{-6}\times8\times6.531\times10^{-6}=10.08$ µA.
- With the calibration $S=1.26$ µA/mM: $c=10.08/1.26=8.00$ mM ✓, i.e. $8\times18.016=144$ mg/dL.

**A pH reading.** A glass electrode reads $0$ mV at pH 7 and $V=59.16\ \text{mV}\times(7-\mathrm{pH})$ at 25 °C. It shows $118.3$ mV.
- $\mathrm{pH}=7-118.3/59.16=5.00$ (slightly acidic, like a cup of black coffee).
- The same electrode in a pH 4 buffer at 37 °C reads $3\times61.54=184.6$ mV; a meter that assumes 25 °C would report pH $3.88$
  instead of $4.00$. (All numbers from `scripts/checks/A6_check.py`.)

## Whiteboard plan

- **Panel 1 — the lemon.** Zinc nail, copper coin, voltmeter showing $1.1$ V. Write "Zn → Zn²⁺ + 2e⁻" and
  "Cu²⁺ + 2e⁻ → Cu". Say: "Chemistry is electron trading; the wire lets us watch."
- **Panel 2 — two ways to listen.** Split the board: left "measure $V$, no current" (potentiometric), right "hold $V$,
  measure $I$" (amperometric). Under each: pH electrode, glucose strip.
- **Panel 3 — Nernst.** Axes $\log_{10}a$ and $V$, a straight line, a step triangle of one decade labelled $59$ mV. Write
  $V=V^0+\frac{R_gT\ln10}{z\mathcal F}\log_{10}a$ and "∝ T, ÷ z".
- **Panel 4 — depletion.** An electrode at the bottom, dots above it, a dot-free layer of thickness $\sqrt{\pi Dt}$ that
  grows in three snapshots. Then the curve $I\propto1/\sqrt t$ and the boxed Cottrell equation.
- **Panel 5 — the strip.** Top view of three printed electrodes (WE with an enzyme, RE, CE) and the capillary chamber.
  Draw the potentiostat triangle linking them. Say: "RE watches, CE works, WE measures."
- **Panel 6 — LOD.** A calibration line rising from a fuzzy blank band of height $\pm3\sigma$; mark where the line leaves
  the band: $c_{\text{LOD}}=3\sigma/S$.

## Common mistakes and where the intuition breaks

- **"59 mV per unit of concentration."** It is 59 mV per **factor of ten**. Doubling the concentration changes the voltage
  by only $59.16\times\log_{10}2=17.8$ mV.
- **Forgetting the sign and the charge.** Anions ($z<0$) give falling lines, divalent ions half the slope.
- **Drawing current from a potentiometric sensor.** A pH electrode has a resistance of hundreds of megohms; a cheap
  voltmeter loads it and the reading sags. It needs an amplifier with an enormous input resistance ([A7](A7-signal-conditioning-amplifiers-filters-and-adcs.md)).
- **Reading an amperometric sensor too early.** The first fraction of a second is dominated by charging the double-layer
  capacitor, not by the analyte; and every strip must be read at exactly the same time, because $I$ keeps falling.
- **Concentration vs activity.** In salty solutions such as blood, ions screen each other and the activity is lower than
  the concentration. Clinical analysers calibrate in solutions of similar ionic strength.
- **Assuming the enzyme is perfectly selective.** Ascorbic acid (vitamin C), paracetamol and uric acid can be oxidised
  directly at the electrode and add a false current; a lower working potential, a mediator and blocking membranes fight this.
- **Where the linear picture breaks:** at high concentration the enzyme saturates (Michaelis–Menten); in a thin chamber the
  depletion layer reaches the far wall and the $1/\sqrt t$ law turns into faster, exhaustive decay; and at very low
  concentration the noise, not the chemistry, sets the limit (the LOD).

## Remember

**"Hold no current and read $V$: $59$ mV per decade ÷ $z$ (Nernst). Hold $V$ and read $I$: $I=n\mathcal FAc\sqrt{D/\pi t}$ (Cottrell). Selectivity comes from the enzyme or membrane."**

## Self-test

1. A potassium electrode ($z=+1$) reads $-20$ mV in a $1$ mM KCl solution at 25 °C. What does it read in $10$ mM, and in $2$ mM?
   <details><summary>Answer</summary>10 mM is one decade more: −20 + 59.2 = +39.2 mV. 2 mM is a factor 2: −20 + 59.16 × log10(2) = −20 + 17.8 = −2.2 mV.</details>
2. A glucose strip gives $6.3$ µA at $5$ s. What will it read at $20$ s, assuming pure Cottrell behaviour?
   <details><summary>Answer</summary>I ∝ 1/√t; 20 s is 4 times longer, so the current halves: about 3.15 µA.</details>
3. A CO sensor has a sensitivity of $70$ nA/ppm and a blank noise of $14$ nA. What is its limit of detection?
   <details><summary>Answer</summary>c_LOD = 3σ/S = 3 × 14 nA / 70 nA/ppm = 0.6 ppm, well below any alarm level.</details>

**Next:** [A7 Signal conditioning: amplifiers, filters and ADCs](A7-signal-conditioning-amplifiers-filters-and-adcs.md) — microamps from a strip, millivolts from a pH probe and picocoulombs from a crystal all need amplifying, filtering and turning into numbers.
