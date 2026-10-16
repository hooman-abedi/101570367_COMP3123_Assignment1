const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

module.exports = async function authenticate(req, res, next) {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      logger.warn(`Auth failure: missing token ${req.method} ${req.originalUrl}`);
      throw new AppError('Authentication token missing', 401);
    }

    let payload;
    try {
      payload = jwt.verify(token, jwtSecret);
    } catch (err) {
      const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
      logger.warn(`Auth failure: ${msg} ${req.method} ${req.originalUrl}`);
      throw new AppError(msg, 401);
    }

    const user = await User.findById(payload.sub);
    if (!user) throw new AppError('User for this token no longer exists', 401);

    req.user = { id: user._id.toString(), username: user.username }; // identity comes from the token
    next();
  } catch (err) { next(err); }
};