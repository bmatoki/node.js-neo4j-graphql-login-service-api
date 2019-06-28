const express = require('express');
const logger  = require('../utils/logger');
const jwt = require('jsonwebtoken');
const usersService = require('../services/users.service');

const env = process.env.HASH_KEY || '12345678901234567890123456789';
const router = express.Router();


async function doLogin(req, res) {
  logger.info('/api/users/login/: POST doLogin() - Started.');
  try {
    const { username, password } = req.body.userObj;
    const result = await usersService.doLoginAllValidation(req.body.userObj, username, password);
    return res.status(200).json({
      success: result.success,
      msg: result.msg,
    });
  } catch (error) {
    logger.error(`/api/users/login/: POST doLogin() - Error: ${error}.`);
    return res.status(401).json({
      success: false,
      msg: 'Failed to log in',
    });
  } finally {
    logger.info('/api/users/login/: POST doLogin() - Ended.');
  }
}


async function getUserDetailsFromToken(req, res) {
  logger.info('/api/users/decoded/: POST getUserDetailsFromToken() - Started.');
  try {
    const authToken = req.headers.authorization;
    const decoded = await jwt.verify(authToken, env);
    return res.status(200).json({
      success: true,
      msg: decoded,
    });
  } catch (error) {
    logger.error(`/api/users/decoded/: POST getUserDetailsFromToken() - Error: ${error}.`);
    return res.status(401).json({
      success: false,
      msg: 'Failed to get user details.',
    });
  } finally {
    logger.info('/api/users/decoded/: POST getUserDetailsFromToken() - Ended.');
  }
}


async function getAllUsersFromDB(req, res) {
  logger.info('/api/users/all/: POST getAllUsersFromDB() - Started.');
  try {
    const authToken = req.headers.authorization;
    const result = await usersService.getAllUsers(authToken);
    return res.status(200).json({
      success: true,
      msg: result,
    });
  } catch (error) {
    logger.error(`/api/users/all/: POST getAllUsersFromDB() - Error: ${error}.`);
    return res.status(401).json({
      success: false,
      msg: 'Failed to get all users.',
    });
  } finally {
    logger.info('/api/users/all/: POST getAllUsersFromDB() - Ended.');
  }
}


async function doRegister(req, res) {
  logger.info('/api/users/register/: POST doRegister() - Started.');
  try {
    const authToken = req.headers.authorization;
    const result = await usersService.doCreateAllValidation(req.body.userObj, authToken);
    return res.status(200).json({
      success: result.success,
      msg: result.msg,
    });
  } catch (error) {
    logger.info(`/api/users/register/: POST doRegister() - error: ${error}.`);
    return res.status(400).json({
      success: false,
      msg: 'Failed to create a new user.',
    });
  } finally {
    logger.info('/api/users/register/: POST doRegister() - ended.');
  }
}

async function updateUser(req, res) {
  logger.info('/api/users/update/: POST updateUser() - Started.');
  try {
    const authToken = req.headers.authorization;
    const result = await usersService.doUpdateAllValidation(req.body.userObj, req.body.oldObj.oldUser, authToken);
    return res.status(200).json({
      success: result.success,
      msg: result.msg,
      token: result.token,
      userDetails: result.userDetails,
    });
  } catch (error) {
    logger.info(`/api/users/update/: POST updateUser() - error: ${error}.`);
    return res.json({
      success: false,
      msg: 'Failed to update user details.',
    });
  } finally {
    logger.info('/api/users/update/: POST updateUser() - ended.');
  }
}

router.post('/login', doLogin);
router.get('/decoded', getUserDetailsFromToken);
router.post('/register', doRegister);
router.put('/update', updateUser);
router.get('/all', getAllUsersFromDB);

module.exports = router;
