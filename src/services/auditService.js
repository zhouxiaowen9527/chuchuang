const AuditLogModel = require('../models/auditLog');

const AuditService = {
  async getList(query) {
    const { page, pageSize, offset } = require('../utils/validators').parsePagination(query);
    return AuditLogModel.findList({
      user_id: query.user_id,
      action: query.action,
      entity_type: query.entity_type,
      start_date: query.start_date,
      end_date: query.end_date,
      page, pageSize, offset
    });
  },

  async getRecent(limit) {
    return AuditLogModel.findRecent(limit || 100);
  }
};

module.exports = AuditService;
