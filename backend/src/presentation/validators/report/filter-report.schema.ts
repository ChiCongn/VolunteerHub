import { z } from "zod";
import { ReportTarget, ReportType, ReportStatus } from "../../../domain/entities/enums";
import { UserIdSchema, PostIdSchema, CommentIdSchema } from "../param/id.schema";

export const ReportFilterSchema = z
    .object({
        reporterId: UserIdSchema.optional(),
        targetId: z.union([PostIdSchema, CommentIdSchema]).optional(),
        targetType: z.nativeEnum(ReportTarget).optional(),
        type: z.nativeEnum(ReportType).optional(),
        status: z.nativeEnum(ReportStatus).optional(),
    })
    .strict();

export type ReportFilter = z.infer<typeof ReportFilterSchema>;
