import genesapi from './genesapi'
import graphql from './graphql'

export default app => {
  app.configure(genesapi)
  app.configure(graphql)
}
