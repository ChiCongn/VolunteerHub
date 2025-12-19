import * as React from "react";
import { useEffect, useState, useRef } from "react";
// 1. Import hook điều hướng từ react-router-dom
import { useNavigate } from "react-router-dom";
import { BellIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  NotificationCard,
  type NotificationItem,
} from "@/components/cards/NotificationCard";

import { useUserStore } from "@/stores/user.store";
import { useAuth } from "@/components/context/AuthContext";

const Logo = (props: React.SVGAttributes<SVGElement>) => {
  return (
    <svg
      width="36.802"
      height="36.5788"
      viewBox="0 0 1024 1024"
      className="icon"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M859.29 140.28c-5.31-15.34-79.28-7-116 9.42s-163.34 116.58-188.52 172-17.35 64.14-30 84.29-17.1 33.3-22.12 27.66-2.24-16.66 7.83-36.5 28-55 32.21-78.58-10.15-111.32-11.56-147.31-15.46-105.8-33.6-106.37-69.25 69.39-75.15 122.11-17.46 139.43 4.21 195.12 34.11 42.14 41.25 66.88-14 82.5-40.95 117.38-37 46.84-48.27 43.18-17-29-9.06-46.76 26.22-37.12 26.48-61.55-9.33-113.22-15.22-136.06S360 291.87 358 272.34s2.85-67.45-10.61-72.41c-23.69-7.57-57.39 50.77-76.1 132.25s6.86 148 15.18 161.37 27.85 46.23 41.65 61.22 25.81 20.89 29.44 46.57 5.44 38.52-9.79 74.66-66.06 149.34-83 166.45c-4.19-42.4 6.47-30.15 7.41-63.57s-3.05-43.81 3-74.05-21.14-139.41-46-168.41c-12.13-15.05-8-53.59-15.32-54.33s-9.44-2.44-13.92 22.33-43 102-34.27 169.44 12.82 73.72 21.86 87.69 21.56 23.3 31.14 50.25 10.82 40.5 20.73 48.44-16.17 92.81-16.17 92.81l28.17 6s24.82-125.4 50.13-137 37.28 17.63 83.27 17.95 103.84-15.91 129.29-26.22 41.21-16.06 66.32-36.4 56.41-67.58 74.87-89.77 31.63-25.58 25.85-33.46-33.3-3.41-61-1.88-114.7 6.52-178.61 29.73-85.12 71.8-96.12 84.38-14.63 27.62-24.49 21.32-4.73-14.71 1.28-23.38 78.23-177 162.4-192.17c40.67-5.8 37.86 24.72 92.36 26s138.9-18.76 202.48-98.5c47.14-59.19 61-113.91 66.63-121s-28.71-13.21-53.39-6.47-35 16.15-58.92 19.32S607 402.11 563.34 443s-47.73 91-66.93 103.09-41.9 25-44.33 17.05 42.39-100.88 78.53-141.68c11.65-13.69 29-5.41 67.11-24.61s144-102.73 174.92-136.36 32.09-58.69 57.77-79.74 30.84-34.75 28.88-40.47z"
        fill="#73C69A"
      />
      <path
        d="M207.57 519c-11.4 41.54-7.11 122.14 1.1 161.26s31.48 151.17 31.48 151.17-17-118.18-24.28-165.4-8.3-147.03-8.3-147.03zM322.07 240.56C306.49 289.51 307.36 371 310.53 395s25.7 143.29 39 158.6c-17.27-74.25-28.49-121-33.21-164.41-4.65-43.1-0.32-77.72 5.75-148.63zM641.9 671.54c-33.45 39-103.26 81.1-125.27 91S381.22 816 361.2 812.71c72.25-24.34 117.88-39.36 157.31-58.18 39.09-18.66 66.27-40.53 123.39-82.99zM486 95.61c-10.09 27.71-43.91 204.72-21.09 280.17C450.33 288.82 486 95.61 486 95.61zM792.13 181.21c-39.45 21.42-213.55 167.5-225.74 185.64 33.42-22.3 225.74-185.64 225.74-185.64zM808.82 411.65c-18.6 24.78-170.91 157-273.46 145 159.64-32.19 273.46-145 273.46-145z"
        fill="#00757F"
      />
    </svg>
  );
};

const HamburgerIcon = ({
  className,
  ...props
}: React.SVGAttributes<SVGElement>) => (
  <svg
    className={cn("pointer-events-none", className)}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...(props as any)}
  >
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
    />
    <path
      d="M4 12H20"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
    />
    <path
      d="M4 12H20"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
    />
  </svg>
);

