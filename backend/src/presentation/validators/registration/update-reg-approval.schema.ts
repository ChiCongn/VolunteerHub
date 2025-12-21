import { z } from "zod";
import { RegistrationIdSchema } from "../param/id.schema";

export const UpdateRegistrationApprovalSchema = {
    params: z.object({
        registrationId: RegistrationIdSchema,
    }),
    body: z.object({
        approved: z.boolean(),
        reason: z.string().optional(),
    }),
};
