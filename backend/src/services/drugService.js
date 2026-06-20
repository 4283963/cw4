const { Op } = require('sequelize');
const { Drug } = require('../models');

class DrugService {
  async getDrugList(params = {}) {
    const { page = 1, pageSize = 20, keyword, category } = params;
    const where = { isActive: true };

    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (category) {
      where.category = category;
    }

    const { count, rows } = await Drug.findAndCountAll({
      where,
      order: [['name', 'ASC']],
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

  async getDrugById(id) {
    return await Drug.findByPk(id);
  }

  async createDrug(data) {
    return await Drug.create(data);
  }
}

module.exports = new DrugService();
