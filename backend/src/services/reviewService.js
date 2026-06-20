const { Prescription, ReviewRecord, sequelize } = require('../models');
const { PRESCRIPTION_STATUS, REVIEW_TYPE, REVIEW_RESULT, CONFLICT_SEVERITY } = require('../config');
const drugConflictService = require('./drugConflictService');

class ReviewService {
  async firstReview(prescriptionId, data) {
    const prescription = await Prescription.findByPk(prescriptionId);
    if (!prescription) {
      throw new Error('处方不存在');
    }

    if (prescription.status !== PRESCRIPTION_STATUS.PENDING_FIRST_REVIEW) {
      throw new Error('当前处方状态不允许一审');
    }

    const conflictResult = await drugConflictService.checkPrescriptionConflicts(prescriptionId);
    const { result, comment, reviewerId, reviewerName } = data;

    if (result === REVIEW_RESULT.PASSED && conflictResult.hasDanger) {
      const error = new Error('处方存在严重药物配伍禁忌，无法通过审核，请先处理配伍问题或驳回处方');
      error.status = 400;
      error.drugConflicts = conflictResult;
      throw error;
    }

    const transaction = await sequelize.transaction();

    try {
      const updateData = {
        firstReviewerId: reviewerId,
        firstReviewerName: reviewerName,
        firstReviewComment: comment,
        firstReviewTime: new Date()
      };

      if (result === REVIEW_RESULT.PASSED) {
        updateData.status = PRESCRIPTION_STATUS.PENDING_SECOND_REVIEW;
      } else {
        updateData.status = PRESCRIPTION_STATUS.FIRST_REVIEW_REJECTED;
      }

      await prescription.update(updateData, { transaction });

      await ReviewRecord.create({
        prescriptionId,
        reviewType: REVIEW_TYPE.FIRST,
        reviewerId,
        reviewerName,
        reviewResult: result,
        reviewComment: comment,
        drugConflicts: conflictResult
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        status: updateData.status,
        conflictCheck: conflictResult
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async secondReview(prescriptionId, data) {
    const prescription = await Prescription.findByPk(prescriptionId);
    if (!prescription) {
      throw new Error('处方不存在');
    }

    if (prescription.status !== PRESCRIPTION_STATUS.PENDING_SECOND_REVIEW) {
      throw new Error('当前处方状态不允许二审');
    }

    const conflictResult = await drugConflictService.checkPrescriptionConflicts(prescriptionId);
    const { result, comment, reviewerId, reviewerName } = data;

    if (result === REVIEW_RESULT.PASSED && conflictResult.hasDanger) {
      const error = new Error('处方存在严重药物配伍禁忌，无法通过二审，请先处理配伍问题或驳回处方');
      error.status = 400;
      error.drugConflicts = conflictResult;
      throw error;
    }

    const transaction = await sequelize.transaction();

    try {
      const updateData = {
        secondReviewerId: reviewerId,
        secondReviewerName: reviewerName,
        secondReviewComment: comment,
        secondReviewTime: new Date()
      };

      if (result === REVIEW_RESULT.PASSED) {
        updateData.status = PRESCRIPTION_STATUS.SECOND_REVIEW_PASSED;
      } else {
        updateData.status = PRESCRIPTION_STATUS.SECOND_REVIEW_REJECTED;
      }

      await prescription.update(updateData, { transaction });

      await ReviewRecord.create({
        prescriptionId,
        reviewType: REVIEW_TYPE.SECOND,
        reviewerId,
        reviewerName,
        reviewResult: result,
        reviewComment: comment,
        drugConflicts: conflictResult
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        status: updateData.status,
        conflictCheck: conflictResult
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getReviewRecords(prescriptionId) {
    const records = await ReviewRecord.findAll({
      where: { prescriptionId },
      order: [['reviewedAt', 'ASC']]
    });
    return records;
  }

  async getReviewStatistics() {
    const total = await Prescription.count();
    const pendingFirst = await Prescription.count({
      where: { status: PRESCRIPTION_STATUS.PENDING_FIRST_REVIEW }
    });
    const pendingSecond = await Prescription.count({
      where: { status: PRESCRIPTION_STATUS.PENDING_SECOND_REVIEW }
    });
    const passed = await Prescription.count({
      where: { status: PRESCRIPTION_STATUS.SECOND_REVIEW_PASSED }
    });
    const rejected = await Prescription.count({
      where: {
        status: {
          [require('sequelize').Op.in]: [
            PRESCRIPTION_STATUS.FIRST_REVIEW_REJECTED,
            PRESCRIPTION_STATUS.SECOND_REVIEW_REJECTED
          ]
        }
      }
    });

    return {
      total,
      pendingFirst,
      pendingSecond,
      passed,
      rejected
    };
  }
}

module.exports = new ReviewService();
