import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { eventController } from "../controllers/event.controller";
import { CreateEventSchema } from "../validators/event/create-event.schema";
import { UpdateEventSchema } from "../validators/event/update-event.schema";
import { GetEventSchema } from "../validators/event/get-event.schema";
import { CancelEventSchema } from "../validators/event/cancel-event.schema";
import { postController } from "../controllers/posts.controller";
import { registrationController } from "../controllers/registration.controller";
import { CreateRegistrationSchema } from "../validators/registration/create-registration.schema";
import { RegistrationFilterSchema } from "../validators/registration/filter-registration.schema";
import { uploadLocal } from "../../infrastructure/config/cloudinary.config";
import { authorize } from "../../middlewares/authorize.middleware";
import { EventPolicy } from "../../application/policies/event.policy";
import { CreatePostSchema } from "../validators/post/create-post.schema";
import { PostPolicy } from "../../application/policies/post.policy";

export const eventRouter = Router();

// Public routes
eventRouter.get("/", eventController.searchEvents);
eventRouter.get("/:eventId", validate(GetEventSchema), eventController.fetchPublicEventView);

// AUTHENTICATED ROUTES (Volunteers/All)
eventRouter.post(
    "/:eventId/register",
    authenticate,
    validate(RegistrationFilterSchema),
    authorize(EventPolicy.register),
    registrationController.register
);

eventRouter.post(
    "/:eventId/posts",
    authenticate,
    uploadLocal("posts").single("image"),
    validate(CreatePostSchema),
    authorize(PostPolicy.participant, (req) => [req.params.eventId]),
    postController.createPost
);

eventRouter.get(
    "/:eventId/auth-info",
    authenticate,     
    eventController.getEventAuthInfo
);

eventRouter.get("/:eventId/posts", authenticate, postController.getPostsByEvent);
eventRouter.get("/:eventId/search", authenticate, postController.searchPosts);

// MANAGER ROUTES (Ownership/Management required)
eventRouter.post(
    "/",
    authenticate,
    uploadLocal("events").single("image"),
    validate(CreateEventSchema),
    authorize(EventPolicy.create),
    eventController.createEvent
);

eventRouter.patch(
    "/:eventId",
    authenticate,
    validate(UpdateEventSchema),
    authorize(EventPolicy.manageEvent, (req) => [req.params.eventId]),
    eventController.updateEvent
);

eventRouter.get(
    "/:eventId",
    authenticate,
    validate(GetEventSchema),
    authorize(EventPolicy.viewPublic),
    eventController.getEventById
);

eventRouter.delete(
    "/:eventId",
    authenticate,
    validate(GetEventSchema),
    authorize(EventPolicy.manageEvent, (req) => [req.params.eventId]),
    eventController.deleteEvent
);

eventRouter.patch(
    "/:eventId/cancel",
    authenticate,
    validate(CancelEventSchema),
    authorize(EventPolicy.manageEvent, (req) => [req.params.eventId]),
    eventController.cancelEvent
);

eventRouter.patch(
    "/:eventId/complete",
    authenticate,
    authorize(EventPolicy.manageEvent, (req) => [req.params.eventId]),
    eventController.completeEvent
);

// Participant/Management Listing
eventRouter.get(
    "/:eventId/registrations",
    authenticate,
    validate(CreateRegistrationSchema),
    authorize(EventPolicy.manageEvent, (req) => [req.params.eventId]),
    registrationController.listRegistration
);

eventRouter.get(
    "/:eventId/participants",
    authenticate,
    validate(GetEventSchema),
    authorize(EventPolicy.manageEvent, (req) => [req.params.eventId]),
    eventController.getParticipantsByEventId
);

eventRouter.get(
    "/:eventId/registered-users",
    authenticate,
    validate(GetEventSchema),
    authorize(EventPolicy.manageEvent, (req) => [req.params.eventId]),
    eventController.getRegisteredUsersByEventId
);

eventRouter.get(
    "/:eventId/managers",
    authenticate,
    validate(GetEventSchema),
    authorize(EventPolicy.manageEvent, (req) => [req.params.eventId]),
    eventController.getEventManagersByEventId
);

// ADMIN ROUTES (Moderation)
eventRouter.get(
    "/admin/pending",
    authenticate,
    authorize(EventPolicy.review),
    eventController.listEvents
);

eventRouter.patch(
    "/:eventId/approve",
    authenticate,
    authorize(EventPolicy.review),
    eventController.approveEvent
);

eventRouter.patch(
    "/:eventId/reject",
    authenticate,
    authorize(EventPolicy.review),
    eventController.rejectEvent
);
