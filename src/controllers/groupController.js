const GroupService = require('../services/groupService');
const { success, error, paginate } = require('../utils/response');

const GroupController = {
  async list(req, res, next) {
    try {
      const result = await GroupService.getList(req.query);
      success(res, paginate(result.list, req.query.page || 1, req.query.pageSize || 20, result.total));
    } catch (err) { next(err); }
  },

  async getByDepartment(req, res, next) {
    try {
      const list = await GroupService.getByDepartment(req.params.departmentId || req.query.department_id);
      success(res, list);
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const group = await GroupService.getById(req.params.id);
      if (!group) return error(res, '小组不存在', 404);
      success(res, group);
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const result = await GroupService.create(req.body);
      success(res, result, '小组创建成功', 201);
    } catch (err) { next(err); }
  },

  async updateMembers(req, res, next) {
    try {
      const result = await GroupService.updateMembers(req.params.id, req.body.member_ids);
      success(res, result, '小组成员已更新');
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await GroupService.delete(req.params.id);
      success(res, null, '小组已删除');
    } catch (err) { next(err); }
  }
};

module.exports = GroupController;
