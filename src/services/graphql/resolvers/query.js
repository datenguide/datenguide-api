import genesApiSchema from '../schema/schema.json'

const mapAll = (obj, fn) =>
  Object.keys(obj).reduce((acc, key) => {
    acc.push(fn(obj[key], key))
    return acc
  }, [])

const regionArgumentToQuery = (value, key) =>
  ({
    id: val => ({ terms: { region_id: [val] } }),
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

const fieldArgumentToQuery = arg =>
  arg.value.value
    ? {
        term: { [arg.name.value]: arg.value.value }
      }
    : { terms: { [arg.name.value]: arg.value.values.map(a => a.value) } }

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

const fieldToQuery = field => {
  return {
    bool: {
      must: [
        ...mapAll(field.args, fieldArgumentToQuery),
        { exists: { field: field.name } }
      ],
      must_not: mapAll(
        nonPresentArguments(field),
        nonPresentFieldArgumentToQuery
      )
    }
  }
}

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
