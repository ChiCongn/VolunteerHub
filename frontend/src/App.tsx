import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { RightPanel } from "./components/RightPanel";
import { MobileNav } from "./components/MobileNav";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { OnboardingTour } from "./components/OnboardingTour";
import { LoginRegister } from "./pages/LoginRegister";
import { Dashboard } from "./pages/Dashboard";
import { EventDetails } from "./pages/EventDetails";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Profile } from "./pages/Profile";
import { ErrorPage } from "./pages/ErrorPage";
import { Toaster } from "./components/ui/sonner";
import {
  type User,
  mockUsers,
  mockEvents,
  mockNotifications,
  getEventById,
} from "./lib/mockData";
import { toast } from "sonner";
import "./index.css";

function App() {
  return (
    <div>
      <LoginRegister></LoginRegister>
    </div>
  );
}

export default App;
