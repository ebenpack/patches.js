import {fromJS} from 'immutable';
import {delay} from 'redux-saga';
import {put, call, take, select} from 'redux-saga/effects';

import {getIOByTitle, createSagas} from './index';

import {
    NODE_UPDATE,
    connectAccept, connectReject
} from '../actions';

const binaryConstructor = (title, operatorStr, operatorFn) => ({
    title: title,
    body: (inputs, outputs) =>
        `${operatorStr}(${inputs.map((input) => input.get('value')).join(', ')} = ${outputs.reduce((acc, input) => acc + input.get('value'), 0)})`,
    events: (id, selector, update, broadcast) => createSagas(id, selector, update, broadcast)
        .set('update', function*() {
            while (true) {
                let {nodeId} = yield take(NODE_UPDATE);
                if (nodeId === id) {
                    let self = yield select(selector);
                    let inputs = self.get('inputs');
                    let left = getIOByTitle(inputs, 'A').get('value');
                    let right = getIOByTitle(inputs, 'B').get('value');
                    let outputId = getIOByTitle(self.get('outputs'), operatorStr).get('id');
                    let result = operatorFn(left, right);
                    yield put(update(id, outputId, 'outputs', result));
                    yield put(broadcast(id, outputId, result));
                }
            }
        }),
    width: 180,
    height: 100,
    state: [],
    inputs: [
        {
            title: 'A',
            type: Number,
            value: 0,
        },
        {
            title: 'B',
            type: Number,
            value: 0,
        }
    ],
    outputs: [
        {
            title: operatorStr,
            type: Number,
            value: 0,
        }
    ]
});

export default fromJS({
    title: 'Math',
    nodes: [
        binaryConstructor('Sum', 'Σ', (a, b) => a + b),
        binaryConstructor('Mod', '%', (a, b) => a % b),
        binaryConstructor('Div', '÷', (a, b) => a / b),
        binaryConstructor('Prod', '∏', (a, b) => a * b),
        binaryConstructor('Sub', '-', (a, b) => a - b),
        binaryConstructor('Exp', '**', (a, b) => Math.pow(a,b)),
    ],
});