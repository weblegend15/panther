import { Map, List, fromJS } from 'immutable';

import graph from '../ducks/graph.duck';


const rootReducer = ( state = Map(), action ) => {
  return Map({
    // Each top-level key here has a child reducer that manages that part
    // of the state. These reducers are defined in their own files, and
    // they take their slice of the state, as well as the action invoked.
    graph: graph(
      state.get('graph'),
      action
    )
  });
};

export default rootReducer
