"""A3 check: reproduces every number in docs/A3-capacitive-sensors.md.

Run:  python scripts/checks/A3_check.py
"""
import math

e0 = 8.854e-12

print("== Example 1: a MEMS-size parallel-plate capacitor ==")
A = 1e-3 * 1e-3
g0 = 2e-6
C0 = e0 * A / g0
print(f"  1 mm x 1 mm, g = 2 um, air: C0 = {C0*1e12:.3f} pF; at g = 1 um: {e0*A/1e-6*1e12:.3f} pF")
print(f"  slope at rest dC/dx = C0/g0 = {C0/g0*1e12*1e-6:.3f} pF/um = {C0/g0*1e15*1e-9:.2f} fF/nm")

print("\n== Example 2 / worked check: gap nonlinearity and the differential capacitor ==")
for f in (0.1, 0.3, 0.5):
    x = f * g0
    C1 = e0 * A / (g0 - x)
    C2 = e0 * A / (g0 + x)
    print(f"  x = {f:.1f} g0: C1 = {C1*1e12:.3f} pF ({C1/C0:.4f} C0, linear guess {1+f:.2f} C0), C2 = {C2*1e12:.3f} pF, "
          f"(C1-C2)/(C1+C2) = {(C1-C2)/(C1+C2):.4f}, C1-C2 = {(C1-C2)*1e12:.3f} pF")
x = 0.1 * g0
C1, C2 = e0 * A / (g0 - x), e0 * A / (g0 + x)
print(f"  single-sided error at 10%: {(C1/C0 - 1.1)/0.1*100:.1f}% of the change")

print("\n== Example 3: dielectric sensing - humidity ==")
C55, k = 180.0, 0.34
for rh in (30, 55, 80):
    print(f"  {rh}% RH: {C55 + k*(rh-55):.1f} pF")
print(f"  30 -> 80% RH: dC = {k*50:.1f} pF ({k*50/C55*100:.1f}% of 180 pF)")

print("\n== Example 4: soil moisture (Topp equation) ==")
def topp(th):
    return 3.03 + 9.3 * th + 146.0 * th**2 - 76.7 * th**3
C_half, eps_board = 2.0, 4.4      # pF per unit permittivity per half-space; FR4
R = 1e6
for th in (0.05, 0.10, 0.30, 0.40):
    er = topp(th)
    C = C_half * (er + eps_board)
    t50 = R * C * 1e-12 * math.log(2)
    print(f"  theta = {th:.2f}: eps_r = {er:.2f}, C = {C:.1f} pF, RC = {R*C*1e-12*1e6:.1f} us, time to half supply = {t50*1e6:.1f} us")
print(f"  water eps_r ~ 80, dry mineral ~ 4, air 1")

print("\n== Example 5: touchscreen ==")
er_glass, t_glass, A_f = 7.0, 0.5e-3, 25e-6
Cf = e0 * er_glass * A_f / t_glass
print(f"  finger pad 25 mm^2 through 0.5 mm glass (eps_r 7): {Cf*1e12:.2f} pF")
CM, dCM = 1.0, 0.15
print(f"  mutual node {CM} pF, finger steals {dCM} pF = {dCM/CM*100:.0f}%")
xs, dc = [0, 5, 10], [0.05, 0.20, 0.15]
cen = sum(a * b for a, b in zip(xs, dc)) / sum(dc)
print(f"  centroid of {dc} pF at {xs} mm: {cen:.2f} mm")
nr, nc = 70 // 5, 150 // 5
print(f"  70 x 150 mm screen at 5 mm pitch: {nr} x {nc} = {nr*nc} mutual nodes, {nr+nc} self-capacitance channels")
print(f"  at 120 Hz: {nr*nc*120} node readings per second")
print(f"  two fingers, self-capacitance: 2 rows x 2 columns -> {2*2} candidates, {2*2-2} ghosts")

print("\n== Example 6: fringing (Palmer's formula, square plate a x a) ==")
def palmer(a, d):
    f = 1 + d / (math.pi * a) * (1 + math.log(2 * math.pi * a / d))
    return f * f
for a, d in ((1e-3, 2e-6), (1e-3, 0.1e-3), (1e-3, 0.5e-3)):
    print(f"  a = {a*1e3:.0f} mm, g = {d*1e6:.0f} um: C / (e0 A/g) = {palmer(a, d):.4f} (+{(palmer(a, d)-1)*100:.1f}%)")

print("\n== Example 7: readout ==")
Vex, Cfb = 3.3, 1e-12
x = 10e-9
C1, C2 = e0 * A / (g0 - x), e0 * A / (g0 + x)
dC = C1 - C2
print(f"  x = 10 nm: C1 - C2 = {dC*1e15:.1f} fF; charge amplifier V_ex dC / C_f = {Vex*dC/Cfb*1e3:.0f} mV")
F = e0 * A * Vex**2 / (2 * g0**2)
print(f"  electrostatic pull at 3.3 V across 2 um: F = {F*1e6:.1f} uN")

print("\n== Self-test ==")
print(f"  Q1: halve the gap of 4.427 pF -> {2*C0*1e12:.2f} pF; double the area -> {2*C0*1e12:.2f} pF; eps_r 3 -> {3*C0*1e12:.2f} pF")
x = 0.05 * g0
C1, C2 = e0 * A / (g0 - x), e0 * A / (g0 + x)
print(f"  Q2: C1 = {C1*1e12:.3f}, C2 = {C2*1e12:.3f} -> x/g0 = {(C1-C2)/(C1+C2):.3f} -> x = {(C1-C2)/(C1+C2)*g0*1e9:.0f} nm")
print(f"  Q3: centroid of 0.10, 0.30, 0.10 at 10, 15, 20 mm = {(10*0.1+15*0.3+20*0.1)/0.5:.1f} mm")
