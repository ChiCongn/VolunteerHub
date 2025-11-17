import { z } from "zod";
import { EventIdSchema, UserIdSchema } from "../param/id.schema";

export const CreatePostSchema = z.object({
    eventId: EventIdSchema,
    content: z
        .string()
        .min(1, "Content is required")
        .max(2000, "Content cannot exceed 2000 characters"),
    imageUrl: z.union([z.literal(""), z.string().url("Invalid image URL")]).optional(),
});

export type CreatePostRequest = z.infer<typeof CreatePostSchema>;
