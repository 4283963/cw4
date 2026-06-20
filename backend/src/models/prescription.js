const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { PRESCRIPTION_STATUS } = require('../config');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  prescriptionNo: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    comment: '处方编号'
  },
  patientName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '患者姓名'
  },
  patientGender: {
    type: DataTypes.ENUM('male', 'female', 'unknown'),
    defaultValue: 'unknown',
    comment: '患者性别'
  },
  patientAge: {
    type: DataTypes.INTEGER,
    comment: '患者年龄'
  },
  patientIdCard: {
    type: DataTypes.STRING(30),
    comment: '患者身份证号'
  },
  department: {
    type: DataTypes.STRING(100),
    comment: '就诊科室'
  },
  diagnosis: {
    type: DataTypes.TEXT,
    comment: '诊断'
  },
  doctorId: {
    type: DataTypes.UUID,
    comment: '开具医生ID'
  },
  doctorName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '开具医生姓名'
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(PRESCRIPTION_STATUS),
    defaultValue: PRESCRIPTION_STATUS.DRAFT,
    comment: '处方状态'
  },
  firstReviewerId: {
    type: DataTypes.UUID,
    comment: '一审药师ID'
  },
  firstReviewerName: {
    type: DataTypes.STRING(50),
    comment: '一审药师姓名'
  },
  firstReviewTime: {
    type: DataTypes.DATE,
    comment: '一审时间'
  },
  firstReviewComment: {
    type: DataTypes.TEXT,
    comment: '一审意见'
  },
  secondReviewerId: {
    type: DataTypes.UUID,
    comment: '二审药师ID'
  },
  secondReviewerName: {
    type: DataTypes.STRING(50),
    comment: '二审药师姓名'
  },
  secondReviewTime: {
    type: DataTypes.DATE,
    comment: '二审时间'
  },
  secondReviewComment: {
    type: DataTypes.TEXT,
    comment: '二审意见'
  },
  remark: {
    type: DataTypes.TEXT,
    comment: '备注'
  }
}, {
  tableName: 'prescriptions',
  timestamps: true,
  indexes: [
    { fields: ['prescriptionNo'] },
    { fields: ['status'] },
    { fields: ['patientName'] },
    { fields: ['doctorId'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Prescription;
