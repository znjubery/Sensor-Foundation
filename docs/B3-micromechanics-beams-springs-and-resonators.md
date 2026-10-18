# B3. Micromechanics: beams, springs and resonators

> **Connects:** builds on [B1 Scaling laws](B1-scaling-laws-why-small-is-different.md) (why small things are stiff and ring fast), [B2 Microfabrication](B2-microfabrication-lithography-etching-deposition.md) (how the beam is made), [A2 Resistive sensors and the Wheatstone bridge](A2-resistive-sensors-and-the-wheatstone-bridge.md) (strain), [A8 Noise, resolution, calibration and drift](A8-noise-resolution-calibration-and-drift.md) (thermal noise) · used by [B4 MEMS inertial sensors](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md), [B5 MEMS microphones, pressure sensors and actuators](B5-mems-microphones-pressure-sensors-and-actuators.md), [A9 Sensor fusion and the Kalman filter](A9-sensor-fusion-and-the-kalman-filter.md)

## Hook — a diving board and a singing wine glass

Walk to the end of a diving board and it bends. A light child bends it a little, a heavy adult more, in proportion:
twice the weight, twice the bend. A thicker board barely moves at all. Step off and the board does not just return; it
swings up and down a few times before it settles, always at the same rhythm.

Run a wet finger around the rim of a wine glass and it sings one clear note. Tap it and it rings for seconds at that same
pitch. A good crystal glass rings longer than a cheap one, and if a singer hits exactly that pitch loudly enough, the glass
can shatter.

**A silicon beam inside a MEMS chip does both, a million times smaller.** It bends in proportion to the force, which is
a **spring**. It has a mass and rings at its own natural frequency, which is a **resonator**. How long it keeps ringing is its
quality factor. With three formulas (the beam stiffness, the natural frequency and the resonance curve) you can design
the springs of an accelerometer, the membrane of a microphone and the cantilever of an atomic-force microscope that feels
single atoms.

## The idea in plain words

