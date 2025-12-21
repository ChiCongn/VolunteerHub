import { z } from "zod";
import { RegistrationIdSchema } from "../param/id.schema";

export const WithdrawRegistrationSchema = {
    params: z.object({
        registrationId: RegistrationIdSchema,
    }),
};
