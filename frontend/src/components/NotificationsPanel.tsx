import { NotificationCard } from './NotificationCard';
import type { Notification } from '../lib/mockData';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface NotificationsPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onNotificationClick: (notificationId: string) => void;
  onMarkAllRead: () => void;
}

export function NotificationsPanel({
  notifications,
  onClose,
  onNotificationClick,
  onMarkAllRead,
}: NotificationsPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 md:relative md:inset-auto">
      <div
        className="fixed inset-0 bg-black/50 md:hidden"
        onClick={onClose}
      />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border md:relative md:h-auto md:max-h-[600px] md:rounded-lg md:shadow-lg z-50">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2>Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllRead}
                className="text-[#43A047]"
              >
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-80px)] md:h-[500px]">
          <div className="p-4 space-y-2">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onClick={() => onNotificationClick(notification.id)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No notifications yet</p>
                <p className="text-sm mt-2">We'll notify you when something happens</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
