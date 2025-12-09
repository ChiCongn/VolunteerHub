import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { notificationController } from "../controllers/notification.controller";
import { CreateNotificationSchema } from "../validators/notification/create-notification.schema";
import { NotificationFilterSchema } from "../validators/notification/filter-notification.schema";
import { ReadNotificationSchema } from "../validators/notification/read-notification.schema";

export const notificationRouter = Router();

notificationRouter.post(
    "/",
    authenticate,
    validate(CreateNotificationSchema),
    notificationController.createNotification
);

notificationRouter.get(
    "/:notificationId",
    authenticate,
    validate(ReadNotificationSchema),
    notificationController.getNotificationById
);

notificationRouter.get(
    "/users/:userId",
    authenticate,
    validate(NotificationFilterSchema),
    notificationController.getNotificationsByUserId
);

notificationRouter.get(
    "/users/:userId/count",
    authenticate,
    notificationController.countNotificationsByUserId
)

notificationRouter.patch(
    "/:notificationId/read",
    authenticate,
    validate(ReadNotificationSchema),
    notificationController.maskAsRead
);

notificationRouter.patch(
    "/users/:userId/read-all",
    authenticate,
    notificationController.markAllAsRead
);
