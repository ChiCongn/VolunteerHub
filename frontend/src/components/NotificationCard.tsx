import type { Notification } from "../lib/mockData";
import { Bell, MessageCircle, Heart, Calendar, Info } from "lucide-react";
import { cn } from "./ui/utils";

interface NotificationCardProps {
  notification: Notification;
  onClick?: () => void;
}

export function NotificationCard({
  notification,
  onClick,
}: NotificationCardProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "event":
        return <Calendar className="w-5 h-5 text-[#43A047]" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-[#2196F3]" />;
      case "like":
        return <Heart className="w-5 h-5 text-[#F44336]" />;
      default:
        return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - notifTime.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    return `${diffInDays}d ago`;
  };

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg border border-border cursor-pointer hover:bg-muted transition-colors",
        !notification.read && "bg-[#43A047]/5"
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0 mt-1">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm">{notification.title}</p>
          {!notification.read && (
            <div className="w-2 h-2 bg-[#43A047] rounded-full flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {timeAgo(notification.timestamp)}
        </p>
      </div>
    </div>
  );
}
