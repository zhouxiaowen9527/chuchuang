const db = require('../config/database');
const UserModel = require('../models/user');
const DepartmentModel = require('../models/department');
const GroupModel = require('../models/group');
const SpecModel = require('../models/spec');
const RecordModel = require('../models/record');
const PayrollModel = require('../models/payroll');

const ExportService = {
  // 导出为CSV字符串
  toCSV(headers, rows) {
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel
    const headerLine = headers.map(h => `"${h}"`).join(',');
    const dataLines = rows.map(row =>
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    );
    return BOM + [headerLine, ...dataLines].join('\n');
  },

  // 导出工作记录
  async exportRecords(filters) {
    const result = await RecordModel.findList({ ...filters, page: 1, pageSize: 10000, offset: 0 });
    const headers = ['日期', '部门', '小组', '员工', '计件规格', '数量', '单价', '人均收入', '备注'];
    const rows = result.list.map(r => ({
      '日期': r.work_date,
      '部门': r.department_name,
      '小组': r.group_name,
      '员工': r.employee_name,
      '计件规格': r.spec_name,
      '数量': r.quantity,
      '单价': r.unit_price,
      '人均收入': r.total_amount,
      '备注': r.notes || ''
    }));
    return this.toCSV(headers, rows);
  },

  // 导出工资单
  async exportPayrolls(filters) {
    const result = await PayrollModel.findList({ ...filters, page: 1, pageSize: 10000, offset: 0 });
    const headers = ['姓名', '部门', '小组', '周期开始', '周期结束', '计件工资', '奖金', '扣除', '实发工资', '状态'];
    const rows = result.list.map(r => ({
      '姓名': r.employee_name,
      '部门': r.department_name,
      '小组': r.group_name || '',
      '周期开始': r.period_start,
      '周期结束': r.period_end,
      '计件工资': r.piecework_amount,
      '奖金': r.bonus,
      '扣除': r.deduction,
      '实发工资': r.total_amount,
      '状态': r.status
    }));
    return this.toCSV(headers, rows);
  },

  // 导出审计日志
  async exportAuditLogs(filters) {
    const AuditLogModel = require('../models/auditLog');
    const result = await AuditLogModel.findList({ ...filters, page: 1, pageSize: 10000, offset: 0 });
    const headers = ['时间', '操作人', '操作', '实体类型', '实体ID', 'IP地址'];
    const rows = result.list.map(r => ({
      '时间': r.created_at,
      '操作人': r.user_name || '',
      '操作': r.action,
      '实体类型': r.entity_type,
      '实体ID': r.entity_id || '',
      'IP地址': r.ip_address || ''
    }));
    return this.toCSV(headers, rows);
  },

  // 导出部门表
  async exportDepartments() {
    const result = await DepartmentModel.findList({ page: 1, pageSize: 1000, offset: 0 });
    const headers = ['部门名称', '描述', '经理', '创建时间'];
    const rows = result.list.map(r => ({
      '部门名称': r.name,
      '描述': r.description || '',
      '经理': r.manager_name || '',
      '创建时间': r.created_at
    }));
    return this.toCSV(headers, rows);
  },

  // 导出员工表
  async exportUsers() {
    const result = await UserModel.findList({ page: 1, pageSize: 100000, offset: 0 });
    const headers = ['姓名', '邮箱', '手机', '角色', '状态', '部门', '身份证', '银行卡', '开户行', '创建时间'];
    const rows = result.list.map(r => ({
      '姓名': r.real_name,
      '邮箱': r.email,
      '手机': r.phone || '',
      '角色': { employee: '员工', dept_manager: '部门经理', admin: '管理员' }[r.role] || r.role,
      '状态': { pending: '待审核', approved: '已批准' }[r.status] || r.status,
      '部门': r.department_name || '',
      '身份证': r.id_card || '',
      '银行卡': r.bank_card || '',
      '开户行': r.bank_bank || '',
      '创建时间': r.created_at
    }));
    return this.toCSV(headers, rows);
  },

  // 导出小组表
  async exportGroups() {
    const result = await GroupModel.findList({ page: 1, pageSize: 1000, offset: 0 });
    const headers = ['小组名称', '部门', '成员数', '创建时间'];
    const rows = result.list.map(r => ({
      '小组名称': r.name,
      '部门': r.department_name || '',
      '成员数': r.member_count || 0,
      '创建时间': r.created_at
    }));
    return this.toCSV(headers, rows);
  },

  // 导出计件规格表
  async exportSpecs() {
    const result = await SpecModel.findList({ page: 1, pageSize: 1000, offset: 0 });
    const headers = ['规格名称', '编码', '部门', '单位', '单价', '状态', '创建时间'];
    const rows = result.list.map(r => ({
      '规格名称': r.name,
      '编码': r.code || '',
      '部门': r.department_name || '',
      '单位': r.unit,
      '单价': r.unit_price,
      '状态': r.is_active ? '启用' : '停用',
      '创建时间': r.created_at
    }));
    return this.toCSV(headers, rows);
  },

  // 全量数据备份（JSON）
  async exportAll() {
    const [users, departments, groups, specs, records, payrolls] = await Promise.all([
      UserModel.findList({ page: 1, pageSize: 100000, offset: 0 }),
      DepartmentModel.findList({ page: 1, pageSize: 1000, offset: 0 }),
      GroupModel.findList({ page: 1, pageSize: 1000, offset: 0 }),
      SpecModel.findList({ page: 1, pageSize: 1000, offset: 0 }),
      RecordModel.findList({ page: 1, pageSize: 100000, offset: 0 }),
      PayrollModel.findList({ page: 1, pageSize: 100000, offset: 0 })
    ]);

    return JSON.stringify({
      exported_at: new Date().toISOString(),
      users: users.list,
      departments: departments.list,
      groups: groups.list,
      specs: specs.list,
      records: records.list,
      payrolls: payrolls.list
    }, null, 2);
  }
};

module.exports = ExportService;
