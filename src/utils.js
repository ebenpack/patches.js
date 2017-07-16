import {eventChannel, END} from 'redux-saga';

const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);

export const uuid = () =>
    s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();

export const createMouseChannel = () =>
    eventChannel(emit => {

        const mouseUpListener = (e) => emit({
            type: 'END'
        });

        const mouseDownListener = (e) => emit({
            type: 'MOVE',
            x: e.pageX,
            y: e.pageY
        });

        document.addEventListener('mouseup', mouseUpListener);
        document.addEventListener('mousemove', mouseDownListener);

        const unsubscribe = () => {
            document.removeEventListener('mouseup', mouseUpListener);
            document.removeEventListener('mousemove', mouseDownListener);
        };

        return unsubscribe
    });
