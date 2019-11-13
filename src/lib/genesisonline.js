import Cache from 'file-system-cache'
import fs from 'fs'
import rimraf from 'rimraf'
import { rechercheService2010 } from 'genesis-online-js'

const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']

const MERKMALE = 'MERKMALE'

const cache = Cache()

const deleteCacheIfExpired = app => {
  const { mtimeMs } = fs.statSync('.cache')
  const ageInHours = (new Date().getTime() - mtimeMs) / 1000 / 60 / 60
  if (ageInHours > 24) {
    app.logger.info('cache has expired, deleting')
    rimraf.sync('.cache')
  }
}

const fetchMerkmale = async app => {
  deleteCacheIfExpired(app)

  const cachedMerkmale = await cache.get(MERKMALE)
  if (cachedMerkmale) {
    return cachedMerkmale
  }

  let merkmale = []
  for (let i = 0; i < ALPHABET.length; i += 1) {
    app.logger.info(`downloading merkmale starting with letter ${ALPHABET[i]}`)
    // fun fact: GENESIS Online does not allow single user parallel requests
    // eslint-disable-next-line no-await-in-loop
    const result = await rechercheService2010.merkmalsKatalog({
      filter: `${ALPHABET[i]}*`,
      bereich: 'Alle',
      listenLaenge: '500',
      sprache: 'de',
      typ: 'wert',
      kriterium: 'Code',
      ...app.get('genesisLogin')
    })

    if (
      result.merkmalsKatalogEintraege &&
      result.merkmalsKatalogEintraege.merkmalsKatalogEintraege
    ) {
      const entries = result.merkmalsKatalogEintraege.merkmalsKatalogEintraege
      const current = Array.isArray(entries) ? entries : [entries]
      merkmale = merkmale.concat(current.map(m => m.code))
    }
  }

  cache.setSync(MERKMALE, merkmale)
  return merkmale
}

export default fetchMerkmale
