import { takeEvery } from 'redux-saga'
import { put } from 'redux-saga/effects'

import { }

// an utility function: return a Promise that will resolve after 1 second
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))


// When we click a node, a bunch of stuff needs to happen:
//   - immediately fade out the NON-clicked nodes, over N1 ms.
//   - immediately fetch the artist info from Spotify
//   - after N1ms, reposition the nodes so that the clicked one is centered.
//      this action should take N2ms
//   - after N1+N2ms, IF the artist info is available, show the artist data.
//     If not, wait until it is and then perform immediately.
export function* clickNode() {
  console.log('Saga running!');
  yield delay(1000);
  console.log("Delay?")
  yield put()
}
