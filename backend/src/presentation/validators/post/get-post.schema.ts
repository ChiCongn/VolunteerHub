import { z } from "zod";
import { EventIdSchema, PostIdSchema } from "../param/id.schema";

export const GetPostSchema = {
    params: z.object({
        eventId: EventIdSchema,
        postId: PostIdSchema
    }),
};
