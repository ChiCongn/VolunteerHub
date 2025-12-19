import { z } from "zod";
import { RegistrationStatus } from "../../../domain/entities/enums";
import { EventIdSchema } from "../param/id.schema";

export const RegistrationFilterSchema = {
    params: z.object({
        eventId: EventIdSchema,
    }),
    query: z
        .object({
            username: z
                .string()
                .min(1, "At least one character in username is required")
                .optional(),
            status: z.nativeEnum(RegistrationStatus).optional(),
            page: z
                .string()
                .regex(/^\d+$/, { message: "Page must be a number" })
                .transform(Number)
                .default(1) // maigc value, maybe replace by env
                .optional(),
            limit: z
                .string()
                .regex(/^\d+$/, { message: "Limit must be a number" })
                .transform(Number)
                .default(20) // magic value, maybe replace by env (impose hard limit 100 in backend)
                .optional(),
            sortBy: z
                .enum(["username", "email", "createdAt"], {
                    message: "Invalid sorting field",
                })
                .default("createdAt")
                .optional(),

            order: z
                .enum(["asc", "desc"], { message: "Invalid sorting order" })
                .default("desc")
                .optional(),
        })
        .strict(),
};

export type RegistrationFilter = z.infer<typeof RegistrationFilterSchema>;
