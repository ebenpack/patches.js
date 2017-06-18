import {fromJS, OrderedMap, toMap} from 'immutable';

import {
    NODE_ADD_TO_STORE, NODE_REMOVE_FROM_STORE, NODE_CONNECT_ADD_TO_STORE,
    NODE_MOVE_TO_TOP, NODE_DRAG, NODE_UPDATE_IO, NODE_CONNECT_START, NODE_CONNECT_DRAG,
    NODE_CONNECT_END
} from './actions';

const defaultState = OrderedMap();

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
    node = node.update('connected', (connected) => connected.map((connection) => {
        let from = nodes.getIn([connection.get('fromNodeId'), 'outputs', connection.get('fromIOId')]);
        let to = nodes.getIn([connection.get('toNodeId'), 'inputs', connection.get('toIOId')]);
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
    let path = null;
    let node = null;
    switch (action.type) {
        case NODE_MOVE_TO_TOP:
            node = state.get(action.id);
            return state.delete(action.id).set(action.id, node);
        case NODE_REMOVE_FROM_STORE:
            return state
                .delete(action.id)
                .map((node)=>
                    node.update('connected', (connected)=>
                        connected.filterNot((connected)=>connected.get('fromNodeId')===action.id)
                    )
                );
        case NODE_ADD_TO_STORE:
            node = moveNode(action.node, 0, 0, state);
            return state.set(node.get('id'), node);
        case NODE_UPDATE_IO:
            path = [action.nodeId, action.path, action.IOId];
            state = state.setIn(path.concat('value'), action.value);
            if (state.get(action.nodeId).has('updates')) {
                let updater = state.getIn(path).get('updates')(action.value);
                return state.update(action.nodeId, updater);
            } else {
                return state;
            }
        case NODE_DRAG:
            state = state.update(action.id, (node) =>
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
            });
        case NODE_CONNECT_START:
            let output = state.getIn([action.nodeId, 'outputs', action.outputId]);
            return state.setIn([action.nodeId, 'tempConnect'], fromJS({
                start: {
                    left: output.get('left'),
                    top: output.get('top'),
                },
                end: {left: action.startX, top: action.startY}
            }));

        case NODE_CONNECT_DRAG:
            return state.updateIn([action.nodeId, 'tempConnect', 'end'],
                (end) =>
                    end
                        .update('left', (left) => left + action.deltaX)
                        .update('top', (top) => top + action.deltaY)
            );
        case NODE_CONNECT_END:
            return state.deleteIn([action.nodeId, 'tempConnect']);
        case NODE_CONNECT_ADD_TO_STORE:
            // TODO: PREVENT CYCLES
            state = state.updateIn([action.fromNodeId, 'connections'], (connections) => connections.add(fromJS({
                fromNodeId: action.fromNodeId,
                fromIOId: action.fromIOId,
                toNodeId: action.toNodeId,
                toIOId: action.toIOId,
            })));
            return state.update(action.toNodeId, (node) => {
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
        default:
            return state;
    }
};

export default nodesReducer;