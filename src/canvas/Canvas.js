import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Controls from '../controls/Controls';
import Node from '../nodes/Node';


const Connection = ({connection}) => {
    let start = connection.get('start');
    let end = connection.get('end');
    let x1 = start.get('left');
    let x2 = end.get('left');
    let y1 = start.get('top');
    let y2 = end.get('top');
    if (x2 < x1) {
        let temp = x1;
        x1 = x2;
        x2 = temp;
        temp = y1;
        y1 = y2;
        y2 = temp;
    }

    let length = Math.sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)));
    let angle = Math.atan2(y2 - y1, x2 - x1);
    let top = y1 + 0.5 * length * Math.sin(angle) + "px";
    let left = x1 - 0.5 * length * (1 - Math.cos(angle)) + "px";
    const style = {
        position: "absolute",
        width: length,
        top: top,
        left: left,
        transform: `rotate(${angle}rad)`
    };
    return (
        <hr className="patch" style={style}/>
    );
};


const Canvas = ({nodes}) => (
    <div className="canvas">
        {nodes.map((node) => {
            let connected = node.get('connected');
            if (node.has('tempConnect')) {
                connected = connected.push(node.get('tempConnect'));
            }
            return connected.map((connection, index) =>
                <Connection connection={connection} key={index}/>
            )}
        )}
        {nodes.map((node) =>
            <Node node={node} key={node.get('id')}/>
        )}
        <Controls />
    </div>
);

Canvas.propTypes = {
    //foo: PropTypes.string
    //bar: PropTypes.instanceOf(Immutable.Map)
};

function mapStateToProps(state) {
    return {
        nodes: state.get('nodes'),
        patches: state.get('patches'),
    };
}

function mapDispatchToProps(dispatch) {
    return {};
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Canvas);