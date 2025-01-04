import * as T from 'hella-types';

export function getBlackboardValues(blackboard: T.Blackboard[]) {
    const blackboardValues: { [key: string]: number } = {};
    for (const variable of blackboard) {
        blackboardValues[variable.key] = variable.value;
    }
    return blackboardValues;
}
