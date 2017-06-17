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
    const transform = `translate(${left}, ${top})`;
    const bodyText = body(inputs, outputs);
    return (
        <g transform={transform} className="node draggable">
            <rect
                className="body"
                x="0"
                y="0"
                width={width}
                height={height}></rect>
            <rect
                className="handle title"
                x="0"
                y="0"
                width={width}
                height={height * 0.2}
                onMouseDown={(e) => nodeDragStart(id, e.pageX, e.pageY)}></rect>
            {/* mouseDown might cause an ordering change, so `onClick` would be unreliable here */}
            <text
                x={width - 2}
                y="2"
                className="close"
                alignmentBaseline="hanging"
                textAnchor="end"
                onMouseUp={() => removeNode(id)}>
                ✕
            </text>
            <text
                x="0"
                y="0"
                alignmentBaseline="hanging">{title}</text>
            <text
                className="body"
                alignmentBaseline="hanging"
                y={height * 0.2}>{bodyText}</text>
            {inputs.map((input, index) =>
                <g fill="red" key={input.get('id')}>
                    <circle className="input"
                            cx={ input.get('offsetLeft')}
                            cy={input.get('offsetTop')}
                            r="4"
                            key={input.get('title')}
                            onMouseUp={(e) =>
                                connectAttempt(id, input.get('id'), e.pageX, e.pageY)}>

                    </circle>
                    <text
                        x={input.get('offsetLeft') + 5}
                        y={input.get('offsetTop')}
                    >{input.get('title')}</text>
                </g>
            )}
            {outputs.map((output, index) =>
                <g fill="red" key={output.get('id')}>
                    <circle className="output"
                            cx={ output.get('offsetLeft')}
                            cy={ output.get('offsetTop')}
                            r="4"
                            key={output.get('title')}
                            onMouseDown={(e) =>
                                connectStart(id, output.get('id'), e.pageX, e.pageY)}>
                    </circle>
                    <text
                        x={output.get('offsetLeft') - 5}
                        y={output.get('offsetTop')}
                        textAnchor="end"
                    >{output.get('title')}</text>
                </g>
            )}
        </g>
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