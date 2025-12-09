import { z } from "zod";
import { EventIdSchema } from "../param/id.schema";

export const GetEventStatsSchema = {
    params: z.object({
        eventId: EventIdSchema,
    }),

    query: z.object({
        currentPeriodDays: z.number().optional(),
        previousPeriodDays: z.number().optional(),
    }),
};
