"""B4 MEMS inertial sensors: recompute every number in the note's examples and worked check.

    python scripts/checks/B4_check.py
"""
import math

EPS0 = 8.854e-12      # F/m
G = 9.81              # m/s^2 (1 g)
KB = 1.380649e-23     # J/K
T = 298.15            # K (25 C)


def head(s):
    print("\n== " + s)


# ── 1. the consumer accelerometer (worked check) ──────────────────────────────────────────────────
head("Worked check: consumer accelerometer, m = 1 ug, f0 = 3 kHz")
m = 1e-9               # kg (1 microgram)
f0 = 3000.0            # Hz
w0 = 2 * math.pi * f0
k = m * w0 ** 2
x1g = G / w0 ** 2
print(f"omega0 = {w0:.0f} rad/s, omega0^2 = {w0**2:.3e} 1/s^2")
print(f"k = m*omega0^2 = {k:.3f} N/m")
print(f"x(1 g) = g/omega0^2 = {x1g:.3e} m = {x1g*1e9:.1f} nm")

N = 20                 # sense fingers per capacitor
Lf = 100e-6            # finger overlap length
tf = 20e-6             # structure thickness
g0 = 2e-6              # rest gap
A = N * Lf * tf
C0 = EPS0 * A / g0
print(f"A per capacitor = {A:.1e} m^2, C0 = eps0*A/g0 = {C0*1e15:.0f} fF")
C1 = EPS0 * A / (g0 - x1g)
C2 = EPS0 * A / (g0 + x1g)
dC = C1 - C2
print(f"C1 = {C1*1e15:.2f} fF, C2 = {C2*1e15:.2f} fF, C1 - C2 = {dC*1e15:.2f} fF per g (linear: 2*C0*x/g0 = {2*C0*x1g/g0*1e15:.2f} fF)")
print(f"x/g0 = {x1g/g0:.4f}")
Vex = 1.0
Vout = Vex * (C1 - C2) / (C1 + C2)
print(f"Vout = Vex*(C1-C2)/(C1+C2) = {Vout*1e3:.1f} mV per g (Vex = 1 V); Vex*x/g0 = {Vex*x1g/g0*1e3:.1f} mV")
print(f"1 mg -> dC = {dC*1e-3*1e18:.1f} aF, x = {x1g*1e-3*1e12:.1f} pm")

# ── 2. sensitivity vs bandwidth ───────────────────────────────────────────────────────────────────
head("Example: sensitivity vs bandwidth, x(1 g) for several f0")
for f in (1000, 3000, 10000, 30000):
    print(f"f0 = {f/1000:g} kHz: x(1 g) = {G/(2*math.pi*f)**2*1e9:.2f} nm")

# ── 3. Brownian noise of the proof mass ───────────────────────────────────────────────────────────
head("Example: Brownian (thermomechanical) noise floor")
Qf = 1.0
an = math.sqrt(4 * KB * T * w0 / (m * Qf))
print(f"kB*T = {KB*T:.3e} J")
print(f"a_n = sqrt(4 kB T omega0/(m Qf)) = {an:.3e} m/s^2/sqrt(Hz) = {an/G*1e6:.0f} ug/sqrt(Hz)")
print(f"over 100 Hz: {an*10/G*1e3:.2f} mg rms")
nd = 100e-6            # 100 ug/sqrt(Hz) datasheet value
print(f"datasheet 100 ug/rtHz over 100 Hz -> {nd*10*1e3:.1f} mg rms -> tilt resolution {math.degrees(nd*10):.3f} deg")

# ── 4. tilt from gravity ──────────────────────────────────────────────────────────────────────────
head("Example: tilt from gravity")
fx, fy, fz = 0.0, 0.5, math.sqrt(3) / 2
pitch = math.degrees(math.atan2(fx, math.hypot(fy, fz)))
roll = math.degrees(math.atan2(fy, fz))
print(f"f = (0, 0.5, 0.866) g -> pitch = {pitch:.1f} deg, roll = {roll:.1f} deg")
fx, fy, fz = -0.259, 0.0, 0.966
print(f"f = (-0.259, 0, 0.966) g -> pitch = {math.degrees(math.atan2(fx, math.hypot(fy, fz))):.1f} deg")
# one-axis tilt sensitivity: fx = sin(theta)
for th in (0, 45, 80):
    dth = 1e-3 / math.cos(math.radians(th))
    print(f"single axis at {th} deg: 1 mg -> {math.degrees(dth):.3f} deg")

