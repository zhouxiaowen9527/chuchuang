const AuthService = require('../services/authService');
const validators = require('../utils/validators');
const { success, error, unauthorized } = require('../utils/response');

const AuthController = {
  async register(req, res, next) {
    try {
      const errors = validators.validateRegistration(req.body);
      if (errors.length > 0) return error(res, errors.join('；'));

      const user = await AuthService.register(req.body);
      success(res, { id: user.id }, '注册成功，请等待管理员审核', 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return error(res, '邮箱和密码不能为空');

      const result = await AuthService.login(email, password);
      success(res, result, '登录成功');
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { old_password, new_password } = req.body;
      if (!old_password || !new_password) return error(res, '请输入原密码和新密码');
      if (!validators.isPassword(new_password)) return error(res, validators.getPasswordRequirement());

      await AuthService.changePassword(req.user.id, old_password, new_password);
      success(res, null, '密码修改成功');
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await require('../services/userService').getById(req.user.id);
      success(res, user);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const result = await require('../services/userService').updateProfile(req.user.id, req.body);
      success(res, result, '个人信息已更新');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AuthController;
