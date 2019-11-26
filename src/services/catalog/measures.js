import { BadRequest, NotFound } from '@feathersjs/errors'
import _ from 'lodash'
import { flattenMeasure } from './schema'

const ALL_MEASURES = 'ALL_MEASURES'

const getAllMeasures = async app => {
  const cached = app.cache.get(ALL_MEASURES)
  if (cached) {
    return cached
  }
  const raw = await app.service('catalog/schema').find()
  const result = Object.values(raw).reduce(
    (acc, curr) =>
      acc.concat(
        Object.values(curr.measures).map(measure =>
          flattenMeasure(measure, curr)
        )
      ),
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
        const raw = await app.service('catalog/schema').find()
        return _.uniq(ids).map(id => {
          const { statisticId, measureId } = id
          if (!statisticId || !measureId) {
            return new BadRequest(`invalid measure ${JSON.stringify(id)}`)
          }
          const statistic = raw[statisticId]
          if (!statistic) {
            return new NotFound(`statistic with ID ${statisticId} not found`)
          }
          const measure = statistic.measures[measureId]
          if (!measure) {
            return new NotFound(
              `measure with ID ${measureId} not found in statistic ${statisticId}, available measures are: ${Object.keys(
                statistic.measures
              )}`
            )
          }
          return flattenMeasure(measure, statistic)
        })
      }
      return getAllMeasures(app)
    }
  }

  app.use('/catalog/measures', service)
  app
    .service('catalog/measures')
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
