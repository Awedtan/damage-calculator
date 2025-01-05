import * as T from 'hella-types';
import { calcArtsDmg, calcPhysDmg, calcTotalAspd, calcTotalAtk, calcTotalSpHit, calcTotalSpRate } from "./calc";
import { CustomFunctions, DamageNumbers, DMG_ARTS, DMG_PHYSICAL, DMG_TRUE, PROF_DMG_TYPES, SP_ATTACK, SP_HURT, SP_TIME, StatNumbers } from "./types";

export default function getDps(op: T.Operator, custom: CustomFunctions, def: number, res: number) {
    const numbersArr: DamageNumbers[] = [];
    const collectFuncs = {
        archNumbers: custom?.customArchNumbers ?? collectArchNumbers,
        baseNumbers: custom?.customBaseNumbers ?? collectBaseNumbers,
        talentNumbers: custom?.customTalentNumbers ?? collectTalentNumbers,
        downNumbers: custom?.customDownNumbers ?? collectDownNumbers,
        skillNumbers: custom?.customSkillNumbers ?? collectSkillNumbers,
        // moduleNumbers: custom?.customModuleNumbers ?? collectModuleNumbers,
        upNumbers: custom?.customUpNumbers ?? collectUpNumbers
    }

    const archNumbers = collectFuncs.archNumbers(op);
    const baseNumbers = collectFuncs.baseNumbers(op);
    const talentNumbers = collectFuncs.talentNumbers(op);
    const downNumbers = collectFuncs.downNumbers(op, archNumbers, baseNumbers, talentNumbers, def, res);
    numbersArr.push(downNumbers);

    for (const skill of op.skills) {
        const skillNumbers = collectFuncs.skillNumbers(skill);
        const upNumbers = collectFuncs.upNumbers(op, skill, archNumbers, baseNumbers, talentNumbers, skillNumbers, downNumbers, def, res);
        numbersArr.push(upNumbers);
    }

    const fieldsToRound = ['atk', 'aspd', 'spRate', 'hitDmg', 'dps', 'uptime', 'avgDps'];
    for (const upNumbers of numbersArr)
        for (const field of fieldsToRound)
            if (upNumbers[field])
                upNumbers[field] = Math.round(upNumbers[field] * 1e3) / 1e3;

    return numbersArr;
}

export function collectArchNumbers(op: T.Operator): StatNumbers {
    const archNumbers: StatNumbers = {};
    if (op.data.subProfessionId === 'sword') {
        archNumbers.hitNum = 2;
    }
    return archNumbers;
}

export function collectBaseNumbers(op: T.Operator): StatNumbers {
    const baseNumbers: StatNumbers = {};
    const maxStats = op.data.phases[op.data.phases.length - 1].attributesKeyFrames[op.data.phases[op.data.phases.length - 1].attributesKeyFrames.length - 1].data;
    const atk = maxStats.atk;
    const potentialAtk = op.data.potentialRanks.reduce((acc, curr) =>
        acc + (curr.buff
            ? curr.buff?.attributes.attributeModifiers.reduce((acc2, curr2) =>
                curr2.attributeType === 'ATK'
                    ? acc2 + curr2.value
                    : acc2
                , 0)
            : 0)
        , 0);
    baseNumbers.atk = atk + potentialAtk + (op.data.favorKeyFrames
        ? op.data.favorKeyFrames[op.data.favorKeyFrames.length - 1].data.atk
        : 0);
    baseNumbers.atkInterval = maxStats.baseAttackTime;
    baseNumbers.aspd = maxStats.attackSpeed;
    return baseNumbers;
}

export function collectTalentNumbers(op: T.Operator): StatNumbers {
    const talentNumbers: StatNumbers = {};
    for (const talent of op.data.talents.map(talent => getBlackboardValues(talent.candidates[talent.candidates.length - 1].blackboard))) {
        const talentProb = talent['prob'] ?? 1;
        talentNumbers.atkPercent = (talentNumbers.atkPercent ?? 0) + (talent['atk'] ?? 0) * talentProb;
        talentNumbers.atkScale = (talentNumbers.atkScale ?? 1) * ((talent['atk_scale'] ?? 1) - 1) * talentProb + 1;
        talentNumbers.aspd = (talentNumbers.aspd ?? 0) + (talent['attack_speed'] ?? 0);
        talentNumbers.sp = (talentNumbers.sp ?? 0) + (talent['sp'] ?? 0) * talentProb;
        // todo: validate ptilopsis and suzuran
        talentNumbers.spRate = (talentNumbers.spRate ?? 0) + (talent['sp_recovery_per_sec'] ?? 0) * talentProb;
    }
    return talentNumbers;
}

