"""A7 check: signal conditioning. Recomputes every number in the examples and worked check of
docs/A7-signal-conditioning-amplifiers-filters-and-adcs.md.  Run: python scripts/checks/A7_check.py"""
import math
import random


def db(g):
    return 20 * math.log10(g)


print("== 1. Bridge + instrumentation amplifier (gain staging) ==")
V_ex, GF, eps = 3.3, 2.0, 500e-6
dRR = GF * eps
V_bridge = V_ex * dRR / 4                      # quarter bridge, small-signal
print(f"dR/R = {dRR:.4f}, bridge output = {V_bridge*1e3:.3f} mV")
R_G = 49.4                                      # in-amp gain resistor, G = 1 + 49.4 kOhm / R_G
G_ia = 1 + 49.4e3 / R_G
V_amp = G_ia * V_bridge
print(f"in-amp G = {G_ia:.0f} ({db(G_ia):.1f} dB), output = {V_amp:.4f} V")
V_ref, N = 3.3, 12
LSB = V_ref / 2**N
print(f"12-bit LSB at 3.3 V = {LSB*1e3:.4f} mV")
print(f"bridge straight into ADC: {V_bridge/LSB:.2f} LSB;  after in-amp: {V_amp/LSB:.0f} LSB")
print(f"strain per LSB after amp = {eps/(V_amp/LSB)*1e6:.3f} microstrain")
print(f"largest gain before clipping 3.3 V: {V_ref/V_bridge:.0f}")

print("== 2. Non-inverting and inverting amplifiers ==")
Rf, Rg = 99e3, 1e3
print(f"non-inverting G = 1 + Rf/Rg = {1+Rf/Rg:.0f} = {db(1+Rf/Rg):.1f} dB")
Rf2, Rin = 47e3, 4.7e3
print(f"inverting G = -Rf/Rin = {-Rf2/Rin:.0f}, input resistance = {Rin/1e3:.1f} kOhm")

print("== 3. CMRR and mains hum on an ECG ==")
V_cm, V_ecg = 0.5, 1e-3
print(f"single-ended: hum/ECG = {V_cm/V_ecg:.0f} x")
for cmrr_db in (80, 100, 120):
    cmrr = 10 ** (cmrr_db / 20)
    v_in_ref = V_cm / cmrr
    print(f"CMRR {cmrr_db} dB = {cmrr:.0f}: input-referred hum = {v_in_ref*1e6:.1f} uV = {v_in_ref/V_ecg*100:.2f} % of 1 mV")
# resistor mismatch: difference amp with 0.1 % resistors, gain 1 -> CMRR ~ (1+G)/(4*tol)
tol, Gd = 0.001, 1
cmrr_mis = (1 + Gd) / (4 * tol)
print(f"difference amp, 0.1% resistors, G=1: worst CMRR = {cmrr_mis:.0f} = {db(cmrr_mis):.1f} dB")

print("== 4. RC low-pass ==")
R, C = 10e3, 100e-9
tau = R * C
fc = 1 / (2 * math.pi * tau)
print(f"tau = {tau*1e3:.2f} ms, f_c = {fc:.2f} Hz")
for f in (fc, 1000.0, 10 * fc, 100 * fc):
    H = 1 / math.sqrt(1 + (f / fc) ** 2)
    ph = -math.degrees(math.atan(f / fc))
    print(f"  f = {f:8.2f} Hz: |H| = {H:.4f} = {db(H):7.2f} dB, phase = {ph:6.2f} deg")
print(f"step response: 63.2% at tau ({1-math.exp(-1):.4f}), 99.3% at 5 tau ({1-math.exp(-5):.4f})")

print("== 5. Thermistor anti-hum filter ==")
R2, C2 = 100e3, 1e-6
tau2 = R2 * C2
fc2 = 1 / (2 * math.pi * tau2)
for fh in (50.0, 60.0):
    H = 1 / math.sqrt(1 + (fh / fc2) ** 2)
    print(f"tau = {tau2:.2f} s, f_c = {fc2:.3f} Hz, {fh:.0f} Hz hum: |H| = {H:.4f} = {db(H):.1f} dB")

