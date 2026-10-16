const { matchedData } = require('express-validator');
const userService = require('../services/userService');
const logger = require('../utils/logger');

exports.signup = async (req, res, next) => {
  try {
    const user = await userService.createUser(matchedData(req));
    logger.info(`User signed up: ${user.username}`);
    res.status(201).json({ message: 'User created successfully', user_id: user._id, user });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  const data = matchedData(req);
  try {
    const { user, token } = await userService.login(data);
    logger.info(`Login success: ${user.username}`);
    res.status(200).json({ message: 'Login successful', token, user });
  } catch (err) {
    logger.warn(`Login failed for: ${data.email || data.username}`); // never log the password
    next(err);
  }
};