"""C4 check: surface tension, capillarity, droplets and electrokinetics.

Recomputes every number in the Intuitive examples and the Worked check of
docs/C4-surface-tension-capillarity-droplets-and-electrokinetics.md.
Run:  python scripts/checks/C4_check.py
"""
import math

g_grav = 9.81            # m/s^2
gamma_w = 0.072          # N/m, water-air at ~25 C
rho_w = 1000.0           # kg/m^3
mu_w = 1.0e-3            # Pa s
eps0 = 8.854e-12         # F/m
eps_r_w = 78.5           # water at 25 C
kB = 1.380649e-23        # J/K
T = 298.15               # K
NA = 6.02214e23          # 1/mol
qe = 1.602177e-19        # C


def head(t):
    print("\n== " + t + " ==")


def rise(gamma, theta_deg, rho, r):
    """Jurin's law h = 2 gamma cos(theta) / (rho g r)."""
    return 2 * gamma * math.cos(math.radians(theta_deg)) / (rho * g_grav * r)


head("1. Laplace pressure 2 gamma / r (water)")
for r, lab in ((1e-3, "1 mm drop"), (10e-6, "10 um droplet"), (1e-6, "1 um droplet")):
    print(f"{lab:16s}: dp = {2 * gamma_w / r:10.1f} Pa")
print(f"soap bubble r=1 cm, gamma=0.025 (two surfaces, 4 gamma/r): {4 * 0.025 / 0.01:.1f} Pa")

head("2. Capillary length and Bond number")
lc = math.sqrt(gamma_w / (rho_w * g_grav))
print(f"capillary length sqrt(gamma/(rho g)) = {lc * 1e3:.2f} mm")
for L, lab in ((100e-6, "100 um channel"), (1e-2, "1 cm puddle")):
    print(f"Bo({lab}) = {rho_w * g_grav * L**2 / gamma_w:.3g}")

head("3. Capillary rise (Jurin)")
print(f"glass r=0.5 mm, theta=0     : h = {rise(gamma_w, 0, rho_w, 0.5e-3) * 1e3:.1f} mm")
print(f"glass r=0.1 mm, theta=0     : h = {rise(gamma_w, 0, rho_w, 0.1e-3) * 1e3:.1f} mm")
print(f"xylem r=20 um, theta=0      : h = {rise(gamma_w, 0, rho_w, 20e-6):.3f} m")
print(f"PDMS r=0.5 mm, theta=110    : h = {rise(gamma_w, 110, rho_w, 0.5e-3) * 1e3:.1f} mm")
r100 = 2 * gamma_w / (rho_w * g_grav * 100)
print(f"radius needed for 100 m      : r = {r100 * 1e6:.3f} um")
print(f"tension a 5 nm cell-wall pore can hold, 2 gamma/r = {2 * gamma_w / 5e-9 / 1e6:.1f} MPa")
print(f"hydrostatic tension for 100 m: rho g h = {rho_w * g_grav * 100 / 1e6:.2f} MPa")
print("widget tubes (water, theta=0):")
for r in (0.4e-3, 0.8e-3, 1.6e-3):
    print(f"   r = {r * 1e3:.1f} mm -> h = {rise(gamma_w, 0, rho_w, r) * 1e3:.1f} mm")
print(f"mercury in glass r=0.4 mm, theta=140, gamma=0.485, rho=13534: h = {rise(0.485, 140, 13534, 0.4e-3) * 1e3:.1f} mm")
print(f"ethanol r=0.4 mm, theta=0, gamma=0.022, rho=789: h = {rise(0.022, 0, 789, 0.4e-3) * 1e3:.1f} mm")

head("4. Young and Cassie-Baxter (lotus)")
th, f = 110.0, 0.1
cs = f * (math.cos(math.radians(th)) + 1) - 1
print(f"wax theta=110, solid fraction f=0.1 -> cos theta* = {cs:.4f}, theta* = {math.degrees(math.acos(cs)):.1f} deg")

head("5. Washburn wicking in paper")
r_eff = 0.5e-6
k = gamma_w * r_eff * 1.0 / (2 * mu_w)   # L^2 = k t
print(f"k = gamma r cos(theta)/(2 mu) = {k:.2e} m^2/s")
for L in (0.01, 0.04):
    print(f"water reaches {L * 100:.0f} cm in t = L^2/k = {L**2 / k:.1f} s")
print(f"front speed at 4 cm: dL/dt = k/(2L) = {k / (2 * 0.04) * 1e3:.3f} mm/s")
mu_b = 3.5e-3
print(f"whole blood (mu=3.5 mPa s) to 4 cm: {0.04**2 / (gamma_w * r_eff / (2 * mu_b)):.0f} s")

