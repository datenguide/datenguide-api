import { ApolloServer } from 'apollo-server-express'
import { mergeTypes } from 'merge-graphql-schemas'
import catalogSchema from './schema/catalog'
import genesApiTreeSchema from './schema/genesapiTree'
import genesApiTabularSchema from './schema/genesapiTabular'
import catalogResolvers from './resolvers/catalog'
import genesApiTreeResolvers from './resolvers/genesapiTree'
import genesApiTabularResolvers from './resolvers/genesapiTabular'

export const createServer = async app => {
  const { measures, mappings } = await app.service('treeApiSchema').find()

  return new ApolloServer({
    typeDefs: mergeTypes([
      catalogSchema,
      genesApiTreeSchema(measures, mappings),
      genesApiTabularSchema
    ]),
    resolvers: [
      catalogResolvers(app),
      genesApiTreeResolvers(app, measures, mappings),
      genesApiTabularResolvers(app)
    ],
    introspection: true,
    playground: true
  })
}

export default async app => {
  const server = await createServer(app)
  server.applyMiddleware({ app })
}
