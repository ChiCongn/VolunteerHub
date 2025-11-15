const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Authentication routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', auth, authController.logout);

// Profile routes (require authentication)
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/change-password', auth, userController.changePassword);
router.put('/notification-settings', auth, userController.updateNotificationSettings);

module.exports = router;