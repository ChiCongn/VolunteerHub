import { z } from "zod";
import { PostIdSchema, UserIdSchema } from "../param/id.schema";

export const CreateCommentSchema = z.object({
    postId: PostIdSchema,
    content: z
        .string()
        .trim()
        .min(1, "Comment content is required")
        .max(1000, "Comment cannot exceed 1000 characters"),
});

export type CreateCommentRequest = z.infer<typeof CreateCommentSchema>;
