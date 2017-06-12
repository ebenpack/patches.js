import Immutable from 'immutable';

const defaultState = Immutable.fromJS({});

const canvasReducer = (state = defaultState, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

export default canvasReducer;