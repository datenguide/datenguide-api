'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.default = void 0

var _path = _interopRequireDefault(require('path'))

var _serveFavicon = _interopRequireDefault(require('serve-favicon'))

var _compression = _interopRequireDefault(require('compression'))

var _helmet = _interopRequireDefault(require('helmet'))

var _dotenv = _interopRequireDefault(require('dotenv'))

var _feathers = _interopRequireDefault(require('@feathersjs/feathers'))

var _configuration = _interopRequireDefault(
  require('@feathersjs/configuration')
)

var _express = _interopRequireDefault(require('@feathersjs/express'))

var _feathersEnvhelpers = _interopRequireDefault(require('feathers-envhelpers'))

var _logger = _interopRequireWildcard(require('./hooks/logger'))

var _middleware = _interopRequireDefault(require('./middleware'))

var _services = _interopRequireDefault(require('./services'))

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj
  } else {
    var newObj = {}
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          var desc =
            Object.defineProperty && Object.getOwnPropertyDescriptor
              ? Object.getOwnPropertyDescriptor(obj, key)
              : {}
          if (desc.get || desc.set) {
            Object.defineProperty(newObj, key, desc)
          } else {
            newObj[key] = obj[key]
          }
        }
      }
    }
    newObj.default = obj
    return newObj
  }
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

_dotenv.default.config({
  path: _path.default.resolve(__dirname, '..', '.env')
})

const app = (0, _express.default)((0, _feathers.default)())
app.disable('x-powered-by')
app.configure(_express.default.rest())
app.configure(_logger.default)
app.configure((0, _feathersEnvhelpers.default)())
const conf = (0, _configuration.default)()
app.configure(conf)
app.info(conf(), 'App configuration')
app.use((0, _helmet.default)())
app.use((0, _compression.default)())
app.use(_express.default.json())
app.use(
  _express.default.urlencoded({
    extended: true
  })
)
app.configure(_middleware.default)
app.configure(_services.default)
app.use(
  (0, _serveFavicon.default)(
    _path.default.join(app.get('public'), 'favicon.ico')
  )
)
app.use('/', _express.default.static(app.get('public')))
app.use(_express.default.notFound())
app.use(_express.default.errorHandler(app.get('errorhandler')))
app.hooks({
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [_logger.loggerHook],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [_logger.loggerHook],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
})
var _default = app
exports.default = _default
