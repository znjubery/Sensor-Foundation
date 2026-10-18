# A5. Optical sensors: photodiodes, image sensors and LiDAR

> **Connects:** builds on [A1 What a sensor is](A1-what-a-sensor-is-transduction-and-the-measurement-chain.md), [A3 Capacitive sensors](A3-capacitive-sensors.md) · used by [A7 Signal conditioning](A7-signal-conditioning-amplifiers-filters-and-adcs.md), [A8 Noise, resolution, calibration and drift](A8-noise-resolution-calibration-and-drift.md), [A9 Sensor fusion](A9-sensor-fusion-and-the-kalman-filter.md), [C5 Lab-on-a-chip](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md)

## Hook — rain filling buckets on a grid

Put a few dozen buckets on a lawn in a neat grid and leave them out during a shower. Afterwards, the water level in each
bucket tells you how hard it rained at that spot. Buckets under a tree have less; buckets in the open have more. Leave
them out longer and every level rises. Leave them out much too long and the buckets overflow, and then you can no longer
tell a heavy shower from a light one. And if you only leave them out for a few seconds, each bucket catches a handful of
drops and the levels look random, even where the rain was perfectly even.

**That is a camera sensor.** Each pixel is a bucket, the raindrops are photons, and the water is electrons. Everything
important about a photo (exposure, graininess in the dark, blown-out skies) is in that picture. The same
light-into-electrons trick also measures your blood oxygen through your fingertip, and when we time how long a flash of light takes
to come back, it measures distance: the LiDAR on a self-driving car or the depth sensor on a phone.

## The idea in plain words

**Light comes in packets.** Light of wavelength $\lambda$ arrives as photons, each carrying a fixed energy
$$E_{\text{ph}}=\frac{h_{\text P}\,c_0}{\lambda},$$
where $h_{\text P}=6.626\times10^{-34}$ J·s is Planck's constant and $c_0=2.998\times10^8$ m/s the speed of light. Shorter
wavelength means more energy: blue light at $450$ nm carries $2.76$ eV per photon, red at $650$ nm $1.91$ eV ($1$ eV
$=1.602\times10^{-19}$ J, the energy an electron gains across one volt). A handy form is
$E_{\text{ph}}\,[\text{eV}]=1239.8/\lambda\,[\text{nm}]$.

**A photodiode turns photons into electrons.** In a semiconductor such as silicon, electrons are bound unless they get
at least the **band-gap energy** $E_g$ ($1.12$ eV for silicon). A photon with more energy than that can free one electron
(and leave a "hole" behind). A photon with less energy passes straight through. So silicon is blind beyond
$\lambda=h_{\text P}c_0/E_g\approx1107$ nm: it sees visible light and the near infrared, but not the $1550$ nm used by
some LiDARs, which need germanium or InGaAs detectors. A **photodiode** is a p–n junction with a built-in electric field
that sweeps each freed electron and hole apart before they can recombine, so they flow as a current.

**Responsivity: amps per watt.** Not every photon frees an electron that reaches the contacts; the fraction that does is
the **quantum efficiency** $\eta$ (between 0 and 1). An optical power $P_{\text{opt}}$ delivers $P_{\text{opt}}/E_{\text{ph}}$ photons
per second, and each successful photon adds one elementary charge $q_e$ to the current. So the photocurrent is
$I=\mathcal R\,P_{\text{opt}}$ with the **responsivity**
$$\mathcal R=\frac{\eta\,q_e\,\lambda}{h_{\text P}c_0}\ \ \text{(in A/W)}.$$
Notice the $\lambda$: at longer wavelengths each photon carries less energy, so one watt contains more photons and gives
more current, right up to the band-gap cutoff, where $\eta$ collapses. Silicon peaks around $0.6$ A/W near $900$ nm. The
current is beautifully linear in light power over many decades, which is why photodiodes are the standard light meter.

**An image sensor is millions of photodiodes with buckets.** In a CMOS image sensor each pixel's photodiode is reset to
a voltage and then, during the **exposure time** $t_{\exp}$, the freed electrons collect on its tiny capacitance (the
**well**). At the end, a transistor in the pixel reads the voltage, and an ADC in each column turns it into a number
([A7](A7-signal-conditioning-amplifiers-filters-and-adcs.md)). If photons arrive at a rate $\Phi$ on the pixel, the well
collects on average
$$N_e=\eta\,\Phi\,t_{\exp}$$
electrons. Twice the exposure, twice the electrons, twice the brightness. The well capacitance is about a femtofarad, so
by $q=CV$ from [A3](A3-capacitive-sensors.md) a few thousand electrons swing the voltage by about a volt. The largest
number of electrons the well can hold is the **full-well capacity** (a few thousand for a phone pixel, tens of
thousands for a big camera pixel). Above that the pixel **saturates**: the sky turns pure white.

