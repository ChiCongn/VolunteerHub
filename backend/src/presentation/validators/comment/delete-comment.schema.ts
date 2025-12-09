import { z } from "zod";
import { CommentIdSchema, PostIdSchema } from "../param/id.schema";

export const DeleteCommentSchema = {
    params: z.object({
        postId: PostIdSchema,
        commentId: CommentIdSchema,
    }),
};