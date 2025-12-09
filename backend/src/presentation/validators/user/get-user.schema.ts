import { z } from "zod";
import { UserIdSchema } from "../param/id.schema";

export const GetUserSchema = {
    params: z.object({
        userId: UserIdSchema,
    }),
};
