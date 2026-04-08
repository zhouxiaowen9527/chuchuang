// 小组管理页面逻辑
let currentPage = 1;
const pageSize = 100;
let currentUserRole = null;
let currentUserDept = null;
let allUsers = [];      // 缓存所有可成为成员的用户（员工 + 部门经理）

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    currentUserRole = user.role;
    currentUserDept = user.department_id;

    await loadDepartments();
    await loadUsersForSelect();   // 加载员工和部门经理用于成员选择
    await loadGroups();

    // 绑定事件
    document.getElementById('btnAddGroup').addEventListener('click', () => showModal());
    document.getElementById('addMemberBtn').addEventListener('click', addMember);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('groupForm').addEventListener('submit', saveGroup);
});

// 加载部门下拉（根据角色限制）
async function loadDepartments() {
    try {
        const result = await api.departments.all();
        let departments = result.data || [];
        if (currentUserRole === 'dept_manager') {
            departments = departments.filter(d => d.id === currentUserDept);
        }
        const select = document.getElementById('groupDept');
        select.innerHTML = '<option value="">选择部门</option>';
        departments.forEach(d => {
            const option = document.createElement('option');
            option.value = d.id;
            option.textContent = d.name;
            select.appendChild(option);
        });
        // 部门经理默认选中本部门
        if (currentUserRole === 'dept_manager' && departments.length === 1) {
            select.value = currentUserDept;
        }
    } catch (err) {
        console.error('加载部门失败:', err);
    }
}

// 加载所有可成为成员的用户（员工 + 部门经理）
async function loadUsersForSelect() {
    try {
        // 同时获取员工和部门经理
        const [employeeRes, managerRes] = await Promise.all([
            api.users.list({ role: 'employee', pageSize: 1000 }),
            api.users.list({ role: 'dept_manager', pageSize: 1000 })
        ]);
        let employees = employeeRes.data.list || [];
        let managers = managerRes.data.list || [];
        allUsers = [...employees, ...managers];
        // 部门经理只能看到本部门的用户
        if (currentUserRole === 'dept_manager') {
            allUsers = allUsers.filter(u => u.department_id === currentUserDept);
        }
        // 去重（防止同一个人既是员工又是经理，但角色唯一，一般不会重复）
        const uniqueMap = new Map();
        allUsers.forEach(u => uniqueMap.set(u.id, u));
        allUsers = Array.from(uniqueMap.values());
    } catch (err) {
        console.error('加载成员列表失败:', err);
    }
}

// 加载小组列表
async function loadGroups() {
    try {
        const params = { page: currentPage, pageSize };
        if (currentUserRole === 'dept_manager') {
            params.department_id = currentUserDept;
        }
        const result = await api.groups.list(params);
        const groups = result.data.list || [];
        const total = result.data.total;
        renderTable(groups);
        renderPagination(total);
    } catch (err) {
        console.error('加载小组失败:', err);
        document.getElementById('groupsTable').innerHTML = '<tr><td colspan="5" style="text-align:center">加载失败</td></tr>';
    }
}

function renderTable(groups) {
    const tbody = document.getElementById('groupsTable');
    if (groups.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">暂无数据</td></tr>';
        return;
    }
    tbody.innerHTML = groups.map(g => `
        <tr>
            <td>${escapeHtml(g.name)}</td>
            <td>${escapeHtml(g.department_name || '-')}</td>
            <td>${g.member_count}</td>
            <td>${g.members ? g.members.map(m => escapeHtml(m.real_name)).join(', ') : '-'}</td>
            <td>
                <button class="btn-danger btn-delete" data-id="${g.id}">删除</button>
            </td>
        </tr>
    `).join('');

    // 绑定删除事件
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteGroup(btn.dataset.id));
    });
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

function renderPagination(total) {
    const totalPages = Math.ceil(total / pageSize);
    const container = document.getElementById('pagination');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === currentPage) btn.classList.add('active');
        btn.addEventListener('click', () => {
            currentPage = i;
            loadGroups();
        });
        container.appendChild(btn);
    }
}

function showModal(group = null) {
    const modal = document.getElementById('groupModal');
    const title = document.getElementById('modalTitle');
    const groupIdField = document.getElementById('groupId');
    const membersList = document.getElementById('membersList');

    if (group) {
        // 编辑模式（目前只支持新增，但保留结构）
        title.textContent = '编辑小组';
        groupIdField.value = group.id;
        document.getElementById('groupDept').value = group.department_id;
        // 加载成员（需要后端返回成员列表）
        // 此处暂不实现，可留待后续
    } else {
        title.textContent = '新增小组';
        groupIdField.value = '';
        document.getElementById('groupDept').value = '';
        membersList.innerHTML = '';
        addMember(); // 默认添加1个成员选择框
    }
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('groupModal').classList.remove('active');
}

function addMember() {
    const container = document.getElementById('membersList');
    if (container.children.length >= 4) {
        alert('最多只能添加4个成员');
        return;
    }
    const item = document.createElement('div');
    item.className = 'member-item';
    item.innerHTML = `
        <select class="member-select" required>
            <option value="">选择成员</option>
            ${allUsers.map(u => `<option value="${u.id}">${escapeHtml(u.real_name)} (${u.role === 'dept_manager' ? '经理' : '员工'})</option>`).join('')}
        </select>
        <button type="button" class="btn-danger" onclick="this.parentElement.remove()">删除</button>
    `;
    container.appendChild(item);
}

async function saveGroup(e) {
    e.preventDefault();
    const groupId = document.getElementById('groupId').value;
    const departmentId = document.getElementById('groupDept').value;
    if (!departmentId) {
        alert('请选择部门');
        return;
    }
    const memberSelects = document.querySelectorAll('#membersList .member-select');
    const memberIds = Array.from(memberSelects)
        .map(select => select.value)
        .filter(id => id !== '');

    if (memberIds.length === 0) {
        alert('请至少选择一名成员');
        return;
    }

    try {
        if (groupId) {
            // 编辑小组（未实现，可扩展）
            alert('编辑功能开发中');
        } else {
            // 新增小组
            await api.groups.create({
                department_id: departmentId,
                member_ids: memberIds
            });
            alert('小组创建成功');
        }
        closeModal();
        loadGroups();
    } catch (err) {
        console.error('保存小组失败:', err);
        alert(err.message || '操作失败');
    }
}

async function deleteGroup(id) {
    if (!confirm('确定删除此小组吗？删除后相关工作记录将受影响。')) return;
    try {
        await api.groups.delete(id);
        alert('小组已删除');
        loadGroups();
    } catch (err) {
        alert('删除失败: ' + err.message);
    }
}