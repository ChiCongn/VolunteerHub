import { BrowserRouter, Routes, Route } from "react-router-dom";
import Page from "./pages/dashboard";
import { EventPage } from "./pages/eventPage";
import { CommunityEventPage } from "./pages/testEvent";

import LandingPage from "./pages/Landing";
import LoginPage from "./pages/auth/Login";
import SignupPage from "./pages/auth/Register";
import { NotFound } from "./pages/NotFound";
import { UserManagementPage } from "./pages/admin/UsersStats";
import { EventManagementPage } from "./pages/admin/EventsStats";
import OverviewPage from "./pages/admin/Overview";
import { PostDetailPage } from "./pages/PostDetailPage";
import Community from "./pages/Community";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Page />} />
          <Route path="/events" element={<EventPage />} />
          <Route path="/events/:eventId" element={<CommunityEventPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />

          <Route path="/admin/overview" element={<OverviewPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/events" element={<EventManagementPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/communities" element={<Community />} />
          {/* error routes*/}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
