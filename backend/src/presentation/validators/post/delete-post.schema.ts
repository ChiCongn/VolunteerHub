import { z } from "zod";
import { EventIdSchema, PostIdSchema } from "../param/id.schema";

export const DeletePostSchema = {
    params: z.object({
        eventId: EventIdSchema,
        postId: PostIdSchema,
    }),
};
