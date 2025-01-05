import * as fs from 'fs';
import * as T from 'hella-types';
import path from 'path';
import getDps from "./getDps";

export async function testExpectedValues(verbose: boolean) {
    const operatorDir = path.join(__dirname, '../operators');
    const operatorFiles = fs.readdirSync(operatorDir)
        .filter(dir => fs.statSync(path.join(operatorDir, dir)).isDirectory())
        .filter(dir => fs.existsSync(path.join(operatorDir, dir, 'expected.json')))
        .map(dir => ({
            name: dir,
            expectedFile: path.join(operatorDir, dir, 'expected.json'),
            customFile: path.join(operatorDir, dir, 'custom.ts')
        }));

    for (const { name, expectedFile, customFile } of operatorFiles) {
        const expected = require(expectedFile);
        const custom = fs.existsSync(customFile) ? await import(customFile) : null;
        const actual = getDps(
            (await (await fetch(`https://awedtan.ca/api/operator/${name.split('.')[0]}`)).json() as any).value as T.Operator,
            custom, 0, 0);
        if (JSON.stringify(actual) === JSON.stringify(expected)) {
            if (verbose)
                console.log(`${name.split('.')[0]} - OK`);
        }
        else {
            console.log(`${name.split('.')[0]} - FAIL`);
            if (verbose)
                console.log(JSON.stringify(actual));
        }
    }
}

export async function writeExpectedValues(verbose: boolean) {
    const operatorDir = path.join(__dirname, '../operators');
    const operatorFiles = fs.readdirSync(operatorDir)
        .filter(dir => fs.statSync(path.join(operatorDir, dir)).isDirectory())
        .filter(dir => fs.existsSync(path.join(operatorDir, dir, 'expected.json')))
        .map(dir => ({
            name: dir,
            expectedFile: path.join(operatorDir, dir, 'expected.json'),
            customFile: path.join(operatorDir, dir, 'custom.ts')
        }));

    for (const { name, expectedFile, customFile } of operatorFiles) {
        const expected = require(expectedFile);
        const custom = fs.existsSync(customFile) ? await import(customFile) : null;
        const actual = getDps(
            (await (await fetch(`https://awedtan.ca/api/operator/${name.split('.')[0]}`)).json() as any).value as T.Operator,
            custom, 0, 0);
        if (JSON.stringify(actual) === JSON.stringify(expected)) {
            if (verbose)
                console.log(`${name.split('.')[0]} - OK`);
        }
        else {
            console.log(`${expectedFile.split('.')[0]} - FAIL, overwritten`);
            if (verbose)
                console.log(JSON.stringify(actual));
            fs.writeFileSync(expectedFile, JSON.stringify(actual));
        }
    }
}
