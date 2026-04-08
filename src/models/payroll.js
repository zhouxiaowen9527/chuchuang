const db = require('../config/database');
const { PAYROLL_STATUS } = require('../config/constants');

const PayrollModel = {
  async findById(id) {
    const { rows } = await db.query(
      `SELECT p.*, u.real_name as employee_name, u.email,
              d.name as department_name, g.name as group_name,
              pu.real_name as paid_by_name
       FROM payrolls p
       JOIN users u ON p.employee_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN groups g ON p.group_id = g.id
       LEFT JOIN users pu ON p.paid_by = pu.id
       WHERE p.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findList({ employee_id, department_id, status, start_date, end_date, page, pageSize, offset }) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (employee_id) {
      conditions.push(`p.employee_id = $${idx++}`);
      params.push(employee_id);
    }
    if (department_id) {
      conditions.push(`u.department_id = $${idx++}`);
      params.push(department_id);
    }
    if (status) {
      conditions.push(`p.status = $${idx++}`);
      params.push(status);
    }
    if (start_date) {
      conditions.push(`p.period_end >= $${idx++}`);
      params.push(start_date);
    }
    if (end_date) {
      conditions.push(`p.period_start <= $${idx++}`);
      params.push(end_date);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const { rows: countRows } = await db.query(
      `SELECT COUNT(*) FROM payrolls p JOIN users u ON p.employee_id = u.id ${where}`,
      params
    );

    const { rows } = await db.query(
      `SELECT p.*, u.real_name as employee_name, u.email,
              d.name as department_name, g.name as group_name,
              pu.real_name as paid_by_name
       FROM payrolls p
       JOIN users u ON p.employee_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN groups g ON p.group_id = g.id
       LEFT JOIN users pu ON p.paid_by = pu.id
       ${where}
       ORDER BY p.period_start DESC, p.period_end DESC, u.real_name
       LIMIT $${idx++} OFFSET $${idx}`,
      [...params, pageSize, offset]
    );

    return { list: rows, total: parseInt(countRows[0].count) };
  },

  async create({ employee_id, group_id, period_start, period_end, piecework_amount, bonus, deduction, total_amount, notes }) {
    const { rows } = await db.query(
      `INSERT INTO payrolls (employee_id, group_id, period_start, period_end, piecework_amount, bonus, deduction, total_amount, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (employee_id, period_start, period_end)
       DO UPDATE SET piecework_amount = $5, bonus = $6, deduction = $7, total_amount = $8, notes = $9, updated_at = NOW()
       RETURNING *`,
      [employee_id, group_id, period_start, period_end, piecework_amount, bonus || 0, deduction || 0, total_amount, notes]
    );
    return rows[0];
  },

  async update(id, fields) {
    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const key of ['bonus', 'deduction', 'total_amount', 'status', 'notes', 'paid_at', 'paid_by']) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = $${idx++}`);
        values.push(fields[key]);
      }
    }

    if (setClauses.length === 0) return null;
    values.push(id);

    const { rows } = await db.query(
      `UPDATE payrolls SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async updateBonusDeduction(id, bonus, deduction) {
    // 先获取当前记录
    const payroll = await this.findById(id);
    if (!payroll) throw new Error('工资单不存在');
    if (payroll.status === PAYROLL_STATUS.PAID) throw new Error('已发放的工资单无法修改');

    const total_amount = parseFloat(payroll.piecework_amount) + parseFloat(bonus) - parseFloat(deduction);
    return this.update(id, { bonus, deduction, total_amount });
  },

  async confirm(id) {
    const payroll = await this.findById(id);
    if (!payroll) throw new Error('工资单不存在');
    if (payroll.status === PAYROLL_STATUS.PAID) throw new Error('已发放的工资单无法修改');

    return this.update(id, { status: PAYROLL_STATUS.CONFIRMED });
  },

  async markAsPaid(id, paidBy) {
    const payroll = await this.findById(id);
    if (!payroll) throw new Error('工资单不存在');
    if (payroll.status === PAYROLL_STATUS.PAID) throw new Error('工资单已发放');

    return this.update(id, { status: PAYROLL_STATUS.PAID, paid_at: new Date(), paid_by: paidBy });
  },

  async countAll() {
    const { rows } = await db.query('SELECT COUNT(*) FROM payrolls');
    return parseInt(rows[0].count);
  },

  async sumByEmployeeAndPeriod(employee_id, start_date, end_date) {
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total
       FROM payrolls
       WHERE employee_id = $1 AND period_end >= $2 AND period_start <= $3`,
      [employee_id, start_date, end_date]
    );
    return parseFloat(rows[0].total);
  },

  async sumByDepartmentAndPeriod(department_id, start_date, end_date) {
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(p.total_amount), 0) as total
       FROM payrolls p
       JOIN users u ON p.employee_id = u.id
       WHERE u.department_id = $1 AND p.period_end >= $2 AND p.period_start <= $3`,
      [department_id, start_date, end_date]
    );
    return parseFloat(rows[0].total);
  },

  // 获取某周期内所有员工的工资合计（管理员用）
  async sumAllByPeriod(start_date, end_date) {
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total
       FROM payrolls
       WHERE period_end >= $1 AND period_start <= $2`,
      [start_date, end_date]
    );
    return parseFloat(rows[0].total);
  }
};

module.exports = PayrollModel;
