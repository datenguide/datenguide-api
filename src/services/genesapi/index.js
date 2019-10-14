import service from 'feathers-elasticsearch'
import { Client } from 'elasticsearch'

export default app => {
  const { auth, host, protocol, port, version, index } = app.get('elasticsearch')

  app.logger.info(`
  initializing elasticsearch on host ${host}, 
  protocol ${protocol}, 
  port ${port}, 
  version ${version}, 
  index ${index}
  `)


  const genesapiService = service({
    Model: new Client({
      host: [
        {
          host,
          ...(auth ? { auth } : {}),
          protocol,
          port
        }
      ],
      apiVersion: version
    }),
    paginate: {
      default: 10
    },
    elasticsearch: {
      index,
      type: 'doc'
    },
    esVersion: '6.0'
  })

  app.use('/genesapi', genesapiService)

  app
    .service('genesapi')
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
