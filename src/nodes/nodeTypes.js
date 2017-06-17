import {fromJS} from 'immutable';
import {delay} from 'redux-saga';
import {put, call, take, select, race, takeEvery} from 'redux-saga/effects';

import {
    NODE_BROADCAST, NODE_CONNECT, NODE_UPDATE_IO, NODE_UPDATE,
    NODE_CONNECT_START, NODE_CONNECT_END,
    connectAccept, connectReject, updateNode
} from './actions';
import {getIndex} from './selectors';


function* listenHelper(id, selector, update, input) {
    let self = yield(select(selector));
    let receivers = (self.getIn(['connected'])
        .filter((connected) => connected.get('fromNodeId') === input.fromNodeId)).toList();
    for (let i = 0; i < receivers.size; i++) {
        yield put(update(receivers.getIn([i, 'toNodeId']), receivers.getIn([i, 'toIOId']), 'inputs', input.value));
        yield put(updateNode(id));
    }
}


const createSagas = (id, selector, update, broadcast) => fromJS({
    listen: function *() {
        yield takeEvery(NODE_BROADCAST, listenHelper, id, selector, update);
    },
});

const getIOByTitle = (IO, title) =>
    IO.find((io) => io.get('title') === title);

export default fromJS({
    groups: [
        {
            title: 'Math',
            // MOD
            // DIV
            // SUB
            nodes: [
                {
                    title: 'Sum',
                    body: (inputs, outputs) =>
                        `∑(${inputs.map((input) => input.get('value')).join(', ')} = ${outputs.reduce((acc, input) => acc + input.get('value'), 0)})`,
                    events: (id, selector, update, broadcast) => createSagas(id, selector, update, broadcast)
                        .set('update', function*() {
                            while (true) {
                                let {nodeId} = yield take(NODE_UPDATE);
                                if (nodeId === id) {
                                    let self = yield select(selector);
                                    let inputs = self.get('inputs');
                                    let left = getIOByTitle(inputs, 'A').get('value');
                                    let right = getIOByTitle(inputs, 'B').get('value');
                                    let outputId = getIOByTitle(self.get('outputs'), 'C').get('id');
                                    let sum = left + right;
                                    yield put(update(id, outputId, 'outputs', sum));
                                    yield put(broadcast(id, outputId, sum));
                                }
                            }
                        }),
                    width: 180,
                    height: 100,
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
                            title: 'C',
                            type: Number,
                            value: 0,
                        }
                    ]
                },
                {
                    title: 'Product',
                    body: (inputs, outputs) =>
                        `∏(${inputs.map((input) => input.get('value')).join(', ')} = ${outputs.reduce((acc, input) => acc + input.get('value'), 0)})`,
                    events: (id, selector, update, broadcast) => createSagas(id, selector, update, broadcast)
                        .set('update', function*() {
                            while (true) {
                                let {nodeId} = yield take(NODE_UPDATE);
                                if (nodeId === id) {
                                    let self = yield select(selector);
                                    let inputs = self.get('inputs');
                                    let left = getIOByTitle(inputs, 'A').get('value');
                                    let right = getIOByTitle(inputs, 'B').get('value');
                                    let outputId = getIOByTitle(self.get('outputs'), 'C').get('id');
                                    let prod = left * right;
                                    yield put(update(id, outputId, 'outputs', prod));
                                    yield put(broadcast(id, outputId, prod));
                                }
                            }
                        }),
                    width: 180,
                    height: 100,
                    connected: [],
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
                            title: 'C',
                            type: Number,
                            value: 0,
                        }
                    ]
                }
            ],
        },
        {
            title: 'Generators',
            nodes: [
                {
                    title: 'Counter',
                    body: (inputs, outputs) =>
                        `Delay: ${getIOByTitle(inputs, 'Delay').get('value')}, Count: ${getIOByTitle(outputs, 'Count').get('value')}`,
                    events: (id, selector, update, broadcast) => createSagas(id, selector, update, broadcast)
                        .set('main', function *() {
                            while (true) {
                                let self = yield select(selector);
                                let d = getIOByTitle(self.get('inputs'), 'Delay').get('value');
                                yield call(delay, d);
                                let outputId = getIOByTitle(self.get('outputs'), 'Count').get('id');
                                let nextCount = getIOByTitle(self.get('outputs'), 'Count').get('value') + 1;
                                yield put(update(id, outputId, 'outputs', nextCount));
                                yield put(broadcast(id, outputId, nextCount));

                            }
                        }),
                    width: 180,
                    height: 100,
                    inputs: [
                        {
                            title: 'Delay',
                            type: Number,
                            value: 1000,
                        },

                    ],
                    outputs: [
                        {
                            title: 'Count',
                            type: Number,
                            value: 0,
                        }
                    ]
                }
            ]
        }
    ]
});