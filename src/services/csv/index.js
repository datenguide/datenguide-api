import { ApolloClient } from 'apollo-client'
import { SchemaLink } from 'apollo-link-schema'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { makeExecutableSchema } from 'graphql-tools'
import { gql } from 'apollo-server-express'
import { parse } from 'json2csv'
import Pivot from 'quick-pivot'
import _ from 'lodash'

import typeDefs from '../graphql/schema'
import schema from '../graphql/schema/schema.json'
import resolvers from '../graphql/resolvers'

// TODO same code exists in web connector, should be merged
const getSchemaArgs = statistics => {
  return schema[statistics].args
}

const getQuery = (region, statistics) => {
  const argToFilter = a => `${a}: {nin: []}`
  const argsToFilter = a =>
    a.length > 0
      ? `(filter: {${a.map(arg => argToFilter(arg)).join(',')}})`
      : ''
  const argsToFields = a => a.join('\n')
  const args = getSchemaArgs(statistics)
  const argumentNames = Object.keys(args)

  return `
        {
          region(id: "${region}") {
            id
            name
              ${statistics}${argsToFilter(argumentNames)} {
              value
              year
              ${argsToFields(argumentNames)}
            }
          }
        }
      `
}

export default async app => {
  const client = new ApolloClient({
    link: new SchemaLink({
      schema: makeExecutableSchema({ typeDefs, resolvers: resolvers(app) }),
      context: {}
    }),
    cache: new InMemoryCache()
  })

  const service = {
    find: async params => {
      const { region, statistics, narrow } = params.query
      const apolloQueryResult = await client.query({
        query: gql`
          ${getQuery(region, statistics)}
        `,
        variables: { region, statistics }
      })
      const queryResult = apolloQueryResult.data.region[statistics]
      
      if (narrow) {
        const attributes = Object.keys(getSchemaArgs(statistics))
        const pivot = new Pivot(
          queryResult,
          ['year'],
          attributes,
          'value',
          'sum'
        )
        const fields = pivot.data.table[0].value
        return {
          queryResult: pivot.data.table
            .slice(1)
            .map(v => v.value)
            .map(values => _.zipObject(fields, values)),
          fields
        }
      }

      return {
        queryResult,
        fields: ['value', 'year'].concat(Object.keys(getSchemaArgs(statistics)))
      }
    }
  }

  const csvResponseMiddleware = (req, res) => {
    const csv = parse(res.data.queryResult, {
      fields: res.data.fields
    })
    res.writeHead(200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=*datenguide*.csv'
    })
    res.end(csv)
  }

  app.use('/csv', service, csvResponseMiddleware)
  app
    .service('csv')
    .hooks({
      before: {
        all: [],
        find: []
      },
      after: {
        all: [],
        find: []
      },
      error: {
        all: [],
        find: []
      }
    })
    .hooks({
      after: {
        all: []
      }
    })
}
