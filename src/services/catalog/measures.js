import { BadRequest, NotFound } from '@feathersjs/errors'
import _ from 'lodash'
import { flattenMeasure } from './schema'

const ALL_MEASURES = 'ALL_MEASURES'

const getAllMeasures = async app => {
  const cached = app.cache.get(ALL_MEASURES)
  if (cached) {
    return cached
  }
  const raw = await app.service('schema').find()
  const result = Object.values(raw).reduce(
    (acc, curr) => acc.concat(Object.values(curr.measures)),
    []
  )
  app.cache.set(ALL_MEASURES, result)
  return result
}

export default async app => {
  const service = {
    find: async ({ query }) => {
      if (query && query.ids) {
        const { ids } = query
        const raw = await app.service('schema').find()
        return _.uniq(ids).map(id => {
          const { statisticsId, measureId } = id
          if (!statisticsId || !measureId) {
            return new BadRequest(`invalid measure ${JSON.stringify(id)}`)
          }
          const statistic = raw[statisticsId]
          if (!statistic) {
            return new NotFound(`statistic with ID ${statisticsId} not found`)
          }
          const measure = statistic.measures[measureId]
          if (!measure) {
            return new NotFound(
              `measure with ID ${measureId} not found in statistic ${statisticsId}, available measures are: ${Object.keys(
                statistic.measures
              )}`
            )
          }
          return flattenMeasure(measure)
        })
      }
      return getAllMeasures(app)
    }
  }

  app.use('/measures', service)
  app
    .service('measures')
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
