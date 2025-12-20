import { z } from "zod";

// Schema for Monthly Completed (validates year)
export const getManagerMonthlyCompletedSchema = {
    query: z.object({
        year: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : undefined))
            .pipe(z.number().min(2000).max(2100).optional()),
    }),
};

// Schema for Top Participants (validates limit)
export const getManagerTopParticipantsSchema = {
    query: z.object({
        limit: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : undefined))
            .pipe(z.number().min(1).max(100).optional()),
    }),
};
