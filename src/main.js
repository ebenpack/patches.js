import {render} from 'react-dom';
import React from 'react';
import {createStore, applyMiddleware, compose} from 'redux';
import {combineReducers} from 'redux-immutable';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import canvasReducer from './canvas/reducer';
import nodesReducer from './nodes/reducer';
import patchesReducer from './patches/reducer';

import '../sass/react.scss';
import Canvas from './canvas/Canvas';

import sagas from './sagas';

const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

function initializeStore() {
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
        combineReducers({
            canvas: canvasReducer,
            nodes: nodesReducer,
            patches: patchesReducer,
        }),
        composeEnhancers(
            applyMiddleware(sagaMiddleware)
        ),
    );
    sagaMiddleware.run(sagas);
    return store;
}

const App = () => {
    const store = initializeStore();
    return (
        <Provider store={store}>
            <Canvas />
        </Provider>
    )
};

const start = (el) =>
    render(
        <App />,
        document.querySelector(el)
    );

export {start};