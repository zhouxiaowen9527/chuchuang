// 数据看板页面逻辑
document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // 更新时间
    setInterval(() => {
        const now = new Date();
        document.getElementById('currentTime').textContent = now.toLocaleString('zh-CN');
    }, 1000);

    // 加载统计数据
    try {
        const result = await api.dashboard.getStats();
        const stats = result.data;

        // 欢迎语
        const hour = new Date().getHours();
        const greeting = hour < 12 ? '上午好' : hour < 18 ? '下午好' : '晚上好';
        document.getElementById('welcomeText').textContent = `${greeting}，${user.real_name}！`;
        document.getElementById('welcomeSubtext').textContent = stats.current_month;

        // 根据角色设置副标题
        if (user.role === 'admin') {
            document.getElementById('recordUnit').textContent = '本月全员记录';
            document.getElementById('amountUnit').textContent = '全员合计';
        } else if (user.role === 'dept_manager') {
            document.getElementById('recordUnit').textContent = '本月部门记录';
            document.getElementById('amountUnit').textContent = '部门合计';
        } else {
            document.getElementById('recordUnit').textContent = '本月我的记录';
            document.getElementById('amountUnit').textContent = '我的合计';
        }

        // 通用统计
        document.getElementById('recordCount').textContent = stats.record_count || 0;
        document.getElementById('totalAmount').textContent = '¥' + (stats.total_amount || 0).toFixed(2);
        document.getElementById('departmentName').textContent = stats.department || '-';
        document.getElementById('pendingCount').textContent = stats.pending_approvals || 0;

        // 待审核卡片：员工隐藏，管理员和部门经理显示
        document.getElementById('pendingCard').style.display = user.role === 'employee' ? 'none' : 'block';

        // 管理员统计
        if (user.role === 'admin') {
            document.getElementById('adminStats').style.display = 'block';
            document.getElementById('userCount').textContent = stats.user_count || 0;
            document.getElementById('deptCount').textContent = stats.department_count || 0;
            document.getElementById('groupCount').textContent = stats.group_count || 0;
            document.getElementById('specCount').textContent = stats.spec_count || 0;
            document.getElementById('totalRecordCount').textContent = stats.record_count || 0;
            document.getElementById('payrollCount').textContent = stats.payroll_count || 0;
            // 管理员显示所有快捷入口
            document.getElementById('approvalsBtn').style.display = 'inline-block';
            document.getElementById('usersBtn').style.display = 'inline-block';
            document.getElementById('groupsBtn').style.display = 'inline-block';
            document.getElementById('specsBtn').style.display = 'inline-block';
            document.getElementById('deptBtn').style.display = 'inline-block';
            document.getElementById('maintenanceBtn').style.display = 'inline-block';
        } else if (user.role === 'dept_manager') {
            // 部门经理显示：用户审核、用户管理、小组管理、计件管理
            document.getElementById('approvalsBtn').style.display = 'inline-block';
            document.getElementById('usersBtn').style.display = 'inline-block';
            document.getElementById('groupsBtn').style.display = 'inline-block';
            document.getElementById('specsBtn').style.display = 'inline-block';
        }
    } catch (err) {
        console.error('加载统计数据失败:', err);
    }
});