export function collectDownNumbers(op: T.Operator, archNumbers: StatNumbers, baseNumbers: StatNumbers, talentNumbers: StatNumbers, def: number, res: number): DamageNumbers {
    const downNumbers: DamageNumbers = {};
    downNumbers.atk = calcTotalAtk([archNumbers, baseNumbers, talentNumbers]);
    downNumbers.dmgType = getDamageType(op);
    downNumbers.aspd = calcTotalAspd([archNumbers, baseNumbers, talentNumbers]);
    downNumbers.hitNum = archNumbers.hitNum ?? baseNumbers.hitNum ?? talentNumbers.hitNum ?? 1;
    downNumbers.spHit = calcTotalSpHit([archNumbers, baseNumbers, talentNumbers]);
    downNumbers.spRate = calcTotalSpRate([archNumbers, baseNumbers, talentNumbers]);
    downNumbers.hitDmg = downNumbers.dmgType === DMG_PHYSICAL
        ? calcPhysDmg([archNumbers, baseNumbers, talentNumbers], def)
        : downNumbers.dmgType === DMG_ARTS
            ? calcArtsDmg([archNumbers, baseNumbers, talentNumbers], res)
            : 0;
    downNumbers.dps = downNumbers.hitDmg * downNumbers.hitNum * downNumbers.aspd;
    return downNumbers;
}

export function collectSkillNumbers(skill: T.Skill): StatNumbers {
    const skillNumbers: StatNumbers = {};
    const skillBlackboard = getBlackboardValues(skill.levels[skill.levels.length - 1].blackboard);
    skillNumbers.atkPercent = skillBlackboard['atk'] ?? 0;
    skillNumbers.atkScale = skillBlackboard['atk_scale'] ?? 1;
    skillNumbers.aspd = skillBlackboard['attack_speed'] ?? 0;
    skillNumbers.hitNum = skillBlackboard['times'] ?? 1;
    return skillNumbers;
}

// todo
export function collectModuleNumbers() {
}

export function collectUpNumbers(op: T.Operator, skill: T.Skill, archNumbers: StatNumbers, baseNumbers: StatNumbers, talentNumbers: StatNumbers, skillNumbers: StatNumbers, downNumbers: DamageNumbers, def: number, res: number): DamageNumbers {
    const upNumbers: DamageNumbers = {};
    upNumbers.atk = calcTotalAtk([archNumbers, baseNumbers, talentNumbers, skillNumbers]);
    upNumbers.dmgType = getDamageType(op, skill);
    upNumbers.aspd = calcTotalAspd([archNumbers, baseNumbers, talentNumbers, skillNumbers]);
    upNumbers.hitNum = skillNumbers.hitNum;
    upNumbers.spType = getSpType(skill);
    upNumbers.spHit = calcTotalSpHit([archNumbers, baseNumbers, talentNumbers, skillNumbers], upNumbers.spType);
    upNumbers.spRate = calcTotalSpRate([archNumbers, baseNumbers, talentNumbers, skillNumbers], upNumbers.spType);
    upNumbers.hitDmg = upNumbers.dmgType === DMG_PHYSICAL
        ? calcPhysDmg([archNumbers, baseNumbers, talentNumbers, skillNumbers], def)
        : upNumbers.dmgType === DMG_ARTS
            ? calcArtsDmg([archNumbers, baseNumbers, talentNumbers, skillNumbers], res)
            : 0;
    upNumbers.dps = upNumbers.hitDmg * upNumbers.hitNum * upNumbers.aspd;

    const s = skill.levels[skill.levels.length - 1];
    switch (s.spData.spType) {
        case SP_ATTACK: {
            if (s.duration && s.duration > 0) {
                console.log(`${SP_ATTACK} with duration >0 not implemented`);
            }
            else {
                upNumbers.uptime = upNumbers.spHit / (1 + s.spData.spCost); // uptime is independent of aspd
                upNumbers.avgDps = upNumbers.dps * upNumbers.uptime + downNumbers.dps * (1 - upNumbers.uptime);
            }
            break;
        }
        case SP_HURT: {
            if (s.duration && s.duration > 0) {
                console.log(`${SP_HURT} with duration >0 not implemented`);
            }
            else {
                console.log(`${SP_HURT} with duration 0 not implemented`);
            }
            break;
        }
        case SP_TIME: {
            if (s.duration && s.duration > 0) {
                upNumbers.uptime = s.duration / (s.duration + s.spData.spCost);
                upNumbers.avgDps = upNumbers.dps * upNumbers.uptime + downNumbers.dps * (1 - upNumbers.uptime);
            }
            else {
                // todo: differentiate between fang s1 and eyja s2
                upNumbers.uptime = 1 / (1 + s.spData.spCost);
                upNumbers.avgDps = upNumbers.dps * upNumbers.uptime + downNumbers.dps * (1 - upNumbers.uptime);
            }
            break;
        }
        default: {
            console.log('Unknown spType: ' + op + ' ' + s.spData.spType);
        }
    }

    return upNumbers;
}

function getBlackboardValues(blackboard: T.Blackboard[]): { [key: string]: number } {
    const blackboardValues: { [key: string]: number } = {};
    for (const variable of blackboard) {
        blackboardValues[variable.key] = variable.value;
    }
    return blackboardValues;
}

function getDamageType(op: T.Operator, skill?: T.Skill): number {
    if (skill) {
        if (skill.levels[skill.levels.length - 1].description.includes('Physical')) {
            return DMG_PHYSICAL;
        }
        else if (skill.levels[skill.levels.length - 1].description.includes('Arts')) {
            return DMG_ARTS;
        }
        else if (skill.levels[skill.levels.length - 1].description.includes('True')) {
            return DMG_TRUE;
        }
    }
    return PROF_DMG_TYPES[op.data.profession];
}

function getSpType(skill: T.Skill): string {
    return skill.levels[skill.levels.length - 1].spData.spType as string;
}
