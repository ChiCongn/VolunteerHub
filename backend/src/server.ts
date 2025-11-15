import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const authRoutes = require('../routes/auth');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const userRoutes = require('../routes/user');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8000;
const USE_MOCK_AUTH = process.env.USE_MOCK_AUTH === 'true';

app.use(cors());
app.use(express.json());

if (!USE_MOCK_AUTH) {
  // Import mongoose and User model only when needed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mongoose: typeof import('mongoose') = require('mongoose');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const User = require('../models/User');

  const ensureDefaultUsers = async () => {
    const defaultUsers = [
      {
        name: 'Admin User',
        email: 'admin@volunteerhub.local',
        password: 'Admin123!',
        role: 'admin',
        username: 'admin',
        bio: 'Default admin account',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      },
      {
        name: 'Volunteer User',
        email: 'volunteer@volunteerhub.local',
        password: 'Volunteer123!',
        role: 'volunteer',
        username: 'volunteer',
        bio: 'Default volunteer account',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Volunteer',
      },
    ];

    for (const userData of defaultUsers) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await User.create(userData);
        console.log(`Seeded default user: ${userData.email}`);
      }
    }
  };

  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteerhub')
    .then(async () => {
      console.log('MongoDB connected');
      await ensureDefaultUsers();
    })
    .catch((err: unknown) => {
      console.error(err);
    });
} else {
  console.log('USE_MOCK_AUTH enabled - skipping MongoDB connection');
}

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.send('🚀 Server is running successfully!');
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});
