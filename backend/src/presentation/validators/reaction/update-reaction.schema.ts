import { z } from "zod";
import { EmojiType } from "../../../domain/entities/enums";

export const UpdateReactionSchema = z.object({
    emoji: z.nativeEnum(EmojiType, "reaction is required"),
});

export type UpdateReactionRequest = z.infer<typeof UpdateReactionSchema>;
