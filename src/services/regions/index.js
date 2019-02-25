import _ from 'lodash'

import names from './names.json'

const regions = Object.keys(names).map(key => ({ id: key, name: names[key] }))

const queryToFilters = {
  nuts: value => region => {
    return (
      region.id.length === [null, 2, 3, 5, 8][value] &&
      value < 5 &&
      region.id !== 'DG'
    )
  },
  parent: value => region => region.id !== value && region.id.startsWith(value)
}

export default async app => {
  const service = {
    find: async params => {
      const filters = Object.keys(params.query).map(key => {
        return r => r.filter(queryToFilters[key](params.query[key]))
      })
      return _.flow(...filters)(regions)
    },
    get: async id => regions.find(o => o.id === id.toString())
  }

  app.use('/regions', service)
  app
    .service('regions')
    .hooks({
      before: {
        all: [],
        find: []
      },
      after: {
        all: [],
        find: []
      },
      error: {
        all: [],
        find: []
      }
    })
    .hooks({
      after: {
        all: []
      }
    })
}
