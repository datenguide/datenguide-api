/* eslint-disable no-underscore-dangle,no-param-reassign,prefer-destructuring,no-await-in-loop */

export default async app => {
  const service = {
    find: async params => {
      if (!params.query) {
        app.logger.debug('no query passed, returning empty set')
        return []
      }
      const result = await app.service('genesapi').raw('search', params.query)

      let { hits, _scroll_id: scrollId } = result

      const data = []
      while (hits && hits.hits.length) {
        data.push(...hits.hits)
        const scrollResult = await app.service('genesapi').raw('scroll', {
          scrollId,
          scroll: '10s'
        })
        scrollId = scrollResult._scroll_id
        hits = scrollResult.hits
      }
      app.logger.debug(`retrieved ${data.length} documents`)
      return data
    }
  }

  app.use('/genesapiRawQuery', service)
  app
    .service('genesapiRawQuery')
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
