const DepartmentService = require('../services/departmentService');
const { success, error } = require('../utils/response');

const DepartmentController = {
  // 获取部门列表（分页）
  async list(req, res, next) {
    try {
      const { page = 1, pageSize = 20, name = '' } = req.query;
      const { role, department_id } = req.user;
      const filters = { page, pageSize, name };
      // 部门经理只能看自己的部门
      if (role === 'dept_manager') {
        filters.id = department_id;
      }
      const result = await DepartmentService.getList(filters);
      success(res, result);
    } catch (err) {
      next(err);
    }
  },

  // 获取所有部门（无分页，用于下拉框）
  async getAll(req, res, next) {
    try {
      const { role, department_id } = req.user;
      let departments = await DepartmentService.getAll();
      // 部门经理只能看到自己的部门
      if (role === 'dept_manager') {
        departments = departments.filter(d => d.id === department_id);
      }
      success(res, departments);
    } catch (err) {
      next(err);
    }
  },

  // 获取单个部门
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const department = await DepartmentService.getById(id);
      if (!department) return error(res, '部门不存在', 404);
      success(res, department);
    } catch (err) {
      next(err);
    }
  },

  // 创建部门
  async create(req, res, next) {
    try {
      const { name, manager_id, description } = req.body;
      if (!name) return error(res, '部门名称不能为空', 400);
      const department = await DepartmentService.create({ name, manager_id, description });
      success(res, department, 201);
    } catch (err) {
      next(err);
    }
  },

  // 更新部门
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, manager_id, description } = req.body;
      const exists = await DepartmentService.getById(id);
      if (!exists) return error(res, '部门不存在', 404);
      const updated = await DepartmentService.update(id, { name, manager_id, description });
      success(res, updated);
    } catch (err) {
      next(err);
    }
  },

  // 删除部门
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const exists = await DepartmentService.getById(id);
      if (!exists) return error(res, '部门不存在', 404);
      await DepartmentService.delete(id);
      success(res, { message: '删除成功' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = DepartmentController;