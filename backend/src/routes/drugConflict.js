const Router = require('koa-router');
const drugConflictController = require('../controllers/drugConflictController');
const { authenticate, requireRole } = require('../middlewares/auth');
const { USER_ROLE } = require('../config');

const router = new Router({ prefix: '/api/drug-conflicts' });

router.get('/', authenticate, drugConflictController.getList);
router.post('/check', authenticate, drugConflictController.checkDrugIds);
router.post('/', authenticate, requireRole(USER_ROLE.ADMIN, USER_ROLE.SENIOR_PHARMACIST), drugConflictController.create);

module.exports = router;
