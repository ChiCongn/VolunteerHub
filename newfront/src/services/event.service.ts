import apiClient from "@/lib/api-client";
import type { Event } from "@/types/event.type";

export interface PaginatedEvents {
    items: Event[];
    total: number;
    page: number;
    limit: number;
}

export const eventService = {
    // GET /api/events/:eventId
    getEventById: async (eventId: string) => {
        const response = await apiClient.get(`/events/${eventId}`);
        return response.data;
    },

    getEvents: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        category?: string;
    }): Promise<PaginatedEvents> => {
        const response = await apiClient.get(`/events`, { params });
        return response.data;
    },
};
