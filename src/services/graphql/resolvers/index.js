/* eslint-disable */
import GraphQLJSON from 'graphql-type-json'
import { UserInputError } from 'apollo-server-express'

import genesApiSchema from '../schema/schema.json'
import genesApiMappings from '../schema/mappings.json'
import transformPaginationArguments from '../argumentTransformers/pagination'
import transformRegionArguments from '../argumentTransformers/regions'
import { GESAMT_VALUE } from '../schema'
import { DEFAULT_PAGE_SIZE } from '../../regions'
import buildQuery from './queryBuilder'

const MAX_STATISTICS_PER_REGION = 10

export default app => {
  const elasticSearchIndex = app.get('elasticsearch').index

  const valueAttributeResolver = attribute => {
    return async (obj, args) => {
      const query = buildQuery(elasticSearchIndex, { obj, attribute, args })
      app.logger.debug('query', JSON.stringify(query, null, 2))

      const data = await app.service('genesapiRawQuery').find({
        query
      })

      return data
        .map(doc => doc._source)
        .map(doc => {
          doc.year = parseInt(doc.year, 10)
          doc.value = doc[attribute].value
          doc.id = doc['fact_id']
          doc.source = genesApiMappings[attribute].find(
            source => source.name === doc.cube.substr(0, 5)
          )
          Object.keys(args).map(arg => {
            doc[arg] = doc[arg] || GESAMT_VALUE
          })
          return doc
        })
        .sort((docA, docB) => docA.year - docB.year)
    }
  }

  const attributeResolvers = Object.assign(
    {},
    ...Object.keys(genesApiSchema).map(key => ({
      [key]: valueAttributeResolver(key)
    }))
  )

  const regionResolver = async (obj, args) => {
    return app.service('regions').get(args.id)
  }

  const allRegionsResolver = async (obj, args, context, info) => {
    // fetch region arguments from metadata to calculate total
    // as it's not passed to this resolver
    const regionSelections = info.fieldNodes[0].selectionSet.selections.find(
      f => f.name.value === 'regions'
    )
    const regionArguments = regionSelections.arguments.reduce((acc, curr) => {
      acc[curr.name.value] = curr.value.value
      return acc
    }, {})

    // make sure the query includes <= MAX_STATISTICS_PER_REGION fields
    const fields = regionSelections.selectionSet.selections
      .map(s => ({ name: s.name.value, args: s.arguments }))
      .filter(f => !['id', 'name'].includes(f.name))
    if (fields.length > 10) {
      throw new UserInputError(
        `too many statistics selected per region, must be <= ${MAX_STATISTICS_PER_REGION}`
      )
    }

    // get total number of results (count query)
    const regions = await app.service('regions').find({
      query: Object.assign({}, transformRegionArguments(regionArguments), {
        $skip: 0,
        $limit: 0
      })
    })

    const { page = 0, itemsPerPage = DEFAULT_PAGE_SIZE } = args

    return {
      page,
      itemsPerPage,
      total: regions.total
    }
  }

  const regionResultResolver = async (obj, args) => {
    const regions = await app.service('regions').find({
      query: Object.assign(
        {},
        transformRegionArguments(args),
        transformPaginationArguments(obj)
      )
    })
    return regions.data
  }

  return {
    Query: {
      region: regionResolver,
      allRegions: allRegionsResolver
    },
    Region: attributeResolvers,
    RegionsResult: {
      regions: regionResultResolver
    },
    JSON: GraphQLJSON
  }
}
