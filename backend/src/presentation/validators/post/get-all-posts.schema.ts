import { z } from "zod";
import { EventIdSchema } from "../param/id.schema";

export const GetPostsSchema = {
    params: z.object({
        eventId: EventIdSchema,
    }),
};
