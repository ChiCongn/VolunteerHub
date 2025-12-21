import { z } from "zod";
import { EventCategory, EventStatus } from "../../../domain/entities/enums";

export const EventStatsFilterSchema = {
    query: z
        .object({
            from: z.coerce.date().optional(),
            to: z.coerce.date().optional(),
            status: z.array(z.nativeEnum(EventStatus)).optional(),
            categories: z.array(z.nativeEnum(EventCategory)).optional(),
            organizerIds: z.array(z.string().uuid("Invalid organizer ID")).optional(),
            location: z.string().min(1).optional(),
            excludeEmpty: z.boolean().optional(),
        })
        .superRefine((val, ctx) => {
            if (val.from && val.to && val.from > val.to) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["to"],
                    message: "`to` must be after `from`",
                });
            }
        }),
};

export type EventsStatsFilter = z.infer<typeof EventStatsFilterSchema.query>;
