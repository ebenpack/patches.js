import {fromJS, toMap} from 'immutable';

import {
    NODE_ADD_TO_STORE, NODE_REMOVE_FROM_STORE, NODE_CONNECT_ADD_TO_STORE,
    NODE_MOVE_TO_TOP, NODE_DRAG, NODE_UPDATE_IO, NODE_CONNECT_START, NODE_CONNECT_DRAG,
    NODE_CONNECT_END
} from './actions';
import {getIndex, getIOPath, getNodePath} from './selectors';

const defaultState = fromJS([]);

const reorderNode = (state, id, moveTo) => {
    const index = getIndex(state, id);
    if (moveTo < 0 || moveTo >= state.size || index < 0) {
        return state;
    }
    const item = state.get(index);
    const temp = state.splice(index, 1);
    return temp.splice(moveTo, 0, item);
};


const moveNode = (node, left, top, nodes) => {
    node = node
        .set('left', left)
        .set('top', top);
    node = node.update('inputs', (inputs) => inputs.map((input, index) =>
        input
            .set('left', left)
            .set('top', top + input.get('offsetTop'))
    ));
    node = node.update('outputs', (outputs) => outputs.map((output, index) =>
        output
            .set('left', left + node.get('width'))
            .set('top', top + output.get('offsetTop'))
    ));
    node = node.update('connected', (connected) => connected.map((connection, index) => {
        let from = nodes.getIn(getIOPath(nodes, connection.get('fromNodeId'), connection.get('fromIOId'), 'outputs'));
        let to = nodes.getIn(getIOPath(nodes, connection.get('toNodeId'), connection.get('toIOId'), 'inputs'));
        return connection
            .set('start', fromJS({
                left: from.get('left'),
                top: from.get('top')
            }))
            .set('end', fromJS({
                left: to.get('left'),
                top: to.get('top'),
            }))
    }));
    return node;
};

const nodesReducer = (state = defaultState, action) => {
    let index = 0;
    let path = null;
    switch (action.type) {
        case NODE_MOVE_TO_TOP:
            return reorderNode(state, action.id, state.size - 1);
        case NODE_REMOVE_FROM_STORE:
            index = getIndex(state, action.id);
            if (index < 0) {
                return state;
            } else {
                return state.delete(index);
            }
        case NODE_ADD_TO_STORE:
            const node = moveNode(action.node, 0, 0, state);
            return state.push(node);
        case NODE_UPDATE_IO:
            path = getIOPath(state, action.nodeId, action.IOId, action.path);
            if (path) {
                state = state.setIn(path.concat('value'), action.value);
                let nodePath = getNodePath(state, action.nodeId);
                if (state.getIn(path).has('updates')){
                    let updater = state.getIn(path).get('updates')(action.value);
                    return state.updateIn(nodePath, updater);
                } else {
                    return state;
                }
            }
            return state;
        case NODE_DRAG:
            index = getIndex(state, action.id);
            if (index < 0) {
                return state;
            } else {
                state = state.update(index, (node) =>
                    moveNode(
                        node,
                        node.get('left') + action.deltaX,
                        node.get('top') + action.deltaY,
                        state
                    )
                );
                return state.map((node) => {
                    let hasConnection = (
                        node.get('connections').find((connection) => connection.fromNodeId === action.id) !== -1
                    );
                    if (hasConnection) {
                        return moveNode(
                            node,
                            node.get('left'),
                            node.get('top'),
                            state
                        )
                    } else {
                        return node;
                    }
                })
            }
        case NODE_CONNECT_START:
            index = getIndex(state, action.nodeId);
            if (index < 0) {
                return state;
            } else {
                let outputIndex = getIndex(state.getIn([index, 'outputs']), action.outputId);
                if (outputIndex < 0) {
                    return state;
                } else {
                    return state.setIn([index, 'tempConnect'], fromJS({
                        start: {
                            left: state.getIn([index, 'outputs', outputIndex, 'left']),
                            top: state.getIn([index, 'outputs', outputIndex, 'top'])
                        },
                        end: {left: action.startX, top: action.startY}
                    }));
                }
            }
        case NODE_CONNECT_DRAG:
            index = getIndex(state, action.nodeId);
            if (index < 0) {
                return state;
            } else {
                return state.updateIn([index, 'tempConnect', 'end'],
                    (end) =>
                        end
                            .update('left', (left) => left + action.deltaX)
                            .update('top', (top) => top + action.deltaY)
                );
            }
        case NODE_CONNECT_END:
            index = getIndex(state, action.nodeId);
            if (index < 0) {
                return state;
            } else {
                return state.deleteIn([index, 'tempConnect']);
            }
        case NODE_CONNECT_ADD_TO_STORE:
            // TODO: PREVENT CYCLES
            let toNodeIndex = getIndex(state, action.toNodeId);
            let toIOPath = getIOPath(state, action.toNodeId, action.toIOId, 'inputs');
            let fromNodeIndex = getIndex(state, action.fromNodeId);
            let fromIOPath = getIOPath(state, action.fromNodeId, action.fromIOId, 'outputs');
            if (toNodeIndex < 0 || fromNodeIndex < 0 || !toIOPath || !fromIOPath) {
                return state;
            } else {
                state = state.updateIn([fromNodeIndex, 'connections'], (connections) => connections.add(fromJS({
                    fromNodeId: action.fromNodeId,
                    fromIOId: action.fromIOId,
                    toNodeId: action.toNodeId,
                    toIOId: action.toIOId,
                })));
                return state.update(toNodeIndex, (node) => {
                    node = node.update('connected', (connected) =>
                        connected.push(fromJS({
                            toNodeId: action.toNodeId,
                            toIOId: action.toIOId,
                            fromNodeId: action.fromNodeId,
                            fromIOId: action.fromIOId,
                        }))
                    );
                    node = moveNode(node, node.get('left'), node.get('top'), state);
                    return node;
                });
            }
        default:
            return state;
    }
};

export default nodesReducer;