import { createClient } from 'soap'

import app from '../../../app'

const url =
  'https://www.regionalstatistik.de/genesisws/services/RechercheService_2010?wsdl'

// increase jest timeout because GENESIS is slooow..
jest.setTimeout(30000)

const defaultArgs = {
  filter: '*',
  bereich: 'Alle',
  listenLaenge: 500,
  sprache: 'de'
}

const getMerkmalsKatalog = args =>
  new Promise((resolve, reject) => {
    createClient(url, (clientErr, client) => {
      if (clientErr) {
        return reject(clientErr)
      }
      return client.MerkmalsKatalog(args, (callErr, result) => {
        if (callErr) {
          return reject(callErr)
        }
        // console.log('result', result)
        // console.log('body', body)
        return resolve(result)
      })
    })
  })

describe('schema', () => {
  let schema = null
  beforeAll(async () => {
    schema = await app.service('treeApiSchema').find()
  })

  it('includes all measures', async () => {
    const result = await getMerkmalsKatalog({ ...defaultArgs, typ: 'Wert' })
    const merkmale =
      result.MerkmalsKatalogReturn.merkmalsKatalogEintraege
        .merkmalsKatalogEintraege

    const { measures } = schema
    expect(
      Object.values(measures)
        .map(m => m.name)
        .sort()
    ).toEqual(merkmale.map(m => m.code).sort())
  })
})
