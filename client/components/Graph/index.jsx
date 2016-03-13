import React, { Component, PropTypes } from 'react';
import { List, Map, fromJS } from 'immutable';
import min from 'lodash/min'

import { repositionLength } from '../../config/timing';
import { repositionEasing } from '../../config/easing';
import { GRAVEYARD, PAST, PRESENT, FUTURE } from '../../config/regions';

const radiusPercentage = 8;

class Graph extends Component {
  constructor(props) {
    super(props);
    this.state = this.updateNodesFromStore(props)
  }

  componentDidMount() {
    this.resizeHandler = window.addEventListener('resize', () => {
      this.setState(this.updateNodesFromStore());
    });
  }

  updateResponsiveSizes() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Our radius will depend on window size eventually, with steps?
    // for now, make it percentage based. For this to work, it has to be
    // the smaller of width/height
    this.vertexRadiusSize = min([width, height]) * 1/10;
    this.regionCoords = {
      [GRAVEYARD]:  width * -1/4 - this.vertexRadiusSize,
      [PAST]:       width * 1/6 - this.vertexRadiusSize,
      [PRESENT]:    width * 3/6 - this.vertexRadiusSize,
      [FUTURE]:     width * 5/6 - this.vertexRadiusSize
    };
    this.regionIndexCoords = [
      height * 3/12 - this.vertexRadiusSize,
      height * 6/12 - this.vertexRadiusSize,
      height * 9/12 - this.vertexRadiusSize
    ];
  }

  updateNodesFromStore(props = this.props) {
    this.updateResponsiveSizes();

    const vertices = props.vertices.map( v => v
      .set( 'x', this.regionCoords[v.get('region')] )
      .set( 'y', this.regionIndexCoords[v.get('regionIndex')] )
      .set( 'r', this.vertexRadiusSize )
    );

    const edges = props.edges.map( e => {
      const from  = vertices.find( v => v.get('id') === e.get('from'));
      const to    = vertices.find( v => v.get('id') === e.get('to'));
      const radius = this.vertexRadiusSize;

      return e
        .set( 'x1', from.get('x') + radius )
        .set( 'y1', from.get('y') + radius )
        .set( 'x2', to.get('x') + radius )
        .set( 'y2', to.get('y') + radius );
    });

    return { vertices, edges };
  }

  moveTo(ev) {
    animateShapes(this.state, ::this.setState, {
      vertices: this.state.vertices.map( v => v.update('x', x => Math.random() * 1000))
    }, 1000)
  }

  render() {
    const { vertices, edges, actions } = this.props;

    return (
      <svg id="graph" onClick={(ev) => this.moveTo(ev)}>
        {
          this.state.edges.map( (e, i) => {
            return (
              <line
                key={i}
                x1={e.get('x1')}
                y1={e.get('y1')}
                x2={e.get('x2')}
                y2={e.get('y2')}
              />
            )
          })
        }

        <defs>
          <filter id="dropshadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="2" dy="2"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {
          this.state.vertices.map( (v, i) => {
            return (
              <svg
                key={i}
                width={v.get('r') * 2}
                height={v.get('r') * 2}
                x={v.get('x')}
                y={v.get('y')}
                filter="url(#dropshadow)"
              >

                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  fill="#FFFFFF"

                />
                <text
                  x="50%"
                  y="50%"
                  text-anchor="middle"
                  style={{ fontSize: '14px', fontWeight: 'bold'}}
                >
                  {v.get('name')}
                </text>
              </svg>
            )
          })
        }
      </svg>
    );
  }
};

function calculateXFromRegion(region, radius) {
  switch (region) {
    case GRAVEYARD: this.graveyardX
    case PAST:      return 100 / 6 - radius + "%";
    case PRESENT:   return 300 / 6 - radius + "%";
    case FUTURE:    return 500 / 6 - radius + "%";
  }
}

function calculateYFromRegionIndex(regionIndex, radius) {
  console.log("RegionIndex", regionIndex)
  switch (regionIndex) {
    case 0:      return 150 / 6 - radius + "%";
    case 1:   return 300 / 6 - radius + "%";
    case 2:    return 450 / 6 - radius + "%";
  }
}

function animateShapes(origin, setState, final, duration, easingFunction = easeInOutQuart) {
  const startTime = new Date().getTime();

  function updatePosition() {
    requestAnimationFrame( () => {
      const time = new Date().getTime() - startTime;

      // Figure out the new center points for our vertices
      const newVertices = origin.vertices.map( (vertex, vertexIndex) => {
        // TODO: Replace these with .find calls, since we won't be guaranteed
        // that the index is the same.
        const originVertex  = origin.vertices.get(vertexIndex);
        const finalVertex   = final.vertices.get(vertexIndex);

        return vertex
          .set('x', easingFunction(
            time,
            originVertex.get('x'),
            finalVertex.get('x') - originVertex.get('x'),
            duration
          ))
          .set('y', easingFunction(
            time,
            originVertex.get('y'),
            finalVertex.get('y') - originVertex.get('y'),
            duration
          ));
      });

      const newEdges = origin.edges.map( (edge, edgeIndex) => {
        const from  = newVertices.find( v => v.get('id') === edge.get('from'));
        const to    = newVertices.find( v => v.get('id') === edge.get('to'));
        const radius = from.get('r');

        return edge
          .set( 'x1', from.get('x') + radius )
          .set( 'y1', from.get('y') + radius )
          .set( 'x2', to.get('x') + radius )
          .set( 'y2', to.get('y') + radius );

        return edge;
      });


      setState({
        vertices: newVertices,
        edges: newEdges
      }, () => {
        if ( time < duration ) updatePosition();
      });
    });
  }

  updatePosition();
}

//  t: current time
//  b: beginning value
//  c: change in value
//  d: duration
//
function easeInOutQuart(t, b, c, d) {
  if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
  return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
}

function linear(t, b, c, d) {
  if ( t > d ) return b + c;
  const ratio = t / d;
  return b + (c * ratio);
}


export default Graph;
