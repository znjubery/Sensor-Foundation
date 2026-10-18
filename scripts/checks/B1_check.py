"""B1 check: recompute every number in docs/B1-scaling-laws-why-small-is-different.md (standard library only)."""
import math

g = 9.81            # m/s^2
gamma = 0.072       # N/m, water surface tension
rho_si, rho_w = 2330.0, 1000.0
E_si = 169e9        # Pa, <110>
eps0 = 8.854e-12
mu0 = 4e-7 * math.pi
kB, T = 1.380649e-23, 298.15
kT = kB * T

print("== Example 1: surface / volume ==")
for l in (0.02, 0.002, 1e-6):
    print(f"  cube l = {l:g} m: A/V = 6/l = {6 / l:.4g} 1/m")
n = 10
print(f"  2 cm cube cut into {n**3} pieces of 2 mm: area {6 * 2**2:.0f} cm^2 -> {6 * 2**2 * n:.0f} cm^2 (x{n})")

print("== Example 2: strength / weight ~ 1/l ==")
print(f"  human 1.75 m vs ant 5 mm: size ratio {1.75 / 0.005:.0f} -> ant strength/weight x{1.75 / 0.005:.0f}")
print(f"  elephant 3 m vs human 1.75 m: strength/weight x{1.75 / 3:.2f}")

print("== Example 3: water strider ==")
m_ws, Lc = 10e-6, 0.02
W = m_ws * g
Fst = 2 * gamma * Lc
print(f"  weight {W * 1e3:.4f} mN, max surface-tension support 2*gamma*L = {Fst * 1e3:.2f} mN, margin x{Fst / W:.0f}")
print(f"  capillary length water sqrt(gamma/(rho g)) = {math.sqrt(gamma / (rho_w * g)) * 1e3:.2f} mm")
L_h = 70 * g / (2 * gamma)
print(f"  70 kg human would need contact line {L_h:.0f} m = {L_h / 1e3:.1f} km")

print("== Example 4: resonance ~ 1/l ==")
c = 1.875104 ** 2 / (2 * math.pi) / math.sqrt(12)
v = math.sqrt(E_si / rho_si)
print(f"  prefactor {c:.5f}, sqrt(E/rho) = {v:.0f} m/s")
for L, t in ((1.0, 0.01), (1e-3, 10e-6), (1e-4, 1e-6)):
    f = c * t / L**2 * v
    print(f"  silicon cantilever L={L:g} m, t={t:g} m: f0 = {f:.4g} Hz")

print("== Example 5: thermal time ~ l^2 ==")
Dth = 149 / (rho_si * 705)
print(f"  D_th(Si) = {Dth:.3g} m^2/s")
for l in (100e-6, 1e-3, 1e-2):
    print(f"  l = {l:g} m: tau = l^2/D_th = {l**2 / Dth:.3g} s")

print("== Example 6: diffusion time ~ l^2 (glucose, D = 6.7e-10) ==")
D = 6.7e-10
for l in (10e-6, 1e-3, 1e-2):
    tt = l**2 / (2 * D)
    print(f"  l = {l:g} m: t = l^2/(2D) = {tt:.4g} s = {tt / 60:.3g} min = {tt / 3600:.3g} h")

print("== Example 7: thermal noise of a proof mass ==")
def a_noise(m, f0, Q):
    return math.sqrt(4 * kT * 2 * math.pi * f0 / (m * Q))
print(f"  kT = {kT:.4g} J")
for m in (1e-9, 1e-12, 1e-3):
    an = a_noise(m, 5000, 1)
    print(f"  m = {m:g} kg: a_n = {an:.3g} m/s^2/rtHz = {an / g * 1e6:.3g} millionths of g per rtHz")
print(f"  shrink by 10 -> noise x{math.sqrt(1000):.1f}")

print("== Example 8: electrostatic vs magnetic pressure ==")
for E in (3e6, 1e8):
    print(f"  field {E:g} V/m: eps0 E^2/2 = {0.5 * eps0 * E**2:.4g} Pa")
print(f"  B = 1 T: B^2/(2 mu0) = {1 / (2 * mu0):.4g} Pa")
J = 1e7
for l in (0.1, 0.01, 1e-5):
    print(f"  coil size {l:g} m, J = 1e7 A/m^2: B ~ mu0 J l = {mu0 * J * l:.3g} T")

print("== Example 9: fog droplet (Stokes) ==")
mu_air, r = 1.8e-5, 5e-6
U = 2 * rho_w * g * r**2 / (9 * mu_air)
print(f"  10 um droplet terminal speed {U * 1e3:.2f} mm/s")

print("== Chart coefficients (F = c * l^n) and crossings ==")
cg = rho_si * g
cs = gamma
ce = 0.5 * eps0 * (3e6) ** 2
cm = 0.5 * mu0 * J**2
cv = 6 * math.pi * 1e-3 * 1e-3
print(f"  gravity {cg:.4g} l^3, surface tension {cs} l, electrostatic {ce:.4g} l^2, magnetic {cm:.4g} l^4, viscous {cv:.4g} l")
print(f"  gravity = surface tension at l = {math.sqrt(cs / cg) * 1e3:.2f} mm")
print(f"  gravity = electrostatic at l = {ce / cg * 1e3:.2f} mm")
print(f"  electrostatic = magnetic at l = {math.sqrt(ce / cm) * 1e3:.2f} mm")
print(f"  gravity = viscous drag (1 mm/s, water) at l = {math.sqrt(cv / cg) * 1e6:.0f} um")
ce2 = 0.5 * eps0 * (1e8) ** 2
print(f"  with 1e8 V/m: electrostatic = magnetic at l = {math.sqrt(ce2 / cm) * 1e3:.1f} mm")

print("== Worked check: 1 cm silicon cube shrunk 100x to 100 um ==")
for l in (1e-2, 1e-4):
    Fg, Fs, Fe, Fm = cg * l**3, cs * l, ce * l**2, cm * l**4
    print(f"  l = {l:g} m: A/V = {6 / l:.4g}, weight {Fg:.4g} N, surface {Fs:.3g} N, "
          f"electrostatic {Fe:.3g} N, magnetic {Fm:.3g} N, Fs/Fg = {Fs / Fg:.3g}, Fe/Fm = {Fe / Fm:.3g}, "
          f"a_grav = {Fg / (rho_si * l**3):.2f}, a_es = {Fe / (rho_si * l**3):.3g} m/s^2, tau_th = {l**2 / Dth:.3g} s")
