const sequelize = require('../config/database');

const Drug = require('./drug');
const Prescription = require('./prescription');
const PrescriptionItem = require('./prescriptionItem');
const DrugConflict = require('./drugConflict');
const ReviewRecord = require('./reviewRecord');
const User = require('./user');

Prescription.hasMany(PrescriptionItem, {
  foreignKey: 'prescriptionId',
  as: 'items',
  onDelete: 'CASCADE'
});

PrescriptionItem.belongsTo(Prescription, {
  foreignKey: 'prescriptionId',
  as: 'prescription'
});

PrescriptionItem.belongsTo(Drug, {
  foreignKey: 'drugId',
  as: 'drug'
});

Prescription.hasMany(ReviewRecord, {
  foreignKey: 'prescriptionId',
  as: 'reviewRecords',
  onDelete: 'CASCADE'
});

ReviewRecord.belongsTo(Prescription, {
  foreignKey: 'prescriptionId',
  as: 'prescription'
});

ReviewRecord.belongsTo(User, {
  foreignKey: 'reviewerId',
  as: 'reviewer'
});

module.exports = {
  sequelize,
  Drug,
  Prescription,
  PrescriptionItem,
  DrugConflict,
  ReviewRecord,
  User
};
