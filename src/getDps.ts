import * as T from 'hella-types';
import { calcArtsDmg, calcPhysDmg, calcTotalAspd, calcTotalAtk, calcTotalSpHit, calcTotalSpRate } from "./calc";
import { DamageNumbers, DMG_ARTS, DMG_PHYSICAL, DMG_TRUE, PROF_DMG_TYPES, SP_ATTACK, SP_HURT, SP_TIME, StatNumbers } from "./types";

export default function getDps(op: T.Operator, def: number, res: number) {
    const baseNumbers = collectBaseNumbers(op);
    const talentNumbers = collectTalentNumbers(op);
    const downNumbers = collectDownNumbers(op, baseNumbers, talentNumbers, def, res);
    const upNumbersArr: DamageNumbers[] = [];

    for (let i = 0; i < op.skills.length; i++) {
        const skillNumbers = collectSkillNumbers(op, i);
        const upNumbers = collectUpNumbers(op, i, baseNumbers, talentNumbers, skillNumbers, def, res);

        const s = op.skills[i].levels[op.skills[i].levels.length - 1];
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
        upNumbersArr.push(upNumbers);
    }

    downNumbers.atk = Math.round(downNumbers.atk * 1e3) / 1e3;
    downNumbers.aspd = Math.round(downNumbers.aspd * 1e3) / 1e3;
    downNumbers.spRate = Math.round(downNumbers.spRate * 1e3) / 1e3;
    downNumbers.hitDmg = Math.round(downNumbers.hitDmg * 1e3) / 1e3;
    downNumbers.dps = Math.round(downNumbers.dps * 1e3) / 1e3;
    for (const upNumbers of upNumbersArr) {
        upNumbers.atk = Math.round(upNumbers.atk * 1e3) / 1e3;
        upNumbers.aspd = Math.round(upNumbers.aspd * 1e3) / 1e3;
        upNumbers.spRate = Math.round(upNumbers.spRate * 1e3) / 1e3;
        upNumbers.hitDmg = Math.round(upNumbers.hitDmg * 1e3) / 1e3;
        upNumbers.dps = Math.round(upNumbers.dps * 1e3) / 1e3;
        upNumbers.uptime = Math.round(upNumbers.uptime * 1e3) / 1e3;
        upNumbers.avgDps = Math.round(upNumbers.avgDps * 1e3) / 1e3;
    }
    return { downNumbers, upNumbersArr };
}

function collectBaseNumbers(op: T.Operator): StatNumbers {
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

function collectTalentNumbers(op: T.Operator): StatNumbers {
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

function collectDownNumbers(op: T.Operator, baseNumbers: StatNumbers, talentNumbers: StatNumbers, def: number, res: number): DamageNumbers {
    const downNumbers: DamageNumbers = {};
    downNumbers.atk = calcTotalAtk([baseNumbers, talentNumbers]);
    downNumbers.dmgType = getDamageType(op);
    downNumbers.aspd = calcTotalAspd([baseNumbers, talentNumbers]);
    downNumbers.hitNum = 1;
    downNumbers.spHit = calcTotalSpHit([baseNumbers, talentNumbers]);
    downNumbers.spRate = calcTotalSpRate([baseNumbers, talentNumbers]);
    downNumbers.hitDmg = downNumbers.dmgType === DMG_PHYSICAL
        ? calcPhysDmg([baseNumbers, talentNumbers], def)
        : downNumbers.dmgType === DMG_ARTS
            ? calcArtsDmg([baseNumbers, talentNumbers], res)
            : 0;
    downNumbers.dps = downNumbers.hitDmg * downNumbers.hitNum * downNumbers.aspd;
    return downNumbers;
}

function collectSkillNumbers(op: T.Operator, i: number): StatNumbers {
    const skill = op.skills[i];
    const skillNumbers: StatNumbers = {};
    const skillBlackboard = getBlackboardValues(skill.levels[skill.levels.length - 1].blackboard);
    skillNumbers.atkPercent = skillBlackboard['atk'] ?? 0;
    skillNumbers.atkScale = skillBlackboard['atk_scale'] ?? 1;
    skillNumbers.aspd = skillBlackboard['attack_speed'] ?? 0;
    skillNumbers.hitNum = skillBlackboard['times'] ?? 1;
    return skillNumbers;
}

// todo
function collectModuleNumbers() {
}

function collectUpNumbers(op: T.Operator, i: number, baseNumbers: StatNumbers, talentNumbers: StatNumbers, skillNumbers: StatNumbers, def: number, res: number): DamageNumbers {
    const upNumbers: DamageNumbers = {};
    upNumbers.atk = calcTotalAtk([baseNumbers, talentNumbers, skillNumbers]);
    upNumbers.dmgType = getDamageType(op, op.skills[i]);
    upNumbers.aspd = calcTotalAspd([baseNumbers, talentNumbers, skillNumbers]);
    upNumbers.hitNum = skillNumbers.hitNum;
    upNumbers.spType = getSpType(op.skills[i]);
    upNumbers.spHit = calcTotalSpHit([baseNumbers, talentNumbers, skillNumbers], upNumbers.spType);
    upNumbers.spRate = calcTotalSpRate([baseNumbers, talentNumbers, skillNumbers], upNumbers.spType);
    upNumbers.hitDmg = upNumbers.dmgType === DMG_PHYSICAL
        ? calcPhysDmg([baseNumbers, talentNumbers, skillNumbers], def)
        : upNumbers.dmgType === DMG_ARTS
            ? calcArtsDmg([baseNumbers, talentNumbers, skillNumbers], res)
            : 0;
    upNumbers.dps = upNumbers.hitDmg * upNumbers.hitNum * upNumbers.aspd;
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
