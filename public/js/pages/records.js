// 工作记录页面逻辑
let currentUserRole = null;
let currentUserDept = null;
let currentPage = 1;
const pageSize = 20;
let currentSpecs = [];

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    currentUserRole = user.role;
    currentUserDept = user.department_id;

    // 员工不需要部门筛选和新增按钮
    if (currentUserRole === 'employee') {
        // 隐藏部门、小组筛选（员工只看自己的记录）
        const filterSection = document.querySelector('.filter-section');
        if (filterSection) {
            filterSection.querySelectorAll('.form-group').forEach((g, i) => {
                if (i < 2) g.style.display = 'none'; // 部门、小组
            });
        }
        // 隐藏新增按钮
        const addBtn = document.getElementById('btnAddRecord');
        if (addBtn) addBtn.style.display = 'none';
    } else {
        await loadDepartmentFilters();
    }
    await loadRecords();

    // 绑定事件
    document.getElementById('btnAddRecord').addEventListener('click', showCreateModal);
    document.getElementById('btnSearch').addEventListener('click', () => { currentPage = 1; loadRecords(); });
    document.getElementById('btnReset').addEventListener('click', resetFilters);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('recordForm').addEventListener('submit', saveRecord);
    document.getElementById('btnAddSpec').addEventListener('click', () => addSpecRow());
    document.getElementById('recordDept').addEventListener('change', onDeptChange);
    document.getElementById('groupSearch').addEventListener('change', handleGroupSelect);
    document.getElementById('filterDept').addEventListener('change', onFilterDeptChange);
});

// 加载部门筛选下拉
async function loadDepartmentFilters() {
    try {
        const result = await api.departments.all();
        let departments = result.data || [];
        const filterDept = document.getElementById('filterDept');
        filterDept.innerHTML = '<option value="">所有部门</option>';
        filterDept.disabled = false;
        departments.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.name;
            filterDept.appendChild(opt);
        });
        // 部门经理：自动选中本部门并加载小组
        if (currentUserRole === 'dept_manager' && departments.length === 1) {
            filterDept.value = departments[0].id;
            await onFilterDeptChange();
        }
    } catch (err) {
        console.error('加载部门筛选失败:', err);
    }
}

// 部门筛选变化时加载对应小组列表
async function onFilterDeptChange() {
    const deptId = document.getElementById('filterDept').value;
    const filterGroupSearch = document.getElementById('filterGroupSearch');
    const filterGroupList = document.getElementById('filterGroupList');
    if (deptId) {
        try {
            const result = await api.groups.list({ department_id: deptId, pageSize: 100 });
            let groups = [];
            if (result.data && Array.isArray(result.data.list)) groups = result.data.list;
            else if (Array.isArray(result.data)) groups = result.data;
            filterGroupList.innerHTML = '';
            groups.forEach(g => {
                const option = document.createElement('option');
                option.value = g.name;
                option.setAttribute('data-id', g.id);
                filterGroupList.appendChild(option);
            });
            filterGroupSearch.value = '';
        } catch (err) {
            console.error('加载筛选小组失败:', err);
        }
    } else {
        filterGroupList.innerHTML = '';
        filterGroupSearch.value = '';
    }
}

// 加载工作记录列表
async function loadRecords() {
    try {
        const deptId = document.getElementById('filterDept').value;
        const groupInput = document.getElementById('filterGroupSearch');
        const groupName = groupInput.value;
        let groupId = '';
        if (groupName) {
            const datalist = document.getElementById('filterGroupList');
            const options = datalist.querySelectorAll('option');
            for (let opt of options) {
                if (opt.value === groupName) {
                    groupId = opt.getAttribute('data-id');
                    break;
                }
            }
        }
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const params = {
            page: currentPage,
            pageSize,
            department_id: deptId,
            group_id: groupId,
            start_date: startDate,
            end_date: endDate
        };
        const result = await api.records.list(params);
        const records = result.data.list || [];
        const total = result.data.total;
        renderTable(records);
        renderPagination(total);
    } catch (err) {
        console.error('加载记录失败:', err);
        document.getElementById('recordsTable').innerHTML = '<tr><td colspan="8">加载失败</td></tr>';
    }
}

