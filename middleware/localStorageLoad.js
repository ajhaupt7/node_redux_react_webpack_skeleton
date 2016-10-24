import { RESET_STATE } from '../actions'
import capitalize from 'lodash/capitalize'
import orderBy from 'lodash/orderBy'
import filter from 'lodash/filter'
import moment from 'moment'

export default store => next => action => {
  const { type } = action;
  if (type === 'INIT') {
    try {
      const now = moment()
      const storedEntities = JSON.parse(localStorage.getItem('entities'))
      const filteredEntities = filter(storedEntities, function(entity) {
        const entityDate = moment(entity.date)
        const entityUpdatedAt = moment(entity.updatedAt)
        return now.diff(entityDate, 'days') <= 0 && now.diff(entityUpdatedAt, 'days') < 7
      })
      const entities = orderBy(filteredEntities, 'updatedAt', 'desc')
      localStorage.setItem('entities', JSON.stringify(entities))

      let prevSearch
      const data = entities.map((entity, i) => {
        const date = moment(entity.date).diff(now, 'days') >= 0 ? moment(entity.date).toDate() : now
        const formData = {
          date: date,
          city: capitalize(entity.city),
          region: entity.region.length == 2 ? entity.region.toUpperCase() : capitalize(entity.region)
        }
        if (i == 0) {
          entity.formData = formData
          prevSearch = entity
        }
        return formData
      })
      if (prevSearch) {
        store.dispatch({
          type: RESET_STATE,
          mostRecentSearch: prevSearch,
          prevSearches: data
        })
      }
      return;
    } catch (e) {
      console.log(e)
    }
  }

  next(action);
}