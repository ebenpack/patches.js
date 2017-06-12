import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {removeNode, nodeDragStart, connectStart, connectAttempt} from './actions';

const Node = ({node, removeNode, nodeDragStart, connectStart, connectAttempt}) => {
    const title = node.get('title');
    const body = node.get('body');
    const left = node.get('left');
    const top = node.get('top');
    const inputs = node.get('inputs');
    const outputs = node.get('outputs');
    const width = node.get('width');
    const height = node.get('height');
    const id = node.get('id');
    const style = {transform: `translate(${left}px, ${top}px)`, height: `${height}px`};
    const inputCount = inputs.size;
    const outputCount = outputs.size;
    const bodyText = body(inputs, outputs);
    return (
        <div className="node draggable" style={style}>
            {inputs.map((input, index) =>
                <div className="input"
                     style={{transform: `translate(${input.get('offsetLeft')}px, ${input.get('offsetTop')}px)`}}
                     key={input.get('title')}>
                         <span
                             className="connect"
                             onMouseUp={(e) =>
                                 connectAttempt(id, input.get('id'), e.pageX, e.pageY)}
                         ></span>
                        {input.get('title')}
                </div>
            )}
            {outputs.map((output, index) =>
                <div className="output"
                     style={{transform: `translate(${output.get('offsetLeft')}px, ${output.get('offsetTop')}px)`}}
                     key={output.get('title')}>
                        <span
                            className="connect"
                            onMouseDown={(e) =>
                                connectStart(id, output.get('id'), e.pageX, e.pageY)}
                        ></span>
                        {output.get('title')}
                </div>
            )}
            <div className="handle title" onMouseDown={(e)=>nodeDragStart(id, e.pageX, e.pageY)}>
                {/* mouseDown might cause an ordering change, so `onClick` would be unreliable here */}
                <div className="close" onMouseUp={()=>removeNode(id)}>✕</div>
                {title}
            </div>
            <div className="body" style={{width: `${width}px`}}>
                {bodyText}
            </div>
        </div>
    );
};

Node.propTypes = {
    //PropTypes
};

const mapDispatchToProps = {
    removeNode,
    nodeDragStart,
    connectStart,
    connectAttempt
};

export default connect(
    null,
    mapDispatchToProps
)(Node);