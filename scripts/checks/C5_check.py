"""C5 check: lab-on-a-chip, organ-on-chip and integrated sensing systems.

Recomputes every number in the Intuitive examples and the Worked check of
docs/C5-lab-on-a-chip-organ-on-chip-and-integrated-sensing-systems.md.
Run:  python scripts/checks/C5_check.py
"""
import math

NA = 6.02214e23          # 1/mol
qe = 1.602177e-19        # C
F = 96485.0              # C/mol (Faraday)
kB = 1.380649e-23
T = 298.15
kT = kB * T
mu_w = 1.0e-3            # Pa s
gamma_w = 0.072


def head(t):
    print("\n== " + t + " ==")


head("1. Sampling statistics (Poisson): river water E. coli")
V = 10e-9 * 1e6          # 10 uL = 1e-8 m^3 = 0.01 mL
c = 100.0                # cells per mL
lam = c * V
print(f"100 CFU/mL in 10 uL: lambda = {lam:.2f}, P(>=1 cell) = {1 - math.exp(-lam):.3f}")
print(f"lambda needed for 95% detection: {-math.log(0.05):.2f}")
print(f"volume needed at 100 CFU/mL: {3 / c * 1000:.0f} uL;  at 1 CFU/100 mL: {3 / 0.01:.0f} mL")

head("2. Diffusion time across a 50 um channel, t = h^2/(2D)")
h = 50e-6
for lab, D in (("glucose", 6.7e-10), ("antibody IgG", 4e-11)):
    print(f"{lab:12s} D={D:.1e}: t = {h**2 / (2 * D):.2f} s")

head("3. Mixing across 100 um, and after a herringbone mixer (10 um striations)")
Dp = 4e-11
print(f"protein across 100 um: {(100e-6)**2 / (2 * Dp):.0f} s; across 10 um: {(10e-6)**2 / (2 * Dp):.2f} s")
print(f"Pe = U w / D at U=1 mm/s, w=100 um: {1e-3 * 100e-6 / Dp:.0f}")

head("4. Damkohler number Da = k_on b_m delta / D (surface capture of a protein)")
kon = 1e6 * 1e-3 / NA      # 1e6 /M/s -> m^3/s per molecule
bm = 1e16                  # receptors per m^2 (1e4 per um^2)
delta = 10e-6
Da = kon * bm * delta / Dp
print(f"k_on = {kon:.3e} m^3/s, Da = {Da:.2f}  -> transport-limited (Da > 1)")

head("5. Molecules collected by a 100x100 um sensor from still liquid: N = 2 c A sqrt(D t / pi)")
A = (100e-6) ** 2
t = 600.0
for lab, cM in (("1 fM", 1e-15), ("1 pM", 1e-12), ("1 nM", 1e-9)):
    cn = cM * 1e3 * NA     # molecules per m^3
    N = 2 * cn * A * math.sqrt(Dp * t / math.pi)
    print(f"{lab}: c = {cn:.3e} /m^3 ({cn * 1e-12:.2f} per nL), N(10 min) = {N:.3g}")

head("6. Glucose strip: Cottrell current and the signal chain")
n, Ag, Dg, tc = 2, 1e-6, 6.7e-10, 5.0
cg = 5.0                       # mM = mol/m^3
k_cott = math.sqrt(Dg / (math.pi * tc))
I = n * F * Ag * cg * k_cott
print(f"sqrt(D/(pi t)) = {k_cott:.3e} m/s, I(5 mM) = {I * 1e6:.2f} uA, per mM = {I / cg * 1e6:.3f} uA/mM")
flux = I / (n * qe)
print(f"molecules oxidised per second = I/(n q_e) = {flux:.3g} /s  (= {flux / cg:.3g} per s per mM)")
Rf, Nb, Vref = 82e3, 12, 3.3
Vout = I * Rf
lsb = Vref / 2**Nb
counts = Vout / lsb
print(f"R_f = 82 kOhm: V = {Vout:.3f} V, LSB = {lsb * 1e3:.3f} mV, counts = {counts:.0f}")
Ifs = n * F * Ag * 30 * k_cott
print(f"full scale 30 mM: I = {Ifs * 1e6:.1f} uA, V = {Ifs * Rf:.2f} V (Vref 3.3 V); largest R_f = {Vref / Ifs / 1e3:.0f} kOhm")
S_counts = counts / cg
print(f"overall sensitivity = {S_counts:.1f} counts/mM")
# stage gains (molecular flux route)
g1 = flux / cg              # molecules/s per mM
g2 = n * qe                 # A per (molecule/s)
g3 = Rf                     # V per A
g4 = 1 / lsb                # counts per V
print(f"gains: {g1:.3g} (1/s per mM) x {g2:.3g} (C) x {g3:.3g} (Ohm) x {g4:.4g} (1/V) = {g1 * g2 * g3 * g4:.1f} counts/mM")

head("7. Noise budget and LOD (referred to the current)")
df = 10.0
s_blank = 20e-9
s_john = math.sqrt(4 * kT * df / Rf)
s_adc = lsb / math.sqrt(12) / Rf
s_tot = math.sqrt(s_blank**2 + s_john**2 + s_adc**2)
S_I = I / cg
print(f"blank {s_blank * 1e9:.1f} nA, Johnson(R_f) {s_john * 1e12:.2f} pA, ADC quantisation {s_adc * 1e9:.2f} nA, total {s_tot * 1e9:.2f} nA")
print(f"LOD = 3 sigma / S = {3 * s_tot / S_I:.4f} mM  (= {3 * s_tot / S_I * 18.016:.2f} mg/dL)")
lsb8 = Vref / 2**8
s_adc8 = lsb8 / math.sqrt(12) / Rf
s_tot8 = math.sqrt(s_blank**2 + s_john**2 + s_adc8**2)
print(f"8-bit ADC: LSB {lsb8 * 1e3:.1f} mV, quantisation {s_adc8 * 1e9:.1f} nA, LOD = {3 * s_tot8 / S_I:.3f} mM")

