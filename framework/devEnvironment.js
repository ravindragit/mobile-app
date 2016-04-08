export default {

  /**
   * Returns middleware that should be used only in development
   * mode. This usually includes utilities to simplify debugging.
   * @returns {Array} Redux middleware.
   */
  getReduxMiddleware() {
    const middleware = [];

    if (process.env.NODE_ENV === 'development') {
      const createLogger = require('redux-logger');
      const logger = createLogger({
        collapsed: true,
        actionTransformer: (action) => ({
          ...action,
          type: String(action.type),
        }),
      });
      middleware.push(logger);
    }

    return middleware;
  },
};
