import { z } from "zod";
import { PostIdSchema } from "../param/id.schema";

export const CreateCommentSchema = {
    params: z.object({
        postId: PostIdSchema,
    }),
    body: z.object({
        content: z
            .string()
            .trim()
            .min(1, "Comment content is required")
            .max(1000, "Comment cannot exceed 1000 characters"),
    }),
};

export type CreateCommentRequest = z.infer<typeof CreateCommentSchema>;
