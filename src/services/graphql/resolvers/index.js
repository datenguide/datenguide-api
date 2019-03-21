/* eslint-disable */
import _ from 'lodash'

import { UserInputError } from 'apollo-server-express'
import GraphQLJSON from 'graphql-type-json'

import genesApiSchema from '../schema/schema.json'
import { GESAMT_VALUE } from '../schema'

const MAX_STATISTICS_PER_REGION = 10

export default app => {
  const attributeResolver = attribute => {
    return (obj, args, context) => {
      return context.data
        .filter(doc => Object.keys(doc).includes(attribute))
        .filter(o => {
          let matches = true
          Object.keys(args)
            .filter(key => key !== 'filter')
            .forEach(key => {
              const attributeValue = o[key] || GESAMT_VALUE
              if (!args[key].includes(attributeValue)) {
                matches = false
              }
            })
          return matches
        })
        .map(o => {
          return _.merge(o, {
            value: o[attribute].value,
            id: o.fact_id,
            source: genesApiSchema[attribute].source
          })
        })
    }
  }

  const attributeResolvers = Object.assign(
    {},
    ...Object.keys(genesApiSchema).map(key => ({
      [key]: attributeResolver(key)
    }))
  )

  const getFieldsFromInfo = info => {
    const fields = info.selectionSet.selections
      .map(s => ({ name: s.name.value, args: s.arguments }))
      .filter(f => !['id', 'name'].includes(f.name))
    if (fields.length > 10) {
      throw new UserInputError(
        `too many statistics selected per region, must be <= ${MAX_STATISTICS_PER_REGION}`
      )
    }
    return fields
  }

  return {
    Query: {
      region: async (obj, args, context, info) => {
        const fields = getFieldsFromInfo(info.fieldNodes[0])

        // regions
        const region = await app.service('regions').get(args.id)

        // statistics
        context.data =
          fields.length > 0
            ? await app.service('genesapiQuery').find({ args, fields })
            : []

        return region
      },
      allRegions: async (obj, args, context, info) => {
        const regionSelections = info.fieldNodes[0].selectionSet.selections.find(
          f => f.name.value === 'regions'
        )

        const regionArguments = regionSelections.arguments.reduce((acc, curr) => {
          acc[curr.name.value] = curr.value.value
          return acc
        }, {})

        const fields = regionSelections
          ? getFieldsFromInfo(regionSelections)
          : []

        // regions
        const regionAndPaginationArguments = Object.assign({}, regionArguments, args)
        const query = _.mapKeys(
          regionAndPaginationArguments,
          (value, key) =>
            ({ page: '$skip', itemsPerPage: '$limit' }[key] || key)
        )
        const regions = await app.service('regions').find({ query })

        // statistics
        context.data =
          fields.length > 0
            ? await app.service('genesapiQuery').find({
                args: { ...regionArguments, ids: regions.data.map(r => r.id) },
                fields
              })
            : []

        return {
          page: args.page,
          itemsPerPage: args.itemsPerPage,
          total: regions.total,
          regions: regions.data
        }
      }
    },
    Region: attributeResolvers,
    JSON: GraphQLJSON
  }
}
