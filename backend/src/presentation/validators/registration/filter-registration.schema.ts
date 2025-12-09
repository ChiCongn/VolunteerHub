import { z } from "zod";
import { RegistrationStatus } from "../../../domain/entities/enums";
import { EventIdSchema, UserIdSchema } from "../param/id.schema";

export const RegistrationFilterSchema = {
    query: z
        .object({
            eventId: EventIdSchema.optional(),
            userId: UserIdSchema.optional(),
            status: z.nativeEnum(RegistrationStatus).optional(),
        })
        .strict(),
};

export type RegistrationFilter = z.infer<typeof RegistrationFilterSchema>;
