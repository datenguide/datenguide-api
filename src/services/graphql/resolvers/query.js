const mapAll = (obj, fn) =>
  Object.keys(obj).reduce((acc, key) => {
    acc.push(fn(obj[key], key))
    return acc
  }, [])

const argumentToQuery = (value, key) =>
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

const fieldArgumentToQuery = arg => ({
  term: { [arg.name.value]: arg.value.value }
})

const fieldToQuery = field =>
  field.args.length > 0
    ? {
        bool: {
          must: [
            ...mapAll(field.args, fieldArgumentToQuery),
            { exists: { field: field.name } }
          ]
        }
      }
    : { exists: { field: field.name } }

const getQuery = (args, fields) => ({
  index: 'genesapi',
  size: 10000,
  type: 'doc',
  scroll: '10s',
  body: {
    query: {
      constant_score: {
        filter: {
          bool: {
            ...(Object.keys(args).length > 0
              ? { must: mapAll(args, argumentToQuery) }
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

export default getQuery
