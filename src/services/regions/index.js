import names from '../../data/names.json'

const MAX_PAGE_SIZE = 1000
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

const findRegions = (parentId = null, nuts = null, lau = null) => [
  ...regions
    .filter(r => parentId === null || hasParent(r, parentId))
    .filter(r => nuts === null || isNuts(r, nuts))
    .filter(r => lau === null || isLau(r, lau))
    .map(r => ({
      ...r,
      nuts: getNuts(r)
    }))
]

const getRegion = id => {
  const region = regions.find(o => o.id === id.toString())
  return {
    ...region,
    nuts: getNuts(region)
  }
}

const fetchChildren = region => {
  let children
  if (region.nuts === 1) {
    children = findRegions(region.id, 2).map(c => fetchChildren(c))
    if (children.length === 0) {
      children = findRegions(region.id, 3)
    }
  } else if (region.nuts === 2) {
    children = findRegions(region.id, 3)
  }
  return { ...region, children }
}

export default async app => {
  const service = {
    find: async params => {
      Object.keys(params.query).forEach(key => {
        if (
          !['parent', 'nuts', 'lau', '$limit', '$skip', '$children'].includes(
            key
          )
        ) {
          throw new Error(`unknown argument ${key}`)
        }
      })

      const { parent, nuts, lau } = params.query
      const selectedRegions = findRegions(parent, nuts, lau)

      const result =
        params.query.$children === 'true'
          ? selectedRegions.map(r => fetchChildren(r))
          : selectedRegions

      const limit = Math.min(
        params.query.$limit || DEFAULT_PAGE_SIZE,
        MAX_PAGE_SIZE
      )
      const skip = params.query.$skip || 0

      return {
        total: result.length,
        limit,
        skip,
        data: result.slice(skip * limit, skip * limit + limit)
      }
    },
    get: async (id, params) => {
      const result = getRegion(id)
      return params.query.$children === 'true' ? fetchChildren(result) : result
    }
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
