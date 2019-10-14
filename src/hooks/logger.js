import pino from 'pino'

export const logger = pino()

export const loggerHook = context => {
  const { app, type, path, method, toJSON, error } = context

  app.logger.info(`${type} app.service('${path}').${method}()`)

  if (typeof toJSON === 'function') {
    const { arguments: args } = context
    app.logger.debug('arguments', args)
  }

  if (error) {
    app.logger.error(context.error.stack)
  }
}
