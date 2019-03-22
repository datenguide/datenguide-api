import service from 'feathers-elasticsearch'
import { Client } from 'elasticsearch'

export default app => {
  app.info(`
  initializing elasticsearch on host ${app.get('elasticsearch').host}, 
  version ${app.get('elasticsearch').version}, 
  index ${app.get('elasticsearch').index}
  `)
  const genesapiService = service({
    Model: new Client({
      host: app.get('elasticsearch').host,
      apiVersion: app.get('elasticsearch').version
    }),
    paginate: {
      default: 10
    },
    elasticsearch: {
      index: app.get('elasticsearch').index,
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
