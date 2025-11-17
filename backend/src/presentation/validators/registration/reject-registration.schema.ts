import { z } from "zod";

export const RejectRegistrationSchema = z.object({
    reason: z.string().min(3, "Reject reason must have at least 3 characters"),
});

export type RejectRegistrationRequest = z.infer<typeof RejectRegistrationSchema>;
