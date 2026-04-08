const db = require('../config/database');

class DepartmentService {
  // 获取部门列表（分页，可选按名称搜索，可选按id过滤）
  static async getList({ page, pageSize, name, id }) {
    const offset = (page - 1) * pageSize;
    const params = [];
    const conditions = [];

    if (name) {
      params.push(`%${name}%`);
      conditions.push(`d.name ILIKE $${params.length}`);
    }
    if (id) {
      params.push(id);
      conditions.push(`d.id = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT d.*, u.real_name as manager_name,
             (SELECT COUNT(*) FROM users WHERE department_id = d.id) as member_count
      FROM departments d
      LEFT JOIN users u ON d.manager_id = u.id
      ${where}
      ORDER BY d.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(pageSize, offset);
    const data = await db.query(query, params);

    const countParams = conditions.length > 0 ? params.slice(0, params.length - 2) : [];
    const countQuery = `SELECT COUNT(*) FROM departments d ${where}`;
    const countRes = await db.query(countQuery, countParams);
    const total = parseInt(countRes.rows[0].count);

    return {
      list: data.rows,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };
  }

  // 获取所有部门（无分页）
  static async getAll() {
    const res = await db.query(`
      SELECT d.*, u.real_name as manager_name
      FROM departments d
      LEFT JOIN users u ON d.manager_id = u.id
      ORDER BY d.name
    `);
    return res.rows;
  }

  // 根据ID获取部门
  static async getById(id) {
    const res = await db.query(`
      SELECT d.*, u.real_name as manager_name
      FROM departments d
      LEFT JOIN users u ON d.manager_id = u.id
      WHERE d.id = $1
    `, [id]);
    return res.rows[0];
  }

  // 创建部门
  static async create({ name, manager_id, description }) {
    const res = await db.query(
      `INSERT INTO departments (name, manager_id, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, manager_id, description]
    );
    return res.rows[0];
  }

  // 更新部门
  static async update(id, { name, manager_id, description }) {
    const res = await db.query(
      `UPDATE departments
       SET name = COALESCE($1, name),
           manager_id = COALESCE($2, manager_id),
           description = COALESCE($3, description),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, manager_id, description, id]
    );
    return res.rows[0];
  }

  // 删除部门
  static async delete(id) {
    await db.query('DELETE FROM departments WHERE id = $1', [id]);
  }
}

module.exports = DepartmentService;