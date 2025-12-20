import apiClient from "@/lib/api-client";
import { type NotificationItem } from "@/components/cards/NotificationCard";

export const notificationService = {
    // Endpoint backend: /api/v1/notifications/users/:userId
    getByUserId: async (userId: string) => {
        const response = await apiClient.get(`/notifications/users/${userId}`);
        return response.data; 
    },

    // Endpoint backend: /api/v1/notifications/:notificationId/read
    markAsRead: async (notificationId: string) => {
        await apiClient.patch(`/notifications/${notificationId}/read`);
    },

    markAllAsRead: async (userId: string) => {
        await apiClient.patch(`/notifications/users/${userId}/read-all`);
    },
};
