const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Tất cả route dưới đây cần xác thực
router.use(authMiddleware);

// GET profile của user hiện tại
router.get('/profile', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    // Trả về thông tin user từ JWT token
    res.json({
      success: true,
      data: {
        id: userId,
        name: req.user.name || 'User',
        email: req.user.email,
        avatar: req.user.avatar || '/default-avatar.png'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy profile' });
  }
});

// GET settings của user
router.get('/settings', authMiddleware, (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        userId: req.user.id,
        theme: 'light',
        notifications: true,
        language: 'vi',
        privacy: 'public'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy settings' });
  }
});

// POST logout
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;