process.env.NODE_ENV = 'test';
const env = process.env.NODE_ENV;
process.env.PORT = 5050;
const mocha = require('mocha');


const describe = mocha.describe;
const it = mocha.it;
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
chai.should();
const emailUtil = require('../utils/email.util');


// check email util - send test mail.
describe('check email.util', () => {
  it('should send alert mail', async () => {
    const result = await emailUtil.sendAlertMail('TEST EMAIL SUBJECT', 'TEST EMAIL BODY');
    /* eslint-disable */
    console.log(result.success);
    console.log(result.msg);
    /* eslint-enable */
    chai.expect(result).to.have.property('success').eql(true);
  });
});
