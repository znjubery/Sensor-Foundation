"""C1 check: Reynolds numbers, entrance lengths, coasting of a bacterium, worked check.

    python scripts/checks/C1_check.py
"""
import math

WATER = (1000.0, 1.0e-3)          # rho (kg/m^3), mu (Pa s), 20 C
BLOOD = (1060.0, 3.5e-3)
AIR = (1.2, 1.8e-5)
AIR_CRUISE = (0.38, 1.43e-5)      # about 11 km altitude
HONEY = (1400.0, 10.0)


def Re(fluid, U, L):
    rho, mu = fluid
    return rho * U * L / mu


print("== viscosities ==")
print(f"honey/water viscosity ratio      = {HONEY[1] / WATER[1]:.0f}")
print(f"nu water = {WATER[1] / WATER[0]:.1e} m^2/s,  nu air = {AIR[1] / AIR[0]:.1e} m^2/s")

print("\n== the Reynolds ladder ==")
ladder = [
    ("E. coli bacterium", WATER, 30e-6, 1e-6),
    ("human sperm", WATER, 50e-6, 50e-6),
    ("red cell in a capillary", BLOOD, 1e-3, 8e-6),
    ("microchannel 100 um, 1 mm/s", WATER, 1e-3, 100e-6),
    ("spoon in honey", HONEY, 0.05, 0.02),
    ("spoon in tea", WATER, 0.05, 0.02),
    ("aorta (mean flow)", BLOOD, 0.2, 0.025),
    ("small fish", WATER, 0.1, 0.05),
    ("drone propeller blade", AIR, 50.0, 0.02),
    ("human swimmer", WATER, 1.0, 2.0),
    ("car on a motorway", AIR, 30.0, 4.5),
    ("airliner at cruise", AIR_CRUISE, 250.0, 40.0),
]
for name, fl, U, L in ladder:
    print(f"{name:30s} U = {U:9.3g} m/s  L = {L:9.3g} m   Re = {Re(fl, U, L):.3g}")

print("\n== pipes: laminar or turbulent (transition ~2300) ==")
for U in (1.0, 0.1):
    r = Re(WATER, U, 0.016)
    print(f"garden hose D = 16 mm, U = {U} m/s: Re = {r:.0f}")
print(f"microchannel at 1 cm/s, 100 um: Re = {Re(WATER, 0.01, 100e-6):.2f}")


def entrance(re):
    """Laminar entrance length / D (Chen 1973 / Dombrowski et al. 1993 fit, valid also at low Re)."""
    return 0.6 / (1 + 0.035 * re) + 0.056 * re


print("\n== entrance length ==")
for name, re, D in (("microchannel Re=0.1, D=100 um", 0.1, 100e-6),
                    ("microchannel Re=10, D=100 um", 10.0, 100e-6),
                    ("hose Re=1600, D=16 mm", 1600.0, 0.016)):
    k = entrance(re)
    print(f"{name:32s} L_e/D = {k:.3f}   L_e = {k * D * 1e6:.4g} um  ({k * D:.3g} m)")

print("\n== a bacterium coasts (Purcell) ==")
r, U = 1e-6, 30e-6
tstop = 2 * WATER[0] * r ** 2 / (9 * WATER[1])
print(f"momentum time 2 rho r^2/(9 mu) = {tstop:.2e} s, coasting distance = {U * tstop:.2e} m = {U * tstop * 1e10:.3f} Angstrom")

print("\n== worked check: 100 x 50 um channel, U = 5 mm/s ==")
w, h, U = 100e-6, 50e-6, 5e-3
Dh = 2 * w * h / (w + h)
re = Re(WATER, U, Dh)
inert = WATER[0] * U ** 2 / Dh
visc = WATER[1] * U / Dh ** 2
print(f"D_h = {Dh * 1e6:.1f} um, Re = {re:.3f}")
print(f"inertia rho U^2/L = {inert:.0f} N/m^3, viscous mu U/L^2 = {visc:.0f} N/m^3, ratio = {inert / visc:.3f}")
print(f"entrance length at this Re: {entrance(re) * Dh * 1e6:.0f} um")
print(f"speed that would reach Re = 2300 in this channel: {2300 * WATER[1] / (WATER[0] * Dh):.1f} m/s")
print(f"that is {2300 * WATER[1] / (WATER[0] * Dh) / U:.0f} times faster than 5 mm/s")
print(f"entrance length / D_h = {entrance(re):.3f}")

print("\n== xylem vessels and self-test ==")
for d in (20e-6, 100e-6):
    print(f"xylem vessel d = {d * 1e6:.0f} um at 1 mm/s: Re = {Re(WATER, 1e-3, d):.2f}")
print(f"plasma channel 50 um, 2 mm/s, mu 1.2 mPa s: Re = {Re((1025.0, 1.2e-3), 2e-3, 50e-6):.3f}")
print(f"scaled-up chip: Re 0.1 x 10 x 10 = {0.1 * 10 * 10:.0f}")
