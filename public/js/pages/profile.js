// 个人设置页面逻辑
document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // 侧边栏用户信息由 router.js 统一处理，但这里确保显示
    const userNameSpan = document.getElementById('userName');
    const userRoleSpan = document.getElementById('userRoleDisplay');
    if (userNameSpan) userNameSpan.textContent = user.real_name || '用户';
    if (userRoleSpan) {
        const roleMap = { employee: '员工', dept_manager: '部门经理', admin: '管理员' };
        userRoleSpan.textContent = roleMap[user.role] || '未知';
    }

    await loadProfile();

    document.getElementById('profileForm').addEventListener('submit', saveProfile);
    document.getElementById('passwordForm').addEventListener('submit', changePassword);
});

async function loadProfile() {
    try {
        const result = await api.auth.getProfile();
        const user = result.data;
        document.getElementById('realName').value = user.real_name;
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone;
        document.getElementById('idCard').value = user.id_card || '';
        document.getElementById('bankName').value = user.bank_name || '';
        document.getElementById('bankCard').value = user.bank_card || '';
        document.getElementById('bankBank').value = user.bank_bank || '';
    } catch (err) {
        console.error('加载个人信息失败:', err);
        alert('加载个人信息失败，请重试');
    }
}

async function saveProfile(e) {
    e.preventDefault();
    try {
        await api.auth.updateProfile({
            real_name: document.getElementById('realName').value,
            phone: document.getElementById('phone').value,
            id_card: document.getElementById('idCard').value,
            bank_name: document.getElementById('bankName').value,
            bank_card: document.getElementById('bankCard').value,
            bank_bank: document.getElementById('bankBank').value
        });
        alert('个人信息已更新');
        // 更新侧边栏显示的姓名
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.real_name = document.getElementById('realName').value;
        localStorage.setItem('user', JSON.stringify(user));
        document.getElementById('userName').textContent = user.real_name;
    } catch (err) {
        alert('更新失败: ' + err.message);
    }
}

async function changePassword(e) {
    e.preventDefault();
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
    if (newPassword.length < 6) {
        alert('新密码至少6位');
        return;
    }

    try {
        await api.auth.changePassword(oldPassword, newPassword);
        alert('密码已修改');
        document.getElementById('passwordForm').reset();
    } catch (err) {
        alert('修改失败: ' + err.message);
    }
}