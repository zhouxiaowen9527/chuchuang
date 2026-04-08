const { forbidden } = require('../utils/response');
const { ROLES } = require('../config/constants');

// 角色检查：用户角色在允许列表中即可通过
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return forbidden(res, '权限不足');
    }
    next();
  };
};

// 数据范围检查：管理员可访问所有，经理仅本部门，员工仅本人
const checkScope = (resource, action) => {
  return async (req, res, next) => {
    const { role, id: userId, department_id: userDeptId } = req.user;

    if (role === ROLES.ADMIN) return next();

    if (role === ROLES.EMPLOYEE) {
      const targetId = req.params.id || req.body.employee_id || req.body.user_id;
      if (targetId && targetId !== userId) {
        return forbidden(res, '无权访问他人数据');
      }
      req.scopeFilter = { employee_id: userId };
      return next();
    }

    if (role === ROLES.DEPT_MANAGER) {
      req.scopeFilter = { department_id: userDeptId };
      const targetDeptId = req.params.departmentId || req.body.department_id;
      if (targetDeptId && targetDeptId !== userDeptId) {
        return forbidden(res, '无权访问其他部门数据');
      }
      return next();
    }

    next();
  };
};

module.exports = { requireRole, checkScope };
