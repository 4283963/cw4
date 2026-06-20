const Router = require('koa-router');
const prescriptionRouter = require('./prescription');
const drugRouter = require('./drug');
const drugConflictRouter = require('./drugConflict');
const authRouter = require('./auth');

const router = new Router();

router.get('/api/health', (ctx) => {
  ctx.body = {
    success: true,
    message: '电子处方管理系统服务正常',
    timestamp: new Date().toISOString()
  };
});

router.use(authRouter.routes(), authRouter.allowedMethods());
router.use(prescriptionRouter.routes(), prescriptionRouter.allowedMethods());
router.use(drugRouter.routes(), drugRouter.allowedMethods());
router.use(drugConflictRouter.routes(), drugConflictRouter.allowedMethods());

module.exports = router;
