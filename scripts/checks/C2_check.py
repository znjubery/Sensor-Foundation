"""C2 check: Hagen-Poiseuille, rectangular channels, hydraulic circuits, compliance, wall shear, xylem.

    python scripts/checks/C2_check.py
"""
import math

MU_W, RHO_W = 1.0e-3, 1000.0
MU_BLOOD = 3.5e-3
UL_MIN = 1e-9 / 60          # 1 uL/min in m^3/s


def R_circ(mu, L, R):
    return 8 * mu * L / (math.pi * R ** 4)


def R_rect(mu, L, w, h):
    """Approximate resistance of a rectangular channel, h <= w (within 0.2 % for h/w <= 0.5, 14 % high for a square)."""
    return 12 * mu * L / (w * h ** 3 * (1 - 0.63 * h / w))


def R_rect_exact(mu, L, w, h, nmax=201):
    s = sum(math.tanh(n * math.pi * w / (2 * h)) / n ** 5 for n in range(1, nmax, 2))
    return 12 * mu * L / (w * h ** 3 * (1 - 192 * h / (math.pi ** 5 * w) * s))


print("== (1) circular tube R = 50 um, L = 1 cm, water, dp = 1 kPa ==")
R, L, dp = 50e-6, 1e-2, 1e3
Rh = R_circ(MU_W, L, R)
Q = dp / Rh
umax = dp * R ** 2 / (4 * MU_W * L)
umean = Q / (math.pi * R ** 2)
print(f"R_hyd = {Rh:.3e} Pa s/m^3")
print(f"Q = {Q:.3e} m^3/s = {Q * 1e9:.3f} uL/s = {Q / UL_MIN:.1f} uL/min")
print(f"u_max = {umax * 1e3:.1f} mm/s, mean = {umean * 1e3:.2f} mm/s, ratio = {umean / umax:.3f}")
print(f"Re = {RHO_W * umean * 2 * R / MU_W:.2f}")
print(f"halve the radius: Q falls by {R_circ(MU_W, L, R / 2) / Rh:.0f}x")

print("\n== (2) rectangular w = 100 um, h = 50 um, L = 1 cm ==")
w, h = 100e-6, 50e-6
Ra, Re_ = R_rect(MU_W, L, w, h), R_rect_exact(MU_W, L, w, h)
print(f"R_hyd approx = {Ra:.3e}, exact series = {Re_:.3e}  (diff {100 * (Ra / Re_ - 1):.2f} %)")
Q = 10 * UL_MIN
print(f"10 uL/min needs dp = {Q * Ra:.0f} Pa = {Q * Ra / 1e3:.2f} kPa")
U = Q / (w * h)
print(f"mean speed = {U * 1e3:.1f} mm/s")
Ra2 = R_rect(MU_W, L, w, h / 2)
print(f"h = 25 um: R_hyd = {Ra2:.3e}, ratio = {Ra2 / Ra:.2f}x")
for hw in (0.1, 0.25, 0.5, 1.0):
    a, e = R_rect(1, 1, 1, hw), R_rect_exact(1, 1, 1, hw)
    print(f"  h/w = {hw:4.2f}: approx/exact = {a / e:.4f}")

print("\n== (3) series and parallel ==")
R1 = R_rect(MU_W, 1e-2, w, h)
R2 = R_rect(MU_W, 2e-2, w, h)
print(f"R1 (1 cm) = {R1:.3e}, R2 (2 cm) = {R2:.3e}")
print(f"series R1 + R1 = {2 * R1:.3e}; two 1-cm channels in parallel = {R1 / 2:.3e}")
Rpar = 1 / (1 / R2 + 1 / R2)
Rtot = R1 + Rpar + R1
dp = 5e3
Qt = dp / Rtot
print(f"network R1 + (R2||R2) + R1 = {Rtot:.3e}; at 5 kPa Q = {Qt / UL_MIN:.2f} uL/min, each branch {Qt / 2 / UL_MIN:.2f} uL/min")
pA = dp - Qt * R1
pB = Qt * R1
print(f"node pressures: pA = {pA:.0f} Pa, pB = {pB:.0f} Pa")

