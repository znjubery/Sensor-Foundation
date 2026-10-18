"""A8 check: noise, resolution, calibration and drift. Recomputes every number in the examples and worked check of
docs/A8-noise-resolution-calibration-and-drift.md.  Run: python scripts/checks/A8_check.py"""
import math
import random

kB = 1.380649e-23        # J/K
qe = 1.602176634e-19     # C (electron charge)


def db(r):
    return 20 * math.log10(r)


print("== 1. Johnson noise ==")
for R, T, df in ((10e3, 300, 10e3), (1e3, 300, 1.0), (10e3, 300, 1.0), (1e6, 300, 10.0), (10e3, 77, 10e3)):
    v = math.sqrt(4 * kB * T * R * df)
    print(f"R = {R:9.0f} Ohm, T = {T} K, df = {df:7.0f} Hz: v_n = {v*1e9:9.2f} nV rms")
print(f"SNR of a 1 mV signal over 10 kOhm / 10 kHz: {db(1e-3/math.sqrt(4*kB*300*10e3*10e3)):.1f} dB")

print("== 2. Shot noise ==")
I, df = 1e-6, 10e3
i_n = math.sqrt(2 * qe * I * df)
print(f"I = 1 uA, df = 10 kHz: i_n = {i_n*1e12:.1f} pA rms, SNR = {I/i_n:.0f} = {db(I/i_n):.1f} dB")
I2 = 1e-9
i_n2 = math.sqrt(2 * qe * I2 * df)
print(f"I = 1 nA: i_n = {i_n2*1e12:.2f} pA, SNR = {I2/i_n2:.0f} = {db(I2/i_n2):.1f} dB")

print("== 3. 1/f noise ==")
ew, fcorner = 10e-9, 10.0
f1, f2 = 0.1, 10.0
v = math.sqrt(ew**2 * (fcorner * math.log(f2 / f1) + (f2 - f1)))
print(f"0.1-10 Hz with 10 nV/rtHz white, 10 Hz corner: {v*1e9:.1f} nV rms (white alone {ew*math.sqrt(f2-f1)*1e9:.1f} nV)")
print(f"each decade of 1/f adds e_w^2 f_c ln10 = ({ew*math.sqrt(fcorner*math.log(10))*1e9:.1f} nV)^2")

print("== 4. Averaging 1/sqrt(M) ==")
sig = 0.5
for M in (1, 4, 16, 100):
    print(f"kitchen scale sigma 0.5 g, M = {M:3d}: {sig/math.sqrt(M):.3f} g; at 10 readings/s takes {M/10:.1f} s")
random.seed(7)
M, trials = 16, 20000
means = [sum(random.gauss(0, sig) for _ in range(M)) / M for _ in range(trials)]
mu = sum(means) / trials
sd = math.sqrt(sum((m - mu) ** 2 for m in means) / (trials - 1))
print(f"Monte Carlo, M=16: std of the mean = {sd:.4f} g (theory {sig/4:.4f})")

print("== 5. Resolution and LOD ==")
S, sn = 2.0, 0.3                 # nA per mM, nA rms
print(f"glucose: resolution sigma/S = {sn/S:.2f} mM, LOD 3 sigma/S = {3*sn/S:.2f} mM")
S_p, sn_p = 1.0, 0.02            # mV/kPa, mV rms   (pressure sensor)
grad = 1.2 * 9.81                # Pa per metre of altitude near sea level
print(f"pressure: resolution {sn_p/S_p*1e3:.0f} Pa; barometer at {grad:.1f} Pa/m -> {sn_p/S_p*1e3/grad:.2f} m of altitude")

print("== 6. Two-point calibration (bathroom scale) ==")
y0_raw, y70_raw, s_ref = 0.3, 70.9, 70.0
gain = (y70_raw - y0_raw) / s_ref
print(f"offset = {y0_raw} kg, gain = {gain:.5f}")
raw = 82.0
print(f"raw 82.0 -> corrected {(raw - y0_raw)/gain:.2f} kg")

