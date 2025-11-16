import { Home, Calendar, Bell, User } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";

interface MobileNavProps {
    currentView: string;
    onViewChange: (view: string) => void;
    unreadNotifications: number;
}

export function MobileNav() {
    // mock variable, will replace by hook and store
    const unreadNotifications = 3;
    const currentView = "dashboard";

    const navItems = [
        { id: "dashboard", label: "Home", icon: Home },
        { id: "events", label: "Events", icon: Calendar },
        {
            id: "notifications",
            label: "Alerts",
            icon: Bell,
            badge: unreadNotifications,
        },
        { id: "profile", label: "Profile", icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
            <div className="grid grid-cols-4 h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                        <Button
                            key={item.id}
                            variant="ghost"
                            className={cn(
                                "h-full rounded-none flex flex-col gap-1 relative",
                                isActive && "text-[#43A047]"
                            )}
                        >
                            <div className="relative">
                                <Icon className="w-5 h-5" />
                                {item.badge && item.badge > 0 && (
                                    <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 bg-[#F44336] text-white text-[10px]">
                                        {item.badge}
                                    </Badge>
                                )}
                            </div>
                            <span className="text-xs">{item.label}</span>
                        </Button>
                    );
                })}
            </div>
        </nav>
    );
}
