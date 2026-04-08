// 工资查询页面逻辑
let currentUserRole = null;
let currentUserId = null;
let currentUserDept = null;
let currentRecords = [];

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    currentUserRole = user.role;
    currentUserId = user.id;
    currentUserDept = user.department_id;

    // 根据角色调整页面元素显示/隐藏
    setupPermissions();

    await loadDepartments();
    await loadEmployees();

    // 绑定事件
    document.getElementById('searchBtn').addEventListener('click', search);
    document.getElementById('resetBtn').addEventListener('click', resetFilters);
    document.getElementById('exportBtn').addEventListener('click', exportCSV);
    document.getElementById('deptFilter').addEventListener('change', () => loadEmployees());
});

// 权限控制：员工无部门/员工筛选，部门经理只能选本部门
function setupPermissions() {
    const deptGroup = document.getElementById('deptGroup');
    const employeeGroup = document.getElementById('employeeGroup');

    if (currentUserRole === 'employee') {
        // 员工：隐藏部门和员工筛选，直接显示自己的工资
        deptGroup.style.display = 'none';
        employeeGroup.style.display = 'none';
        // 页面提示
        const hint = document.createElement('div');
        hint.className = 'message info';
        hint.textContent = '您正在查看自己的工资记录';
        document.querySelector('.filter-card').prepend(hint);
    } else if (currentUserRole === 'dept_manager') {
        // 部门经理：可见部门筛选，但只能选本部门（下拉框中只显示本部门）
        // 员工筛选仍然显示，但只显示本部门员工
        // 部门下拉框会在 loadDepartments 中只加载本部门
    }
    // 管理员：全部显示，无需额外处理
}

// 加载部门下拉（根据角色限制）
async function loadDepartments() {
    try {
        const result = await api.departments.all();
        let departments = result.data || [];
        if (currentUserRole === 'dept_manager') {
            departments = departments.filter(d => d.id === currentUserDept);
        }
        const select = document.getElementById('deptFilter');
        select.innerHTML = '<option value="">所有部门</option>';
        departments.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.name;
            select.appendChild(opt);
        });
        // 部门经理自动选中本部门
        if (currentUserRole === 'dept_manager' && departments.length === 1) {
            select.value = currentUserDept;
            await loadEmployees(); // 部门变化后重载员工
        }
    } catch (err) {
        console.error('加载部门失败:', err);
    }
}

// 加载员工下拉（根据部门经理权限及所选部门）
async function loadEmployees() {
    try {
        let params = { pageSize: 100 };
        const deptId = document.getElementById('deptFilter').value;

        if (currentUserRole === 'employee') {
            // 员工：只加载自己（但员工页面已隐藏下拉框，此处仅用于后端请求）
            params.employee_id = currentUserId;
        } else if (currentUserRole === 'dept_manager') {
            // 部门经理：只能看本部门员工（如果未选择部门，则默认为本部门）
            params.department_id = currentUserDept;
            if (deptId && deptId !== currentUserDept) {
                // 如果部门经理手动选择其他部门（理论上不可选），强制修正
                document.getElementById('deptFilter').value = currentUserDept;
            }
        } else if (currentUserRole === 'admin') {
            // 管理员：按所选部门筛选
            if (deptId) params.department_id = deptId;
        }

        const result = await api.users.list(params);
        let users = result.data.list || [];
        // 如果是部门经理，确保只显示本部门员工（二次过滤）
        if (currentUserRole === 'dept_manager') {
            users = users.filter(u => u.department_id === currentUserDept);
        }

        const select = document.getElementById('employeeFilter');
        select.innerHTML = '<option value="">所有员工</option>';
        users.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = u.real_name;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error('加载员工失败:', err);
    }
}

// 查询
async function search() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    let deptId = document.getElementById('deptFilter').value;
    let employeeId = document.getElementById('employeeFilter').value;

    if (!startDate || !endDate) {
        alert('请选择日期范围');
        return;
    }

    // 根据角色强制覆盖查询条件
    if (currentUserRole === 'employee') {
        employeeId = currentUserId;
        deptId = ''; // 员工不需要部门条件
    } else if (currentUserRole === 'dept_manager') {
        deptId = currentUserDept; // 部门经理强制本部门
        if (employeeId) {
            // 如果选择了员工，确保该员工属于本部门
            // 后端会做校验，前端无需额外处理
        }
    }

    const params = {
        start_date: startDate,
        end_date: endDate,
        department_id: deptId,
        employee_id: employeeId,
        pageSize: 10000
    };

    try {
        const result = await api.records.list(params);
        currentRecords = result.data.list || [];
        renderSummary(currentRecords, startDate, endDate);
        renderDetail(currentRecords);
    } catch (err) {
        console.error('查询失败:', err);
        alert('查询失败，请重试');
    }
}

// 渲染汇总表（按员工汇总总收入，个人收入累加）
function renderSummary(records, startDate, endDate) {
    const tbody = document.getElementById('summaryTable');
    if (records.length === 0) {
        tbody.innerHTML = '叭<td colspan="3">暂无数据</td>';
        return;
    }

    const employeeMap = new Map();
    for (const r of records) {
        const name = r.employee_name;
        const perPerson = parseFloat(r.per_person) || 0;
        employeeMap.set(name, (employeeMap.get(name) || 0) + perPerson);
    }

    const dateRange = `${startDate} 至 ${endDate}`;
    let html = '';
    for (const [name, total] of employeeMap) {
        html += `
            <tr>
                <td>${escapeHtml(name)}</td>
                <td>${dateRange}</td>
                <td>¥${total.toFixed(2)}</td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}

// 渲染明细表
function renderDetail(records) {
    const tbody = document.getElementById('detailTable');
    if (records.length === 0) {
        tbody.innerHTML = '叭<td colspan="6">暂无数据</td>';
        return;
    }

    let html = '';
    for (const r of records) {
        const groupTotal = r.group_total ? parseFloat(r.group_total).toFixed(2) : '0.00';
        const perPerson = r.per_person ? parseFloat(r.per_person).toFixed(2) : '0.00';
        html += `
            <tr>
                <td>${escapeHtml(r.work_date)}</td>
                <td>${escapeHtml(r.employee_name)}</td>
                <td>${escapeHtml(r.spec_name)}</td>
                <td>${r.quantity}</td>
                <td>¥${groupTotal}</td>
                <td>¥${perPerson}</td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}

// 导出明细 CSV
function exportCSV() {
    if (currentRecords.length === 0) {
        alert('没有数据可导出');
        return;
    }

    const headers = ['日期', '姓名', '计件规格', '数量', '小组总收入(元)', '人均收入(元)'];
    const rows = currentRecords.map(r => [
        r.work_date,
        r.employee_name,
        r.spec_name,
        r.quantity,
        parseFloat(r.group_total || 0).toFixed(2),
        parseFloat(r.per_person || 0).toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `工资明细_${new Date().toISOString().slice(0,19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 重置筛选条件
function resetFilters() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    if (currentUserRole !== 'employee') {
        document.getElementById('deptFilter').value = '';
        document.getElementById('employeeFilter').innerHTML = '<option value="">所有员工</option>';
        if (currentUserRole === 'dept_manager') {
            // 部门经理重置后，部门下拉应恢复为本部门
            document.getElementById('deptFilter').value = currentUserDept;
            loadEmployees();
        } else {
            loadEmployees();
        }
    }
    currentRecords = [];
    document.getElementById('summaryTable').innerHTML = '叭<td colspan="3">请选择条件后查询</td>';
    document.getElementById('detailTable').innerHTML = '叭<td colspan="6">请选择条件后查询</td>';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}