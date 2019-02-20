import { gql } from 'apollo-server-express'
import genesApiSchema from './schema.json'

const mapAll = (obj, fn) =>
  Object.keys(obj)
    .map(key => fn(key, obj[key]))
    .join('\n')

const argumentToField = (id, { name }) => `
# ${name}
${id}: String
`

const attributeToType = (id, { args }) => `
type ${id} {
  "Interne eindeutige ID"
  id: String
  "Jahr des Stichtages"
  year: String
  "Stichtag"
  date: String
  "Quellenverweis zur GENESIS Regionaldatenbank"
  source: Source
  ${mapAll(args, argumentToField)}
}
`

const argumentToArgument = arg => `${arg}: String`

const attributeToField = (id, { name, description, source, args }) => `
"""
**${name}**
*aus GENESIS-Statistik "${source.title_de}" ${source.name})*
${description || ''}                                         
"""
${id}(${mapAll(
  Object.assign({}, args, { year: {} }),
  argumentToArgument
)}): ${id}
`

const schema = `
type Source {
  title_de: String
  valid_from: String
  periodicity: String
  name: String
  url: String
}

${mapAll(genesApiSchema, attributeToType)}

type Region {
  "Regionalschlüssel"
  id: String
  "Name"
  name: String
  ${mapAll(genesApiSchema, attributeToField)}
}

"Graphql-API zum Datenbestand der GENESIS-Datenbank \\"Regionalstatistik\\""
type Query {
  "Detail-Endpunkt zur Abfrage exakt einer Region"
  region(
    "Regionalschlüssel"
    id: String!
  ): Region
  "Listen-Endpunkt zur Abfrage mehrerer Regionen"
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
  ): [Region!]
}
`
export default gql`
  ${schema}
`
