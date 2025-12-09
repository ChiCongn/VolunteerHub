import {
    Home,
    Calendar,
    MessageSquare,
    User,
    Settings,
    Shield,
    TrendingUp,
    BarChart3,
    Plus,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";
import { useNavigate } from "react-router";

interface SidebarProps {
    currentView: string;
    onViewChange: (view: string) => void;
    userRole: "volunteer" | "manager" | "admin";
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar() {
    // mock variable, will replace by hook and store
    const currentView = "dashboard";
    const userRole: string = "admin";
    const isOpen = true;

    const navigate = useNavigate();
    const [adminToolsExpanded, setAdminToolsExpanded] = useState(false);
    const [managerToolsExpanded, setManagerToolsExpanded] = useState(false);
    const [discussionExpanded, setDiscussionExpanded] = useState(true);

    const mainItems = [
        { id: "/dashboard", label: "Dashboard", icon: Home },
        { id: "/events", label: "Events", icon: Calendar },
        ...(userRole !== "admin"
            ? [{ id: "participated", label: "My Events", icon: Calendar }]
            : []),
    ];

    const switchPage = (path: string) => {
        navigate(path);
    };

    // 2. DISCUSSION
    const discussionItems = [
        { id: "/env", label: "Environment" },
        { id: "/community", label: "Community" },
        { id: "/edu", label: "Education" },
    ];

    // 3. MANAGER TOOLS
    const managerItems = [
        { id: "create-event", label: "Create Event", icon: Plus },
        { id: "manage-events", label: "Manage Events", icon: Calendar },
        { id: "event-stats", label: "Event Stats", icon: BarChart3 },
    ];

    // 4. ADMIN TOOLS
    const adminItems = [
        { id: "/admin/overview", label: "Overview", icon: Shield },
        { id: "/admin/events", label: "Events", icon: BarChart3 },
        { id: "/admin/users", label: "Users", icon: User },
    ];

    // 5. CÁ NHÂN
    const personalItems = [
        { id: "/trending", label: "Trending", icon: TrendingUp },
        { id: "/me", label: "Profile", icon: User },
        { id: "/settings", label: "Settings", icon: Settings },
    ];

    const renderMenuItem = (item: any) => {
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
                onClick={() => switchPage(item.id)}
            >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
            </Button>
        );
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    //onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    "fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-60 bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:translate-x-0 overflow-y-auto",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <nav className="flex flex-col gap-1 p-4">
                    {mainItems.map(renderMenuItem)}
                    <>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={() =>
                                setDiscussionExpanded(!discussionExpanded)
                            }
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span>Discussion</span>
                        </Button>

                        {discussionExpanded && (
                            <div className="ml-4 space-y-1">
                                {discussionItems.map((item) => {
                                    const isActive = currentView === item.id;
                                    return (
                                        <Button
                                            key={item.id}
                                            variant={
                                                isActive ? "secondary" : "ghost"
                                            }
                                            size="sm"
                                            className={cn(
                                                "w-full justify-start gap-3",
                                                isActive &&
                                                    "bg-[#43A047] text-white hover:bg-[#388E3C] hover:text-white"
                                            )}
                                        >
                                            <span>{item.label}</span>
                                        </Button>
                                    );
                                })}
                                <div className="my-2 border-t border-sidebar-border" />
                            </div>
                        )}
                    </>

                    {(userRole === "manager" || userRole === "admin") && (
                        <>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3"
                                onClick={() =>
                                    setManagerToolsExpanded(
                                        !managerToolsExpanded
                                    )
                                }
                            >
                                {/* {managerToolsExpanded ? (
                                    <ChevronDown className="w-5 h-5" />
                                ) : (
                                    <ChevronRight className="w-5 h-5" />
                                )} */}
                                <span>Manager Tools</span>
                            </Button>

                            {managerToolsExpanded && (
                                <div>
                                    <div className="ml-4 space-y-1">
                                        {managerItems.map(renderMenuItem)}
                                    </div>
                                    <div className="my-2 border-t border-sidebar-border" />
                                </div>
                            )}
                        </>
                    )}

                    {userRole === "admin" && (
                        <>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3"
                                onClick={() =>
                                    setAdminToolsExpanded(!adminToolsExpanded)
                                }
                            >
                                {/* {adminToolsExpanded ? (
                                    <ChevronDown className="w-5 h-5" />
                                ) : (
                                    <ChevronRight className="w-5 h-5" />
                                )} */}
                                <Shield className="w-5 h-5" />
                                <span>Admin Tools</span>
                            </Button>

                            {adminToolsExpanded && (
                                <div>
                                    <div className="ml-4 space-y-1">
                                        {adminItems.map(renderMenuItem)}
                                    </div>
                                    <div className="my-2 border-t border-sidebar-border" />
                                </div>
                            )}
                        </>
                    )}
                    {personalItems.map(renderMenuItem)}
                </nav>
            </aside>
        </>
    );
}
