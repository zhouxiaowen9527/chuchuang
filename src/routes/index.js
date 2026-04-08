const express = require('express');

const router = express.Router();

// 路由汇总
router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/departments', require('./departments'));
router.use('/groups', require('./groups'));
router.use('/specs', require('./specs'));
router.use('/records', require('./records'));
router.use('/payrolls', require('./payrolls'));
router.use('/approvals', require('./approvals'));
router.use('/dashboard', require('./dashboard'));
router.use('/audit', require('./audit'));
router.use('/maintenance', require('./maintenance'));

// 健康检查
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
