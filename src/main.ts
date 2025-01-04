import * as T from 'hella-types';
import { loadArchetypeModifiers, loadOperatorModifiers, testExpectedValues, writeExpectedValues } from './dynamics';
import getDps from './getDps';
import express from 'express';
import 'dotenv/config';
const cors = require('cors');

async function main() {
    loadArchetypeModifiers();
    loadOperatorModifiers();


    const args = process.argv.slice(2);
    if (args.length > 0) {
        if (args[0] === 'test') {
            testExpectedValues();
            return;
        }
        else if (args[0] === 'write') {
            writeExpectedValues();
            return;
        }
    }

    const app = express();
    app.use(cors());
    app.get('/operator/:op', async (request, response) => {
        const def = request.query.def ? parseInt(request.query.def) : 1500;
        const res = request.query.res ? parseInt(request.query.res) : 150;
        const qty = request.query.ticks ? parseInt(request.query.qty) : 15;
        const opReq = await fetch(`https://awedtan.ca/api/operator/${request.params.op}?exclude=paradox`);

        if (opReq.ok) {
            const op = (await opReq.json() as any).value as T.Operator;
            const defInc = def / qty;
            const resInc = res / qty;
            const dpsArr = [[], [], []];
            for (let i = 0; i <= qty; i++) {

                const def = defInc * i;
                const res = resInc * i;

                dpsArr[0].push({ def, res: 0, dps: getDps(op, defInc * i, 0) });
                dpsArr[1].push({ def: 0, res, dps: getDps(op, 0, resInc * i) });
                dpsArr[2].push({ def, res, dps: getDps(op, defInc * i, resInc * i) });
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
