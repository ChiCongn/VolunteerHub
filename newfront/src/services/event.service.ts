import apiClient from "@/lib/api-client";
import type { Event } from "@/types";

export const eventService = {
    // GET /api/events/:eventId
    getEventById: async (eventId: string) => {
        const response = await apiClient.get(`/events/${eventId}`);
        return response.data;
    },
};
