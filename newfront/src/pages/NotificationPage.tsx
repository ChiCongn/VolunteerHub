import { useEffect, useState } from "react";
import { CheckCheck, Bell, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  notificationService,
  type ApiNotificationItem,
} from "@/services/notification.service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { NotificationItem } from "@/components/cards/NotificationCard";
import { useAuth } from "@/components/context/AuthContext";

const parseMessage = (msg: string) => {
  const regex = /\*\*(.*?)\*\*\s*(.*)/;
  const match = msg.match(regex);
  if (match) {
    return { name: match[1], action: match[2] };
  }
  return { name: "Hệ thống", action: msg };
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await notificationService.getByUserId(user.id);

      const mappedItems: NotificationItem[] = data.items.map((item) => {
        const { name, action } = parseMessage(item._message);
        return {
          id: item._id,
          user: {
            name: name,
            avatar: "",
          },
          action: action,
          time: formatDistanceToNow(new Date(item._createdAt), {
            addSuffix: true,
            locale: vi,
          }),
          type: item._type,
          isUnread: !item._isRead,
          redirectUrl: item._redirectUrl,
        };
      });
      setNotifications(mappedItems);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const handleMarkAsRead = async (notification: NotificationItem) => {
    if (notification.isUnread) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isUnread: false } : n
          )
        );
      } catch (error) {
        console.error("Error marking as read", error);
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    } catch (error) {
      console.error("Error marking all as read", error);
    }
  };

  return (
    <div className="min-h-screen pb-10">
      <div className="max-w-4xl mx-auto pt-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-muted-foreground">
              Manage all your activity and notifications
            </p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          {loading ? (
            <div className="p-20 text-center text-muted-foreground">
              Loading notification...
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {notifications.map((item) => (
                <BigNotificationCard
                  key={item.id}
                  notification={item}
                  onClick={() => handleMarkAsRead(item)}
                />
              ))}
            </div>
          ) : (
            <div className="p-20 text-center">
              <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">
                You don't have any notification!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface BigNotificationCardProps {
  notification: NotificationItem;
  onClick: () => void;
}

const BigNotificationCard = ({
  notification,
  onClick,
}: BigNotificationCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-4 p-5 transition-all hover:bg-gray-50 cursor-pointer relative group",
        notification.isUnread ? "bg-blue-50/40" : "bg-transparent"
      )}
    >
      {notification.isUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
      )}

      <Avatar className="h-14 w-14 border border-gray-100 shadow-sm">
        <AvatarImage src={notification.user.avatar} />
        <AvatarFallback className="bg-primary/10 text-primary font-bold">
          {notification.user.name[0]}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="text-base sm:text-lg leading-relaxed text-gray-800">
            <span className="font-bold text-gray-900">
              {notification.user.name}
            </span>{" "}
            <span className="text-gray-700">{notification.action}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <span
            className={cn(
              "text-sm",
              notification.isUnread
                ? "text-blue-600 font-semibold"
                : "text-gray-500"
            )}
          >
            {notification.time}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
            {notification.type}
          </span>
        </div>
      </div>

      {notification.isUnread && (
        <div className="self-center ml-2">
          <div className="h-3 w-3 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
        </div>
      )}
    </div>
  );
};
