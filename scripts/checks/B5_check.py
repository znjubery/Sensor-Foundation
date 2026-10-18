"""B5 MEMS microphones, pressure sensors and actuators: recompute every number in the note.

    python scripts/checks/B5_check.py
"""
import math

EPS0 = 8.854e-12
G = 9.81


def head(s):
    print("\n== " + s)


def plate(E, nu, t, r, p):
    """clamped circular plate under uniform pressure: D, centre deflection, edge and centre radial stress"""
    D = E * t ** 3 / (12 * (1 - nu ** 2))
    x0 = p * r ** 4 / (64 * D)
    s_edge = 3 * p * r ** 2 / (4 * t ** 2)
    s_ctr = 3 * (1 + nu) * p * r ** 2 / (8 * t ** 2)
    return D, x0, s_edge, s_ctr


# ── 1. piezoresistive pressure sensor (worked check) ──────────────────────────────────────────────
head("Worked check: silicon diaphragm pressure sensor")
E, nu, t, r = 160e9, 0.27, 20e-6, 500e-6
p = 100e3
D, x0, se, sc = plate(E, nu, t, r, p)
print(f"D = E t^3/(12(1-nu^2)) = {D:.3e} N m")
print(f"x0 = p r^4/(64 D) = {x0:.3e} m = {x0*1e6:.2f} um  (x0/t = {x0/t:.3f})")
print(f"edge stress 3 p r^2/(4 t^2) = {se/1e6:.1f} MPa, centre stress = {sc/1e6:.1f} MPa")
pi44h = 69e-11            # pi44/2 for p-type <110> resistors, 1/Pa
dRR = pi44h * (1 - nu) * se
print(f"dR/R = (pi44/2)(1-nu) sigma_edge = {dRR*100:.2f} %")
Vex = 3.3
Vout = Vex * dRR
print(f"full bridge Vout = Vex dR/R = {Vout*1e3:.1f} mV at 100 kPa -> {Vout*1e3/100:.2f} mV/kPa")
# barometer: 1 m of altitude
rho, = (1.225,)
dpdz = rho * G
print(f"dp/dz = rho g = {dpdz:.2f} Pa/m; one floor (3 m) = {3*dpdz:.0f} Pa")
print(f"12 Pa -> membrane moves {x0*12/p*1e9:.2f} nm, bridge changes {Vout*12/p*1e6:.1f} uV")
print(f"1 Pa rms noise -> altitude noise {1/dpdz*100:.0f} cm")
for h in (100, 1000):
    ph = 101325 * (1 - 2.25577e-5 * h) ** 5.25588
    print(f"standard atmosphere: p({h} m) = {ph:.0f} Pa  (drop {101325-ph:.0f} Pa, {(101325-ph)/h:.2f} Pa/m)")

# ── 2. TPMS ───────────────────────────────────────────────────────────────────────────────────────
head("Example: tyre pressure (TPMS)")
pg = 230e3
pa = pg + 101.3e3
T1, T2 = 293.15, 333.15
pa2 = pa * T2 / T1
print(f"230 kPa gauge = {pa/1e3:.1f} kPa absolute; 20 -> 60 C at fixed volume: {pa2/1e3:.1f} kPa abs, gauge {(pa2-101.3e3)/1e3:.0f} kPa (+{(pa2-pa)/1e3:.0f} kPa)")
print(f"230 kPa = {pg/1e5:.1f} bar = {pg/6894.76:.0f} psi")

# ── 3. blood pressure ─────────────────────────────────────────────────────────────────────────────
head("Example: blood pressure catheter")
mmHg = 133.322
for v in (80, 120):
    print(f"{v} mmHg = {v*mmHg/1e3:.2f} kPa")
Dc, x0c, sec, _ = plate(160e9, 0.27, 2e-6, 100e-6, 120 * mmHg)
print(f"catheter-tip diaphragm r = 100 um, t = 2 um at 120 mmHg: x0 = {x0c*1e9:.0f} nm, edge stress {sec/1e6:.0f} MPa")

# ── 4. microphone ─────────────────────────────────────────────────────────────────────────────────
head("Microphone: sound pressure levels")
p_ref = 20e-6
print(f"1 Pa -> {20*math.log10(1/p_ref):.2f} dB SPL")
for L in (30, 60, 94, 120):
    print(f"{L} dB SPL -> {p_ref*10**(L/20):.3g} Pa rms")
sens = 10 ** (-38 / 20)
print(f"-38 dBV/Pa = {sens*1e3:.1f} mV/Pa")
snr = 65
print(f"SNR 65 dB -> noise floor {94-snr} dB SPL, noise voltage {sens*10**(-snr/20)*1e6:.2f} uV rms")
print(f"60 dB SPL speech -> {sens*p_ref*10**(60/20)*1e3:.3f} mV rms")

