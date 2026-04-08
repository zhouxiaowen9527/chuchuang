const UserModel = require('../models/user');
const DepartmentModel = require('../models/department');
const { USER_STATUS, ROLES } = require('../config/constants');
const validators = require('../utils/validators');

const UserService = {
  async getList(query) {
    const { page, pageSize, offset } = validators.parsePagination(query);
    return UserModel.findList({
      department_id: query.department_id,
      role: query.role,
      status: query.status,
      keyword: query.keyword,
      page, pageSize, offset
    });
  },

  async getById(id) {
    return UserModel.findById(id);
  },

  async updateProfile(id, data) {
    const fields = {};
    if (data.real_name) fields.real_name = data.real_name;
    if (data.phone) fields.phone = data.phone;
    if (data.id_card !== undefined) fields.id_card = data.id_card;
    if (data.bank_name !== undefined) fields.bank_name = data.bank_name;
    if (data.bank_card !== undefined) fields.bank_card = data.bank_card;
    if (data.bank_bank !== undefined) fields.bank_bank = data.bank_bank;

    return UserModel.update(id, fields);
  },

  async updateUser(id, data) {
    console.log('updateUser received data:', data); // 调试日志
    const fields = {};
    if (data.real_name !== undefined) fields.real_name = data.real_name;
    if (data.phone !== undefined) fields.phone = data.phone;
    if (data.id_card !== undefined) fields.id_card = data.id_card;
    if (data.bank_name !== undefined) fields.bank_name = data.bank_name;
    if (data.bank_card !== undefined) fields.bank_card = data.bank_card;
    if (data.bank_bank !== undefined) fields.bank_bank = data.bank_bank;
    if (data.department_id !== undefined) fields.department_id = data.department_id;
    if (data.role !== undefined) fields.role = data.role;
    if (data.status !== undefined) fields.status = data.status;
    if (data.password) {
      const { hashPassword } = require('../utils/crypto');
      fields.password_hash = await hashPassword(data.password);
    }
    console.log('fields to update:', fields); // 调试日志
    const result = await UserModel.update(id, fields);
    console.log('update result:', result); // 调试日志
    return result;
  },

  async approve(userId, data) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('用户不存在');
    if (user.status !== USER_STATUS.PENDING) throw new Error('该用户已审核');

    const fields = {
      status: USER_STATUS.APPROVED,
      real_name: data.real_name || user.real_name,
      phone: data.phone || user.phone,
      department_id: data.department_id || user.department_id,
      role: data.role || user.role
    };

    if (data.id_card !== undefined) fields.id_card = data.id_card;
    if (data.bank_name !== undefined) fields.bank_name = data.bank_name;
    if (data.bank_card !== undefined) fields.bank_card = data.bank_card;
    if (data.bank_bank !== undefined) fields.bank_bank = data.bank_bank;

    return UserModel.update(userId, fields);
  },

  async reject(userId) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('用户不存在');
    if (user.status !== USER_STATUS.PENDING) throw new Error('该用户已审核');
    return UserModel.delete(userId);
  },

  async createUser(data) {
    const { hashPassword } = require('../utils/crypto');
    const password_hash = await hashPassword(data.password || '123456');

    return UserModel.create({
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
      status: USER_STATUS.APPROVED
    });
  },

  async deleteUser(id) {
    return UserModel.delete(id);
  },

  async getPendingUsers(department_id) {
    return UserModel.findList({
      status: USER_STATUS.PENDING,
      department_id,
      page: 1,
      pageSize: 100,
      offset: 0
    });
  }
};

module.exports = UserService;