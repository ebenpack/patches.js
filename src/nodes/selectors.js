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
    let IOPath = null;
    const index = getIndex(state, nodeId);
    if (index < 0) {
        return IOPath;
    } else {
        let IOIndex = getIndex(state.getIn([index, path]), IOId);
        if (IOIndex < 0) {
            return IOPath;
        } else {
            IOPath = [index, path, IOIndex];
            return IOPath;
        }
    }
};