**Stress, strain and Young's modulus.** Pull on a bar and it gets slightly longer. The **strain** $\varepsilon$ is the
relative change in length, $\Delta L/L$; it has no units and is tiny (a strain of $10^{-4}$, written 100 µε, means
0.01%). The **stress** $\sigma$ is the force per unit area that causes it, in pascals (N/m²). For small strains they are
proportional, $\sigma=E\varepsilon$ (Hooke's law), and the constant $E$ is **Young's modulus**: how stiff the material is.
Rubber is about 0.01 GPa, PDMS 0.001–0.003 GPa, aluminium 70 GPa, steel 200 GPa. Single-crystal silicon is 130–169 GPa, depending on the direction:
**169 GPa along a ⟨110⟩ direction**, the usual beam direction on a (100) wafer, and 130 GPa along ⟨100⟩. Silicon is as stiff
as steel, a third as heavy, perfectly elastic (no creep, no fatigue at normal stress) and it breaks only at about 1 GPa.
That combination is why silicon springs can bend billions of times without changing.

**Bending a cantilever.** A **cantilever** is a beam clamped at one end and free at the other, like a diving board. Let it
have length $L$, width $w$ and thickness $t$ (in the bending direction), and push down on its tip with a force $F$. The
beam bends, with the top surface stretched and the bottom squeezed. The stiffness against bending depends on the
**second moment of area** $I_A=wt^3/12$, which measures how far the material sits from the middle of the beam. Material far from the middle resists bending the most, which is why it enters as $t^3$. The tip deflection
and the spring constant $k=F/x$ are
$$x=\frac{FL^3}{3EI_A},\qquad k=\frac{3EI_A}{L^3}=\frac{Ewt^3}{4L^3}.$$
Read the exponents. Doubling the width doubles $k$, since two beams side by side are twice as stiff. Doubling the thickness
makes it **8 times** stiffer. Doubling the length makes it **8 times** softer. The strain is largest at the clamped root, on the
surface: $\varepsilon=\sigma/E$ with $\sigma=6FL/(wt^2)$. That is where a piezoresistor
([A2](A2-resistive-sensors-and-the-wheatstone-bridge.md), [A4](A4-piezoelectric-piezoresistive-and-magnetic-sensors.md))
should sit to read the bending.

```viz
b3-cantilever-3d
```

**Other springs from the same beam.** Clamp both ends and push in the middle: a **fixed-fixed** (bridge) beam is
$192EI_A/L^3$, 64 times stiffer than the cantilever. Clamp one end and let the other slide without rotating: a
**guided** beam is $12EI_A/L^3$. MEMS designers combine these like resistors. Springs in **series** add their *compliances*
($1/k$); springs in **parallel** add their stiffnesses. A **folded spring** puts two guided beams in series and four such folds
in parallel around a proof mass: $k=4\times\tfrac12\times12EI_A/L^3=24EI_A/L^3$. Folding gives a long, soft spring in a small area.
More important, the fold lets the beams expand freely, so residual stress from fabrication
([B2](B2-microfabrication-lithography-etching-deposition.md)) and temperature changes do not change the stiffness,
as they would for a fixed-fixed beam.

**The mass–spring–damper.** Any spring carrying a mass, with some friction, obeys Newton's second law:
$$m\ddot x+b\dot x+kx=F(t).$$
Here $x$ is the displacement, $\dot x$ the velocity, $\ddot x$ the acceleration, $m$ the mass, $k$ the spring constant,
$b$ the **damping** coefficient (friction proportional to speed; in MEMS mostly from the air squeezed in the gaps) and $F(t)$
the applied force. Three numbers describe it:
- the **natural frequency** $\omega_0=\sqrt{k/m}$ (in rad/s; $f_0=\omega_0/2\pi$ in Hz), the pitch it rings at;
- the **quality factor** $Q_f=\sqrt{km}/b$, roughly the number of swings it rings before the amplitude falls to $e^{-\pi}\approx4\%$;
- the **static deflection** $x=F/k$ for a slow, steady force.

A beam is not a point mass, but its first bending mode acts like one with an **effective mass** $m_{\text{eff}}\approx0.243$
of the beam mass (for a cantilever loaded at the tip), so $f_0=\tfrac1{2\pi}\sqrt{k/m_{\text{eff}}}$. The exact first-mode
result for a cantilever is $f_0=\dfrac{1.875^2}{2\pi}\dfrac{t}{L^2}\sqrt{\dfrac{E}{12\rho}}=0.1615\,\dfrac{t}{L^2}\sqrt{\dfrac E\rho}$,
where $\rho$ is the density. Thickness raises the pitch, and length lowers it quadratically.

**Frequency response: the resonance peak.** Shake the mass with a force $F_0\cos\omega t$. After the start-up dies away,
it moves at the same frequency with amplitude $X$ and a lag $\varphi$:
$$X(\omega)=\frac{F_0/k}{\sqrt{(1-r^2)^2+(r/Q_f)^2}},\qquad \tan\varphi=\frac{r/Q_f}{1-r^2},\qquad r=\frac{\omega}{\omega_0}.$$
There are three regimes. **Below resonance** ($r\ll1$) the spring dominates: $X\approx F_0/k$, in phase. This is how an
accelerometer works ([B4](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md)). **At resonance** ($r=1$) the spring
and the mass cancel and only damping limits the motion: $X=Q_f\,F_0/k$, lagging by 90°. **Above resonance** the mass
dominates: $X\approx F_0/(m\omega^2)$, falling as $1/\omega^2$ and in anti-phase (180°). The peak's width at $1/\sqrt2$ of its
height is $\Delta f=f_0/Q_f$. A high $Q_f$ means a tall, narrow peak and a long ring-down, with time constant
$2Q_f/\omega_0$.

```viz
b3-resonance
```

**Thermomechanical (Brownian) noise.** The same air molecules that cause the damping $b$ also kick the beam at random.
This is not a coincidence: the fluctuation–dissipation theorem says that every damper is also a noise source. The random
force has a flat spectral density
$$F_n=\sqrt{4k_BT\,b}\quad[\text{N}/\sqrt{\text{Hz}}],$$
exactly like the Johnson noise $\sqrt{4k_BTR}$ of a resistor in [A8](A8-noise-resolution-calibration-and-drift.md). Its
total effect obeys equipartition: $\tfrac12k\langle x^2\rangle=\tfrac12k_BT$, so the rms thermal motion is
$x_{\text{rms}}=\sqrt{k_BT/k}$. A soft AFM cantilever ($k=0.1$ N/m) jiggles by 0.20 nm rms at room temperature, about one
atom's size. This sets the floor for every MEMS sensor (B1's "price of small"). To lower it, make $b$ small (high $Q_f$,
vacuum packaging) or the mass large.

