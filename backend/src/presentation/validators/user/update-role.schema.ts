import { z } from "zod";
import { UserIdSchema } from "../param/id.schema";
import { UserRole } from "../../../domain/entities/enums";

export const UpdateRoleSchema = {
    params: z.object({
        userId: UserIdSchema,
    }),
    body: z.object({
        role: z.nativeEnum(UserRole, { message: "Invalid role" }),
    }),
};