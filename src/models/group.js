const db = require('../config/database');

const GroupModel = {
  async findById(id) {
    const { rows } = await db.query(
      `SELECT g.*, d.name as department_name
       FROM groups g
       JOIN departments d ON g.department_id = d.id
       WHERE g.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findList({ department_id, keyword, page, pageSize, offset }) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (department_id) {
      conditions.push(`g.department_id = $${idx++}`);
      params.push(department_id);
    }
    if (keyword) {
      conditions.push(`g.name ILIKE $${idx++}`);
      params.push(`%${keyword}%`);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM groups g ${where}`, params);
    const { rows } = await db.query(
      `SELECT g.*, d.name as department_name
       FROM groups g
       JOIN departments d ON g.department_id = d.id
       ${where}
       ORDER BY g.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      [...params, pageSize, offset]
    );

    // 获取每个小组的成员
    for (const group of rows) {
      const members = await this.getMembers(group.id);
      group.members = members;
    }

    return { list: rows, total: parseInt(countRows[0].count) };
  },

  async getMembers(groupId) {
    const { rows } = await db.query(
      `SELECT u.id, u.real_name, u.email, u.role
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = $1
       ORDER BY u.real_name`,
      [groupId]
    );
    return rows;
  },

  async create({ name, department_id, member_ids }) {
    return db.transaction(async (client) => {
      const memberCount = member_ids.length;
      const { rows } = await client.query(
        `INSERT INTO groups (name, department_id, member_count) VALUES ($1, $2, $3) RETURNING *`,
        [name, department_id, memberCount]
      );
      const group = rows[0];

      // 插入成员关系
      for (const userId of member_ids) {
        await client.query(
          `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [group.id, userId]
        );
      }

      return group;
    });
  },

  async updateMembers(groupId, member_ids) {
    return db.transaction(async (client) => {
      // 删除旧成员
      await client.query('DELETE FROM group_members WHERE group_id = $1', [groupId]);

      // 插入新成员
      for (const userId of member_ids) {
        await client.query(
          `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)`,
          [groupId, userId]
        );
      }

      // 更新成员数量
      const { rows } = await client.query(
        `UPDATE groups SET member_count = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [member_ids.length, groupId]
      );
      return rows[0];
    });
  },

  async updateName(groupId, name) {
    const { rows } = await db.query(
      'UPDATE groups SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [name, groupId]
    );
    return rows[0] || null;
  },

  async delete(id) {
    // 检查是否有关联工作记录
    const check = await db.query('SELECT 1 FROM records WHERE group_id = $1 LIMIT 1', [id]);
    if (check.rows.length > 0) throw new Error('该小组已有工作记录，无法删除');

    const { rows } = await db.query('DELETE FROM groups WHERE id = $1 RETURNING id', [id]);
    return rows.length > 0;
  },

  async findByDepartment(department_id) {
    const { rows } = await db.query(
      `SELECT g.id, g.name, g.member_count
       FROM groups g
       WHERE g.department_id = $1
       ORDER BY g.name`,
      [department_id]
    );
    return rows;
  },

  async getMemberCount(groupId) {
    const { rows } = await db.query(
      'SELECT member_count FROM groups WHERE id = $1',
      [groupId]
    );
    return rows[0] ? parseInt(rows[0].member_count) : 0;
  },

  async countAll() {
    const { rows } = await db.query('SELECT COUNT(*) FROM groups');
    return parseInt(rows[0].count);
  }
};

module.exports = GroupModel;
