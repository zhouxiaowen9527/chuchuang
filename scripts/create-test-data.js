/**
 * 快速创建测试数据
 * - 创建测试工作记录
 * - 生成工资单
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const db = require(__dirname + '/../src/config/database');
const bcrypt = require('bcryptjs');

async function createTestData() {
  console.log('=====================================');
  console.log('创建测试数据');
  console.log('=====================================\n');

  try {
    // 1. 获取用户和部门
    const { rows: users } = await db.query('SELECT * FROM users WHERE status = $1', ['approved']);
    const { rows: depts } = await db.query('SELECT * FROM departments');
    const { rows: specs } = await db.query('SELECT * FROM specs WHERE is_active = true');

    console.log(`找到 ${users.length} 个用户`);
    console.log(`找到 ${depts.length} 个部门`);
    console.log(`找到 ${specs.length} 个计件规格\n`);

    if (users.length === 0) {
      console.log('❌ 没有用户数据，请先运行 npm run init-db');
      process.exit(1);
    }

    if (specs.length === 0) {
      console.log('❌ 没有计件规格数据');
      process.exit(1);
    }

    // 2. 为每个用户创建工作记录
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    for (const user of users) {
      // 为每个用户创建 5-10 条工作记录
      const recordCount = Math.floor(Math.random() * 6) + 5;
      
      for (let i = 0; i < recordCount; i++) {
        const spec = specs[Math.floor(Math.random() * specs.length)];
        const quantity = Math.floor(Math.random() * 100) + 10;
        const amount = quantity * parseFloat(spec.unit_price);
        const workDate = new Date(currentYear, currentMonth, Math.floor(Math.random() * 28) + 1);

        await db.query(
          `INSERT INTO records (id, employee_id, spec_id, quantity, amount, work_date, created_by)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
          [user.id, spec.id, quantity, amount, workDate.toISOString().split('T')[0], user.id]
        );
      }

      console.log(`✓ 为 ${user.real_name} 创建了 ${recordCount} 条工作记录`);
    }

    // 3. 计算每个用户的工资
    const periodStart = new Date(currentYear, currentMonth, 1);
    const periodEnd = new Date(currentYear, currentMonth + 1, 0);

    for (const user of users) {
      // 计算该用户的计件工资总额
      const { rows } = await db.query(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM records
         WHERE employee_id = $1 AND work_date >= $2 AND work_date <= $3`,
        [user.id, periodStart.toISOString().split('T')[0], periodEnd.toISOString().split('T')[0]]
      );

      const pieceworkAmount = parseFloat(rows[0].total);
      const bonus = Math.floor(Math.random() * 200); // 随机奖金 0-200
      const deduction = Math.floor(Math.random() * 50); // 随机扣除 0-50
      const totalAmount = pieceworkAmount + bonus - deduction;

      // 创建工资单
      await db.query(
        `INSERT INTO payrolls (id, employee_id, period_start, period_end, piecework_amount, bonus, deduction, total_amount, status)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [
          user.id,
          periodStart.toISOString().split('T')[0],
          periodEnd.toISOString().split('T')[0],
          pieceworkAmount,
          bonus,
          deduction,
          totalAmount,
          'draft'
        ]
      );

      console.log(`✓ 为 ${user.real_name} 创建工资单: ¥${totalAmount.toFixed(2)} (计件¥${pieceworkAmount.toFixed(2)} + 奖金¥${bonus} - 扣除¥${deduction})`);
    }

    console.log('\n=====================================');
    console.log('✅ 测试数据创建完成！');
    console.log('=====================================');
    console.log(`\n周期: ${periodStart.toISOString().split('T')[0]} ~ ${periodEnd.toISOString().split('T')[0]}`);
    console.log('\n现在可以刷新 Dashboard 页面查看统计数据了！\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ 创建失败:', err);
    process.exit(1);
  }
}

createTestData();
