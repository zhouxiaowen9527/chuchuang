const validators = {
  // 邮箱格式
  isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // 手机号（中国大陆）
  isPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },

  // 身份证号（简单校验）
  isIdCard(id) {
    return /^\d{17}[\dXx]$/.test(id);
  },

  // 正数
  isPositive(num) {
    return Number(num) > 0;
  },

  // 日期格式 YYYY-MM-DD
  isDate(dateStr) {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
  },

  // 密码强度（至少6位）
  isPassword(password) {
    return password && password.length >= 6;
  },

  // 非空字符串
  isNonEmpty(str) {
    return typeof str === 'string' && str.trim().length > 0;
  },

  // UUID格式
  isUUID(str) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  },

  // 分页参数
  parsePagination(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 20));
    const offset = (page - 1) * pageSize;
    return { page, pageSize, offset };
  },

  // 注册表单验证
  validateRegistration(data) {
    const errors = [];
    if (!this.isEmail(data.email)) errors.push('邮箱格式不正确');
    if (!this.isNonEmpty(data.real_name)) errors.push('姓名不能为空');
    if (!this.isPassword(data.password)) errors.push('密码至少6位');
    if (data.password !== data.confirm_password) errors.push('两次密码不一致');
    if (!this.isPhone(data.phone)) errors.push('手机号格式不正确');
    if (data.id_card && !this.isIdCard(data.id_card)) errors.push('身份证号格式不正确');
    return errors;
  },

  // 工作记录验证
  validateRecord(data) {
    const errors = [];
    if (!this.isNonEmpty(data.group_id)) errors.push('请选择小组');
    if (!this.isDate(data.work_date)) errors.push('日期格式不正确');
    if (!Array.isArray(data.items) || data.items.length === 0) errors.push('请至少添加一条计件规格');
    for (const item of data.items) {
      if (!this.isNonEmpty(item.spec_id)) errors.push('请选择计件规格');
      if (!this.isPositive(item.quantity)) errors.push('数量必须大于0');
    }
    return errors;
  }
};

module.exports = validators;
