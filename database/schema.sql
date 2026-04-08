-- ============================================
-- 蓝莓计件工资系统 - 数据库建表脚本
-- 适用于 PostgreSQL (Neon)
-- 版本：2.0
-- 创建时间：2026-03-27
-- ============================================

-- 启用 UUID 扩展（Neon 默认已启用）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 用户表 (users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    real_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    id_card VARCHAR(18),
    bank_name VARCHAR(100),
    bank_card VARCHAR(30),
    bank_bank VARCHAR(100),
    department_id UUID,
    role VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'dept_manager', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ============================================
-- 2. 部门表 (departments)
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_departments_manager_id ON departments(manager_id);

-- ============================================
-- 3. 小组表 (groups)
-- ============================================
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    member_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_groups_name_department ON groups(name, department_id);
CREATE INDEX idx_groups_department_id ON groups(department_id);

-- ============================================
-- 4. 小组成员关系表 (group_members)
-- ============================================
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_group_members_unique ON group_members(group_id, user_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);

-- ============================================
-- 5. 计件规格表 (specs)
-- ============================================
CREATE TABLE IF NOT EXISTS specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_specs_name_department ON specs(name, department_id);
CREATE INDEX idx_specs_department_id ON specs(department_id);
CREATE INDEX idx_specs_is_active ON specs(is_active);

-- ============================================
-- 6. 工作记录表 (records)
-- ============================================
CREATE TABLE IF NOT EXISTS records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    spec_id UUID NOT NULL REFERENCES specs(id),
    quantity DECIMAL(12,2) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    work_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_records_employee_id ON records(employee_id);
CREATE INDEX idx_records_group_id ON records(group_id);
CREATE INDEX idx_records_department_id ON records(department_id);
CREATE INDEX idx_records_work_date ON records(work_date);
CREATE INDEX idx_records_spec_id ON records(spec_id);

-- ============================================
-- 7. 工资单表 (payrolls)
-- ============================================
CREATE TABLE IF NOT EXISTS payrolls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    piecework_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    bonus DECIMAL(12,2) NOT NULL DEFAULT 0,
    deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'paid')),
    paid_at TIMESTAMPTZ,
    paid_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, period_start, period_end)
);

CREATE INDEX idx_payrolls_employee_id ON payrolls(employee_id);
CREATE INDEX idx_payrolls_group_id ON payrolls(group_id);
CREATE INDEX idx_payrolls_period ON payrolls(period_start, period_end);
CREATE INDEX idx_payrolls_status ON payrolls(status);

-- ============================================
-- 8. 审计日志表 (audit_logs)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- 添加外键约束
-- ============================================
ALTER TABLE users ADD CONSTRAINT fk_users_department 
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- ============================================
-- 完成
-- ============================================
