import { ApolloServer, gql } from 'apollo-server-express'

export default app => {
  const typeDefs = gql`
    type Query {
      "A simple type for getting started!"
      hello: String
    }
  `

  // A map of functions which return data for the schema.
  const resolvers = {
    Query: {
      hello: () => 'world'
    }
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers
  })

  server.applyMiddleware({ app })
}