function renderTable(records) {
    const tbody = document.getElementById('recordsTable');
    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">暂无数据</td></tr>';
        return;
    }

    let html = '';
    for (const r of records) {
        const memberCount = parseInt(r.member_count) || 1;
        // 该规格的小组总收入 = 人均收入 × 成员数
        const specGroupTotal = (parseFloat(r.total_amount) * memberCount).toFixed(2);
        const perPerson = parseFloat(r.total_amount).toFixed(2);

        const showDelete = currentUserRole !== 'employee';
        html += `
            <tr>
                <td>${escapeHtml(r.work_date)}</td>
                <td>${escapeHtml(r.employee_name)}</td>
                <td>${escapeHtml(r.group_name)}</td>
                <td>${escapeHtml(r.spec_name)}</td>
                <td>${r.quantity}</td>
                <td>¥${specGroupTotal}</td>
                <td>¥${perPerson}</td>
                <td>${showDelete ? `<button class="btn-danger btn-delete" data-id="${r.id}">删除</button>` : '-'}</td>
            </tr>
        `;
    }
    tbody.innerHTML = html;

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteRecord(btn.dataset.id));
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
            loadRecords();
        });
        container.appendChild(btn);
    }
}

function resetFilters() {
    document.getElementById('filterDept').value = '';
    document.getElementById('filterGroupSearch').value = '';
    document.getElementById('filterGroupList').innerHTML = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    currentPage = 1;
    loadRecords();
}

// -------------------- 新增记录模态框逻辑 --------------------
function showCreateModal() {
    document.getElementById('modalTitle').textContent = '新增工作记录';
    document.getElementById('recordId').value = '';
    document.getElementById('recordForm').reset();
    document.getElementById('specsContainer').innerHTML = '';
    addSpecRow();
    document.getElementById('totalIncome').textContent = '0.00';
    document.getElementById('perPersonIncome').textContent = '0.00';
    loadModalDepartments();
    document.getElementById('recordModal').classList.add('active');
}

async function loadModalDepartments() {
    try {
        const result = await api.departments.all();
        const departments = result.data || [];
        const select = document.getElementById('recordDept');
        select.innerHTML = '<option value="">选择部门</option>';
        select.disabled = false;
        departments.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.name;
            select.appendChild(opt);
        });
        // 部门经理：自动选中本部门并触发加载小组和规格
        if (currentUserRole === 'dept_manager' && departments.length === 1) {
            select.value = departments[0].id;
            await onDeptChange();
        }
    } catch (err) {
        console.error('加载部门失败:', err);
        alert('加载部门失败');
    }
}

async function onDeptChange() {
    const deptId = document.getElementById('recordDept').value;
    if (deptId) {
        await loadGroups(deptId);
        await loadSpecs(deptId);
    } else {
        document.getElementById('groupList').innerHTML = '';
        document.getElementById('groupSearch').value = '';
        document.getElementById('selectedGroupId').value = '';
        document.getElementById('specsContainer').innerHTML = '';
    }
}

async function loadGroups(departmentId) {
    try {
        const result = await api.groups.list({ department_id: departmentId, pageSize: 100 });
        let groups = [];
        if (result.data && Array.isArray(result.data.list)) groups = result.data.list;
        else if (Array.isArray(result.data)) groups = result.data;
        const datalist = document.getElementById('groupList');
        datalist.innerHTML = '';
        groups.forEach(g => {
            const option = document.createElement('option');
            option.value = g.name;
            option.setAttribute('data-id', g.id);
            datalist.appendChild(option);
        });
        document.getElementById('groupSearch').value = '';
        document.getElementById('selectedGroupId').value = '';
    } catch (err) {
        console.error('加载小组失败:', err);
        alert('加载小组列表失败');
    }
}