```viz
a5-pixel-array-3d
```

**Why dim photos are grainy: shot noise.** Photons arrive at random times, like raindrops, so even under perfectly even
light the count in a pixel fluctuates from frame to frame and from pixel to pixel. The counts follow **Poisson
statistics**, whose standard deviation is the square root of the mean: $\sigma_{N_e}=\sqrt{N_e}$. This is not a flaw of the
electronics; it is the graininess of light itself. The signal-to-noise ratio is therefore
$$\mathrm{SNR}=\frac{N_e}{\sqrt{N_e}}=\sqrt{N_e}.$$
$100$ electrons give $\mathrm{SNR}=10$ (each pixel is uncertain by 10%); $10\,000$ electrons give $\mathrm{SNR}=100$. The
only cure is **more photons**: a bigger pixel, a wider lens aperture, a longer exposure, or averaging several frames
(night mode, which uses the $1/\sqrt M$ rule of [A8](A8-noise-resolution-calibration-and-drift.md)). The electronics
add a little **read noise** on top (about $1$–$3$ electrons in a modern sensor), which matters only in the deepest shadows.

**Dynamic range.** The brightest thing a pixel can record is a full well; the dimmest is about the read noise. Their
ratio is the **dynamic range**, quoted in dB ($20\log_{10}$) or in photographic "stops" (factors of 2, $\log_2$). HDR modes
stretch it by combining short and long exposures.

**Colour from a mosaic of filters.** A photodiode counts photons but cannot tell their colour. So each pixel gets a tiny
coloured filter on top, in the **Bayer pattern**: in every 2×2 block, two green, one red, one blue (green twice because
our eyes are most sensitive to green, and green carries most of the detail). The camera then estimates the two missing
colours at every pixel from its neighbours (**demosaicing**). The price: a filter throws away about two thirds of the light.

**Measuring distance with light: time of flight.** Fire a short laser pulse at $t=0$; it bounces off an object and a
fast photodiode next to the laser catches the echo after a time $t$. The light went there and back, so
$$d=\frac{c_0\,t}{2}.$$
Light is fast: it covers $30$ cm per nanosecond, so a target $100$ m away answers after $667$ ns. Because the clock
ticks in steps $\Delta t$, distance comes in steps $\Delta d=c_0\Delta t/2$: $1$ ns of timing resolution means $15$ cm.
Car LiDARs use single-photon avalanche diodes (SPADs) and time-to-digital converters with tens of picoseconds of
resolution.

**Phase time of flight.** Phone depth cameras, robot vacuums and gesture sensors often use a cheaper trick: modulate
the light's brightness as a sine wave at frequency $f_{\text{mod}}$ and measure the **phase shift** $\phi$ of the returning
wave. The round trip $2d$ corresponds to a delay $\phi/(2\pi f_{\text{mod}})$, so $d=c_0\phi/(4\pi f_{\text{mod}})$. Every
pixel of a special image sensor measures its own phase, giving a whole depth image at once. The catch: a phase repeats
every $2\pi$, so distances beyond $c_0/(2f_{\text{mod}})$ wrap around (the **ambiguity range**).

**LiDAR and point clouds.** A scanning LiDAR fires pulses in many directions: a spinning head with a stack of lasers at
different elevation angles $\theta_e$, sweeping the azimuth $\varphi$. Each echo gives a distance $d$, and the direction
plus distance give a point $(x,y,z)=d\,(\cos\theta_e\sin\varphi,\ \cos\theta_e\cos\varphi,\ \sin\theta_e)$. Millions of
points per second form a **point cloud**: a 3D sketch of the street made of dots. The car's software finds the ground,
the kerbs, pedestrians and cars in those dots, and fuses them with cameras and radar ([A9](A9-sensor-fusion-and-the-kalman-filter.md)).

```viz
a5-tof-3d
```

