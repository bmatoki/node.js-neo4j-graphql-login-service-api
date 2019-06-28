process.env.NODE_ENV = 'test';
process.env.PORT = 5050;
const mocha = require('mocha');


const describe = mocha.describe;
const it = mocha.it;
const chai = require('chai');

chai.should();
const cacheUtil = require('../utils/cache.util');

// check cache util
describe('Check cache.util', () => {
  let errorCount = -1;
  it('should return cache error count 0', () => {
    errorCount = cacheUtil.getErrorCount();
    chai.expect(errorCount).to.eql(0);
  });
  it('should increment error count', () => {
    cacheUtil.incrementErrorCount();
    errorCount = cacheUtil.getErrorCount();
    chai.expect(errorCount).to.eql(1);
  });
  it('should set error count to 0', () => {
    cacheUtil.clearErrorCount();
    errorCount = cacheUtil.getErrorCount();
    chai.expect(errorCount).to.eql(0);
  });
});
