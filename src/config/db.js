const mongoose = require('mongoose');
const { mongoUri } = require('./env');
const logger = require('../utils/logger');

module.exports = async function connectDB() {
  await mongoose.connect(mongoUri, { dbName: 'comp3123_assignment1' }); // exact name required
  logger.info('Connected to MongoDB database: comp3123_assignment1');
};