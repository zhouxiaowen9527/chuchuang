const UserModel = require('../models/user');
const { hashPassword, comparePassword } = require('../utils/crypto');
const { generateToken } = require('../config/auth');
const { ROLES, USER_STATUS } = require('../config/constants');

// 登录失败记录（内存存储，生产环境建议用 Redis）
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15分钟

// 清理过期的锁定记录
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of loginAttempts.entries()) {
    if (value.lockUntil && value.lockUntil < now) {
      loginAttempts.delete(key);
    }
  }
}, 60 * 1000); // 每分钟清理一次

const AuthService = {
  // 检查账户是否被锁定
  isAccountLocked(email) {
    const attempt = loginAttempts.get(email);
    if (!attempt) return { locked: false };
    
    if (attempt.lockUntil && attempt.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((attempt.lockUntil - Date.now()) / 60000);
      return { locked: true, remainingMinutes };
    }
    
    return { locked: false };
  },

  // 记录登录失败
  recordFailedAttempt(email) {
    const attempt = loginAttempts.get(email) || { count: 0 };
    attempt.count++;
    attempt.lastAttempt = Date.now();
    
    if (attempt.count >= MAX_ATTEMPTS) {
      attempt.lockUntil = Date.now() + LOCK_TIME;
    }
    
    loginAttempts.set(email, attempt);
    return attempt;
  },

  // 清除失败记录
  clearFailedAttempts(email) {
    loginAttempts.delete(email);
  },

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

  // 登录（带失败限制）
  async login(email, password) {
    // 检查账户是否被锁定
    const lockStatus = this.isAccountLocked(email);
    if (lockStatus.locked) {
      throw new Error(`账户已被锁定，请在 ${lockStatus.remainingMinutes} 分钟后重试`);
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      const attempt = this.recordFailedAttempt(email);
      const remaining = MAX_ATTEMPTS - attempt.count;
      if (remaining > 0) {
        throw new Error(`邮箱或密码错误，还剩 ${remaining} 次尝试机会`);
      }
      throw new Error('邮箱或密码错误');
    }

    if (user.status !== USER_STATUS.APPROVED) {
      throw new Error('账号尚未审核通过，请联系管理员');
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      const attempt = this.recordFailedAttempt(email);
      const remaining = MAX_ATTEMPTS - attempt.count;
      if (remaining > 0) {
        throw new Error(`邮箱或密码错误，还剩 ${remaining} 次尝试机会`);
      }
      throw new Error('登录失败次数过多，账户已被锁定15分钟');
    }

    // 登录成功，清除失败记录
    this.clearFailedAttempts(email);

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
