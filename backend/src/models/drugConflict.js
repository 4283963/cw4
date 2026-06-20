const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { CONFLICT_SEVERITY } = require('../config');

const DrugConflict = sequelize.define('DrugConflict', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  drugAId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '药品A ID'
  },
  drugAName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '药品A名称'
  },
  drugBId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '药品B ID'
  },
  drugBName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '药品B名称'
  },
  conflictType: {
    type: DataTypes.STRING(100),
    comment: '冲突类型（配伍禁忌、重复用药、剂量冲突等）'
  },
  severity: {
    type: DataTypes.ENUM,
    values: Object.values(CONFLICT_SEVERITY),
    defaultValue: CONFLICT_SEVERITY.WARNING,
    comment: '严重程度'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '冲突描述'
  },
  evidence: {
    type: DataTypes.TEXT,
    comment: '证据来源'
  },
  suggestion: {
    type: DataTypes.TEXT,
    comment: '处理建议'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'drug_conflicts',
  timestamps: true,
  indexes: [
    { fields: ['drugAId', 'drugBId'] },
    { fields: ['severity'] }
  ]
});

module.exports = DrugConflict;
