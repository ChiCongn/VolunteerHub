import { z } from "zod";

export const UpdatePostSchema = z
    .object({
        content: z
            .string()
            .min(1, "Content is required")
            .max(2000, "Content cannot exceed 2000 characters")
            .optional(),

        // allow empty string or valid URL
        imageUrl: z.union([z.literal(""), z.string().url("Invalid image URL")]).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.content === undefined && data.imageUrl === undefined) {
            ctx.addIssue({
                code: "custom",
                message: "At least one field must be provided for update",
            });
        }
    });

export type UpdatePostRequest = z.infer<typeof UpdatePostSchema>;
