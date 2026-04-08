const db = require('../config/database');

const RecordModel = {
  async findById(id) {
    const { rows } = await db.query(
      `SELECT r.id, r.employee_id, r.group_id, r.department_id, r.spec_id,
              r.quantity, r.unit_price, r.total_amount,
              to_char(r.work_date, 'YYYY-MM-DD') as work_date,
              r.notes, r.created_at,
              s.name as spec_name, s.unit as spec_unit,
              g.name as group_name,
              d.name as department_name,
              u.real_name as employee_name
       FROM records r
       JOIN specs s ON r.spec_id = s.id
       JOIN groups g ON r.group_id = g.id
       JOIN departments d ON r.department_id = d.id
       JOIN users u ON r.employee_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findList({ employee_id, department_id, group_id, start_date, end_date, page, pageSize, offset }) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (employee_id) {
      conditions.push(`r.employee_id = $${idx++}`);
      params.push(employee_id);
    }
    if (department_id) {
      conditions.push(`r.department_id = $${idx++}`);
      params.push(department_id);
    }
    if (group_id) {
      conditions.push(`r.group_id = $${idx++}`);
      params.push(group_id);
    }
    if (start_date) {
      conditions.push(`r.work_date >= $${idx++}`);
      params.push(start_date);
    }
    if (end_date) {
      conditions.push(`r.work_date <= $${idx++}`);
      params.push(end_date);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM records r ${where}`, params);

    const { rows } = await db.query(
      `SELECT r.id, r.employee_id, r.group_id, r.department_id, r.spec_id,
              r.quantity, r.unit_price, r.total_amount,
              to_char(r.work_date, 'YYYY-MM-DD') as work_date,
              r.notes, r.created_at,
              s.name as spec_name, s.unit as spec_unit,
              g.name as group_name,
              d.name as department_name,
              u.real_name as employee_name,
              (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = r.group_id) as member_count,
              (SELECT string_agg(u2.real_name, ', ')
               FROM group_members gm2
               JOIN users u2 ON gm2.user_id = u2.id
               WHERE gm2.group_id = r.group_id) as member_names
       FROM records r
       JOIN specs s ON r.spec_id = s.id
       JOIN groups g ON r.group_id = g.id
       JOIN departments d ON r.department_id = d.id
       JOIN users u ON r.employee_id = u.id
       ${where}
       ORDER BY r.work_date DESC, g.name, r.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      [...params, pageSize, offset]
    );

    // 后处理：基于已有 total_amount 计算小组总收入
    const groupMap = new Map(); // key: group_id + work_date
    for (const row of rows) {
      const key = `${row.group_id}_${row.work_date}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          group_id: row.group_id,
          work_date: row.work_date,
          member_count: parseInt(row.member_count) || 1,
          specSet: new Set(),      // 用于去重规格
          total_amount_sum: 0,     // 该组所有规格的 total_amount 之和（每个规格只算一次）
          rows: []
        });
      }
      const group = groupMap.get(key);
      group.rows.push(row);
      // 每个规格只累加一次 total_amount，避免重复（因为每个成员都有一份记录）
      if (!group.specSet.has(row.spec_id)) {
        group.specSet.add(row.spec_id);
        group.total_amount_sum += parseFloat(row.total_amount);
      }
    }

    // 计算小组总收入并附加到每条记录
    for (const group of groupMap.values()) {
      const groupTotal = group.total_amount_sum * group.member_count;  // 小组总收入 = 各规格人均收入之和 × 成员数
      for (const row of group.rows) {
        row.group_total = groupTotal;
        row.per_person = parseFloat(row.total_amount);  // 人均收入即每条记录的 total_amount
      }
    }

    return { list: rows, total: parseInt(countRows[0].count) };
  },

  // 获取某小组某天的所有记录（用于计算人均收入）
  async findByGroupAndDate(group_id, work_date) {
    const { rows } = await db.query(
      `SELECT r.id, r.employee_id, r.group_id, r.department_id, r.spec_id,
              r.quantity, r.unit_price, r.total_amount,
              to_char(r.work_date, 'YYYY-MM-DD') as work_date,
              r.notes, r.created_at,
              s.name as spec_name, s.unit as spec_unit
       FROM records r
       JOIN specs s ON r.spec_id = s.id
       WHERE r.group_id = $1 AND r.work_date = $2`,
      [group_id, work_date]
    );
    return rows;
  },

  // 批量创建记录（事务）
  async batchCreate(records) {
    return db.transaction(async (client) => {
      const created = [];
      for (const r of records) {
        const { rows } = await client.query(
          `INSERT INTO records (employee_id, group_id, department_id, spec_id, quantity, unit_price, total_amount, work_date, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [r.employee_id, r.group_id, r.department_id, r.spec_id, r.quantity, r.unit_price, r.total_amount, r.work_date, r.notes]
        );
        created.push(rows[0]);
      }
      return created;
    });
  },

  async update(id, fields) {
    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const key of ['quantity', 'unit_price', 'total_amount', 'notes', 'work_date', 'spec_id']) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = $${idx++}`);
        values.push(fields[key]);
      }
    }

    if (setClauses.length === 0) return null;
    values.push(id);

    const { rows } = await db.query(
      `UPDATE records SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async delete(id) {
    const record = await this.findById(id);
    if (!record) throw new Error('记录不存在');

    const { rows } = await db.query('DELETE FROM records WHERE id = $1 RETURNING id', [id]);
    // 删除后需要重新计算该小组当天的收入分配
    if (rows.length > 0) {
      await this.recalcGroupDay(record.group_id, record.work_date, record.department_id);
    }
    return rows.length > 0;
  },

  // 重新计算某小组某天的人均收入（按规格分别计算）
  async recalcGroupDay(group_id, work_date, department_id) {
    const { rows } = await db.query(
      `SELECT * FROM records WHERE group_id = $1 AND work_date = $2`,
      [group_id, work_date]
    );
    if (rows.length === 0) return;

    const { rows: groupRows } = await db.query('SELECT member_count FROM groups WHERE id = $1', [group_id]);
    const memberCount = groupRows[0] ? parseInt(groupRows[0].member_count) : 1;

    const specMap = new Map();
    for (const r of rows) {
      const key = r.spec_id;
      if (!specMap.has(key)) {
        specMap.set(key, {
          spec_id: key,
          total_quantity: 0,
          unit_price: r.unit_price
        });
      }
      const spec = specMap.get(key);
      spec.total_quantity += parseFloat(r.quantity);
    }

    for (const [spec_id, spec] of specMap) {
      const specTotal = spec.total_quantity * spec.unit_price;
      const perPerson = memberCount > 0 ? specTotal / memberCount : 0;
      await db.query(
        `UPDATE records SET total_amount = $1, updated_at = NOW() 
         WHERE group_id = $2 AND work_date = $3 AND spec_id = $4`,
        [perPerson, group_id, work_date, spec_id]
      );
    }
  },

  // 统计
  async countAll() {
    const { rows } = await db.query('SELECT COUNT(*) FROM records');
    return parseInt(rows[0].count);
  },

  async sumByEmployeeAndPeriod(employee_id, start_date, end_date) {
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total
       FROM records
       WHERE employee_id = $1 AND work_date >= $2 AND work_date <= $3`,
      [employee_id, start_date, end_date]
    );
    return parseFloat(rows[0].total);
  },

  async sumByDepartmentAndPeriod(department_id, start_date, end_date) {
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total
       FROM records
       WHERE department_id = $1 AND work_date >= $2 AND work_date <= $3`,
      [department_id, start_date, end_date]
    );
    return parseFloat(rows[0].total);
  },

  async countByEmployeeAndPeriod(employee_id, start_date, end_date) {
    const { rows } = await db.query(
      `SELECT COUNT(*) FROM records WHERE employee_id = $1 AND work_date >= $2 AND work_date <= $3`,
      [employee_id, start_date, end_date]
    );
    return parseInt(rows[0].count);
  },

  async countByDepartmentAndPeriod(department_id, start_date, end_date) {
    const { rows } = await db.query(
      `SELECT COUNT(*) FROM records WHERE department_id = $1 AND work_date >= $2 AND work_date <= $3`,
      [department_id, start_date, end_date]
    );
    return parseInt(rows[0].count);
  },

  // 获取某员工在周期内的所有记录（用于工资单生成）
  async getEmployeeRecordsForPeriod(employee_id, start_date, end_date) {
    const { rows } = await db.query(
      `SELECT r.work_date, r.spec_id, s.name as spec_name, r.quantity, r.unit_price, r.total_amount, g.name as group_name
       FROM records r
       JOIN specs s ON r.spec_id = s.id
       JOIN groups g ON r.group_id = g.id
       WHERE r.employee_id = $1 AND r.work_date >= $2 AND r.work_date <= $3
       ORDER BY r.work_date`,
      [employee_id, start_date, end_date]
    );
    return rows;
  },

  // 统计某周期内所有工作记录数（管理员用）
  async countAllByPeriod(start_date, end_date) {
    const { rows } = await db.query(
      `SELECT COUNT(*) FROM records WHERE work_date >= $1 AND work_date <= $2`,
      [start_date, end_date]
    );
    return parseInt(rows[0].count);
  },

  // 统计某周期内所有工作记录的总金额（管理员用）
  async sumAllByPeriod(start_date, end_date) {
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total FROM records WHERE work_date >= $1 AND work_date <= $2`,
      [start_date, end_date]
    );
    return parseFloat(rows[0].total);
  }
};

module.exports = RecordModel;