import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { eventController } from "../controllers/event.controller";
import { CreateEventSchema } from "../validators/event/create-event.schema";
import { UpdateEventSchema } from "../validators/event/update-event.schema";
import { GetEventSchema } from "../validators/event/get-event.schema";
import { CancelEventSchema } from "../validators/event/cancel-event.schema";

export const eventRouter = Router();

// Search events - validation happens in controller
eventRouter.get("/", eventController.searchEvents);

eventRouter.get("/:eventId", validate(GetEventSchema), eventController.fetchPublicEventView);

eventRouter.post("/", authenticate, validate(CreateEventSchema), eventController.createEvent);

eventRouter.patch(
    "/:eventId",
    authenticate,
    validate(UpdateEventSchema),
    eventController.updateEvent
);

eventRouter.get("/:eventId", authenticate, validate(GetEventSchema), eventController.getEventById);

eventRouter.post("/:eventId", authenticate, validate(GetEventSchema), eventController.deleteEvent);

eventRouter.post(
    "/:eventId/cancel",
    authenticate,
    validate(CancelEventSchema),
    eventController.cancelEvent
);

eventRouter.get(
    "/:eventId/participants",
    authenticate,
    validate(GetEventSchema),
    eventController.getParticipantsByEventId
);

eventRouter.get(
    "/:eventId/registered-users",
    authenticate,
    validate(GetEventSchema),
    eventController.getRegisteredUsersByEventId
);

eventRouter.get(
    "/:eventId/managers",
    authenticate,
    validate(GetEventSchema),
    eventController.getEventManagersByEventId
);

eventRouter.get("/admin/pending", authenticate, eventController.listEvents);

eventRouter.patch("/:eventId/approve", eventController.approveEvent);

eventRouter.patch("/:eventId/reject", eventController.rejectEvent);

eventRouter.patch("/:eventId/complete", authenticate, eventController.completeEvent);
