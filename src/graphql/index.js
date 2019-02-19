import { ApolloServer, gql } from 'apollo-server-express'
import { graphiqlExpress } from 'graphql-server-express'

export default app => {
  const typeDefs = gql`
    type Query {
      hello: String!
    }
  `

  // A map of functions which return data for the schema.
  const resolvers = {
    Query: {
      hello: () => 'world'
    }

    // feathers service, get data..
  }

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