**Light through the body: pulse oximetry and PPG.** Shine red and infrared light into a fingertip or wrist and measure what
comes back with a photodiode. Tissue, bone and venous blood absorb a steady amount (the **DC** level). With every
heartbeat the arteries swell, a little more blood sits in the light path, and the detected light dips by about $1$–$2\%$
(the **AC** part). The rhythm of the dips is the **photoplethysmogram** (PPG); the spacing of the peaks gives the heart
rate. Oxygen-rich haemoglobin absorbs little red and more infrared; oxygen-poor haemoglobin absorbs a lot of red. So the
**ratio of ratios** $R=(\mathrm{AC}/\mathrm{DC})_{\text{red}}/(\mathrm{AC}/\mathrm{DC})_{\text{IR}}$ tracks the oxygen
saturation. Dividing AC by DC cancels skin colour, finger thickness and LED brightness, the "ratios beat absolutes" rule.
The final step is an **empirical calibration line**, often close to $\mathrm{SpO_2}\approx110-25R$ (in %), measured on
volunteers against blood samples.

```viz
a5-ppg
```

## Intuitive examples

1. **Photon energies.** $450$ nm: $2.76$ eV; $550$ nm: $2.25$ eV ($3.612\times10^{-19}$ J); $850$ nm: $1.46$ eV;
   $1550$ nm: $0.80$ eV. Silicon's $1.12$ eV gap gives a cutoff of $1239.8/1.12=1107$ nm. Germanium ($0.66$ eV) reaches
   $1879$ nm and InGaAs ($0.75$ eV) $1653$ nm, which is why $1550$ nm LiDARs need them.
2. **A photodiode in a smartwatch.** At $850$ nm with $\eta=0.8$, $\mathcal R=0.548$ A/W (a perfect detector, $\eta=1$, would
   give $0.686$ A/W). $P_{\text{opt}}=10$ µW returning from the skin gives $I=5.48$ µA, carried by $4.28\times10^{13}$ photons
   per second.
3. **A phone pixel indoors.** A $1.4$ µm pixel, $0.1$ W/m² of green light ($550$ nm) at the sensor, $t_{\exp}=10$ ms:
   $5427$ photons arrive, $\eta=0.6$ turns them into $N_e=3256$ electrons, shot noise $\sqrt{N_e}=57$, so $\mathrm{SNR}=57$
   ($35.1$ dB). Cut the light 100-fold (a dim room) and the SNR drops tenfold, to about $5.7$: visible grain.
4. **The shot-noise ladder.** $N_e=10$: SNR $3.2$ (relative noise $31.6\%$); $100$: SNR $10$ ($10\%$); $1000$: $31.6$
   ($3.2\%$); $10\,000$: $100$ ($1\%$). Every 100× more light buys only 10× better SNR.
5. **Full well and dynamic range.** Full well $6000$ e⁻: the best possible SNR is $\sqrt{6000}=77.5$ ($37.8$ dB). With
   $2$ e⁻ read noise, the dynamic range is $6000/2=3000$, i.e. $69.5$ dB or $11.6$ stops. At $10$ electrons the read noise
   already pulls the SNR from $3.2$ to $10/\sqrt{10+4}=2.67$. The well capacitance: $6000$ electrons over $1$ V is $0.96$ fF.
6. **A 12-megapixel Bayer sensor** has $6$ million green, $3$ million red and $3$ million blue pixels.
7. **LiDAR timing.** $1$ m away: echo after $6.67$ ns; $100$ m: $667.13$ ns; $200$ m: $1334.26$ ns. Timing steps of $1$ ns,
   $100$ ps and $66.7$ ps give distance steps of $14.99$ cm, $1.50$ cm and $1.00$ cm.
8. **Phase ToF in a phone.** With $f_{\text{mod}}=20$ MHz the ambiguity range is $c_0/(2f_{\text{mod}})=7.49$ m; a phase of
   $90°$ means $d=1.874$ m; $1°$ of phase noise is $2.08$ cm of depth noise.
9. **A 64-channel spinning LiDAR** with $2048$ azimuth steps at $10$ revolutions per second makes
   $64\times2048\times10=1.31$ million points per second. The azimuth step is $0.176°$, so at $50$ m neighbouring points
   are $15.3$ cm apart: a child's arm might fall between two of them.
