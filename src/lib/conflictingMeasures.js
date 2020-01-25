import _ from 'lodash'

const getConflictingMeasures = async app => {
  const schema = await app.service('/catalog/schema').find()

  const collectedMeasures = {}

  Object.keys(schema).forEach(statistic => {
    const measures = Object.keys(schema[statistic].measures)
    measures.forEach(m => {
      if (!collectedMeasures[m]) {
        collectedMeasures[m] = []
      }
      collectedMeasures[m].push({
        statistic,
        measure: m,
        dimensions: Object.keys(schema[statistic].measures[m].dimensions)
      })
    })
  })

  const reusedMeasures = Object.values(collectedMeasures).filter(
    v => v.length > 1
  )

  const conflictingMeasures = reusedMeasures.filter(
    measureList =>
      !measureList.every(m =>
        _.isEqual(m.dimensions.sort(), measureList[0].dimensions.sort())
      )
  )

  return conflictingMeasures.reduce((acc, curr) => {
    const { measure } = curr[0]
    acc[measure] = []
    curr.forEach(m => [
      m.dimensions.forEach(dim => {
        if (!acc[measure].includes(dim)) {
          acc[measure].push(dim)
        }
      })
    ])
    return acc
  }, {})
}

export default getConflictingMeasures
