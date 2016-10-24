import 'isomorphic-fetch'
import { SET_LOCAL_STORAGE } from '../actions'
import forEach from 'lodash/forEach'
import forIn from 'lodash/forIn'

const API_ROOT = 'https://api.spotify.com/v1'

function returnTrackData(searchParams) {
  return Promise.all(searchParams.map((obj) => {
      return fetchTrack(obj)
    })  
  )
  .then((data) => {
    return normalize(data)
  },
  (errCode, errText) => {
    const error = {code: errCode, text: errText}
    return Promise.reject(error)
  })
}

function fetchTrack(obj) {
  let url = `${API_ROOT}/artists/${obj.artistId}/top-tracks?country=US`
  return fetch(url)
    .then(response => response.json().then(json => ({ json, response })))
    .then(({ json, response }) => {
      if (!response.ok) {
        return response.status == 400 ? false : Promise.reject(response.status, response.statusText)
      }
      if (json.tracks[0]) {
        const track = json.tracks[0]
        if (track.album && track.album.images[0]) track.image = track.album.images[0].url
        const concert_id = obj.concertId ? obj.concertId : null
        let songObj = {
          id: track.id,
          spotify_link: track.external_urls.spotify,
          image: track.image ? track.image : null,
          name: track.name,
          artist_id: obj.artistId,
          concert_id: concert_id,
          preview_url: track.preview_url,
          popularity: track.popularity
        }
        return songObj
      }
    })
}

function normalize(songData) {
  let byId = {}
  let allSongs = []
  songData.map((song) => {
    if (song) {
      byId[song.id] = song
      allSongs.push(song.id)
    }
  })
  return { byId, allSongs }
}

export const GET_TRACK_DATA = Symbol('Get Track Data')

export default store => next => action => {
  const getTrackData = action[GET_TRACK_DATA]
  if (typeof getTrackData === 'undefined') {
    return next(action)
  }

  let { spotify_ids } = getTrackData
  const { types } = getTrackData

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


  const currentState = store.getState()

  const searchParams = []
  forIn(currentState.concerts.byId, (val, key) => {
    forEach(val.artists, (artist, i) => {
      const param = i ==0 ? { concertId: key, artistId: artist } : { artistId: artist }
      searchParams.push(param)
    })
  })

  const [ requestType, successType, failureType ] = types
  next(actionWith({ type: requestType }))

  return returnTrackData(searchParams).then(
    response => next(actionWith({
      response,
      type: successType,
      spotify_ids
    })),
    error => next(actionWith({
      type: failureType,
      error: error.text || 'Something bad happened',
      errorCode: error.code
    }))
  )
  .then(() => {
    next(actionWith({
      type: SET_LOCAL_STORAGE
    }))
  })
}