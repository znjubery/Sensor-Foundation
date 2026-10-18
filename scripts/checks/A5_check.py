"""A5 check: optical sensors, photodiodes, image sensors and LiDAR.

Recomputes every number in the Intuitive examples and the Worked check of
docs/A5-optical-sensors-photodiodes-image-sensors-and-lidar.md.  Standard library only.
"""
import math

H = 6.62607015e-34
C0 = 2.99792458e8
QE = 1.602176634e-19
HC_EV_NM = H * C0 / QE * 1e9      # 1239.84 eV*nm

print("=== 1. Photon energy and the silicon cutoff ===")
for lam in (450, 550, 650, 850, 940, 1550):
    E = H * C0 / (lam * 1e-9)
    print(f"  lambda = {lam:4d} nm: E = {E:.3e} J = {E/QE:.2f} eV")
Eg = 1.12
print(f"hc/q = {HC_EV_NM:.1f} eV*nm; Si gap {Eg} eV -> cutoff = {HC_EV_NM/Eg:.0f} nm")
print(f"Ge gap 0.66 eV -> {HC_EV_NM/0.66:.0f} nm; InGaAs 0.75 eV -> {HC_EV_NM/0.75:.0f} nm")

print("\n=== 2. Responsivity ===")
def resp(eta, lam_nm):
    return eta * QE * lam_nm * 1e-9 / (H * C0)
for eta, lam in ((0.8, 850), (1.0, 850), (0.6, 550), (0.8, 940)):
    print(f"  eta = {eta}, lambda = {lam} nm: R = {resp(eta, lam):.3f} A/W")
P = 10e-6
lam = 850
Iph = resp(0.8, lam) * P
print(f"P_opt = 10 uW at 850 nm, eta = 0.8: I = {Iph*1e6:.2f} uA; photons/s = {P/(H*C0/(lam*1e-9)):.3e}")

print("\n=== 3. A phone pixel collecting light ===")
pitch = 1.4e-6
Irr = 0.1                   # W/m^2 at the sensor (indoor)
texp = 10e-3
lam = 550
eta = 0.6
Eph = H * C0 / (lam * 1e-9)
Nph = Irr * pitch ** 2 * texp / Eph
Ne = eta * Nph
print(f"photons = {Nph:.0f}, electrons N = {Ne:.0f}, shot noise sqrt(N) = {math.sqrt(Ne):.0f}, SNR = {math.sqrt(Ne):.0f} = {20*math.log10(math.sqrt(Ne)):.1f} dB")

print(f"100x less light: N = {Ne/100:.1f}, SNR = {math.sqrt(Ne/100):.1f}")

print("\n=== 4. Shot noise ladder ===")
for N in (10, 100, 1000, 10000):
    print(f"  N = {N:6d}: sqrt(N) = {math.sqrt(N):6.1f}, SNR = {math.sqrt(N):6.1f} ({20*math.log10(math.sqrt(N)):.0f} dB), relative noise {100/math.sqrt(N):.1f} %")

print("\n=== 5. Full well, read noise and dynamic range ===")
FWC = 6000
rn = 2.0
print(f"FWC = {FWC} e-, SNR at full well = sqrt(FWC) = {math.sqrt(FWC):.1f} = {20*math.log10(math.sqrt(FWC)):.1f} dB")
DR = FWC / rn
print(f"read noise {rn} e-: DR = {DR:.0f} = {20*math.log10(DR):.1f} dB = {math.log2(DR):.1f} stops")
# SNR including read noise at N = 10
N = 10
print(f"N = 10 e- with read noise 2 e-: SNR = 10/sqrt(10+4) = {N/math.sqrt(N+rn**2):.2f}")
# well capacitance
Cpd = FWC * QE / 1.0
print(f"well of 6000 e- over a 1 V swing: C = N q_e / V = {Cpd*1e15:.2f} fF")

print("\n=== 6. Bayer mosaic ===")
Mp = 12e6
print(f"12 MP: green {Mp*0.5/1e6:.0f} M, red {Mp*0.25/1e6:.0f} M, blue {Mp*0.25/1e6:.0f} M")

print("\n=== 7. Pulsed time of flight ===")
for d in (1.0, 100.0, 200.0):
    print(f"  d = {d:6.1f} m: round trip t = 2d/c = {2*d/C0*1e9:.2f} ns")
for dt in (1e-9, 100e-12, 66.7e-12):
    print(f"  timing step {dt*1e12:6.1f} ps -> distance step c*dt/2 = {C0*dt/2*100:.2f} cm")
print(f"light travels {C0*1e-9*100:.1f} cm in 1 ns")

print("\n=== 8. Phase (continuous-wave) ToF ===")
fm = 20e6
print(f"f_mod = 20 MHz: unambiguous range c/(2 f) = {C0/(2*fm):.2f} m")
phi = math.pi / 2
print(f"phase 90 deg -> d = c phi /(4 pi f) = {C0*phi/(4*math.pi*fm):.3f} m")
print(f"phase noise 1 deg -> {C0*math.radians(1)/(4*math.pi*fm)*100:.2f} cm")

print("\n=== 9. Spinning LiDAR point cloud ===")
ch, pts, rate = 64, 2048, 10
print(f"{ch} x {pts} x {rate} Hz = {ch*pts*rate/1e6:.2f} M points/s")
dang = 360 / pts
print(f"azimuth step = {dang:.3f} deg; spacing at 50 m = {50*math.radians(dang)*100:.1f} cm")
print(f"pulse rate per channel {pts*rate} /s -> max unambiguous range c/(2*f_pulse) = {C0/(2*pts*rate)/1e3:.1f} km")

print("\n=== 10. Pulse oximetry ===")
for Rr in (0.5, 0.7, 1.0):
    print(f"  ratio R = {Rr}: SpO2 ~ 110 - 25 R = {110 - 25*Rr:.1f} %")
ac_r, dc_r, ac_ir, dc_ir = 0.010, 1.00, 0.020, 1.00
Rr = (ac_r / dc_r) / (ac_ir / dc_ir)
print(f"AC/DC red = 1.0 %, IR = 2.0 %: R = {Rr:.2f}, SpO2 = {110-25*Rr:.1f} %")
print(f"heart rate from a 0.8 s peak spacing: {60/0.8:.0f} bpm")

print("\n=== Worked check ===")
# LiDAR return at 37.5 m and a 940 nm photodiode
d = 37.5
t = 2 * d / C0
print(f"echo after t = {t*1e9:.1f} ns -> d = c t /2 = {C0*t/2:.2f} m")
Rr = resp(0.5, 940)
Pret = 2e-9
print(f"940 nm, eta = 0.5: R = {Rr:.3f} A/W; 2 nW return -> I = {Rr*Pret*1e9:.3f} nA")
photons = Pret * 5e-9 / (H * C0 / 940e-9)
print(f"self-test: eta 0.7, 650 nm, 1 mW -> R = {resp(0.7, 650):.3f} A/W, I = {resp(0.7, 650)*1e-3*1e3:.3f} mA")
print(f"self-test: 3 cm depth -> dt = {2*0.03/C0*1e12:.0f} ps")
print(f"photons in a 5 ns pulse window: {photons:.0f}; electrons = {photons*0.5:.0f}; shot-noise SNR = {math.sqrt(photons*0.5):.1f}")
