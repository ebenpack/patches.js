import {fromJS} from 'immutable';
import {delay} from 'redux-saga';
import {put, call, take, select, race, takeEvery} from 'redux-saga/effects';

import {
    NODE_BROADCAST, NODE_CONNECT, NODE_UPDATE_IO, NODE_UPDATE,
    NODE_CONNECT_START, NODE_CONNECT_END,
    connectAccept, connectReject, updateNode
} from './actions';
import {getIndex} from './selectors';


function* listenHelper(id, selector, update, input){
    let self = yield(select(selector));
    let receivers = (self.getIn(['connected'])
        .filter((connected) => connected.get('fromNodeId') === input.fromNodeId)).toList();
    for (let i=0; i< receivers.size; i++) {
        yield put(update(receivers.getIn([i, 'toNodeId']), receivers.getIn([i, 'toIOId']), 'inputs', input.value));
        yield put(updateNode(id));
    }
}


const createSagas = (id, selector, update, broadcast) => fromJS({
    listen: function *(){
        yield takeEvery(NODE_BROADCAST, listenHelper, id, selector, update);
    },
});



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
                        `∑(${inputs.getIn([0, 'value'])}, ${inputs.getIn([1, 'value'])} = ${outputs.getIn([0, 'value'])})`,
                    events: (id, selector, update, broadcast) => createSagas(id, selector, update, broadcast)
                        .set('update', function* (){
                            while (true) {
                                let {nodeId} = yield take(NODE_UPDATE);
                                if (nodeId === id) {
                                    let self = yield select(selector);
                                    let left = self.getIn(['inputs', 0, 'value']);
                                    let right = self.getIn(['inputs', 1, 'value']);
                                    let outputId = self.getIn(['outputs', 0, 'id']);
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
                        `∏(${inputs.getIn([0, 'value'])}, ${inputs.getIn([1, 'value'])} = ${outputs.getIn([0, 'value'])})`,
                    events: (id, selector, update, broadcast) => createSagas(id, selector, update, broadcast)
                        .set('update', function* (){
                            while (true) {
                                let {nodeId} = yield take(NODE_UPDATE);
                                if (nodeId === id) {
                                    let self = yield select(selector);
                                    let left = self.getIn(['inputs', 0, 'value']);
                                    let right = self.getIn(['inputs', 1, 'value']);
                                    let outputId = self.getIn(['outputs', 0, 'id']);
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
                        `Delay: ${inputs.getIn([0,'value'])}, Count: ${outputs.getIn([0,'value'])}`,
                    events: (id, selector, update, broadcast) => createSagas(id, selector, update, broadcast)
                        .set('main', function *() {
                            let self = yield select(selector);
                            let outputId = self.getIn(['outputs', 0, 'id']);
                            while (true) {
                                let self = yield select(selector);
                                let d = self.getIn(['inputs', 0, 'value']);
                                yield call(delay, d);
                                let nextCount = self.getIn(['outputs', 0, 'value']) + 1;
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