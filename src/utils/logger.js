const path = require('path');
const { createLogger, format, transports } = require('winston');

const logDir = path.join(__dirname, '..', '..', 'logs');
const onVercel = !!process.env.VERCEL; // Vercel sets this automatically

const logTransports = [
  new transports.Console({ format: format.combine(format.colorize(), format.simple()) }),
];

// Local: also write to files. Vercel's file system is read-only, so console only there.
if (!onVercel) {
  logTransports.push(
    new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logDir, 'app.log') })
  );
}

module.exports = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: logTransports,
});