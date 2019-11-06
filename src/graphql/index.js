import { ApolloServer } from 'apollo-server-express'
import { graphiqlExpress } from 'graphql-server-express'
import { mergeTypes } from 'merge-graphql-schemas'
import catalogSchema from './schema/catalog'
import genesApiSchema from './schema/genesapi'
import catalogResolvers from './resolvers/catalog'
import genesApiResolvers from './resolvers/genesapi'

export default async app => {
  const data = await app.service('schema').find()

  // generate tree API schema from new schema
  const measures = {}
  const mappings = {}
  Object.keys(data).forEach(statistic => {
    if (statistic !== "99910") { // FIXME: something's wrong with regionalatlas schema
      const statisticSchema = data[statistic]
      Object.keys(statisticSchema.measures).forEach(measure => {
        measures[measure] = {
          ...data[statistic].measures[measure],
          source: statisticSchema
        }
        if (!mappings[measure]) {
          mappings[measure] = []
        }
        mappings[measure].push(statisticSchema)
      })
    }
  })

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
