import { rechercheService2010 } from 'genesis-online-js'

import app from '../../../app'

// increase jest timeout because GENESIS is slooow..
jest.setTimeout(30000)

const defaultArgs = {
  filter: '*',
  bereich: 'Alle',
  listenLaenge: 500,
  sprache: 'de'
}

describe('schema', () => {
  let schema = null
  beforeAll(async () => {
    schema = await app.service('treeApiSchema').find()
  })

  it('includes all measures', async () => {
    const result = await rechercheService2010.merkmalsKatalog({
      ...defaultArgs,
      typ: 'Wert'
    })
    const merkmale = result.merkmalsKatalogEintraege.merkmalsKatalogEintraege

    const { measures } = schema
    expect(
      Object.values(measures)
        .map(m => m.name)
        .sort()
    ).toEqual(merkmale.map(m => m.code).sort())
  })
})
