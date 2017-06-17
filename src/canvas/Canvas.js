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

    function bezierByH(x0, y0, x1, y1) {
        const mx = x0 + (x1 - x0) / 2;

        return `M${x0} ${y0} C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`;
    }
    return (
        <path
            className="patch"
            d={bezierByH(x1,y1,x2,y2)}
            strokeWidth="4"/>
    );
};


const Canvas = ({nodes, xpos, ypos, scale}) => (
    <div className="canvas">
        <svg
            width="100%" height="100%"
            xmlns="http://www.w3.org/2000/svg">
            {nodes.map((node) => {
                    let connected = node.get('connected');
                    if (node.has('tempConnect')) {
                        connected = connected.push(node.get('tempConnect'));
                    }
                    return connected.map((connection, index) =>
                        <Connection connection={connection} key={index}/>
                    )
                }
            )}
            {nodes.map((node) =>
                <Node node={node} key={node.get('id')}/>
            )}

        </svg>
        <Controls />
    </div>
);

Canvas.propTypes = {
    //foo: PropTypes.string
    //bar: PropTypes.instanceOf(Immutable.Map)
};

function mapStateToProps(state) {
    return {
        xpos: state.getIn(['canvas', 'xpos']),
        ypos: state.getIn(['canvas', 'ypos']),
        scale: state.getIn(['canvas', 'scale']),
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