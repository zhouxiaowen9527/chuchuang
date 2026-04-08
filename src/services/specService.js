const SpecModel = require('../models/spec');
const validators = require('../utils/validators');

const SpecService = {
  async getList(query) {
    const { page, pageSize, offset } = validators.parsePagination(query);
    return SpecModel.findList({
      department_id: query.department_id,
      is_active: query.is_active !== undefined ? query.is_active === 'true' : undefined,
      keyword: query.keyword,
      page, pageSize, offset
    });
  },

  async getActive(department_id) {
    return SpecModel.findActive(department_id);
  },

  async getById(id) {
    return SpecModel.findById(id);
  },

  async create(data) {
    if (!data.department_id) throw new Error('请选择部门');
    if (!validators.isNonEmpty(data.name)) throw new Error('规格名称不能为空');
    if (!validators.isNonEmpty(data.unit)) throw new Error('单位不能为空');
    if (!validators.isPositive(data.unit_price)) throw new Error('单价必须大于0');

    return SpecModel.create({
      department_id: data.department_id,
      name: data.name,
      code: data.code || null,
      unit: data.unit,
      unit_price: data.unit_price,
      description: data.description || null
    });
  },

  async update(id, data) {
    return SpecModel.update(id, data);
  },

  async toggleActive(id) {
    return SpecModel.toggleActive(id);
  },

  async delete(id) {
    return SpecModel.delete(id);
  },

  async countAll() {
    return SpecModel.countAll();
  }
};

module.exports = SpecService;
