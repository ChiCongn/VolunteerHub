import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { statsController } from "../controllers/stats.controller";
import { validate } from "../../middlewares/validation.middleware";
import { EventStatsFilterSchema } from "../validators/stats/event-stats.schema";
import { GetEventSchema } from "../validators/event/get-event.schema";
import { authorize } from "../../middlewares/authorize.middleware";
import { StatsPolicy } from "../../application/policies/stats.policy";

export const statsRouter = Router();

statsRouter.get(
    "/",
    authenticate,
    authorize(StatsPolicy.overview),
    statsController.getOverviewStats
);
statsRouter.get(
    "/events",
    // authenticate,
    validate(EventStatsFilterSchema),
    // authorize(StatsPolicy.allEventsStats),
    statsController.getEventsStats
);
statsRouter.get(
    "/events/:eventId",
    authenticate,
    validate(GetEventSchema),
    authorize(StatsPolicy.eventStats),
    statsController.getEventStats
);
statsRouter.get(
    "/trending",
    authenticate,
    authorize(StatsPolicy.trendingEvents),
    statsController.getTrendingEvents
);
statsRouter.get(
    "/volunteers",
    // authenticate,
    // authorize(StatsPolicy.volunteerStats),
    statsController.getVolunteerStats
);
statsRouter.get(
    "/managers",
    // authenticate,
    // authorize(StatsPolicy.eventManagersStats),
    statsController.getEventManagersStats
);
