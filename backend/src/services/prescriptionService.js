const { Op } = require('sequelize');
const { Prescription, PrescriptionItem, sequelize } = require('../models');
const { PRESCRIPTION_STATUS } = require('../config');
const drugConflictService = require('./drugConflictService');

class PrescriptionService {
  generatePrescriptionNo() {
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RX${dateStr}${random}`;
  }

  async getPrescriptionList(params = {}) {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      status,
      department,
      doctorName,
      startDate,
      endDate
    } = params;

    const where = {};

    if (keyword) {
      where[Op.or] = [
        { prescriptionNo: { [Op.like]: `%${keyword}%` } },
        { patientName: { [Op.like]: `%${keyword}%` } },
        { patientIdCard: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (department) {
      where.department = department;
    }

    if (doctorName) {
      where.doctorName = { [Op.like]: `%${doctorName}%` };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate + ' 23:59:59');
    }

    const { count, rows } = await Prescription.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize)
    });

    return {
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };
  }

  async getPrescriptionDetail(id) {
    const prescription = await Prescription.findByPk(id, {
      include: [
        {
          model: PrescriptionItem,
          as: 'items',
          order: [['sortOrder', 'ASC']]
        }
      ]
    });

    if (!prescription) {
      throw new Error('处方不存在');
    }

    const conflictResult = await drugConflictService.checkPrescriptionConflicts(id);

    return {
      ...prescription.toJSON(),
      conflictCheck: conflictResult
    };
  }

  async createPrescription(data) {
    const transaction = await sequelize.transaction();

    try {
      const prescription = await Prescription.create({
        ...data,
        prescriptionNo: this.generatePrescriptionNo(),
        status: data.status || PRESCRIPTION_STATUS.DRAFT
      }, { transaction });

      if (data.items && data.items.length > 0) {
        let sortOrder = 1;
        const itemsData = data.items.map(item => ({
          ...item,
          prescriptionId: prescription.id,
          sortOrder: sortOrder++
        }));
        await PrescriptionItem.bulkCreate(itemsData, { transaction });
      }

      await transaction.commit();
      return await this.getPrescriptionDetail(prescription.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updatePrescription(id, data) {
    const prescription = await Prescription.findByPk(id);
    if (!prescription) {
      throw new Error('处方不存在');
    }

    const allowedStatuses = [PRESCRIPTION_STATUS.DRAFT, PRESCRIPTION_STATUS.FIRST_REVIEW_REJECTED];
    if (!allowedStatuses.includes(prescription.status)) {
      throw new Error('当前处方状态不允许修改');
    }

    const transaction = await sequelize.transaction();

    try {
      if (data.items) {
        await PrescriptionItem.destroy({
          where: { prescriptionId: id },
          transaction
        });

        let sortOrder = 1;
        const itemsData = data.items.map(item => ({
          ...item,
          prescriptionId: id,
          sortOrder: sortOrder++
        }));
        await PrescriptionItem.bulkCreate(itemsData, { transaction });
      }

      const updateData = { ...data };
      delete updateData.items;
      delete updateData.id;
      delete updateData.prescriptionNo;
      delete updateData.status;

      await prescription.update(updateData, { transaction });
      await transaction.commit();
      return await this.getPrescriptionDetail(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async submitForFirstReview(id) {
    const prescription = await Prescription.findByPk(id);
    if (!prescription) {
      throw new Error('处方不存在');
    }

    if (prescription.status !== PRESCRIPTION_STATUS.DRAFT &&
        prescription.status !== PRESCRIPTION_STATUS.FIRST_REVIEW_REJECTED &&
        prescription.status !== PRESCRIPTION_STATUS.SECOND_REVIEW_REJECTED) {
      throw new Error('当前处方状态不允许提交审核');
    }

    const items = await PrescriptionItem.count({ where: { prescriptionId: id } });
    if (items === 0) {
      throw new Error('处方明细为空，无法提交审核');
    }

    await prescription.update({
      status: PRESCRIPTION_STATUS.PENDING_FIRST_REVIEW
    });

    return await this.getPrescriptionDetail(id);
  }

  async deletePrescription(id) {
    const prescription = await Prescription.findByPk(id);
    if (!prescription) {
      throw new Error('处方不存在');
    }

    const allowedStatuses = [PRESCRIPTION_STATUS.DRAFT, PRESCRIPTION_STATUS.FIRST_REVIEW_REJECTED];
    if (!allowedStatuses.includes(prescription.status)) {
      throw new Error('当前处方状态不允许删除');
    }

    await prescription.destroy();
    return { success: true };
  }
}

module.exports = new PrescriptionService();
