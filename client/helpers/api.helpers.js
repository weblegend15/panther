// Api helpers
// A set of functions that connect both to the Spotify API,
// and to our own back-end server.
import toPairs from 'lodash/toPairs';


///////////////////////////
// SPOTIFY ///////////////
/////////////////////////
const SPOTIFY_ROOT  = 'https://api.spotify.com/v1';

export function fetchRelatedArtists(artistId) {
  return fetchFromAPI({
    root:     SPOTIFY_ROOT,
    endpoint: `artists/${artistId}/related-artists`
  });
}

export function fetchTopTracks(artistId) {
  return fetchFromAPI({
    root:     SPOTIFY_ROOT,
    endpoint: `artists/${artistId}/top-tracks`,
    params:   { country: 'US' }
  });
}

export function fetchSearchResults(q, type = 'artist') {
  return fetchFromAPI({
    root:     SPOTIFY_ROOT,
    endpoint: 'search',
    params:   { q, type }
  });
}

export function fetchArtistInfo(artistId) {
  return fetchFromAPI({
    root:     SPOTIFY_ROOT,
    endpoint: `artists/${artistId}`
  });
}


///////////////////////////
// SERVER ////////////////
/////////////////////////
export function fetchRecentSearches() {
  return fetchFromAPI({
    endpoint:   'searched_artists',
    params: {
      orderBy:  'createdAt',
      limit:    12
    }
  });
}

export function sendRecentSearch({ id, name }) {
  return postToAPI({
    endpoint: 'searched_artists',
    body:     { id, name }
  });
}

export function fetchAccessToken() {
  return fetchFromAPI({
    endpoint: 'spotify_access_token'
  });
}



///////////////////////////
// GENERAL HELPERS ///////
/////////////////////////
function fetchFromAPI({root, endpoint, params}) {
  let url = [root, endpoint].join('/');

  if ( params ) {
    const paramString = toPairs(params).map(param => param.join('=')).join('&');
    url += `?${paramString}`;
  }

  return fetch(url).then(checkStatus).then( response => response.json() );
}

function postToAPI({root, endpoint, body}) {
  let url = [root, endpoint].join('/');

  return fetch(url, {
    method: 'POST',
    headers: {
      'Accept':       'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}
