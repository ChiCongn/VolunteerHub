import { z } from "zod";

export const LoginCredentialsSchema = {
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1, "password cannot be empty"),
    }),
};

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
