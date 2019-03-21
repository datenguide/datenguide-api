import { gql } from 'apollo-server-express'
import genesApiSchema from './schema.json'

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

const argsToFilterType = (id, args) =>  Object.keys(args).length > 0 ? `
  "Experimental complex filter"
  input ${id}Filter {
   ${mapAll(args, argToFilter)}
  }
  ` : ''

const attributeToType = (id, { args }) => `
${argsToFilterType(id, args)}

type ${id} {
  "Interne eindeutige ID"
  id: String
  "Jahr des Stichtages"
  year: Int
  "Wert"
  value: String
  "Quellenverweis zur GENESIS Regionaldatenbank"
  source: Source
  ${mapAll(args, argumentToField)}
}
`


const argumentToArgument = arg => `${arg}: [${arg}]`

const attributeToField = (id, { name, description, source, args }) => {
  const filterAttribute = Object.keys(args).length > 0 ? `
  "Experimental complex filter"
   filter: ${id}Filter
  ` : ''
  return `
  """
  **${name}**
  *aus GENESIS-Statistik "${source.title_de}" ${source.name})*
  ${description || ''}
  """
  ${id}(
  "Jahr des Stichtages"
  year: [Int],
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

type Region {
  "Regionalschlüssel"
  id: String
  "Name"
  name: String
  ${mapAll(genesApiSchema, attributeToField)}
}

type RegionsResult {
  regions(
    """
    **Filter Regionen nach NUTS-Ebene.**
    *Optionen:*
    1 – Bundesländer
    2 – Regierungsbezirke / statistische Regionen
    3 – Kreise / kreisfreie Städte
    4 – Gemeinden (LAU 1 / LAU 2)
    """
    nuts: Int
    "Filter Regionen nach ID (Regionalschlüssel) der Elternregion"
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