10. **Pulse oximetry.** AC/DC of $1.0\%$ in red and $2.0\%$ in infrared gives $R=0.50$ and $\mathrm{SpO_2}\approx97.5\%$
    (healthy). $R=0.7$ gives $92.5\%$; $R=1.0$ gives $85\%$ (dangerously low). Peaks $0.8$ s apart mean $75$ beats per minute.

## The key equations

| Equation | Meaning | Symbols |
|---|---|---|
| $E_{\text{ph}}=h_{\text P}c_0/\lambda$ | photon energy; in eV $=1239.8/\lambda$[nm] | $h_{\text P}$ Planck, $c_0$ speed of light |
| $\lambda_{\text{cut}}=h_{\text P}c_0/E_g$ | longest wavelength a detector sees | $E_g$ band gap (Si 1.12 eV → 1107 nm) |
| $I=\mathcal R\,P_{\text{opt}}$, $\mathcal R=\eta q_e\lambda/(h_{\text P}c_0)$ | photocurrent and responsivity | $\eta$ quantum efficiency, $q_e$ elementary charge |
| $N_e=\eta\,\Phi\,t_{\exp}$ | electrons collected in one pixel | $\Phi$ photon rate on the pixel, $t_{\exp}$ exposure |
| $\sigma_{N_e}=\sqrt{N_e}$, $\mathrm{SNR}=\sqrt{N_e}$ | shot noise (Poisson) | with read noise $\sigma_r$: $\mathrm{SNR}=N_e/\sqrt{N_e+\sigma_r^2}$ |
| $\mathrm{DR}=N_{\text{full}}/\sigma_r$ | dynamic range; dB $=20\log_{10}$, stops $=\log_2$ | $N_{\text{full}}$ full-well capacity |
| $d=c_0\,t/2$, $\Delta d=c_0\,\Delta t/2$ | pulsed time of flight and its resolution | $t$ round-trip time |
| $d=\dfrac{c_0\,\phi}{4\pi f_{\text{mod}}}$, $d_{\max}=\dfrac{c_0}{2f_{\text{mod}}}$ | phase time of flight and its ambiguity range | $\phi$ phase shift, $f_{\text{mod}}$ modulation |
| $R=\dfrac{(\mathrm{AC}/\mathrm{DC})_{\text{red}}}{(\mathrm{AC}/\mathrm{DC})_{\text{IR}}}$, $\mathrm{SpO_2}\approx110-25R$ | pulse oximetry (empirical calibration) | AC pulse part, DC steady part |

## Applications

| World | Photodiodes, image sensors and LiDAR | What it tells you |
|---|---|---|
| 🌱 Plants & agriculture | drone multispectral cameras (red and near-infrared bands → NDVI); chlorophyll-fluorescence photodiodes; LiDAR scans of orchards and forests | which part of a field is stressed; how well photosynthesis runs; canopy height, volume and biomass |
| 🧬 Biology & human health | PPG in smartwatches; finger-clip pulse oximeters; fluorescence detectors in PCR machines and lab-on-a-chip; endoscope cameras | heart rate and its variability; blood oxygen; how much DNA or a marker is present; images inside the body |
| 🌍 Environment | optical particle counters (PM2.5); turbidity sensors in rivers; NDIR CO₂ sensors (infrared absorption); atmospheric LiDAR | fine dust in the air; murky water after a storm; CO₂ in ppm; clouds and aerosol layers |
| 🤖 Robotics & drones | LiDAR for mapping; optical-flow cameras under drones; ToF proximity sensors in robot fingers; line-following photodiodes | a 3D map to avoid obstacles; drift over the ground; distance to an object before grasping; the path |
| 🚗 Cars | roof and bumper LiDAR; camera-based lane keeping; rain sensors on the windscreen (infrared reflection); automatic headlights | distances to every object; lane position; when to start the wipers; when to switch on lights |
| 📱 Phones & photography | the CMOS camera (millions of buckets); ToF and dot-projector depth sensors for face unlock and portrait blur; ambient-light and proximity sensors | the photo, its exposure and grain; depth for focus and security; screen brightness; screen off at your ear |
| 🏠 Home & household | optical smoke detectors (scattered light); IR remote-control receivers; robot-vacuum LiDAR; solar-garden lights that switch at dusk | smoke particles in the chamber; which button you pressed; the floor plan; whether it is dark |

## Derivation

