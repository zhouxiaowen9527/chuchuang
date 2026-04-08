// 用户审核页面逻辑
let currentUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadDepartments();
    await loadPendingUsers();

    // 绑定模态框按钮事件
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
    document.getElementById('approveForm').addEventListener('submit', approveUser);
});

// 加载部门下拉
async function loadDepartments() {
    try {
        const result = await api.departments.all();
        const depts = result.data || [];
        const select = document.getElementById('approveDept');
        select.innerHTML = '<option value="">选择部门</option>';
        depts.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('加载部门失败:', err);
    }
}

// 加载待审核用户列表
async function loadPendingUsers() {
    try {
        const result = await api.approvals.getPending();
        // 兼容两种返回格式：直接数组或 { list: [] }
        let users = result.data;
        if (users && Array.isArray(users.list)) users = users.list;
        else if (!Array.isArray(users)) users = [];
        const container = document.getElementById('approvalsList');

        if (users.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px;">暂无待审核用户</p>';
            return;
        }

        container.innerHTML = '';
        users.forEach(u => {
            const div = document.createElement('div');
            div.className = 'approval-item';
            div.innerHTML = `
                <div class="approval-info">
                    <div class="approval-name"><strong>${escapeHtml(u.real_name)}</strong> <span class="approval-email">(${escapeHtml(u.email)})</span></div>
                    <div class="approval-detail">
                        <span>📞 ${escapeHtml(u.phone || '-')}</span>
                        <span>🪪 ${escapeHtml(u.id_card || '-')}</span>
                    </div>
                    <div class="approval-detail">
                        <span>🏦 ${escapeHtml(u.bank_name || '-')} ${escapeHtml(u.bank_card || '')}</span>
                    </div>
                    <div class="approval-time">申请时间：${new Date(u.created_at).toLocaleString('zh-CN')}</div>
                </div>
                <div class="approval-actions">
                    <button class="btn-success" data-id="${u.id}" data-name="${escapeHtml(u.real_name)}" data-email="${escapeHtml(u.email)}">批准</button>
                    <button class="btn-danger" data-id="${u.id}">拒绝</button>
                </div>
            `;
            container.appendChild(div);
        });

        // 绑定批准按钮事件
        document.querySelectorAll('.btn-success[data-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                const email = btn.getAttribute('data-email');
                showApproveModal(id, name, email);
            });
        });
        // 绑定拒绝按钮事件
        document.querySelectorAll('.btn-danger[data-id]').forEach(btn => {
            btn.addEventListener('click', () => rejectUser(btn.getAttribute('data-id')));
        });
    } catch (err) {
        console.error('加载待审核用户失败:', err);
        document.getElementById('approvalsList').innerHTML = '<p style="text-align:center;color:red;">加载失败，请重试</p>';
    }
}

function showApproveModal(userId, name, email) {
    currentUserId = userId;
    document.getElementById('approveUserId').value = userId;
    document.getElementById('approveName').value = name;
    document.getElementById('approveEmail').value = email;
    // 清空部门下拉，但保留选项
    document.getElementById('approveDept').value = '';
    document.getElementById('approveRole').value = 'employee';
    document.getElementById('approveModal').classList.add('active');
}

function closeModal() {
    document.getElementById('approveModal').classList.remove('active');
}

async function approveUser(e) {
    e.preventDefault();
    const userId = document.getElementById('approveUserId').value;
    const name = document.getElementById('approveName').value.trim();
    const deptId = document.getElementById('approveDept').value;
    const role = document.getElementById('approveRole').value;

    if (!name) {
        alert('姓名不能为空');
        return;
    }
    if (!deptId) {
        alert('请选择部门');
        return;
    }

    try {
        await api.approvals.approve(userId, {
            real_name: name,
            department_id: deptId,
            role: role
        });
        alert('用户已批准');
        closeModal();
        loadPendingUsers(); // 刷新列表
    } catch (err) {
        console.error('批准失败:', err);
        alert(err.message || '批准失败，请重试');
    }
}

async function rejectUser(userId) {
    if (!confirm('确定拒绝此用户吗？')) return;
    try {
        await api.approvals.reject(userId);
        alert('用户已拒绝');
        loadPendingUsers(); // 刷新列表
    } catch (err) {
        console.error('拒绝失败:', err);
        alert(err.message || '拒绝失败，请重试');
    }
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