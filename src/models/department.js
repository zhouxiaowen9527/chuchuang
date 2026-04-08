const db = require('../config/database');

const DepartmentModel = {
  async findById(id) {
    const { rows } = await db.query(
      `SELECT d.*, u.real_name as manager_name
       FROM departments d
       LEFT JOIN users u ON d.manager_id = u.id
       WHERE d.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findList({ keyword, page, pageSize, offset }) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (keyword) {
      conditions.push(`d.name ILIKE $${idx++}`);
      params.push(`%${keyword}%`);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM departments d ${where}`, params);
    const { rows } = await db.query(
      `SELECT d.*, u.real_name as manager_name,
              (SELECT COUNT(*) FROM users WHERE department_id = d.id AND status = 'approved') as member_count
       FROM departments d
       LEFT JOIN users u ON d.manager_id = u.id
       ${where}
       ORDER BY d.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      [...params, pageSize, offset]
    );

    return { list: rows, total: parseInt(countRows[0].count) };
  },

  async findAll() {
    const { rows } = await db.query(
      `SELECT d.id, d.name FROM departments ORDER BY d.name`
    );
    return rows;
  },

  async create({ name, manager_id, description }) {
    const { rows } = await db.query(
      `INSERT INTO departments (name, manager_id, description) VALUES ($1, $2, $3) RETURNING *`,
      [name, manager_id, description]
    );
    return rows[0];
  },

  async update(id, fields) {
    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const key of ['name', 'manager_id', 'description']) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = $${idx++}`);
        values.push(fields[key]);
      }
    }

    if (setClauses.length === 0) return null;
    values.push(id);

    const { rows } = await db.query(
      `UPDATE departments SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async delete(id) {
    // 检查是否有关联员工
    const userCheck = await db.query('SELECT 1 FROM users WHERE department_id = $1 LIMIT 1', [id]);
    if (userCheck.rows.length > 0) throw new Error('该部门下有员工，无法删除');

    // 检查是否有关联小组
    const groupCheck = await db.query('SELECT 1 FROM groups WHERE department_id = $1 LIMIT 1', [id]);
    if (groupCheck.rows.length > 0) throw new Error('该部门下有小组，无法删除');

    const { rows } = await db.query('DELETE FROM departments WHERE id = $1 RETURNING id', [id]);
    return rows.length > 0;
  },

  async countAll() {
    const { rows } = await db.query('SELECT COUNT(*) FROM departments');
    return parseInt(rows[0].count);
  }
};

module.exports = DepartmentModel;