print("== 6. High-pass for ECG baseline wander ==")
fc_hp = 0.5
C3 = 1e-6
R3 = 1 / (2 * math.pi * fc_hp * C3)
f_breath = 0.25
Hhp = (f_breath / fc_hp) / math.sqrt(1 + (f_breath / fc_hp) ** 2)
Hhp_heart = (1.2 / fc_hp) / math.sqrt(1 + (1.2 / fc_hp) ** 2)
print(f"R for 0.5 Hz with 1 uF = {R3/1e3:.0f} kOhm; breathing 0.25 Hz passes {Hhp:.3f}; 1.2 Hz heartbeat passes {Hhp_heart:.3f}")

print("== 7. Aliasing ==")


def alias(f, fs):
    return abs(f - fs * round(f / fs))


print(f"60 Hz hum sampled at 100 Hz -> {alias(60,100):.0f} Hz; at 1000 Hz -> {alias(60,1000):.0f} Hz")
print(f"50 Hz hum sampled at 50 Hz -> {alias(50,50):.0f} Hz (looks like a constant offset); 60 Hz at 50 Hz -> {alias(60,50):.0f} Hz")
for rpm in (5400, 5300):
    rev = rpm / 60
    fb = 2 * rev                                  # two-blade propeller: pattern repeats every half turn
    fa_signed = fb - 30 * round(fb / 30)
    print(f"2-blade prop {rpm} rpm: {rev:.2f} rev/s, blade pattern {fb:.2f} Hz, at 30 fps apparent {fa_signed:+.2f} Hz "
          f"= {fa_signed/2:+.2f} rev/s")
# anti-alias: first-order filter at f_c = 10 Hz, what is left of 60 Hz?
H60 = 1 / math.sqrt(1 + (60 / 10) ** 2)
print(f"1st-order anti-alias at 10 Hz leaves |H(60 Hz)| = {H60:.3f} = {db(H60):.1f} dB")

print("== 8. ADC: LSB, quantisation noise, SNR ==")
for (n, vr) in ((8, 3.3), (10, 3.3), (12, 3.3), (16, 3.3), (24, 2.5)):
    d = vr / 2**n
    print(f"N={n:2d}, Vref={vr} V: LSB = {d*1e6:12.4f} uV, q-noise rms = {d/math.sqrt(12)*1e6:10.4f} uV, "
          f"SNR = {6.02*n+1.76:6.2f} dB")
# exact derivation of 6.02N + 1.76
print(f"20 log10(2) = {20*math.log10(2):.4f}, 20 log10(sqrt(1.5)) = {20*math.log10(math.sqrt(1.5)):.4f}")
# Monte Carlo: quantise a full-scale sine, measure error rms and SNR
random.seed(1)
n, d = 12, 3.3 / 2**12
M = 200000
err2 = 0.0
sig2 = 0.0
for i in range(M):
    t = random.random()
    v = 1.65 + 1.65 * math.sin(2 * math.pi * t) * 0.999999
    q = (math.floor(v / d) + 0.5) * d
    err2 += (q - v) ** 2
    sig2 += (v - 1.65) ** 2
e_rms = math.sqrt(err2 / M)
print(f"Monte Carlo 12-bit: error rms = {e_rms*1e3:.4f} mV (theory {d/math.sqrt(12)*1e3:.4f}), "
      f"SNR = {10*math.log10(sig2/err2):.2f} dB (theory {6.02*12+1.76:.2f})")

print("== Worked check ==")
f = 1000.0
x = f / fc
H = 1 / math.sqrt(1 + x * x)
print(f"f/f_c = {x:.4f}, (f/f_c)^2 = {x*x:.3f}, |H| = {H:.4f}, {db(H):.2f} dB, phase {-math.degrees(math.atan(x)):.2f} deg")
d = 3.3 / 4096
print(f"12-bit: LSB {d*1e3:.4f} mV, noise {d/math.sqrt(12)*1e3:.4f} mV, full-scale sine rms {3.3/(2*math.sqrt(2)):.4f} V, "
      f"SNR = {db((3.3/(2*math.sqrt(2)))/(d/math.sqrt(12))):.2f} dB")

print("== Mistakes section ==")
x = math.sqrt(1 / 0.99**2 - 1)
print(f"|H| = 0.99 (1% loss) at f = {x:.4f} f_c; amplitude lost at f_c = {(1-1/math.sqrt(2))*100:.1f} %")
