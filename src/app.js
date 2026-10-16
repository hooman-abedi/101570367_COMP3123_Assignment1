const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());                        // security headers
app.use(express.json({ limit: '10kb' })); // parse JSON, reject huge bodies
app.use(morgan(':method :url :status :response-time ms', {
  stream: { write: (msg) => logger.info(msg.trim()) },   // request logs -> files
}));

app.get('/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const db = states[mongoose.connection.readyState] || 'unknown';
  res.status(db === 'connected' ? 200 : 503).json({
    status: db === 'connected' ? 'ok' : 'degraded',
    uptime_seconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: db,
  });
});

app.use('/api', apiLimiter);
app.use('/api/v1/user', require('./routes/userRoutes'));
app.use('/api/v1/emp', require('./routes/employeeRoutes'));

app.use(notFound);     // unknown routes -> 404
app.use(errorHandler); // must be last

module.exports = app;