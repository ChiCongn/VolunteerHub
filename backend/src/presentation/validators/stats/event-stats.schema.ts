import { z } from "zod";
import { EventCategory, EventStatus } from "../../../domain/entities/enums";

export const EventStatsFilterSchema = {
    body: z.object({
        range: z
            .object({
                from: z.coerce.date().optional(),
                to: z.coerce.date().optional(),
            })
            .optional()
            .superRefine((val, ctx) => {
                if (!val) return;

                const { from, to } = val;

                if (from && to && from > to) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["to"],
                        message: "`to` must be after `from` in range filter",
                    });
                }
            }),

        status: z.array(z.nativeEnum(EventStatus)).optional(),

        categories: z.array(z.nativeEnum(EventCategory)).optional(),

        organizerIds: z.array(z.string().uuid("Invalid organizer ID")).optional(),

        location: z.string().min(1).optional(),

        excludeEmpty: z.boolean().optional(),
    }),
};