**Mass sensing by frequency shift.** Add a tiny mass $\Delta m$ to a resonator and its pitch drops. Since
$f_0\propto m^{-1/2}$, a small relative change obeys
$$\frac{\Delta f}{f_0}=-\frac{\Delta m}{2m}.$$
Frequency is the easiest quantity in physics to measure precisely (counting cycles against a quartz clock), so this turns a
resonator into an extraordinarily sensitive balance. A **quartz crystal microbalance (QCM)** oscillates at 5 MHz in a
thickness-shear mode and detects nanograms per cm² of film ($\Delta f/f_0=-\Delta m/m_q$, the Sauerbrey equation, where $m_q$
is the quartz mass per area). An AFM cantilever with a virus stuck to its tip shifts by hertz. Nanomechanical resonators
weigh single proteins. High $Q_f$ helps again, because a narrow peak makes a small shift easy to see.

**The electrical analogy.** A series RLC circuit obeys $L_{\text{ind}}\ddot q+R\dot q+q/C=V(t)$: the same equation, with
$m\leftrightarrow L_{\text{ind}}$, $b\leftrightarrow R$, $k\leftrightarrow1/C$, $F\leftrightarrow V$, $x\leftrightarrow q$ and
$\dot x\leftrightarrow I$. So $\omega_0=1/\sqrt{L_{\text{ind}}C}$ and $Q_f=\tfrac1R\sqrt{L_{\text{ind}}/C}$. Engineers draw MEMS
resonators as RLC circuits ("motional" parameters) and simulate the mechanics and the electronics together.

## Intuitive examples

1. **A reference cantilever**, silicon, $L=200$ µm, $w=20$ µm, $t=2$ µm, $E=169$ GPa, $\rho=2330$ kg/m³:
   $k=Ewt^3/(4L^3)=0.8450$ N/m and $f_0=68.79$ kHz. Its mass is $1.864\times10^{-11}$ kg (19 ng) and $m_{\text{eff}}=4.523\times10^{-12}$ kg (0.2427 of it).
2. **Push on it** with $F=1$ µN (the weight of 0.1 mg): the tip moves 1.183 µm, the root stress is 15.0 MPa and the
   surface strain 88.8 µε. A piezoresistor with gauge factor 100 would change by about 0.9%.
3. **The $t^3$ effect.** Make it 4 µm thick: $k=6.760$ N/m (×8) and $f_0=137.6$ kHz (×2). Make it 400 µm long instead:
   $k=0.1056$ N/m (÷8) and $f_0=17.20$ kHz (÷4).
4. **AFM cantilevers.** Contact mode: 450 × 50 × 2 µm gives $k=0.185$ N/m and $f_0=14$ kHz (soft, so it does not scratch
   the sample). Tapping mode: 125 × 30 × 4 µm gives $k=41.5$ N/m and $f_0=352$ kHz (stiff and fast).
