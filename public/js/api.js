const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'   // 本地开发环境
  : '/api';

const api = {
  // 设置请求头
  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },

  // 通用请求方法
  async request(method, endpoint, data = null) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
      method,
      headers: this.getHeaders()
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '请求失败');
      }

      return result;
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  },

  // 认证
  auth: {
    register(data) { return api.request('POST', '/auth/register', data); },
    login(email, password) { return api.request('POST', '/auth/login', { email, password }); },
    getProfile() { return api.request('GET', '/auth/profile'); },
    updateProfile(data) { return api.request('PUT', '/auth/profile', data); },
    changePassword(old_password, new_password) {
      return api.request('POST', '/auth/change-password', { old_password, new_password });
    }
  },

  // 用户
  users: {
    list(query = {}) { return api.request('GET', `/users?${new URLSearchParams(query)}`); },
    getById(id) { return api.request('GET', `/users/${id}`); },
    create(data) { return api.request('POST', '/users', data); },
    update(id, data) { return api.request('PUT', `/users/${id}`, data); },
    delete(id) { return api.request('DELETE', `/users/${id}`); },
    resetPassword(id, new_password) { return api.request('POST', `/users/${id}/reset-password`, { new_password }); },
    exportCSV(query = {}) { return `${API_BASE}/users/export/csv?${new URLSearchParams(query)}`; }
  },

  // 部门
  departments: {
    list(query = {}) { return api.request('GET', `/departments?${new URLSearchParams(query)}`); },
    all() { return api.request('GET', '/departments/all'); },
    getById(id) { return api.request('GET', `/departments/${id}`); },
    create(data) { return api.request('POST', '/departments', data); },
    update(id, data) { return api.request('PUT', `/departments/${id}`, data); },
    delete(id) { return api.request('DELETE', `/departments/${id}`); },
    exportCSV(query = {}) { return `${API_BASE}/departments/export/csv?${new URLSearchParams(query)}`; }
  },

  // 小组
  groups: {
    list(query = {}) { return api.request('GET', `/groups?${new URLSearchParams(query)}`); },
    getByDepartment(deptId) { return api.request('GET', `/groups/by-department/${deptId}`); },
    getById(id) { return api.request('GET', `/groups/${id}`); },
    create(data) { return api.request('POST', '/groups', data); },
    updateMembers(id, member_ids) { return api.request('PUT', `/groups/${id}/members`, { member_ids }); },
    delete(id) { return api.request('DELETE', `/groups/${id}`); },
    exportCSV(query = {}) { return `${API_BASE}/groups/export/csv?${new URLSearchParams(query)}`; }
  },

  // 计件规格
  specs: {
    list(query = {}) { return api.request('GET', `/specs?${new URLSearchParams(query)}`); },
    active(deptId) { return api.request('GET', `/specs/active?department_id=${deptId}`); },
    getById(id) { return api.request('GET', `/specs/${id}`); },
    create(data) { return api.request('POST', '/specs', data); },
    update(id, data) { return api.request('PUT', `/specs/${id}`, data); },
    toggleActive(id) { return api.request('PATCH', `/specs/${id}/toggle`); },
    delete(id) { return api.request('DELETE', `/specs/${id}`); },
    exportCSV(query = {}) { return `${API_BASE}/specs/export/csv?${new URLSearchParams(query)}`; }
  },

  // 工作记录
  records: {
    list(query = {}) { return api.request('GET', `/records?${new URLSearchParams(query)}`); },
    getById(id) { return api.request('GET', `/records/${id}`); },
    create(data) { return api.request('POST', '/records', data); },
    delete(id) { return api.request('DELETE', `/records/${id}`); },
    exportCSV(query = {}) { return `${API_BASE}/records/export/csv?${new URLSearchParams(query)}`; }
  },

  // 工资单
  payrolls: {
    list(query = {}) { return api.request('GET', `/payrolls?${new URLSearchParams(query)}`); },
    getById(id) { return api.request('GET', `/payrolls/${id}`); },
    generate(period_start, period_end) { return api.request('POST', '/payrolls', { period_start, period_end }); },
    adjust(id, bonus, deduction) { return api.request('PATCH', `/payrolls/${id}/adjust`, { bonus, deduction }); },
    confirm(id) { return api.request('POST', `/payrolls/${id}/confirm`); },
    markPaid(id) { return api.request('POST', `/payrolls/${id}/pay`); },
    batchConfirm(ids) { return api.request('POST', '/payrolls/batch/confirm', { ids }); },
    batchPay(ids) { return api.request('POST', '/payrolls/batch/pay', { ids }); },
    exportCSV(query = {}) { return `${API_BASE}/payrolls/export/csv?${new URLSearchParams(query)}`; }
  },

  // 用户审核
  approvals: {
    getPending() { return api.request('GET', '/approvals'); },
    approve(id, data) { return api.request('POST', `/approvals/${id}/approve`, data); },
    reject(id) { return api.request('POST', `/approvals/${id}/reject`); }
  },

  // 数据看板
  dashboard: {
    getStats() { return api.request('GET', '/dashboard/stats'); }
  },

  // 审计日志
  audit: {
    list(query = {}) { return api.request('GET', `/audit?${new URLSearchParams(query)}`); },
    exportCSV(query = {}) { return `${API_BASE}/audit/export/csv?${new URLSearchParams(query)}`; }
  },

  // 数据维护
  maintenance: {
    getStats() { return api.request('GET', '/maintenance/stats'); },
    exportJSON() { return `${API_BASE}/maintenance/export/json`; },
    exportDepartments() { return `${API_BASE}/maintenance/export/departments`; },
    exportUsers() { return `${API_BASE}/maintenance/export/users`; },
    exportGroups() { return `${API_BASE}/maintenance/export/groups`; },
    exportSpecs() { return `${API_BASE}/maintenance/export/specs`; }
  }
};