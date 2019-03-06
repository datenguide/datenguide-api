/* eslint-disable */
import _ from 'lodash'
import genesApiSchema from '../schema/schema.json'

export default app => {
  const attributeResolver = attributeId => {
    return (obj, args) => {
      return _.filter(obj[attributeId], args).map(o =>
        _.merge(o, {
          value: o[attributeId].value,
          id: o._id,
          source: genesApiSchema[attributeId].source
        })
      )
    }
  }

  const attributeResolvers = Object.assign(
    {},
    ...Object.keys(genesApiSchema).map(key => ({
      [key]: attributeResolver(key)
    }))
  )

  const fetchData = async (args, fields) => {
    const argumentToQuery = {
      id: value => ({ region_id: value }),
      nuts: value => ({
        nuts: value
      }),
      parent: value => ({
        parent: {
          $prefix: value
        }
      })
    }

    const argumentsToQuery = args =>
      Object.keys(args).reduce((acc, key) => {
        return Object.assign({}, acc, argumentToQuery[key](args[key]))
      }, {})

    return app.service('genesapi').find({
      query: {
        ...argumentsToQuery(args),
        $exists: fields
      }
    })
  }

  const getFieldsFromInfo = info => {
    return info.fieldNodes[0].selectionSet.selections
      .map(s => s.name.value)
      .filter(f => !['id', 'name'].includes(f))
  }

  const resolvableAttributes = (result, fields) =>
    fields.map(f => ({
      [f]: result
    }))

  return {
    Query: {
      region: async (obj, args, context, info) => {
        const fields = getFieldsFromInfo(info)

        const data = await fetchData(args, fields)
        const region = await app.service('regions').get(args.id)

        return _.merge(region, ...resolvableAttributes(data, fields))
      },
      regions: async (obj, args, context, info) => {
        const fields = getFieldsFromInfo(info)

        const data = await fetchData(args, fields)
        const regions = await app.service('regions').find({ query: args })

        return regions.map(region =>
          _.merge(region, ...resolvableAttributes(data, fields))
        )
      }
    },
    Region: attributeResolvers
  }
}