5. **One beam, four springs** (the same 200 × 20 × 2 µm beam): cantilever $3EI_A/L^3=0.845$ N/m, guided 3.380 N/m, folded
   (4 folds) 6.760 N/m, fixed-fixed loaded in the middle 54.08 N/m.
6. **Ringing.** With $Q_f=100$ in air, the reference cantilever's peak is $68.79/100=688$ Hz wide and it rings down with
   $\tau=2Q_f/\omega_0=0.463$ ms. The 32 768 Hz quartz tuning fork in a watch has $Q_f\approx10^5$: a 0.328 Hz wide peak and
   $\tau=0.97$ s. At $Q_f=10$, driving at half the resonance gives $X=1.3304\,F_0/k$ (phase 3.8°); at twice the resonance,
   $0.3326\,F_0/k$ (phase 176.2°).
7. **Brownian motion.** Reference cantilever with $Q_f=100$: $b=\sqrt{km_{\text{eff}}}/Q_f=1.955\times10^{-8}$ N·s/m, force noise
   $\sqrt{4k_BTb}=17.9$ fN/√Hz, $x_{\text{rms}}=\sqrt{k_BT/k}=0.070$ nm. At the peak the motion density is
   $Q_f F_n/k=2.12$ pm/√Hz.
8. **Weighing.** Add 1 pg to the reference cantilever ($m_{\text{eff}}=4523$ pg): $\Delta f/f_0=-1.11\times10^{-4}$, so
   $\Delta f=-7.60$ Hz. A 5 MHz QCM (quartz 334 µm thick, 88.44 mg/cm²) shifts by $-5.65$ Hz for 100 ng/cm², a sensitivity
   of 56.5 Hz·cm²/µg.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $\sigma=E\varepsilon$ | Hooke's law | $\sigma$ stress, $\varepsilon$ strain, $E$ Young's modulus (Si ⟨110⟩ 169 GPa) |
| $I_A=wt^3/12$ | second moment of area of a rectangle | $w$ width, $t$ thickness in the bending direction |
| $k=\dfrac{3EI_A}{L^3}=\dfrac{Ewt^3}{4L^3}$ | cantilever tip stiffness | $L$ length |
| $\sigma_{\max}=\dfrac{6FL}{wt^2}$ | surface stress at the root | $F$ tip force |
| $k_{\text{guided}}=\dfrac{12EI_A}{L^3}$, $k_{\text{folded}}=\dfrac{24EI_A}{L^3}$, $k_{\text{ff}}=\dfrac{192EI_A}{L^3}$ | other springs; series adds $1/k$, parallel adds $k$ | ff = fixed-fixed, centre load |
| $m\ddot x+b\dot x+kx=F$ | mass–spring–damper | $m$ mass, $b$ damping |
| $\omega_0=\sqrt{k/m}$, $Q_f=\sqrt{km}/b$ | natural frequency, quality factor | $f_0=\omega_0/2\pi$ |
| $f_0=0.1615\,\dfrac{t}{L^2}\sqrt{\dfrac E\rho}$ | first mode of a cantilever | $\rho$ density |
| $X=\dfrac{F_0/k}{\sqrt{(1-r^2)^2+(r/Q_f)^2}}$, $\tan\varphi=\dfrac{r/Q_f}{1-r^2}$ | driven amplitude and phase lag | $r=\omega/\omega_0$ |
| $X(\omega_0)=Q_fF_0/k$, $\Delta f=f_0/Q_f$ | resonant gain and bandwidth | |
| $F_n=\sqrt{4k_BTb}$, $x_{\text{rms}}=\sqrt{k_BT/k}$ | thermomechanical noise | $k_B$ Boltzmann, $T$ temperature |
| $\Delta f/f_0=-\Delta m/(2m)$ | mass sensing | $\Delta m$ added mass |
| $m,b,k,F\leftrightarrow L_{\text{ind}},R,1/C,V$ | the RLC analogy | |

