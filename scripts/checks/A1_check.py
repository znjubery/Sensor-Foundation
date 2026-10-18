"""A1 check: reproduces every number in docs/A1-what-a-sensor-is-transduction-and-the-measurement-chain.md.

Run:  python scripts/checks/A1_check.py
"""
import math
import statistics

print("== Example 1 / worked check: the kitchen-scale chain ==")
strain_per_kg = 200e-6          # load-cell beam: 1000 microstrain at 5 kg full scale
GF = 2.0                        # metal-foil gauge factor
V_ex = 5.0                      # bridge excitation (V)
G = 128                         # amplifier gain
N = 16                          # ADC bits
V_ref = 2.048                   # ADC reference (V)
dV = V_ref / 2 ** N             # one LSB
s_fs = 5.0                      # kg
stage = [
    ("mass -> strain", strain_per_kg, "strain/kg"),
    ("strain -> dR/R", GF, "(dR/R)/strain"),
    ("dR/R -> V_out (full bridge)", V_ex, "V per unit dR/R"),
    ("V_out -> amplified", G, "V/V"),
    ("V -> counts", 1 / dV, "counts/V"),
]
S = 1.0
for name, k, unit in stage:
    S *= k
    print(f"  {name:28s} gain {k:.6g} {unit}")
print(f"  LSB dV = {dV*1e6:.2f} uV")
print(f"  bridge output per kg = {strain_per_kg*GF*V_ex*1e3:.3f} mV/kg  (rated output {strain_per_kg*GF*s_fs*1e3:.1f} mV/V)")
print(f"  amplified per kg     = {strain_per_kg*GF*V_ex*G:.4f} V/kg")
print(f"  total sensitivity S  = {S:.1f} counts/kg")
print(f"  full scale 5 kg      = {S*s_fs:.0f} counts, amplified {strain_per_kg*GF*V_ex*G*s_fs:.3f} V")
print(f"  resolution of 1 count = {1/S*1000:.4f} g")
noise_counts = 3.0
print(f"  with 3 counts rms noise: smallest trustworthy change ~ {noise_counts/S*1000:.2f} g")

m = 0.250
y0 = 1200
eps = strain_per_kg * m
dRR = GF * eps
Vb = V_ex * dRR
Va = G * Vb
counts = Va / dV
print(f"  250 g: strain {eps*1e6:.0f} ue, dR/R {dRR*1e6:.0f} ppm, bridge {Vb*1e3:.3f} mV, amp {Va*1e3:.1f} mV, counts {counts:.0f}")
y = y0 + S * m
print(f"  with offset y0 = {y0}: y = {y:.0f} counts; inverse m = (y - y0)/S = {(y - y0)/S*1000:.1f} g")

print("\n== Example 2: smartwatch PPG ==")
I_dc = 1e-6
PI = 0.01
R_f = 100e3
print(f"  DC {I_dc*R_f:.3f} V, pulse {I_dc*PI*R_f*1e3:.2f} mV, AC current {I_dc*PI*1e9:.0f} nA")
T_beat = 0.8
print(f"  beats every {T_beat} s -> {60/T_beat:.0f} beats/min")

print("\n== Example 3: thermometer, first-order lag ==")
tau = 10.0
T0, Tf = 22.0, 37.0
for t in (10, 30, 50):
    print(f"  t = {t:3d} s: reading {Tf + (T0 - Tf)*math.exp(-t/tau):.2f} C")
t01 = tau * math.log((Tf - T0) / 0.1)
print(f"  within 0.1 C after t = tau*ln(15/0.1) = {t01:.1f} s")
print(f"  fraction reached after 1,3,5 tau: {1-math.exp(-1):.3f} {1-math.exp(-3):.3f} {1-math.exp(-5):.4f}")
print(f"  slope at t = 0: (37-22)/tau = {(Tf-T0)/tau:.2f} C/s")

print("\n== Example 4: accuracy vs precision vs resolution (bathroom scale) ==")
readings = [70.4, 70.6, 70.5, 70.5, 70.6]
true = 70.0
mean = statistics.mean(readings)
sd = statistics.stdev(readings)
print(f"  mean {mean:.2f} kg, error e = {mean-true:+.2f} kg, sample std {sd:.3f} kg, resolution 0.1 kg")

print("\n== Example 5: saturation and linearity (y = Vsat tanh(S0 s / Vsat)) ==")
for u in (0.1, 0.5, 1.0, 2.0):
    lin = u
    tr = math.tanh(u)
    print(f"  S0 s / Vsat = {u}: true/linear = {tr/lin:.4f}  -> {100*(1-tr/lin):.1f}% below the tangent; local slope S/S0 = {1-math.tanh(u)**2:.3f}")

print("\n== Example 6: hysteresis ==")
up, down, true_rh, fs = 51.0, 53.0, 52.0, 100.0
print(f"  up {up}% RH, down {down}% RH at {true_rh}%: hysteresis {down-up:.0f}% RH = {100*(down-up)/fs:.0f}% of full scale")

print("\n== Self-test ==")
lsb = 3.3 / 4096
cpv = 1 / lsb
S1 = 0.2 * cpv
print(f"  Q1: LSB {lsb*1e3:.3f} mV, {cpv:.0f} counts/V, S = {S1:.0f} counts/kPa, one count = {1/S1*1000:.1f} Pa")
print(f"  Q2: after tau {40+20*(1-math.exp(-1)):.1f}% RH, after 3 tau {40+20*(1-math.exp(-3)):.1f}% RH")

print("\n== Linearisation check: dy ~ S ds with tanh, operating point u0 = 0.5, step 0.1 ==")
u0, du = 0.5, 0.1
exact = math.tanh(u0 + du) - math.tanh(u0)
lin = (1 - math.tanh(u0) ** 2) * du
print(f"  exact {exact:.5f}, linear {lin:.5f}, error {exact-lin:+.5f} ({100*(exact-lin)/exact:+.1f}%)")
