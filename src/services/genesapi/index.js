import service from 'feathers-elasticsearch'
import { Client } from 'elasticsearch'

export default app => {
  const { auth, host, version, index } = app.get('elasticsearch')

  app.info(`
  initializing elasticsearch on host ${host}, 
  version ${version}, 
  index ${index}
  `)


  const genesapiService = service({
    Model: new Client({
      host,
      apiVersion: version,
      ...(auth ? { auth } : {})
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
