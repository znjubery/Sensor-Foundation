"""A4 check: piezoelectric, piezoresistive and magnetic sensors.

Recomputes every number in the Intuitive examples and the Worked check of
docs/A4-piezoelectric-piezoresistive-and-magnetic-sensors.md.  Standard library only.
"""
import math

EPS0 = 8.8541878128e-12      # F/m
QE = 1.602176634e-19         # C
MU0 = 4e-7 * math.pi         # H/m (close enough to the 2019 value)

print("=== 1. Gas-lighter igniter (PZT) ===")
d33 = 400e-12                # C/N, PZT-5A-like
eps_r = 1700
F = 500.0                    # N, hammer impact
r = 1.25e-3                  # m, cylinder radius (2.5 mm diameter)
t = 5e-3                     # m, cylinder length
A = math.pi * r ** 2
q = d33 * F
Cp = EPS0 * eps_r * A / t
V = q / Cp
print(f"A = {A*1e6:.2f} mm^2, q = d33*F = {q*1e9:.0f} nC, C = {Cp*1e12:.1f} pF, V = q/C = {V/1e3:.1f} kV")
g33 = d33 / (EPS0 * eps_r)
print(f"g33 = d33/(eps0 eps_r) = {g33*1e3:.1f} mV*m/N; V = g33*F*t/A = {g33*F*t/A/1e3:.1f} kV")

print("\n=== 2. Quartz force sensor + charge amplifier ===")
d_q = 2.3e-12                # C/N quartz
Fq = 10.0
Cf = 100e-12
Rf = 1e9
qq = d_q * Fq
print(f"q = {qq*1e12:.0f} pC, V = q/Cf = {qq/Cf:.2f} V")
tau = Rf * Cf
fc = 1 / (2 * math.pi * tau)
print(f"tau = Rf*Cf = {tau:.2f} s, f_c = {fc:.2f} Hz")
print(f"held force after 0.5 s: e^(-0.5/tau) = {math.exp(-0.5/tau)*100:.2f} % of the step remains")
print(f"held force after 0.1 s (one tau): {math.exp(-1)*100:.1f} %")
# PVDF and PZT ratio vs quartz
for name, d in (("quartz", 2.3), ("PVDF", 33.0), ("PZT", 400.0)):
    print(f"  {name:6s} d33 = {d:6.1f} pC/N -> 10 N gives {d*10:7.0f} pC  ({d/2.3:5.0f}x quartz)")

print("\n=== 3. Piezoresistive silicon vs metal foil gauge ===")
eps = 100e-6                 # 100 microstrain
Vex = 3.3
for name, GF in (("metal", 2.0), ("silicon", 100.0)):
    dRR = GF * eps
    Vout = Vex / 4 * dRR     # quarter bridge, small-signal
    print(f"  {name:7s} GF={GF:5.0f}: dR/R = {dRR*100:.3f} %, quarter-bridge Vout = {Vout*1e3:.3f} mV")
pi_l = 0.5 * 138.1e-11       # 1/Pa, p-Si <110> longitudinal = pi44/2
E110 = 169e9                 # Pa
print(f"GF from piezoresistive coefficient: pi_l*E = {pi_l*E110:.0f}  (pi_l = {pi_l*1e11:.1f}e-11 /Pa)")
print(f"  geometric part of a metal gauge: 1 + 2*nu_P = {1+2*0.3:.1f} (nu_P = 0.3)")

print("\n=== 4. Hall plate ===")
I = 1e-3
B = 0.05
n_si = 1e22                  # m^-3
th = 10e-6                   # m
VH = I * B / (n_si * QE * th)
print(f"silicon: n = 1e22 m^-3, t = 10 um, I = 1 mA, B = 50 mT -> V_H = {VH*1e3:.2f} mV")
print(f"  sensitivity V_H/B = {I/(n_si*QE*th)*1e3:.1f} mV/T at 1 mA; Hall coefficient 1/(n q_e) = {1/(n_si*QE):.2e} m^3/C")
print(f"  Earth field 50 uT -> V_H = {I*50e-6/(n_si*QE*th)*1e6:.2f} uV; horizontal 20 uT -> {I*20e-6/(n_si*QE*th)*1e6:.2f} uV")
n_cu = 8.5e28
VH_cu = 1.0 * 1.0 / (n_cu * QE * 1e-4)
print(f"copper: n = 8.5e28, t = 0.1 mm, I = 1 A, B = 1 T -> V_H = {VH_cu*1e6:.2f} uV")
w = 100e-6
vd = I / (n_si * QE * w * th)
print(f"drift speed in the Si plate (w = 100 um): v_d = I/(n q_e w t) = {vd:.2f} m/s; E_H = v_d B = {vd*B:.1f} V/m; V_H = E_H w = {vd*B*w*1e3:.2f} mV")

