import React from 'react';
import {fromJS} from 'immutable';
import {delay} from 'redux-saga';
import {put, call, select, take} from 'redux-saga/effects';

import {getIOByTitle, createSagas} from './index';

import {
    WIDGET_UPDATE,
    connectAccept, connectReject
} from '../actions';

// TODO: MOVE TO WIDGET FILE

class Slider extends React.Component {
    constructor(props) {
        let {inputs, outputs, state, update} = props;
        super(props);
        this.update = update;
        this.state = {
            x: 0,
            min: 0,
            max: 180,
            prevX: null,
            mouseDown: false,
            inputs, outputs, state, update
        };
        let clamp = (n, min, max) =>
            n < min
                ? min
                : n > max
                ? max : n;
        this.handleMouseDown = (e) => {
            this.setState({
                mouseDown: true
            });
        };
        this.handleMouseMove = (e) => {
            if (this.state.mouseDown) {
                let prevX = this.state.prevX
                if (!prevX) {
                    prevX = e.pageX;
                }
                let x = clamp(this.state.x + (e.pageX - prevX), this.state.min, this.state.max);
                this.setState({
                    x,
                    prevX: e.pageX,
                });
                this.update(x);
            }
        };
        this.handleMouseUp = (e) => {
            this.setState({
                mouseDown: false,
                prevX: null,
            });
        };
    }

    componentWillMount() {
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }


    render() {
        return (
            <g>
                <rect
                    x="0"
                    y="45"
                    height="5"
                    width="180"
                    fill="black"
                ></rect>
                <circle
                    transform={`translate(${this.state.x},0)`}
                    onMouseDown={this.handleMouseDown}
                    fill="red"
                    cx="0"
                    cy="50"
                    r="10"
                ></circle>
            </g>
        );
    }
}

export default fromJS({
    title: 'Generators',
    nodes: [
        {
            title: 'Counter',
            body: (inputs, outputs, state) =>
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
            state: [],
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
        }, {
            title: 'Slider',
            body: (inputs, outputs, state) =>
                `Value: ${getIOByTitle(outputs, 'Count').get('value')}`,
            events: (id, selector, update, broadcast) => createSagas(id, selector, update, broadcast)
                .set('main', function *() {
                    while (true){
                        let self = yield select(selector);
                        let {nodeId, value} = yield take(WIDGET_UPDATE);
                        let outputId = getIOByTitle(self.get('outputs'), 'Count').get('id');
                        if (nodeId === id) {
                            yield put(update(id, outputId, 'outputs', value));
                            yield put(broadcast(id, outputId, value));
                        }
                    }
                }),
            width: 180,
            height: 100,
            widgets: [Slider],
            state: [
                {
                    title: 'level',
                    type: Number,
                    value: 0,
                    min: 0,
                    max: 100
                }
            ],
            inputs: [],
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