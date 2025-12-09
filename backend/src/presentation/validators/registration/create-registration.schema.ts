import { z } from "zod";
import { EventIdSchema } from "../param/id.schema";

export const CreateRegistrationSchema = {
    params: z.object({
        eventId: EventIdSchema,
    }),
};

export type CreateRegistrationRequest = z.infer<typeof CreateRegistrationSchema>;
