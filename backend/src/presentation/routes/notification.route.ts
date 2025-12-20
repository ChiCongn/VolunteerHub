import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { notificationController } from "../controllers/notification.controller";
import { CreateNotificationSchema } from "../validators/notification/create-notification.schema";
import { NotificationFilterSchema } from "../validators/notification/filter-notification.schema";
import { ReadNotificationSchema } from "../validators/notification/read-notification.schema";
import { notificationService } from "../../application/services/notification.service";

export const notificationRouter = Router();

notificationRouter.post(
    "/",
    authenticate,
    validate(CreateNotificationSchema),
    notificationController.createNotification
);

notificationRouter.post(
    "/",
    authenticate,
    validate(CreateNotificationSchema),
    notificationController.createNotification
);

notificationRouter.post(
    "/subscribe",
    authenticate,
    notificationController.subscribe
);

notificationRouter.post("/test-push", authenticate, async (req, res) => {
    const userId = req.user.id;
    
    await notificationService.sendNotification(
        userId,
        "Test Thông Báo",
        "Nó đã hoạt động rồi nè! 🎉",
        "http://localhost:3000/profile"
    );

    res.json({ message: "Đã gửi lệnh push!" });
});

notificationRouter.get(
    "/:notificationId",
    authenticate,
    validate(ReadNotificationSchema),
    notificationController.getNotificationById
);

notificationRouter.get(
    "/users/:userId",
    //authenticate,
    validate(NotificationFilterSchema),
    notificationController.getNotificationsByUserId
);

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

