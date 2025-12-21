import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";

import AppLayout from "./layouts/AppLayout";

import LandingPage from "./pages/Landing";
import LoginPage from "./pages/auth/Login";
import SignupPage from "./pages/auth/Register";

import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Community from "./pages/Community";
import { CommunityEventPage } from "./pages/CommunityEventPage";

import { UserManagementPage } from "./pages/admin/UsersStats";
import { EventManagementPage } from "./pages/admin/EventsStats";
import OverviewPage from "./pages/admin/Overview";

import { NotFound } from "./pages/NotFound";
import Settings from "./pages/Setting";
import Profile from "./pages/Profile";
import ManageEvent from "./pages/EventManage";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserRole } from "./types/enum";
import NotificationPage from "./pages/NotificationPage";
import ManageYourEvent from "./pages/ManageYourEvent";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} />
            {/*default volunteer */}
            <Route element={<AppLayout />}>
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feed"
                element={
                  <ProtectedRoute>
                    <Feed />
                  </ProtectedRoute>
                }
              />{" "}
              {/* Feed */}
              <Route
                path="/communities"
                element={
                  <ProtectedRoute>
                    <Community />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:eventId"
                element={
                  <ProtectedRoute>
                    <CommunityEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              {/*admin page */}
              <Route
                path="/admin/overview"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.Admin, UserRole.RootAdmin]}
                  >
                    <OverviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.Admin, UserRole.RootAdmin]}
                  >
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute
                    allowedRoles={[UserRole.Admin, UserRole.RootAdmin]}
                  >
                    <EventManagementPage />
                  </ProtectedRoute>
                }
              />
              {/*event mananger */}
              <Route
                path="/event-manage"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.EventManager]}>
                    <ManageEvent />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/your-events"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.EventManager]}>
                    <ManageYourEvent />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
