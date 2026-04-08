const RecordService = require('../services/recordService');
const RecordModel = require('../models/record');
const PayrollService = require('../services/payrollService');
const UserService = require('../services/userService');
const DepartmentService = require('../services/departmentService');
const GroupService = require('../services/groupService');
const SpecService = require('../services/specService');
const { success, error } = require('../utils/response');
const { getCurrentMonth } = require('../utils/formatters');

const DashboardController = {
  async getStats(req, res, next) {
    try {
      const { role, id: userId, department_id } = req.user;
      const { start, end } = getCurrentMonth();

      // 基础统计结构
      let stats = {
        role_label: { employee: '员工', dept_manager: '部门经理', admin: '管理员' }[role],
        current_month: `${start} 至 ${end}`,
        record_count: 0,
        total_amount: 0,
        department: '-',
        pending_approvals: 0
      };

      // 安全获取用户信息
      try {
        const user = await UserService.getById(userId);
        stats.department = user?.department_name || '-';
      } catch (e) {}

      // 根据角色获取统计（工资合计从 records 表实时计算）
      try {
        if (role === 'employee') {
          // 员工：个人工作记录数 + 个人工资合计（从 records 表）
          stats.record_count = await RecordModel.countByEmployeeAndPeriod(userId, start, end);
          stats.total_amount = await RecordModel.sumByEmployeeAndPeriod(userId, start, end);
        } else if (role === 'dept_manager') {
          // 部门经理：本部门工作记录数 + 本部门工资合计（从 records 表）
          stats.record_count = await RecordModel.countByDepartmentAndPeriod(department_id, start, end);
          stats.total_amount = await RecordModel.sumByDepartmentAndPeriod(department_id, start, end);
          const pendingUsers = await UserService.getPendingUsers(department_id);
          stats.pending_approvals = pendingUsers?.total || 0;
        } else if (role === 'admin') {
          // 管理员：全局工作记录数 + 全局工资合计（从 records 表） + 系统统计
          const [userCount, deptCount, groupCount, specCount, payrollCount] = await Promise.all([
            UserService.getList({ page: 1, pageSize: 1 }).then(r => r.total).catch(() => 0),
            DepartmentService.getList({ page: 1, pageSize: 1 }).then(r => r.total).catch(() => 0),
            GroupService.getList({ page: 1, pageSize: 1 }).then(r => r.total).catch(() => 0),
            SpecService.getList({ page: 1, pageSize: 1 }).then(r => r.total).catch(() => 0),
            PayrollService.getList({ page: 1, pageSize: 1 }).then(r => r.total).catch(() => 0)
          ]);
          
          // 管理员看全局统计（从 records 表）
          stats.record_count = await RecordModel.countAllByPeriod(start, end);
          stats.total_amount = await RecordModel.sumAllByPeriod(start, end);
          const pendingUsers = await UserService.getPendingUsers(null).catch(() => ({ total: 0 }));
          
          stats.user_count = userCount || 0;
          stats.department_count = deptCount || 0;
          stats.group_count = groupCount || 0;
          stats.spec_count = specCount || 0;
          stats.payroll_count = payrollCount || 0;
          stats.pending_approvals = pendingUsers?.total || 0;
          stats.department = '系统';
        }
      } catch (e) {
        console.error('Dashboard 统计查询失败:', e);
      }

      success(res, stats);
    } catch (err) {
      console.error('DashboardController.getStats 错误:', err);
      // 返回空数据，不中断前端显示
      success(res, {
        role_label: '未知',
        current_month: '-',
        record_count: 0,
        total_amount: 0,
        department: '-',
        pending_approvals: 0
      });
    }
  }
};

module.exports = DashboardController;