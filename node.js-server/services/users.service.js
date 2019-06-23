const logger  = require('../utils/logger');
const _ = require('lodash');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const hashUtil = require('../utils/hash.util');

const env = process.env.HASH_KEY || '12345678901234567890123456789';
const graphClient = require('../utils/graphql_request.util');

// reg expression for password.
function checkIfPasswordRuleIsValid(pass) {
  // Password supposed to be at least 8 characters long,
  // include both lower and upper case characters,include at least on number and symbol'
  const reg = '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$';
  if (!pass.match(reg)) {
    return false;
  }
  return true;
}

// validate if login form isn't empty.
async function validateLoginValue(obj, username, password) {
  logger.info('login.service - validateLoginValue() started');
  if (!obj || username === '' || password === '') {
    logger.info('login.service - validateLoginValue() return false');
    return false;
  }
  logger.info('login.service - validateLoginValue() return true');
  return true;
}

// lock user by id
async function lockUserByUsername(id) {
  logger.info('user.service - lockUserByUsername() started');
  logger.info(`user.service - lockUserByUsername() executing query on id ${id}`);
  const query = `
    mutation {
      UpdateAndLockManagement(locked:${true},id:"${id}") {
        id
      }
    }
  `;
  return graphClient.client(null).request(query);
}

// get username fail attempts , suspended time , id and locked status.
async function getFailAttempts(username) {
  logger.info('user.service - getFailAttempts() started');
  logger.info(`user.service - getFailAttempts() executing query on username ${username}`);
  const failAttemptsQuery = `
    query {
      getAllManagementAttempts(username:"${username.toLowerCase()}") {
        fail_attempt_count
        suspended_time
        id
        locked
        username
        role
      }
    }
  `;
  const result = await graphClient.client(null).request(failAttemptsQuery);
  if (result.getAllManagementAttempts.length) {
    return result;
  }
  return false;
}

// enhance current time for suspended until
function increaseMomentTime(time, addNumber, addValue) {
  return moment(time).add(addNumber, addValue).format('YYYY-MM-DD HH:mm');
}

// increase fail attempt or suspend by id if wrong credentials.
async function increaseFailAttemptOrSuspend(userDetails) {
  logger.info('user.service - increaseFailAttemptOrSuspend() started');
  logger.info('user.service - increaseFailAttemptOrSuspend() executing query on username');
  const currentTime = moment().format('YYYY-MM-DD HH:mm');
  let setTime = '';
  let res = {};
  switch (true) {
    case (userDetails.fail_attempt_count === 2):
      setTime = increaseMomentTime(currentTime, 10, 'minutes');
      res = {
        success: false,
        msg: `Username: ${userDetails.username} has been suspended until ${setTime}`,
      };
      break;
    case (userDetails.fail_attempt_count === 5):
      setTime = increaseMomentTime(currentTime, 30, 'minutes');
      res = {
        success: false,
        msg: `Username: ${userDetails.username} has been suspended until ${setTime}`,
      };
      break;
    case (userDetails.fail_attempt_count === 9):
      setTime = increaseMomentTime(currentTime, 1, 'hours');
      res = {
        success: false,
        msg: `Username: ${userDetails.username} has been suspended until ${setTime}`,
      };
      break;
    case (userDetails.fail_attempt_count >= 11):
      if (!userDetails.locked) {
        await lockUserByUsername(userDetails.id);
      }
      res = {
        success: false,
        msg: `Username: ${userDetails.username} has been locked , please contact your administrator.`,
      };
      break;
    default:
      setTime = '';
      res = {
        success: true,
        msg: 'not locking user or suspend him',
      };
  }
  let failAttempts = userDetails.fail_attempt_count;
  const query = `
    mutation {
      UpdateIncreaseManagementUser(fail_attempt_count:${failAttempts += 1},id:"${userDetails.id}",suspended_time:"${setTime}") {
        id
        fail_attempt_count
        locked
        suspended_time
        username
    }
  }
  `;
  await graphClient.client(null).request(query);
  return res;
}

// reset fail attempt by id in case success login.
async function resetFailAttempts(id) {
  logger.info('user.service - resetFailAttempts() started');
  logger.info('user.service - resetFailAttempts() executing query on username');
  const query = `
    mutation {
      UpdateIncreaseManagementUser(fail_attempt_count:0,id:"${id}",suspended_time:"") {
        id
        fail_attempt_count
        suspended_time
      }
    }
  `;
  return graphClient.client(null).request(query);
}

