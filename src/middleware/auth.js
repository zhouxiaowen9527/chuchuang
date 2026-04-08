const { verifyToken } = require('../config/auth');
const { unauthorized, forbidden } = require('../utils/response');
const db = require('../config/database');
const { USER_STATUS } = require('../config/constants');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, '未提供认证令牌');
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // 查询用户最新信息（状态可能已变更）
    const result = await db.query(
      `SELECT u.id, u.email, u.real_name, u.role, u.status, u.department_id,
              d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return unauthorized(res, '用户不存在');
    }

    const user = result.rows[0];
    if (user.status !== USER_STATUS.APPROVED) {
      return forbidden(res, '账号尚未审核通过');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, '登录已过期，请重新登录');
    }
    if (err.name === 'JsonWebTokenError') {
      return unauthorized(res, '无效的认证令牌');
    }
    next(err);
  }
};

module.exports = authMiddleware;
