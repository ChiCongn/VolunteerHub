import apiClient from "@/lib/api-client";
import type { EventCategory } from "@/types/enum";
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

    uploadEventImage(formData: FormData) {
        return apiClient
            .post<{ url: string }>("/events/upload-image", formData)
            .then((res) => res.data);
    },

    createEvent: async (data: CreateEvent) => {
        const response = await apiClient.post("/events", data);
        return response.data;
    },

    createEventWithImage: async (formData: FormData) => {
        const response = await apiClient.post("/events", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    updateEvent: async (eventId: string, data: Partial<CreateEvent>) => {
        const response = await apiClient.patch(`/events/${eventId}`, data);
        return response.data;
    },

    // soft delete
    deleteEvent: async (eventId: string) => {
        const response = await apiClient.patch(`/events/${eventId}/cancel`);
        return response.data;
    },

    completeEvent: async (eventId: string) => {
        const response = await apiClient.patch(`/events/${eventId}/complete`);
        return response.data;
    },
};

export interface CreateEvent {
    name: string;
    location: string;
    startTime: Date;
    endTime?: Date | null;
    description: string;
    imageUrl: string;
    capacity: number;
    categories: EventCategory[] | [];
}
