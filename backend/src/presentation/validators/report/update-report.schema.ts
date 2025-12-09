import { z } from "zod";

export const UpdateReportSchema = z
    .object({
        reason: z
            .string()
            .min(10, "Reason must be at least 10 characters")
            .max(1000, "Reason cannot exceed 1000 characters")
            .trim()
            .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });

export type UpdateReportRequest = z.infer<typeof UpdateReportSchema>;
