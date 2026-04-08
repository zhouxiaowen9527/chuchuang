const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const UserController = require('../controllers/userController');

router.use(authMiddleware);

// 员工、经理、管理员都可查看
router.get('/', UserController.list);
router.get('/:id', UserController.getById);

// 管理员或部门经理可创建、编辑、删除（部门经理只能操作本部门）
router.post('/', requireRole('admin', 'dept_manager'), UserController.create);
router.put('/:id', requireRole('admin', 'dept_manager'), UserController.update);
router.delete('/:id', requireRole('admin', 'dept_manager'), UserController.delete);

// 重置密码（管理员或经理可重置本部门用户）
router.post('/:id/reset-password', requireRole('admin', 'dept_manager'), UserController.resetPassword);

module.exports = router;
