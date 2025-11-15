const User = require('../models/User');
const bcrypt = require('bcryptjs');
const {
  findUserById,
  updateUser,
  getPublicUser,
} = require('../mock/mockUsers');

const USE_MOCK_AUTH = process.env.USE_MOCK_AUTH === 'true';

const mapDbUserToResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  emailNotifications: user.emailNotifications,
  pushNotifications: user.pushNotifications,
  eventReminders: user.eventReminders,
});

// Lấy thông tin user hiện tại
exports.getProfile = async (req, res) => {
  try {
    if (USE_MOCK_AUTH) {
      const user = findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        success: true,
        user: {
          ...getPublicUser(user),
          emailNotifications: user.emailNotifications,
          pushNotifications: user.pushNotifications,
          eventReminders: user.eventReminders,
        },
      });
    }

    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: mapDbUserToResponse(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    
    if (USE_MOCK_AUTH) {
      const updatedUser = updateUser(req.user.id, {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(bio !== undefined ? { bio } : {}),
      });

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: getPublicUser(updatedUser),
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cập nhật thông tin
    if (name) user.name = name;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Kiểm tra validate
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (USE_MOCK_AUTH) {
      const user = findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.password !== currentPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      updateUser(user.id, { password: newPassword });

      return res.json({
        success: true,
        message: 'Password changed successfully',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Kiểm tra password hiện tại
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Cập nhật password mới
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật cài đặt thông báo
exports.updateNotificationSettings = async (req, res) => {
  try {
    const { emailNotifications, pushNotifications, eventReminders } = req.body;

    if (USE_MOCK_AUTH) {
      const user = updateUser(req.user.id, {
        ...(emailNotifications !== undefined ? { emailNotifications } : {}),
        ...(pushNotifications !== undefined ? { pushNotifications } : {}),
        ...(eventReminders !== undefined ? { eventReminders } : {}),
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        success: true,
        message: 'Notification settings updated',
        settings: {
          emailNotifications: user.emailNotifications,
          pushNotifications: user.pushNotifications,
          eventReminders: user.eventReminders,
        },
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cập nhật settings
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) user.pushNotifications = pushNotifications;
    if (eventReminders !== undefined) user.eventReminders = eventReminders;

    await user.save();

    res.json({
      success: true,
      message: 'Notification settings updated',
      settings: {
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
        eventReminders: user.eventReminders,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};