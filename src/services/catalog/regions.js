import fetch from 'node-fetch'
import { GeneralError } from '@feathersjs/errors'

export const MAX_PAGE_SIZE = 1000
export const DEFAULT_PAGE_SIZE = 10

const RAW_REGIONS = 'RAW_REGIONS'

const getNuts = id => ({ 2: 1, 3: 2, 5: 3 }[id.length])

const isNuts = (id, nuts) =>
  nuts >= 1 &&
  nuts <= 3 &&
  id.length === { 1: 2, 2: 3, 3: 5 }[nuts] &&
  id !== 'DG'

const isLau = (id, lau) => lau >= 1 && lau <= 2 && id.length >= 8 && id !== 'DG'

const hasParent = (id, parentId) => id !== parentId && id.startsWith(parentId)

const rawRegionsToObjects = (regions, ids = []) =>
  Object.keys(regions)
    .filter(id => ids.includes(id))
    .map(id => ({ id, name: regions[id], nuts: getNuts(id) }))

export default async app => {
  const getRaw = async () => {
    const cached = app.cache.get(RAW_REGIONS)
    if (cached) {
      return cached
    }
    const storageInformationUrl = app.get('storageInformationUrl')
    try {
      app.logger.info(
        `fetching storage information from URL ${storageInformationUrl}...`
      )
      const info = await fetch(storageInformationUrl)
      const infoJson = await info.json()
      app.logger.info('download complete: storage information')
      app.logger.info('checking that regionalstatistik is available')
      if (infoJson.storages.regionalstatistik) {
        app.logger.info('ok')
      } else {
        app.logger.error('no info for regionalstatistik found')
      }
      const regionsUrl = infoJson.storages.regionalstatistik.regionNames
      app.logger.info(`fetching regions from URL ${regionsUrl}..`)
      const schema = await fetch(regionsUrl)
      const result = await schema.json()
      app.logger.info('download complete: regions')
      app.cache.set(RAW_REGIONS, result)
      return result
    } catch (e) {
      throw new GeneralError(`regions initialization failed: ${e}`)
    }
  }

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


      const regions = await getRaw()
      const { parent, nuts, lau } = params.query
      const ids = Object.keys(regions)
        .filter(id => parent === undefined || hasParent(id, parent))
        .filter(id => nuts === undefined || isNuts(id, nuts))
        .filter(id => lau === undefined || isLau(id, lau))


      const limit = Math.min(
        params.query.$limit || DEFAULT_PAGE_SIZE,
        MAX_PAGE_SIZE
      )
      const skip = params.query.$skip || 0

      return {
        total: ids.length,
        limit,
        skip,
        data: rawRegionsToObjects(regions,  ids.slice(skip * limit, skip * limit + limit))
      }
    },
    get: async id => {
      const regions = await getRaw()
      const result = rawRegionsToObjects(regions, [id])
      return result.length === 1 ? result[0] : null
    },
    setup: async feathersApp => {
      await getRaw(feathersApp)
    }
  }

  app.use('/catalog/regions', service)
  app
    .service('catalog/regions')
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