print("\n=== 5. ABS wheel-speed sensor ===")
v = 100 / 3.6
rw = 0.30
teeth = 48
rev = v / rw / (2 * math.pi)
print(f"100 km/h, r = 0.30 m: {rev:.2f} rev/s, {teeth} teeth -> f = {teeth*rev:.0f} Hz")
v5 = 5 / 3.6
print(f"  at 5 km/h: f = {teeth*v5/rw/(2*math.pi):.1f} Hz")

print("\n=== 6. Hall current sensor (gapped core) ===")
gap = 1.5e-3
for Iw in (10.0,):
    Bgap = MU0 * Iw / gap
    print(f"I = {Iw:.0f} A through a core with a {gap*1e3} mm gap: B = mu0 I/gap = {Bgap*1e3:.2f} mT")
    print(f"  Si Hall plate above at 1 mA: V_H = {I*Bgap/(n_si*QE*th)*1e3:.3f} mV")
Bwire = MU0 * 10 / (2 * math.pi * 5e-3)
print(f"no core, 5 mm from the wire: B = mu0 I/(2 pi r) = {Bwire*1e3:.2f} mT")

print("\n=== 7. Compass: AMR vs Hall for the Earth's field ===")
amr_sens = 3.2e-3 / 1.0 / 1e-4   # 3.2 mV/V per gauss -> V/V per tesla
Vb = 5.0
Bh = 20e-6
V_amr = amr_sens * Vb * Bh
print(f"AMR bridge 3.2 mV/V/gauss, 5 V supply, B_h = 20 uT: {V_amr*1e3:.2f} mV")
V_hall = I * Bh / (n_si * QE * th)
print(f"Si Hall plate, 1 mA: {V_hall*1e6:.2f} uV  -> AMR gives {V_amr/V_hall:.0f}x more")
# heading
Bx, By = 14.1, -14.1
psi = math.degrees(math.atan2(-By, Bx)) % 360
print(f"heading from B_x = {Bx}, B_y = {By} uT: psi = atan2(-B_y, B_x) = {psi:.1f} deg")
Btot = 50.0
incl = 66.0
print(f"total 50 uT, inclination 66 deg: horizontal = {Btot*math.cos(math.radians(incl)):.1f} uT, vertical = {Btot*math.sin(math.radians(incl)):.1f} uT")
print(f"  a 2 uT hard-iron offset on B_y with B_h = 20 uT shifts heading at north by {math.degrees(math.atan2(2, 20)):.1f} deg")

print("\n=== Worked check ===")
# PVDF heartbeat / footstep film and a Hall wheel
d_pvdf = 33e-12
Fw = 2.0                     # N pulse pressure push
Cfilm = 1e-9                 # 1 nF film
qw = d_pvdf * Fw
print(f"PVDF: q = 33 pC/N x 2 N = {qw*1e12:.0f} pC; V = q/C = {qw/Cfilm*1e3:.0f} mV on a 1 nF film")
Rin = 10e6
tau_w = Rin * Cfilm
print(f"  with a 10 MOhm input: tau = {tau_w*1e3:.0f} ms, f_c = {1/(2*math.pi*tau_w):.1f} Hz")
print(f"  a steady press decays to {math.exp(-0.03/tau_w)*100:.1f} % in 30 ms; a 1.2 Hz pulse is BELOW f_c and is lost")
fc_goal = 0.1
R_need = 1 / (2 * math.pi * fc_goal * Cfilm)
print(f"  to put f_c at 0.1 Hz: R = 1/(2 pi f_c C) = {R_need/1e9:.2f} GOhm (tau = {R_need*Cfilm:.2f} s)")
# Hall step-by-step check with numbers
I2, B2, n2, t2 = 2e-3, 0.1, 5e21, 5e-6
print(f"Hall: I = 2 mA, B = 0.1 T, n = 5e21, t = 5 um -> n q_e t = {n2*QE*t2:.3e} C/m^2, V_H = {I2*B2/(n2*QE*t2)*1e3:.1f} mV")
