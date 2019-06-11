/* eslint-disable */
import _ from 'lodash'

import { UserInputError } from 'apollo-server-express'
import GraphQLJSON from 'graphql-type-json'

import genesApiSchema from '../schema/schema.json'
import genesApiMappings from '../schema/mappings.json'
import { GESAMT_VALUE } from '../schema'
import transformRegionArguments from '../argumentTransformers/regions'
import {
  transformValueAttributeResolverArguments,
  transformValueAttributes
} from '../argumentTransformers/valueAttributes'
import transformPaginationArguments from '../argumentTransformers/pagination'

const MAX_STATISTICS_PER_REGION = 10

export default app => {
  const elasticSearchIndex = app.get('elasticsearch').index

  const valueAttributeResolver = attribute => {
    return (obj, args, context) => {
      // TODO use data loader
      // return context.attributeLoader.load({
      //   obj: obj,
      //   attribute: attribute,
      //   args: args
      // })
      const valueAttributeArgs = transformValueAttributeResolverArguments(
        attribute,
        args
      )
      return context.data
        .filter(doc => doc.region_id === obj.id)
        .filter(doc => Object.keys(doc).includes(attribute))
        .filter(doc => {
          let matches = true
          Object.keys(valueAttributeArgs).forEach(key => {
            if (key === 'statistics') {
              const statistics = valueAttributeArgs[key].map(v => v.substr(1))
              matches = _.some(statistics, value => doc.cube.startsWith(value))
            } else {
              const attributeValue = doc[key] || GESAMT_VALUE
              if (
                !valueAttributeArgs[key].includes(attributeValue.toString())
              ) {
                matches = false
              }
            }
          })
          return matches
        })
        .map(o => {
          return _.merge(o, {
            value: o[attribute].value,
            id: o.fact_id,
            source: genesApiMappings[attribute].find(
              source => source.name === o.cube.substr(0, 5)
            )
          })
        })
    }
  }

  const attributeResolvers = Object.assign(
    {},
    ...Object.keys(genesApiSchema).map(key => ({
      [key]: valueAttributeResolver(key)
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
        // const valueAttributes = getFieldsFromInfo(info.fieldNodes[0])
        //
        // const transformedRegionArguments = transformRegionArguments(args)
        //
        // const transformedValueAttributes = transformValueAttributes(
        //   valueAttributes
        // )

        // regions
        const region = await app.service('regions').get(args.id)

        // // statistics
        // context.data =
        //   transformedValueAttributes.length > 0
        //     ? await app.service('genesapiQuery').find({
        //         index: elasticSearchIndex,
        //         args: transformedRegionArguments,
        //         fields: transformedValueAttributes
        //       })
        //     : []
        // context.regionArguments = transformedRegionArguments

        return region
      },
      allRegions: async (obj, args, context, info) => {
        const regionSelections = info.fieldNodes[0].selectionSet.selections.find(
          f => f.name.value === 'regions'
        )

        const regionArguments = regionSelections.arguments.reduce(
          (acc, curr) => {
            acc[curr.name.value] = curr.value.value
            return acc
          },
          {}
        )

        const valueAttributes = regionSelections
          ? getFieldsFromInfo(regionSelections)
          : []

        const transformedValueAttributes = transformValueAttributes(
          valueAttributes
        )
        const transformedRegionArguments = transformRegionArguments(
          regionArguments
        )
        const transformedPaginationArguments = transformPaginationArguments(
          args
        )

        // regions
        const regions = await app.service('regions').find({
          query: Object.assign(
            {},
            transformedRegionArguments,
            transformedPaginationArguments
          )
        })

        const region_id = regions.data.map(r => r.id)

        // statistics
        context.data =
          valueAttributes.length > 0
            ? await app.service('genesapiQuery').find({
                index: elasticSearchIndex,
                args: { ...transformedRegionArguments, region_id },
                fields: transformedValueAttributes
              })
            : []

        context.regionArguments = transformedRegionArguments

        return {
          page: regions.skip,
          itemsPerPage: regions.limit,
          total: regions.total,
          regions: regions.data
        }
      }
    },
    Region: attributeResolvers,
    JSON: GraphQLJSON
  }
}
