/* eslint-disable */
import _ from 'lodash'
import genesApiSchema from '../schema/schema.json'

export default app => {
  const lookups = {
    nuts: val => id =>
      id.length === [null, 2, 3, 5, 8][val] && val < 5 && id !== 'DG',
    parent: val => id => id.startsWith(val)
  }

  const genesApiService = app.service('genesapi')
  const elasticsearch = app.get('elasticsearch')

  // console.log(
  //   await genesApiService.find({
  //     query: {},
  //     paginate: false
  //   })
  // )

  // eslint-disable-next-line
  const regionQuery = (ids, fields) => ({
    query: {
      constant_score: {
        filter: {
          bool: {
            must:
              ids.length > 1 ? { terms: { id: ids } } : { term: { id: ids[0] } }
            // should: [
            //   {
            //     // bool: {
            //     //   must: [{'exists': {'field': field}}] + [{'term': {k: v}} for k, v in filters.items()]
            //     // }
            //   }
            // ] // for field, filters in fields.items() if field in self.schema.keys()
          }
        }
      }
    }
  })

  const region = (obj, args, context, info) => {
    return {
      name: 'region'
    }
  }

  const regions = async (obj, args, context, info) => {
    console.log('args', args)
    const idAggregation = await elasticsearch.search({
      index: 'genesapi',
      body: {
        aggs: {
          ids: {
            terms: { field: 'id', size: 20000 }
          }
        }
      }
    })

    const ids = idAggregation.aggregations.ids.buckets.map(bucket => bucket.key)

    // FIXME
    // const filteredIds = ids.filter(
    //   _.flow(Object.keys(args).map((key, value) => lookups[key](value)))
    // )

    const result = await elasticsearch.search({
      index: 'genesapi',
      body: regionQuery(ids)
    })
    // result.scan().map(s => console.log(s))
    console.log('result', result)
    console.log('result.hit', result.hits)
    return result
  }

  return {
    Query: {
      region,
      regions
    }
  }
}
