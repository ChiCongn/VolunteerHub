import { Search, Bell, Moon, Sun, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { User } from "../lib/mockData";
import { NotificationsPanel } from "../components/NotificationsPanel";
import { mockNotifications } from "../lib/mockData";
import { toast } from 'sonner';

interface HeaderProps {
    currentUser: User;
    darkMode: boolean;
    onToggleDarkMode: () => void;
    onToggleSidebar?: () => void;
    unreadNotifications: number;
    onNotificationsClick: () => void;
    onLogout: () => void;
}

export function Header() {
    const darkMode = false;
    const unreadNotifications = 2;
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState(() =>
        mockNotifications.map((notification) => ({ ...notification }))
    );

    const handleNotificationClick = (notificationId: string) => {
        setNotifications(
            notifications.map((n) =>
                n.id === notificationId ? { ...n, read: true } : n
            )
        );
    };

    const onNotificationsClick = () => {
        setShowNotifications((showNotifications) => !showNotifications);
    };

    const handleMarkAllRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
        toast.success("All notifications marked as read");
    };
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between max-w-[1440px] mx-auto px-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        //onClick={onToggleSidebar}
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[#43A047] rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold">VH</span>
                        </div>
                        <h1 className="hidden sm:block text-[#43A047]">
                            VolunteerHub
                        </h1>
                    </div>
                </div>

                <div className="flex-1 max-w-md mx-4 hidden sm:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search events, posts, people..."
                            className="pl-10 bg-muted border-0"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        //onClick={onToggleDarkMode}
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? (
                            <Sun className="w-5 h-5" />
                        ) : (
                            <Moon className="w-5 h-5" />
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        onClick={onNotificationsClick}
                        aria-label="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadNotifications > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#F44336] text-white text-xs">
                                {unreadNotifications}
                            </Badge>
                        )}
                    </Button>

                    {showNotifications && (
                        <div className="hidden md:block fixed top-16 right-4 z-0">
                            <NotificationsPanel
                                notifications={notifications}
                                onClose={() => setShowNotifications(false)}
                                onNotificationClick={handleNotificationClick}
                                onMarkAllRead={handleMarkAllRead}
                            />
                        </div>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-10 w-10 rounded-full"
                            >
                                <Avatar>
                                    <AvatarImage
                                        src="placeholder"
                                        alt="placeholder"
                                    />
                                    <AvatarFallback></AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-56"
                            align="end"
                            forceMount
                        >
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="font-medium leading-none">
                                        Username
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        email
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Log out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
