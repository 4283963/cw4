const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { REVIEW_TYPE, REVIEW_RESULT } = require('../config');

const ReviewRecord = sequelize.define('ReviewRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  prescriptionId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '处方ID'
  },
  reviewType: {
    type: DataTypes.ENUM,
    values: Object.values(REVIEW_TYPE),
    allowNull: false,
    comment: '审核类型'
  },
  reviewerId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '审核人ID'
  },
  reviewerName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '审核人姓名'
  },
  reviewResult: {
    type: DataTypes.ENUM,
    values: Object.values(REVIEW_RESULT),
    allowNull: false,
    comment: '审核结果'
  },
  reviewComment: {
    type: DataTypes.TEXT,
    comment: '审核意见'
  },
  drugConflicts: {
    type: DataTypes.JSONB,
    comment: '检测到的药物冲突'
  },
  reviewedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '审核时间'
  }
}, {
  tableName: 'review_records',
  timestamps: true,
  indexes: [
    { fields: ['prescriptionId'] },
    { fields: ['reviewType'] },
    { fields: ['reviewerId'] }
  ]
});

module.exports = ReviewRecord;
