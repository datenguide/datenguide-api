import regions from './regions'
import genesapi from './genesapi'
import genesapiQuery from './genesapiQuery'
import graphql from './graphql'
import csv from './csv'

export default app => {
  app.configure(regions)
  app.configure(genesapi)
  app.configure(genesapiQuery)
  app.configure(graphql)
  app.configure(csv)
}
