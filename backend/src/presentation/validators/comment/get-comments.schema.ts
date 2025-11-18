import { z } from "zod";
import { PostIdSchema } from "../param/id.schema";

export const GetCommentsSchema = {
    params: z.object({
        postId: PostIdSchema,
    }),
};