**(a) Responsivity.**
1. Photon energy: $E_{\text{ph}}=h_{\text P}c_0/\lambda$.
2. Photons per second in a beam of power $P_{\text{opt}}$: $\Phi=P_{\text{opt}}/E_{\text{ph}}=P_{\text{opt}}\lambda/(h_{\text P}c_0)$.
3. Electrons per second that reach the contacts: $\eta\,\Phi$.
4. Current: $I=q_e\,\eta\,\Phi=\dfrac{\eta\,q_e\,\lambda}{h_{\text P}c_0}\,P_{\text{opt}}=\mathcal R\,P_{\text{opt}}$.
5. Numerically $\mathcal R=\eta\,\lambda[\text{nm}]/1239.8$ A/W, because $h_{\text P}c_0/q_e=1239.8$ V·nm.

**(b) Shot noise.**
1. Split the exposure into many tiny time slices; in each, an electron is generated with a small probability $p$, independently.
2. The count is a sum of $n$ independent yes/no events: mean $np=N_e$, variance $np(1-p)\approx np=N_e$ (as $p\to0$; this is the Poisson limit).
3. Standard deviation $\sigma_{N_e}=\sqrt{N_e}$.
4. $\mathrm{SNR}=N_e/\sigma_{N_e}=\sqrt{N_e}$. Doubling the light improves SNR only by $\sqrt2\approx1.41$.
5. Independent noises add in variance: with read noise $\sigma_r$, total variance $N_e+\sigma_r^2$, so $\mathrm{SNR}=N_e/\sqrt{N_e+\sigma_r^2}$.

**(c) Pulsed time of flight.**
1. Out and back the light travels $2d$ at speed $c_0$: $c_0t=2d$, so $d=c_0t/2$.
2. A timing error $\delta t$ gives a distance error $\delta d=c_0\,\delta t/2$; the same holds for the clock's step.
3. Pulses must not overlap: the next pulse leaves after the farthest echo, so the pulse rate is at most $c_0/(2d_{\max})$.

**(d) Phase time of flight.**
1. The light brightness is modulated as $\cos(2\pi f_{\text{mod}}t)$.
2. The echo is delayed by $2d/c_0$, which is a phase lag $\phi=2\pi f_{\text{mod}}\cdot2d/c_0$.
3. Solve: $d=c_0\phi/(4\pi f_{\text{mod}})$.
4. $\phi$ is only known modulo $2\pi$, so distances repeat every $c_0/(2f_{\text{mod}})$. Two modulation frequencies resolve the ambiguity.

**(e) Why the ratio of ratios works (Beer–Lambert).**
1. Light through tissue: $I=I_0\,e^{-\mu_{\text a}\ell_p}$, with absorption coefficient $\mu_{\text a}$ and path length $\ell_p$.
2. A heartbeat adds a small extra path $\Delta\ell_p$ of arterial blood: $I\to I\,e^{-\mu_{\text{art}}\Delta\ell_p}\approx I(1-\mu_{\text{art}}\Delta\ell_p)$.
3. So $\mathrm{AC}/\mathrm{DC}\approx\mu_{\text{art}}\Delta\ell_p$: the unknown $I_0$ (LED, skin) has cancelled.
4. The ratio for red and infrared: $R=\mu_{\text{art,red}}/\mu_{\text{art,IR}}$; the unknown $\Delta\ell_p$ cancels too.
5. $R$ depends only on the blood's mix of oxy- and deoxy-haemoglobin, i.e. on $\mathrm{SpO_2}$. Light scattering makes the exact relation messy, hence the empirical calibration line.

## Worked check

**A LiDAR echo.** An echo returns after $t=250.2$ ns. Distance: $d=c_0t/2=2.998\times10^8\times250.2\times10^{-9}/2=37.50$ m.

**How strong is that echo?** The $940$ nm detector has $\eta=0.5$:
- $\mathcal R=\eta\lambda/1239.8=0.5\times940/1239.8=0.379$ A/W.
- A returning power of $2$ nW gives $I=0.379\times2\times10^{-9}=0.758$ nA.
- In a $5$ ns pulse window that is $47$ photons, of which $\eta=0.5$ makes about $24$ electrons, so the shot-noise SNR of one
  echo is $\sqrt{24}\approx4.9$. That is why LiDARs use avalanche or single-photon detectors that multiply each electron,
  and fire many pulses per point. (All numbers from `scripts/checks/A5_check.py`.)

## Whiteboard plan

