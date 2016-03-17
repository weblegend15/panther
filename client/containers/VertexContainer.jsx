import { bindActionCreators }   from 'redux';
import { connect }              from 'react-redux';

import Vertex                   from '../components/Graph/Vertex.jsx';
import { selectArtist }         from '../ducks/graph.duck';



function mapStateToProps(state, ownProps) {
  return {
    ...ownProps,
    artist: state.present.get('artists').get(ownProps.id)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ selectArtist }, dispatch)
  }
}

export default connect( mapStateToProps, mapDispatchToProps )( Vertex );
