const router = require('express').Router();
const ctrl = require('../controllers/employeeController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validators/employeeValidators');

router.use(authenticate); // all routes below need a valid JWT

router.get('/employees', ctrl.list);
router.post('/employees', v.createRules, validate, ctrl.create);
router.get('/employees/:eid', v.eidParamRule, validate, ctrl.getOne);
router.put('/employees/:eid', v.updateRules, validate, ctrl.update);
router.delete('/employees', v.eidQueryRule, validate, ctrl.remove); // ?eid=xxx

module.exports = router;