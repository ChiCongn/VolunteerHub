import { z } from "zod";
import { EventIdSchema } from "../param/id.schema";

export const GetEventStatsSchema = {
    params: z.object({
        eventId: EventIdSchema,
    }),
};
