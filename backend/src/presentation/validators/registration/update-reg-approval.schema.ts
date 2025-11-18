import { z } from "zod";
import { EventIdSchema, RegistrationIdSchema } from "../param/id.schema";

export const UpdateRegistrationApprovalSchema = {
    params: z.object({
        eventId: EventIdSchema,
        regId: RegistrationIdSchema,
    }),
    body: z.object({
        approved: z.boolean(),
        reason: z.string().optional(),
    }),
};
