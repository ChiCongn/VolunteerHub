import { LoginRegister } from "./pages/LoginRegister";
import { Dashboard } from "./pages/Dashboard";
import { NotFound } from "./pages/NotFound";
import { EventDetails } from "./pages/EventDetails";
import { Profile } from "./pages/Profile";
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { Participations } from "./pages/Participations";
import { UserStats } from "./pages/admin/UsersStats";
import { Overview } from "./pages/admin/Overview";
import { EventsStats } from "./pages/admin/EventsStats";

function App() {
    return (
        <>
            <Toaster position="top-right" />

            <BrowserRouter>
                <Routes>
                    {/* public routes*/}
                    <Route path="/login" element={<LoginRegister />} />

                    {/* protected routes*/}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/me" element={<Profile />} />
                    <Route path="/participants" element={<Participations />} />
                    <Route path="/event" element={<EventDetails />} />

                    <Route path="/admin/overview" element={<Overview />} />
                    <Route path="/admin/users" element={<UserStats />} />
                    <Route path="/admin/events" element={<EventsStats />} />

                    {/* error routes*/}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
