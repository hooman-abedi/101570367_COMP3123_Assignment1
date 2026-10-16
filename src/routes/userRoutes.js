const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { signupRules, loginRules } = require('../validators/userValidators');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, signupRules, validate, ctrl.signup);
router.post('/login', authLimiter, loginRules, validate, ctrl.login);

module.exports = router;