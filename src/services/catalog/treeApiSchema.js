export default async app => {
  const service = {
    find: async () => {
      const data = await app.service('catalog/schema').find()

      const measures = {}
      const mappings = {}
      Object.keys(data).forEach(statistic => {
        const statisticSchema = data[statistic]
        Object.keys(statisticSchema.measures).forEach(measure => {
          measures[measure] = {
            ...data[statistic].measures[measure],
            source: {
              title_de: statisticSchema.title_de,
              valid_from: statisticSchema.valid_from,
              periodicity: statisticSchema.periodicity,
              name: statisticSchema.name,
              url: statisticSchema.url
            },
            dimensions: {
              // tree API workaround: collect and merge all dimensions of this measure
              ...(measures[measure] ? measures[measure].dimensions : []),
              ...data[statistic].measures[measure].dimensions
            }
          }
          if (!mappings[measure]) {
            mappings[measure] = []
          }
          mappings[measure].push(statisticSchema)
        })
      })
      return {
        measures,
        mappings
      }
    }
  }

  app.use('/treeApiSchema', service)
  app
    .service('treeApiSchema')
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
