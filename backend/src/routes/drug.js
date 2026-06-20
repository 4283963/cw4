const Router = require('koa-router');
const drugController = require('../controllers/drugController');

const router = new Router({ prefix: '/api/drugs' });

router.get('/', drugController.getList);
router.get('/:id', drugController.getDetail);
router.post('/', drugController.create);

module.exports = router;
