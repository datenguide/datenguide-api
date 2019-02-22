"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loggerHook = exports.default = exports.appLogger = void 0;

var _pino = _interopRequireDefault(require("pino"));

var _feathersLogger = _interopRequireDefault(require("feathers-logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const appLogger = (0, _pino.default)();
exports.appLogger = appLogger;

var _default = app => {
  appLogger.level = process.env.NODE_ENV === 'DEVELOPMENT' ? 'debug' : 'warn';
  app.configure((0, _feathersLogger.default)(appLogger));
};

exports.default = _default;

const loggerHook = context => {
  const {
    app,
    type,
    path,
    method,
    toJSON,
    error
  } = context;
  app.info(`${type} app.service('${path}').${method}()`);

  if (typeof toJSON === 'function') {
    app.debug(context, 'context');
  }

  if (error) {
    app.error(context.error.stack);
  }
};

exports.loggerHook = loggerHook;