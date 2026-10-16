const { body } = require('express-validator');

exports.signupRules = [
  body('username').exists({ values: 'falsy' }).withMessage('Username is required').bail()
    .isString().trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Letters, numbers and underscores only'),
  body('email').exists({ values: 'falsy' }).withMessage('Email is required').bail()
    .isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').exists({ values: 'falsy' }).withMessage('Password is required').bail()
    .isString().isLength({ min: 8, max: 64 }).withMessage('Password must be 8-64 characters')
    .matches(/[A-Z]/).withMessage('Password needs an uppercase letter')
    .matches(/[a-z]/).withMessage('Password needs a lowercase letter')
    .matches(/[0-9]/).withMessage('Password needs a number'),
];

exports.loginRules = [
  body('password').exists({ values: 'falsy' }).withMessage('Password is required').isString(),
  body().custom((v) => {
    if (!v || (!v.username && !v.email)) throw new Error('Username or email is required');
    return true;
  }),
  body('email').optional().isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('username').optional().isString().trim().isLength({ max: 30 }),
];