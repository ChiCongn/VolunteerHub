import { z } from "zod";
import { EventIdSchema } from "../param/id.schema";

export const GetRegSchema = {
    params: z.object({
        eventId: EventIdSchema,
    }),
};