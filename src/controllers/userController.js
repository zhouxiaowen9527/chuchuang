const UserService = require('../services/userService');
const validators = require('../utils/validators');
const { success, error, paginate } = require('../utils/response');

const UserController = {
  async list(req, res, next) {
    try {
      const result = await UserService.getList(req.query);
      success(res, paginate(result.list, req.query.page || 1, req.query.pageSize || 20, result.total));
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const user = await UserService.getById(req.params.id);
      if (!user) return error(res, '用户不存在', 404);
      success(res, user);
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      if (!validators.isEmail(req.body.email)) return error(res, '邮箱格式不正确');
      if (!validators.isNonEmpty(req.body.real_name)) return error(res, '姓名不能为空');
      if (!validators.isPhone(req.body.phone)) return error(res, '手机号格式不正确');

      const user = await UserService.createUser(req.body);
      success(res, user, '用户创建成功', 201);
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const result = await UserService.updateUser(req.params.id, req.body);
      if (!result) {
        return error(res, '未找到用户或更新失败', 404);
      }
      success(res, result, '用户信息已更新');
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await UserService.deleteUser(req.params.id);
      success(res, null, '用户已删除');
    } catch (err) { next(err); }
  },

  async resetPassword(req, res, next) {
    try {
      const { new_password } = req.body;
      if (!validators.isPassword(new_password)) return error(res, '新密码至少6位');
      const authService = require('../services/authService');
      await authService.resetPassword(req.params.id, new_password);
      success(res, null, '密码已重置');
    } catch (err) { next(err); }
  }
};

module.exports = UserController;