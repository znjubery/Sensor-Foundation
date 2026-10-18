# Sensor foundations: the storyline and the index

One idea per note. Symbols come from [notation](notation.md) only. Read the notes in order; each one says what it builds on and
what uses it, and every interactive figure links to the figures in other notes that reuse the same idea.

## The one story that connects everything

**A tomato plant, a person, a drone, a car, a phone and a house: one day of measuring the world.** At dawn a greenhouse
tomato plant is thirsty. A leaf clip measures its temperature, and a sap-flow chip measures how fast water is moving. The
grower wakes up and her smartwatch reports heart rate and steps. She pricks a finger for a glucose test strip and drives
to the field. Her car's airbag accelerometer, tyre-pressure sensors and parking radar watch the road. A drone flies over
the crop, holding steady with a MEMS gyroscope and photographing every leaf. Back home, the phone camera, the thermostat,
the smoke detector and the voice assistant's microphones are all at work. In the lab, a microfluidic chip the size of a
stamp checks a water sample for bacteria.

**Every one of those devices does the same four things.** It lets the world change something physical (a resistance, a
capacitance, a moving mass, a flowing liquid). It turns that change into a voltage, cleans the voltage up, and turns it
into a number a computer can trust. The 19 notes follow that chain:

- **Part A, Electronic sensors & signals:** how a change in the world becomes a clean, calibrated number.
- **Part B, MEMS:** how to build tiny moving machines out of silicon, and why tiny is different.
- **Part C, Microfluidics:** how liquids behave in channels thinner than a hair, and how to build a lab on a chip.

```viz
story-map
```

| # | Note | The question it answers in the story | Everyday hook |
|---|---|---|---|
| A1 | [What a sensor is: transduction and the measurement chain](A1-what-a-sensor-is-transduction-and-the-measurement-chain.md) | How does a smartwatch turn a heartbeat into a number? | a kitchen scale |
| A2 | [Resistive sensors and the Wheatstone bridge](A2-resistive-sensors-and-the-wheatstone-bridge.md) | How does a bathroom scale, a leaf thermometer or a car's strain gauge feel a 0.1% change? | a rubber band that gets thinner as you stretch it |
| A3 | [Capacitive sensors](A3-capacitive-sensors.md) | How does a phone screen know where your finger is? How does a soil sensor feel water? | two hands almost clapping |
| A4 | [Piezoelectric, piezoresistive and magnetic sensors](A4-piezoelectric-piezoresistive-and-magnetic-sensors.md) | How does a lighter spark, a phone compass find north, or a car know wheel speed? | a gas-grill igniter click |
| A5 | [Optical sensors: photodiodes, image sensors and LiDAR](A5-optical-sensors-photodiodes-image-sensors-and-lidar.md) | How does a camera pixel count light? How does a car or drone measure distance with light? | rain filling buckets on a grid |
| A6 | [Electrochemical sensors and biosensors](A6-electrochemical-sensors-and-biosensors.md) | How does a glucose strip, a pH probe or a CO detector work? | a battery made from a lemon |
| A7 | [Signal conditioning: amplifiers, filters and ADCs](A7-signal-conditioning-amplifiers-filters-and-adcs.md) | How do microvolts become clean numbers in a microcontroller? | a hearing aid; a staircase vs. a ramp |
| A8 | [Noise, resolution, calibration and drift](A8-noise-resolution-calibration-and-drift.md) | How small a change can we trust? Why do sensors need calibrating? | a bathroom scale that reads 0.3 kg with nobody on it |
| A9 | [Sensor fusion and the Kalman filter](A9-sensor-fusion-and-the-kalman-filter.md) | How does a drone combine a jittery accelerometer with a slow barometer? | two friends' guesses, weighted by how reliable each one is |
| B1 | [Scaling laws: why small is different](B1-scaling-laws-why-small-is-different.md) | Why can an ant lift 50× its weight, and why does that make MEMS possible? | an ant vs. an elephant; ice cubes vs. crushed ice |
| B2 | [Microfabrication: lithography, etching, deposition](B2-microfabrication-lithography-etching-deposition.md) | How do you build a moving machine 100× thinner than a hair? | stencil spray-painting; a layered cake |
| B3 | [Micromechanics: beams, springs and resonators](B3-micromechanics-beams-springs-and-resonators.md) | How stiff is a silicon beam, and why does it ring like a bell? | a diving board; a wine glass singing |
| B4 | [MEMS inertial sensors: accelerometers and gyroscopes](B4-mems-inertial-sensors-accelerometers-and-gyroscopes.md) | How does a phone know which way is up, or a drone know it is turning? | a ball on a spring in a box; a spinning merry-go-round |
| B5 | [MEMS microphones, pressure sensors and actuators](B5-mems-microphones-pressure-sensors-and-actuators.md) | How do phone microphones, tyre-pressure sensors and inkjet heads work? | a drum skin |
| C1 | [Fluids at the microscale: Reynolds number and laminar flow](C1-fluids-at-the-microscale-reynolds-number-and-laminar-flow.md) | Why don't two streams in a chip mix? Why does honey feel like the microworld? | stirring honey vs. water |
| C2 | [Pressure-driven flow and hydraulic circuits](C2-pressure-driven-flow-and-hydraulic-circuits.md) | How much pressure pushes a sample through a chip? How does water rise in a plant? | a garden hose; Ohm's law for water |
| C3 | [Diffusion, mixing and the Péclet number](C3-diffusion-mixing-and-the-peclet-number.md) | How long until two streams mix? How fast does glucose reach a sensor? | a tea bag in still water |
| C4 | [Surface tension, capillarity, droplets and electrokinetics](C4-surface-tension-capillarity-droplets-and-electrokinetics.md) | How do paper tests wick fluid with no pump? How do chips make droplets and move fluid with voltage? | a paper towel soaking up a spill |
| C5 | [Lab-on-a-chip, organ-on-chip and integrated sensing systems](C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md) | How do all the pieces combine into one chip that tests water, blood or sap? | a whole kitchen shrunk onto a postage stamp |

