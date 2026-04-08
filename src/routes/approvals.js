const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const ApprovalController = require('../controllers/approvalController');

router.use(authMiddleware);
router.use(requireRole('dept_manager'));

router.get('/', ApprovalController.getPending);
router.post('/:id/approve', ApprovalController.approve);
router.post('/:id/reject', ApprovalController.reject);

module.exports = router;
