import { ApolloServer } from 'apollo-server-express'
import { graphiqlExpress } from 'graphql-server-express'
import { mergeSchemas } from 'graphql-tools'

import catalogSchema from './schema/catalog'
import genesApiSchema from './schema/genesapi'
import catalogResolvers from './resolvers/catalog'
import genesApiResolvers from './resolvers/genesapi'

export default async app => {
  const server = new ApolloServer({
    schema: mergeSchemas({
      schemas: [catalogSchema, genesApiSchema],
      resolvers: [catalogResolvers(app), genesApiResolvers(app)]
    }),
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
