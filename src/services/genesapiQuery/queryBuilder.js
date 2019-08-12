import _ from 'lodash'

import genesApiSchema from '../graphql/schema/schema.json'
import { GESAMT_VALUE } from '../graphql/schema'

const mapAll = (obj, fn) =>
  Object.keys(obj).reduce((acc, key) => {
    acc.push(fn(obj[key], key))
    return acc
  }, [])

const regionArgumentToQuery = (value, key) => {
  return {
    region_id: val => {
      return _.isArray(val)
        ? { terms: { region_id: val } }
        : { term: { region_id: val } }
    },
    nuts: val => ({
      term: {
        nuts: val
      }
    }),
    // eslint-disable-next-line no-unused-vars
    lau: val => ({
      terms: {
        // TODO properly implement lau level 1
        lau: [1, 2]
      }
    }),
    parent: val => ({
      prefix: {
        region_id: val
      }
    })
  }[key](value)
}

const valueAttributeArgumentToQuery = (values, fieldName) => {
  const gesamtValueToQuery = () => ({
    bool: {
      must_not: {
        exists: {
          field: fieldName
        }
      }
    }
  })

  const valuesToQuery = v =>
    _.isArray(v)
      ? {
          terms: { [fieldName]: v }
        }
      : {
          term: { [fieldName]: v }
        }

  if (values.length === 1) {
    if (values[0] === GESAMT_VALUE) {
      return gesamtValueToQuery()
    }
    return valuesToQuery(values[0])
  }

  const gesamtValue = values.find(a => a === GESAMT_VALUE)
  const enumValues = values.filter(a => a !== GESAMT_VALUE)

  if (gesamtValue) {
    return {
      bool: {
        should: [gesamtValueToQuery(), valuesToQuery(enumValues)]
      }
    }
  }

  return valuesToQuery(enumValues)
}

const statisticsArgumentToQuery = values => ({
  bool: {
    should: values.map(v => ({
      prefix: {
        cube: v.substr(1)
      }
    }))
  }
})

const fieldArgumentToQuery = (values, fieldName) => {
  if (fieldName === 'statistics') {
    return statisticsArgumentToQuery(values)
  }
  return valueAttributeArgumentToQuery(values, fieldName)
}

const nonPresentFieldArgumentToQuery = arg => ({
  exists: {
    field: arg
  }
})

const nonPresentArguments = field => {
  const presentArgs = Object.keys(field.args)
  const allFieldArgs = Object.keys(genesApiSchema[field.name].args)
  return allFieldArgs.filter(arg => !presentArgs.includes(arg))
}

const fieldToQuery = field => ({
  bool: {
    must: [
      ...mapAll(field.args, fieldArgumentToQuery),
      { exists: { field: field.name } }
    ],
    must_not: mapAll(nonPresentArguments(field), nonPresentFieldArgumentToQuery)
  }
})

const buildQuery = ({ index, args, fields }) => ({
  index,
  size: 10,
  type: 'doc',
  scroll: '10s',
  body: {
    query: {
      constant_score: {
        filter: {
          bool: {
            ...(Object.keys(args).length > 0
              ? { must: mapAll(args, regionArgumentToQuery) }
              : {}),
            ...(fields.length > 0
              ? { should: mapAll(fields, fieldToQuery) }
              : {})
          }
        }
      }
    }
  }
})

export default buildQuery