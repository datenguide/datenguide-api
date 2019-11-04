import { gql } from 'apollo-server-express'
import genesApiSchema from '../../data/schema.json'
import genesApiMappings from '../../data/mappings.json'

export const GESAMT_VALUE = 'GESAMT'

const mapAll = (obj, fn) =>
  Object.keys(obj)
    .map(key => fn(key, obj[key]))
    .join('\n')

const argumentValueToEnumValue = (id, { name, value }) => `
"${name}"
${value}
`

const argumentToEnum = (id, { name, values }) => `
"${name}"
enum ${id} {
 ${mapAll(values, argumentValueToEnumValue)}
 "Gesamt"
 ${GESAMT_VALUE}
}
`

// TODO map directly from GENESIS catalog instead of extracting from json schema?
const extractAllSchemaArguments = schema =>
  Object.keys(schema)
    .map(key => schema[key].args)
    .reduce((acc, curr) => {
      Object.keys(curr).forEach(key => {
        acc[key] = curr[key]
      })
      return acc
    }, {})

const argumentToField = (id, { name }) => `
"${name}"
${id}: ${id}
`

const argToFilter = arg => `${arg}: JSON`

const argsToFilterType = (id, args) =>
  Object.keys(args).length > 0
    ? `
  "Experimental complex filter"
  input ${id}Filter {
   ${mapAll(args, argToFilter)}
  }
  `
    : ''

const attributeToType = (id, { args }) => `
${argsToFilterType(id, args)}

type ${id} {
  "Interne eindeutige ID"
  id: String
  "Jahr des Stichtages"
  year: Int
  "Wert"
  value: Float
  "Quellenverweis zur GENESIS Regionaldatenbank"
  source: Source
  ${mapAll(args, argumentToField)}
}
`

// eslint-disable-next-line camelcase
const statisticsToEnumValue = (id, {title_de: title, name}) => `
"${title}"
R${name}
`

const attributeToStatisticsEnum = (id) => `
enum ${id}Statistics {
  ${mapAll(genesApiMappings[id], statisticsToEnumValue)}
}
`

const argumentToArgument = arg => `${arg}: [${arg}]`

const attributeToField = (id, { name, description, source, args }) => {
  const filterAttribute =
    Object.keys(args).length > 0
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
  ${mapAll(args, argumentToArgument)},
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

${mapAll(extractAllSchemaArguments(genesApiSchema), argumentToEnum)}
${mapAll(genesApiSchema, attributeToType)}
${mapAll(genesApiSchema, attributeToStatisticsEnum)}

type Region {
  "Regionalschlüssel"
  id: String
  "Name"
  name: String
  "NUTS-Ebene der Region"
  nuts: Int
  "Unter-Regionen (bis NUTS-Ebene 3)"
  children: [SubRegion]
  ${mapAll(genesApiSchema, attributeToField)}
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

export default gql`
  ${schema}
`