const NotificationMenu = ({
  notificationCount = 0,
  onItemClick,
}: {
  notificationCount?: number;
  onItemClick?: (id: string) => void;
}) => {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([
    {
      id: "1",
      user: { name: "Việt Vũ", avatar: "https://github.com/shadcn.png" },
      action: "đã nhắc đến bạn trong một bình luận tại",
      target: "Chan đê",
      time: "3 ngày trước",
      type: "comment",
      isUnread: true,
    },
    {
      id: "2",
      user: { name: "Công chim", avatar: "https://github.com/shadcn.png" },
      action: "đã nhắc đến bạn trong một bình luận tại",
      target: "ncc fan club",
      time: "3 ngày trước",
      type: "comment",
      isUnread: true,
    },
  ]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <BellIcon className="h-4 w-4" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600 border-2 border-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px] p-2">
        <div className="flex items-center justify-between px-2 py-2">
          <h2 className="text-xl font-bold italic">Thông báo</h2>
          <Button variant="link" className="text-blue-600 h-auto p-0">
            Xem tất cả
          </Button>
        </div>

        <div className="max-h-[450px] overflow-y-auto space-y-1">
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <NotificationCard
                key={item.id}
                notification={item}
                onClick={(id) => {
                  setNotifications((prev) =>
                    prev.map((n) =>
                      n.id === id ? { ...n, isUnread: false } : n
                    )
                  );
                  onItemClick?.(id);
                }}
              />
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Không có thông báo nào
            </div>
          )}
        </div>

        <div className="mt-2 border-t pt-2">
          <Button
            variant="secondary"
            className="w-full font-semibold bg-gray-100 hover:bg-gray-200"
          >
            Xem thông báo trước đó
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const UserMenu = ({
  userName = "Guest",
  userEmail = "",
  userAvatar,
  onItemClick,
}: {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onItemClick?: (item: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className="h-9 px-2 py-0 hover:bg-accent hover:text-accent-foreground"
      >
        <Avatar className="h-7 w-7">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="text-xs">
            {userName && userName.length > 0
              ? userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "U"}
          </AvatarFallback>
        </Avatar>
        <ChevronDownIcon className="h-3 w-3 ml-1" />
        <span className="sr-only">User menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{userName}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {userEmail}
          </p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.("profile")}>
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.("settings")}>
        Settings
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.("logout")}>
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// --- Types ---
export interface Navbar05NavItem {
  href?: string;
  label: string;
}
export interface Navbar05Props extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  navigationLinks?: Navbar05NavItem[];
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
  onNavItemClick?: (href: string) => void;
  onInfoItemClick?: (item: string) => void;
  onNotificationItemClick?: (item: string) => void;
  onUserItemClick?: (item: string) => void;
}

// --- Main Component: Navbar05 ---
export const Navbar05 = React.forwardRef<HTMLElement, Navbar05Props>(
  (
    {
      className,
      logo = <Logo />,
      logoHref = "#",
      // Dữ liệu fallback
      userName,
      userEmail,
      userAvatar,
      notificationCount = 3,
      onNavItemClick,
      onInfoItemClick,
      onNotificationItemClick,
      onUserItemClick,
      ...props
    },
    ref
  ) => {
    // 3. Khởi tạo navigate hook
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLElement>(null);

    // 4. Lấy dữ liệu user từ Store (đã được persist trong localStorage)
    const { user, clearSession } = useUserStore();
    const { logout: authContextLogout, user: authUser } = useAuth();

    // Ưu tiên dùng AuthContext, fallback sang Store
    const displayUser = authUser || user;
    console.log("Display user:", displayUser);

    const displayUserName =
      displayUser?.username || userName || "Guest";
    const displayUserEmail = displayUser?.email || userEmail || "";
    const displayUserAvatar =
      displayUser?.avatarUrl ||userAvatar;

    const handleUserMenuClick = (item: string) => {
      if (item === "logout") {
        // Xóa từ Store
        clearSession();
        // Xóa từ AuthContext
        authContextLogout();
        // Điều hướng về trang login
        navigate("/login");
      } else if (onUserItemClick) {
        onUserItemClick(item);
      }
    };

    // 7. Xử lý logic click Logo: chuyển về dashboard
    const handleLogoClick = (e: React.MouseEvent) => {
      e.preventDefault();
      navigate("/dashboard");
    };

    useEffect(() => {
      const checkWidth = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          setIsMobile(width < 768);
        }
      };
      checkWidth();
      const resizeObserver = new ResizeObserver(checkWidth);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    const combinedRef = React.useCallback(
      (node: HTMLElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    return (
      <header
        ref={combinedRef}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-white px-4 md:px-6 [&_*]:no-underline",
          className
        )}
        {...(props as any)}
      >
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-2">
            {/* Mobile menu trigger */}
            {isMobile && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="group h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                    variant="ghost"
                    size="icon"
                  >
                    <HamburgerIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 p-1">
                  <NavigationMenu className="max-w-none">
                    <NavigationMenuList className="flex-col items-start gap-0"></NavigationMenuList>
                  </NavigationMenu>
                </PopoverContent>
              </Popover>
            )}
            {/* Main nav */}
            <div className="flex items-center gap-6">
              <button
                onClick={handleLogoClick} // Gọi hàm điều hướng
                className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
              >
                <div className="text-2xl">{logo}</div>
                <span className="hidden font-bold text-xl sm:inline-block">
                  VolunteerHub
                </span>
              </button>
              {/* Navigation menu */}
              {!isMobile && (
                <NavigationMenu className="flex">
                  <NavigationMenuList className="gap-1"></NavigationMenuList>
                </NavigationMenu>
              )}
            </div>
          </div>
          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Notification */}
              <NotificationMenu
                notificationCount={notificationCount}
                onItemClick={onNotificationItemClick}
              />
            </div>
            {/* User menu */}
            <UserMenu
              userName={displayUserName}
              userEmail={displayUserEmail}
              userAvatar={displayUserAvatar}
              onItemClick={handleUserMenuClick} // Truyền handler xử lý logout
            />
          </div>
        </div>
      </header>
    );
  }
);

Navbar05.displayName = "Navbar05";
export { Logo, HamburgerIcon, NotificationMenu, UserMenu };
