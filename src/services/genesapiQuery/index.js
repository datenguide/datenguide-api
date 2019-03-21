/* eslint-disable no-underscore-dangle,no-param-reassign,prefer-destructuring,no-await-in-loop */

import buildQuery from './queryBuilder'
import transformArguments from './argumentTransformer'

const getQuery = params => buildQuery(transformArguments(params))

const postProcess = data =>
  data
    .map(doc => doc._source)
    .map(doc => {
      doc.year = parseInt(doc.year, 10)
      return doc
    })
    .sort((docA, docB) => docA.year - docB.year)

export default async app => {
  const service = {
    find: async params => {
      const query = getQuery(params)
      app.debug('query', JSON.stringify(query, null, 2))

      let { hits, _scroll_id: scrollId } = await app
        .service('genesapi')
        .raw('search', query)

      const data = []
      while (hits && hits.hits.length) {
        data.push(...hits.hits)
        const result = await app.service('genesapi').raw('scroll', {
          scrollId,
          scroll: '10s'
        })
        scrollId = result._scroll_id
        hits = result.hits
      }
      app.debug(`retrieved ${data.length} documents`)

      return postProcess(data)
    }
  }

  app.use('/genesapiQuery', service)
  app
    .service('genesapiQuery')
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
