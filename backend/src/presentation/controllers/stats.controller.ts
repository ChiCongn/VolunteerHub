import { Request, Response, RequestHandler } from "express";
import { statsService, StatsService } from "../../application/services/stats.service";
import logger from "../../logger";
import { EventNotFoundError } from "../../domain/errors/event.error";
import { EventsStatsFilter } from "../validators/stats/event-stats.schema";
import { EventsStatsFilterDto } from "../../application/dtos/stats";

export class StatsController {
    constructor(private readonly statsService: StatsService) {}

    /**
     * Global platform overview (total events, users, posts, etc.)
     */
    getOverviewStats = async (req: Request, res: Response) => {
        logger.info({ action: "getOverviewStats" }, "[StatsController] Fetching overview stars");

        try {
            const result = await this.statsService.getOverviewStats();
            return res.status(200).json(result);
        } catch (err) {
            console.log(err);
            logger.error({ error: err }, "[StatsController] Failed to fetch overview stars");
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /** Aggregated stats for multiple events with optional filters */
    getEventsStats: RequestHandler<any, any, any, EventsStatsFilter> = async (req, res) => {
        logger.info({ action: "getEventsStats" }, "[StatsController] Fetching all events stats");
        try {
            const filters: EventsStatsFilterDto = {
                ...req.query,
                range: req.query.from
                    ? {
                          from: req.query.from?.toISOString() || "",
                          to: req.query.to?.toISOString() || "",
                      }
                    : undefined,
            };

            const result = await this.statsService.getEventsStats(filters);
            return res.status(200).json(result);
        } catch (err) {
            logger.error(
                { errror: err, action: "getEventStats" },
                "[StatsController] Failed to fetch all events stats"
            );

            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Detailed stats for a single event with optional time period comparison
     * Query params: ?currentPeriodDays=7&previousPeriodDays=7
     */
    getEventStats = async (req: Request, res: Response) => {
        const { eventId } = req.params;
        logger.info({ action: "getEventStats", eventId }, "[StatsController] Fetching event stats");

        try {
            const currentPeriodDays = req.query.currentPeriodDays
                ? Number(req.query.currentPeriodDays)
                : undefined;

            const previousPeriodDays = req.query.previousPeriodDays
                ? Number(req.query.previousPeriodDays)
                : undefined;

            const result = await this.statsService.getEventStats(
                eventId,
                currentPeriodDays,
                previousPeriodDays
            );

            return res.status(200).json(result);
        } catch (err) {
            if (err instanceof EventNotFoundError) {
                logger.error(
                    { action: "getEventStats", eventId },
                    "[StatsController] Event not found"
                );
                return res.status(404).json({ message: "Event not found" });
            }

            logger.error(
                { error: err, action: "getEventStats", eventId },
                "[StatsController] Failed to fetch event stats"
            );
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * GET /stats/trending?days=7&limit=10
     * Top-N events ranked by participant growth rate in the last N days
     */
    getTrendingEvents = async (req: Request, res: Response) => {
        const days = req.query.days ? Number(req.query.days) : 7;
        const limit = req.query.limit ? Number(req.query.limit) : 10;

        logger.debug({ action: "getTrendingEvents" }, "[StatsController] Fetching trending events");
        try {
            const result = await this.statsService.getTrendingEvents(days, limit);
            return res.status(200).json(result);
        } catch (err) {
            logger.error(
                { error: err instanceof Error ? err.message : err },
                "[StatsController] Failed to fetch trending events"
            );
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * GET /stats/volunteers
     * Aggregated statistics about volunteers/users
     */
    getVolunteerStats = async (req: Request, res: Response) => {
        logger.debug(
            { action: "getVolunteerStats" },
            "[StatsController] Fetching volunteers stats"
        );
        try {
            const result = await this.statsService.getVolunteerStats();
            return res.status(200).json(result);
        } catch (err) {
            logger.error(
                { error: err instanceof Error ? err.message : err },
                "[StatsController] Failed to fetch volunteer stats"
            );
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * GET /stats/event-managers
     * Statistics about event organizers/managers
     */
    getEventManagersStats = async (req: Request, res: Response) => {
        logger.debug(
            { action: "getEventManagersStats" },
            "[StatsController] Fetching event managers stats"
        );

        try {
            const result = await this.statsService.getEventManagersStats();
            return res.status(200).json(result);
        } catch (err) {
            logger.error(
                { error: err instanceof Error ? err.message : err },
                "[StatsController] Failed to fetch event managers stats"
            );
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * GET /api/v1/stats/manager/status-overview
     * Get counts of events grouped by status for the logged-in manager
     */
    getManagerStatusOverview = async (req: Request, res: Response) => {
        const managerId = req.user?.sub; // Assuming managerId comes from JWT payload

        logger.debug(
            { action: "getManagerStatusOverview", managerId },
            "[StatsController] Fetching status overview for manager"
        );

        try {
            const result = await this.statsService.getManagerEventStatusOverview(managerId);
            return res.status(200).json(result);
        } catch (err) {
            logger.error(
                { error: err instanceof Error ? err.message : err, managerId },
                "[StatsController] Failed to fetch manager status overview"
            );
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * GET /api/v1/stats/manager/monthly-completed?year=2025
     * Get number of completed events per month for a manager
     */
    getManagerMonthlyCompleted = async (req: Request, res: Response) => {
        const managerId = req.user?.sub;
        const { year } = req.query as any;

        logger.debug(
            { action: "getManagerMonthlyCompleted", managerId, year },
            "[StatsController] Fetching monthly completed events"
        );

        try {
            const result = await this.statsService.getManagerMonthlyCompleted(managerId, year);
            return res.status(200).json(result);
        } catch (err) {
            logger.error(
                { error: err instanceof Error ? err.message : err, managerId },
                "[StatsController] Failed to fetch monthly completed stats"
            );
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * GET /api/v1/stats/manager/top-participants?limit=5
     * Get top events by participant count managed by this user
     */
    getManagerTopParticipants = async (req: Request, res: Response) => {
        const managerId = req.user?.sub;
        const { limit } = req.query as any;

        logger.debug(
            { action: "getManagerTopParticipants", managerId, limit },
            "[StatsController] Fetching top participant events"
        );

        try {
            const result = await this.statsService.getManagerTopParticipants(managerId, limit);
            return res.status(200).json(result);
        } catch (err) {
            logger.error(
                { error: err instanceof Error ? err.message : err, managerId },
                "[StatsController] Failed to fetch top participant stats"
            );
            return res.status(500).json({ message: "Internal server error" });
        }
    };
}

// Singleton instance (recommended for dependency injection)
export const statsController = new StatsController(statsService);
