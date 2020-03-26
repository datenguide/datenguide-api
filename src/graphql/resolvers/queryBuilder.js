import _ from 'lodash'
import { GESAMT_VALUE } from '../schema/genesapiTree'
import transformFilterArgument from '../argumentTransformers/filter'

const regionQuery = val => {
  return _.isArray(val)
    ? { terms: { region_id: val } }
    : { term: { region_id: val } }
}

const statisticsArgQuery = values => ({
  bool: {
    should: values.map(a => ({
      prefix: {
        cube: a.substr(1)
      }
    }))
  }
})

const valueArgsQuery = (arg, values) => {
  if (values.length === 1) {
    return [
      {
        term: {
          [arg]: values[0]
        }
      }
    ]
  }
  if (values.length > 1) {
    return [
      {
        terms: {
          [arg]: values
        }
      }
    ]
  }
  return []
}

const gesamtValueArgQuery = (arg, values) =>
  values.length > 0
    ? [
        {
          bool: {
            must_not: {
              exists: {
                field: arg
              }
            }
          }
        }
      ]
    : []

const attributeQuery = (attribute, args) => [
  {
    exists: {
      field: attribute
    }
  },
  ...Object.keys(args).map(arg => {
    if (arg === 'statistics') {
      return statisticsArgQuery(args[arg])
    }
    return {
      bool: {
        should: [
          ...valueArgsQuery(
            arg,
            args[arg].filter(v => v !== GESAMT_VALUE)
          ),
          ...gesamtValueArgQuery(
            arg,
            args[arg].filter(v => v === GESAMT_VALUE)
          )
        ]
      }
    }
  })
]

const nonPresentDimensionsQuery = (measures, measure, dimensions) => {
  const presentDimensions = Object.keys(dimensions)
  const allMeasureDimensions = Object.keys(measures[measure].dimensions)
  const nonPresentDimensions = allMeasureDimensions.filter(
    dimension => !presentDimensions.includes(dimension)
  )
  return nonPresentDimensions.map(dimension => ({
    exists: {
      field: dimension
    }
  }))
}

const buildQuery = (index, params, measures) => {
  const { obj, attribute, args } = transformFilterArgument(params, measures)

  return {
    index,
    size: 10,
    scroll: '10s',
    body: {
      query: {
        constant_score: {
          filter: {
            bool: {
              must: [regionQuery(obj.id), ...attributeQuery(attribute, args)],
              must_not: nonPresentDimensionsQuery(measures, attribute, args)
            }
          }
        }
      }
    }
  }
}

export default buildQuery
