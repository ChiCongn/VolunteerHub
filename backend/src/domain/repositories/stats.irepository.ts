// backend/src/domain/repositories/stats.repository.ts
import {
    OverviewStatsDto,
    EventsStatsDto,
    EventStatsDto,
    TrendingEventDto,
    VolunteerStatsDto,
    TimeSeriesDto,
} from "../../application/dtos/stats";

export interface StatsRepository {
    /** Global dashboard numbers */
    getOverviewStats(): Promise<OverviewStatsDto>;

    /** Aggregated numbers for all events */
    getEventsStats(): Promise<EventsStatsDto>;

    /** Detailed stats for a single event (current + previous period) */
    getEventStats(eventId: string, daysCurrent: number, daysPrevious: number): Promise<EventStatsDto>;

    /** Top-N trending events by participant growth */
    getTrendingEvents(
        days: number,
        limit?: number
    ): Promise<TrendingEventDto[]>;

    /** Volunteer / user aggregates */
    getVolunteerStats(): Promise<VolunteerStatsDto>;

    /** Time-series for a metric (users, registrations, posts…) */
    getTimeSeries(
        metric: "users" | "registrations" | "posts",
        days: number
    ): Promise<TimeSeriesDto>;
}