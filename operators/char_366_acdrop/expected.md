# char_366_acdrop - Aciddrop

### Base
```
atk: 735
attackSpeed: 100
baseAttackTime: 1.6

Potentials: +30 ATK
Trust bonus: +80 ATK
Talent (not implemented): minimum damage = [0.25, 0.4] * ATK
```

$`ATK_{base}=ATK+ATK_{potentials}+ATK_{trust}`$\
$`ATK_{base}=735+30+80=845`$

$`ASPD_{base}=\frac{attackSpeed}{100*baseAttackTime}`$\
$`ASPD_{base}=\frac{100}{100*1.6} = 0.625`$

$`DPS_{base}=ATK_{base}*ASPD_{base}`$\
$`DPS_{base}=845*0.625=528.125`$

### Skill 1
```
attack_speed = 70
```

$`ATK_1=ATK_{base}`$\
$`ASPD_1=\frac{100+70}{100*1.6} = 1.0625`$\
$`DPS_1=845*1.0625=897.8125`$

```
duration = 20
spCost = 35
spType = INCREASE_WITH_TIME
```

$`SPRATE_1=1`$

$`UPTIME_1=\frac{duration}{duration+\frac{spCost}{SPRATE_1}}`$\
$`UPTIME_1=\frac{20}{20+35}=0.3636`$

$`AVGDPS_1=DPS_1*UPTIME_1+DPS_{base}*(1-UPTIME_1)`$\
$`AVGDPS_1=897.8125*0.3636+528.125*(1-0.3636)=662.5434`$

### Skill 2
```
atk: 0.4
hitNum (hardcoded): 2
```

$`ATKSCALE_2=1+0.4=1.4`$

$`ATK_2=ATK_{base}*ATKSCALE_2`$\
$`ATK_2=845*1.4=1183`$

$`ASPD_2=ASPD_{base}`$

$`DPS_2=hitNum*ATK_2*ASPD_2`$\
$`DPS_2=2*1183*0.625=1478.75`$

```
duration = 25
spCost = 50
spType = INCREASE_WITH_TIME
```

$`SPRATE_2=1`$

$`UPTIME_2=\frac{25}{25+50}=0.3333`$\
$`AVGDPS_2=1478.75*0.3333+528.125*(1-0.3333)=844.9683`$
