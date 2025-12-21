import { z } from "zod";
import { UserIdSchema } from "../param/id.schema";

export const LockUserSchema = {
    params: z.object({
        userId: UserIdSchema,
    }),
    body: z.object({
        locked: z.boolean(),
        reason: z.string().optional(),
    }),
};
