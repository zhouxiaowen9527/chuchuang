const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const DashboardController = require('../controllers/dashboardController');

router.use(authMiddleware);

router.get('/stats', DashboardController.getStats);

module.exports = router;
