const { port } = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');
const logger = require('./utils/logger');

(async () => {
  try {
    await connectDB();
    app.listen(port, () => logger.info(`Server started on port ${port}`));
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
})();