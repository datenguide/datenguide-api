import _ from 'lodash'
import sift from 'sift'

import { GESAMT_VALUE } from '../schema/genesapiTree'

const mergeArgs = argumentLists => {
  const mergedArgs = {}
  argumentLists.forEach(args => {
    Object.keys(args).forEach(key => {
      if (!mergedArgs[key]) {
        mergedArgs[key] = []
      }
      args[key].forEach(value => {
        if (!mergedArgs[key].includes(value)) {
          mergedArgs[key].push(value)
        }
      })
    })
  })
  return mergedArgs
}

const resolveSiftFilter = (attribute, args, measures) => {
  const siftifiedArgs = _.mapValues(args, value =>
    _.mapKeys(value, (__, key) => `$${key}`)
  )

  return Object.keys(siftifiedArgs).reduce((acc, curr) => {
    acc[curr] = measures[attribute].dimensions[curr].values
      .map(v => v.key)
      .concat(GESAMT_VALUE)
      .filter(sift(siftifiedArgs[curr]))
    return acc
  }, {})
}

const transformFilterArgument = (params, measures) => {
  const { obj, attribute, args } = params
  if (args && args.filter) {
    const filterArgs = args.filter
    delete args.filter
    return {
      obj,
      attribute,
      args: mergeArgs([args, resolveSiftFilter(attribute, filterArgs, measures)])
    }
  }
  return params
}

export default transformFilterArgument
