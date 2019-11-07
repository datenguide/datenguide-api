import { ApolloServer } from 'apollo-server-express'
import { graphiqlExpress } from 'graphql-server-express'
import { mergeTypes } from 'merge-graphql-schemas'
import catalogSchema from './schema/catalog'
import genesApiSchema from './schema/genesapi'
import catalogResolvers from './resolvers/catalog'
import genesApiResolvers from './resolvers/genesapi'

export default async app => {

  const { measures, mappings} = await app.service('treeApiSchema').find()

  const server = new ApolloServer({
    typeDefs:  mergeTypes([catalogSchema, genesApiSchema(measures, mappings)]),
    resolvers: [
      catalogResolvers(app),
      genesApiResolvers(app, measures, mappings)
    ],
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
