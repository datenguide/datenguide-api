import service from 'feathers-elasticsearch'
import { Client } from 'elasticsearch'

export default app => {
  app.set(
    'elasticsearch',
    new Client({
      host: 'localhost:9200',
      apiVersion: '6.0'
    })
  )

  const genesapiService = service({
    Model: app.get('elasticsearch'),
    paginate: {
      default: 10,
      max: 50
    },
    elasticsearch: {
      index: 'genesapi',
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
