import { z } from "zod";

export const SearchUserSchema = {
    query: z.object({
        username: z.string().min(1, { message: "Display name must not be empty" }),
    }),
};
