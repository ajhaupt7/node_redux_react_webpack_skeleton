import 'isomorphic-fetch'
import fetch_jsonp from 'fetch-jsonp'
import Promise from 'bluebird'
import orderBy from 'lodash/orderBy'
import { SET_LOCAL_STORAGE, FOUND_CACHED_ENTITY } from '../actions'
import findIndex from 'lodash/findIndex'
import find from 'lodash/find'
import { push } from 'react-router-redux';

const API_ROOT = 'https://api.bandsintown.com'
const punctuation = /[.,\/#!$%\^&\*;:{}=\-_`@~()\s]/g

function callApi(endpoint) {
  const fullURL = (endpoint.indexOf(API_ROOT) === -1) ? API_ROOT + endpoint : endpoint

  return fetch_jsonp(fullURL)
    .then(response => response.json().then(concerts => ({ concerts, response })))
    .then(({ concerts, response }) => {
      if (!response.ok || concerts.errors) {
        return Promise.reject(concerts)
      }

      return Promise.map(concerts, (concert) => {
        return filterConcert(concert)
      })
      .then((concerts) => {
        const filteredConcerts = concerts.filter(Boolean)
        const sortedConcerts = orderBy(filteredConcerts, 'topArtistPopularity', 'desc')
        const completeResponse = normalize(sortedConcerts)
        return completeResponse
      })
    })
}

function normalize(concerts) {
  let concertsById = {}
  let artistsById = {}
  let concertIds = []
  concerts.map((concert) => {
    let artistIds = []
    concert.artists.map((artist, i) =>{
      artistIds.push(artist.spotify_id)
      artistsById[artist.spotify_id] = artist
    })
    concert.artists = artistIds
    let foundConcert = findIndex(concertsById, {'flatVenueName': concert.flatVenueName})
    if (foundConcert != -1 && concertsById[foundConcert]) {
      concertsById[foundConcert].artists = concertsById[foundConcert].artists.concat(concert.artists)
    } else {
      concertIds.push(concert.id)
      concertsById[concert.id] = concert
    }
  })
  return { concertsById, artistsById, concertIds }
}

function filterConcert(concert) {
  concert.flatVenueName = concert.venue.name.toLowerCase().replace(punctuation,'').replace("theatre", "theater")
  const artistGroup = concert.artists.length > 5 ? concert.artists.slice(0,6) : concert.artists
  return Promise.map(artistGroup, (artist) => {
    return searchSpotify(artist)
  })
  .then((artists) => {
    const filteredArtists = artists.filter(Boolean)
    concert.artists = filteredArtists.length > 0 ? orderBy(filteredArtists, 'popularity', 'desc') : null
    if (concert.artists) {
      const { popularity, image, spotify_url, name } = concert.artists[0]
 
      return Object.assign(concert, {
        topArtistPopularity: popularity,
        image: image,
        spotify_url: spotify_url,
        name: name
      })
    } 
  })
}


function searchSpotify(searchedArtist) {
  console.log(`Searched for ${searchedArtist.name}`)
  const url = `https://api.spotify.com/v1/search?q=${searchedArtist.name}&type=artist`
  const options = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  return fetch(url,options)
    .then(response => response.json().then(json => ({ json, response })))
    .then(({ json, response }) => {
      if (!response.ok) {
        if (response.status == 400 || response.status == 404 || response.status == 429 || response.status == 502) {
          console.log(response.statusText)
          return 
        } else {
          console.log(response.statusText)
          return Promise.reject(json)
        }
      }
      const artists = json.artists.items
      for (let i = 0; i < artists.length; i++) {
        let spotifyName = artists[i].name.toLowerCase().replace(punctuation,'');
        let searchedName = searchedArtist.name.toLowerCase().replace(punctuation,'');
        if (spotifyName == searchedName) {
          console.log(`Found ${artists[i].name}`)
          let newArtist = {
            name: artists[i].name,
            spotify_url: artists[i].external_urls.spotify,
            genre: artists[i].genres.length > 0 ? artists[i].genres[0] : null,
            popularity: artists[i].popularity,
            spotify_id: artists[i].id,
            image: artists[i].images.length > 0 ?  artists[i].images[0].url : null
          }
          return newArtist
          break;
        } else if (i > 5) {
          break;
        }
      }
    })
    .catch(() => {
      return
    })
}

export const CALL_API = Symbol('Call API')

export default store => next => action => {
  const callAPI = action[CALL_API]
  if (typeof callAPI === 'undefined') {
    return next(action)
  }

  let { endpoint } = callAPI
  const { types, hashed, searchData } = callAPI

  if (typeof endpoint === 'function') {
    endpoint = endpoint(store.getState())
  }

  if (typeof endpoint !== 'string') {
    throw new Error('Specify a string endpoint URL.')
  }
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.')
  }
  if (!types.every(type => typeof type === 'string')) {
    throw new Error('Expected action types to be strings.')
  }

  function actionWith(data) {
    const finalAction = Object.assign({}, action, data)
    return finalAction
  }

  const [ requestType, successType, failureType ] = types
  next(actionWith({ type: requestType }))
  const currentPath = store.getState().routing.locationBeforeTransitions.pathname
  currentPath == '/' ? store.dispatch(push('/results')) : null

  const entities = JSON.parse(localStorage.getItem('entities'))
  const foundEntity = find(entities, {'hashed': hashed})
  if (foundEntity) {
    return next(actionWith({
      foundEntity,
      type: FOUND_CACHED_ENTITY
    }))
  }

  return callApi(endpoint).then(
    response => next(actionWith({
      response,
      searchData,
      type: successType
    })),
    error => next(actionWith({
      type: failureType,
      error: error
    }))
  )
  .then(() => {
    next(actionWith({
      type: SET_LOCAL_STORAGE
    }))
  })
}