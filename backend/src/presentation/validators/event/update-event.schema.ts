import { z } from "zod";
import { EventCategory } from "../../../domain/entities/enums";
import { EventIdSchema } from "../param/id.schema";

export const UpdateEventSchema = {
    params: z.object({
        eventId: EventIdSchema,
    }),
    body: z
        .object({
            name: z.string().min(1).optional(),
            location: z.string().min(1).optional(),
            startTime: z.coerce.date().optional(),
            endTime: z.coerce.date().nullable().optional(),
            description: z.string().min(1).optional(),
            imageUrl: z.string().url().optional(),
            capacity: z.number().int().positive().optional(),
            categories: z.array(z.nativeEnum(EventCategory)).optional(),
        })
        .refine((data) => Object.values(data).some((v) => v !== undefined), {
            message: "Phải cung cấp ít nhất một trường để cập nhật",
        })
        .superRefine(({ startTime, endTime }, ctx) => {
            if (startTime && endTime && startTime >= endTime) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["endTime"],
                    message: "End time must be after start time",
                });
            }
        }),
};

export type UpdateEventRequest = z.infer<typeof UpdateEventSchema>;
