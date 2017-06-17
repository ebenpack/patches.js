import Immutable from 'immutable';

const defaultState = Immutable.fromJS({
    xpos: 0,
    ypos: 0,
    scale: 1000,
});

const canvasReducer = (state = defaultState, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

export default canvasReducer;