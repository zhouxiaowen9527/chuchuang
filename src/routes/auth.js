const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// 无需认证
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// 需要认证
router.post('/change-password', (req, res, next) => {
  require('../middleware/auth')(req, res, () => AuthController.changePassword(req, res, next));
});

router.get('/profile', (req, res, next) => {
  require('../middleware/auth')(req, res, () => AuthController.getProfile(req, res, next));
});

router.put('/profile', (req, res, next) => {
  require('../middleware/auth')(req, res, () => AuthController.updateProfile(req, res, next));
});

module.exports = router;
