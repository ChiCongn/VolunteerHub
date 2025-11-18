import { z } from "zod";
import { EventIdSchema } from "../param/id.schema";

export const GetEventSchema = {
    params: z.object({
        eventId: EventIdSchema,
    }),
};