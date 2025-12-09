import { z } from "zod";
import { EventIdSchema, RegistrationIdSchema } from "../param/id.schema";

export const WithdrawRegistrationSchema = {
    params: z.object({
        eventId: EventIdSchema,
        regId: RegistrationIdSchema,
    }),
};
