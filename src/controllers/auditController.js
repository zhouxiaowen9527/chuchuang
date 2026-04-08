const AuditService = require('../services/auditService');
const ExportService = require('../services/exportService');
const { success, paginate } = require('../utils/response');

const AuditController = {
  async list(req, res, next) {
    try {
      const result = await AuditService.getList(req.query);
      success(res, paginate(result.list, req.query.page || 1, req.query.pageSize || 20, result.total));
    } catch (err) { next(err); }
  },

  async exportCSV(req, res, next) {
    try {
      const csv = await ExportService.exportAuditLogs(req.query);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
      res.send(csv);
    } catch (err) { next(err); }
  }
};

module.exports = AuditController;
