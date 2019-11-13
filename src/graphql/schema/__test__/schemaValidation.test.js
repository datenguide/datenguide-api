import app from '../../../app'
import fetchMerkmale from '../../../lib/genesisonline'

// TODO actually check if measures have no data instead of hardcoding them here
const emptyMeasures = [
  'AI2101',
  'AI2102',
  'AI2103',
  'AI2104',
  'AI2105',
  'AI2106',
  'AI2107',
  'BIP002',
  'BIP003',
  'BIP004',
  'BIPI02',
  'BIPI03',
  'BIPI04',
  'BWSI05'
]

// increase jest timeout because GENESIS Online is slow..
jest.setTimeout(50000)

describe('schema', () => {
  let schema = null
  beforeAll(async () => {
    schema = await app.service('treeApiSchema').find()
  })

  it('includes all measures, except measures without data', async () => {
    const merkmale = await fetchMerkmale(app)
    const { measures } = schema
    expect(
      Object.values(measures)
        .map(m => m.name)
        .concat(emptyMeasures)
        .sort()
    ).toEqual(merkmale.sort())
  })
})
