import { EventStatus } from "../../../domain/entities/enums";

export interface EventsStatsDto {
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

export interface EventsStatsFilterDto {
    range?: {
        from: string; // ISO date
        to: string;   // ISO date
    };

    status?: EventStatus[];

    categories?: string[];  // filter by event categories
    organizerIds?: string[]; // filter by event owners/managers

    location?: string; // will add city/province

    /** Optional: exclude events with no activity */
    excludeEmpty?: boolean;
}