const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

exports.createUser = async ({ username, email, password }) => {
  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) {
    throw new AppError(`${existing.username === username ? 'Username' : 'Email'} already exists`, 409);
  }
  return User.create({ username, email, password });
};

exports.login = async ({ username, email, password }) => {
  const user = await User.findOne(email ? { email } : { username }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid username/email or password', 401); // same message either way
  }
  const token = jwt.sign({ sub: user._id.toString(), username: user.username },
    jwtSecret, { expiresIn: jwtExpiresIn });
  return { user, token };
};