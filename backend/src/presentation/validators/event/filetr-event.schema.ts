import { z } from "zod";
import { EventStatus, EventCategory } from "../../../domain/entities/enums";

export const EventFilterSchema = z
    .object({
        status: z.nativeEnum(EventStatus).optional(),
        name: z.string().optional(),
        location: z.string().optional(),
        categories: z.array(z.nativeEnum(EventCategory)).optional(),
        dateRange: z.tuple([z.coerce.date(), z.coerce.date()]).optional(),
        ownerId: z.string().uuid().optional(),
    })
    .superRefine(({ dateRange }, ctx) => {
        if (dateRange) {
            const [start, end] = dateRange;
            if (start > end) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["dateRange"],
                    message: "Start date must be before end date",
                });
            }
        }
    });

export type EventFilter = z.infer<typeof EventFilterSchema>;
