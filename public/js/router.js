// 前端路由与侧边栏管理
const router = {
    init: function() {
        this.generateSidebar();
        this.updateUserInfo();
        this.bindEvents();
    },

    generateSidebar: function() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;

        const allMenus = {
            employee: [
                { text: '数据看板', href: '/dashboard.html', icon: '📊' },
                { text: '工作记录', href: '/records.html', icon: '📝' },
                { text: '工资查询', href: '/payroll.html', icon: '💰' },
                { text: '个人设置', href: '/profile.html', icon: '⚙️' }
            ],
            dept_manager: [
                { text: '数据看板', href: '/dashboard.html', icon: '📊' },
                { text: '工作记录', href: '/records.html', icon: '📝' },
                { text: '工资查询', href: '/payroll.html', icon: '💰' },
                { text: '用户审核', href: '/approvals.html', icon: '✅' },
                { text: '用户管理', href: '/users.html', icon: '👥' },
                { text: '小组管理', href: '/groups.html', icon: '👥' },
                { text: '计件管理', href: '/specs.html', icon: '🔧' },
                { text: '个人设置', href: '/profile.html', icon: '⚙️' }
            ],
            admin: [
                { text: '数据看板', href: '/dashboard.html', icon: '📊' },
                { text: '工作记录', href: '/records.html', icon: '📝' },
                { text: '工资查询', href: '/payroll.html', icon: '💰' },
                { text: '用户审核', href: '/approvals.html', icon: '✅' },
                { text: '部门管理', href: '/departments.html', icon: '🏢' },
                { text: '用户管理', href: '/users.html', icon: '👥' },
                { text: '小组管理', href: '/groups.html', icon: '👥' },
                { text: '计件管理', href: '/specs.html', icon: '🔧' },
                { text: '个人设置', href: '/profile.html', icon: '⚙️' },
                { text: '数据维护', href: '/maintenance.html', icon: '🔧' }
            ]
        };

        const menus = allMenus[user.role] || allMenus.employee;
        navMenu.innerHTML = menus.map(item => `
            <a href="${item.href}" class="nav-item ${location.pathname === item.href ? 'active' : ''}">
                ${item.icon} ${item.text}
            </a>
        `).join('');
    },

    updateUserInfo: function() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userNameSpan = document.getElementById('userName');
        const userRoleSpan = document.getElementById('userRoleDisplay');  // 修改
        if (userNameSpan) userNameSpan.textContent = user.real_name || '用户';
        if (userRoleSpan) {
            const roleMap = { employee: '员工', dept_manager: '部门经理', admin: '管理员' };
            userRoleSpan.textContent = roleMap[user.role] || '未知';
        }
    },

    bindEvents: function() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    },

    logout: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    router.init();
});