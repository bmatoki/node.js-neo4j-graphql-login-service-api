const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const chalk = require('chalk');
const cors = require('cors');
const { v1 } = require('neo4j-driver');
const logger = require('./utils/logger');
const emailUtil = require('./utils/email.util');
const config = require('./utils/config');
const cacheUtil = require('./utils/cache.util');
const cronJob = require('./utils/cron.util');
const mergedSchema = require('./utils/schema.util');
const usersRouter = require('./routes/users.router');


const PORT = process.env.PORT || 4000;
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
logger.info(`app: Starting in [${env}] mode`);

const app = express();

// listen to neo4j db.
const driver = v1.driver(
  config[env].db.NEO4J_URI,
  v1.auth.basic(
    config[env].db.NEO4J_USER, config[env].db.NEO4J_PASSWORD,
  ),
);

// create apollo server (graphql)
// inject the request object into the context to support middleware
// inject the Neo4j driver instance to handle database call

// for disable playground and introspection api schema in production.
const isDev = process.env.NODE_ENV !== 'production';

const server = new ApolloServer({
  schema: mergedSchema,
  context: ({ req, res }) => ({
    req,
    res,
    driver,
  }),
  introspection: isDev,
  playground: isDev,
});

// Middle wares
logger.info('app: Loading middle wares');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
logger.info(`app: Setting up cors with options ${JSON.stringify(config[env].cors)}`);
app.use(cors(config[env].cors));


// Node Routes
// add apollo server as middleware
server.applyMiddleware({ app, path: '/api/graphql' });
app.use('/api/users', usersRouter);
logger.info('app: Finished loading middle wares');

// Start the server
app.listen(PORT, () => {
  logger.info(chalk.magenta(`App listening on http://localhost:${PORT}${server.graphqlPath}`));
});


// Catch all unhandled rejections and log
process.on('unhandledrejection', async (reason) => {
  cacheUtil.incrementErrorCount(reason.stack || reason);
  log.error(` Unhandled Rejection at: ${reason.stack || reason}`);
  await emailUtil.sendAlertMail(`${process.env.COMPANY || 'DEV'} Unhandled Rejection  `, `Unhandled Rejection at: ${reason.stack || reason}`);
});

// Testing module
module.exports = app;
