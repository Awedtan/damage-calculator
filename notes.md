TOTAL_ATK = floor(BASE_ATK * STAGE_MOD) * (1 + %ATK) + FINAL_MOD
TOTAL_DEF = max(0, DEF - DEF_IGNORE) * (1 - %DEF_IGNORE)
PHYS_DMG = TOTAL_ATK * ATK_SCALE - TOTAL_DEF

poc:
get basic physical damage stats working
ignore external buffs/debuffs, intrinsic def shred, aot effects
get working for melantha, kroos

TOTAL_ATK = BASE_ATK * (1 + %ATK)
TOTAL_DEF = DEF
PHYS_DMG = TOTAL_ATK * ATK_SCALE - TOTAL_DEF

TOTAL_ATK_SPD = (ATK_SPD / 100) / BASE_ATK_TIME
PHYS_DPS = PHYS_DMG * TOTAL_ATK_SPD 


melantha:
base: 738
potential: 25
trust: 65
talent: 8%
skill: 50%

738+25+65 = 828
828+8% = 894.24
828+58% = 1308.24

kroos:
base: 375
potential: 21
trust: 50
talent: 20% to 1.6
skill: 1.4 * 2

375+21+50 = 446
446 * (1 + 0.6*20%) = 499.52
446*1.6 = 713.6
446*1.4 = 624.4
446*1.6*1.4 = 999.04

meteorite:
base: 865
potential: 35
trust: 85
talent: 30% to 60%
skill: 2.15

865+35+85 = 985
985+30%*60% = 1162.3
1162.3*2.15 = 2498.945

plume:
base: 445
potential: 21
trust: 50
talent: 8%
skill: 25% atk, 25 aspd

445+21+50 = 516
516+8% = 557.28
516+33% = 686.28
686.28*1.25 = 857

cutter:
0.769 aspd
1.23 sp per hit
0.946 effective sp rate