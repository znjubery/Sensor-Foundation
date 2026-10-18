"""B3 check: recompute every number in docs/B3-micromechanics-beams-springs-and-resonators.md (standard library only)."""
import math

E, rho = 169e9, 2330.0
kT = 1.380649e-23 * 298.15
beta1 = 1.875104
c_f = beta1**2 / (2 * math.pi) / math.sqrt(12)
v = math.sqrt(E / rho)


def cant(L, w, t):
    k = E * w * t**3 / (4 * L**3)
    f0 = c_f * t / L**2 * v
    m = rho * L * w * t
    meff = k / (2 * math.pi * f0) ** 2
    return k, f0, m, meff


print("== Example: the reference cantilever L=200, w=20, t=2 um ==")
k, f0, m, meff = cant(200e-6, 20e-6, 2e-6)
print(f"  k = {k:.4f} N/m, f0 = {f0 / 1e3:.2f} kHz, m = {m:.4g} kg, m_eff = {meff:.4g} kg (= {meff / m:.4f} m)")
F = 1e-6
x = F / k
sig = 6 * F * 200e-6 / (20e-6 * (2e-6) ** 2)
print(f"  F = 1 uN: tip deflection {x * 1e6:.3f} um, root stress {sig / 1e6:.1f} MPa, strain {sig / E * 1e6:.1f} microstrain")
k2, f2, _, _ = cant(200e-6, 20e-6, 4e-6)
print(f"  t doubled: k = {k2:.3f} N/m (x{k2 / k:.0f}), f0 = {f2 / 1e3:.1f} kHz (x{f2 / f0:.0f})")
k3, f3, _, _ = cant(400e-6, 20e-6, 2e-6)
print(f"  L doubled: k = {k3:.4f} N/m (x1/{k / k3:.0f}), f0 = {f3 / 1e3:.2f} kHz (x1/{f0 / f3:.0f})")

print("== AFM cantilevers ==")
for L, w, t in ((450e-6, 50e-6, 2e-6), (125e-6, 30e-6, 4e-6)):
    kk, ff, _, _ = cant(L, w, t)
    print(f"  L={L * 1e6:.0f} w={w * 1e6:.0f} t={t * 1e6:.0f} um: k = {kk:.3g} N/m, f0 = {ff / 1e3:.0f} kHz")

print("== Spring family (same beam L=200, w=20, t=2 um) ==")
IA = 20e-6 * (2e-6) ** 3 / 12
for name, c in (("cantilever", 3), ("guided", 12), ("folded (4 folds)", 24), ("fixed-fixed centre", 192)):
    print(f"  {name}: {c} E I_A / L^3 = {c * E * IA / (200e-6) ** 3:.3f} N/m")

print("== Resonance ==")
for Q in (0.5, 1 / math.sqrt(2), 1, 10, 100):
    r = 1.0
    X = 1 / math.sqrt((1 - r**2) ** 2 + (r / Q) ** 2)
    print(f"  Q = {Q:.3g}: X(w0)/(F/k) = {X:.3g}")
Q = 100
print(f"  Q = 100 at f0 = 68.8 kHz: bandwidth {f0 / Q:.0f} Hz, ring-down tau = 2Q/w0 = {2 * Q / (2 * math.pi * f0) * 1e3:.3f} ms")
print(f"  quartz tuning fork 32768 Hz, Q = 1e5: bandwidth {32768 / 1e5:.3f} Hz, tau = {2e5 / (2 * math.pi * 32768):.2f} s")
for r in (0.5, 2.0):
    X = 1 / math.sqrt((1 - r**2) ** 2 + (r / 10) ** 2)
    ph = math.degrees(math.atan2(r / 10, 1 - r**2))
    print(f"  Q = 10, r = {r}: X/(F/k) = {X:.4f}, phase = {ph:.1f} deg")

print("== Thermomechanical noise (reference cantilever, Q = 100) ==")
b = math.sqrt(k * meff) / 100
Fn = math.sqrt(4 * kT * b)
print(f"  kT = {kT:.4g} J, b = {b:.4g} N s/m, force noise sqrt(4kTb) = {Fn * 1e15:.1f} fN/rtHz")
print(f"  x_rms = sqrt(kT/k) = {math.sqrt(kT / k) * 1e9:.3f} nm")
print(f"  AFM k = 0.1 N/m: x_rms = {math.sqrt(kT / 0.1) * 1e9:.2f} nm")
print(f"  thermal peak amplitude density at f0: Q sqrt(4kTb)/k = {100 * Fn / k * 1e12:.2f} pm/rtHz")

print("== Mass sensing ==")
dm = 1e-15
df = -f0 * dm / (2 * meff)
print(f"  add 1 pg to m_eff = {meff * 1e15:.0f} pg: df/f0 = {-dm / (2 * meff):.3g}, df = {df:.2f} Hz")
fq, vq, rq = 5e6, 3340.0, 2648.0
tq = vq / (2 * fq)
mq = rq * tq           # kg/m^2
print(f"  QCM 5 MHz: thickness {tq * 1e6:.0f} um, mass/area {mq * 100:.2f} mg/cm^2")
dm_a = 100e-9 * 1e-3 / 1e-4   # 100 ng/cm^2 in kg/m^2
print(f"  100 ng/cm^2 -> df = -f0 dm/m_q = {-fq * dm_a / mq:.2f} Hz; sensitivity {fq * 1e-9 / mq * 1e4:.1f} Hz cm^2/ug")

print("== Worked check: L=300, w=10, t=3 um ==")
k, f0, m, meff = cant(300e-6, 10e-6, 3e-6)
print(f"  I_A = {10e-6 * (3e-6) ** 3 / 12:.4g} m^4, k = {k:.4f} N/m, f0 = {f0 / 1e3:.2f} kHz, m = {m:.4g} kg, m_eff = {meff:.4g} kg")
print(f"  F = 0.2 uN -> x = {0.2e-6 / k * 1e6:.3f} um, root stress = {6 * 0.2e-6 * 300e-6 / (10e-6 * (3e-6) ** 2) / 1e6:.2f} MPa, strain = {6 * 0.2e-6 * 300e-6 / (10e-6 * (3e-6) ** 2) / E * 1e6:.1f} microstrain")
print(f"  Q = 50: X at resonance for F0 = 1 nN = {50 * 1e-9 / k * 1e9:.2f} nm; bandwidth {f0 / 50:.0f} Hz")
dm = 10e-15
print(f"  add 10 pg: df = {-f0 * dm / (2 * meff):.1f} Hz")

print("== RLC analogy: L_ind = 1 mH, C = 1 uF, R = 10 ohm ==")
Li, Cc, R = 1e-3, 1e-6, 10
print(f"  f0 = {1 / (2 * math.pi * math.sqrt(Li * Cc)):.0f} Hz, Q = {math.sqrt(Li / Cc) / R:.2f}")

print("== Self-test and side numbers ==")
print(f"  4x stiffer: t x {4 ** (1 / 3):.3f}")
print(f"  f0 = 100 kHz, Q = 1e4: bandwidth {1e5 / 1e4:.0f} Hz, tau = {2e4 / (2 * math.pi * 1e5) * 1e3:.1f} ms")
print(f"  1 MHz, 1 ng, -5 Hz: dm = {2 * 1e-12 * 5 / 1e6 * 1e3 * 1e15:.1f} fg")
print(f"  piezoresistor GF 100 at 88.8 microstrain: {100 * 88.8e-6 * 100:.2f} %")
print(f"  1 uN = weight of {1e-6 / 9.81 * 1e6:.3f} mg")
