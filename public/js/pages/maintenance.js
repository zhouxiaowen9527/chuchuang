// 数据维护页面逻辑
document.addEventListener('DOMContentLoaded', async () => {
    // 侧边栏由 router.js 统一处理，无需单独设置
    await loadStats();

    // 绑定导出按钮事件
    document.getElementById('exportJSONBtn').addEventListener('click', exportJSON);
    document.getElementById('exportRecordsBtn').addEventListener('click', exportRecordsCSV);
    document.getElementById('exportDeptsBtn').addEventListener('click', exportDeptsCSV);
    document.getElementById('exportUsersBtn').addEventListener('click', exportUsersCSV);
    document.getElementById('exportGroupsBtn').addEventListener('click', exportGroupsCSV);
    document.getElementById('exportSpecsBtn').addEventListener('click', exportSpecsCSV);
});

async function loadStats() {
    try {
        const result = await api.maintenance.getStats();
        const stats = result.data;
        document.getElementById('userCount').textContent = stats.users || 0;
        document.getElementById('deptCount').textContent = stats.departments || 0;
        document.getElementById('groupCount').textContent = stats.groups || 0;
        document.getElementById('specCount').textContent = stats.specs || 0;
        document.getElementById('recordCount').textContent = stats.records || 0;
        document.getElementById('payrollCount').textContent = stats.payrolls || 0;
        document.getElementById('lastUpdate').textContent = new Date().toLocaleString('zh-CN');
    } catch (err) {
        console.error('加载统计数据失败:', err);
        alert('加载统计数据失败，请稍后重试');
    }
}

// 通用下载函数 - 带 token 认证
async function downloadWithAuth(url, filename) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('请先登录');
        window.location.href = '/index.html';
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || '下载失败');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        a.remove();
    } catch (err) {
        console.error('下载失败:', err);
        alert('下载失败: ' + err.message);
    }
}

function exportJSON() {
    downloadWithAuth('/api/maintenance/export/json', 'backup.json');
}

function exportRecordsCSV() {
    downloadWithAuth('/api/records/export/csv', 'records.csv');
}

function exportDeptsCSV() {
    downloadWithAuth('/api/maintenance/export/departments', 'departments.csv');
}

function exportUsersCSV() {
    downloadWithAuth('/api/maintenance/export/users', 'users.csv');
}

function exportGroupsCSV() {
    downloadWithAuth('/api/maintenance/export/groups', 'groups.csv');
}

function exportSpecsCSV() {
    downloadWithAuth('/api/maintenance/export/specs', 'specs.csv');
}