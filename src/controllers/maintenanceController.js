const ExportService = require('../services/exportService');
const db = require('../config/database');
const { success } = require('../utils/response');

const MaintenanceController = {
  async exportJSON(req, res, next) {
    try {
      const json = await ExportService.exportAll();
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=backup.json');
      res.send(json);
    } catch (err) { next(err); }
  },

  async getStats(req, res, next) {
    try {
      const [users, depts, groups, specs, records, payrolls] = await Promise.all([
        db.query('SELECT COUNT(*) FROM users'),
        db.query('SELECT COUNT(*) FROM departments'),
        db.query('SELECT COUNT(*) FROM groups'),
        db.query('SELECT COUNT(*) FROM specs'),
        db.query('SELECT COUNT(*) FROM records'),
        db.query('SELECT COUNT(*) FROM payrolls')
      ]);

      success(res, {
        users: parseInt(users.rows[0].count),
        departments: parseInt(depts.rows[0].count),
        groups: parseInt(groups.rows[0].count),
        specs: parseInt(specs.rows[0].count),
        records: parseInt(records.rows[0].count),
        payrolls: parseInt(payrolls.rows[0].count),
        version: '1.0.0',
        database: 'PostgreSQL (Neon)',
        status: 'healthy'
      });
    } catch (err) { next(err); }
  },

  // 导出部门表
  async exportDepartments(req, res, next) {
    try {
      const csv = await ExportService.exportDepartments();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=departments.csv');
      res.send(csv);
    } catch (err) { next(err); }
  },

  // 导出员工表
  async exportUsers(req, res, next) {
    try {
      const csv = await ExportService.exportUsers();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      res.send(csv);
    } catch (err) { next(err); }
  },

  // 导出小组表
  async exportGroups(req, res, next) {
    try {
      const csv = await ExportService.exportGroups();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=groups.csv');
      res.send(csv);
    } catch (err) { next(err); }
  },

  // 导出计件规格表
  async exportSpecs(req, res, next) {
    try {
      const csv = await ExportService.exportSpecs();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=specs.csv');
      res.send(csv);
    } catch (err) { next(err); }
  }
};

module.exports = MaintenanceController;