head("Microphone membrane (piston estimate)")
Em, num, tm, rm, g0 = 160e9, 0.22, 1e-6, 300e-6, 3e-6
Dm, x0m, sem, _ = plate(Em, num, tm, rm, 1.0)
xbar = x0m / 3
Am = math.pi * rm ** 2
C0 = EPS0 * Am / g0
print(f"D = {Dm:.3e} N m; at 1 Pa: x0 = {x0m*1e9:.2f} nm, mean deflection x0/3 = {xbar*1e9:.2f} nm")
print(f"area = {Am:.3e} m^2, C0 = eps0 A/g0 = {C0*1e12:.2f} pF, dC = C0 xbar/g0 = {C0*xbar/g0*1e15:.2f} fF per Pa")
Vb = 10.0
dV = Vb * xbar / g0
print(f"constant charge, V_b = 10 V: dV = V_b xbar/g0 = {dV*1e3:.1f} mV/Pa = {20*math.log10(dV):.1f} dBV/Pa")
print(f"ASIC gain needed to reach -38 dBV/Pa: {-38-20*math.log10(dV):.1f} dB")
kmean = 1.0 * Am / xbar
Vpi = math.sqrt(8 * kmean * g0 ** 3 / (27 * EPS0 * Am))
print(f"k_eff = pA/xbar = {kmean:.0f} N/m, pull-in V_pi = {Vpi:.1f} V, V_b/V_pi = {Vb/Vpi:.2f}")
print(f"60 dB SPL: x0 = {x0m*0.02*1e12:.0f} pm")

# ── 5. actuators ──────────────────────────────────────────────────────────────────────────────────
head("Worked check: electrostatic pull-in")
k, g0a, A = 1.0, 2e-6, 100e-6 * 100e-6
Vpi = math.sqrt(8 * k * g0a ** 3 / (27 * EPS0 * A))
print(f"k = 1 N/m, g0 = 2 um, A = 100 um x 100 um: V_pi = {Vpi:.2f} V")
x = g0a / 3
Fe = EPS0 * A * Vpi ** 2 / (2 * (g0a - x) ** 2)
print(f"at x = g0/3 = {x*1e6:.3f} um: k x = {k*x*1e9:.0f} nN, F_e = {Fe*1e9:.0f} nN")
dFe = EPS0 * A * Vpi ** 2 / (g0a - x) ** 3
print(f"slope dF_e/dx = {dFe:.3f} N/m (= k)")
for V in (3.0, 5.0):
    # solve k x = eps A V^2 / (2 (g0-x)^2) for the stable root by bisection on [0, g0/3]
    lo, hi = 0.0, g0a / 3
    f = lambda xx: k * xx - EPS0 * A * V ** 2 / (2 * (g0a - xx) ** 2)
    for _ in range(80):
        mid = (lo + hi) / 2
        if f(mid) < 0:
            lo = mid
        else:
            hi = mid
    print(f"V = {V} V: stable equilibrium x = {lo*1e9:.0f} nm ({lo/g0a:.3f} g0)")

head("Example: comb drive")
Nf, tc, gc, Vc = 100, 20e-6, 2e-6, 30.0
Fc = Nf * EPS0 * tc * Vc ** 2 / gc
print(f"N = 100, t = 20 um, g = 2 um, V = 30 V: F = N eps0 t V^2/g = {Fc*1e6:.2f} uN; on k = 1 N/m -> {Fc/1.0*1e6:.1f} um")

head("Example: thermal bimorph (equal thickness, equal stiffness idealisation)")
da, dT, h, L = 23e-6 - 2.6e-6, 100, 2e-6, 200e-6
kap = 1.5 * da * dT / h
print(f"curvature = 3 d_alpha dT/(2h) = {kap:.0f} 1/m, radius {1/kap*1e3:.2f} mm, tip deflection kappa L^2/2 = {kap*L*L/2*1e6:.1f} um")

head("Example: inkjet and micromirror")
Vd = 4e-15
rd = (3 * Vd / (4 * math.pi)) ** (1 / 3)
print(f"4 pL drop: diameter {2*rd*1e6:.1f} um")
print(f"at 20 kHz firing: {Vd*20000*1e9:.2f} uL/s = {Vd*20000*1e12:.0f} nL/s per nozzle")
print(f"DLP mirror +-12 deg: reflected beam turns by 2*12 = 24 deg each way, 48 deg between on/off")

head("Example: optical image stabilisation")
fL = 4.3e-3
th = math.radians(0.1)
print(f"0.1 deg shake, f_L = 4.3 mm -> lens/sensor shift {fL*th*1e6:.1f} um = {fL*th/1.22e-6:.1f} pixels of 1.22 um")

head("Extras quoted in the note and widgets")
F = 100e3 * math.pi * (500e-6) ** 2
print(f"100 kPa on a 1 mm disc: force {F*1e3:.1f} mN = weight of {F/G*1e3:.1f} g")
print(f"doubling t: D_p x {2**3}, x0 / {2**3}, edge stress / {2**2}")
Dd, x0d, sed_, _ = plate(160e9, 0.27, 20e-6, 1000e-6, 100e3)
print(f"doubling radius to 1000 um: x0 = {x0d*1e6:.2f} um (x16), edge stress {sed_/1e6:.0f} MPa (x4)")
print(f"zero-stress ring at r/r_d = sqrt((1+nu)/(3+nu)) = {math.sqrt((1+0.27)/(3+0.27)):.2f}")
print(f"water column: rho g = {1000*G/1e3:.2f} kPa per metre of depth")
print(f"self-test 2: (101300-101192)/12.02 = {(101300-101192)/dpdz:.1f} m")
print(f"self-test 3: 20 V / 2^1.5 = {20/2**1.5:.2f} V")
print(f"pull-in check: 9/8 factor -> V_pi^2 = 8 k g0^3/(27 eps A) = {8*k*g0a**3/(27*EPS0*A):.2f} V^2")
