import path from 'path'
// import favicon from 'serve-favicon'
import compress from 'compression'
import helmet from 'helmet'
import dotenv from 'dotenv'
import feathers from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import express from '@feathersjs/express'
import envHelpers from 'feathers-envhelpers'
import LRU from 'lru-cache'

import { logger, loggerHook } from './hooks/logger'
import services from './services'
import graphql from './graphql'
import middleware from './middleware'
import cors from './middleware/cors'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const app = express(feathers())
app.disable('x-powered-by')
app.configure(express.rest())

app.configure(envHelpers())

logger.level = app.isDevelopment() ? 'debug' : 'info'
app.logger = logger

app.cache = new LRU()

const conf = configuration()
app.configure(conf)
app.logger.info(conf(), 'App configuration')

app.configure(middleware)
app.configure(cors)
app.use(helmet())
app.use(compress())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.configure(services)
app.configure(graphql)

// app.use(favicon(path.join(app.get('public'), 'favicon.ico')))
app.use('/', express.static(app.get('public')))
app.use(express.errorHandler(app.get('errorhandler')))
app.use(express.notFound())

app.hooks({
  before: {
    all: [loggerHook],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [loggerHook],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [loggerHook],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
})

export default app
