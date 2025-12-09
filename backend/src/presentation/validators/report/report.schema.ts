import { z } from "zod";
import { ReportTarget, ReportType } from "../../../domain/entities/enums";
import { CommentIdSchema, PostIdSchema } from "../param/id.schema";


export const ReportSchema = z.object({
    targetId: z.union([PostIdSchema, CommentIdSchema]),
    targetType: z.nativeEnum(ReportTarget),
    type: z.nativeEnum(ReportType),
    reason: z
        .string()
        .trim()
        .min(10, "Reason must be at least 10 characters")
        .max(1000, "Reason cannot exceed 1000 characters"),
});

export type ReportRequest = z.infer<typeof ReportSchema>;
