const Router = require('koa-router');
const prescriptionController = require('../controllers/prescriptionController');
const reviewController = require('../controllers/reviewController');
const drugConflictController = require('../controllers/drugConflictController');
const { authenticate, requireRole } = require('../middlewares/auth');
const { USER_ROLE } = require('../config');

const router = new Router({ prefix: '/api/prescriptions' });

router.get('/', authenticate, prescriptionController.getList);
router.get('/statistics', authenticate, reviewController.getStatistics);
router.get('/:id', authenticate, prescriptionController.getDetail);
router.get('/:id/review-records', authenticate, reviewController.getReviewRecords);
router.get('/:id/check-conflicts', authenticate, drugConflictController.checkPrescription);
router.post('/', authenticate, requireRole(USER_ROLE.DOCTOR, USER_ROLE.ADMIN), prescriptionController.create);
router.put('/:id', authenticate, requireRole(USER_ROLE.DOCTOR, USER_ROLE.ADMIN), prescriptionController.update);
router.post('/:id/submit-review', authenticate, requireRole(USER_ROLE.DOCTOR, USER_ROLE.ADMIN), prescriptionController.submitForReview);
router.post('/:id/first-review', authenticate, requireRole(USER_ROLE.PHARMACIST, USER_ROLE.SENIOR_PHARMACIST, USER_ROLE.ADMIN), reviewController.firstReview);
router.post('/:id/second-review', authenticate, requireRole(USER_ROLE.SENIOR_PHARMACIST, USER_ROLE.ADMIN), reviewController.secondReview);
router.delete('/:id', authenticate, requireRole(USER_ROLE.ADMIN), prescriptionController.delete);

module.exports = router;
