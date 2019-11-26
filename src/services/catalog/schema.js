import fetch from 'node-fetch'
import { GeneralError } from '@feathersjs/errors'

const RAW_SCHEMA = 'RAW_SCHEMA'

export const flattenMeasure = (measure, statistic) => ({
  id: `${statistic.name}:${measure.name}`,
  statistic_name: statistic.name,
  statistic_title_de: statistic.title_de,
  statistic_title_end: statistic.title_en,
  statistic_description_de: statistic.description_de,
  ...measure,
  dimensions: Object.values(measure.dimensions)
})

export const flattenStatistic = statistic => ({
  ...statistic,
  measures: Object.values(statistic.measures).map(measure =>
    flattenMeasure(measure, statistic)
  )
})

export default async app => {
  const getRaw = async () => {
    const cached = app.cache.get(RAW_SCHEMA)
    if (cached) {
      return cached
    }
    const storageInformationUrl = app.get('storageInformationUrl')
    try {
      app.logger.info(
        `fetching storage information from URL ${storageInformationUrl}...`
      )
      const info = await fetch(storageInformationUrl)
      const infoJson = await info.json()
      app.logger.info('download complete: storage information')
      const schemaUrl = infoJson.storages.schema
      app.logger.info(`fetching schema from URL ${schemaUrl}..`)
      const schema = await fetch(schemaUrl)
      const result = await schema.json()
      app.logger.info('download complete: schema')
      app.cache.set(RAW_SCHEMA, result)
      return result
    } catch (e) {
      throw new GeneralError(`schema initialization failed: ${e}`)
    }
  }

  const service = {
    find: async () => getRaw(),
    setup: async feathersApp => {
      await getRaw(feathersApp)
    }
  }

  app.use('/catalog/schema', service)
  app
    .service('catalog/schema')
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
