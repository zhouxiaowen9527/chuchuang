// 系统常量定义
const ROLES = {
  EMPLOYEE: 'employee',
  DEPT_MANAGER: 'dept_manager',
  ADMIN: 'admin'
};

const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved'
};

const PAYROLL_STATUS = {
  DRAFT: 'draft',
  CONFIRMED: 'confirmed',
  PAID: 'paid'
};

const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  APPROVE: 'approve',
  REJECT: 'reject',
  CONFIRM: 'confirm',
  PAY: 'pay',
  EXPORT: 'export',
  RESET_PASSWORD: 'reset_password'
};

const ENTITY_TYPES = {
  USER: 'user',
  DEPARTMENT: 'department',
  GROUP: 'group',
  SPEC: 'spec',
  RECORD: 'record',
  PAYROLL: 'payroll'
};

// 权限矩阵：角色 → 允许的操作
const PERMISSIONS = {
  [ROLES.EMPLOYEE]: {
    // 仅能查看自己的数据
    records: { own: ['read'] },
    payrolls: { own: ['read'] },
    profile: ['read', 'update'],
    password: ['update']
  },
  [ROLES.DEPT_MANAGER]: {
    records: { dept: ['read', 'create', 'update', 'delete'] },
    payrolls: { dept: ['read', 'update_bonus'] },
    users: { dept: ['read', 'update', 'delete', 'reset_password', 'approve'] },
    departments: { own: ['read'] },
    groups: { dept: ['read', 'create', 'update', 'delete'] },
    specs: { dept: ['read', 'create', 'update', 'delete'] },
    profile: ['read', 'update'],
    password: ['update']
  },
  [ROLES.ADMIN]: {
    records: { all: ['read', 'create', 'update', 'delete'] },
    payrolls: { all: ['read', 'create', 'update', 'confirm', 'pay', 'delete'] },
    users: { all: ['read', 'create', 'update', 'delete', 'reset_password', 'approve'] },
    departments: { all: ['read', 'create', 'update', 'delete'] },
    groups: { all: ['read', 'create', 'update', 'delete'] },
    specs: { all: ['read', 'create', 'update', 'delete'] },
    approvals: { all: ['read', 'update'] },
    audit: { all: ['read', 'export'] },
    maintenance: { all: ['read', 'export', 'clear_cache'] },
    profile: ['read', 'update'],
    password: ['update']
  }
};

// 角色层级（用于权限判断）
const ROLE_HIERARCHY = {
  [ROLES.EMPLOYEE]: 0,
  [ROLES.DEPT_MANAGER]: 1,
  [ROLES.ADMIN]: 2
};

module.exports = {
  ROLES,
  USER_STATUS,
  PAYROLL_STATUS,
  AUDIT_ACTIONS,
  ENTITY_TYPES,
  PERMISSIONS,
  ROLE_HIERARCHY
};
