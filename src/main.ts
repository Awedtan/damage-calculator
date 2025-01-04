import 'dotenv/config';
import express from 'express';
import * as T from 'hella-types';
import getDps from './getDps';
import { testExpectedValues, writeExpectedValues } from './utils';
const cors = require('cors');

async function main() {
    const args = process.argv.slice(2);
    if (args.length > 0) {
        if (args[0] === 'test') {
            testExpectedValues(args[1] && args[1] == 'v');
            return;
        }
        else if (args[0] === 'write') {
            writeExpectedValues(args[1] && args[1] == 'v');
            return;
        }
    }

    const app = express();
    app.use(cors());
    app.get('/operator/:op', async (request, response) => {
        const def = Math.min(10000, request.query.def ? parseInt(request.query.def) : 2800);
        const res = Math.min(500, request.query.res ? parseInt(request.query.res) : 140);
        const ticks = Math.min(50, request.query.ticks ? parseInt(request.query.ticks) : 15) - 1;
        let opReq = null;
        try {
            opReq = await fetch(`https://awedtan.ca/api/operator/${request.params.op}?exclude=paradox`);
        } catch (e) {
            console.error(e);
            response.status(404).send('Operator not found');
        }

        if (opReq && opReq.ok) {
            const op = (await opReq.json() as any).value as T.Operator;
            const defInc = def / ticks;
            const resInc = res / ticks;
            const dpsArr = [[], [], []];
            for (let i = 0; i <= ticks; i++) {
                const def = defInc * i;
                const res = resInc * i;
                dpsArr[0].push({ def: def, res: 0, dps: getDps(op, def, 0) });
                dpsArr[1].push({ def: 0, res: res, dps: getDps(op, 0, res) });
                dpsArr[2].push({ def: def, res: res, dps: getDps(op, def, res) });
            }
            response.status(200).send(dpsArr);
        }
        else {
            response.status(404).send('Operator not found');
        }
    });
    app.listen(process.env.PORT, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    });
}

main();
