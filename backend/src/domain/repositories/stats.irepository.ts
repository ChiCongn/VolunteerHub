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

import {
    ManagerEventStatusOverviewDto,
    ManagerMonthlyCompletedStatsDto,
    ManagerTopParticipantsEventDto,
} from "../../application/dtos/stats";

export interface IStatsRepository {
    /** Global dashboard numbers */
    getOverviewStats(): Promise<OverviewStatsDto>;

    /** Aggregated numbers for all events */
    getEventsStats(filters: EventsStatsFilterDto): Promise<EventsStatsDto>;

    /** Detailed stats for a single event */
    getEventStats(eventId: string, currentPeriodDays: number, previousPeriodDays: number): Promise<EventStatsDto>;

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

     /** Manager-specific event stats */
    getManagerStatusOverview(userId: string): Promise<ManagerEventStatusOverviewDto[]>;
    getManagerMonthlyCompleted(
        userId: string,
        year: number
    ): Promise<ManagerMonthlyCompletedStatsDto[]>;
    getManagerTopParticipants(
        userId: string,
        limit: number
    ): Promise<ManagerTopParticipantsEventDto[]>;
}