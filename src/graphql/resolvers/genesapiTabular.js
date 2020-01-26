import fetch from 'isomorphic-unfetch'
import queryString from 'query-string'

const DEFAULT_ITEMS_PER_PAGE = 20

const paginate = (list, itemsPerPage, page) => {
  if (!list && list.length <= itemsPerPage) {
    return list
  }
  return list.slice(page * itemsPerPage, (page + 1) * itemsPerPage)
}

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
    const { regions, measures, page, itemsPerPage } = args

    const regionsQuery = regions
      .map(r =>
        queryString.stringify(r, {
          arrayFormat: 'comma'
        })
      )
      .join('&')

    const measuresQuery = measures.map(
      m => `${m.id}${mapDimensions(m.dimensions)}`
    )

    const url = `${genesapiTabularUrl}?${[
      regionsQuery,
      `data=${measuresQuery}`,
      'format=json'
    ].join('&')}`

    app.logger.debug('url', url)

    const result = await fetch(url)
    const json = await result.json()

    const total = (json.data && json.data.length) || 0

    const pagination = {
      page: page === undefined ? 0 : page,
      itemsPerPage:
        page !== undefined && itemsPerPage === undefined
          ? DEFAULT_ITEMS_PER_PAGE
          : itemsPerPage,
      total
    }

    json.pagination = pagination

    json.data = paginate(json.data, pagination.itemsPerPage, pagination.page)
    return json
  }

  return {
    Query: {
      table: tabularResolver
    }
  }
}
