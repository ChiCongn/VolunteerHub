import { z } from "zod";
import { NotificationIdsSchema } from "../param/id.schema";

export const DeleteNotificationSchema = {
    params: z.object({
        notificationId: NotificationIdsSchema,
    }),
};