function handleGroupSelect(e) {
    const input = e.target;
    const selectedName = input.value;
    const datalist = document.getElementById('groupList');
    const options = datalist.querySelectorAll('option');
    let found = false;
    for (let opt of options) {
        if (opt.value === selectedName) {
            document.getElementById('selectedGroupId').value = opt.getAttribute('data-id');
            found = true;
            break;
        }
    }
    if (!found) document.getElementById('selectedGroupId').value = '';
}

async function loadSpecs(departmentId) {
    try {
        const result = await api.specs.active(departmentId);
        currentSpecs = result.data && Array.isArray(result.data) ? result.data : (result.data.list || []);
        const container = document.getElementById('specsContainer');
        if (container) container.innerHTML = '';
        addSpecRow();
    } catch (err) {
        console.error('加载规格失败:', err);
        alert('加载计件规格失败');
    }
}

function addSpecRow() {
    const container = document.getElementById('specsContainer');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'spec-row';
    row.innerHTML = `
        <select class="spec-select" required>
            <option value="">选择规格</option>
            ${currentSpecs.map(s => `<option value="${s.id}" data-price="${s.unit_price}">${s.name} (${s.unit}) - ¥${s.unit_price}</option>`).join('')}
        </select>
        <input type="number" class="spec-quantity" placeholder="数量" step="0.01" required>
        <button type="button" class="btn-remove-spec">删除</button>
    `;
    container.appendChild(row);
    row.querySelector('.btn-remove-spec').addEventListener('click', () => {
        if (container.children.length > 1) {
            row.remove();
            updateTotalPreview();
        } else {
            alert('至少保留一行规格');
        }
    });
    row.querySelector('.spec-select').addEventListener('change', updateTotalPreview);
    row.querySelector('.spec-quantity').addEventListener('input', updateTotalPreview);
}

function updateTotalPreview() {
    const rows = document.querySelectorAll('#specsContainer .spec-row');
    let total = 0;
    for (let row of rows) {
        const select = row.querySelector('.spec-select');
        const quantity = parseFloat(row.querySelector('.spec-quantity').value) || 0;
        const price = select.options[select.selectedIndex]?.dataset?.price;
        if (price && quantity > 0) {
            total += parseFloat(price) * quantity;
        }
    }
    document.getElementById('totalIncome').textContent = total.toFixed(2);
    // 小组人数需要从后端获取，这里暂时用1占位
    document.getElementById('perPersonIncome').textContent = total.toFixed(2);
}

async function saveRecord(e) {
    e.preventDefault();
    const deptId = document.getElementById('recordDept').value;
    const groupId = document.getElementById('selectedGroupId').value;
    const workDate = document.getElementById('workDate').value;
    const notes = document.getElementById('notes').value;

    if (!deptId) { alert('请选择部门'); return; }
    if (!groupId) { alert('请选择有效的小组'); return; }
    if (!workDate) { alert('请选择工作日期'); return; }

    const specs = [];
    const rows = document.querySelectorAll('#specsContainer .spec-row');
    for (let row of rows) {
        const specId = row.querySelector('.spec-select').value;
        const quantity = parseFloat(row.querySelector('.spec-quantity').value);
        if (!specId) { alert('请完整填写规格'); return; }
        if (!quantity || quantity <= 0) { alert('请输入有效的数量'); return; }
        specs.push({ spec_id: specId, quantity });
    }
    if (specs.length === 0) { alert('请至少添加一项计件规格'); return; }

    try {
        await api.records.create({
            department_id: deptId,
            group_id: groupId,
            work_date: workDate,
            items: specs,
            notes: notes
        });
        alert('工作记录添加成功');
        closeModal();
        loadRecords();
    } catch (err) {
        console.error('保存失败:', err);
        alert(err.message || '保存失败，请重试');
    }
}

function closeModal() {
    document.getElementById('recordModal').classList.remove('active');
}

async function deleteRecord(id) {
    if (!confirm('确定删除此记录吗？')) return;
    try {
        await api.records.delete(id);
        alert('记录已删除');
        loadRecords();
    } catch (err) {
        alert('删除失败: ' + err.message);
    }
}