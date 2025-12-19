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
import { PostDetailPage } from "./pages/PostDetailPage";

import { UserManagementPage } from "./pages/admin/UsersStats";
import { EventManagementPage } from "./pages/admin/EventsStats";
import OverviewPage from "./pages/admin/Overview";

import { NotFound } from "./pages/NotFound";
import Settings from "./pages/Setting";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />

          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Feed />} /> {/* Feed */}
            <Route path="/communities" element={<Community />} />
            <Route path="/events/:eventId" element={<CommunityEventPage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/notifications" element={<div>Notifications</div>} />
            <Route path="/bookmarks" element={<div>Bookmarks</div>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin/overview" element={<OverviewPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/events" element={<EventManagementPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
