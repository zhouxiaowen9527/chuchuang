const GroupModel = require('../models/group');

const GroupService = {
  async getList(query) {
    const { page, pageSize, offset } = require('../utils/validators').parsePagination(query);
    return GroupModel.findList({
      department_id: query.department_id,
      keyword: query.keyword,
      page, pageSize, offset
    });
  },

  async getByDepartment(department_id) {
    return GroupModel.findByDepartment(department_id);
  },

  async getById(id) {
    return GroupModel.findById(id);
  },

  async create(data) {
    if (!data.department_id) throw new Error('请选择部门');
    if (!data.member_ids || data.member_ids.length < 1) throw new Error('小组成员至少1人');
    if (data.member_ids.length > 4) throw new Error('小组成员最多4人');

    // 自动生成小组名称：成员名+组
    const userQueries = data.member_ids.map(uid =>
      require('../config/database').query('SELECT real_name FROM users WHERE id = $1', [uid])
    );
    const userResults = await Promise.all(userQueries);
    const names = userResults.map(r => r.rows[0]?.real_name).filter(Boolean);
    const groupName = names.join('+') + '组';

    return GroupModel.create({
      name: groupName,
      department_id: data.department_id,
      member_ids: data.member_ids
    });
  },

  async updateMembers(id, member_ids) {
    if (!member_ids || member_ids.length < 2) throw new Error('小组成员至少2人');
    if (member_ids.length > 4) throw new Error('小组成员最多4人');

    // 重新生成小组名称
    const userQueries = member_ids.map(uid =>
      require('../config/database').query('SELECT real_name FROM users WHERE id = $1', [uid])
    );
    const userResults = await Promise.all(userQueries);
    const names = userResults.map(r => r.rows[0]?.real_name).filter(Boolean);
    const groupName = names.join('+') + '组';

    const result = await GroupModel.updateMembers(id, member_ids);
    await GroupModel.updateName(id, groupName);
    return result;
  },

  async delete(id) {
    return GroupModel.delete(id);
  },

  async getMembers(id) {
    return GroupModel.getMembers(id);
  },

  async countAll() {
    return GroupModel.countAll();
  }
};

module.exports = GroupService;
