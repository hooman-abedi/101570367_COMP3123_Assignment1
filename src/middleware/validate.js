const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  logger.warn(`Validation failed ${req.method} ${req.originalUrl}: ${details.map(d => d.field).join(', ')}`);
  next(new AppError('Validation failed', 400, details));
};