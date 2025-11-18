import { z } from "zod";

export const UpdateUserSchema = {
    body: z.object({
        username: z
            .string()
            .min(3, { message: "Username must be at least 3 characters" })
            .optional(),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
            .optional(),

        avatarUrl: z.string().url({ message: "Invalid URL format" }).optional(),
    }),
};

export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;