// check if locked or suspended.
async function checkIfLockedOrSuspended(userObj) {
  const currentTime = moment().format('YYYY-MM-DD HH:mm');
  let res = {};
  const timePass = moment(currentTime).isSameOrAfter(moment(userObj.suspended_time));
  switch (true) {
    case userObj.locked:
      res = {
        success: false,
        msg: `Username: ${userObj.username} has been locked , please contact your administrator.`,
      };
      break;
    case (userObj.suspended_time !== '' && !timePass):
      res = {
        success: false,
        msg: `Username: ${userObj.username} has been suspended until ${userObj.suspended_time}`,
      };
      break;
    default:
      res = {
        success: true,
        msg: 'not locked or suspended',
      };
  }
  return res;
}

// check if right credentials.
async function checkIfRightCredentials(username, password) {
  logger.info('login.service - checkIfRightCredentials() started');
  const query = `{
    searchManagementCredentials(username:"${username.toLowerCase()}",password:"${password}") {
     id
     username
     full_name
     role
     title 
     locked
     suspended_time
     fail_attempt_count
    }
  }`;
  logger.info('login.service - checkIfRightCredentials() executing query');
  return graphClient.client(null).request(query);
}

// check if add user form isn't empty.
async function validateAddUserValue(obj) {
  logger.info('login.service - validateAddUserValue() started');
  if (!obj || obj.username === '' || obj.password === '' || obj.role === '' || obj.title === '' || obj.full_name === '') {
    logger.info('login.service - validateAddUserValue() return false');
    return false;
  }
  logger.info('login.service - validateAddUserValue() return true');
  return true;
}

// add new user to db query.
async function addNewUser(obj, authToken) {
  logger.info('login.service - addNewUser() started');
  const encryptedPassword = hashUtil.encrypt(obj.password);
  const query = `
    mutation {
      CreateManagementUser(fail_attempt_count:0,suspended_time:"",locked:${false},username:"${obj.username.toLowerCase()}",password:"${encryptedPassword}",title:"${obj.title}",full_name:"${obj.full_name}",role:"${obj.role}",created_date:"${new Date().toISOString()}") {
        id
      }
    }
  `;
  logger.info('login.service - addNewUser() executing query');
  return graphClient.client(authToken).request(query);
}

// check if username is already exist.
async function checkIfUserNameIsExist(obj, authToken) {
  logger.info('login.service - checkIfUserNameIsExist() started');
  logger.info('login.service - checkIfUserNameIsExist() executing query');
  const query = `
    query {
      getManagmentUser(username:"${obj.username.toLowerCase()}") {
        username
      }
    }
  `;
  const result = await graphClient.client(authToken).request(query);
  if (result.getManagmentUser.length) {
    return false;
  }
  return true;
}

// check if edit form isn't empty.
async function validateEditUserValue(obj) {
  logger.info('login.service - validateEditUserValue() started');
  if (!obj || obj.username === '' || obj.password === '' || obj.role === '' || obj.title === '' || obj.full_name === '' || obj.id === '') {
    logger.info('login.service - validateEditUserValue() return false');
    return false;
  }
  logger.info('login.service - validateEditUserValue() return true');
  return true;
}

// get all users.
async function getAllUsers(token) {
  logger.info('login.service - getAllUsers() started');
  logger.info('login.service - getAllUsers() executing query');
  const query = `
  query {
    getAllmanagement {
      id
      username
      full_name
      role
      title
      locked
      password
    }
  }
  `;
  const result = await graphClient.client(token).request(query);


  const mappingResult = _.map(result.getAllmanagement, data => ({
    full_name: data.full_name,
    id: data.id,
    password: hashUtil.decrypt(data.password),
    role: data.role,
    title: data.title,
    username: data.username,
    locked: data.locked,
    suspended_time: data.suspended_time,
    fail_attempt_count: data.fail_attempt_count,
  }));


  return mappingResult;
}

// update user.
async function updateUser(obj, authToken) {
  logger.info('login.service - updateUser() started');
  const encryptedPassword = hashUtil.encrypt(obj.password);
  const query = `
    mutation {
      UpdateManagementUser(locked:${false},suspended_time:"",fail_attempt_count:0,username:"${obj.username.toLowerCase()}",password:"${encryptedPassword}",title:"${obj.title}",full_name:"${obj.full_name}",role:"${obj.role}",id:"${obj.id}") {
        id
      }
    }
  `;
  logger.info('login.service - updateUser() executing query');
  return graphClient.client(authToken).request(query);
}

