const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const SpecController = require('../controllers/specController');

router.use(authMiddleware);

router.get('/', SpecController.list);
router.get('/active', SpecController.active);
router.get('/:id', SpecController.getById);

router.post('/', requireRole('admin', 'dept_manager'), SpecController.create);
router.put('/:id', requireRole('admin', 'dept_manager'), SpecController.update);
router.patch('/:id/toggle', requireRole('admin', 'dept_manager'), SpecController.toggleActive);
router.delete('/:id', requireRole('admin', 'dept_manager'), SpecController.delete);

module.exports = router;
