import { z } from "zod";
import { EventIdSchema, RegistrationIdSchema } from "../param/id.schema";

export const DeleteRegistrationSchema = {
    params: z.object({
        registrationId: RegistrationIdSchema,
    }),
};
