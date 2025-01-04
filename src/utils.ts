import * as fs from 'fs';
import * as T from 'hella-types';
import path from 'path';
import getDps from "./getDps";

export async function testExpectedValues(verbose: boolean) {
    const expectedDirectory = path.join(__dirname, '../operators');
    const expectedFiles = fs.readdirSync(expectedDirectory)
        .filter(dir => fs.statSync(path.join(expectedDirectory, dir)).isDirectory())
        .filter(dir => fs.existsSync(path.join(expectedDirectory, dir, 'expected.json')))
        .map(dir => ({ name: dir, file: path.join(expectedDirectory, dir, 'expected.json') }));

    for (const { name, file } of expectedFiles) {
        const expected = require(file);
        const actual = getDps(
            (await (await fetch(`https://awedtan.ca/api/operator/${name.split('.')[0]}`)).json() as any).value as T.Operator,
            0, 0);
        if (JSON.stringify(actual) === JSON.stringify(expected)) {
            if (verbose)
                console.log(`${name.split('.')[0]} test passed`);
        }
        else {
            console.log(`${name.split('.')[0]} test failed`);
            if (verbose)
                console.log(JSON.stringify(actual));
        }
    }
}

export async function writeExpectedValues(verbose: boolean) {
    const expectedDirectory = path.join(__dirname, '../operators');
    const expectedFiles = fs.readdirSync(expectedDirectory)
        .filter(dir => fs.statSync(path.join(expectedDirectory, dir)).isDirectory())
        .filter(dir => fs.existsSync(path.join(expectedDirectory, dir, 'expected.json')))
        .map(dir => ({ name: dir, file: path.join(expectedDirectory, dir, 'expected.json') }));

    for (const { name, file } of expectedFiles) {
        const expected = require(file);
        const actual = getDps(
            (await (await fetch(`https://awedtan.ca/api/operator/${name.split('.')[0]}`)).json() as any).value as T.Operator,
            0, 0);
        if (JSON.stringify(actual) === JSON.stringify(expected)) {
            if (verbose)
                console.log(`${name.split('.')[0]} test passed`);
        }
        else {
            console.log(`${file.split('.')[0]} test failed, overwritten`);
            if (verbose)
                console.log(JSON.stringify(actual));
            fs.writeFileSync(file, JSON.stringify(actual));
        }
    }
}
