const NodeCache = require('node-cache');
const logger  = require('./logger');

const config = { useClones: false };
logger.info(`cache.util: Init cache with config ${JSON.stringify(config)}`);
const appCache = new NodeCache(config);
appCache.set('errorCount', 0);
appCache.set('errorMsg', '');
let errorCount = appCache.get('errorCount');
let errorMsg = appCache.get('errorMsg');

function clearErrorCount() {
  errorCount = 0;
  errorMsg = '';
}
function incrementErrorCount(msg) {
  errorMsg = msg;
  errorCount += 1;
}
function getErrorCount() {
  return errorCount;
}
function setLastLogMsg(err) {
  errorMsg = err;
}

function getLastLogMsg() {
  return errorMsg;
}
module.exports = {
  incrementErrorCount,
  clearErrorCount,
  getErrorCount,
  setLastLogMsg,
  getLastLogMsg,
};
