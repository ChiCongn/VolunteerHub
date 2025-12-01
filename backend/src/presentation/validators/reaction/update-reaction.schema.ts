import { z } from "zod";
import { EmojiType } from "../../../domain/entities/enums";
import { PostIdSchema, ReactionIdSchema } from "../param/id.schema";

export const UpdateReactionSchema = {
    params: z.object({
        postId: PostIdSchema,
        reactionId: ReactionIdSchema,
    }),
    body: z.object({
        emoji: z.nativeEnum(EmojiType, "reaction is required"),
    }),
};

export type UpdateReactionRequest = z.infer<typeof UpdateReactionSchema>;
