import { z } from "zod";
import { NotificationType } from "../../../domain/entities/enums";

export const NotificationFilterSchema = {
    query: z.object({
        read: z
            .enum(["true", "false"])
            .transform((val) => val === "true")
            .optional(),
        type: z.nativeEnum(NotificationType).optional(),
    }),
};

export type NotificationFilter = z.infer<typeof NotificationFilterSchema>;
