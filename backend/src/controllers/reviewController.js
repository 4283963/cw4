const reviewService = require('../services/reviewService');
const { REVIEW_RESULT } = require('../config');

class ReviewController {
  async firstReview(ctx) {
    const { id } = ctx.params;
    const data = ctx.request.body;

    if (!data.reviewerId || !data.reviewerName) {
      ctx.status = 400;
      throw new Error('审核人信息不完整');
    }
    if (!data.result || !Object.values(REVIEW_RESULT).includes(data.result)) {
      ctx.status = 400;
      throw new Error('审核结果无效');
    }

    try {
      const result = await reviewService.firstReview(id, data);
      ctx.body = result;
    } catch (error) {
      ctx.status = error.status || 400;
      ctx.body = {
        success: false,
        message: error.message,
        data: error.drugConflicts || null
      };
    }
  }

  async secondReview(ctx) {
    const { id } = ctx.params;
    const data = ctx.request.body;

    if (!data.reviewerId || !data.reviewerName) {
      ctx.status = 400;
      throw new Error('审核人信息不完整');
    }
    if (!data.result || !Object.values(REVIEW_RESULT).includes(data.result)) {
      ctx.status = 400;
      throw new Error('审核结果无效');
    }

    try {
      const result = await reviewService.secondReview(id, data);
      ctx.body = result;
    } catch (error) {
      ctx.status = error.status || 400;
      ctx.body = {
        success: false,
        message: error.message,
        data: error.drugConflicts || null
      };
    }
  }

  async getReviewRecords(ctx) {
    const { id } = ctx.params;
    const result = await reviewService.getReviewRecords(id);
    ctx.body = result;
  }

  async getStatistics(ctx) {
    const result = await reviewService.getReviewStatistics();
    ctx.body = result;
  }
}

module.exports = new ReviewController();
