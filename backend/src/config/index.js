module.exports = {
  PRESCRIPTION_STATUS: {
    DRAFT: 'draft',
    PENDING_FIRST_REVIEW: 'pending_first_review',
    FIRST_REVIEW_PASSED: 'first_review_passed',
    FIRST_REVIEW_REJECTED: 'first_review_rejected',
    PENDING_SECOND_REVIEW: 'pending_second_review',
    SECOND_REVIEW_PASSED: 'second_review_passed',
    SECOND_REVIEW_REJECTED: 'second_review_rejected',
    DISPENSED: 'dispensed'
  },

  PRESCRIPTION_STATUS_LABEL: {
    draft: '草稿',
    pending_first_review: '待一审',
    first_review_passed: '一审通过',
    first_review_rejected: '一审驳回',
    pending_second_review: '待二审',
    second_review_passed: '二审通过',
    second_review_rejected: '二审驳回',
    dispensed: '已发药'
  },

  REVIEW_TYPE: {
    FIRST: 'first',
    SECOND: 'second'
  },

  REVIEW_RESULT: {
    PASSED: 'passed',
    REJECTED: 'rejected'
  },

  CONFLICT_SEVERITY: {
    WARNING: 'warning',
    DANGER: 'danger'
  }
};
