const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const GroupController = require('../controllers/groupController');

router.use(authMiddleware);

router.get('/', GroupController.list);
router.get('/by-department/:departmentId', GroupController.getByDepartment);
router.get('/:id', GroupController.getById);

router.post('/', requireRole('admin', 'dept_manager'), GroupController.create);
router.put('/:id/members', requireRole('admin', 'dept_manager'), GroupController.updateMembers);
router.delete('/:id', requireRole('admin', 'dept_manager'), GroupController.delete);

module.exports = router;
