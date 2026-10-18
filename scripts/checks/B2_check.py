"""B2 check: recompute every number in docs/B2-microfabrication-lithography-etching-deposition.md (standard library only)."""
import math

print("== Crystal geometry ==")
ang = math.degrees(math.acos(1 / math.sqrt(3)))
print(f"  angle between (100) and (111) = arccos(1/sqrt3) = {ang:.2f} deg, tan = {math.tan(math.radians(ang)):.4f} (= sqrt2 = {math.sqrt(2):.4f})")

print("== Lithography resolution ==")
for name, k1, lam, NA in (("i-line projection", 0.6, 365, 0.5), ("ArF immersion", 0.3, 193, 1.35), ("EUV", 0.4, 13.5, 0.33)):
    print(f"  {name}: R = k1 lam/NA = {k1 * lam / NA:.1f} nm")
for gap in (10e-6, 40e-6):
    print(f"  proximity, gap {gap * 1e6:.0f} um: W_min ~ sqrt(lam g) = {math.sqrt(365e-9 * gap) * 1e6:.2f} um")

print("== Oxidation (Deal-Grove, wet 1100 C, A = 0.11 um, B = 0.51 um^2/h) ==")
A, B = 0.11, 0.51
for x in (0.5, 1.0, 2.0):
    print(f"  t_ox = {x} um: time = (x^2 + A x)/B = {(x**2 + A * x) / B:.2f} h; Si consumed {0.44 * x:.2f} um")

print("== Spin coating t ~ 1/sqrt(rpm), 1.4 um at 4000 rpm ==")
for rpm in (1000, 2000, 4000, 6000):
    print(f"  {rpm} rpm: {1.4 * math.sqrt(4000 / rpm):.2f} um")

print("== LPCVD poly 2 um at 10 nm/min ==")
print(f"  {2000 / 10:.0f} min")

print("== KOH ==")
for W in (10, 100):
    print(f"  V-groove: W = {W} um -> depth (W/2) tan54.74 = W/sqrt2 = {W / math.sqrt(2):.2f} um")
d = 525 - 20
Wtop = 1000 + math.sqrt(2) * d
print(f"  membrane: etch depth {d} um, bottom 1000 um -> top opening {Wtop:.1f} um; at 1 um/min: {d} min = {d / 60:.1f} h")

print("== Isotropic undercut ==")
print(f"  opening 4 um, depth 10 um -> top width {4 + 2 * 10} um")

print("== DRIE ==")
print(f"  2 um x 40 um trench: aspect {40 / 2:.0f}; 0.5 um/cycle -> {40 / 0.5:.0f} cycles; 8 s/cycle -> {40 / 0.5 * 8:.0f} s = {40 / 0.5 * 8 / 60:.1f} min")

print("== Stiction ==")
gam, gap = 0.072, 2e-6
dp = 2 * gam / gap
F = dp * (100e-6) ** 2
print(f"  Laplace pressure 2 gamma/g = {dp / 1e3:.0f} kPa; force on 100x100 um plate = {F * 1e6:.0f} uN")
print(f"  spring k = 1 N/m over 2 um: {1 * gap * 1e6:.0f} uN -> capillary wins x{F / (1 * gap):.0f}")

print("== Dies per wafer, yield, cost ==")
def dies(dmm, a_mm2):
    return math.floor(math.pi * (dmm / 2) ** 2 / a_mm2 - math.pi * dmm / math.sqrt(2 * a_mm2))
for side in (2, 10):
    a = side * side
    N = dies(200, a)
    Y = math.exp(-0.5 * a / 100)
    print(f"  200 mm wafer, {side}x{side} mm die: N = {N}, yield exp(-0.5/cm^2 * {a / 100} cm^2) = {Y:.4f}, good = {N * Y:.0f}, cost/good die at EUR 2000 = EUR {2000 / (N * Y):.3f}")

print("== Worked check ==")
W = 60
d = W / 2 * math.tan(math.radians(ang))
print(f"  W = {W} um V-groove depth = (W/2) tan = {d:.2f} um, sidewall length = {W / 2 / math.cos(math.radians(ang)):.2f} um")
print(f"  check: side wall run = depth / tan = {d / math.tan(math.radians(ang)):.2f} um (= W/2)")
print(f"  KOH time at 1 um/min: {d:.1f} min; mask opening for a 60 um-wide groove floor at depth 20 um: {60 + math.sqrt(2) * 20:.2f} um")
print(f"  wrong formula W/(2 tan) would give {W / (2 * math.sqrt(2)):.2f} um")

print("== Self-test ==")
print(f"  200 um square pyramid depth = {100 * math.sqrt(2):.1f} um")
for side in (10, 5):
    a = side * side; N = dies(200, a); Y = math.exp(-0.5 * a / 100)
    print(f"  {side} mm die: N = {N}, Y = {Y:.3f}, good = {N * Y:.0f}")
