import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { MobileNav } from './components/MobileNav';
import { NotificationsPanel } from './components/NotificationsPanel';
import { OnboardingTour } from './components/OnboardingTour';
import { LoginRegister } from './screens/LoginRegister';
import { Dashboard } from './screens/Dashboard';
import { EventDetails } from './screens/EventDetails';
import { AdminDashboard } from './screens/AdminDashboard';
import { Profile } from './screens/Profile';
import { ErrorPage } from './screens/ErrorPage';
import { Toaster } from './components/ui/sonner';
import type { User } from './lib/mockData';
import { mockEvents, mockNotifications, getEventById } from './lib/mockData';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:8000/api';

function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(
    () => mockNotifications.map((notification) => ({ ...notification }))
  );
  const [showOnboarding, setShowOnboarding] = useState(false);

  const mapApiUserToUser = (apiUser: any): User => {
    const normalizedRole =
      apiUser?.role === 'organizer'
        ? 'manager'
        : apiUser?.role === 'volunteer' || apiUser?.role === 'manager' || apiUser?.role === 'admin'
          ? apiUser.role
          : 'volunteer';

    return {
      id: apiUser?.id ?? '',
      name: apiUser?.name ?? 'User',
      email: apiUser?.email ?? '',
      role: normalizedRole,
      avatar:
        apiUser?.avatar ??
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(apiUser?.name ?? 'User')}`,
      bio: apiUser?.bio ?? '',
    };
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (typeof window === 'undefined') {
        setIsBootstrapping(false);
        return;
      }

      const storedToken = localStorage.getItem('authToken');
      if (!storedToken) {
        setIsBootstrapping(false);
        return;
      }

      setAuthToken(storedToken);

      try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Không thể tải thông tin người dùng');
        }

        const data = await response.json();
        if (!data?.user) {
          throw new Error('Không tìm thấy dữ liệu người dùng');
        }

        setCurrentUser(mapApiUserToUser(data.user));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to bootstrap auth', error);
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapAuth();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? 'Đăng nhập thất bại');
      }

      const user = mapApiUserToUser(data.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }
      setAuthToken(data.token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      toast.success(`Chào mừng trở lại, ${user.name}!`);
    } catch (error) {
      console.error('Login failed', error);
      toast.error(error instanceof Error ? error.message : 'Đăng nhập thất bại');
    }
  };

  const handleRegister = async (name: string, email: string, password: string, role: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? 'Đăng ký thất bại');
      }

      const user = mapApiUserToUser(data.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }
      setAuthToken(data.token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      toast.success(`Chào mừng đến với VolunteerHub, ${user.name}!`);
    } catch (error) {
      console.error('Register failed', error);
      toast.error(error instanceof Error ? error.message : 'Đăng ký thất bại');
    }
  };

  const handleLogout = async () => {
    let errorMessage: string | null = null;

    if (authToken) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok && response.status !== 401) {
          const data = await response.json().catch(() => null);
          errorMessage = data?.message ?? 'Đăng xuất thất bại từ máy chủ';
        }
      } catch (error) {
        console.error('Logout failed', error);
        errorMessage = error instanceof Error ? error.message : 'Đăng xuất thất bại từ máy chủ';
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }

    setAuthToken(null);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('dashboard');
    setSelectedEventId(null);
    setShowNotifications(false);
    setNotifications(mockNotifications.map((notification) => ({ ...notification })));

    if (errorMessage) {
      toast.error(errorMessage);
    } else {
      toast.success('Đã đăng xuất');
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setSelectedEventId(null);
    setIsSidebarOpen(false);
    setShowNotifications(false);
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('event-details');
  };

  const handleRegisterEvent = (eventId: string) => {
    // Handle event registration
    console.log('Registered for event:', eventId);
  };

  const handleUpdateProfile = (updates: Partial<User>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleNotificationsClick = () => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile) {
      setCurrentView('notifications');
      setShowNotifications(false);
    } else {
      if (currentView === 'notifications') {
        setCurrentView('dashboard');
      }
      setShowNotifications((prev) => !prev);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleNotificationClick = (notificationId: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-muted-foreground">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <>
        <LoginRegister onLogin={handleLogin} onRegister={handleRegister} />
        <Toaster position="top-right" />
      </>
    );
  }

  const trendingEvents = mockEvents
    .filter((e) => e.status === 'upcoming')
    .sort((a, b) => b.registered - a.registered);

  const recommendedEvents = mockEvents
    .filter((e) => e.status === 'upcoming')
    .sort(() => Math.random() - 0.5);

  const selectedEvent = selectedEventId ? getEventById(selectedEventId) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentUser={currentUser}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        unreadNotifications={unreadNotifications}
        onNotificationsClick={handleNotificationsClick}
        onLogout={handleLogout}
      />

      <div className="flex">
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          userRole={currentUser.role}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0">
          <div className="container max-w-[1440px] mx-auto px-4 py-6 mb-16 md:mb-0">
            <div className="flex gap-6">
              <div className="flex-1 min-w-0">
                {currentView === 'dashboard' && (
                  <Dashboard
                    onEventClick={handleEventClick}
                    onRegisterEvent={handleRegisterEvent}
                  />
                )}

                {currentView === 'events' && (
                  <div className="space-y-6">
                    <h1>All Events</h1>
                    <Dashboard
                      onEventClick={handleEventClick}
                      onRegisterEvent={handleRegisterEvent}
                    />
                  </div>
                )}

                {currentView === 'event-details' && selectedEvent && (
                  <EventDetails
                    event={selectedEvent}
                    onBack={() => handleViewChange('dashboard')}
                    onRegister={handleRegisterEvent}
                    isManager={currentUser.role === 'manager' || currentUser.role === 'admin'}
                  />
                )}

                {currentView === 'admin' && currentUser.role === 'admin' && (
                  <AdminDashboard />
                )}

                {currentView === 'profile' && (
                  <Profile user={currentUser} onUpdateProfile={handleUpdateProfile} />
                )}

                {currentView === 'settings' && (
                  <Profile user={currentUser} onUpdateProfile={handleUpdateProfile} />
                )}

                {currentView === 'discussions' && (
                  <div className="space-y-6">
                    <h1>Discussions</h1>
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                      <p className="text-muted-foreground">
                        Discussion feature coming soon!
                      </p>
                    </div>
                  </div>
                )}

                {currentView === 'trending' && (
                  <div className="space-y-6">
                    <h1>Trending Events</h1>
                    <Dashboard
                      onEventClick={handleEventClick}
                      onRegisterEvent={handleRegisterEvent}
                    />
                  </div>
                )}

                {currentView === 'notifications' && (
                  <div className="md:hidden">
                    <NotificationsPanel
                      notifications={notifications}
                      onClose={() => handleViewChange('dashboard')}
                      onNotificationClick={handleNotificationClick}
                      onMarkAllRead={handleMarkAllRead}
                    />
                  </div>
                )}
              </div>

              {currentView !== 'event-details' &&
                currentView !== 'admin' &&
                currentView !== 'profile' &&
                currentView !== 'settings' && (
                  <RightPanel
                    trendingEvents={trendingEvents}
                    recommendedEvents={recommendedEvents}
                    onEventClick={handleEventClick}
                  />
                )}
            </div>
          </div>
        </main>
      </div>

      <MobileNav
        currentView={currentView}
        onViewChange={handleViewChange}
        unreadNotifications={unreadNotifications}
      />

      {showNotifications && (
        <div className="hidden md:block fixed top-16 right-4 z-40">
          <NotificationsPanel
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={handleMarkAllRead}
          />
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}

export default App;