## Threads: the same idea, met again and again

| Thread | Where it appears |
|---|---|
| **Linearise around an operating point**, $\Delta y\approx S\,\Delta s$ | A1 → A2, A3, A4, A6 → B4, B5 |
| **Divide to compare:** bridges, differential pairs, ratios | A2 → A3 (differential capacitors) → B4, B5 |
| **Mass–spring–damper** $m\ddot x+b\dot x+kx=F$ | B3 → B4, B5 → A9 (as a motion model) |
| **First-order lag** $\tau\dot y+y=Ks$ ($RC$, thermal, diffusion) | A7 → A2 (thermistors), A6 (electrodes), C3 |
| **Ohm's-law analogies**: $V=IR$ ↔ $\Delta p=QR_{\text{hyd}}$ | A2, A7 → C2 → C5 |
| **Noise averages down as $1/\sqrt M$**, and Brownian motion spreads as $\sqrt{t}$ | A8 → A9, B1, C3 |
| **Scaling with size $\ell$** | B1 → B3, B4, C1, C3, C4 |

## Where it is used: the seven worlds

Every note ends its applications table with the same seven rows, so you can follow one world across the whole notebook.

| World | Sensors you will meet |
|---|---|
| 🌱 Plants & agriculture | leaf temperature, sap flow, soil moisture (capacitive), chlorophyll fluorescence, nitrate electrodes, drone multispectral cameras |
| 🧬 Biology & human health | ECG/PPG wearables, glucose strips, pulse oximeters, lab-on-a-chip diagnostics, organ-on-chip, hearing aids |
| 🌍 Environment | gas sensors (CO₂, NO₂, O₃), water-quality chips, rain gauges, particulate counters, weather stations |
| 🤖 Robotics & drones | IMUs, force/torque sensors, tactile skins, LiDAR, optical flow, barometric altitude |
| 🚗 Cars | airbag accelerometers, tyre-pressure (TPMS), wheel-speed Hall sensors, radar/LiDAR, oxygen (λ) sensors |
| 📱 Phones & photography | touchscreen, CMOS camera, autofocus, optical image stabilisation, MEMS microphones, compass, barometer |
| 🏠 Home & household | thermostats, smoke and CO detectors, kitchen scales, motion (PIR) sensors, washing-machine level sensors |

## The shape of every note
1. **Connects:** what it builds on and what uses it (links).
2. **Hook:** a real-world scene a 10th grader knows that works the same way as the physics.
3. **The idea in plain words:** complete rather than compact, with no unexplained symbol.
4. **Interactive figures:** each has a 🎯 *teaching target*, a 3D model you can rotate or a live plot, a **math, step by step** panel that walks through the derivation while the picture follows along, and **Connected to** links to the figures in other notes that reuse the idea.
5. **Intuitive examples:** 3–5 small ones with real numbers.
6. **The key equations:** the results to remember, with every symbol defined.
7. **Applications:** the seven worlds above.
8. **Derivation:** numbered steps, one line each.
9. **Worked check:** a tiny example by hand, with the numbers verified by a script in `scripts/checks/`.
10. **Whiteboard plan:** what to draw, panel by panel, and what to say.
11. **Common mistakes:** and where the intuition breaks.
12. **Remember:** one line. **Self-test:** 3 questions with hidden answers.
