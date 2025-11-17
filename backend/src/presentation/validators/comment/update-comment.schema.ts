import { z } from "zod";

export const UpdateCommentSchema = z.object({
    content: z
        .string()
        .trim()
        .min(1, "Comment content is required")
        .max(1000, "Comment cannot exceed 1000 characters"),
});

export type UpdateCommentRequest = z.infer<typeof UpdateCommentSchema>;
