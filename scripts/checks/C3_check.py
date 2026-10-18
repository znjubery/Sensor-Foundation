"""C3 check: random walks, Stokes-Einstein, diffusion times, Peclet number, mixing lengths, herringbone, sensors.

    python scripts/checks/C3_check.py
"""
import math
import random

KB = 1.380649e-23
T = 298.15                     # 25 C
MU = 0.89e-3                   # water at 25 C, Pa s
kT = KB * T


def D_se(r, mu=MU):
    return kT / (6 * math.pi * mu * r)


print(f"k_B T at 25 C = {kT:.3e} J")

print("\n== (1) Stokes-Einstein, water at 25 C ==")
for name, r in (("glucose (r = 0.38 nm)", 0.38e-9), ("albumin (r = 3.5 nm)", 3.5e-9),
                ("antibody IgG (r = 5.5 nm)", 5.5e-9), ("virus (r = 50 nm)", 50e-9),
                ("1 um bead (r = 0.5 um)", 0.5e-6), ("bacterium (r = 1 um)", 1e-6), ("human cell (r = 5 um)", 5e-6)):
    print(f"{name:28s} D = {D_se(r):.2e} m^2/s")

print("\n== (2) how long to diffuse a distance x (1D, t = x^2 / 2D) ==")
Dg = D_se(0.38e-9)
Dalb = D_se(3.5e-9)
for x in (1e-6, 10e-6, 100e-6, 1e-3, 1e-2):
    tg, ta = x * x / (2 * Dg), x * x / (2 * Dalb)
    print(f"x = {x * 1e6:8.0f} um   glucose t = {tg:10.3g} s ({tg / 3600:.3g} h)   albumin t = {ta:10.3g} s ({ta / 3600:.3g} h)")
print(f"tea: 1 cm with D = 1e-9 -> {0.01 ** 2 / (2 * 1e-9) / 3600:.1f} h")

print("\n== (3) random walk: <x^2> = N delta^2 = 2 D t (Monte Carlo) ==")
random.seed(1)
delta, tau_s, N, M = 1.0, 1.0, 400, 20000
acc = 0.0
for _ in range(M):
    x = 0
    for _ in range(N):
        x += delta if random.random() < 0.5 else -delta
    acc += x * x
Dw = delta ** 2 / (2 * tau_s)
print(f"{M} walkers, {N} steps: <x^2> = {acc / M:.1f}  (theory N delta^2 = 2 D t = {2 * Dw * N * tau_s:.0f})")

print("\n== (4) Peclet number and mixing length in a channel ==")
w, U = 100e-6, 1e-3
for name, D in (("small molecule", 1e-9), ("protein", 5e-11)):
    Pe = U * w / D
    t = w * w / D
    print(f"{name:15s} D = {D:.0e}: Pe = {Pe:.0f}, t ~ w^2/D = {t:.0f} s, L ~ Pe w = {Pe * w * 1e3:.0f} mm, "
          f"L_90 = (ln10/pi^2) Pe w = {math.log(10) / math.pi ** 2 * Pe * w * 1e3:.2f} mm")
print(f"ln(10)/pi^2 = {math.log(10) / math.pi ** 2:.3f}")


def c_two_streams(y, x, Pe, w=1.0, modes=60):
    """two co-flowing streams (c = 1 for y > 0), side walls at +-w/2, plug flow: exact cosine/sine series."""
    s = 0.0
    for m in range(1, 2 * modes, 2):
        s += math.sin(m * math.pi * y / w) / m * math.exp(-m * m * math.pi ** 2 * x / (Pe * w))
    return 0.5 + 2 / math.pi * s


Pe = 100
for xw in (0.0, 1.0, 10.0, 23.3, 50.0):
    print(f"Pe = 100, x = {xw:5.1f} w: c at wall y = +w/2 is {c_two_streams(0.5, xw, Pe):.3f}, at y = +w/4: {c_two_streams(0.25, xw, Pe):.3f}")
