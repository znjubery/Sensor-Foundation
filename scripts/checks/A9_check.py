"""A9 check: sensor fusion and the Kalman filter. Recomputes every number in the examples and worked check of
docs/A9-sensor-fusion-and-the-kalman-filter.md.  Run: python scripts/checks/A9_check.py"""
import math
import random


def fuse(z1, v1, z2, v2):
    w1, w2 = 1 / v1, 1 / v2
    return (w1 * z1 + w2 * z2) / (w1 + w2), 1 / (w1 + w2)


print("== 1. Two guesses: barometer vs GPS altitude ==")
z1, s1, z2, s2 = 102.0, 2.0, 98.0, 4.0
x, v = fuse(z1, s1**2, z2, s2**2)
w = s2**2 / (s1**2 + s2**2)
print(f"weight on barometer = {w:.2f}, fused = {x:.2f} m, variance = {v:.2f} m^2, sigma = {math.sqrt(v):.3f} m")
print(f"plain average would give {0.5*z1+0.5*z2:.1f} m with sigma {math.sqrt(0.25*s1**2+0.25*s2**2):.3f} m")
x2, v2 = fuse(10.0, 1.0, 12.0, 1.0)
print(f"two equal thermometers 10 and 12, sigma 1: fused {x2:.1f}, sigma {math.sqrt(v2):.3f} (1/sqrt2)")
K = s1**2 / (s1**2 + s2**2)
print(f"as a Kalman update from z1: K = {K:.2f}, x = z1 + K (z2 - z1) = {z1 + K*(z2-z1):.2f}")
# brute-force check that w minimises the variance
best = min((wi / 1000 for wi in range(1001)), key=lambda wi: wi**2 * s1**2 + (1 - wi)**2 * s2**2)
print(f"brute-force best weight = {best:.3f}")

print("== 2. Kalman worked steps (altitude, random-walk model) ==")
xh, p = 100.0, 9.0
q, r = 0.01, 4.0
for z in (104.0, 101.0, 103.0):
    pm = p + q
    Kk = pm / (pm + r)
    xh = xh + Kk * (z - xh)
    p = (1 - Kk) * pm
    print(f"z = {z}: p- = {pm:.3f}, K = {Kk:.4f}, x^ = {xh:.3f}, p = {p:.3f} (sigma {math.sqrt(p):.3f})")

print("== 3. Steady-state Kalman gain ==")
for q, r in ((0.01, 4.0), (0.1, 4.0), (0.01, 0.25)):
    pm = (q + math.sqrt(q * q + 4 * q * r)) / 2
    Kss = pm / (pm + r)
    pss = (1 - Kss) * pm
    print(f"sigma_w^2 = {q}, sigma_v^2 = {r}: p- = {pm:.4f}, K = {Kss:.4f}, sigma = {math.sqrt(pss):.4f} m "
          f"(vs raw {math.sqrt(r):.2f} m)")
# iterate to confirm
q, r = 0.01, 4.0
p = 100.0
for _ in range(2000):
    pm = p + q
    Kk = pm / (pm + r)
    p = (1 - Kk) * pm
print(f"iterated: K = {Kk:.4f}, sigma = {math.sqrt(p):.4f}")
print(f"effective averaging window ~ 1/K = {1/Kk:.1f} samples")

print("== 4. Complementary filter for tilt ==")
tau, dt = 0.5, 0.01
alpha = tau / (tau + dt)
print(f"alpha = {alpha:.4f}")
bias = 0.5                                   # deg/s gyro bias
print(f"gyro alone after 60 s: drift {bias*60:.0f} deg")
e = 0.0
for _ in range(100000):
    e = alpha * (e + bias * dt)              # accelerometer error-free (true tilt 0)
print(f"complementary steady error = {e:.4f} deg (b*tau = {bias*tau:.4f}; exact alpha b dt/(1-alpha) = {alpha*bias*dt/(1-alpha):.4f})")
print(f"accelerometer tilt: ax = 0.17 g, az = 0.985 g -> {math.degrees(math.atan2(0.17, 0.985)):.1f} deg")
# shake: 0.2 g sideways for a moment fools the accelerometer by
print(f"0.2 g sideways shake fools the accelerometer by {math.degrees(math.atan2(0.2, 1.0)):.1f} deg")

print("== 5. GPS + IMU dead reckoning ==")
b = 0.05                                      # m/s^2 accelerometer bias
for t in (1, 10, 60):
    print(f"accel bias 0.05 m/s^2 for {t} s: position error {0.5*b*t*t:.3f} m")

print("== 6. Drone altitude: barometer + accelerometer ==")
dP_per_m = 1.2 * 9.81
print(f"air pressure gradient = {dP_per_m:.1f} Pa/m; 20 Pa noise -> {20/dP_per_m:.2f} m")

print("== 7. Monte Carlo of the 1D Kalman filter (random walk) ==")
random.seed(5)
q, r = 0.01, 4.0
xt, xh, p = 0.0, 0.0, 100.0
errs, raw = [], []
for k in range(20000):
    xt += random.gauss(0, math.sqrt(q))
    z = xt + random.gauss(0, math.sqrt(r))
    pm = p + q
    Kk = pm / (pm + r)
    xh += Kk * (z - xh)
    p = (1 - Kk) * pm
    if k > 500:
        errs.append(xh - xt)
        raw.append(z - xt)
rms = math.sqrt(sum(e * e for e in errs) / len(errs))
print(f"simulated rms error {rms:.3f} m (filter says {math.sqrt(p):.3f}), raw barometer {math.sqrt(sum(e*e for e in raw)/len(raw)):.3f} m")

print("== Worked check ==")
print(f"fuse 102 (2 m) and 98 (4 m): {x:.2f} m, sigma {math.sqrt(v):.2f} m")
