const { body, param, query } = require('express-validator');

const fieldRules = (optional) => {
  const f = (name) => optional
    ? body(name).optional()
    : body(name).exists({ values: 'falsy' }).withMessage(`${name} is required`).bail();
  return [
    f('first_name').isString().trim().isLength({ min: 1, max: 50 }).withMessage('first_name must be 1-50 chars'),
    f('last_name').isString().trim().isLength({ min: 1, max: 50 }).withMessage('last_name must be 1-50 chars'),
    f('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
    f('position').isString().trim().isLength({ min: 1, max: 100 }).withMessage('position must be 1-100 chars'),
    f('salary').isFloat({ gt: 0 }).withMessage('salary must be a positive number').toFloat(),
    f('date_of_joining').isISO8601().withMessage('date_of_joining must be a valid date (YYYY-MM-DD)').toDate(),
    f('department').isString().trim().isLength({ min: 1, max: 100 }).withMessage('department must be 1-100 chars'),
    body('user').not().exists().withMessage('user field cannot be set by the client'),
  ];
};

exports.createRules = fieldRules(false);
exports.updateRules = [param('eid').isMongoId().withMessage('Invalid employee ID'), ...fieldRules(true)];
exports.eidParamRule = [param('eid').isMongoId().withMessage('Invalid employee ID')];
exports.eidQueryRule = [query('eid').exists().withMessage('eid is required').bail()
  .isMongoId().withMessage('Invalid employee ID')];