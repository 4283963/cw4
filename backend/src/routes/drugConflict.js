const Router = require('koa-router');
const drugConflictController = require('../controllers/drugConflictController');

const router = new Router({ prefix: '/api/drug-conflicts' });

router.get('/', drugConflictController.getList);
router.post('/', drugConflictController.create);
router.post('/check', drugConflictController.checkDrugIds);

module.exports = router;
