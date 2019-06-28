const logger  = require('../utils/logger');
const checkAuth = require('../services/check_auth.service');

const resolvers = {
  isAuthenticated: async (next, source, args, context) => {
    logger.info('resolvers_middleware: directive:isAuthenticated started');
    try {
      const result = await checkAuth.validateToken(context.req.headers.authorization);
      if (result) {
        logger.info('resolvers_middleware:: directive:isAuthenticated  right Authorization header.');
        return next();
      }
    } catch (error) {
      logger.info(`resolvers_middleware: directive:isAuthenticated  error: ${error}.`);
      throw new Error('Not Authorized.');
    } finally {
      logger.info('resolvers_middleware: directive:isAuthenticated  Ended.');
    }
  },

  hasRole: async (next, source, args, context) => {
    logger.info('resolvers_middleware: directive:hasRole  started');
    try {
      const result = await checkAuth.validateToken(context.req.headers.authorization);
      if (result) {
        const decoded = await checkAuth.decodedToken(context.req.headers.authorization.split(' ')[1]);
        logger.info('resolvers_middleware: directive:hasRole right Authorization header.');
        await checkAuth.hasRoleValidation(args, decoded, context.req.body);
        return next();
      }
    } catch (error) {
      logger.info(`resolvers_middleware error: ${error}.`);
      throw new Error('Not Authorized.');
    } finally {
      logger.info('resolvers_middleware Ended.');
    }
  },

};

module.exports = resolvers;
