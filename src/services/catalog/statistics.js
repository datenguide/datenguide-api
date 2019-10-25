import { NotFound } from '@feathersjs/errors'
import _ from 'lodash'
import { flattenStatistic } from './schema'

const ALL_STATISTICS = 'ALL_STATISTICS'

export default async app => {
  const getAllStatistics = async () => {
    const cached = app.cache.get(ALL_STATISTICS)
    if (cached) {
      return cached
    }
    const raw = await app.service('schema').find()
    const result = Object.values(raw).map(s => flattenStatistic(s))
    app.cache.set(ALL_STATISTICS, result)
    return result
  }

  const service = {
    find: async ({ query }) => {
      if (query && query.ids) {
        const { ids } = query
        const raw = await app.service('schema').find()
        return _.uniq(ids).map(id => {
          const statistic = raw[id]
          if (!statistic) {
            return new NotFound(`statistic with ID ${id} not found`)
          }
          return flattenStatistic(statistic)
        })
      }
      return getAllStatistics()
    }
  }

  app.use('/statistics', service)
  app
    .service('statistics')
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
