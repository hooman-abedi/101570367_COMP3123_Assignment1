const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const handler = (req, res, next, options) => {
  logger.warn(`Rate limit exceeded: ${req.ip} ${req.method} ${req.originalUrl}`);
  res.status(429).json({ status: false, message: options.message });
};

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 5,          // 5 attempts per 15 min per IP
  standardHeaders: 'draft-7', legacyHeaders: false,
  message: 'Too many authentication attempts, please try again in 15 minutes', handler,
});

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 100,        // 100 requests per 15 min per IP
  standardHeaders: 'draft-7', legacyHeaders: false,
  message: 'Too many requests, please try again later', handler,
});