const db = require('../config/database');

const AuditLogModel = {
  async findList({ user_id, action, entity_type, start_date, end_date, page, pageSize, offset }) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (user_id) {
      conditions.push(`al.user_id = $${idx++}`);
      params.push(user_id);
    }
    if (action) {
      conditions.push(`al.action = $${idx++}`);
      params.push(action);
    }
    if (entity_type) {
      conditions.push(`al.entity_type = $${idx++}`);
      params.push(entity_type);
    }
    if (start_date) {
      conditions.push(`al.created_at >= $${idx++}`);
      params.push(start_date);
    }
    if (end_date) {
      conditions.push(`al.created_at <= $${idx++}`);
      params.push(end_date);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM audit_logs al ${where}`, params);
    const { rows } = await db.query(
      `SELECT al.*, u.real_name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      [...params, pageSize, offset]
    );

    return { list: rows, total: parseInt(countRows[0].count) };
  },

  async findRecent(limit = 100) {
    const { rows } = await db.query(
      `SELECT al.*, u.real_name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  },

  async countAll() {
    const { rows } = await db.query('SELECT COUNT(*) FROM audit_logs');
    return parseInt(rows[0].count);
  }
};

module.exports = AuditLogModel;
