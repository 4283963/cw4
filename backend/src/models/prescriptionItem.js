const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PrescriptionItem = sequelize.define('PrescriptionItem', {
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
  drugId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '药品ID'
  },
  drugName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '药品名称'
  },
  drugCode: {
    type: DataTypes.STRING(50),
    comment: '药品编码'
  },
  specification: {
    type: DataTypes.STRING(200),
    comment: '规格'
  },
  dosage: {
    type: DataTypes.STRING(100),
    comment: '用法用量'
  },
  frequency: {
    type: DataTypes.STRING(50),
    comment: '频次'
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '数量'
  },
  unit: {
    type: DataTypes.STRING(20),
    comment: '单位'
  },
  daysSupply: {
    type: DataTypes.INTEGER,
    comment: '用药天数'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '单价'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '小计金额'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
  }
}, {
  tableName: 'prescription_items',
  timestamps: true,
  indexes: [
    { fields: ['prescriptionId'] },
    { fields: ['drugId'] }
  ]
});

module.exports = PrescriptionItem;
