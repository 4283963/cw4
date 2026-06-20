const { Op } = require('sequelize');
const { DrugConflict, PrescriptionItem } = require('../models');
const { CONFLICT_SEVERITY } = require('../config');

class DrugConflictService {
  async checkPrescriptionConflicts(prescriptionId) {
    const items = await PrescriptionItem.findAll({
      where: { prescriptionId },
      attributes: ['drugId', 'drugName', 'drugCode']
    });

    if (!items || items.length < 2) {
      return {
        hasConflicts: false,
        conflicts: [],
        dangerCount: 0,
        warningCount: 0
      };
    }

    const drugIds = items.map(item => item.drugId);
    const conflicts = [];

    for (let i = 0; i < drugIds.length; i++) {
      for (let j = i + 1; j < drugIds.length; j++) {
        const drugAId = drugIds[i];
        const drugBId = drugIds[j];

        const foundConflict = await DrugConflict.findOne({
          where: {
            isActive: true,
            [Op.or]: [
              { drugAId: drugAId, drugBId: drugBId },
              { drugAId: drugBId, drugBId: drugAId }
            ]
          },
          attributes: [
            'id', 'conflictType', 'severity', 'description',
            'evidence', 'suggestion', 'drugAId', 'drugAName',
            'drugBId', 'drugBName'
          ]
        });

        if (foundConflict) {
          conflicts.push(foundConflict.toJSON());
        }
      }
    }

    const dangerCount = conflicts.filter(c => c.severity === CONFLICT_SEVERITY.DANGER).length;
    const warningCount = conflicts.filter(c => c.severity === CONFLICT_SEVERITY.WARNING).length;

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      dangerCount,
      warningCount,
      hasDanger: dangerCount > 0
    };
  }

  async checkDrugIdsConflicts(drugIds) {
    if (!drugIds || drugIds.length < 2) {
      return {
        hasConflicts: false,
        conflicts: [],
        dangerCount: 0,
        warningCount: 0
      };
    }

    const conflicts = [];

    for (let i = 0; i < drugIds.length; i++) {
      for (let j = i + 1; j < drugIds.length; j++) {
        const drugAId = drugIds[i];
        const drugBId = drugIds[j];

        const foundConflict = await DrugConflict.findOne({
          where: {
            isActive: true,
            [Op.or]: [
              { drugAId: drugAId, drugBId: drugBId },
              { drugAId: drugBId, drugBId: drugAId }
            ]
          },
          attributes: [
            'id', 'conflictType', 'severity', 'description',
            'evidence', 'suggestion', 'drugAId', 'drugAName',
            'drugBId', 'drugBName'
          ]
        });

        if (foundConflict) {
          conflicts.push(foundConflict.toJSON());
        }
      }
    }

    const dangerCount = conflicts.filter(c => c.severity === CONFLICT_SEVERITY.DANGER).length;
    const warningCount = conflicts.filter(c => c.severity === CONFLICT_SEVERITY.WARNING).length;

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      dangerCount,
      warningCount,
      hasDanger: dangerCount > 0
    };
  }

  async getAllConflicts(params = {}) {
    const { page = 1, pageSize = 20, keyword, severity } = params;
    const where = { isActive: true };

    if (severity) {
      where.severity = severity;
    }

    if (keyword) {
      where[Op.or] = [
        { drugAName: { [Op.like]: `%${keyword}%` } },
        { drugBName: { [Op.like]: `%${keyword}%` } },
        { conflictType: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await DrugConflict.findAndCountAll({
      where,
      order: [['severity', 'DESC'], ['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });

    return {
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };
  }

  async addConflict(data) {
    return await DrugConflict.create(data);
  }
}

module.exports = new DrugConflictService();
