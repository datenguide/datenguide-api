/* eslint-disable camelcase */
import { gql } from 'apollo-server-express'

export const GESAMT_VALUE = 'GESAMT'

const mapAll = (obj, fn) =>
  Object.keys(obj)
    .map(key => fn(key, obj[key]))
    .join('\n')

const argumentValueToEnumValue = (id, { title_de, name }) => {
  return `
  "${title_de}"
  ${name.replace(/-/g, '_')}
  `
}

const dimensionToEnum = (id, { title_de, values }) => {
  return `
  "${title_de}"
  enum ${id} {
   ${mapAll(values, argumentValueToEnumValue)}
   "Gesamt"
   ${GESAMT_VALUE}
  }
  `
}

export default (measures, mappings) => {
  const extractAllSchemaDimensions = schema =>
    Object.keys(schema)
      .map(key => schema[key].dimensions)
      .reduce((acc, curr) => {
        Object.keys(curr).forEach(key => {
          acc[key] = curr[key]
        })
        return acc
      }, {})

  const dimensionToField = (id, { title_de }) => {
    return `
  "${title_de}"
  ${id}: ${id}
  `
  }

  const dimensionToFilter = arg => `${arg}: JSON`

  const dimensionsToFilterType = (id, dimensions) =>
    Object.keys(dimensions).length > 0
      ? `
  "Experimental complex filter"
  input ${id}Filter {
   ${mapAll(dimensions, dimensionToFilter)}
  }
  `
      : ''

  const measureToType = (id, { dimensions }) => `
${dimensionsToFilterType(id, dimensions)}

type ${id} {
  "Interne eindeutige ID"
  id: String
  "Jahr des Stichtages"
  year: Int
  "Wert"
  value: Float
  "Quellenverweis zur GENESIS Regionaldatenbank"
  source: Source
  ${mapAll(dimensions, dimensionToField)}
}
`

  const statisticToEnumValue = (id, { title_de: title, name }) => `
"${title}"
R${name}
`

  const measureToSourceStatisticsEnum = id => `
enum ${id}Statistics {
  ${mapAll(mappings[id], statisticToEnumValue)}
}
`

  const dimensionToArgument = dimension => {
    return `${dimension}: [${dimension}]`
  }

  const measureToField = (id, { name, description, source, dimensions }) => {
    const filterAttribute =
      Object.keys(dimensions).length > 0
        ? `
  "Experimental complex filter"
   filter: ${id}Filter
  `
        : ''
    return `
  """
  **${name}**
  *aus GENESIS-Statistik "${source.title_de}" ${source.name})*
  ${description || ''}
  """
  ${id}(
  "Jahr des Stichtages"
  year: [Int],
  "Statistik"
  statistics: [${id}Statistics],
  ${mapAll(dimensions, dimensionToArgument)},
  ${filterAttribute}
  ): [${id}]
  `
  }

  const schema = `
scalar JSON

type Source {
  title_de: String
  valid_from: String
  periodicity: String
  name: String
  url: String
}

${mapAll(extractAllSchemaDimensions(measures), dimensionToEnum)}
${mapAll(measures, measureToType)}
${mapAll(measures, measureToSourceStatisticsEnum)}

type Region {
  "Regionalschlüssel"
  id: String
  "Name"
  name: String
  "NUTS-Ebene der Region"
  nuts: Int
  "Unter-Regionen (bis NUTS-Ebene 3)"
  children: [SubRegion]
  ${mapAll(measures, measureToField)}
}

type SubRegion {
  "Regionalschlüssel"
  id: String
  "Name"
  name: String
  "NUTS-Ebene der Region"
  nuts: Int
  "Unter-Regionen (bis NUTS-Ebene 3)"
  children: [SubRegion]
}


type RegionsResult {
  regions(
    """
    **Filter Regionen nach NUTS-Ebene.**
    *Optionen:*
    1 – Bundesländer
    2 – Regierungsbezirke / statistische Regionen
    3 – Kreise / kreisfreie Städte
    """
    nuts: Int
    """
    **Filter Regionen nach LAU-Ebene.**
    *Optionen:*
    1 - Verwaltungsgemeinschaften
    2 - Gemeinden
    """
    lau: Int
    """
    **Filter Regionen nach ID**
    (Regionalschlüssel) der Elternregion
    """
    parent: String
  ): [Region]
  page: Int
  itemsPerPage: Int
  total: Int
}

"Graphql-API zum Datenbestand der GENESIS-Datenbank \\"Regionalstatistik\\""
type Query {
  "Detail-Endpunkt zur Abfrage exakt einer Region"
  region(
    "Regionalschlüssel"
    id: String!
  ): Region
  "Listen-Endpunkt zur Abfrage mehrerer Regionen"
  allRegions(
    page: Int
    itemsPerPage: Int
  ): RegionsResult
}
`

  return gql`
    ${schema}
  `
}
