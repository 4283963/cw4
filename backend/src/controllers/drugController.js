const drugService = require('../services/drugService');

class DrugController {
  async getList(ctx) {
    const query = ctx.query;
    const result = await drugService.getDrugList(query);
    ctx.body = result;
  }

  async getDetail(ctx) {
    const { id } = ctx.params;
    const result = await drugService.getDrugById(id);
    if (!result) {
      ctx.status = 404;
      throw new Error('药品不存在');
    }
    ctx.body = result;
  }

  async create(ctx) {
    const data = ctx.request.body;
    if (!data.name || !data.code) {
      ctx.status = 400;
      throw new Error('药品名称和编码为必填项');
    }
    const result = await drugService.createDrug(data);
    ctx.status = 201;
    ctx.body = result;
  }
}

module.exports = new DrugController();
