const drugConflictService = require('../services/drugConflictService');

class DrugConflictController {
  async checkPrescription(ctx) {
    const { prescriptionId } = ctx.params;
    const result = await drugConflictService.checkPrescriptionConflicts(prescriptionId);
    ctx.body = result;
  }

  async checkDrugIds(ctx) {
    const { drugIds } = ctx.request.body;
    if (!Array.isArray(drugIds)) {
      ctx.status = 400;
      throw new Error('drugIds 必须是数组');
    }
    const result = await drugConflictService.checkDrugIdsConflicts(drugIds);
    ctx.body = result;
  }

  async getList(ctx) {
    const query = ctx.query;
    const result = await drugConflictService.getAllConflicts(query);
    ctx.body = result;
  }

  async create(ctx) {
    const data = ctx.request.body;
    if (!data.drugAId || !data.drugBId || !data.description) {
      ctx.status = 400;
      throw new Error('药品A、药品B和冲突描述为必填项');
    }
    const result = await drugConflictService.addConflict(data);
    ctx.status = 201;
    ctx.body = result;
  }
}

module.exports = new DrugConflictController();
