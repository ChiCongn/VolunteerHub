import { z } from "zod";
import { NotificationType } from "../../../domain/entities/enums";
import { UserIdSchema } from "../param/id.schema";

export const CreateNotificationSchema = {
    body: z.object({
        userId: UserIdSchema,
        type: z.nativeEnum(NotificationType),
        message: z
            .string()
            .trim()
            .min(1, "Message is required")
            .max(500, "Message cannot exceed 500 characters"),
        redirectUrl: z.union([z.string().url("Invalid redirect URL"), z.literal("")]).optional(),
    }),
};

export type CreateNotificationRequest = z.infer<typeof CreateNotificationSchema>;
