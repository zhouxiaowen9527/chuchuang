const RecordModel = require('../models/record');
const GroupModel = require('../models/group');
const SpecModel = require('../models/spec');
const { parsePagination } = require('../utils/validators');

const RecordService = {
  /**
   * 录入工作记录 - 核心逻辑
   * 1. 获取小组成员
   * 2. 计算每个规格总收入及该规格人均收入
   * 3. 为每个成员每个规格创建一条记录，total_amount 为该规格人均收入
   */
  async createRecord(data) {
    const { group_id, work_date, items, notes, department_id } = data;

    // 获取小组信息
    const group = await GroupModel.findById(group_id);
    if (!group) throw new Error('小组不存在');

    // 获取小组成员
    const members = await GroupModel.getMembers(group_id);
    if (members.length === 0) throw new Error('小组没有成员');
    const memberCount = parseInt(group.member_count) || members.length;

    // 构建规格明细，包含该规格的总收入和人均收入
    const specDetails = [];
    for (const item of items) {
      const spec = await SpecModel.findById(item.spec_id);
      if (!spec) throw new Error(`计件规格不存在: ${item.spec_id}`);
      if (!spec.is_active) throw new Error(`计件规格已禁用: ${spec.name}`);

      const quantity = parseFloat(item.quantity);
      const unitPrice = parseFloat(spec.unit_price);
      const lineTotal = quantity * unitPrice;
      const perPersonAmount = lineTotal / memberCount;

      specDetails.push({
        spec_id: spec.id,
        spec_name: spec.name,
        unit: spec.unit,
        unit_price: unitPrice,
        quantity: quantity,
        line_total: lineTotal,
        per_person: perPersonAmount
      });
    }

    // 构建要插入的记录数组
    const records = [];
    for (const member of members) {
      for (const detail of specDetails) {
        records.push({
          employee_id: member.id,
          group_id,
          department_id: department_id || group.department_id,
          spec_id: detail.spec_id,
          quantity: detail.quantity,
          unit_price: detail.unit_price,
          total_amount: detail.per_person,   // 该规格的人均收入
          work_date,
          notes
        });
      }
    }

    // 批量插入
    const created = await RecordModel.batchCreate(records);

    // 计算小组总收入（所有规格总收入之和）
    const groupTotal = specDetails.reduce((sum, d) => sum + d.line_total, 0);
    return {
      group_total: groupTotal,
      member_count: memberCount,
      per_person: groupTotal / memberCount,
      records_count: created.length,
      records: created
    };
  },

  async getList(query) {
    const { page, pageSize, offset } = parsePagination(query);
    return RecordModel.findList({
      employee_id: query.employee_id,
      department_id: query.department_id,
      group_id: query.group_id,
      start_date: query.start_date,
      end_date: query.end_date,
      page,
      pageSize,
      offset
    });
  },

  async getById(id) {
    return RecordModel.findById(id);
  },

  async update(id, data) {
    return RecordModel.update(id, data);
  },

  async delete(id) {
    return RecordModel.delete(id);
  },

  /**
   * 重新计算并录入工作记录（编辑场景）
   * 删除旧记录 → 重新录入
   */
  async recalcAndSave(group_id, work_date, items, notes, department_id) {
    // 删除该小组该天所有记录
    const { query } = require('../config/database');
    await query('DELETE FROM records WHERE group_id = $1 AND work_date = $2', [group_id, work_date]);

    // 重新录入
    return this.createRecord({ group_id, work_date, items, notes, department_id });
  },

  async countAll() {
    return RecordModel.countAll();
  },

  // 统计数据
  async getStats(employee_id, department_id, role) {
    const { getCurrentMonth } = require('../utils/formatters');
    const { start, end } = getCurrentMonth();

    let recordCount = 0, totalAmount = 0;
    try {
      if (role === 'employee') {
        recordCount = await RecordModel.countByEmployeeAndPeriod(employee_id, start, end);
        totalAmount = await RecordModel.sumByEmployeeAndPeriod(employee_id, start, end);
      } else {
        recordCount = await RecordModel.countByDepartmentAndPeriod(department_id, start, end);
        totalAmount = await RecordModel.sumByDepartmentAndPeriod(department_id, start, end);
      }
    } catch (err) {
      console.error('RecordService.getStats 错误:', err);
    }

    return { recordCount: recordCount || 0, totalAmount: totalAmount || 0, start, end };
  }
};

module.exports = RecordService;