const UserService = require('../services/userService');
const { success, error, paginate } = require('../utils/response');

const ApprovalController = {
  // 获取待审核用户列表
  async getPending(req, res, next) {
    try {
      let department_id = null;
      if (req.user.role === 'dept_manager') {
        department_id = req.user.department_id;
      }

      const result = await UserService.getPendingUsers(department_id);
      success(res, paginate(result.list, 1, 100, result.total));
    } catch (err) { next(err); }
  },

  // 批准用户
  async approve(req, res, next) {
    try {
      const result = await UserService.approve(req.params.id, req.body);
      success(res, result, '用户已批准');
    } catch (err) { next(err); }
  },

  // 拒绝用户
  async reject(req, res, next) {
    try {
      await UserService.reject(req.params.id);
      success(res, null, '用户已拒绝');
    } catch (err) { next(err); }
  }
};

module.exports = ApprovalController;
