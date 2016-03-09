import { takeEvery } from 'redux-saga'
import { take, call, put } from 'redux-saga/effects'

import {
  SELECT_ARTIST,
  setupInitialStage,
  markUnclickedArtistsAsRejected,
  retractRejectedNodeEdges,
  removeRejectedArtists,
  retractSelectedNodeEdge,
  positionSelectedArtistToCenter,
  setTopTracks,
  populateRelatedArtistNodes,
  calculateAndExpandEdges,
  restorePreviousNodeState,
  takeSnapshotOfState
} from '../ducks/graph.duck';
import { loadTracks } from '../ducks/samples.duck';
import { fetchRelatedArtists, fetchTopTracks } from '../helpers/api.helpers';
import { repositionDelay, repositionLength } from '../config/timing';


// a utility function: return a Promise that will resolve after 1 second
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))



export function* initializeWithArtist(artist) {
  yield put(setupInitialStage(artist));

  // Fetch related artists
  console.log("About to fetch")
  const [ related, top ] = yield [
    call( fetchRelatedArtists, artist.get('id') ),
    call( fetchTopTracks, artist.get('id') )
  ];

  console.log("Fetched", top)

  yield put(populateRelatedArtistNodes(related.artists));
  yield put(loadTracks(top.tracks));

  yield put(calculateAndExpandEdges());
}


export function* selectArtist(action) {
  if ( action.direction === 'forwards' ) {
    yield put(takeSnapshotOfState());
  }


  yield put(markUnclickedArtistsAsRejected(action.artist));
  yield put(retractRejectedNodeEdges());

  yield delay(repositionDelay);
  if ( action.direction === 'forwards' ) {
    yield put(removeRejectedArtists());
    yield put(retractSelectedNodeEdge());
    yield put(positionSelectedArtistToCenter());

    const [ related, top ] = yield [
      call( fetchRelatedArtists, action.artist.get('id') ),
      call( fetchTopTracks, action.artist.get('id') )
    ];

    yield put(populateRelatedArtistNodes(related.artists));
    yield put(loadTracks(top.tracks));

    yield delay(repositionLength);
    yield put(calculateAndExpandEdges());
  } else {
    yield put(restorePreviousNodeState());
    yield delay(repositionLength);
    yield put(calculateAndExpandEdges());
  }
}


// Our watcher Saga
export function* watchSelectArtist() {
  // The first time this action is triggered, the job is a bit different.
  // We're setting up the structure, not moving forward to the next nodes.
  // TODO: Some way of resetting this, so that the process can be restarted
  // without refreshing the page.
  const initialAction = yield take(SELECT_ARTIST);
  yield initializeWithArtist(initialAction.artist)

  yield* takeEvery(SELECT_ARTIST, selectArtist);
}
