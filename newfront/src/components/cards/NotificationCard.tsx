import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  Users,
  Heart,
  Bell,
  Settings,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target?: string;
  time: string;
  type: "event" | "user" | "system";
  isUnread?: boolean;
  redirectUrl?: string;
}

interface NotificationCardProps {
  notification: NotificationItem;
  onClick?: (id: string) => void;
}

export const NotificationCard = ({
  notification,
  onClick,
}: NotificationCardProps) => {
  const renderTypeIcon = () => {
    switch (notification.type) {
      case "event":
        return (
          <div className="bg-green-500 p-1 rounded-full border-2 border-white text-white">
            <Calendar size={10} fill="currentColor" />
          </div>
        );
      case "user":
        return (
          <div className="bg-blue-500 p-1 rounded-full border-2 border-white text-white">
            <Users size={10} fill="currentColor" />
          </div>
        );
      case "system":
        return (
          <div className="bg-black p-1 rounded-full border-2 border-white text-white">
            <Settings size={10} fill="currentColor" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-500 p-1 rounded-full border-2 border-white text-white">
            <Bell size={10} fill="currentColor" />
          </div>
        );
    }
  };

  return (
    <div
      onClick={() => onClick?.(notification.id)}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent group",
        notification.isUnread
          ? "bg-blue-50/50 dark:bg-blue-900/10"
          : "bg-transparent"
      )}
    >
      {/* Cụm Avatar & Icon Overlay */}
      <div className="relative shrink-0">
        <Avatar className="h-14 w-14 border border-border">
          <AvatarImage
            src={notification.user.avatar}
            alt={notification.user.name}
          />
          <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1">{renderTypeIcon()}</div>
      </div>

      {/* Nội dung text */}
      <div className="flex-1 space-y-1 overflow-hidden">
        <p className="text-sm leading-snug">
          <span className="font-bold">{notification.user.name}</span>{" "}
          {notification.action}
          {notification.target && (
            <span className="font-bold"> {notification.target}.</span>
          )}
        </p>
        <p
          className={cn(
            "text-xs",
            notification.isUnread
              ? "text-blue-600 font-semibold"
              : "text-muted-foreground"
          )}
        >
          {notification.time}
        </p>
      </div>

      {/* Chấm xanh báo chưa đọc */}
      {notification.isUnread && (
        <div className="mt-5 shrink-0">
          <div className="h-3 w-3 rounded-full bg-blue-600" />
        </div>
      )}
    </div>
  );
};
