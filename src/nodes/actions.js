import {fromJS} from 'immutable';

export const NODE_ADD = 'NODE_ADD';
export const NODE_ADD_TO_STORE = 'NODE_ADD_TO_STORE';
export const NODE_MOVE_TO_TOP = 'NODE_MOVE_TO_TOP';
export const NODE_REMOVE = 'NODE_REMOVE';
export const NODE_REMOVE_FROM_STORE = 'NODE_REMOVE_FROM_STORE';
export const NODE_UPDATE = 'NODE_UPDATE';
export const NODE_UPDATE_IO = 'NODE_UPDATE_IO';
export const NODE_BROADCAST = 'NODE_BROADCAST';

export const NODE_DRAG_START = 'NODE_DRAG_START';
export const NODE_DRAG = 'NODE_DRAG';
export const NODE_DRAG_END = 'NODE_DRAG_END';

export const NODE_CONNECT = 'NODE_CONNECT';
export const NODE_CONNECT_START = 'NODE_CONNECT_START';
export const NODE_CONNECT_DRAG = 'NODE_CONNECT_DRAG';
export const NODE_CONNECT_END = 'NODE_CONNECT_END';
export const NODE_CONNECT_ATTEMPT = 'NODE_CONNECT_ATTEMPT';
export const NODE_CONNECT_ACCEPT = 'NODE_CONNECT_ACCEPT';
export const NODE_CONNECT_REJECT = 'NODE_CONNECT_REJECT';
export const NODE_CONNECT_SUCCESS = 'NODE_CONNECT_SUCCESS';

export const NODE_CONNECT_ADD_TO_STORE = 'NODE_CONNECT_ADD_TO_STORE';

export const WIDGET_UPDATE = 'WIDGET_UPDATE';

export const nodeDragStart = (id, startX, startY) => ({
    type: NODE_DRAG_START,
    id,
    startX,
    startY
});

export const nodeDrag = (id, deltaX, deltaY) => ({
    type: NODE_DRAG,
    id,
    deltaX,
    deltaY
});

export const nodeDragEnd = (id) => ({
    type: NODE_DRAG_END,
    id
});

export const moveNodeToTop = (id) => ({
    type: NODE_MOVE_TO_TOP,
    id
});

export const removeNode = (id) => ({
    type: NODE_REMOVE,
    id
});

export const removeNodeFromStore = (id) => ({
    type: NODE_REMOVE_FROM_STORE,
    id
});

export const addNode = (node) => ({
    type: NODE_ADD,
    node
});

export const addNodeToStore = (node) => ({
    type: NODE_ADD_TO_STORE,
    node
});

export const updateNode = (nodeId) => ({
    type: NODE_UPDATE,
    nodeId,
});

export const updateIO = (nodeId, IOId, path, value) => ({
    type: NODE_UPDATE_IO,
    nodeId,
    IOId,
    path,
    value
});

export const widgetUpdate = (nodeId, value) => ({
    type: WIDGET_UPDATE,
    nodeId,
    value
});

export const broadcast = (fromNodeId, fromIOId, value) => ({
    type: NODE_BROADCAST,
    fromNodeId,
    fromIOId,
    value
});

export const connectNodes = (toNodeId, toIOId, fromNodeId, fromIOId, fromType) => ({
    type: NODE_CONNECT,
    toNodeId,
    toIOId,
    fromNodeId,
    fromIOId,
    fromType
});

export const connectStart = (nodeId, outputId, startX, startY) => ({
    type: NODE_CONNECT_START,
    nodeId,
    outputId,
    startX,
    startY
});

export const connectDrag = (nodeId, deltaX, deltaY) => ({
    type: NODE_CONNECT_DRAG,
    nodeId,
    deltaX,
    deltaY
});

export const connectEnd = (nodeId) => ({
    type: NODE_CONNECT_END,
    nodeId
});

export const connectAttempt = (nodeId, inputId) =>({
    type: NODE_CONNECT_ATTEMPT,
    nodeId,
    inputId
});

export const addConnectionToStore = (toNodeId, toIOId, fromNodeId, fromIOId) => ({
    type: NODE_CONNECT_ADD_TO_STORE,
    toNodeId,
    toIOId,
    fromNodeId,
    fromIOId
});

// TODO: Same as above
export const connectSuccess = (toNodeId, toIOId, fromNodeId, fromIOId) => ({
    type: NODE_CONNECT_SUCCESS,
    toNodeId,
    toIOId,
    fromNodeId,
    fromIOId
});