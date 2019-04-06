import _ from 'lodash'
import GraphQLJSON from 'graphql-type-json'
import sift from 'sift'

import genesApiSchema from '../schema/schema'
import { GESAMT_VALUE } from '../schema'

const transformValueAttributeValue = value => {
  return value.values ? value.values.map(v => v.value) : [value.value]
}

const parseValueAttributeArgument = arg => ({
  name: arg.name.value,
  values: transformValueAttributeValue(arg.value)
})

const parseValueAttributeFilter = arg => {
  if (!arg) {
    return []
  }

  return arg.value.fields.reduce((acc, curr) => {
    acc[curr.name.value] = GraphQLJSON.parseLiteral(curr.value)
    return acc
  }, {})
}

const resolveValueAttributeFilter = (attribute, args) => {
  const siftifiedArgs = _.mapValues(args, value =>
    _.mapKeys(value, (__, key) => `$${key}`)
  )

  return Object.keys(siftifiedArgs).reduce((acc, curr) => {
    acc.push({
      name: curr,
      values: genesApiSchema[attribute].args[curr].values
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

const transformValueAttributeArguments = (attribute, args) => {
  const parsedArgs = args
    .filter(f => f.name.value !== 'filter')
    .map(parseValueAttributeArgument)

  const parsedFilter = parseValueAttributeFilter(
    args.find(f => f.name.value === 'filter')
  )

  const transformedFilter = resolveValueAttributeFilter(attribute, parsedFilter)

  return mergeArgumentLists([parsedArgs, transformedFilter])
}

export const transformValueAttributeResolverArguments = (attribute, args) => {
  const parsedArgs = _.pickBy(
    args,
    (value, key) => !['filter'].includes(key)
  )

  const transformedArgs = Object.keys(parsedArgs).map(key => ({
    name: key,
    values: parsedArgs[key].map(v => v.toString())
  }))

  const transformedFilter = args.filter
    ? resolveValueAttributeFilter(attribute, args.filter)
    : []

  return mergeArgumentLists([transformedArgs, transformedFilter])
}

const transformValueAttribute = attribute => {
  return {
    name: attribute.name,
    args: transformValueAttributeArguments(attribute.name, attribute.args)
  }
}

export const transformValueAttributes = attributes => {
  return attributes
    .filter(f => !f.name.startsWith('__'))
    .map(transformValueAttribute)
}
