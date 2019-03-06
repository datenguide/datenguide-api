const argumentToQuery = {
  id: value => ({ terms: { region_id: [value] } }),
  nuts: value => ({
    terms: {
      nuts: [value]
    }
  }),
  parent: value => ({
    prefix: {
      region_id: value
    }
  })
}

const argumentsToQuery = args =>
  Object.keys(args).reduce((acc, key) => {
    acc.push(argumentToQuery[key](args[key]))
    return acc
  }, [])

const fieldArgumentToQuery = arg => ({
  term: { [arg.name.value]: arg.value.value }
})

const fieldArgumentsToQuery = args =>
  Object.keys(args).reduce((acc, key) => {
    acc.push(fieldArgumentToQuery(args[key]))
    return acc
  }, [])

const fieldToQuery = field =>
  field.args.length > 0
    ? {
        bool: {
          must: [
            ...fieldArgumentsToQuery(field.args),
            { exists: { field: field.name } }
          ]
        }
      }
    : { exists: { field: field.name } }

const fieldsToQuery = fields =>
  Object.keys(fields).reduce((acc, key) => {
    acc.push(fieldToQuery(fields[key]))
    return acc
  }, [])

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
            ...(Object.keys(args).length !== 0 ? { must: argumentsToQuery(args) } : {}),
            ...(fields.length > 0 ? { should: fieldsToQuery(fields) } : {})
          }
        }
      }
    }
  }
})

export default getQuery
