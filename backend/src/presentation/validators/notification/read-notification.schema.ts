import { z } from "zod";
import { NotificationIdsSchema } from "../param/id.schema";

export const ReadNotificationSchema = {
    params: z.object({
        notificationId: NotificationIdsSchema,
    }),
};