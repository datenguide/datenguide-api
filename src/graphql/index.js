import { ApolloServer } from 'apollo-server-express'
import { graphiqlExpress } from 'graphql-server-express'
import { mergeTypes } from 'merge-graphql-schemas'
import catalogSchema from './schema/catalog'
import genesApiSchema from './schema/genesapi'
import catalogResolvers from './resolvers/catalog'
import genesApiResolvers from './resolvers/genesapi'

export const createServer = async app => {
  const { measures, mappings} = await app.service('treeApiSchema').find()

  return new ApolloServer({
    typeDefs:  mergeTypes([catalogSchema, genesApiSchema(measures, mappings)]),
    resolvers: [
      catalogResolvers(app),
      genesApiResolvers(app, measures, mappings)
    ],
    introspection: true,
    playground: true
  })
}

export default async app => {
  const server = await createServer(app)

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
