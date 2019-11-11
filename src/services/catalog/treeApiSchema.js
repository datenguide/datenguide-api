export default async app => {
  const service = {
    find: async () => {
      const data = await app.service('schema').find()

      const measures = {}
      const mappings = {}
      Object.keys(data).forEach(statistic => {
        const statisticSchema = data[statistic]
        Object.keys(statisticSchema.measures).forEach(measure => {
          measures[measure] = {
            ...data[statistic].measures[measure],
            source: statisticSchema
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