# ── 5. integrating a bias ─────────────────────────────────────────────────────────────────────────
head("Example: bias integrates into angle and position errors")
bg = 0.05  # deg/s gyro bias
for t in (10, 60, 600):
    print(f"gyro bias 0.05 deg/s, t = {t} s -> angle error {bg*t:.1f} deg")
Ng = 0.01  # deg/s/sqrt(Hz)
for t in (1, 100, 3600):
    print(f"gyro noise 0.01 deg/s/rtHz, t = {t} s -> angle random walk sigma = {Ng*math.sqrt(t):.2f} deg")
print(f"ARW = {Ng*60:.1f} deg/sqrt(h)")
ba = 1e-3 * G  # 1 mg accelerometer bias
for t in (1, 10, 60):
    print(f"accel bias 1 mg, t = {t} s -> position error 0.5*b*t^2 = {0.5*ba*t*t:.3f} m")

# ── 6. the vibratory gyroscope ────────────────────────────────────────────────────────────────────
head("Worked check: vibratory gyroscope")
md = 1e-9
fd = 20000.0
Xd = 10e-6
wd = 2 * math.pi * fd
v = wd * Xd
Om = math.radians(100)   # 100 deg/s
Fc = 2 * md * Om * v
print(f"drive: f_d = 20 kHz, X_d = 10 um -> v_max = omega_d X_d = {v:.3f} m/s")
print(f"Omega = 100 deg/s = {Om:.4f} rad/s")
print(f"Coriolis F = 2 m Omega v = {Fc:.3e} N = {Fc*1e9:.2f} nN")
print(f"compare weight m*g = {md*G*1e9:.2f} nN -> F_c / (m g) = {Fc/(md*G):.3f}")
fs = 21000.0
ws = 2 * math.pi * fs
ks = md * ws ** 2
ystat = Fc / ks
yoff = Fc / (md * abs(ws ** 2 - wd ** 2))
print(f"sense f_s = 21 kHz: k_s = {ks:.1f} N/m, F/k_s = {ystat*1e9:.3f} nm")
print(f"off-resonance amplitude F/(m|ws^2-wd^2|) = {yoff*1e9:.2f} nm (gain {yoff/ystat:.2f})")
Q = 1000
ymatch = Q * Fc / (md * wd ** 2)
print(f"mode matched, Q = 1000: y = Q F/k = {ymatch*1e9:.0f} nm, bandwidth f/(2Q) = {fd/(2*Q):.0f} Hz")
print(f"per 1 deg/s (mismatched): {yoff/100*1e12:.1f} pm")

# ── 7. airbag ─────────────────────────────────────────────────────────────────────────────────────
head("Example: airbag")
v0 = 50 / 3.6
tstop = 0.1
abar = v0 / tstop
print(f"50 km/h = {v0:.2f} m/s stopped in 0.1 s -> mean deceleration {abar:.0f} m/s^2 = {abar/G:.1f} g")
print(f"speed change in first 20 ms at that level: {abar*0.02:.2f} m/s")
fa = 20000.0
print(f"high-g sensor f0 = 20 kHz: x(50 g) = {50*G/(2*math.pi*fa)**2*1e9:.1f} nm")

# ── 8. image stabilisation ────────────────────────────────────────────────────────────────────────
head("Example: image stabilisation")
fL = 4.3e-3
th = math.radians(0.05)
shift = fL * th
print(f"0.05 deg shake, f_L = 4.3 mm -> image shift {shift*1e6:.2f} um = {shift/1.2e-6:.1f} pixels of 1.2 um")

# ── 9. small extras quoted in the note ────────────────────────────────────────────────────────────
head("Extras")
print(f"27.6 nm / 0.235 nm Si-Si spacing = {x1g/0.235e-9:.0f} atoms")
print(f"airbag f0 = 20 kHz: x per g = {G/(2*math.pi*20000)**2*1e9:.2f} nm")
print(f"braking at 0.3 g looks like a pitch of {math.degrees(math.atan(0.3)):.1f} deg")
print(f"self-test 2: pitch = {math.degrees(math.atan2(0.5, 0.866)):.1f} deg, 1 mg error -> {math.degrees(1e-3/math.cos(math.radians(30))):.3f} deg")
print(f"self-test 3: bias 0.02*300 = {0.02*300:.1f} deg, noise 0.005*sqrt(300) = {0.005*math.sqrt(300):.3f} deg")
print(f"self-test 1: (6/2)^2 = {(6/2)**2:.0f}")
