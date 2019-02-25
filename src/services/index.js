import regions from './regions'
import genesapi from './genesapi'
import graphql from './graphql'

export default app => {
  app.configure(regions)
  app.configure(genesapi)
  app.configure(graphql)
}
