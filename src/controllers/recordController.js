const RecordService = require('../services/recordService');
const ExportService = require('../services/exportService');
const validators = require('../utils/validators');
const { success, error, paginate } = require('../utils/response');

const RecordController = {
  async list(req, res, next) {
    try {
      const query = { ...req.query };

      // 员工只能看自己的记录
      if (req.user.role === 'employee') {
        query.employee_id = req.user.id;
      }
      // 部门经理只能看本部门
      if (req.user.role === 'dept_manager') {
        query.department_id = req.user.department_id;
      }

      const result = await RecordService.getList(query);
      success(res, paginate(result.list, req.query.page || 1, req.query.pageSize || 20, result.total));
    } catch (err) { next(err); }
  },

  async getById(req, res, next) {
    try {
      const record = await RecordService.getById(req.params.id);
      if (!record) return error(res, '记录不存在', 404);
      success(res, record);
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const errors = validators.validateRecord(req.body);
      if (errors.length > 0) return error(res, errors.join('；'));

      const data = { ...req.body };

      // 部门经理自动填充本部门
      if (req.user.role === 'dept_manager') {
        data.department_id = req.user.department_id;
      }

      const result = await RecordService.createRecord(data);
      success(res, result, `工作记录已录入，小组总收入 ¥${result.group_total.toFixed(2)}，人均 ¥${result.per_person.toFixed(2)}`, 201);
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await RecordService.delete(req.params.id);
      success(res, null, '记录已删除');
    } catch (err) { next(err); }
  },

  async exportCSV(req, res, next) {
    try {
      const query = { ...req.query };
      if (req.user.role === 'employee') query.employee_id = req.user.id;
      if (req.user.role === 'dept_manager') query.department_id = req.user.department_id;

      const csv = await ExportService.exportRecords(query);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=records.csv');
      res.send(csv);
    } catch (err) { next(err); }
  }
};

module.exports = RecordController;
