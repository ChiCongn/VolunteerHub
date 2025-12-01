import { z } from "zod";
import { UserRole, UserStatus } from "../../../domain/entities/enums";

export const ListUserFilterSchema = {
    query: z.object({
        role: z.nativeEnum(UserRole, { message: "Invalid role" }).optional(),
        status: z.nativeEnum(UserStatus, { message: "Invalid status" }).optional(),
        search: z.string().min(1, { message: "Search query must not be empty" }).optional(),
    }),
};

export type ListUserFilter = z.infer<typeof ListUserFilterSchema>;
