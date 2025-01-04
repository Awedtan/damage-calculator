export const DMG_PHYSICAL = 0;
export const DMG_ARTS = 1;
export const DMG_TRUE = 2;

export const SP_ATTACK = 'INCREASE_WHEN_ATTACK';
export const SP_HURT = 'INCREASE_WHEN_TAKEN_DAMAGE';
export const SP_TIME = 'INCREASE_WITH_TIME';

export const PROF_DMG_TYPES = {
    PIONEER: DMG_PHYSICAL,
    WARRIOR: DMG_PHYSICAL,
    TANK: DMG_PHYSICAL,
    SNIPER: DMG_PHYSICAL,
    SPECIAL: DMG_PHYSICAL,
    CASTER: DMG_ARTS,
    SUPPORT: DMG_ARTS,
    MEDIC: DMG_ARTS
}

export type StatNumbers = {
    atk?: number
    atkPercent?: number
    atkInterval?: number
    atkScale?: number
    aspd?: number
    dmgType?: number
    hitNum?: number
    sp?: number
    spRate?: number
}

export type DamageNumbers = {
    atk?: number
    aspd?: number
    dmgType?: number
    hitNum?: number
    spType?: string
    spHit?: number
    spRate?: number
    hitDmg?: number
    dps?: number
    uptime?: number
    avgDps?: number
}
