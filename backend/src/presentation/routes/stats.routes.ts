import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { statsController } from "../controllers/stats.controller";
import { validate } from "../../middlewares/validation.middleware";
import { EventStatsFilterSchema } from "../validators/stats/event-stats.schema";
import { GetEventSchema } from "../validators/event/get-event.schema";

export const statsRouter = Router();

statsRouter.get("/", statsController.getOverviewStats);
statsRouter.get("/events", validate(EventStatsFilterSchema), statsController.getEventsStats);
statsRouter.get("/events/:eventId", validate(GetEventSchema), statsController.getEventStats);
statsRouter.get("/trending", statsController.getTrendingEvents);
statsRouter.get("/volunteers", statsController.getVolunteerStats);
statsRouter.get("/managers", statsController.getEventManagersStats);
