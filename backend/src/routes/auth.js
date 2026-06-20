const Router = require('koa-router');
const authController = require('../controllers/authController');
const { authenticate, requireRole } = require('../middlewares/auth');
const { USER_ROLE } = require('../config');

const router = new Router({ prefix: '/api/auth' });

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.get('/users', authenticate, requireRole(USER_ROLE.ADMIN), authController.listUsers);

module.exports = router;
