import { IStatsRepository } from "../../domain/repositories/stats.irepository";
import { statsRepo } from "../../infrastructure/repositories";
import logger from "../../logger";
import { EventsStatsFilterDto } from "../dtos/stats";

export class StatsService {
    constructor(private readonly statsRepo: IStatsRepository) {}

    async getOverviewStats() {
        logger.debug({ action: "getOverviewStats" }, "[StatsService] Fetching overview stars");
        return this.statsRepo.getOverviewStats();
    }

    /** Aggregated numbers for all events */
    async getEventsStats(filters: EventsStatsFilterDto) {
        logger.debug(
            { filters, action: "getEventsStats" },
            "[StatsService] Fetching all events stats"
        );
        return this.statsRepo.getEventsStats(filters);
    }

    async getEventStats(
        eventId: string,
        currentPeriodDays: number = 7, // Default: last 7 days
        previousPeriodDays: number = 7 // Default: the 7 days before the current period
    ) {
        logger.debug({ action: "getEventStats", eventId }, "[StatsService] Fetching event stats");
        return this.statsRepo.getEventStats(eventId, currentPeriodDays, previousPeriodDays);
    }

    /** Top-N trending events ranked by participant growth rate over the last `day` days */
    async getTrendingEvents(days: number = 7, limit: number = 10) {
        logger.debug(
            { action: "getTrendingEvents", days, limit },
            "[StatsService] Fetching trending events"
        );
        return this.statsRepo.getTrendingEvents(days, limit);
    }

    /** Volunteer / user aggregates */
    async getVolunteerStats() {
        logger.debug({ action: "getVolunteerStats" }, "[StatsService] Fetching volunteers stats");
        return this.statsRepo.getVolunteerStats();
    }

    async getEventManagersStats() {
        logger.debug(
            { action: "getEventManagersStats" },
            "[StatsService] Fetching event managers stats"
        );
        return this.statsRepo.getEventManagersStats();
    }
}

export const statsService = new StatsService(statsRepo);