print(f"interface width at x = 1 mm (Pe 100, w=100um): sqrt(4 D x / U) = {math.sqrt(4 * 1e-9 * 1e-3 / 1e-3) * 1e6:.0f} um")

print("\n== (5) herringbone toy model: striations halve every cycle lambda = 2 w ==")
w, U, D = 100e-6, 1e-3, 5e-11
lam = 2 * w
delta = math.sqrt(D * lam / U)
n = math.log2(w / delta)
print(f"Pe = {U * w / D:.0f}; diffusion finishes a stripe of delta = sqrt(D lambda/U) = {delta * 1e6:.2f} um in one cycle")
print(f"cycles needed n = log2(w/delta) = {n:.2f} -> {math.ceil(n)} cycles = {math.ceil(n) * lam * 1e3:.1f} mm")
Lplain = U * w * w / D
print(f"without mixer L ~ U w^2/D = {Lplain * 1e3:.0f} mm; ratio = {Lplain / (math.ceil(n) * lam):.0f}x shorter")
for Pe_ in (1e2, 1e3, 1e4, 1e5):
    print(f"  Pe = {Pe_:.0e}: n = 0.5 log2(Pe w/lambda) = {0.5 * math.log2(Pe_ / 2):.1f} cycles")

print("\n== (6) H-filter: small molecules cross, cells do not ==")
L_h, U_h = 1e-2, 1e-3
t_res = L_h / U_h
for name, D in (("glucose", Dg), ("albumin", Dalb), ("bacterium", D_se(1e-6))):
    print(f"{name:10s} residence {t_res:.0f} s: spreads sqrt(2 D t) = {math.sqrt(2 * D * t_res) * 1e6:.1f} um")

print("\n== (7) Taylor dispersion in a tube (R = 50 um, U = 1 mm/s) ==")
R = 50e-6
for name, D in (("glucose", Dg), ("albumin", Dalb)):
    Pe_R = U * R / D
    Deff = D * (1 + Pe_R ** 2 / 48)
    print(f"{name:8s} Pe_R = {Pe_R:.0f}, D_eff = {Deff:.2e} m^2/s = {Deff / D:.0f} x D")

print("\n== (8) diffusion to a sensor: depletion layer after t, flux ==")
c0 = 5.0                        # mM glucose = 5 mol/m^3
for t in (1.0, 10.0, 100.0):
    dl = math.sqrt(math.pi * Dg * t)
    J = c0 * math.sqrt(Dg / (math.pi * t))
    print(f"t = {t:5.0f} s: depletion thickness sqrt(pi D t) = {dl * 1e6:.0f} um, flux c0 sqrt(D/pi t) = {J:.2e} mol/(m^2 s)")

print("\n== worked check: glucose in a 200 um channel at 0.5 mm/s ==")
w, U = 200e-6, 0.5e-3
D = Dg
Pe = U * w / D
print(f"D = {D:.3e}, Pe = {Pe:.0f}, t ~ w^2/D = {w * w / D:.0f} s, L ~ Pe w = {Pe * w * 1e3:.1f} mm, "
      f"L_90 = {math.log(10) / math.pi ** 2 * Pe * w * 1e3:.1f} mm")
print(f"rms 1D distance in 1 s: sqrt(2 D t) = {math.sqrt(2 * D) * 1e6:.1f} um")

print("\n== text, widget default and self-test ==")
Pe = 1e-3 * 100e-6 / Dg
print(f"glucose, w = 100 um, U = 1 mm/s: Pe = {Pe:.0f}, L_90 = {math.log(10) / math.pi ** 2 * Pe * 100e-6 * 1e3:.2f} mm")
print(f"Schmidt number nu/D for glucose = {1e-6 / Dg:.0f}")
print(f"self-test 1: albumin across 50 um: t = {(50e-6) ** 2 / (2 * 7.0e-11):.1f} s")
print(f"self-test 3: D = 1 um^2/s -> r = {kT / (6 * math.pi * MU * 1e-12) * 1e6:.3f} um")
