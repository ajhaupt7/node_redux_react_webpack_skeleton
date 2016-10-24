import findIndex from 'lodash/findIndex'
import filter from 'lodash/filter'
import moment from 'moment'

export default store => next => action => {
  const { type } = action;
  if (type === 'SET_LOCAL_STORAGE') {
    const state = store.getState();
    if (state.homeData.submissionErrors) return false

    const dateFormatted   = moment(state.formData.date)
    const cityFormatted   = state.formData.city.toLowerCase()
    const regionFormatted = state.formData.region.toLowerCase()
    const compressedDate  = dateFormatted.format("MMDDYYYY")
    const hashed          = `${cityFormatted}${regionFormatted}${compressedDate}`

    const saveData = {
      updatedAt:      moment(),
      concerts:       state.concerts,
      artists:        state.artists, 
      songs:          state.songs,
      hashed:         hashed,
      date:           dateFormatted, 
      city:           cityFormatted, 
      region:         regionFormatted
    }

    const prevStoredState = JSON.parse(localStorage.getItem('entities'))
    let dataToSet

    if (prevStoredState) {
      const entities = filter(prevStoredState, function(entity) {
        const entityDate = moment(entity.date)
        const entityUpdatedAt = moment(entity.updatedAt)
        return saveData.updatedAt.diff(entityDate, 'days') <= 0 && saveData.updatedAt.diff(entityUpdatedAt, 'days') < 7
      })

      if (entities) {
        let foundEntity = findIndex(entities, {'hashed': hashed})
        foundEntity != -1 ? entities[foundEntity] = saveData : entities.unshift(saveData)
        dataToSet = entities.length > 10 ? entities.slice(0,-1) : entities
      } else {
        dataToSet = [saveData]
      }
    } else {
      dataToSet = [saveData]
    }
    localStorage.setItem('entities', JSON.stringify(dataToSet));
  }
  next(action);
}