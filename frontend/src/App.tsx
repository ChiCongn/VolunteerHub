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
import { mockUsers } from './lib/mockData';
import { mockEvents } from './lib/mockData';
import { mockNotifications } from './lib/mockData';
import { getEventById } from './lib/mockData';
import { toast } from 'sonner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = (email: string, password: string) => {
    // Mock login - in real app, this would call an API
    const user = mockUsers.find((u) => u.email === email);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${user.name}!`);
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleRegister = (name: string, email: string, password: string, role: string) => {
    // Mock registration
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      name,
      email,
      role: role as User['role'],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      bio: '',
    };
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    toast.success(`Welcome to VolunteerHub, ${name}!`);
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
    if (currentView === 'notifications') {
      setCurrentView('dashboard');
      setShowNotifications(false);
    } else {
      setCurrentView('notifications');
      setShowNotifications(true);
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
