import app from '../../../app'
import transformFilterArgument from '../filter'

describe('transformFilterArgument', () => {
  let schema = null
  beforeAll(async () => {
    schema = await app.service('treeApiSchema').find()
  })

  it('leaves regular arguments unchanged', () => {
    const input = {
      obj: {},
      attribute: 'WAHL09',
      args: { PART04: 'SPD' }
    }
    console.log('schema', schema.measures);
    const result = transformFilterArgument(input, schema.measures)
    expect(result).toEqual(input)
  })

  it('resolves a sift filter', () => {
    const input = {
      obj: {},
      attribute: 'WAHL09',
      args: { filter: { PART04: { nin: ['AFD'] } } }
    }
    console.log('schema', schema.measures);
    const result = transformFilterArgument(input, schema.measures)
    expect(result).toEqual({
      obj: {},
      attribute: 'WAHL09',
      args: {
        PART04: [
          'B90_GRUENE',
          'CDU',
          'DIELINKE',
          'FDP',
          'SONSTIGE',
          'SPD',
          'GESAMT'
        ]
      }
    })
  })

  it('resolves a sift filter and merges with existing args', () => {
    const input = {
      obj: {},
      attribute: 'WAHL09',
      args: {
        PART04: ['SPD'],
        filter: { PART04: { nin: ['AFD', 'CDU', 'SPD'] } }
      }
    }
    const result = transformFilterArgument(input, schema.measures)
    expect(result).toEqual({
      obj: {},
      attribute: 'WAHL09',
      args: {
        PART04: ['SPD', 'B90_GRUENE', 'DIELINKE', 'FDP', 'SONSTIGE', 'GESAMT']
      }
    })
  })
})