print("\n== (4) compliance: RC time constant ==")
C_tube = 1e-9 / 1e5            # 1 uL per bar
V_bub = 10e-9                  # 10 uL air bubble at 1 bar, isothermal: C = V/p
C_bub = V_bub / 1e5
for name, C in (("tubing 1 uL/bar", C_tube), ("tubing + 10 uL bubble", C_tube + C_bub)):
    tau = Rtot * C
    print(f"{name:22s} C = {C:.1e} m^3/Pa, tau = R C = {tau:.2f} s, 99 % settled after {tau * math.log(100):.1f} s")

print("\n== (5) wall shear stress ==")
wch, hch = 1e-3, 100e-6
tau_target = 1.0
Qn = tau_target * wch * hch ** 2 / (6 * MU_W)
print(f"organ chip 1 mm x 100 um, tau_w = 1 Pa needs Q = {Qn / UL_MIN:.0f} uL/min")
Rc, Uc = 4e-6, 0.5e-3
print(f"capillary R = 4 um, U = 0.5 mm/s, blood: tau_w = 4 mu U/R = {4 * MU_BLOOD * Uc / Rc:.2f} Pa")
Ra_, Ua = 0.0125, 0.2
print(f"aorta R = 12.5 mm, U = 0.2 m/s: tau_w = {4 * MU_BLOOD * Ua / Ra_:.2f} Pa")

print("\n== (6) xylem ==")
Rx, Ux = 20e-6, 1e-3
grad = 8 * MU_W * Ux / Rx ** 2
H = 30.0
print(f"vessel R = 20 um, sap 1 mm/s: dp/L = {grad:.0f} Pa/m = {grad / 1e6:.3f} MPa/m")
print(f"30 m tree: friction {grad * H / 1e6:.2f} MPa + gravity {RHO_W * 9.81 * H / 1e6:.2f} MPa = {(grad * H + RHO_W * 9.81 * H) / 1e6:.2f} MPa")
print(f"sap speed 1 mm/s = {Ux * 3600:.1f} m/h")
print(f"Murray: two equal daughters have r = {2 ** (-1 / 3):.3f} r_parent")
print(f"one vessel of radius R vs 4 vessels of R/2 (same total area): the big one carries {1 / (4 * 0.5 ** 4):.0f}x more")

print("\n== worked check: two channels in parallel then one in series ==")
Ra = R_rect(MU_W, 1e-2, 100e-6, 50e-6)
print(f"R(1 cm) = {Ra:.3e}")
Rpar = Ra / 2
Rt = Ra + Rpar
Q = 20 * UL_MIN
print(f"total R = {Rt:.3e}; 20 uL/min needs {Q * Rt:.0f} Pa; mid node at {Q * Rpar:.0f} Pa; each branch {10:.0f} uL/min")
print("electrical twin: total R =", f"{Rt * UL_MIN / 1e3:.3f} MOhm (kPa per uL/min)")

print("== notes and self-test ==")
print(f"height +-10 %: flow x {1.1 ** 3:.2f} / x {0.9 ** 3:.2f}")
print(f"square channel: 12 mu L/(w h^3) without bracket is {R_rect_exact(1, 1, 1, 1) / (12):.2f}x too small")
Rt_ = 8 * MU_W * 0.3 / (math.pi * (125e-6) ** 4)
print(f"tubing 250 um ID, 30 cm: R_hyd = {Rt_:.2e} = {Rt_ / R_rect(MU_W, 1e-2, 100e-6, 50e-6):.2f} of one chip channel")
print(f"self-test 1: dp = {6 * UL_MIN * 5e13:.0f} Pa; Q at 2 kPa = {2000 / 5e13 / UL_MIN:.2f} uL/min")
print(f"self-test 2: 0.8^4 = {0.8 ** 4:.3f}; pressure must rise {1 / 0.8 ** 4:.2f}x")
print(f"self-test 3: tau_w at 50 uL/min = {6 * MU_W * 50 * UL_MIN / (1e-3 * (100e-6) ** 2):.2f} Pa")
