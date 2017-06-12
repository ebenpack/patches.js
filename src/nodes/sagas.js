import {Set, List} from 'immutable';
import {eventChannel, delay, END} from 'redux-saga';
import {put, call, take, fork, race, select, cancel} from 'redux-saga/effects';
import {
    NODE_DRAG_START, NODE_ADD, NODE_REMOVE, NODE_CONNECT_START, NODE_CONNECT_ATTEMPT,
    addNodeToStore, nodeDragEnd, nodeDrag, moveNodeToTop, updateIO, broadcast, removeNodeFromStore,
    addConnectionToStore, connectEnd, connectDrag
} from './actions';
import {getIndex, getIOPath} from './selectors';
import {uuid} from '../utils';

export const createMouseChannel = () =>
    eventChannel(emit => {

        const mouseUpListener = (e) => emit({
            type: 'END'
        });

        const mouseDownListener = (e) => emit({
            type: 'MOVE',
            x: e.pageX,
            y: e.pageY
        });

        document.addEventListener('mouseup', mouseUpListener);
        document.addEventListener('mousemove', mouseDownListener);

        const unsubscribe = () => {
            document.removeEventListener('mouseup', mouseUpListener);
            document.removeEventListener('mousemove', mouseDownListener);
        };

        return unsubscribe
    });


function* watchDrag() {
    const mouseChannel = yield call(createMouseChannel);
    while (true) {
        let {node, connect} = yield race({
            node: take(NODE_DRAG_START),
            connect: take(NODE_CONNECT_START)
        });
        if (node) {
            let {id, startX, startY} = node;
            yield put(moveNodeToTop(id));
            while (true) {
                const event = yield take(mouseChannel);
                if (event.type === 'MOVE') {
                    const deltaX = event.x - startX;
                    const deltaY = event.y - startY;
                    startX = event.x;
                    startY = event.y;
                    yield put(nodeDrag(id, deltaX, deltaY));
                } else if (event.type === 'END') {
                    yield put(nodeDragEnd(id));
                    break
                }
            }
        } else if (connect) {
            let {nodeId, outputId, startX, startY} = connect;
            while (true) {
                const event = yield take(mouseChannel);
                if (event.type === 'MOVE') {
                    const deltaX = event.x - startX;
                    const deltaY = event.y - startY;
                    startX = event.x;
                    startY = event.y;
                    yield put(connectDrag(nodeId, deltaX, deltaY));
                } else if (event.type === 'END') {
                    // This race feels dirty, but we need to hold onto the
                    // tempConnect information if/while connection negotiation happens,
                    // and I'm not certain the
                    // connection attempt fired by the mouseUp on the target input
                    // wouldn't be lost otherwise.
                    let {attempt} = yield race({
                        timeout: delay(200),
                        attempt: take(NODE_CONNECT_ATTEMPT)
                    });
                    if (attempt) {
                        let fromNodeId = nodeId;
                        let fromIOId = outputId;
                        let toNodeId = attempt.nodeId;
                        let toIOId = attempt.inputId;
                        let nodes = yield select((store) => store.get('nodes'));
                        let output = yield select((store)=>
                            nodes.getIn(getIOPath(store.get('nodes'), fromNodeId, fromIOId, 'outputs')));
                        let input = yield select((store)=>
                            nodes.getIn(getIOPath(store.get('nodes'), toNodeId, toIOId, 'inputs')));
                        if (input.get('type') === output.get('type')) {
                            yield put(addConnectionToStore(toNodeId, toIOId, fromNodeId, fromIOId));
                        }
                    }
                    yield put(connectEnd(nodeId));
                    break
                }
            }
        }
    }
}

const positionIO = (count, index) => {
    const increment = 1.0 / (count + 1);
    return increment * (index + 1);
};

const calculateTopOffset = (height, bodyPercentage, count, index) =>
(height * (1 - bodyPercentage)) +
(height * bodyPercentage) * positionIO(count, index);

function* watchAdd() {
    const running = {};
    while (true) {
        let id;
        const {add, remove} = yield race({
            add: take(NODE_ADD),
            remove: take(NODE_REMOVE),
        });
        if (add) {
            let {node} = add;
            let id = yield call(uuid);
            node = node.set('id', id);
            for (let i = 0; i < node.get('inputs').size; i++) {
                node = node.setIn(['inputs', i, 'id'], yield call(uuid));
                node = node.setIn(
                    ['inputs', i, 'offsetTop'],
                    calculateTopOffset(node.get('height'), 0.8, node.get('inputs').size, i)
                );
                node = node.setIn(['inputs', i, 'offsetLeft'], 0);
            }
            for (let i = 0; i < node.get('outputs').size; i++) {
                node = node.setIn(['outputs', i, 'id'], yield call(uuid));
                node = node.setIn(
                    ['outputs', i, 'offsetTop'],
                    calculateTopOffset(node.get('height'), 0.8, node.get('outputs').size, i)
                );
                node = node.setIn(['outputs', i, 'offsetLeft'], node.get('width'));
            }
            node = node.set('left', 0).set('top', 0).set('connections', Set()).set('connected', List());
            yield put(addNodeToStore(node));

            const selector = (store) => store.get('nodes').find((node) => node.get('id') === id);
            running[id] = [];
            node = node.set('events', node.get('events')(id, selector, updateIO, broadcast));
            for (let key of node.get('events').keys()) {
                running[id].push(yield fork(node.getIn(['events', key])));
            }
        } else if (remove) {
            id = remove.id;
            for (let i = 0; i < running[id].length; i++) {
                yield cancel(running[id][i]);
            }
            delete running[id];
            yield put(removeNodeFromStore(id));
        }
    }
}

export default [
    watchDrag,
    watchAdd,
];