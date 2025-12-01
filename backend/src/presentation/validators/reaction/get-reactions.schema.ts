import { z } from "zod";
import { PostIdSchema } from "../param/id.schema";

export const GetReactionSchema = {
    params: z.object({
        postId: PostIdSchema,
    }),
};
