export const PRESCRIPTION_STATUS = {
  DRAFT: 'draft',
  PENDING_FIRST_REVIEW: 'pending_first_review',
  FIRST_REVIEW_PASSED: 'first_review_passed',
  FIRST_REVIEW_REJECTED: 'first_review_rejected',
  PENDING_SECOND_REVIEW: 'pending_second_review',
  SECOND_REVIEW_PASSED: 'second_review_passed',
  SECOND_REVIEW_REJECTED: 'second_review_rejected',
  DISPENSED: 'dispensed'
};

export const PRESCRIPTION_STATUS_OPTIONS = [
  { value: PRESCRIPTION_STATUS.DRAFT, label: '草稿', type: 'info' },
  { value: PRESCRIPTION_STATUS.PENDING_FIRST_REVIEW, label: '待一审', type: 'warning' },
  { value: PRESCRIPTION_STATUS.FIRST_REVIEW_PASSED, label: '一审通过', type: 'primary' },
  { value: PRESCRIPTION_STATUS.FIRST_REVIEW_REJECTED, label: '一审驳回', type: 'danger' },
  { value: PRESCRIPTION_STATUS.PENDING_SECOND_REVIEW, label: '待二审', type: 'warning' },
  { value: PRESCRIPTION_STATUS.SECOND_REVIEW_PASSED, label: '二审通过', type: 'success' },
  { value: PRESCRIPTION_STATUS.SECOND_REVIEW_REJECTED, label: '二审驳回', type: 'danger' },
  { value: PRESCRIPTION_STATUS.DISPENSED, label: '已发药', type: 'success' }
];

export const PRESCRIPTION_STATUS_MAP = PRESCRIPTION_STATUS_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item;
  return acc;
}, {});

export const CONFLICT_SEVERITY = {
  WARNING: 'warning',
  DANGER: 'danger'
};

export const CONFLICT_SEVERITY_OPTIONS = [
  { value: CONFLICT_SEVERITY.WARNING, label: '警告', type: 'warning' },
  { value: CONFLICT_SEVERITY.DANGER, label: '严重', type: 'danger' }
];

export const CONFLICT_SEVERITY_MAP = CONFLICT_SEVERITY_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item;
  return acc;
}, {});

export const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'unknown', label: '未知' }
];

export const REVIEW_RESULT = {
  PASSED: 'passed',
  REJECTED: 'rejected'
};