## Applications

| World | Beams, springs and resonators | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | QCM and cantilever gas sensors coated with a polymer sniff ethylene (the ripening hormone) and plant volatiles; a mass uptake of ng lowers $f_0$ | storage rooms can catch over-ripening fruit early; $\Delta f/f_0=-\Delta m/2m$ is the transfer function |
| 🧬 Biology & human health | AFM cantilevers ($k\approx0.1$ N/m) image cells and measure their stiffness; resonant cantilevers with antibodies weigh bound viruses; hearing-aid microphones are tiny membranes | $x_{\text{rms}}=\sqrt{k_BT/k}$ (0.2 nm) sets the force floor of single-molecule experiments |
| 🌍 Environment | resonant particulate (PM2.5) sensors weigh the dust that lands on a microbalance; QCMs monitor film deposition and humidity | a QCM's 56.5 Hz·cm²/µg makes nanograms visible |
| 🤖 Robotics & drones | the folded springs of IMU accelerometers and gyroscopes; gyroscopes are driven at resonance with high $Q_f$ in vacuum | stiffness sets the sensitivity $x=ma/k$; $Q_f$ sets the gyro's gain and its noise ([B4](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md)) |
| 🚗 Cars | airbag accelerometers use soft folded springs with near-critical damping ($Q_f\approx0.5$–1), so they do not ring after a bump | a resonance peak would turn road vibration into false crash signals; damping keeps the response flat |
| 📱 Phones & photography | MEMS timing resonators replace quartz; microphone membranes and OIS actuators are springs; FBAR filters are acoustic resonators that pick out the radio bands | resonance frequency and $Q_f$ decide the clock accuracy and the filter sharpness |
| 🏠 Home & household | the quartz tuning fork (32 768 Hz, $Q_f\approx10^5$) in every clock; the cantilever load cell in a kitchen scale ([A1](A1-what-a-sensor-is-transduction-and-the-measurement-chain.md)) | the same $k=Ewt^3/4L^3$ at the cm scale and the same $Q_f$ at the µm scale |

## Derivation

**(a) Beam bending (Euler–Bernoulli).**
1. A tip force $F$ makes a bending moment $M(x)=F(L-x)$ at distance $x$ from the clamp.
2. Bending curves the beam: curvature $=M/(EI_A)$, so $\dfrac{d^2z}{dx^2}=\dfrac{F(L-x)}{EI_A}$, with $z$ the deflection.
3. Integrate twice with $z(0)=z'(0)=0$ (clamped): $z(x)=\dfrac{F}{6EI_A}(3Lx^2-x^3)$.
4. At the tip: $z(L)=\dfrac{FL^3}{3EI_A}$, so $k=\dfrac{3EI_A}{L^3}$; with $I_A=wt^3/12$, $k=\dfrac{Ewt^3}{4L^3}$.
5. Stress at the surface ($t/2$ from the middle): $\sigma=\dfrac{M\,t/2}{I_A}=\dfrac{6F(L-x)}{wt^2}$, largest at the root.

**(b) Springs in series and parallel.**
1. Parallel: the same $x$, forces add: $k=k_1+k_2$.
2. Series: the same $F$, displacements add: $1/k=1/k_1+1/k_2$.
3. Folded flexure: two guided beams in series ($12EI_A/L^3\div2$), four folds in parallel: $4\times6EI_A/L^3=24EI_A/L^3$.

**(c) Free vibration.**
1. With $F=0$ and $b=0$: $m\ddot x=-kx$. Try $x=X\cos\omega t$: $-m\omega^2X=-kX$ ⇒ $\omega_0=\sqrt{k/m}$.
2. With damping, try $x=e^{st}$: $ms^2+bs+k=0$ ⇒ $s=-\dfrac{b}{2m}\pm i\,\omega_0\sqrt{1-\tfrac{1}{4Q_f^2}}$.
3. The amplitude decays as $e^{-bt/2m}=e^{-\omega_0t/(2Q_f)}$: time constant $\tau=2Q_f/\omega_0$.

