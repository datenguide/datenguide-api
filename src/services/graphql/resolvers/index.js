/* eslint-disable */
import _ from 'lodash'
import genesApiSchema from '../schema/schema.json'
import getQuery from './query'

export default app => {
  const attributeResolver = attribute => (obj, args, context) =>
    context.data
      .filter(doc => Object.keys(doc).includes(attribute))
      .map(o => {
        return _.merge(o, {
          value: o[attribute].value,
          id: o.fact_id,
          source: genesApiSchema[attribute].source
        })
      })

  const attributeResolvers = Object.assign(
    {},
    ...Object.keys(genesApiSchema).map(key => ({
      [key]: attributeResolver(key)
    }))
  )

  const postProcessResult = data =>
    data
      .map(doc => doc._source)
      .map(doc => {
        doc.year = parseInt(doc.year)
        return doc
      })
      .sort((docA, docB) => docA.year - docB.year)

  const fetchData = async (args, fields) => {
    const query = getQuery(args, fields)
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

    return postProcessResult(data)
  }

  const getFieldsFromInfo = info =>
    info.fieldNodes[0].selectionSet.selections
      .map(s => ({ name: s.name.value, args: s.arguments }))
      .filter(f => !['id', 'name'].includes(f.name))

  return {
    Query: {
      region: async (obj, args, context, info) => {
        const fields = getFieldsFromInfo(info)
        context.data = fields.length > 0 ? await fetchData(args, fields) : []
        const region = await app.service('regions').get(args.id)
        return region
      },
      regions: async (obj, args, context, info) => {
        const fields = getFieldsFromInfo(info)
        context.data = fields.length > 0 ? await fetchData(args, fields) : []
        const regions = await app.service('regions').find({ query: args })
        return regions.data
      }
    },
    Region: attributeResolvers
  }
}
