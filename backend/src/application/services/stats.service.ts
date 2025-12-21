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

    /** Manager-specific event stats */
    async getManagerEventStatusOverview(managerId: string) {
        logger.debug(
            { action: "getManagerEventStatusOverview", managerId },
            "[StatsService] Fetching manager event status overview"
        );

        const rawData = await this.statsRepo.getManagerStatusOverview(managerId);

        const allStatuses = ["pending", "approved", "completed", "rejected"];

        // fill with 0 if missing in rawData
        const normalizedData = allStatuses.map((status) => {
            const found = rawData.find((item) => item.status === status);
            return {
                status: status,
                count: found ? Number(found.count) : 0,
            };
        });

        return normalizedData;
    }

    // Number of completed events per month in a given year
    async getManagerMonthlyCompleted(managerId: string, year?: number) {
        // Use the provided year or default to the current year
        const targetYear = year || new Date().getFullYear();

        const rawData = await this.statsRepo.getManagerMonthlyCompleted(managerId, targetYear);

        // Prepare an array of all 12 months to ensure missing months are filled with count = 0
        const allMonths = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        return allMonths.map((month) => {
            const found = rawData.find((d) => d.month === month);
            return {
                month,
                count: found ? Number(found.count) : 0,
            };
        });
    }

    async getManagerTopParticipants(managerId: string, limit?: number) {
        // Default to top 5 events if limit is not provided
        const finalLimit = limit || 5;

        logger.debug(
            { action: "getManagerTopParticipants", managerId, limit: finalLimit },
            "[StatsService] Fetching top participant events for manager"
        );

        return this.statsRepo.getManagerTopParticipants(managerId, finalLimit);
    }
}

export const statsService = new StatsService(statsRepo);
