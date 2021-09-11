import { EventStream, once } from "baconjs"

import * as React from "react";
import * as ReactDOM from "react-dom";

const main = (node: Element) => {
    class MyComponent extends React.Component {
        render() {
            return <div>Hello World</div>;
        }
    }

    ReactDOM.render(<MyComponent />, node);
};
