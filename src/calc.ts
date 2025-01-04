import { SP_ATTACK, StatNumbers } from './types';

export function calcTotalAtk(numbers: StatNumbers[]): number {
    const baseAtk = numbers.reduce((acc, curr) => acc + (curr.atk ?? 0), 0);
    const atkPercent = numbers.reduce((acc, curr) => acc + (curr.atkPercent ?? 0), 1);
    return baseAtk * atkPercent;
}

export function calcPhysDmg(numbers: StatNumbers[], totalDef: number = 0): number {
    const totalAtk = calcTotalAtk(numbers);
    const atkScale = numbers.reduce((acc, curr) => acc + ((curr.atkScale ?? 1) - 1), 1);
    const minDmg = 0.05 * totalAtk * atkScale;
    const effDef = Math.max(0, totalDef)
    return Math.max(minDmg, totalAtk * atkScale - effDef);
}

export function calcArtsDmg(numbers: StatNumbers[], totalRes: number = 0): number {
    const totalAtk = calcTotalAtk(numbers);
    const atkScale = numbers.reduce((acc, curr) => acc + ((curr.atkScale ?? 1) - 1), 1);
    const minDmg = 0.05 * totalAtk * atkScale;
    const effRes = 1 - totalRes / 100;
    return Math.max(minDmg, totalAtk * atkScale * effRes);
}

export function calcTotalAspd(numbers: StatNumbers[]): number {
    const atkInterval = numbers.reduce((acc, curr) => acc + (curr.atkInterval ?? 0), 0);
    const aspd = numbers.reduce((acc, curr) => acc + (curr.aspd ?? 0), 0);
    return (1 / atkInterval) * (aspd / 100);
}

export function calcTotalSpHit(numbers: StatNumbers[], spType: string = ''): number {
    let spHit = numbers.reduce((acc, curr) => acc + (curr.sp ?? 0), 0);
    if (spType === SP_ATTACK)
        spHit++;
    return spHit;
}

// todo: add sp_recovery_per_sec and validate this
export function calcTotalSpRate(numbers: StatNumbers[], spType: string = ''): number {
    const spHit = calcTotalSpHit(numbers, spType);
    const spRate = numbers.reduce((acc, curr) => acc + (curr.spRate ?? 0), 0);
    return spHit * calcTotalAspd(numbers) + spRate;
}
