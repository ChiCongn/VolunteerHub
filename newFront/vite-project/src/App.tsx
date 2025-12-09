import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/login";
import Page from "./pages/dashboard";
import { EventPage } from "./pages/eventPage";
import { CommunityEventPage } from "./pages/testEvent";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import { Navbar05 } from "./pages/navbar";
function Home() {
    return <h1>ok</h1>;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Page />} />
                <Route path="/event" element={<EventPage />} />
                <Route
                    path="/events/:eventId"
                    element={<CommunityEventPage />}
                />
                <Route path="/vcl" element={<Login />} />
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
