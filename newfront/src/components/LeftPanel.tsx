// import { useNavigate, Link, useLocation } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import {
//   Home,
//   Users,
//   Bell,
//   MessageCircle,
//   Bookmark,
//   User,
//   Settings,
//   Newspaper,
//   Calendar,
//   Shield,
//   ClipboardList,
// } from "lucide-react";

// import { useAuthState } from "@/hooks/useAuthState";
// import EventShortcuts from "./EventShortcuts";

// // Volunteer: 'volunteer',
// // EventManager: 'event_manager',
// // Admin: 'admin',
// // RootAdmin: 'root_admin'

// export default function LeftPanel() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useAuthState();

//   const menuItems = [
//     ...(user?.role === "volunteer"
//       ? [
//           { icon: Home, label: "Home", path: "/home" },
//           { icon: Newspaper, label: "Feed", path: "/feed" },
//           { icon: Users, label: "Communities", path: "/communities" },
//           { icon: Bell, label: "Notifications", path: "/notifications" },
//           { icon: User, label: "Profile", path: "/profile" },
//           { icon: Settings, label: "Settings", path: "/settings" },
//         ]
//       : []),

//     ...(user?.role === "event_manager"
//       ? [
//           { icon: Calendar, label: "Manager Overview", path: "/event-manage" },
//           { icon: ClipboardList, label: "Your Events", path: "/your-events" },
//           { icon: Newspaper, label: "Feed", path: "/feed" },
//           { icon: Users, label: "Communities", path: "/communities" },
//           { icon: Bell, label: "Notifications", path: "/notifications" },
//           { icon: User, label: "Profile", path: "/profile" },
//           { icon: Settings, label: "Settings", path: "/settings" },
//         ]
//       : []),

//     ...(user?.role === "admin"
//       ? [
//           { icon: Shield, label: "Admin Overview", path: "/admin/overview" },
//           { icon: Users, label: "User Management", path: "/admin/users" },
//           { icon: Calendar, label: "Event Management", path: "/admin/events" },
//           { icon: Newspaper, label: "Feed", path: "/feed" },
//           { icon: Users, label: "Communities", path: "/communities" },
//           { icon: Bell, label: "Notifications", path: "/notifications" },
//           { icon: User, label: "Profile", path: "/profile" },
//           { icon: Settings, label: "Settings", path: "/settings" },
//         ]
//       : []),
//   ];

//   return (
//     <div className="border-border fixed top-16 h-full w-64 overflow-y-auto border-r p-4 bg-white">
//       <nav className="space-y-2">
//         {menuItems.map((item) => {
//           const isActive = location.pathname === item.path;

//           return (
//             <Button
//               key={item.label}
//               variant={isActive ? "secondary" : "ghost"}
//               className={`w-full justify-start ${
//                 isActive ? "font-semibold" : ""
//               }`}
//               onClick={() => navigate(item.path)}
//             >
//               <item.icon
//                 className={`mr-2 h-4 w-4 ${isActive ? "text-primary" : ""}`}
//               />
//               {item.label}
//             </Button>
//           );
//         })}
//       </nav>

//       <div className="mt-8">
//         <EventShortcuts />
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Bell,
  User,
  Settings,
  Newspaper,
  Calendar,
  Shield,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";

import { useAuthState } from "@/hooks/useAuthState";
import EventShortcuts from "./EventShortcuts";

export default function LeftPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthState();

  const [open, setOpen] = useState(false);

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
          { icon: ClipboardList, label: "Manage Your Events", path: "/your-events" },
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

  const SidebarContent = (
    <>
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
              onClick={() => {
                navigate(item.path);
                setOpen(false); // đóng sidebar trên mobile
              }}
            >
              <item.icon
                className={`mr-2 h-4 w-4 ${
                  isActive ? "text-primary" : ""
                }`}
              />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="mt-8">
        <EventShortcuts />
      </div>
    </>
  );

  return (
    <>
      {/* ===== Hamburger button (mobile) ===== */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* ===== Overlay (mobile) ===== */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ===== Sidebar (mobile) ===== */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r p-4 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:hidden`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold">Menu</span>
          <button onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {SidebarContent}
      </aside>

      {/* ===== Sidebar (desktop) ===== */}
      <aside className="hidden md:fixed md:top-16 md:left-0 md:h-full md:w-64 md:border-r md:p-4 md:bg-white md:block">
        {SidebarContent}
      </aside>
    </>
  );
}
