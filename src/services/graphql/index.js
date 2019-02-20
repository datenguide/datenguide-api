import { ApolloServer } from 'apollo-server-express'
import { graphiqlExpress } from 'graphql-server-express'

import typeDefs from './schema'
import genesApiResolvers from './resolvers'

export default async app => {
  const server = new ApolloServer({
    typeDefs,
    resolvers: genesApiResolvers(app)
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
