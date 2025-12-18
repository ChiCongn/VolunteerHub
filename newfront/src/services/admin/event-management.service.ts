import apiClient from "@/lib/api-client";
import type { EventCategory, EventStatus } from "@/types/enum";
import type { Event } from "@/types/event.type";
import type { ListResult } from "@/types/paging";

export const eventManagementService = {
    async listEvents(filters: EventFilter): Promise<ListResult<Event>> {
        const { data } = await apiClient.get<ListResult<Event>>("/events", {
            params: {
                // primitive filters
                status: filters.status,
                name: filters.name,
                location: filters.location,
                ownerId: filters.ownerId,

                // array → backend should handle as repeated params or array
                categories: filters.categories,

                // date range (flatten for query)
                from: filters.dateRange?.[0]?.toISOString(),
                to: filters.dateRange?.[1]?.toISOString(),
            },
        });

        return data;
    },

    async getEventsStats(filters: EventsStatsFilter): Promise<EventsStats> {
        console.log("filters: ", filters);
        const { data } = await apiClient.get<EventsStats>("/stats/events", {
            params: {
                // time range
                from: filters.range?.from,
                to: filters.range?.to,

                // array filters
                status: filters.status,
                categories: filters.categories,
                organizerIds: filters.organizerIds,

                // others
                location: filters.location,
            },
        });
        return data;
    },

    async approveEvent(eventId: string) {
        const { data } = await apiClient.patch<{ message: string }>(
            `/events/${eventId}/approve`
        );
        return data;
    },

    async rejectEvent(eventId: string) {
        const { data } = await apiClient.patch<{ message: string }>(
            `/events/${eventId}/reject`
        );
        return data;
    },
};

export interface EventFilter {
    status?: EventStatus;
    name?: string;
    location?: string;
    categories?: EventCategory[];
    dateRange?: [Date, Date];
    ownerId?: string;
}

export interface EventsStats {
    totalEvents: number;

    participants: {
        total: number;
        average: number;
        median: number;
    };

    totalPosts: number;
    avgPostsPerEvent: number;

    activeEvents: number;
    completedEvents: number;
}

export interface EventsStatsFilter {
    range?: {
        from: string; // ISO date
        to: string; // ISO date
    };

    status?: EventStatus[];

    categories?: string[]; // filter by event categories
    organizerIds?: string[]; // filter by event owners/managers

    location?: string; // will add city/province

    /** Optional: exclude events with no activity */
    excludeEmpty?: boolean;
}
