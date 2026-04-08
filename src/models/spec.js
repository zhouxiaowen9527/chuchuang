const db = require('../config/database');

const SpecModel = {
  async findById(id) {
    const { rows } = await db.query(
      `SELECT s.*, d.name as department_name
       FROM specs s
       JOIN departments d ON s.department_id = d.id
       WHERE s.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findList({ department_id, is_active, keyword, page, pageSize, offset }) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (department_id) {
      conditions.push(`s.department_id = $${idx++}`);
      params.push(department_id);
    }
    if (is_active !== undefined) {
      conditions.push(`s.is_active = $${idx++}`);
      params.push(is_active);
    }
    if (keyword) {
      conditions.push(`(s.name ILIKE $${idx++} OR s.code ILIKE $${idx++})`);
      const kw = `%${keyword}%`;
      params.push(kw, kw);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM specs s ${where}`, params);
    const { rows } = await db.query(
      `SELECT s.*, d.name as department_name
       FROM specs s
       JOIN departments d ON s.department_id = d.id
       ${where}
       ORDER BY s.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      [...params, pageSize, offset]
    );

    return { list: rows, total: parseInt(countRows[0].count) };
  },

  async findActive(department_id) {
    const { rows } = await db.query(
      `SELECT s.id, s.name, s.code, s.unit, s.unit_price
       FROM specs s
       WHERE s.department_id = $1 AND s.is_active = true
       ORDER BY s.name`,
      [department_id]
    );
    return rows;
  },

  async create({ department_id, name, code, unit, unit_price, description }) {
    const { rows } = await db.query(
      `INSERT INTO specs (department_id, name, code, unit, unit_price, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [department_id, name, code, unit, unit_price, description]
    );
    return rows[0];
  },

  async update(id, fields) {
    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const key of ['name', 'code', 'unit', 'unit_price', 'is_active', 'description']) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = $${idx++}`);
        values.push(fields[key]);
      }
    }

    if (setClauses.length === 0) return null;
    values.push(id);

    const { rows } = await db.query(
      `UPDATE specs SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async toggleActive(id) {
    const { rows } = await db.query(
      `UPDATE specs SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return rows[0] || null;
  },

  async delete(id) {
    const check = await db.query('SELECT 1 FROM records WHERE spec_id = $1 LIMIT 1', [id]);
    if (check.rows.length > 0) throw new Error('该规格已被工作记录使用，无法删除');

    const { rows } = await db.query('DELETE FROM specs WHERE id = $1 RETURNING id', [id]);
    return rows.length > 0;
  },

  async countAll() {
    const { rows } = await db.query('SELECT COUNT(*) FROM specs');
    return parseInt(rows[0].count);
  }
};

module.exports = SpecModel;
