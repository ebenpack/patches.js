import {List, Map, fromJS} from 'immutable';
import {put, select, takeEvery} from 'redux-saga/effects';

import mathNodes from './math';
import generatorNodes from './generators';
import audioNodes from './audio';

import {
    NODE_BROADCAST, NODE_CONNECT, NODE_UPDATE_IO, NODE_UPDATE,
    NODE_CONNECT_START, NODE_CONNECT_END,
    connectAccept, connectReject, updateNode
} from '../actions';
import {getIndex} from '../selectors';


export function* listenHelper(id, selector, update, input) {
    let self = yield(select(selector));
    let receivers = (self.getIn(['connected'])
        .filter((connected) => connected.get('fromNodeId') === input.fromNodeId)).toList();
    for (let i = 0; i < receivers.size; i++) {
        yield put(update(receivers.getIn([i, 'toNodeId']), receivers.getIn([i, 'toIOId']), 'inputs', input.value));
        yield put(updateNode(id));
    }
}

export const createSagas = (id, selector, update, broadcast) => fromJS({
    listen: function *() {
        yield takeEvery(NODE_BROADCAST, listenHelper, id, selector, update);
    },
});

export const getIOByTitle = (IO, title) =>
    IO.find((io) => io.get('title') === title);

export default Map().set('groups', List([
    audioNodes,
    mathNodes,
    generatorNodes,
]));