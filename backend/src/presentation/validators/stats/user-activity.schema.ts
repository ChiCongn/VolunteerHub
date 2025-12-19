import { z } from "zod";

/**
 * Validates query parameters for fetching the monthly login streak.
 */
export const GetLoginStreakSchema = {
    query: z.object({
        year: z.coerce
            .number()
            .int()
            .min(2000)
            .max(2100)
            .default(() => new Date().getFullYear()),
        month: z.coerce
            .number()
            .int()
            .min(1)
            .max(12)
            .default(() => new Date().getMonth() + 1),
    }),
};

/**
 * Validates query parameters for monthly event statistics.
 */
export const GetMonthlyStatsSchema = {
    query: z.object({
        year: z.coerce
            .number()
            .int()
            .min(2000)
            .max(2200)
            .default(() => new Date().getFullYear()),
    }),
};

/**
 * Validates the body for the online time heartbeat.
 */
export const UpdateOnlineTimeSchema = {
    body: z.object({
        seconds: z.coerce
            .number()
            .int()
            .positive("Online seconds must be a positive number")
            .max(86400, "Seconds cannot exceed one day"),
    }),
};
