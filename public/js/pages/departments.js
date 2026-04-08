// 部门管理页面逻辑
let currentPage = 1;
const pageSize = 20;
let currentUserRole = null;
let currentUserDept = null;

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    currentUserRole = user.role;
    currentUserDept = user.department_id;

    await loadDepartments();
    bindEvents();
    loadManagers(); // 预加载部门经理列表用于下拉框
});

function bindEvents() {
    document.getElementById('btnAdd').addEventListener('click', showAddModal);
}

// 加载部门列表
async function loadDepartments() {
    try {
        const params = { page: currentPage, pageSize };
        // 部门经理只能看本部门
        if (currentUserRole === 'dept_manager') {
            params.department_id = currentUserDept;
        }
        const res = await api.departments.list(params);
        const { list, total } = res.data;
        renderTable(list);
        renderPagination(total);
    } catch (err) {
        console.error('加载部门列表失败:', err);
        showMessage('加载失败', 'error');
    }
}

function renderTable(departments) {
    const tbody = document.querySelector('#departmentTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (departments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">暂无数据</td></tr>';
        return;
    }
    departments.forEach(dept => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = dept.name;
        row.insertCell(1).textContent = dept.manager_name || '-';
        row.insertCell(2).textContent = dept.member_count || 0;
        const actionCell = row.insertCell(3);
        
        // 编辑按钮
        const editBtn = document.createElement('button');
        editBtn.textContent = '编辑';
        editBtn.className = 'btn-secondary btn-edit';
        editBtn.style.marginRight = '8px';
        editBtn.addEventListener('click', () => showEditModal(dept));
        
        // 删除按钮
        const delBtn = document.createElement('button');
        delBtn.textContent = '删除';
        delBtn.className = 'btn-danger btn-delete';
        delBtn.addEventListener('click', () => deleteDepartment(dept.id));
        
        actionCell.appendChild(editBtn);
        actionCell.appendChild(delBtn);
    });
}

// 显示新增模态框
function showAddModal() {
    document.getElementById('deptId').value = '';
    document.getElementById('deptName').value = '';
    document.getElementById('deptManagerId').value = '';
    document.getElementById('deptDescription').value = '';
    document.getElementById('modalTitle').textContent = '新增部门';
    document.getElementById('deptModal').classList.add('active');
}

// 显示编辑模态框
function showEditModal(dept) {
    document.getElementById('deptId').value = dept.id;
    document.getElementById('deptName').value = dept.name;
    document.getElementById('deptManagerId').value = dept.manager_id || '';
    document.getElementById('deptDescription').value = dept.description || '';
    document.getElementById('modalTitle').textContent = '编辑部门';
    document.getElementById('deptModal').classList.add('active');
}

// 保存部门
async function saveDepartment() {
    const id = document.getElementById('deptId').value;
    const name = document.getElementById('deptName').value.trim();
    const manager_id = document.getElementById('deptManagerId').value || null;
    const description = document.getElementById('deptDescription').value;

    if (!name) {
        showMessage('部门名称不能为空', 'error');
        return;
    }

    try {
        if (id) {
            await api.departments.update(id, { name, manager_id, description });
            showMessage('更新成功', 'success');
        } else {
            await api.departments.create({ name, manager_id, description });
            showMessage('新增成功', 'success');
        }
        closeModal();
        loadDepartments();
    } catch (err) {
        console.error('保存失败:', err);
        showMessage(err.message || '操作失败', 'error');
    }
}

// 删除部门
async function deleteDepartment(id) {
    if (!confirm('确定删除该部门吗？删除后该部门下的员工、小组等数据也将被删除！')) return;
    try {
        await api.departments.delete(id);
        showMessage('删除成功', 'success');
        loadDepartments();
    } catch (err) {
        console.error('删除失败:', err);
        showMessage(err.message || '删除失败', 'error');
    }
}

// 加载部门经理下拉列表
async function loadManagers() {
    try {
        const res = await api.users.list({ role: 'dept_manager', pageSize: 100 });
        const managers = res.data.list || [];
        const select = document.getElementById('deptManagerId');
        select.innerHTML = '<option value="">请选择部门经理</option>';
        managers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.real_name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('加载经理列表失败:', err);
    }
}

function closeModal() {
    document.getElementById('deptModal').classList.remove('active');
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
            loadDepartments();
        });
        container.appendChild(btn);
    }
}

function showMessage(msg, type) {
    const msgDiv = document.getElementById('message');
    if (msgDiv) {
        msgDiv.textContent = msg;
        msgDiv.className = `message ${type}`;
        msgDiv.style.display = 'block';
        setTimeout(() => {
            msgDiv.style.display = 'none';
        }, 3000);
    } else {
        alert(msg);
    }
}

// 暴露给全局（因为模态框按钮使用了 onclick，但这里已用事件监听，不再需要）
window.closeModal = closeModal;
window.saveDepartment = saveDepartment;