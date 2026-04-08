const PayrollModel = require('../models/payroll');
const RecordModel = require('../models/record');
const db = require('../config/database');

const PayrollService = {
  /**
   * 生成月度工资单 - 核心逻辑
   * 1. 查询周期内有工作记录的员工
   * 2. 汇总每个员工的计件收入
   * 3. 创建/更新工资单
   */
  async generatePayrolls(period_start, period_end) {
    // 查询周期内有工作记录的所有员工
    const { rows: employees } = await db.query(
      `SELECT DISTINCT r.employee_id, r.department_id, r.group_id
       FROM records r
       WHERE r.work_date >= $1 AND r.work_date <= $2
       ORDER BY r.employee_id`,
      [period_start, period_end]
    );

    if (employees.length === 0) {
      throw new Error('该周期内没有工作记录');
    }

    const results = [];
    for (const emp of employees) {
      // 汇总该员工的计件收入
      const total = await RecordModel.sumByEmployeeAndPeriod(
        emp.employee_id, period_start, period_end
      );

      const payroll = await PayrollModel.create({
        employee_id: emp.employee_id,
        group_id: emp.group_id,
        period_start,
        period_end,
        piecework_amount: total,
        bonus: 0,
        deduction: 0,
        total_amount: total
      });

      results.push(payroll);
    }

    return results;
  },

  async getList(query) {
    const { page, pageSize, offset } = require('../utils/validators').parsePagination(query);
    return PayrollModel.findList({
      employee_id: query.employee_id,
      department_id: query.department_id,
      status: query.status,
      start_date: query.start_date,
      end_date: query.end_date,
      page, pageSize, offset
    });
  },

  async getById(id) {
    return PayrollModel.findById(id);
  },

  async adjustBonusDeduction(id, bonus, deduction) {
    return PayrollModel.updateBonusDeduction(id, bonus, deduction);
  },

  async confirm(id) {
    return PayrollModel.confirm(id);
  },

  async markAsPaid(id, paidBy) {
    return PayrollModel.markAsPaid(id, paidBy);
  },

  async batchConfirm(ids, paidBy) {
    const results = [];
    for (const id of ids) {
      try {
        const result = await PayrollModel.confirm(id);
        results.push({ id, success: true });
      } catch (err) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  },

  async batchPay(ids, paidBy) {
    const results = [];
    for (const id of ids) {
      try {
        const result = await PayrollModel.markAsPaid(id, paidBy);
        results.push({ id, success: true });
      } catch (err) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  },

  async countAll() {
    return PayrollModel.countAll();
  }
};

module.exports = PayrollService;
