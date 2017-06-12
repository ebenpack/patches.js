import {fork} from 'redux-saga/effects';
import canvasSagas from './canvas/sagas';
import nodeSagas from './nodes/sagas';

const sagas = [
    ...canvasSagas,
    ...nodeSagas
];

export default function* rootSaga() {
    yield sagas.map(saga => fork(saga));
}