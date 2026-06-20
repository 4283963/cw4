const Router = require('koa-router');
const drugController = require('../controllers/drugController');
const { authenticate, requireRole } = require('../middlewares/auth');
const { USER_ROLE } = require('../config');

const router = new Router({ prefix: '/api/drugs' });

router.get('/', authenticate, drugController.getList);
router.get('/:id', authenticate, drugController.getDetail);
router.post('/', authenticate, requireRole(USER_ROLE.ADMIN, USER_ROLE.SENIOR_PHARMACIST), drugController.create);

module.exports = router;
