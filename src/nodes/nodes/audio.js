import {fromJS} from 'immutable';
import {delay} from 'redux-saga';
import {put, call, take, select} from 'redux-saga/effects';

import {getIOByTitle, createSagas} from './index';

import {
    NODE_UPDATE, NODE_CONNECT_SUCCESS,
    connectAccept, connectReject
} from '../actions';

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const binaryConstructor = (title, operatorStr, operatorFn) => ({
    title: title,
    body: (inputs, outputs) =>
        `FOOBAR`,
    events: (id, selector, update, broadcast) => createSagas(id, selector, update, broadcast)
        .set('update', function*() {
            const oscillator = audioCtx.createOscillator();
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
        })
        .set('connect', function*(){
            while (true) {
                let {toNodeId, toIOId, fromNodeId, fromIOId} = yield take(NODE_CONNECT_SUCCESS);
                if (toNodeId === id) {

                }
            }
        })
        .set('disconnect', function*(){
            while (true) {
                let {toNodeId, toIOId, fromNodeId, fromIOId} = yield take(NODE_CONNECT_SUCCESS);
                if (toNodeId === id) {
                    
                }
            }
            // NODE_REMOVE
        }),

        //type(pin): "NODE_CONNECT_ADD_TO_STORE"
        // toNodeId(pin): "0dc61be8-c252-e0de-f77e-601c5e34c5ff"
        // toIOId(pin): "7f1383b8-683c-3915-b5cc-69817ab58219"
        // fromNodeId(pin): "6c03e4e9-f8c1-483c-1a38-20e2b2447a68"
        // fromIOId(pin): "675f42ca-b25c-fa97-3e86-532d48e4a551"
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