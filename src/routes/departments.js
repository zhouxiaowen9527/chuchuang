const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const DepartmentController = require('../controllers/departmentController');

router.use(auth);

router.get('/', requireRole('admin', 'dept_manager'), DepartmentController.list);
router.get('/all', requireRole('admin', 'dept_manager'), DepartmentController.getAll);
router.get('/:id', requireRole('admin', 'dept_manager'), DepartmentController.getById);
router.post('/', requireRole('admin'), DepartmentController.create);
router.put('/:id', requireRole('admin'), DepartmentController.update);
router.delete('/:id', requireRole('admin'), DepartmentController.delete);

module.exports = router;