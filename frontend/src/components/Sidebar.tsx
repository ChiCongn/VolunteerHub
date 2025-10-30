import {
  Home,
  Calendar,
  MessageSquare,
  User,
  Settings,
  Shield,
  TrendingUp,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userRole: "volunteer" | "manager" | "admin";
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  currentView,
  onViewChange,
  userRole,
  isOpen,
  onClose,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "events", label: "Events", icon: Calendar },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (userRole === "admin") {
    menuItems.push({ id: "admin", label: "Admin Tools", icon: Shield });
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-60 bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive &&
                    "bg-[#43A047] text-white hover:bg-[#388E3C] hover:text-white"
                )}
                onClick={() => {
                  onViewChange(item.id);
                  onClose?.();
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
