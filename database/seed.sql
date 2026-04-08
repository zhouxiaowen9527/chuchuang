-- ============================================
-- 蓝莓计件工资系统 - 初始数据
-- ============================================

-- 创建默认部门（先创建部门，因为用户需要关联部门）
INSERT INTO departments (id, name, description) VALUES
('00000000-0000-0000-0000-000000000001', '生产部', '生产制造部门'),
('00000000-0000-0000-0000-000000000002', '质检部', '质量检验部门'),
('00000000-0000-0000-0000-000000000003', '包装部', '产品包装部门')
ON CONFLICT (id) DO NOTHING;

-- 创建默认用户（密码都是 bcryptjs 加密的 'admin123'，'manager123', 'employee123'）
INSERT INTO users (id, email, password_hash, real_name, phone, role, status, department_id) VALUES
-- 管理员
('00000000-0000-0000-0000-000000000010', 
 'admin@blueberry.com', 
 '$2b$10$rQZ9ZxK5yJ5XG8YQxK5yJ.5XG8YQxK5yJ5XG8YQxK5yJ5XG8YQxK5yJ5XG8YQxK', 
 '系统管理员', 
 '13800000001', 
 'admin', 
 'approved', 
 NULL)
ON CONFLICT (id) DO NOTHING;

-- 部门经理
INSERT INTO users (id, email, password_hash, real_name, phone, role, status, department_id) VALUES
('00000000-0000-0000-0000-000000000020', 
 'manager@blueberry.com', 
 '$2b$10$rQZ9ZxK5yJ5XG8YQxK5yJ.5XG8YQxK5yJ5XG8YQxK5yJ5XG8YQxK5yJ5XG8YQxK', 
 '生产部经理', 
 '13800000002', 
 'dept_manager', 
 'approved', 
 '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 员工
INSERT INTO users (id, email, password_hash, real_name, phone, role, status, department_id) VALUES
('00000000-0000-0000-0000-000000000030', 
 'employee@blueberry.com', 
 '$2b$10$rQZ9ZxK5yJ5XG8YQxK5yJ.5XG8YQxK5yJ5XG8YQxK5yJ5XG8YQxK5yJ5XG8YQxK', 
 '张三', 
 '13800000003', 
 'employee', 
 'approved', 
 '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 更新部门经理
UPDATE departments SET manager_id = '00000000-0000-0000-0000-000000000020' 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- ============================================
-- 注意：以上密码 hash 是示例，实际使用时需要用真实的 bcrypt hash
-- 使用以下 Node.js 代码生成真实密码 hash：
-- 
-- const bcrypt = require('bcryptjs');
-- console.log(bcrypt.hashSync('admin123', 10));    // 管理员密码
-- console.log(bcrypt.hashSync('manager123', 10));  // 经理密码
-- console.log(bcrypt.hashSync('employee123', 10)); // 员工密码
-- ============================================
