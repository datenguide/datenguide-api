import fetch from 'isomorphic-unfetch'
import queryString from 'query-string'
import _ from 'lodash'

const mapValues = (values = []) =>
  values.length > 0 ? `:${values.join('|')}` : ''

const mapDimension = d => {
  return `${d.name}${mapValues(d.values)}`
}

const mapDimensions = (dimensions = []) =>
  dimensions.length > 0
    ? `(${dimensions.map(d => mapDimension(d)).join(',')})`
    : ''

export default app => {
  const genesapiTabularUrl = app.get('genesapiTabularUrl')

  const tabularResolver = async (obj, args) => {
    const regionsQuery = queryString.stringify(_.omit(args, ['measures']), {
      arrayFormat: 'comma'
    })

    const measuresQuery = args.measures.map(
      m => `${m.id}${mapDimensions(m.dimensions)}`
    )

    const url = `${genesapiTabularUrl}?${[
      regionsQuery,
      `data=${measuresQuery}`,
      'format=json'
    ].join('&')}`

    app.logger.debug('url', url)

    const result = await fetch(url)
    return result.json()
  }

  return {
    Query: {
      table: tabularResolver
    }
  }
}
