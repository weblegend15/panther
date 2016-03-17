import { bindActionCreators }   from 'redux';
import { connect }              from 'react-redux';

import PlayButtons              from '../components/Samples';
import * as Actions             from '../ducks/samples.duck';
import { selectActionCreators } from '../helpers/duck.helpers';
import {
  artistVisibleSelector, samplesSelector
} from '../selectors/artist-avatar.selector';


function mapStateToProps(state) {
  return {
    tracks:   state.present.getIn(['samples', 'tracks']),
    playing:  state.present.getIn(['samples', 'playing']),
    visible:  state.present.getIn(['graph', 'status']) !== 'repositioning'
  };
}

function mapDispatchToProps(dispatch) {
  const validActionCreators = selectActionCreators(Actions);

  return {
    actions: bindActionCreators(validActionCreators, dispatch)
  };
}

export default connect( mapStateToProps, mapDispatchToProps )( PlayButtons );
