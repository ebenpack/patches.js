export const getIndex = (state, id) =>
    state.findIndex((node) => node.get('id') === id);

export const getNodePath = (state, nodeId) => {
    let nodePath = null;
    const index = getIndex(state, nodeId);
    if (index < 0) {
        return nodePath;
    } else {
        nodePath = [index];
        return nodePath;

    }
};

export const getIOPath = (state, nodeId, IOId, path) => {
    return [index, path, IOIndex];
};