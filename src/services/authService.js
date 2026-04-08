const UserModel = require('../models/user');
const { hashPassword, comparePassword } = require('../utils/crypto');
const { generateToken } = require('../config/auth');
const { ROLES, USER_STATUS } = require('../config/constants');

const AuthService = {
  // 注册
  async register(data) {
    // 检查邮箱是否已存在
    const existing = await UserModel.findByEmail(data.email);
    if (existing) throw new Error('该邮箱已被注册');

    const password_hash = await hashPassword(data.password);

    const user = await UserModel.create({
      email: data.email,
      password_hash,
      real_name: data.real_name,
      phone: data.phone,
      id_card: data.id_card || null,
      bank_name: data.bank_name || null,
      bank_card: data.bank_card || null,
      bank_bank: data.bank_bank || null,
      department_id: data.department_id || null,
      role: data.role || ROLES.EMPLOYEE,
      status: USER_STATUS.PENDING
    });

    // 记录审计日志（由中间件处理）
    return user;
  },

  // 登录
  async login(email, password) {
    const user = await UserModel.findByEmail(email);
    if (!user) throw new Error('邮箱或密码错误');

    if (user.status !== USER_STATUS.APPROVED) {
      throw new Error('账号尚未审核通过，请联系管理员');
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) throw new Error('邮箱或密码错误');

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        real_name: user.real_name,
        role: user.role,
        department_id: user.department_id
      }
    };
  },

  // 修改密码
  async changePassword(userId, oldPassword, newPassword) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('用户不存在');

    const valid = await comparePassword(oldPassword, user.password_hash);
    if (!valid) throw new Error('原密码错误');

    const newHash = await hashPassword(newPassword);
    await UserModel.update(userId, { password_hash: newHash });
    return true;
  },

  // 重置密码（管理员操作）
  async resetPassword(userId, newPassword) {
    const newHash = await hashPassword(newPassword);
    await UserModel.update(userId, { password_hash: newHash });
    return true;
  }
};

module.exports = AuthService;
