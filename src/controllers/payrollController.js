const PayrollService = require('../services/payrollService');
const ExportService = require('../services/exportService');
const validators = require('../utils/validators');
const { success, error, paginate } = require('../utils/response');

const PayrollController = {
  async list(req, res, next) {
    try {
      const query = { ...req.query };

      if (req.user.role === 'employee') {
        query.employee_id = req.user.id;
      }
      if (req.user.role === 'dept_manager') {
        query.department_id = req.user.department_id;
      }

      const result = await PayrollService.getList(query);
      success(res, paginate(result.list, req.query.page || 1, req.query.pageSize || 20, result.total));
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const payroll = await PayrollService.getById(req.params.id);
      if (!payroll) return error(res, '工资单不存在', 404);
      success(res, payroll);
    } catch (err) { next(err); }
  },

  // 生成工资单（仅管理员）
  async generate(req, res, next) {
    try {
      const { period_start, period_end } = req.body;
      if (!validators.isDate(period_start) || !validators.isDate(period_end)) {
        return error(res, '请输入正确的日期格式');
      }

      const result = await PayrollService.generatePayrolls(period_start, period_end);
      success(res, result, `已生成 ${result.length} 条工资单`, 201);
    } catch (err) { next(err); }
  },

  // 调整奖金/扣除（经理可调本部门draft状态的）
  async adjust(req, res, next) {
    try {
      const { bonus, deduction } = req.body;
      const result = await PayrollService.adjustBonusDeduction(req.params.id, bonus, deduction);
      success(res, result, '工资单已调整');
    } catch (err) { next(err); }
  },

  // 确认工资单（仅管理员）
  async confirm(req, res, next) {
    try {
      const result = await PayrollService.confirm(req.params.id);
      success(res, result, '工资单已确认');
    } catch (err) { next(err); }
  },

  // 发放工资单（仅管理员）
  async markPaid(req, res, next) {
    try {
      const result = await PayrollService.markAsPaid(req.params.id, req.user.id);
      success(res, result, '工资已发放');
    } catch (err) { next(err); }
  },

  // 批量确认
  async batchConfirm(req, res, next) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) return error(res, '请选择要确认的工资单');

      const results = await PayrollService.batchConfirm(ids, req.user.id);
      success(res, results, '批量确认完成');
    } catch (err) { next(err); }
  },

  // 批量发放
  async batchPay(req, res, next) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) return error(res, '请选择要发放的工资单');

      const results = await PayrollService.batchPay(ids, req.user.id);
      success(res, results, '批量发放完成');
    } catch (err) { next(err); }
  },

  async exportCSV(req, res, next) {
    try {
      const query = { ...req.query };
      if (req.user.role === 'employee') query.employee_id = req.user.id;
      if (req.user.role === 'dept_manager') query.department_id = req.user.department_id;

      const csv = await ExportService.exportPayrolls(query);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=payrolls.csv');
      res.send(csv);
    } catch (err) { next(err); }
  }
};

module.exports = PayrollController;