// do login all validation. to one function that exported to router.
async function doLoginAllValidation(obj, username, password) {
  // lower case and encrypt pass.
  username = username ? username.toLowerCase().trim() : '';
  password = password ? await hashUtil.encrypt(password) : '';

  // ***  not using switch case because of all declarations ***

  // check if req body is empty
  if (!validateLoginValue(obj, username, password)) {
    logger.info('user.service.util: POST doLoginAllValidation() - empty credentials.');
    return {
      success: false,
      msg: 'Cannot log in with empty credentials.',
    };
  }

  // check if user is exist.
  const checkFailAttempts = await getFailAttempts(username);
  if (checkFailAttempts === false) {
    logger.info('user.service.util: POST doLoginAllValidation() - wrong username or password.');
    return {
      success: false,
      msg: 'Wrong Username or Password',
    };
  }

  // check if locked or suspended
  const bruteForce = await checkIfLockedOrSuspended(checkFailAttempts.getAllManagementAttempts[0]);
  if (!bruteForce.success) {
    return {
      success: bruteForce.success,
      msg: bruteForce.msg,
    };
  }
  // check credentials
  const result = await checkIfRightCredentials(username, password);

  // if wrong credentials
  if (!result.searchManagementCredentials.length) {
    const userDetails = checkFailAttempts.getAllManagementAttempts[0];
    logger.info('user.service.util: POST doLoginAllValidation() - wrong username or password.');

    // prevent super user from lock.
    if (userDetails.role !== 'superuser') {
      const resMessage = await increaseFailAttemptOrSuspend(userDetails);
      // if this try an error at attempt 12 , lock the user.
      if (userDetails.fail_attempt_count === 12) {
        await lockUserByUsername(userDetails.id);
      }
      if (resMessage.success === false) {
        return {
          success: false,
          msg: resMessage.msg,
        };
      }
    }
    return {
      success: false,
      msg: 'Wrong Username or Password',
    };
  }

  // create token
  const payload = {
    expiresIn: '1w',
  };
  const token = jwt.sign(result.searchManagementCredentials[0], env, payload);
  logger.info('user.service.util: POST doLoginAllValidation() - right credentials.');
  if (checkFailAttempts.getAllManagementAttempts[0].role !== 'superuser') {
  // reset fail attempts in case of success.
    await resetFailAttempts(checkFailAttempts.getAllManagementAttempts[0].id);
  }
  return {
    success: true,
    msg: { token, userDetail: result.searchManagementCredentials[0] },
  };
}

// do update user all validation. to one function that exported to router.
async function doUpdateAllValidation(userObj, oldObj, authToken) {
  const decoded = await jwt.verify(authToken.split(' ')[1], env);
  let newToken = null;
  switch (true) {
    // check if not empty req.body
    case (!validateEditUserValue(userObj)):
      logger.info('user.service doUpdateAllValidation() - empty update object.');
      return {
        success: false,
        msg: 'Cannot update with empty  values.',
      };
      // check if user name already exist.
    case (userObj.username !== oldObj):
      if (!await checkIfUserNameIsExist(userObj, authToken)) {
        logger.info('user.service doUpdateAllValidation() - user name already exist.');
        return {
          success: false,
          msg: 'User name is already exist.',
        };
      }
      break;
    case (userObj.role === 'superuser' && decoded.role !== 'superuser'):
      logger.info('user.service doUpdateAllValidation() - Only superuser can edit himself..');
      return {
        success: false,
        msg: 'Only superuser can edit himself.',
      };
    case (!checkIfPasswordRuleIsValid(userObj.password)):
      logger.info('user.service doUpdateAllValidation() - The password does not meet the password policy requirements');
      return {
        success: false,
        msg: 'The password does not meet the password policy requirements.',
      };
    default:
      logger.info('user.service doUpdateAllValidation() - passing all validation,updating user.');
  }
  // do update
  await updateUser(userObj, authToken);
  if (userObj.id === decoded.id) {
    // create token
    const payload = {
      expiresIn: '1w',
    };
    newToken = jwt.sign(userObj, env, payload);
  }
  return {
    success: true,
    msg: `User: ${userObj.username} has been updated successfully`,
    token: newToken,
    userDetails: userObj,
  };
}

// create user all validation. to one function that exported to router.
async function doCreateAllValidation(obj, authToken) {
  switch (true) {
    // check if no empty req.body
    case (!validateAddUserValue(obj)):
      logger.info('user.service POST doCreateAllValidation - empty register object.');
      return {
        success: false,
        msg: 'Cannot register with empty  values.',
      };
      // check if user name already exist.
    case (!await checkIfUserNameIsExist(obj, authToken)):
      logger.info('user.service POST doCreateAllValidation - user name already exist.');
      return {
        success: false,
        msg: 'User name is already exist.',
      };
    case (!checkIfPasswordRuleIsValid(obj.password)):
      logger.info('user.service POST doCreateAllValidation - The password does not meet the password policy requirements');
      return {
        success: false,
        msg: 'The password does not meet the password policy requirements.',
      };
    default:
      logger.info('user.service POST doCreateAllValidation - passing all validation,creating user.');
  }
  // create the user if all success.
  await addNewUser(obj, authToken);
  return {
    success: true,
    msg: `User: ${obj.username} has been created successfully`,
  };
}


module.exports = {
  doLoginAllValidation,
  getAllUsers,
  doCreateAllValidation,
  doUpdateAllValidation,
};
