import {fromJS} from 'immutable';
import {delay} from 'redux-saga';
import {put, call, select} from 'redux-saga/effects';

import {getIOByTitle, createSagas} from './index';

import {
    connectAccept, connectReject
} from '../actions';

export default fromJS({
    title: 'Generators',
    nodes: [
        {
            title: 'Counter',
            body: (inputs, outputs) =>
                `Delay: ${getIOByTitle(inputs, 'Delay').get('value')}, Count: ${getIOByTitle(outputs, 'Count').get('value')}`,
            events: (id, selector, update, broadcast) => createSagas(id, selector, update, broadcast)
                .set('main', function *() {
                    while (true) {
                        let self = yield select(selector);
                        let d = getIOByTitle(self.get('inputs'), 'Delay').get('value');
                        yield call(delay, d);
                        let outputId = getIOByTitle(self.get('outputs'), 'Count').get('id');
                        let nextCount = getIOByTitle(self.get('outputs'), 'Count').get('value') + 1;
                        yield put(update(id, outputId, 'outputs', nextCount));
                        yield put(broadcast(id, outputId, nextCount));

                    }
                }),
            width: 180,
            height: 100,
            inputs: [
                {
                    title: 'Delay',
                    type: Number,
                    value: 1000,
                },

            ],
            outputs: [
                {
                    title: 'Count',
                    type: Number,
                    value: 0,
                }
            ]
        }
    ]
});