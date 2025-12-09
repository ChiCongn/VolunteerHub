import { z } from "zod";
import { CommentIdSchema, PostIdSchema } from "../param/id.schema";

export const UpdateCommentSchema = {
    params: z.object({
        postId: PostIdSchema,
        commentId: CommentIdSchema,
    }),
    body: z.object({
        content: z
            .string()
            .trim()
            .min(1, "Comment content is required")
            .max(1000, "Comment cannot exceed 1000 characters"),
    }),
};

export type UpdateCommentRequest = z.infer<typeof UpdateCommentSchema>;
