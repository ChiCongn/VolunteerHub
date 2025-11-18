import { z } from "zod";
import { EmojiType } from "../../../domain/entities/enums";
import { PostIdSchema, UserIdSchema } from "../param/id.schema";

export const AddReactionSchema = {
    params: z.object({
        postId: PostIdSchema,
    }),
    body: z.object({
        emoji: z.nativeEnum(EmojiType, "reaction is required"),
    }),
};

export type AddReactionRequest = z.infer<typeof AddReactionSchema>;
