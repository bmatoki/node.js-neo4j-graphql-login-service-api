const env = process.env.HASH_KEY || '12345678901234567890123456789';
const logger  = require('../utils/logger');
const jwt = require('jsonwebtoken');


// check if token is valid
async function validateToken(header) {
  let token = null;
  const authHeader = header;
  if (!authHeader) {
    logger.info('resolvers_middleware: directive:isAuthenticated : Missing Authorization header');
    throw new Error(
      'Missing Authorization header',
    );
  }
  const broken = authHeader.split(' ');
  if (broken.length !== 2 || broken[0] !== 'Bearer' || broken[1] === '') {
    logger.info('resolvers_middleware: directive:isAuthenticated : Invalid Authorization header');
    throw new Error(
      'Invalid Authorization header',
    );
  }
  token = authHeader.split(' ')[1];
  const decoded = await jwt.verify(token, env);
  if (!decoded) {
    throw new Error(
      'Not Authorized, Invalid Authorization header',
    );
  }
  return true;
}

// prevent from delete super user.
async function checkIfTryToDeleteSuperUser(body) {
  if (body.operationName !== undefined && body.operationName === 'DeleteManagementUser') {
    if (body.variables.role === 'superuser') {
      throw new Error('Cannot delete super user.');
    }
  }
}

// decode the token
async function decodedToken(token) {
  return jwt.verify(token, env);
}

// has role all validations
async function hasRoleValidation(args, decoded, body) {
  if (!args.role.includes(decoded.role)) {
    throw new Error(`Not authorized, Must have role: ${args.role}, you have role: ${decoded.role}.`);
  }
  await checkIfTryToDeleteSuperUser(body);
}

module.exports = {
  validateToken,
  checkIfTryToDeleteSuperUser,
  decodedToken,
  hasRoleValidation,
};
