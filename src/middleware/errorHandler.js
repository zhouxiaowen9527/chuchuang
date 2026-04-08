const logger = require('../utils/logger');
const { error } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  logger.error('ERROR', `${req.method} ${req.path}`, err.message);

  // PostgreSQL 错误
  if (err.code === '23505') {
    return error(res, '数据已存在（唯一约束冲突）', 409);
  }
  if (err.code === '23503') {
    return error(res, '关联数据不存在或无法删除（外键约束）', 409);
  }
  if (err.code === '22P02') {
    return error(res, '参数格式错误', 400);
  }

  // JWT 错误（已由 auth 中间件处理，这里是兜底）
  if (err.name === 'TokenExpiredError') {
    return error(res, '登录已过期', 401);
  }

  // 默认500
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? '服务器内部错误'
    : err.message;

  return error(res, message, statusCode);
};

// 404 处理
const notFoundHandler = (req, res) => {
  return error(res, `接口不存在: ${req.method} ${req.path}`, 404);
};

module.exports = { errorHandler, notFoundHandler };
