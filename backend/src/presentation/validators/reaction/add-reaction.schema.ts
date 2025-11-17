import { z } from "zod";
import { EmojiType } from "../../../domain/entities/enums";
import { PostIdSchema, UserIdSchema } from "../param/id.schema";

export const AddReactionSchema = z.object({
    postId: PostIdSchema,
    emoji: z.nativeEnum(EmojiType, "reaction is required"),
});

export type AddReactionRequest = z.infer<typeof AddReactionSchema>;
