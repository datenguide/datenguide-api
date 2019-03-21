import _ from 'lodash'
import GraphQLJSON from 'graphql-type-json'
import sift from 'sift'

import genesApiSchema from '../graphql/schema/schema'

const transformRegionArguments = args =>
  _.mapKeys(args, (value, key) => (key === 'id' ? 'region_id' : key))

const transformFieldArgumentValue = value => {
  return value.values ? value.values.map(v => v.value) : [value.value]
}

const transformFieldArgument = arg => ({
  name: arg.name.value,
  values: transformFieldArgumentValue(arg.value)
})

const transformFilter = (field, arg) => {
  if (!arg) {
    return []
  }

  const parsedArgs = arg.value.fields.reduce((acc, curr) => {
    acc[curr.name.value] = GraphQLJSON.parseLiteral(curr.value)
    return acc
  }, {})

  const siftifiedArgs = _.mapValues(parsedArgs, value =>
    _.mapKeys(value, (__, key) => `$${key}`)
  )

  return Object.keys(siftifiedArgs).reduce((acc, curr) => {
    acc.push({
      name: curr,
      values: genesApiSchema[field.name].args[curr].values
        .map(v => v.value)
        .filter(sift(siftifiedArgs[curr]))
    })
    return acc
  }, [])
}

const mergeArgumentLists = argumentLists => {
  const mergedArgs = {}
  argumentLists.forEach(args => {
    args.forEach(arg => {
      if (!mergedArgs[arg.name]) {
        mergedArgs[arg.name] = []
      }
      arg.values.forEach(value => {
        if (!mergedArgs[arg.name].includes(value)) {
          mergedArgs[arg.name].push(value)
        }
      })
    })
  })
  return mergedArgs
}

export const transformField = field => {
  const transformedArgs = field.args
    .filter(f => f.name.value !== 'filter')
    .map(transformFieldArgument)

  const transformedFilter = transformFilter(
    field,
    field.args.find(f => f.name.value === 'filter')
  )

  return {
    name: field.name,
    args: mergeArgumentLists([transformedArgs, transformedFilter])
  }
}

const transformArguments = ({ args, fields }) => ({
  args: transformRegionArguments(args),
  fields: fields.map(transformField)
})

export default transformArguments