**(d) Forced response.**
1. Drive $F=F_0e^{i\omega t}$ (real part understood); try $x=\hat Xe^{i\omega t}$, so $\dot x=i\omega x$ and $\ddot x=-\omega^2x$.
2. Substitute: $(k-m\omega^2+i\,b\omega)\hat X=F_0$.
3. Divide by $k$, using $m/k=1/\omega_0^2$ and $b\omega/k=r/Q_f$: $\hat X=\dfrac{F_0/k}{1-r^2+i\,r/Q_f}$.
4. Magnitude: $X=\dfrac{F_0/k}{\sqrt{(1-r^2)^2+(r/Q_f)^2}}$; phase lag: $\tan\varphi=\dfrac{r/Q_f}{1-r^2}$.
5. At $r=1$: $X=Q_fF_0/k$, $\varphi=90°$. The half-power points satisfy $\lvert1-r^2\rvert\approx r/Q_f$ ⇒ $\Delta r\approx1/Q_f$, so $\Delta f=f_0/Q_f$.

**(e) Thermal noise.**
1. Equipartition: each quadratic energy term holds $\tfrac12k_BT$ on average, so $\tfrac12k\langle x^2\rangle=\tfrac12k_BT$.
2. Fluctuation–dissipation: the damper $b$ comes with a white random force of density $4k_BTb$ (N²/Hz).
3. Check: integrating $\lvert X(\omega)/F\rvert^2\cdot4k_BTb$ over all frequencies gives exactly $k_BT/k$.

**(f) Mass sensing.**
1. $f_0=\tfrac1{2\pi}\sqrt{k/m}$, so $\ln f_0=\text{const}-\tfrac12\ln m$.
2. Differentiate: $\dfrac{df_0}{f_0}=-\dfrac12\dfrac{dm}{m}$, so $\dfrac{\Delta f}{f_0}\approx-\dfrac{\Delta m}{2m}$ for small $\Delta m$.

## Worked check

A cantilever with $L=300$ µm, $w=10$ µm, $t=3$ µm in ⟨110⟩ silicon:
- $I_A=wt^3/12=10\times27/12\times10^{-24}=2.25\times10^{-23}$ m⁴.
- $k=3EI_A/L^3=3\times169\times10^9\times2.25\times10^{-23}/(2.7\times10^{-11})=0.4225$ N/m.
- $f_0=0.16154\times(3\times10^{-6})/(9\times10^{-8})\times8517=45.86$ kHz; $m=\rho Lwt=2.097\times10^{-11}$ kg; $m_{\text{eff}}=k/\omega_0^2=5.089\times10^{-12}$ kg.
- A 0.2 µN tip force bends it by $0.2\times10^{-6}/0.4225=0.473$ µm, with root stress $6FL/(wt^2)=4.00$ MPa (23.7 µε).
- Driven at resonance with $F_0=1$ nN and $Q_f=50$: $X=Q_fF_0/k=118.34$ nm; bandwidth $f_0/Q_f=917$ Hz.
- Add 10 pg: $\Delta f=-f_0\,\Delta m/(2m_{\text{eff}})=-45.1$ Hz.
- RLC twin: $L_{\text{ind}}=1$ mH, $C=1$ µF, $R=10$ Ω gives $f_0=5033$ Hz and $Q_f=3.16$.

All numbers come from `scripts/checks/B3_check.py`.

## Whiteboard plan

- **Panel 1: the diving board.** Draw a clamped beam, a tip force $F$, the bent shape. Write $k=Ewt^3/(4L^3)$ and circle the
  $t^3$ and $L^3$. Say: "Twice as thick, eight times as stiff."
