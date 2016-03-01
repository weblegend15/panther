import React, { Component }     from 'react';
import classNames               from 'classnames';
import FlipMove                 from 'react-flip-move';

import Node from './Node'

class NodeGroup extends Component {
  renderNodes(nodes) {
    return nodes.map( node => (
      <Node
        key={node.get('name')}
        data={node}
        clickNode={this.props.clickNode}
      />
    ));
  }

  render() {
    const { id, nodes } = this.props;

    return (
      <FlipMove duration={1000} className="nodes-region" key={id}>
        { this.renderNodes(nodes) }
      </FlipMove>
    );
  }
};

export default NodeGroup;
