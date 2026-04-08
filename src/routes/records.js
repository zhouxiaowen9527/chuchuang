const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const RecordController = require('../controllers/recordController');

router.use(authMiddleware);

router.get('/', RecordController.list);
router.get('/export/csv', RecordController.exportCSV);  // 导出路由放在 :id 之前
router.get('/:id', RecordController.getById);

router.post('/', requireRole('admin', 'dept_manager'), RecordController.create);
router.delete('/:id', requireRole('admin', 'dept_manager'), RecordController.delete);

module.exports = router;