print("== 7. Least-squares calibration (load cell, counts vs grams) ==")
s = [0, 250, 500, 750, 1000]
y = [8410, 12530, 16590, 20770, 24800]
n = len(s)
sb, yb = sum(s) / n, sum(y) / n
Sxx = sum((a - sb) ** 2 for a in s)
Sxy = sum((a - sb) * (b - yb) for a, b in zip(s, y))
S_fit = Sxy / Sxx
y0_fit = yb - S_fit * sb
res = [b - (y0_fit + S_fit * a) for a, b in zip(s, y)]
rms = math.sqrt(sum(r * r for r in res) / (n - 2))
print(f"S = {S_fit:.3f} counts/g, y0 = {y0_fit:.1f} counts, residuals = {[round(r,1) for r in res]}, rms (n-2) = {rms:.1f} counts = {rms/S_fit:.2f} g")
print(f"reading 18000 counts -> {(18000 - y0_fit)/S_fit:.1f} g")

print("== 8. Temperature drift ==")
tc = 0.1     # kPa per degC offset drift
for T in (-20, 60):
    print(f"TPMS calibrated at 20 C, at {T} C: offset error {tc*abs(T-20):.1f} kPa = {tc*abs(T-20)/230*100:.1f} % of 230 kPa")

print("== 9. Allan deviation (white + rate random walk) ==")
sw, fs, K = 0.1, 100.0, 1e-4      # deg/s per sample, Hz, deg/s/sqrt(s)
a = sw**2 / fs
for tau in (0.01, 1, 10, 100):
    sA = math.sqrt(a / tau + K**2 * tau / 3)
    print(f"tau = {tau:6.2f} s: white part {math.sqrt(a/tau):.5f}, total {sA:.5f} deg/s")
tau_s = math.sqrt(3 * a) / K
smin = math.sqrt(a / tau_s + K**2 * tau_s / 3)
print(f"best averaging time {tau_s:.0f} s, floor {smin:.5f} deg/s = {smin*3600:.1f} deg/h")

print("== 10. Magnetometer hard/soft iron ==")
Bh, b = 20.0, 12.0
print(f"hard-iron 12 uT vs horizontal field 20 uT: worst heading error {math.degrees(math.asin(b/Bh)):.1f} deg")
BE = 50.0
off = (12.0, -8.0, 25.0)
sc = (1.25, 0.85, 1.0)
th = math.radians(30)
c, si = math.cos(th), math.sin(th)
Rz = [[c, -si, 0], [si, c, 0], [0, 0, 1]]
A = [[sum(Rz[i][k] * sc[k] * Rz[j][k] for k in range(3)) for j in range(3)] for i in range(3)]   # R diag R^T
mags = []
random.seed(3)
for _ in range(20000):
    v = [random.gauss(0, 1) for _ in range(3)]
    L = math.sqrt(sum(x * x for x in v))
    u = [BE * x / L for x in v]
    m = [sum(A[i][j] * u[j] for j in range(3)) + off[i] for i in range(3)]
    mags.append(math.sqrt(sum(x * x for x in m)))
print(f"raw |B| ranges {min(mags):.1f} .. {max(mags):.1f} uT (true 50.0)")
print(f"after offset removal: semi-axes {BE*sc[0]:.1f}, {BE*sc[1]:.1f}, {BE*sc[2]:.1f} uT; after scaling: 50 50 50")

print("== Worked check ==")
v = math.sqrt(4 * kB * 300 * 10e3 * 10e3)
print(f"4 kB T = {4*kB*300:.4e} J; x R x df = {4*kB*300*10e3*10e3:.4e} V^2; v_n = {v*1e6:.3f} uV")
print(f"average M=100: {v/10*1e9:.1f} nV")
print(f"two-point: gain {gain:.5f}, 82.0 -> {(82.0-0.3)/gain:.2f} kg")
print(f"LOD {3*sn/S:.2f} mM")
