const CronJob = require('cron').CronJob;
const log = require('./logger');
const cacheUtil = require('./cache.util');
const emailUtil = require('./email.util');

const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const config = require('./config')[env];


const cron = new CronJob(`${config.mail.alertFrequency}`, (async () => {
  log.info('cron.util: cron - Started...');
  try {
    if (cacheUtil.getErrorCount() >= config.mail.errorAlertThershold) {
      log.info(`cron.util: cron - High error rate [${cacheUtil.getErrorCount()}] sending alert email`);
      await emailUtil.sendAlertMail(` ${process.env.COMPANY || 'DEV'} error count [${cacheUtil.getErrorCount()}]
        exceeded threshold`,
      `Please check error logs for ${process.env.COMPANY || 'DEV'}`);
    } else {
      log.info(`cron.util: cron - Low error rate no alert required [${cacheUtil.getErrorCount()}]`);
    }
    log.info('cron.util: cron - zeroing error count');
    cacheUtil.clearErrorCount();
  } catch (error) {
    log.error(`cron.util: cron - Error sending alert mail - ${error}`);
  }
}), null, true);

module.exports = cron;
