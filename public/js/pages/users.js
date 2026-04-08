// 用户管理页面逻辑
let currentPage = 1;
const pageSize = 20;
let currentUserRole = null;
let currentUserDept = null;

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    currentUserRole = user.role;
    currentUserDept = user.department_id;

    // 侧边栏用户信息
    document.getElementById('userName').textContent = user.real_name || '用户';
    document.getElementById('userRoleDisplay').textContent = {
        employee: '员工',
        dept_manager: '部门经理',
        admin: '管理员'
    }[user.role] || '未知';

    await loadDepartments();
    await loadUsers();

    document.getElementById('btnAddUser').addEventListener('click', () => showModal());
    document.getElementById('btnSearch').addEventListener('click', () => {
        currentPage = 1;
        loadUsers();
    });
    document.getElementById('btnReset').addEventListener('click', () => {
        document.getElementById('keyword').value = '';
        document.getElementById('roleFilter').value = '';
        currentPage = 1;
        loadUsers();
    });
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('userForm').addEventListener('submit', saveUser);
});

async function loadDepartments() {
    try {
        const result = await api.departments.all();
        const departments = result.data || [];
        const select = document.getElementById('userDept');
        select.innerHTML = '<option value="">选择部门</option>';
        select.disabled = false;
        departments.forEach(d => {
            const option = document.createElement('option');
            option.value = d.id;
            option.textContent = d.name;
            select.appendChild(option);
        });
        // 部门经理：自动选中本部门（不禁用，保持可见可提交）
        if (currentUserRole === 'dept_manager' && departments.length === 1) {
            select.value = departments[0].id;
        }
    } catch (err) {
        console.error('加载部门失败:', err);
    }
}

async function loadUsers() {
    try {
        const keyword = document.getElementById('keyword').value;
        const role = document.getElementById('roleFilter').value;
        const params = { page: currentPage, pageSize, keyword, role };
        if (currentUserRole === 'dept_manager') {
            params.department_id = currentUserDept;
        }
        const result = await api.users.list(params);
        const users = result.data.list || [];
        const total = result.data.total;
        renderTable(users);
        renderPagination(total);
    } catch (err) {
        console.error('加载用户失败:', err);
        document.getElementById('usersTable').innerHTML = '叭<td colspan="6" style="text-align:center">加载失败</td></tr>';
    }
}

function renderTable(users) {
    const tbody = document.getElementById('usersTable');
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">暂无数据</td></tr>';
        return;
    }
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${escapeHtml(u.real_name)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td>${roleText(u.role)}</td>
            <td>${escapeHtml(u.department_name || '-')}</td>
            <td>${u.status === 'approved' ? '已批准' : '待审核'}</td>
            <td>
                <button class="btn-secondary btn-edit" data-id="${u.id}">编辑</button>
                <button class="btn-danger btn-delete" data-id="${u.id}">删除</button>
                <button class="btn-secondary btn-reset" data-id="${u.id}">重置密码</button>
            </td>
        </tr>
    `).join('');

    document.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => editUser(btn.dataset.id)));
    document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', () => deleteUser(btn.dataset.id)));
    document.querySelectorAll('.btn-reset').forEach(btn => btn.addEventListener('click', () => resetPassword(btn.dataset.id)));
}

function roleText(role) {
    const map = { employee: '员工', dept_manager: '部门经理', admin: '管理员' };
    return map[role] || role;
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

function showModal(user = null) {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('modalTitle');
    const userIdField = document.getElementById('userId');
    const passwordGroup = document.getElementById('passwordGroup');

    if (user) {
        title.textContent = '编辑用户';
        userIdField.value = user.id;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userRealName').value = user.real_name;
        document.getElementById('userPhone').value = user.phone;
        document.getElementById('userIdCard').value = user.id_card || '';
        document.getElementById('userBankName').value = user.bank_name || '';
        document.getElementById('userBankCard').value = user.bank_card || '';
        document.getElementById('userBankBank').value = user.bank_bank || '';
        document.getElementById('userRole').value = user.role;
        document.getElementById('userPassword').value = '';
        passwordGroup.style.display = 'block';
        // 加载部门后再设置选中值
        loadDepartments().then(() => {
            document.getElementById('userDept').value = user.department_id || '';
        });
    } else {
        title.textContent = '新增用户';
        userIdField.value = '';
        document.getElementById('userForm').reset();
        passwordGroup.style.display = 'block';
        document.getElementById('userPassword').required = true;
        loadDepartments();
    }
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('userModal').classList.remove('active');
}

async function saveUser(e) {
    e.preventDefault();
    const userId = document.getElementById('userId').value;
    const isEdit = !!userId;

    const data = {
        email: document.getElementById('userEmail').value,
        real_name: document.getElementById('userRealName').value,
        phone: document.getElementById('userPhone').value,
        id_card: document.getElementById('userIdCard').value || null,
        bank_name: document.getElementById('userBankName').value || null,
        bank_card: document.getElementById('userBankCard').value || null,
        bank_bank: document.getElementById('userBankBank').value || null,
        department_id: document.getElementById('userDept').value,
        role: document.getElementById('userRole').value
    };

    const password = document.getElementById('userPassword').value;
    if (!isEdit) {
        if (!password) { alert('请填写密码'); return; }
        if (password.length < 6) { alert('密码至少6位'); return; }
        data.password = password;
    } else {
        if (password) {
            if (password.length < 6) { alert('密码至少6位'); return; }
            data.password = password;
        }
    }

    try {
        if (isEdit) {
            await api.users.update(userId, data);
            alert('用户信息已更新');
        } else {
            await api.users.create(data);
            alert('用户创建成功');
        }
        closeModal();
        loadUsers();
    } catch (err) {
        console.error('保存失败:', err);
        alert(err.message || '操作失败');
    }
}

async function editUser(id) {
    try {
        const res = await api.users.getById(id);
        const user = res.data;
        showModal(user);
    } catch (err) {
        console.error('获取用户详情失败:', err);
        alert('获取用户信息失败');
    }
}

async function deleteUser(id) {
    if (!confirm('确定删除此用户吗？')) return;
    try {
        await api.users.delete(id);
        alert('用户已删除');
        loadUsers();
    } catch (err) {
        alert('删除失败: ' + err.message);
    }
}

async function resetPassword(id) {
    const newPassword = prompt('请输入新密码（至少6位）');
    if (!newPassword) return;
    if (newPassword.length < 6) { alert('密码至少6位'); return; }
    try {
        await api.users.resetPassword(id, newPassword);
        alert('密码重置成功');
    } catch (err) {
        alert('重置失败: ' + err.message);
    }
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
            loadUsers();
        });
        container.appendChild(btn);
    }
}