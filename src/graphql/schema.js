import { gql } from 'apollo-server-express'
import genesapiSchema from './schema.json'

const fieldDescription = ({ name, description, source }) => `
# **${name}**
# 
# *aus GENESIS-Statistik "${source.title_de}" ${source.name})*
# 
# ${description || ''}
`

const fieldArgument = ({ name }) => `
# ${name}
${name}: String`

const fieldArguments = ({ args }) => `
# id
id: String
# year
year: String
# date
date: String
# source
source: String
${Object.keys(args)
  .map(arg => fieldArgument(args[arg]))
  .join('')}`

const field = (name, schema) => `
${fieldDescription(schema)}
${name}(${fieldArguments(schema)}
): String
`

const fields = schema => {
  return Object.keys(schema)
    .map(name => field(name, schema[name]))
    .join('\n')
}

const schema = gql`
  type Region {
    # Regionalschlüssel
    id: String
    # Name
    name: String
    ${fields(genesapiSchema)}
  }

  # Graphql-API zum Datenbestand der GENESIS-Datenbank "Regionalstatistik"
  type Query {
    # Detail-Endpunkt zur Abfrage exakt einer Region
    region(
      # Regionalschlüssel
      id: String!
    ): Region
    # Listen-Endpunkt zur Abfrage mehrerer Regionen
    regions(
      # **Filter Regionen nach NUTS-Ebene.**
      # *Optionen:*
      # 1 – Bundesländer
      # 2 – Regierungsbezirke / statistische Regionen
      # 3 – Kreise / kreisfreie Städte
      # 4 – Gemeinden (LAU 1 / LAU 2)
      nuts: Int
      # Filter Regionen nach ID (Regionalschlüssel) der Elternregion
      parent: String
    ): [Region!]
  }
`

export default schema
