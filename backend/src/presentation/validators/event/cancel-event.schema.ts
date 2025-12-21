import { z } from "zod";
import { EventIdSchema } from "../param/id.schema";

export const CancelEventSchema = {
    params: z.object({
        eventId: EventIdSchema,
    }),
};
