const prescriptionService = require('../services/prescriptionService');

class PrescriptionController {
  async getList(ctx) {
    const query = ctx.query;
    const result = await prescriptionService.getPrescriptionList(query);
    ctx.body = result;
  }

  async getDetail(ctx) {
    const { id } = ctx.params;
    const result = await prescriptionService.getPrescriptionDetail(id);
    ctx.body = result;
  }

  async create(ctx) {
    const data = ctx.request.body;
    if (!data.patientName || !data.doctorName) {
      ctx.status = 400;
      throw new Error('患者姓名和医生姓名为必填项');
    }
    if (!data.items || data.items.length === 0) {
      ctx.status = 400;
      throw new Error('处方明细不能为空');
    }
    const result = await prescriptionService.createPrescription(data);
    ctx.status = 201;
    ctx.body = result;
  }

  async update(ctx) {
    const { id } = ctx.params;
    const data = ctx.request.body;
    const result = await prescriptionService.updatePrescription(id, data);
    ctx.body = result;
  }

  async submitForReview(ctx) {
    const { id } = ctx.params;
    const result = await prescriptionService.submitForFirstReview(id);
    ctx.body = result;
  }

  async delete(ctx) {
    const { id } = ctx.params;
    await prescriptionService.deletePrescription(id);
    ctx.body = { success: true };
  }
}

module.exports = new PrescriptionController();
