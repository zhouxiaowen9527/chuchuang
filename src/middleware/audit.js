const db = require('../config/database');
const { AUDIT_ACTIONS, ENTITY_TYPES } = require('../config/constants');
const logger = require('../utils/logger');

const auditMiddleware = () => {
  return (req, res, next) => {
    // 保存原始的 res.json
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      // 只在成功操作时记录审计日志（创建、更新、删除）
      const method = req.method.toUpperCase();
      const statusCode = res.statusCode;

      if ([200, 201].includes(statusCode) && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const action = mapAction(method, req.path, data);
        if (action) {
          const entityType = mapEntityType(req.path);
          const entityId = req.params.id || (req.body && req.body.id) || null;

          db.query(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, new_data)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              req.user ? req.user.id : null,
              action,
              entityType,
              entityId,
              req.ip || req.connection?.remoteAddress,
              req.headers['user-agent'] || '',
              req.body ? JSON.stringify(req.body) : null
            ]
          ).catch(err => logger.error('AUDIT', '写入审计日志失败:', err.message));
        }
      }

      return originalJson(data);
    };

    next();
  };
};

function mapAction(method, path, responseData) {
  if (path.includes('/login')) return AUDIT_ACTIONS.LOGIN;
  if (method === 'POST' && !path.includes('/login') && !path.includes('/register')) return AUDIT_ACTIONS.CREATE;
  if (method === 'PUT' || method === 'PATCH') return AUDIT_ACTIONS.UPDATE;
  if (method === 'DELETE') return AUDIT_ACTIONS.DELETE;
  return null;
}

function mapEntityType(path) {
  if (path.includes('/record')) return ENTITY_TYPES.RECORD;
  if (path.includes('/payroll')) return ENTITY_TYPES.PAYROLL;
  if (path.includes('/department')) return ENTITY_TYPES.DEPARTMENT;
  if (path.includes('/group')) return ENTITY_TYPES.GROUP;
  if (path.includes('/spec')) return ENTITY_TYPES.SPEC;
  if (path.includes('/user')) return ENTITY_TYPES.USER;
  return 'unknown';
}

module.exports = auditMiddleware;
