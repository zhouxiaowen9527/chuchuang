/**
 * 数据库初始化脚本
 * 创建默认管理员、部门经理、员工账号
 */

require('dotenv').config();
const db = require('./config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function initDatabase() {
  console.log('开始初始化数据库...\n');

  try {
    // 1. 创建部门
    console.log('1. 创建部门...');
    const deptId1 = '00000000-0000-0000-0000-000000000001';
    const deptId2 = '00000000-0000-0000-0000-000000000002';
    const deptId3 = '00000000-0000-0000-0000-000000000003';

    await db.query(`
      INSERT INTO departments (id, name, description) VALUES
      ($1, '生产部', '生产制造部门'),
      ($2, '质检部', '质量检验部门'),
      ($3, '包装部', '产品包装部门')
      ON CONFLICT (id) DO NOTHING
    `, [deptId1, deptId2, deptId3]);
    console.log('   ✓ 部门创建完成\n');

    // 2. 创建用户
    console.log('2. 创建用户...');
    const adminId = '00000000-0000-0000-0000-000000000010';
    const managerId = '00000000-0000-0000-0000-000000000020';
    const employeeId = '00000000-0000-0000-0000-000000000030';

    const adminPassword = await bcrypt.hash('admin123', 10);
    const managerPassword = await bcrypt.hash('manager123', 10);
    const employeePassword = await bcrypt.hash('employee123', 10);

    await db.query(`
      INSERT INTO users (id, email, password_hash, real_name, phone, role, status, department_id) VALUES
      ($1, 'admin@blueberry.com', $4, '系统管理员', '13800000001', 'admin', 'approved', NULL),
      ($2, 'manager@blueberry.com', $5, '生产部经理', '13800000002', 'dept_manager', 'approved', $7),
      ($3, 'employee@blueberry.com', $6, '张三', '13800000003', 'employee', 'approved', $7)
      ON CONFLICT (id) DO NOTHING
    `, [adminId, managerId, employeeId, adminPassword, managerPassword, employeePassword, deptId1]);
    console.log('   ✓ 用户创建完成\n');

    // 3. 更新部门经理
    console.log('3. 更新部门经理...');
    await db.query(`
      UPDATE departments SET manager_id = $1 WHERE id = $2
    `, [managerId, deptId1]);
    console.log('   ✓ 部门经理更新完成\n');

    // 4. 创建计件规格示例
    console.log('4. 创建计件规格示例...');
    await db.query(`
      INSERT INTO specs (id, department_id, name, code, unit, unit_price, is_active) VALUES
      (uuid_generate_v4(), $1, '蓝莓分拣', 'SP001', '公斤', 2.50, true),
      (uuid_generate_v4(), $1, '蓝莓包装', 'SP002', '盒', 1.00, true),
      (uuid_generate_v4(), $1, '蓝莓运输', 'SP003', '次', 5.00, true),
      (uuid_generate_v4(), $2, '质量检测', 'SP004', '批次', 10.00, true),
      (uuid_generate_v4(), $3, '包装封口', 'SP005', '个', 0.50, true)
      ON CONFLICT DO NOTHING
    `, [deptId1, deptId2, deptId3]);
    console.log('   ✓ 计件规格创建完成\n');

    console.log('========================================');
    console.log('数据库初始化完成！');
    console.log('========================================');
    console.log('\n默认账号：');
    console.log('  管理员：admin@blueberry.com / admin123');
    console.log('  部门经理：manager@blueberry.com / manager123');
    console.log('  员工：employee@blueberry.com / employee123');
    console.log('\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ 初始化失败:', err);
    process.exit(1);
  }
}

initDatabase();
