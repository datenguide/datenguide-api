import genesApiSchema from '../schema/schema.json'
import { GESAMT_VALUE} from '../schema'

const mapAll = (obj, fn) =>
  Object.keys(obj).reduce((acc, key) => {
    acc.push(fn(obj[key], key))
    return acc
  }, [])

const regionArgumentToQuery = (value, key) =>
  ({
    id: val => ({ term: { region_id: val } }),
    ids: val => ({ terms: { region_id: val } }),
    nuts: val => ({
      terms: {
        nuts: [val]
      }
    }),
    parent: val => ({
      prefix: {
        region_id: val
      }
    })
  }[key](value))

const fieldArgumentToQuery = arg => {
  const argumentName = arg.name.value
  const argumentValues = arg.value.value ? [arg.value] : arg.value.values

  const gesamtValueToQuery = () => ({
    bool: {
      must_not: {
        exists: {
          field: argumentName
        }
      }
    }
  })

  const singleEnumValueToQuery = a => ({
    term: { [argumentName]: a.value }
  })

  const enumValuesToQuery = a => ({
    terms: { [argumentName]: a.map(v => v.value) }
  })

  if (argumentValues.length === 1) {
    if (arg.value.value === GESAMT_VALUE) {
      return gesamtValueToQuery()
    }
    return singleEnumValueToQuery(argumentValues[0])
  }

  const gesamtValue = argumentValues.find(a => a.value === GESAMT_VALUE)
  const enumValues = argumentValues.filter(a => a.value !== GESAMT_VALUE)

  if (gesamtValue) {
    return {
      bool: {
        should: [gesamtValueToQuery(), enumValuesToQuery(enumValues)]
      }
    }
  }

  return enumValuesToQuery(enumValues)
}

const nonPresentFieldArgumentToQuery = arg => ({
  exists: {
    field: arg
  }
})

const nonPresentArguments = field => {
  const fieldArgs = field.args.map(arg => arg.name.value)
  return Object.keys(genesApiSchema[field.name].args).filter(
    arg => !fieldArgs.includes(arg)
  )
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

const getQuery = (args, fields) => {
  return {
    index: 'genesapi',
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
  }
}

export default getQuery