head("6. Capillary number")
print(f"water, 1 mm/s: Ca = {mu_w * 1e-3 / gamma_w:.2e}")
w, h = 100e-6, 50e-6
mu_oil, gam_ow = 5e-3, 5e-3
Qc = 2e-9 / 60      # 2 uL/min
Qd = 1e-9 / 60      # 1 uL/min
U = Qc / (w * h)
Ca = mu_oil * U / gam_ow
print(f"oil Qc=2 uL/min in 100x50 um: U = {U * 1e3:.2f} mm/s, Ca = {Ca:.2e}")

head("7. T-junction (squeezing regime)  L/w = 1 + alpha Qd/Qc, alpha = 1")
L = w * (1 + Qd / Qc)
V = w * h * L
fdrop = Qd / V
print(f"L = {L * 1e6:.0f} um, V = w h L = {V * 1e12:.2f} nL, f = Qd/V = {fdrop:.1f} Hz")
print(f"spacing (centre to centre) = L (1 + Qc/Qd) = {L * (1 + Qc / Qd) * 1e6:.0f} um")
print(f"equal-volume sphere diameter = {(6 * V / math.pi) ** (1 / 3) * 1e6:.0f} um")

head("8. Digital PCR (Poisson)")
Ndrop, pos = 20000, 6000
p = pos / Ndrop
lam = -math.log(1 - p)
print(f"fraction positive {p:.2f} -> lambda = -ln(1-p) = {lam:.4f} copies/droplet")
print(f"concentration = lambda / V = {lam / (V * 1e9):.0f} copies/uL  (V in uL = {V * 1e9:.2e})")
print(f"naive count (positives only) would say {pos / (Ndrop * V * 1e9):.0f} copies/uL")

head("9. Electrowetting (Young-Lippmann)")
d, er, th0 = 1e-6, 3.0, 120.0
for Vv in (0, 30, 60):
    c = math.cos(math.radians(th0)) + eps0 * er * Vv**2 / (2 * gamma_w * d)
    print(f"V = {Vv:3d} V: cos theta = {c:.3f}, theta = {math.degrees(math.acos(c)):.1f} deg")

head("10. Debye length")
def debye(c_molar):
    c = c_molar * 1000.0
    return math.sqrt(eps0 * eps_r_w * kB * T / (2 * NA * qe**2 * c))
print(f"prefactor: lambda_D = {debye(1.0) * 1e9:.3f} nm / sqrt(c in M)")
for c, lab in ((0.15, "saline 150 mM"), (1e-3, "1 mM buffer"), (1e-6, "DI water ~1 uM (CO2)"), (1e-7, "ideal pure water 0.1 uM")):
    print(f"{lab:26s}: lambda_D = {debye(c) * 1e9:8.2f} nm")

head("11. Electro-osmotic flow")
zeta, E = -0.050, 1e4   # V, V/m (100 V/cm)
u_eo = -eps0 * eps_r_w * zeta * E / mu_w
mob = -eps0 * eps_r_w * zeta / mu_w
print(f"u_eo = -eps0 eps_r zeta E / mu = {u_eo * 1e3:.3f} mm/s, mobility = {mob:.3e} m^2/(V s)")

head("12. Capillary electrophoresis")
Lc, Vcap = 0.5, 25e3
Ec = Vcap / Lc
for lab, mep in (("anion A", -2.0e-8), ("anion B", -2.2e-8)):
    u = (mob + mep) * Ec
    print(f"{lab}: net mobility {mob + mep:.3e}, u = {u * 1e3:.3f} mm/s, arrival t = {Lc / u:.0f} s")

head("WORKED CHECK: force balance in a 0.5 mm glass tube")
r = 0.5e-3
hh = rise(gamma_w, 0, rho_w, r)
Fg = 2 * math.pi * r * gamma_w
W = rho_w * g_grav * math.pi * r**2 * hh
print(f"h = {hh * 1e3:.2f} mm, F_gamma = 2 pi r gamma = {Fg * 1e6:.1f} uN, weight = {W * 1e6:.1f} uN, mass = {W / g_grav * 1e6:.1f} mg")
print(f"Laplace under meniscus 2 gamma/r = {2 * gamma_w / r:.0f} Pa,  rho g h = {rho_w * g_grav * hh:.0f} Pa")
print(f"Washburn check: 4 cm at k=1.8e-5 -> {0.04**2 / k:.1f} s; 2 cm -> {0.02**2 / k:.1f} s (4x shorter)")

head("SELF-TEST answers")
print(f"Q1: 6 cm -> {60 * 4} s; 3x viscous, 3 cm -> {60 * 3} s")
print(f"Q2: glass r=0.2 mm -> {rise(gamma_w, 0, rho_w, 0.2e-3) * 1e3:.1f} mm; PDMS 110 -> {rise(gamma_w, 110, rho_w, 0.2e-3) * 1e3:.1f} mm")
print(f"Q3: Debye at 1.5 mM = {debye(1.5e-3) * 1e9:.2f} nm")
