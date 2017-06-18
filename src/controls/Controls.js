import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import nodeTypes from '../nodes/nodes/index';
import {addNode} from '../nodes/actions';

const Controls = ({nodeTypes, addNode}) => {
    return (
        <div className="controls">
            {nodeTypes.get('groups').map((group) =>
                <div className="control" key={group.get('title')}>
                    <h3>{group.get('title')}</h3>
                    {group.get('nodes').map((node) =>
                        <div key={node.get('title')}>
                            <a onClick={() => addNode(node)}>
                                Add {node.get('title')}
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

Controls.propTypes = {
    //PropTypes
};

function mapStateToProps(state) {
    return {
        nodeTypes: nodeTypes
    };
}

const mapDispatchToProps = {
    addNode
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Controls);