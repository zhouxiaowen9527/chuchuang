const SpecService = require('../services/specService');
const { success, error, paginate } = require('../utils/response');

const SpecController = {
  async list(req, res, next) {
    try {
      const result = await SpecService.getList(req.query);
      success(res, paginate(result.list, req.query.page || 1, req.query.pageSize || 20, result.total));
    } catch (err) { next(err); }
  },

  async active(req, res, next) {
    try {
      const list = await SpecService.getActive(req.query.department_id);
      success(res, list);
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const spec = await SpecService.getById(req.params.id);
      if (!spec) return error(res, '计件规格不存在', 404);
      success(res, spec);
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const result = await SpecService.create(req.body);
      success(res, result, '计件规格创建成功', 201);
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const result = await SpecService.update(req.params.id, req.body);
      success(res, result, '计件规格已更新');
    } catch (err) { next(err); }
  },

  async toggleActive(req, res, next) {
    try {
      const result = await SpecService.toggleActive(req.params.id);
      success(res, result, result.is_active ? '已启用' : '已禁用');
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await SpecService.delete(req.params.id);
      success(res, null, '计件规格已删除');
    } catch (err) { next(err); }
  }
};

module.exports = SpecController;
