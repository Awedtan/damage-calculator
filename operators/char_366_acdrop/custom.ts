import * as T from 'hella-types';
import { StatNumbers } from '../../src/types';
import { collectSkillNumbers, collectTalentNumbers } from '../../src/getDps';

export function customTalentNumbers(op: T.Operator): StatNumbers {
    const talentNumbers = collectTalentNumbers(op);
    talentNumbers.atkScale = 1;
    return talentNumbers;
}

export function customSkillNumbers(skill: T.Skill): StatNumbers {
    const skillNumbers = collectSkillNumbers(skill);
    if (skill.skillId === 'skchr_acdrop_2') {
        skillNumbers.hitNum = 2;
    }
    return skillNumbers;
}