- **Panel 1 — photons.** Draw a wavy arrow labelled $\lambda$ and a little packet labelled $E_{\text{ph}}=h_{\text P}c_0/\lambda$.
  Beside it, a ladder with a gap of $1.12$ eV: a blue photon lifts an electron across, an infrared $1550$ nm photon does
  not. Write "Si sees up to $1.1$ µm".
- **Panel 2 — the photodiode.** A p–n junction, photons coming in, electron and hole swept apart, an ammeter. Box
  $I=\mathcal R P_{\text{opt}}$ and $\mathcal R=\eta q_e\lambda/(h_{\text P}c_0)$.
- **Panel 3 — buckets.** A 4×4 grid of buckets with rain; levels uneven. Write $N_e=\eta\Phi t_{\exp}$, $\sigma=\sqrt{N_e}$,
  $\mathrm{SNR}=\sqrt{N_e}$. Draw one overflowing bucket: "full well → white sky".
- **Panel 4 — Bayer.** A 2×2 block G R / B G. Say: "each pixel guesses two of its three colours."
- **Panel 5 — time of flight.** A car, a person, an arrow out and back. Write $d=c_0t/2$, "$30$ cm per ns", "$1$ ns → $15$ cm".
  Then a spinning head with three rays and the dots they leave: the point cloud.
- **Panel 6 — fingertip.** A finger between an LED pair and a photodiode, a wavy PPG trace with AC on top of a big DC.
  Write $R=(\mathrm{AC}/\mathrm{DC})_{\text{red}}/(\mathrm{AC}/\mathrm{DC})_{\text{IR}}$ and "ratios cancel the skin".

## Common mistakes and where the intuition breaks

- **"More energy per photon means more current."** Per watt it is the other way round: a watt of infrared contains more
  photons than a watt of blue, so $\mathcal R$ grows with $\lambda$, until the band gap cuts it off.
- **Forgetting the factor 2 in $d=c_0t/2$.** The pulse travels there *and back*.
- **Thinking noise is a fixed number of electrons.** Shot noise grows with the signal ($\sqrt{N_e}$); only the read noise is
  fixed. Bright parts of a photo have *more* noise in electrons but *less* relative noise.
- **"Raising ISO makes the sensor more sensitive."** ISO is mostly gain after the photodiode: it brightens the picture but
  cannot add photons, so it amplifies the grain together with the image.
- **Saturation is not "very bright".** A saturated pixel has lost the information; no software can recover the sky. Expose
  for the highlights, or use HDR.
- **Pulse oximeters and skin.** The ratio-of-ratios cancels most effects, but not all: calibration lines measured mostly
  on light-skinned volunteers have been shown to overestimate SpO₂ in people with darker skin, and nail polish, cold fingers
  and movement all disturb the reading. Calibration ([A8](A8-noise-resolution-calibration-and-drift.md)) is part of the sensor.
- **Where the picture breaks:** with only a few photons per pixel (night vision, single-photon LiDAR), you count
  individual photons and must think in probabilities, not in smooth currents. With fog, rain or a black car, LiDAR echoes
  become weak or split, and point clouds get holes.

## Remember

**"One photon frees at most one electron: $I=\mathcal RP_{\text{opt}}$, a pixel counts $N_e$ with noise $\sqrt{N_e}$, and distance is $d=c_0t/2$."**

## Self-test

1. A photodiode with $\eta=0.7$ is lit by $1$ mW at $650$ nm. What is the current?
   <details><summary>Answer</summary>R = 0.7 × 650/1239.8 = 0.367 A/W, so I = 0.367 A/W × 1 mW = 0.367 mA.</details>
2. A night photo has 25 electrons per pixel in the shadows. How many frames must the phone average to reach an SNR of 15?
   <details><summary>Answer</summary>One frame: SNR = √25 = 5. Averaging M frames gives SNR 5√M, so √M = 3 and M = 9 frames (it is the same as collecting 225 electrons in one long exposure).</details>
3. A LiDAR must tell apart two objects 3 cm apart in depth. What timing resolution does it need?
   <details><summary>Answer</summary>Δd = c Δt / 2, so Δt = 2Δd/c = 2 × 0.03 / 3×10⁸ = 0.2 ns = 200 ps.</details>

**Next:** [A6 Electrochemical sensors and biosensors](A6-electrochemical-sensors-and-biosensors.md) — instead of photons freeing electrons, molecules trade electrons with an electrode, and chemistry becomes a current.
