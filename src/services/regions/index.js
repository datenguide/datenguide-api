import _ from 'lodash'

import names from './names.json'

const MAX_PAGE_SIZE = 1000
const DEFAULT_PAGE_SIZE = 10

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
      const filters = Object.keys(params.query)
        .filter(key => !key.startsWith('$'))
        .map(key => {
          return r => r.filter(queryToFilters[key](params.query[key]))
        })
      const result = _.flow(...filters)(regions)
      const limit = Math.min(params.query.$limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
      const skip = params.query.$skip || 0
      return {
        total: result.length,
        limit,
        skip,
        data: result.slice(skip * limit, skip * limit + limit)
      }
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
