const nodemailer = require('nodemailer');
const moment = require('moment');
const log = require('./logger');
const decryptUtil = require('./hash.util');

const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const config = require('./config')[env];

// send alert main with errors with node mailer.
async function sendAlertMail(title, errorMessage) {
  log.info('email.utils: sendAlertMail - Started...');
  try {
    const emailSettings = config.mail;
    emailSettings.password = decryptUtil.decrypt(emailSettings.password);
    log.info(`email.utils: sendAlertMail - Creating transporter with user ${emailSettings.username}`);

    const transporter = nodemailer.createTransport(
      {
        host: emailSettings.smtp,
        port: emailSettings.port,
        secure: emailSettings.ssl,
        auth: {
          user: emailSettings.username,
          pass: emailSettings.password,
        },
      },
    );

    log.info(`email.utils: sendAlertMail - Messanging  to ${emailSettings.techadmin}`);
    const date = moment().utcOffset(moment.tz.guess()).format('YYYY-MM-DD HH:mm');
    const message = {
      // Comma separated list of recipients
      to: emailSettings.techadmin,
      subject: `${date} - ${title}`,
      text: `${errorMessage}`,
    };

    const info = await transporter.sendMail(message);
    log.info(`email.utils: sendAlertMail - Email status ${info}`);
    return { success: true, msg: info };
  } catch (error) {
    log.error(`email.utils: sendAlertMail - Error ${error}`);
    return { success: false, msg: error.message };
  } finally {
    log.info('email.utils: sendAlertMail - Ended.');
  }
}


module.exports = { sendAlertMail };
