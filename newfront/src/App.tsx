import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/login";
import Page from "./pages/dashboard";
import { EventPage } from "./pages/eventPage";
import { CommunityEventPage } from "./pages/testEvent";

import LandingPage from "./pages/Landing";
import LoginPage from "./pages/auth/Login";
import SignupPage from "./pages/auth/Register";
function Home() {
  return <h1>ok</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Page />} />
        <Route path="/event" element={<EventPage />} />
        <Route path="/events/:eventId" element={<CommunityEventPage />} />
        <Route path="/vcl" element={<Login />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
