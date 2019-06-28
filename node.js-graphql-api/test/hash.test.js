process.env.NODE_ENV = 'test';
const env = process.env.NODE_ENV;
process.env.PORT = 5050;
const mocha = require('mocha');


const describe = mocha.describe;
const it = mocha.it;
const chai = require('chai');
const config = require('../utils/config')[env];

chai.should();
const hashUtil = require('../utils/hash.util');

// check hash util - if decrypt hash work.
describe('Check hash.util', () => {
  it('should decrypt', () => {
    const result = hashUtil.decrypt(config.test.decryptHash);
    chai.expect(result).to.eql('test@123');
  });
  it('should encrypt', () => {
    const result = hashUtil.encrypt('test@123');
    chai.expect(result).to.eql(config.test.decryptHash);
  });
});
