import { ApolloServer } from 'apollo-server-express'
import { graphiqlExpress } from 'graphql-server-express'

import typeDefs from './schema'
import resolvers from './resolvers'

export default app => {
  const server = new ApolloServer({
    typeDefs,
    resolvers
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