- **Panel 2: where it hurts.** Under the beam draw the moment $M=F(L-x)$ as a triangle, largest at the clamp; write
  $\sigma=6FL/(wt^2)$ and draw a piezoresistor at the root.
- **Panel 3: springs as resistors.** Cantilever, guided beam, fixed-fixed beam, folded spring, with $3,12,24,192\times EI_A/L^3$.
  Series adds $1/k$; parallel adds $k$.
- **Panel 4: the box.** Mass, spring, dashpot; write $m\ddot x+b\dot x+kx=F$, $\omega_0=\sqrt{k/m}$, $Q_f=\sqrt{km}/b$.
- **Panel 5: the peak.** Log-log amplitude vs frequency: flat at $F_0/k$, peak $Q_fF_0/k$, slope $-2$ after. Under it the phase
  going 0° → 90° → 180°. Mark "accelerometers live here (left)" and "resonant sensors live here (peak)".
- **Panel 6: the scale and the noise.** $\Delta f/f_0=-\Delta m/2m$ with a virus on a cantilever; next to it $x_{\text{rms}}=\sqrt{k_BT/k}$ and
  the RLC twin.

## Common mistakes and where the intuition breaks

- **Mixing up $w$ and $t$.** $t$ is the dimension *in the bending direction*, and it is cubed. For an in-plane MEMS spring that
  bends sideways, the cubed dimension is the narrow, lithographically drawn width, not the film thickness.
- **Using the full mass for $f_0$.** A cantilever's tip moves, but its root does not; only about 24% of the mass "counts".
  For a proof mass on light springs, the proof mass dominates and $m$ is fine.
- **Forgetting that silicon is anisotropic.** $E$ is 169 GPa along ⟨110⟩ but 130 GPa along ⟨100⟩, a 30% error in $k$ if you
  pick the wrong one.
- **Assuming linear forever.** The formulas hold for deflections small compared with the thickness. A fixed-fixed beam
  stretches when it bends a lot and stiffens (Duffing behaviour); residual stress shifts $f_0$; electrostatic forces soften
  the spring ([B4](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md)).
- **"High $Q_f$ is always good."** A gyroscope or a mass balance wants high $Q_f$; an accelerometer does not, because a sharp peak
  rings and amplifies vibration. Accelerometers are designed near $Q_f\approx0.7$ for a flat response.
- **Ignoring thermal noise.** The floor $\sqrt{4k_BTb}$ is fundamental; better electronics cannot remove it. Only less damping,
  more mass or a lower temperature can.

## Remember

**"$k=Ewt^3/4L^3$, $\omega_0=\sqrt{k/m}$, peak $=Q_f\times$ static; below the peak it is a spring, at the peak a resonator, and mass shifts the pitch by $-\Delta m/2m$."**

## Self-test

1. You need a cantilever 4 times stiffer without changing its length or width. How much thicker must it be, and what happens to $f_0$?
   <details><summary>Answer</summary>k ∝ t³, so t must grow by 4^(1/3) ≈ 1.59. The cantilever frequency is f0 ∝ t / L², so it also rises by 1.59×.</details>
2. A resonator at 100 kHz has Q_f = 10 000. How wide is its resonance peak, and how long does it ring after the drive stops?
   <details><summary>Answer</summary>Bandwidth Δf = f0/Q_f = 10 Hz. Ring-down time constant τ = 2Q_f/ω0 = 20 000 / (2π × 100 000) ≈ 32 ms.</details>
3. A 1 MHz resonator with an effective mass of 1 ng shifts by −5 Hz when a sample lands on it. What mass landed?
   <details><summary>Answer</summary>Δm = −2m Δf/f0 = 2 × 1 ng × 5/10⁶ = 10⁻⁵ ng = 10 fg (femtograms).</details>

**Next:** [B4 MEMS inertial sensors: accelerometers and gyroscopes](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md): put a proof mass on these springs, read its motion with capacitors, and you have the sensor that tells a phone which way is up.
