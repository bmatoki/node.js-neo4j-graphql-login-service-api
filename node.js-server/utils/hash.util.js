const crypto = require('crypto');

const salt = process.env.HASH_KEY || '12345678901234567890123456789';

function encrypt(text) {
  const cipher = crypto.createCipher('aes-256-cbc', salt);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text) {
  const decipher = crypto.createDecipher('aes-256-cbc', salt);
  let dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

//debugger line
if (typeof require !== 'undefined' && require.main === module) {
  console.log(encrypt('Test@123'));
}


module.exports = {
  encrypt,
  decrypt,
};
