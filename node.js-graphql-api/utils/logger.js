const winston = require('winston');
const config = require('./config');

// Custom line format
const myFormat = winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`);

const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

const logger = winston.createLogger({
  level: config[env].logger.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    myFormat,
  ),
  transports: [
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'info.log',
      level: config[env].logger.level,
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
});

logger.stream = {
  write(message) {
    // use message.trim() to remove empty line between logged lines
    logger.info(message.trim());
  },
};


// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (env === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      myFormat,
    ),
  }));
}

module.exports = logger;
