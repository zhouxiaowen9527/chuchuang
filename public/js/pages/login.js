// 登录页面逻辑 - 弹窗版
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const messageEl = document.getElementById('message');

    // 密码强度验证
    function validatePassword(password) {
        if (password.length < 8) return false;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        return hasUpper && hasLower && hasNumber;
    }

    // 登录表单提交
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;

        try {
            showMessage('登录中...', 'info');
            const result = await api.auth.login(email, password);
            
            // 保存 token 和用户信息
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            
            showMessage('登录成功，跳转中...', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } catch (err) {
            showMessage(err.message, 'error');
        }
    });

    // 注册表单提交
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = registerForm.password.value;
        const confirmPassword = registerForm.confirm_password.value;
        
        // 前端密码强度验证
        if (!validatePassword(password)) {
            showMessage('密码至少8位，需包含大写字母、小写字母和数字', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('两次密码输入不一致', 'error');
            return;
        }

        const data = {
            email: registerForm.email.value,
            password: password,
            confirm_password: confirmPassword,
            real_name: registerForm.real_name.value,
            phone: registerForm.phone.value,
            id_card: registerForm.id_card.value || null,
            bank_name: registerForm.bank_name.value || null,
            bank_card: registerForm.bank_card.value || null,
            bank_bank: registerForm.bank_bank.value || null
        };

        try {
            showMessage('注册中...', 'info');
            const result = await api.auth.register(data);
            showMessage('注册成功！请等待管理员审核。', 'success');
            registerForm.reset();
            setTimeout(() => {
                switchToLogin();
            }, 2000);
        } catch (err) {
            showMessage(err.message, 'error');
        }
    });

    // ESC 键关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (document.getElementById('loginModal').classList.contains('active')) {
                closeModal('loginModal');
            }
            if (document.getElementById('registerModal').classList.contains('active')) {
                closeModal('registerModal');
            }
        }
    });
});

// 全局函数 - 显示登录弹窗
function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 全局函数 - 显示注册弹窗
function showRegisterModal() {
    document.getElementById('registerModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 全局函数 - 关闭弹窗
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}

// 全局函数 - 切换到登录
function switchToLogin() {
    closeModal('registerModal');
    setTimeout(() => showLoginModal(), 200);
}

// 全局函数 - 切换到注册
function switchToRegister() {
    closeModal('loginModal');
    setTimeout(() => showRegisterModal(), 200);
}

// 全局函数 - 显示消息
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message-toast ${type} show`;
    
    if (type !== 'info') {
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 3000);
    }
}
