const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@volunteerhub.local',
    password: 'Admin123!',
    role: 'admin',
    username: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    bio: 'Mock admin account',
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
  },
  {
    id: '2',
    name: 'Volunteer User',
    email: 'volunteer@volunteerhub.local',
    password: 'Volunteer123!',
    role: 'volunteer',
    username: 'volunteer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Volunteer',
    bio: 'Mock volunteer account',
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
  },
];

const getNextId = () => (mockUsers.length + 1).toString();

const findUserByEmail = (email = '') =>
  mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());

const findUserById = (id) => mockUsers.find((user) => user.id === id);

const addUser = (userData) => {
  const nextId = getNextId();
  const newUser = {
    id: nextId,
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
    bio: '',
    username: userData.username ?? `user${nextId}`,
    ...userData,
  };

  mockUsers.push(newUser);
  return newUser;
};

const updateUser = (id, updates) => {
  const user = findUserById(id);
  if (!user) {
    return null;
  }

  Object.assign(user, updates);
  return user;
};

const getPublicUser = (user) => {
  if (!user) {
    return null;
  }
  const { password, ...publicUser } = user;
  return publicUser;
};

module.exports = {
  mockUsers,
  findUserByEmail,
  findUserById,
  addUser,
  updateUser,
  getPublicUser,
};

