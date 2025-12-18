import React from "react";
// 1. Import các hook và component từ react-router-dom
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
} from "lucide-react";

export default function LeftPanel() {
  // 2. Khởi tạo hook navigate
  const navigate = useNavigate();

    // 3. Cấu hình danh sách menu và đường dẫn tương ứng
    const menuItems = [
        { icon: Home, label: "Home", path: "/dashboard" }, // Trang chủ
        { icon: Users, label: "Communities", path: "/communities" },
        { icon: Bell, label: "Notifications", path: "/notifications" },
        { icon: Bookmark, label: "Bookmarks", path: "/bookmarks" },
        { icon: User, label: "Profile", path: "/profile" }, // Hoặc /u/username
        { icon: Settings, label: "Settings", path: "/settings" },
    ];

  // 3. Cấu hình danh sách menu và đường dẫn tương ứng
  const menuItems = [
    { icon: Home, label: "Home", path: "/home" }, // Trang chủ
    { icon: Users, label: "Communities", path: "/communities" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Bookmark, label: "Bookmarks", path: "/bookmarks" },
    { icon: User, label: "Profile", path: "/profile" }, // Hoặc /u/username
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="border-border sticky top-0 h-full w-64 overflow-y-auto border-r p-4 bg-white">
      <nav className="space-y-2">
        {/* 4. Dùng vòng lặp map để render Button và xử lý onClick */}
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

      <Button
        className="mt-6 w-full"
        onClick={() => navigate("/create-post")} // Ví dụ chuyển đến trang tạo bài viết
      >
        Create Post
      </Button>

      <div className="mt-8">
        <h3 className="mb-4 text-sm font-semibold">Your Communities</h3>
        <div className="space-y-2 flex flex-col">
          {/* 5. Thay thế thẻ <a> bằng thẻ <Link> để không reload trang */}
          <Link
            to="/r/design" // Đường dẫn ví dụ
            className="flex items-center text-sm hover:underline p-1"
          >
            <div className="mr-2 h-2 w-2 rounded-full bg-pink-500"></div>
            Design Community
          </Link>

          <Link
            to="/r/tech"
            className="flex items-center text-sm hover:underline p-1"
          >
            <div className="mr-2 h-2 w-2 rounded-full bg-blue-500"></div>
            Tech Enthusiasts
          </Link>

          <Link
            to="/r/sustainability"
            className="flex items-center text-sm hover:underline p-1"
          >
            <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
            Sustainability
          </Link>
        </div>
      </div>
    </div>
  );
}
