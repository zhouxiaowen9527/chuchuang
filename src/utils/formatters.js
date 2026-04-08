const formatters = {
  // 金额格式化
  money(amount) {
    return '¥' + Number(amount).toFixed(2);
  },

  // 日期格式化
  date(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  // 日期时间格式化
  dateTime(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return `${this.date(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },

  // 获取当月第一天和最后一天
  getCurrentMonth() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // 不使用 this，直接调用 date 方法
    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    
    return {
      start: formatDate(start),
      end: formatDate(end)
    };
  },

  // 角色显示名
  roleLabel(role) {
    const map = {
      employee: '员工',
      dept_manager: '部门经理',
      admin: '管理员'
    };
    return map[role] || role;
  },

  // 状态显示名
  statusLabel(status) {
    const map = {
      pending: '待审核',
      approved: '已批准',
      draft: '草稿',
      confirmed: '已确认',
      paid: '已发放'
    };
    return map[status] || status;
  },

  // 安全地转为数字
  toNumber(val, defaultVal = 0) {
    const n = Number(val);
    return isNaN(n) ? defaultVal : n;
  }
};

module.exports = formatters;
