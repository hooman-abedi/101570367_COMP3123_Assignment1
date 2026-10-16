const logger = require('../utils/logger');
const { nodeEnv } = require('../config/env');

exports.notFound = (req, res) =>
  res.status(404).json({ status: false, message: `Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err.type === 'entity.parse.failed') { status = 400; message = 'Malformed JSON in request body'; }
  else if (err.code === 11000) { status = 409; message = `${Object.keys(err.keyValue || {})[0]} already exists`; }
  else if (err.name === 'ValidationError') {
    status = 400; message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }
  else if (err.name === 'CastError') { status = 400; message = 'Invalid ID format'; }

  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${err.stack}`);
    if (nodeEnv === 'production') message = 'Internal server error'; // hide internals
  }

  const body = { status: false, message };
  if (details) body.errors = details;
  res.status(status).json(body);
};
