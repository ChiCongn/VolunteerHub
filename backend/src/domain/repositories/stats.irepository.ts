import {
    OverviewStatsDto,
    EventsStatsDto,
    EventsStatsFilterDto,
    EventStatsDto,
    TrendingEventDto,
    VolunteerStatsDto,
    TimeSeriesDto,
    EventManagerStatsDto,
} from "../../application/dtos/stats";

export interface IStatsRepository {
    /** Global dashboard numbers */
    getOverviewStats(): Promise<OverviewStatsDto>;

    /** Aggregated numbers for all events */
    getEventsStats(filters: EventsStatsFilterDto): Promise<EventsStatsDto>;

    /** Detailed stats for a single event (current + previous period) */
    getEventStats(eventId: string, daysCurrent: number, daysPrevious: number): Promise<EventStatsDto>;

    /** Top-N trending events by participant growth */
    getTrendingEvents(
        days: number,
        limit?: number
    ): Promise<TrendingEventDto[]>;

    /** Volunteer / user aggregates */
    getVolunteerStats(): Promise<VolunteerStatsDto>;

    getEventManagersStats(): Promise<EventManagerStatsDto>;

    /** Time-series for a metric (users, registrations, posts…) */
    getTimeSeries(
        metric: "users" | "registrations" | "posts",
        days: number
    ): Promise<TimeSeriesDto>;
}