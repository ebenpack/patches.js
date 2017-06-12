import {put, call, select, takeEvery} from 'redux-saga/effects';

export function* canvasStuff({book}) {

}


function* watchCanvas() {
    yield takeEvery('FOO', canvasStuff)
}

export default [
    watchCanvas,
];