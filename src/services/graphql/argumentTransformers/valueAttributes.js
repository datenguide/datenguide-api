import _ from 'lodash'
import GraphQLJSON from 'graphql-type-json'
import sift from 'sift'

import genesApiSchema from '../schema/schema'
import { GESAMT_VALUE } from '../schema'

const transformValueAttributeValue = value => {
  return value.values ? value.values.map(v => v.value) : [value.value]
}

const transformValueAttributeArgument = arg => ({
  name: arg.name.value,
  values: transformValueAttributeValue(arg.value)
})

const transformValueAttributeFilter = (attribute, arg) => {
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
      values: genesApiSchema[attribute.name].args[curr].values
        .map(v => v.value)
        .concat(GESAMT_VALUE)
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

export const transformValueAttribute = attribute => {
  const transformedArgs = attribute.args
    .filter(f => f.name.value !== 'filter')
    .map(transformValueAttributeArgument)

  const transformedFilter = transformValueAttributeFilter(
    attribute,
    attribute.args.find(f => f.name.value === 'filter')
  )

  return {
    name: attribute.name,
    args: mergeArgumentLists([transformedArgs, transformedFilter])
  }
}

const transformValueAttributes = fields => fields.map(transformValueAttribute)

export default transformValueAttributes
