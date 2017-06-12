import "babel-polyfill";
import {start} from './main.js';

window['App'] = {
    init: (el) => start(el)
};