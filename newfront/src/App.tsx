import { BrowserRouter, Routes, Route } from "react-router-dom";
import Page from "./pages/dashboard";
import { EventPage } from "./pages/eventPage";
import { CommunityEventPage } from "./pages/testEvent";

import LandingPage from "./pages/Landing";
import LoginPage from "./pages/auth/Login";
import SignupPage from "./pages/auth/Register";
import { NotFound } from "./pages/NotFound";
import Home from "./pages/Home";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Page />} />
          <Route path="/events" element={<EventPage />} />
          <Route path="/events/:eventId" element={<CommunityEventPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          {/* error routes*/}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
