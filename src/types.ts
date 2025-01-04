export const DMG_PHYSICAL = 0;
export const DMG_ARTS = 1;
export const DMG_TRUE = 2;

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

export type Numbers = {
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
    spHit?: number
    spRate?: number
    hitDmg?: number
    dps?: number
    uptime?: number
    avgDps?: number
}

type NumberModifier = {
    value: number,
    type: 'number' | 'percent',
    modifier: 'set' | 'add' | 'sub' | 'mul' | 'div' | 'min' | 'max'
}

export type NumbersModifiers = {
    atk?: NumberModifier
    atkPercent?: NumberModifier
    atkInterval?: NumberModifier
    atkScale?: NumberModifier
    aspd?: NumberModifier
    dmgType?: NumberModifier
    hitNum?: NumberModifier
    sp?: NumberModifier
    spRate?: NumberModifier
}

export type OperatorModifiers = {
    base: NumbersModifiers
    talent: NumbersModifiers
    down: NumbersModifiers
    skill: NumbersModifiers[]
    up: NumbersModifiers
}
