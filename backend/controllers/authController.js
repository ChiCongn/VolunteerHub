const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {
  findUserByEmail,
  addUser,
  getPublicUser,
} = require('../mock/mockUsers');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const USE_MOCK_AUTH = process.env.USE_MOCK_AUTH === 'true';

const ensureTokenBlacklist = (app) => {
  if (!app.locals.revokedTokens) {
    app.locals.revokedTokens = new Set();
  }

  return app.locals.revokedTokens;
};

// Đăng xuất
exports.logout = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token && req.app) {
      const blacklist = ensureTokenBlacklist(req.app);
      blacklist.add(token);
    }

    res.json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id ?? user._id?.toString(),
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (USE_MOCK_AUTH) {
      const user = findUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = signToken(user);
      return res.json({
        success: true,
        token,
        user: getPublicUser(user),
      });
    }

    // Tìm user trong MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Kiểm tra password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Tạo token
    const token = signToken(user);

    // Trả về user info và token
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (USE_MOCK_AUTH) {
      const existingUser = findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const user = addUser({
        name,
        email,
        password,
        role: role || 'volunteer',
      });

      const token = signToken(user);

      return res.status(201).json({
        success: true,
        token,
        user: getPublicUser(user),
      });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Tạo user mới
    const user = new User({
      name,
      email,
      password,
      role: role || 'volunteer',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    });

    await user.save();

    // Tạo token
    const token = signToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