head("8. PCR on a chip: thermal time constant tau ~ L^2/alpha_th, ramps, doubling")
alpha = 1.43e-7
for lab, L in (("50 uL tube (L ~ 2 mm)", 2e-3), ("chip chamber (L ~ 100 um)", 100e-6)):
    print(f"{lab}: tau = {L**2 / alpha:.3g} s")
cycles, swing = 30, 80.0
for lab, rate in (("block 3 C/s", 3.0), ("chip 30 C/s", 30.0)):
    print(f"{lab}: ramping time for 30 cycles = {cycles * swing / rate:.0f} s = {cycles * swing / rate / 60:.1f} min")
print(f"copies after 30 perfect cycles: 2^30 = {2**30:.3e}")

head("9. Coulter counter")
rho_e = 0.67           # Ohm m (PBS)
Dap, Lap = 50e-6, 60e-6
Rap = 4 * rho_e * Lap / (math.pi * Dap**2)
print(f"aperture resistance R = 4 rho_e L/(pi D^2) = {Rap / 1e3:.2f} kOhm")
I0 = 0.1e-3
for lab, vol in (("platelet 10 fL", 10e-18), ("red cell 90 fL", 90e-18), ("white cell 524 fL", 524e-18)):
    d = (6 * vol / math.pi) ** (1 / 3)
    dR = 4 * rho_e * d**3 / (math.pi * Dap**4)
    print(f"{lab}: d = {d * 1e6:.2f} um, dR = {dR:.2f} Ohm, dR/R = {dR / Rap * 100:.3f} %, dV at 0.1 mA = {dR * I0 * 1e3:.2f} mV")
print(f"voltage across aperture at 0.1 mA = {Rap * I0:.2f} V")
rate = 5e6 / 1e4 * 1.0     # cells per uL after 1:10000 dilution, times 1 uL/s
Vap = math.pi / 4 * Dap**2 * Lap * 1e9   # uL
lam_ap = 5e6 / 1e4 * Vap
print(f"count rate = {rate:.0f} cells/s; aperture volume = {Vap * 1e3:.3f} nL; mean cells inside = {lam_ap:.3f}; P(coincidence) = {1 - math.exp(-lam_ap):.3f}")

head("10. Organ-on-chip wall shear stress tau_w = 6 mu Q/(w h^2)")
w, hh = 1e-3, 100e-6
Q = 1.0 * w * hh**2 / (6 * mu_w)
print(f"Q for 1 Pa: {Q:.3e} m^3/s = {Q * 1e9 * 60:.0f} uL/min")

head("11. Pressure to drive the serpentine, R_hyd = 12 mu L / (w h^3 (1 - 0.63 h/w))")
Ls, ws, hs = 0.05, 100e-6, 50e-6
R = 12 * mu_w * Ls / (ws * hs**3 * (1 - 0.63 * hs / ws))
Qs = 1e-9 / 60
print(f"R_hyd = {R:.3e} Pa s/m^3, dp at 1 uL/min = {R * Qs:.0f} Pa")

head("12. Capillary stop valve (hydrophobic patch, theta=110) burst pressure 2 gamma |cos| (1/w + 1/h)")
th = math.radians(110)
pb = 2 * gamma_w * abs(math.cos(th)) * (1 / ws + 1 / hs)
print(f"burst pressure = {pb:.0f} Pa")

head("13. Sweat patch fill time")
rate_s, area, vol = 1.0, 2.0, 20.0     # uL/(cm^2 min), cm^2, uL
print(f"fill time = {vol / (rate_s * area):.0f} min")

head("14. Nitrate limit")
print(f"50 mg/L nitrate = {50 / 62.0:.3f} mM")

head("WORKED CHECK: multiply the stage gains")
print(f"{g1:.4g} x {g2:.4g} = {g1 * g2 * 1e6:.4f} uA/mM;  x {Rf:.0f} = {g1 * g2 * g3:.4f} V/mM;  x {g4:.2f} = {g1 * g2 * g3 * g4:.1f} counts/mM")
print(f"5 mM -> {5 * g1 * g2 * g3 * g4:.0f} counts;  LOD = {3 * s_tot / S_I:.3f} mM -> {3 * s_tot / S_I * S_counts:.1f} counts")

head("SELF-TEST answers")
print(f"Q1: 95% detection in 5 uL needs c >= 3/5 uL = {3 / 5:.1f} per uL = {3 / 5 * 1000:.0f} per mL")
print(f"Q2: R_f = 1 MOhm at 5 mM: V = {I * 1e6:.2f} V (> 3.3 V: clips); max c = {Vref / (S_I * 1e6):.2f} mM")
dR_rbc = 4 * rho_e * ((6 * 90e-18 / math.pi) ** (1 / 3)) ** 3 / (math.pi * 25e-6**4)
print(f"Q3: 25 um aperture: red-cell dR = {dR_rbc:.0f} Ohm (16x), R_ap = {4 * rho_e * Lap / (math.pi * 25e-6**2) / 1e3:.1f} kOhm (4x)")
print(f"Coulter: dR/R = 1.5 V_cell/V_ap check: {1.5 * 90e-18 / (math.pi / 4 * Dap**2 * Lap):.5f}")
print(f"optical path: 1 cm cuvette / 50 um channel = {0.01 / 50e-6:.0f}x less absorbance")
