const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Drug = sequelize.define('Drug', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '药品名称'
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true,
    comment: '药品编码'
  },
  category: {
    type: DataTypes.STRING(100),
    comment: '药品分类'
  },
  specification: {
    type: DataTypes.STRING(200),
    comment: '规格'
  },
  manufacturer: {
    type: DataTypes.STRING(200),
    comment: '生产厂家'
  },
  unit: {
    type: DataTypes.STRING(20),
    comment: '单位'
  },
  dosage: {
    type: DataTypes.STRING(100),
    comment: '用法用量'
  },
  contraindications: {
    type: DataTypes.TEXT,
    comment: '禁忌症'
  },
  sideEffects: {
    type: DataTypes.TEXT,
    comment: '不良反应'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'drugs',
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['code'] }
  ]
});

module.exports = Drug;
