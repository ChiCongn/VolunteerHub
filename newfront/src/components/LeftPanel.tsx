import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Bell,
  MessageCircle,
  Bookmark,
  User,
  Settings,
  Newspaper,
  Calendar,
  Shield,
  ClipboardList,
} from "lucide-react";

import { useAuthState } from "@/hooks/useAuthState";
import EventShortcuts from "./EventShortcuts";

// Volunteer: 'volunteer',
// EventManager: 'event_manager',
// Admin: 'admin',
// RootAdmin: 'root_admin'

export default function LeftPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthState();

  const menuItems = [
    ...(user?.role === "volunteer"
      ? [
          { icon: Home, label: "Home", path: "/home" },
          { icon: Newspaper, label: "Feed", path: "/feed" },
          { icon: Users, label: "Communities", path: "/communities" },
          { icon: Bell, label: "Notifications", path: "/notifications" },
          { icon: User, label: "Profile", path: "/profile" },
          { icon: Settings, label: "Settings", path: "/settings" },
        ]
      : []),

    ...(user?.role === "event_manager"
      ? [
          { icon: Calendar, label: "Manager Overview", path: "/event-manage" },
          { icon: ClipboardList, label: "Your Events", path: "/your-events" },
          { icon: Newspaper, label: "Feed", path: "/feed" },
          { icon: Users, label: "Communities", path: "/communities" },
          { icon: Bell, label: "Notifications", path: "/notifications" },
          { icon: User, label: "Profile", path: "/profile" },
          { icon: Settings, label: "Settings", path: "/settings" },
        ]
      : []),

    ...(user?.role === "admin"
      ? [
          { icon: Shield, label: "Admin Overview", path: "/admin/overview" },
          { icon: Users, label: "User Management", path: "/admin/users" },
          { icon: Calendar, label: "Event Management", path: "/admin/events" },
          { icon: Newspaper, label: "Feed", path: "/feed" },
          { icon: Users, label: "Communities", path: "/communities" },
          { icon: Bell, label: "Notifications", path: "/notifications" },
          { icon: User, label: "Profile", path: "/profile" },
          { icon: Settings, label: "Settings", path: "/settings" },
        ]
      : []),
  ];

  return (
    <div className="border-border fixed top-16 h-full w-64 overflow-y-auto border-r p-4 bg-white">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Button
              key={item.label}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                isActive ? "font-semibold" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon
                className={`mr-2 h-4 w-4 ${isActive ? "text-primary" : ""}`}
              />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="mt-8">
        <EventShortcuts />
      </div>
    </div>
  );
}
