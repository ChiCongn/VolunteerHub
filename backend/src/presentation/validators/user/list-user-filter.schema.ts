import { z } from "zod";
import { UserRole, UserStatus } from "../../../domain/entities/enums";

export const ListUserFilterSchema = {
    query: z.object({
        role: z.nativeEnum(UserRole, { message: "Invalid role" }).optional(),
        status: z.nativeEnum(UserStatus, { message: "Invalid status" }).optional(),
        search: z.string().min(1, { message: "Search query must not be empty" }).optional(),
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
    }),
};

export type ListUserFilter = z.infer<typeof ListUserFilterSchema.query>;
