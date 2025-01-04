import * as fs from 'fs';
import * as T from 'hella-types';
import getDps from "./getDps";
import { OperatorModifiers } from "./types";

export const archetypeModifiers: { [key: string]: OperatorModifiers } = {};
export const operatorModifiers: { [key: string]: OperatorModifiers } = {};

export function loadArchetypeModifiers() {
    const directory = './modifiers/archetypes';
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const archId = file.split('.')[0];
        archetypeModifiers[archId] = JSON.parse(fs.readFileSync(`${directory}/${file}`).toString());
    }
}

export function loadOperatorModifiers() {
    const directory = './modifiers/operators';
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const opId = file.split('.')[0];
        operatorModifiers[opId] = JSON.parse(fs.readFileSync(`${directory}/${file}`).toString());
    }
}

export async function testExpectedValues() {
    const expectedDirectory = './expected';
    const expectedFiles = fs.readdirSync(expectedDirectory);
    for (const file of expectedFiles) {
        const expected = require(`.${expectedDirectory}/${file}`);
        const actual = getDps(
            (await (await fetch(`https://awedtan.ca/api/operator/${file.split('.')[0]}`)).json() as any).value as T.Operator,
            0, 0);
        if (JSON.stringify(actual) === JSON.stringify(expected)) {
            console.log(`${file.split('.')[0]} check passed`);
        }
        else {
            console.log(`${file.split('.')[0]} check failed`);
            console.log(JSON.stringify(actual));
        }
    }
}

export async function writeExpectedValues() {
    const expectedDirectory = './expected';
    const expectedFiles = fs.readdirSync(expectedDirectory);
    for (const file of expectedFiles) {
        const expected = require(`.${expectedDirectory}/${file}`);
        const actual = getDps(
            (await (await fetch(`https://awedtan.ca/api/operator/${file.split('.')[0]}`)).json() as any).value as T.Operator,
            0, 0);
        if (JSON.stringify(actual) === JSON.stringify(expected)) {
            console.log(`${file.split('.')[0]} check passed`);
        }
        else {
            console.log(`${file.split('.')[0]} check failed, overwritten`);
            fs.writeFileSync(`./expected/${file}`, JSON.stringify(actual));
        }
    }
}
