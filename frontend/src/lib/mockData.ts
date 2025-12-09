export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'volunteer' | 'manager' | 'admin';
  bio?: string;
  email: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  location: string;
  capacity: number;
  registered: number;
  category: 'environment' | 'education' | 'health' | 'community' | 'animals';
  tags: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'pending';
  managerId: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  type: 'post' | 'announcement';
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'event' | 'comment' | 'like' | 'system';
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'volunteer',
    bio: 'Passionate about environmental conservation',
    email: 'sarah.j@email.com'
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    role: 'manager',
    bio: 'Community organizer and event coordinator',
    email: 'michael.c@email.com'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    role: 'admin',
    bio: 'VolunteerHub platform administrator',
    email: 'emma.r@email.com'
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    role: 'volunteer',
    bio: 'Education advocate',
    email: 'david.k@email.com'
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    role: 'manager',
    bio: 'Healthcare volunteer coordinator',
    email: 'lisa.a@email.com'
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Beach Cleanup Drive',
    description: 'Join us for a community beach cleanup! We\'ll provide all supplies and refreshments.',
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800',
    date: '2025-10-25',
    location: 'Sunset Beach',
    capacity: 50,
    registered: 34,
    category: 'environment',
    tags: ['cleanup', 'ocean', 'community'],
    status: 'upcoming',
    managerId: '2'
  },
  {
    id: '2',
    title: 'Food Bank Distribution',
    description: 'Help distribute food packages to families in need. Shifts available throughout the day.',
    image: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=800',
    date: '2025-10-18',
    location: 'Community Center',
    capacity: 30,
    registered: 28,
    category: 'community',
    tags: ['food', 'charity', 'families'],
    status: 'upcoming',
    managerId: '5'
  },
  {
    id: '3',
    title: 'Reading Buddies Program',
    description: 'Mentor elementary students in reading comprehension. Weekly commitment preferred.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    date: '2025-10-20',
    location: 'Lincoln Elementary School',
    capacity: 20,
    registered: 15,
    category: 'education',
    tags: ['education', 'children', 'mentoring'],
    status: 'upcoming',
    managerId: '2'
  },
  {
    id: '4',
    title: 'Animal Shelter Support',
    description: 'Spend time with shelter animals, help with feeding, and light cleaning duties.',
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800',
    date: '2025-10-22',
    location: 'Happy Paws Shelter',
    capacity: 15,
    registered: 12,
    category: 'animals',
    tags: ['animals', 'shelter', 'care'],
    status: 'upcoming',
    managerId: '5'
  },
  {
    id: '5',
    title: 'Tree Planting Initiative',
    description: 'Help green our city! Plant trees in designated areas. All skill levels welcome.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
    date: '2025-11-05',
    location: 'Central Park',
    capacity: 60,
    registered: 45,
    category: 'environment',
    tags: ['trees', 'planting', 'green'],
    status: 'upcoming',
    managerId: '2'
  },
  {
    id: '6',
    title: 'Senior Center Visit',
    description: 'Bring joy to seniors through conversation, games, and activities.',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
    date: '2025-10-15',
    location: 'Golden Years Center',
    capacity: 25,
    registered: 20,
    category: 'health',
    tags: ['seniors', 'companionship', 'activities'],
    status: 'ongoing',
    managerId: '5'
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    authorId: '1',
    content: 'Had an amazing time at the Beach Cleanup Drive last weekend! We collected over 200 pounds of trash. Thank you to all volunteers who showed up! 🌊',
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600',
    likes: 45,
    comments: [
      {
        id: 'c1',
        authorId: '4',
        content: 'Great work everyone! Can\'t wait for the next one.',
        timestamp: '2025-10-10T15:30:00Z'
      },
      {
        id: 'c2',
        authorId: '2',
        content: 'Thanks for your dedication Sarah!',
        timestamp: '2025-10-10T16:00:00Z'
      }
    ],
    timestamp: '2025-10-10T14:00:00Z',
    type: 'post'
  },
  {
    id: '2',
    authorId: '2',
    content: '📢 New event alert! We\'re organizing a Tree Planting Initiative next month. Limited spots available - register soon!',
    likes: 67,
    comments: [],
    timestamp: '2025-10-11T09:00:00Z',
    type: 'announcement'
  },
  {
    id: '3',
    authorId: '4',
    content: 'Just completed my first week as a Reading Buddy. Seeing the kids\' progress is so rewarding! If you love working with children, I highly recommend this program. 📚',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600',
    likes: 38,
    comments: [
      {
        id: 'c3',
        authorId: '1',
        content: 'That\'s wonderful! Keep up the great work!',
        timestamp: '2025-10-11T11:00:00Z'
      }
    ],
    timestamp: '2025-10-11T10:00:00Z',
    type: 'post'
  },
  {
    id: '4',
    authorId: '5',
    content: 'Reminder: Food Bank Distribution this Saturday. We still need 5 more volunteers for the morning shift. Please sign up if you can help!',
    likes: 28,
    comments: [],
    timestamp: '2025-10-11T16:00:00Z',
    type: 'announcement'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Event Starting Soon',
    message: 'Beach Cleanup Drive starts in 2 days',
    timestamp: '2025-10-11T08:00:00Z',
    read: false,
    type: 'event'
  },
  {
    id: '2',
    title: 'New Comment',
    message: 'Michael Chen commented on your post',
    timestamp: '2025-10-10T16:00:00Z',
    read: false,
    type: 'comment'
  },
  {
    id: '3',
    title: 'Registration Confirmed',
    message: 'You\'re registered for Tree Planting Initiative',
    timestamp: '2025-10-10T12:00:00Z',
    read: true,
    type: 'event'
  },
  {
    id: '4',
    title: 'New Like',
    message: 'Sarah Johnson liked your comment',
    timestamp: '2025-10-11T11:00:00Z',
    read: true,
    type: 'like'
  }
];

export function getUserById(id: string): User | undefined {
  return mockUsers.find(user => user.id === id);
}

export function getEventById(id: string): Event | undefined {
  return mockEvents.find(event => event.id === id);
}

export const categoryIcons: Record<Event['category'], string> = {
  environment: '🌿',
  education: '📚',
  health: '❤️',
  community: '🤝',
  animals: '🐾'
};

export const categoryColors: Record<Event['category'], string> = {
  environment: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  education: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  health: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  community: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  animals: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
};
