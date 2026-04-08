const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const AuditController = require('../controllers/auditController');

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/', AuditController.list);
router.get('/export/csv', AuditController.exportCSV);

module.exports = router;
