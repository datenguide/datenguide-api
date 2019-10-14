import app from './app'

const port = app.get('port')
const server = app.listen(port)

process.on('unhandledRejection', error => app.logger.error(error))

server.on('listening', () => {
  app.logger.info(
    `Datenguide API is running on ${app.get(
      'host'
    )}:${port} in ${app.getEnv()} mode`
  )
})
