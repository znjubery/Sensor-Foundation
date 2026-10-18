"""A2 check: reproduces every number in docs/A2-resistive-sensors-and-the-wheatstone-bridge.md.

Run:  python scripts/checks/A2_check.py
"""
import math

print("== Example 1: R = rho L / A for a foil gauge ==")
rho_con, rho_cu = 4.9e-7, 1.68e-8      # constantan, copper (ohm m)
t_f, w_f = 5e-6, 20e-6                 # foil thickness and track width
A = t_f * w_f
R = 120.0
L = R * A / rho_con
print(f"  A = {A:.1e} m^2, length for 120 ohm: {L*1e3:.2f} mm -> 12 strands of {L/12*1e3:.2f} mm")
print(f"  same track in copper: {rho_cu*L/A:.2f} ohm")

print("\n== Example 2: gauge factor = geometry + piezoresistance ==")
nu = 0.30
geo = 1 + 2 * nu
GF_con = 2.05
print(f"  geometric part 1 + 2 nu = {geo:.2f}; constantan GF ~ {GF_con} -> resistivity part {GF_con-geo:.2f}")
eps = 1e-3
print(f"  check 1000 ue on a wire: L x {1+eps}, area x {(1-nu*eps)**2:.6f}, R x {(1+eps)/(1-nu*eps)**2:.6f} -> dR/R = {((1+eps)/(1-nu*eps)**2-1)*1e3:.4f} per mille (geometry only)")

print("\n== Example 3 / worked check: a bending steel beam ==")
E = 200e9
w, t = 0.020, 0.002
F, x = 10.0, 0.100
sigma = 6 * F * x / (w * t**2)
eps = sigma / E
GF = 2.0
dRR = GF * eps
dR = dRR * R
print(f"  sigma = 6 F x/(w t^2) = {sigma/1e6:.1f} MPa, eps = {eps*1e6:.0f} ue, dR/R = {dRR*1e6:.0f} ppm, dR = {dR:.3f} ohm")
Vex = 5.0
q_approx = Vex / 4 * dRR
q_exact = Vex * ((R + dR) / (2 * R + dR) - 0.5)
print(f"  quarter bridge: approx {q_approx*1e3:.4f} mV, exact {q_exact*1e3:.4f} mV, nonlinearity {(1-q_exact/q_approx)*100:.4f}%")
half = Vex / 2 * dRR
full = Vex * dRR
# exact half bridge: R2 = R(1+x), R1 = R(1-x) on one side
xx = dRR
half_exact = Vex * ((1 + xx) / 2 - 0.5)
print(f"  half bridge {half*1e3:.4f} mV (exact {half_exact*1e3:.4f}), full bridge {full*1e3:.4f} mV")
print(f"  bridge balance example: 120/120 = 350/350 -> 0 V; 120/120.09 vs 120/120 -> unbalanced")

print("\n== Example 4: RTD and thermistor ==")
alpha = 0.00385
for T in (0, 37, 100):
    print(f"  Pt100 at {T:3d} C: {100*(1+alpha*T):.3f} ohm")
print(f"  Pt100 slope {100*alpha:.3f} ohm/K; with 1 mA: {100*alpha*1e-3*1e3:.3f} mV/K")
beta, R0, T0 = 3950.0, 10e3, 298.15
def ntc(Tc):
    return R0 * math.exp(beta * (1 / (Tc + 273.15) - 1 / T0))
for T in (0, 25, 37):
    print(f"  NTC 10k at {T:2d} C: {ntc(T):.0f} ohm")
a_eff = -beta / T0**2
print(f"  NTC local coefficient at 25 C: -beta/T^2 = {a_eff*100:.2f} %/K  (Pt100: {alpha*100:.3f} %/K -> ratio {abs(a_eff)/alpha:.1f})")

print("\n== Example 5: photoresistor in a divider ==")
Vs = 3.3
Rf = 10e3
gam = 0.7
for lux in (10, 100, 1000):
    Rl = 10e3 * (lux / 10) ** (-gam)
    print(f"  {lux:5d} lux: R_LDR = {Rl:.0f} ohm, V_out = {Vs*Rl/(Rl+Rf):.3f} V")

print("\n== Example 6: divider sensitivity and the leaf thermistor ==")
Rs = 10e3
best = max(range(1000, 100001, 100), key=lambda r: Vs * r / (r + Rs) ** 2)
print(f"  dV/dR is largest when R_fixed = {best} ohm (= R_sensor); value V/(4R) = {Vs/(4*Rs)*1e6:.1f} uV/ohm")
dVdT = Vs / 4 * abs(a_eff)
print(f"  NTC at 25 C in a 10k/10k divider at 3.3 V: {dVdT*1e3:.1f} mV/K; 0.1 K -> {dVdT*0.1*1e3:.2f} mV")
lsb = 3.3 / 4096
print(f"  12-bit ADC LSB {lsb*1e3:.3f} mV -> {lsb/dVdT*1e3:.0f} mK per count")

print("\n== Example 7: self-heating ==")
I = Vs / (2 * Rs)
P = I**2 * Rs
delta = 2e-3          # dissipation constant, W/K (small bead, still air)
print(f"  I = {I*1e3:.3f} mA, P = {P*1e3:.3f} mW, temperature rise {P/delta:.3f} K at 2 mW/K")
Vs2 = 1.0
P2 = (Vs2 / (2 * Rs))**2 * Rs
print(f"  at 1.0 V excitation: P = {P2*1e6:.1f} uW, rise {P2/delta*1e3:.1f} mK")

print("\n== Example 8: temperature compensation ==")
th_out = 20e-6     # thermal output, dR/R per K
dT = 5.0
app = th_out * dT
print(f"  5 K warm-up: dR/R = {app*1e6:.0f} ppm = apparent {app/GF*1e6:.0f} ue vs signal {eps*1e6:.0f} ue ({app/GF/eps*100:.0f}%)")
q_with = Vex * ((1 + dRR + app) / (2 + dRR + app) - 0.5)
th = app
half_with = Vex * ((1 + xx + th) / (2 + 2 * th) - 0.5)
print(f"  quarter bridge with the drift: {q_with*1e3:.4f} mV (was {q_exact*1e3:.4f})")
print(f"  half bridge with both gauges drifting: {half_with*1e3:.4f} mV (was {half_exact*1e3:.4f})")

print("\n== Extra numbers quoted in the text ==")
print(f"  NTC exponent at 37 C: beta(1/T - 1/T0) = {beta*(1/310.15-1/T0):.4f}")
print(f"  divider 120 / 120.09 ohm at 5 V: {5*120.09/240.09:.5f} V, change {(5*120.09/240.09-2.5)*1e3:.3f} mV")
print(f"  copper alpha 0.00393/K -> {0.393:.2f} %/K")
lead = 2 * 2.0 * rho_cu / 0.14e-6       # two 2 m leads, 0.14 mm^2
print(f"  2 x 2 m of 0.14 mm^2 copper lead: {lead:.2f} ohm -> Pt100 error {lead/(100*alpha):.1f} K")

print("\n== Self-test ==")
print(f"  Q1: full bridge with dR/R = 500 ppm, 10 V: {10*500e-6*1e3:.1f} mV; quarter {10/4*500e-6*1e3:.2f} mV")
print(f"  Q2: Pt100 reads 109.62 ohm -> T = {(109.62/100-1)/alpha:.1f} C")
print(f"  Q3: NTC 10k beta 3950 reads 5000 ohm -> T = {1/(1/T0 + math.log(0.5)/beta) - 273.15:.1f} C")
