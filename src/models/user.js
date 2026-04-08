const db = require('../config/database');

class UserModel {
  // 查找所有用户（带分页和条件）
  static async findList({ department_id, role, status, keyword, page, pageSize, offset }) {
    // 构建主查询
    let sql = `
      SELECT u.*, d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    // 动态添加筛选条件
    if (department_id) {
      sql += ` AND u.department_id = $${params.length + 1}`;
      params.push(department_id);
    }
    if (role) {
      sql += ` AND u.role = $${params.length + 1}`;
      params.push(role);
    }
    if (status) {
      sql += ` AND u.status = $${params.length + 1}`;
      params.push(status);
    }
    if (keyword) {
      sql += ` AND (u.real_name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 2})`;
      params.push(`%${keyword}%`, `%${keyword}%`); // 需要两个参数
    }

    // 构建计数查询（条件与主查询一致，但无需 JOIN 和分页）
    let countSql = `SELECT COUNT(*) FROM users u WHERE 1=1`;
    const countParams = [];
    if (department_id) {
      countSql += ` AND u.department_id = $${countParams.length + 1}`;
      countParams.push(department_id);
    }
    if (role) {
      countSql += ` AND u.role = $${countParams.length + 1}`;
      countParams.push(role);
    }
    if (status) {
      countSql += ` AND u.status = $${countParams.length + 1}`;
      countParams.push(status);
    }
    if (keyword) {
      countSql += ` AND (u.real_name ILIKE $${countParams.length + 1} OR u.email ILIKE $${countParams.length + 2})`;
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 执行计数查询
    const totalRes = await db.query(countSql, countParams);
    const total = parseInt(totalRes.rows[0].count);

    // 添加分页
    sql += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pageSize, offset);

    // 执行主查询
    const data = await db.query(sql, params);
    return { list: data.rows, total };
  }

  static async findById(id) {
    const result = await db.query(`
      SELECT u.*, d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async create(data) {
    const { email, password_hash, real_name, phone, id_card, bank_name, bank_card, bank_bank, department_id, role, status } = data;
    const result = await db.query(`
      INSERT INTO users (email, password_hash, real_name, phone, id_card, bank_name, bank_card, bank_bank, department_id, role, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [email, password_hash, real_name, phone, id_card, bank_name, bank_card, bank_bank, department_id, role, status]);
    return result.rows[0];
  }

  static async update(id, fields) {
    if (Object.keys(fields).length === 0) return null;
    const setClause = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(fields)) {
      setClause.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
    values.push(id);
    const sql = `UPDATE users SET ${setClause.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
    const result = await db.query(sql, values);
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
  }
}

module.exports = UserModel;