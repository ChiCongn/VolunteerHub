const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const User = require('./models/User');

const useMockAuth = process.env.USE_MOCK_AUTH === 'true';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
if (!useMockAuth) {
  const ensureDefaultUsers = async () => {
    const defaultUsers = [
      {
        name: 'Admin User',
        email: 'admin@volunteerhub.local',
        password: 'Admin123!',
        role: 'admin',
        bio: 'Default admin account',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      },
      {
        name: 'Volunteer User',
        email: 'volunteer@volunteerhub.local',
        password: 'Volunteer123!',
        role: 'volunteer',
        bio: 'Default volunteer account',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Volunteer',
      },
    ];

    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`Seeded default user: ${userData.email}`);
      }
    }
  };

  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteerhub')
    .then(async () => {
      console.log('MongoDB connected');
      await ensureDefaultUsers();
    })
    .catch(err => console.log(err));
} else {
  console.log('USE_MOCK_AUTH enabled - skipping MongoDB connection');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});