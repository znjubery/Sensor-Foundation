"""A6 check: electrochemical sensors and biosensors.

Recomputes every number in the Intuitive examples and the Worked check of
docs/A6-electrochemical-sensors-and-biosensors.md.  Standard library only.
"""
import math

RG = 8.314462618       # J/(mol K)
FAR = 96485.33212      # C/mol
LN10 = math.log(10)

def slope(T_c, z=1):
    return RG * (T_c + 273.15) * LN10 / (z * FAR)

print("=== 1. Lemon battery (standard potentials) ===")
print(f"Cu2+/Cu +0.34 V, Zn2+/Zn -0.76 V -> cell = {0.34-(-0.76):.2f} V")
print(f"  free energy per mole of Zn: dG = -z F V = {-2*FAR*1.10/1e3:.0f} kJ/mol")

print("\n=== 2. Nernst slope ===")
for T in (0, 25, 37):
    print(f"  T = {T:2d} C: R_g T ln10 / F = {slope(T)*1e3:.2f} mV/decade (z=1), z=2: {slope(T,2)*1e3:.2f} mV/decade")
print(f"thermal voltage R_g T/F at 25 C = {RG*298.15/FAR*1e3:.2f} mV")

print("\n=== 3. pH glass electrode ===")
s25 = slope(25)
print(f"pH 7 -> pH 4: dV = 3 x {s25*1e3:.2f} = {3*s25*1e3:.1f} mV")
err_mV = 1.0
print(f"1 mV reading error = {err_mV/(s25*1e3):.4f} pH units")
s37 = slope(37)
print(f"calibrated at 25 C, used at 37 C, 3 pH units from pH 7: error = {3*(s37-s25)*1e3:.1f} mV = {3*(s37-s25)/s25:.2f} pH")

print("\n=== 4. Nitrate ISE in soil water ===")
c1, c2 = 10.0, 100.0
print(f"nitrate {c1:.0f} -> {c2:.0f} mg/L: dV = -{s25*1e3:.1f} x log10({c2/c1:.0f}) = {-s25*math.log10(c2/c1)*1e3:.1f} mV")
print(f"a 5 mV drift looks like a factor {10**(5/(s25*1e3)):.2f} in concentration ({(10**(5/(s25*1e3))-1)*100:.0f} %)")

print("\n=== 5. Glucose strip, Cottrell ===")
n = 2
A = 1e-6               # m^2 (1 mm^2)
c = 5.0                # mol/m^3 = 5 mM
D = 6.7e-10            # m^2/s
print(f"5 mM glucose = {5*180.16/10:.1f} mg/dL")
def cott(t, c=c):
    return n * FAR * A * c * math.sqrt(D / (math.pi * t))
for t in (1, 4, 5, 10):
    print(f"  t = {t:2d} s: I = {cott(t)*1e6:.2f} uA")
Sens = cott(5) / 5.0
print(f"sensitivity at 5 s: {Sens*1e6:.2f} uA/mM")
delta = math.sqrt(math.pi * D * 5)
print(f"depletion layer at 5 s: sqrt(pi D t) = {delta*1e6:.0f} um")
Q5 = 2 * n * FAR * A * c * math.sqrt(D * 5 / math.pi)
print(f"charge in the first 5 s: {Q5*1e6:.0f} uC")
print(f"10 mM at 5 s: {cott(5, 10.0)*1e6:.2f} uA")

print("\n=== 6. Electrochemical CO detector ===")
S_co = 70e-9           # A/ppm
for ppm in (30, 70, 400):
    print(f"  {ppm:3d} ppm -> {S_co*ppm*1e6:.2f} uA")
Rtia = 100e3
print(f"transimpedance 100 kOhm: 70 ppm -> {S_co*70*Rtia:.2f} V")

print("\n=== 7. Metal-oxide sensor ===")
kappa = 0.5
print(f"R_s = R_0 (c/c0)^-0.5: 4x more gas -> R x {4**-kappa:.2f}; 100x -> R x {100**-kappa:.2f}")

print("\n=== 8. Two- vs three-electrode ===")
I = 10e-6
Rs = 1e3
print(f"10 uA through 1 kOhm of solution: IR drop = {I*Rs*1e3:.0f} mV")

print("\n=== 9. Enzyme saturation (Michaelis-Menten) ===")
KM = 25.0
for cc in (1.0, 5.0, 20.0):
    lin = cc / KM
    mm = cc / (KM + cc)
    print(f"  c = {cc:4.1f} mM: c/(K_M+c) = {mm:.3f}, linear c/K_M = {lin:.3f}, shortfall {100*(1-mm/lin):.0f} %")

print("\n=== 10. Limit of detection ===")
sigma_blank = 0.05e-6
LOD = 3 * sigma_blank / Sens
print(f"sigma_blank = 0.05 uA, S = {Sens*1e6:.2f} uA/mM -> LOD = 3 sigma/S = {LOD:.3f} mM = {LOD*18.016:.1f} mg/dL")
print(f"LOQ = 10 sigma/S = {10*sigma_blank/Sens:.2f} mM")

print("\n=== Worked check ===")
# glucose 8 mM read at 5 s; then invert a pH reading
c8 = 8.0
I8 = cott(5, c8)
print(f"8 mM at 5 s: sqrt(D/(pi t)) = {math.sqrt(D/(math.pi*5))*1e6:.3f} um/s; I = {I8*1e6:.2f} uA; back to c = I/S = {I8/Sens:.2f} mM")
Vm = 0.1183
pH = 7 - Vm / s25
print(f"pH electrode V = s*(7 - pH), 0 mV at pH 7; measured 118.3 mV: pH = 7 - 118.3/{s25*1e3:.2f} = {pH:.2f}")
V37 = 3 * s37
print(f"true pH 4 at 37 C gives V = 3 x {s37*1e3:.2f} = {V37*1e3:.1f} mV; a meter assuming 25 C reports pH {7 - V37/s25:.2f}")
print(f"pH 7 -> pH 0 intercept: 7 x {s25*1e3:.2f} = {7*s25*1e3:.0f} mV")
print(f"8 mM = {8*18.016:.0f} mg/dL")

print("\n=== Mistakes / self-test ===")
print(f"doubling concentration: {s25*1e3:.2f} x log10(2) = {s25*1e3*math.log10(2):.1f} mV")
print(f"K+ electrode: -20 mV at 1 mM -> 10 mM: {-20 + s25*1e3:.1f} mV, 2 mM: {-20 + s25*1e3*math.log10(2):.1f} mV")
print(f"strip 6.3 uA at 5 s -> 20 s: {6.3*math.sqrt(5/20):.2f} uA")
print(f"CO LOD: 3 x 14 nA / 70 nA/ppm = {3*14/70:.1f} ppm")
