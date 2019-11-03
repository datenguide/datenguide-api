import _ from 'lodash'

import names from '../../data/names.json'

export const MAX_PAGE_SIZE = 1000
export const DEFAULT_PAGE_SIZE = 10

const regions = Object.keys(names).map(key => ({ id: key, name: names[key] }))

const getNuts = region => ({ 2: 1, 3: 2, 5: 3 }[region.id.length])

const isNuts = (region, nuts) =>
  nuts >= 1 &&
  nuts <= 3 &&
  region.id.length === { 1: 2, 2: 3, 3: 5 }[nuts] &&
  region.id !== 'DG'

const isLau = (region, lau) =>
  lau >= 1 && lau <= 2 && region.id.length >= 8 && region.id !== 'DG'

const hasParent = (region, parentId) =>
  region.id !== parentId && region.id.startsWith(parentId)

const selectRegions = (parent, nuts) => [
  ...regions
    .filter(r => hasParent(r, parent.id) && isNuts(r, nuts))
    .map(r => {
      const result = r
      result.nuts = getNuts(r)
      return result
    })
]

const argumentToFilter = {
  nuts: value => region => isNuts(region, value),
  lau: value => region => isLau(region, value),
  parent: value => region => hasParent(region, value)
}

const fetchChildren = region => {
  const result = { ...region, nuts: getNuts(region) }
  if (result.nuts === 1) {
    let children = selectRegions(result, 2).map(c => fetchChildren(c))
    if (children.length === 0) {
      children = selectRegions(result, 3)
    }
    result.children = children
  } else if (result.nuts === 2) {
    result.children = selectRegions(result, 3)
  }
  return result
}

export default async app => {
  const service = {
    find: async params => {
      const filters = Object.keys(params.query)
        .filter(key => !key.startsWith('$'))
        .map(key => r => {
          const filter = argumentToFilter[key]
          if (!filter) {
            throw new Error(`unknown argument ${key}`)
          }
          return r.filter(argumentToFilter[key](params.query[key]))
        })
      const selectedRegions = _.flow(...filters)(regions)

      const limit = Math.min(
        params.query.$limit || DEFAULT_PAGE_SIZE,
        MAX_PAGE_SIZE
      )
      const skip = params.query.$skip || 0
      const result =
        params.query.$children === 'true'
          ? selectedRegions.map(r => fetchChildren(r))
          : selectedRegions

      return {
        total: result.length,
        limit,
        skip,
        data: result.slice(skip * limit, skip * limit + limit)
      }
    },
    get: async id => regions.find(o => o.id === id.toString())
  }

  app.use('/regions', service)
  app
    .service('regions')
    .hooks({
      before: {
        all: [],
        find: []
      },
      after: {
        all: [],
        find: []
      },
      error: {
        all: [],
        find: []
      }
    })
    .hooks({
      after: {
        all: []
      }
    })
}
