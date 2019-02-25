'use strict'

var _app = _interopRequireDefault(require('./app'))

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

const port = _app.default.get('port')

const server = _app.default.listen(port)

process.on('unhandledRejection', error => _app.default.error(error))
server.on('listening', () => {
  _app.default.info(
    `Datenguide API is running on ${_app.default.get(
      'host'
    )}:${port} in ${_app.default.getEnv()} mode`
  )
})
