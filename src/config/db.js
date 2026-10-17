const mongoose = require('mongoose');
const { mongoUri } = require('./env');
const logger = require('../utils/logger');

// Reuses one connection. Safe to call on every request (needed for Vercel serverless).
let connecting = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!connecting) {
    connecting = mongoose
      .connect(mongoUri, { dbName: 'comp3123_assignment1' })
      .then(() => logger.info('Connected to MongoDB database: comp3123_assignment1'))
      .catch((err) => {
        connecting = null; // allow a retry on the next request
        throw err;
      });
  }
  await connecting;
}

module.exports = connectDB;