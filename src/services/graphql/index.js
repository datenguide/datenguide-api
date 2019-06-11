import { ApolloServer } from 'apollo-server-express'
import { graphiqlExpress } from 'graphql-server-express'

import typeDefs from './schema'
import genesApiResolvers from './resolvers'
import Dataloader from 'dataloader'

export default async app => {
  const fetchAttributes = keys =>
    new Promise((resolve, reject) => {
      console.log('keys', JSON.stringify(keys, null, 2))
      resolve(keys)
    })

  const server = new ApolloServer({
    typeDefs,
    resolvers: genesApiResolvers(app),
    context: {
      attributeLoader: new Dataloader(keys => fetchAttributes(keys))
    },
    introspection: true,
    playground: true
  })

  // apollo / apollo playground
  server.applyMiddleware({ app })

  // graphiql
  app.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: '/graphql'
    })
  )
}
