import Immutable from 'immutable';

const defaultState = Immutable.fromJS([]);

const nodesReducer = (state = defaultState, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

export default nodesReducer;