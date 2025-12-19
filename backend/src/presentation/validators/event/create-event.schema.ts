import { z } from "zod";
import { EventCategory } from "../../../domain/entities/enums";

export const CreateEventSchema = {
    body: z
        .object({
            name: z.string().min(1, "Event name is required"),
            location: z.string().min(1, "Location is required"),
            startTime: z.coerce.date().refine((date) => date > new Date(), {
                message: "Start time must be in the future",
            }),
            endTime: z.coerce.date().nullable().optional(),
            description: z.string().min(1, "Description is required"),
            imageUrl: z.string().url("Invalid image URL"),
            capacity: z.number().int().positive("Capacity must be positive"),
            categories: z
                .array(z.nativeEnum(EventCategory))
                .min(1, "At least one category is required")
                .optional(),
        })
        .superRefine(({ startTime, endTime }, ctx) => {
            if (endTime && startTime >= endTime) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["endTime"],
                    message: "End time must be after start time",
                });
            }
        }),
};

export type CreateEventRequest = z.infer<typeof CreateEventSchema>;
