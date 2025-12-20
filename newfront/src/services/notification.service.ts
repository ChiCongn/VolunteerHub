// newfront/src/services/notification.service.ts
import apiClient from "@/lib/api-client";

export interface ApiNotificationItem {
    _id: string;
    _userId: string;
    _type: "event" | "user" | "system";
    _message: string;
    _redirectUrl: string;
    _createdAt: string;
    _isRead?: boolean; 
}

interface NotificationApiResponse {
    items: ApiNotificationItem[];
    total: number;
    page: number;
    limit: number;
}

export const notificationService = {
    getByUserId: async (userId: string) => {
        const response = await apiClient.get<NotificationApiResponse>(
            `/notifications/users/${userId}`
        );
        return response.data;
    },

    markAsRead: async (notificationId: string) => {
        return await apiClient.patch(`/notifications/${notificationId}/read`);
    },

    markAllAsRead: async (userId: string) => {
        return await apiClient.patch(`/notifications/users/${userId}/read-all`);
    },
};
