const Router = require('koa-router');
const prescriptionController = require('../controllers/prescriptionController');
const reviewController = require('../controllers/reviewController');
const drugConflictController = require('../controllers/drugConflictController');

const router = new Router({ prefix: '/api/prescriptions' });

router.get('/', prescriptionController.getList);
router.get('/statistics', reviewController.getStatistics);
router.get('/:id', prescriptionController.getDetail);
router.get('/:id/review-records', reviewController.getReviewRecords);
router.get('/:id/check-conflicts', drugConflictController.checkPrescription);
router.post('/', prescriptionController.create);
router.put('/:id', prescriptionController.update);
router.post('/:id/submit-review', prescriptionController.submitForReview);
router.post('/:id/first-review', reviewController.firstReview);
router.post('/:id/second-review', reviewController.secondReview);
router.delete('/:id', prescriptionController.delete);

module.exports = router;
