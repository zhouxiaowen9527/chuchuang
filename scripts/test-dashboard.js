/**
 * 测试 Dashboard 统计数据
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const db = require(__dirname + '/../src/config/database');

async function testDashboard() {
  console.log('=====================================');
  console.log('测试 Dashboard 统计数据');
  console.log('=====================================\n');

  try {
    // 1. 检查工资单总数
    const { rows: payrollCount } = await db.query('SELECT COUNT(*) FROM payrolls');
    console.log(`✓ 工资单总数: ${payrollCount[0].count}`);

    // 2. 检查所有工资单
    const { rows: allPayrolls } = await db.query('SELECT * FROM payrolls LIMIT 5');
    console.log('\n前 5 条工资单:');
    allPayrolls.forEach(p => {
      console.log(`  - ID: ${p.id}`);
      console.log(`    员工ID: ${p.employee_id}`);
      console.log(`    周期: ${p.period_start} ~ ${p.period_end}`);
      console.log(`    金额: ${p.total_amount}`);
      console.log(`    状态: ${p.status}`);
    });

    // 3. 检查当前月份
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    console.log(`\n当前月份: ${startStr} ~ ${endStr}`);

    // 4. 检查当前月份的工资单
    const { rows: monthPayrolls } = await db.query(
      `SELECT * FROM payrolls WHERE period_end >= $1 AND period_start <= $2`,
      [startStr, endStr]
    );
    console.log(`\n当前月工资单数: ${monthPayrolls.length}`);

    // 5. 检查用户数据
    const { rows: users } = await db.query('SELECT id, email, real_name, role, department_id FROM users');
    console.log(`\n用户数: ${users.length}`);
    users.forEach(u => {
      console.log(`  - ${u.real_name} (${u.email}) - 角色: ${u.role} - 部门: ${u.department_id || '无'}`);
    });

    // 6. 检查部门数据
    const { rows: depts } = await db.query('SELECT id, name FROM departments');
    console.log(`\n部门数: ${depts.length}`);
    depts.forEach(d => {
      console.log(`  - ${d.name} (${d.id})`);
    });

    console.log('\n=====================================');
    console.log('测试完成');
    console.log('=====================================');

  } catch (err) {
    console.error('测试失败:', err);
  }

  process.exit(0);
}

testDashboard();
