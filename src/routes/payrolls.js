const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const PayrollController = require('../controllers/payrollController');

router.use(authMiddleware);

router.get('/', PayrollController.list);
router.get('/:id', PayrollController.getById);
router.get('/export/csv', PayrollController.exportCSV);

// 仅管理员
router.post('/', requireRole('admin'), PayrollController.generate);
router.post('/:id/confirm', requireRole('admin'), PayrollController.confirm);
router.post('/:id/pay', requireRole('admin'), PayrollController.markPaid);
router.post('/batch/confirm', requireRole('admin'), PayrollController.batchConfirm);
router.post('/batch/pay', requireRole('admin'), PayrollController.batchPay);

// 经理可调整本部门的
router.patch('/:id/adjust', requireRole('dept_manager'), PayrollController.adjust);

module.exports = router;
