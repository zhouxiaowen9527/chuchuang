const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const MaintenanceController = require('../controllers/maintenanceController');

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/stats', MaintenanceController.getStats);
router.get('/export/json', MaintenanceController.exportJSON);
router.get('/export/departments', MaintenanceController.exportDepartments);
router.get('/export/users', MaintenanceController.exportUsers);
router.get('/export/groups', MaintenanceController.exportGroups);
router.get('/export/specs', MaintenanceController.exportSpecs);

module.exports = router;
